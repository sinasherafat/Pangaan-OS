create extension if not exists pg_trgm with schema extensions;
create schema if not exists private;

create type public.user_role as enum ('Admin','Editor','Contributor','Viewer');
create type public.decision_status as enum ('Approved','Working Proposal','Deprecated','Open Question');
create type public.task_status as enum ('Backlog','In Progress','Review','Done');
create type public.task_priority as enum ('P0','P1','P2','P3');

create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 name text not null,
 email text not null,
 role public.user_role not null default 'Viewer',
 avatar_url text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.handbook_pages (
 id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null, domain text not null,
 status public.decision_status not null default 'Working Proposal', owner_id uuid references public.profiles(id), owner_label text not null default 'Core',
 current_version_id uuid, tags text[] not null default '{}', visibility text not null default 'internal',
 created_by uuid references public.profiles(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.decisions (
 id uuid primary key default gen_random_uuid(), decision_code text unique not null check(decision_code ~ '^DEC-[0-9]{3,}$'), title text not null,
 status public.decision_status not null default 'Working Proposal', canonical_text text not null, reason text not null,
 owner_id uuid references public.profiles(id), owner_label text not null default 'Core', sources text[] not null default '{}',
 decided_at date not null default current_date, created_by uuid references public.profiles(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.page_versions (
 id uuid primary key default gen_random_uuid(), page_id uuid not null references public.handbook_pages(id) on delete restrict,
 version text not null, content jsonb not null, created_by uuid references public.profiles(id), author_label text not null default 'Core',
 created_at timestamptz not null default now(), change_summary text not null, linked_decision_id uuid references public.decisions(id), unique(page_id,version)
);
alter table public.handbook_pages add constraint handbook_current_version_fk foreign key(current_version_id) references public.page_versions(id) on delete set null;
create table public.decision_replacements (
 decision_id uuid not null references public.decisions(id) on delete restrict, replaces_decision_id uuid not null references public.decisions(id) on delete restrict,
 created_at timestamptz not null default now(), created_by uuid references public.profiles(id), primary key(decision_id,replaces_decision_id), check(decision_id<>replaces_decision_id)
);
create table public.change_entries (
 id uuid primary key default gen_random_uuid(), object_type text not null, object_id text not null, change_type text not null,
 what_changed text not null, reason text not null, before_ref text, after_ref text, linked_decision_id uuid references public.decisions(id),
 author_id uuid references public.profiles(id), author_label text not null default 'System', created_at timestamptz not null default now()
);
create table public.tasks (
 id uuid primary key default gen_random_uuid(), task_code text unique not null check(task_code ~ '^TASK-[0-9]{3,}$'), title text not null,
 owner_id uuid references public.profiles(id), owner_label text not null default 'Core', status public.task_status not null default 'Backlog',
 priority public.task_priority not null default 'P2', due_at date, outcome text, created_by uuid references public.profiles(id),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.flows (
 id uuid primary key default gen_random_uuid(), flow_code text unique not null check(flow_code ~ '^FLOW-[0-9]{3,}$'), title text not null,
 description text not null default '', mermaid_source text not null, status text not null default 'Draft' check(status in ('Draft','Published')),
 owner_id uuid references public.profiles(id), owner_label text not null default 'Core', created_by uuid references public.profiles(id),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.comments (
 id uuid primary key default gen_random_uuid(), object_type text not null check(object_type in ('handbook','decision','task','flow')),
 object_id text not null, body text not null check(char_length(body) between 1 and 4000), author_id uuid not null references public.profiles(id),
 created_at timestamptz not null default now(), resolved_at timestamptz, archived_at timestamptz
);
create table public.object_links (
 id uuid primary key default gen_random_uuid(), source_type text not null, source_id text not null, target_type text not null, target_id text not null,
 relation_type text not null check(relation_type in ('implements','replaces','documents','caused_by','related_to','discussed_in')),
 created_at timestamptz not null default now(), created_by uuid references public.profiles(id), unique(source_type,source_id,target_type,target_id,relation_type)
);
create table public.glossary_terms (
 id uuid primary key default gen_random_uuid(), term text unique not null, definition text not null,
 status public.decision_status not null default 'Approved', deprecated_aliases text[] not null default '{}', linked_decision_id uuid references public.decisions(id),
 created_by uuid references public.profiles(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.audit_events (
 id bigint generated always as identity primary key, actor_id uuid references public.profiles(id), action text not null, object_type text not null,
 object_id text not null, metadata jsonb not null default '{}', created_at timestamptz not null default now()
);
create table public.search_documents (
 id text primary key, object_type text not null, object_id text not null, title text not null, body text not null default '', status text not null default '',
 owner_label text not null default '', domain text not null default '', route text not null, historical boolean not null default false,
 updated_at timestamptz not null default now(), search_vector tsvector generated always as
 (setweight(to_tsvector('english',coalesce(title,'')),'A')||setweight(to_tsvector('english',coalesce(body,'')),'B')) stored
);
create index search_documents_fts_idx on public.search_documents using gin(search_vector);
create index search_documents_title_trgm_idx on public.search_documents using gin(title extensions.gin_trgm_ops);
create index object_links_source_idx on public.object_links(source_type,source_id);
create index object_links_target_idx on public.object_links(target_type,target_id);
create index comments_object_idx on public.comments(object_type,object_id,created_at);
create index versions_page_idx on public.page_versions(page_id,created_at desc);
create index change_entries_created_idx on public.change_entries(created_at desc);

create or replace function private.current_user_role() returns public.user_role language sql stable security definer set search_path='' as $$
 select role from public.profiles where id=(select auth.uid())
$$;
revoke all on function private.current_user_role() from public; grant execute on function private.current_user_role() to authenticated;

create or replace function private.touch_updated_at() returns trigger language plpgsql security invoker set search_path='' as $$begin new.updated_at=now();return new;end$$;
create trigger handbook_touch before update on public.handbook_pages for each row execute function private.touch_updated_at();
create trigger decisions_touch before update on public.decisions for each row execute function private.touch_updated_at();
create trigger tasks_touch before update on public.tasks for each row execute function private.touch_updated_at();
create trigger flows_touch before update on public.flows for each row execute function private.touch_updated_at();

create or replace function private.audit_sensitive_change() returns trigger language plpgsql security definer set search_path='' as $$
begin insert into public.audit_events(actor_id,action,object_type,object_id,metadata) values((select auth.uid()),tg_op,lower(tg_table_name),coalesce(new.id,old.id)::text,jsonb_build_object('before',to_jsonb(old),'after',to_jsonb(new)));return coalesce(new,old);end$$;
revoke all on function private.audit_sensitive_change() from public;
create trigger audit_decisions after insert or update or delete on public.decisions for each row execute function private.audit_sensitive_change();
create trigger audit_profiles after update or delete on public.profiles for each row execute function private.audit_sensitive_change();
create trigger audit_handbook after update or delete on public.handbook_pages for each row execute function private.audit_sensitive_change();

create or replace function private.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$
begin insert into public.profiles(id,name,email,role) values(new.id,coalesce(new.raw_user_meta_data->>'name',split_part(new.email,'@',1)),new.email,coalesce((new.raw_app_meta_data->>'role')::public.user_role,'Viewer'));return new;end$$;
revoke all on function private.handle_new_user() from public;
create trigger on_auth_user_created after insert on auth.users for each row execute function private.handle_new_user();

create or replace function public.search_workspace(search_query text,type_filter text default null,status_filter text default null,owner_filter text default null,domain_filter text default null)
returns table(object_type text,object_id text,title text,status text,owner_label text,domain text,route text,historical boolean,snippet text,rank real)
language sql stable security invoker set search_path='' as $$
 select d.object_type,d.object_id,d.title,d.status,d.owner_label,d.domain,d.route,d.historical,
 ts_headline('english',d.body,websearch_to_tsquery('english',search_query),'MaxWords=24,MinWords=8') as snippet,
 (ts_rank_cd(d.search_vector,websearch_to_tsquery('english',search_query))*10 + similarity(d.title,search_query)*4 + case when lower(d.title)=lower(search_query) then 20 else 0 end + case when d.status in ('Approved','Published') then 1 else 0 end - case when d.historical then .5 else 0 end)::real
 from public.search_documents d where (search_query='' or d.search_vector@@websearch_to_tsquery('english',search_query) or d.title % search_query)
 and (type_filter is null or d.object_type=type_filter) and (status_filter is null or d.status=status_filter)
 and (owner_filter is null or d.owner_label=owner_filter) and (domain_filter is null or d.domain=domain_filter)
 order by rank desc,d.updated_at desc;
$$;

alter table public.profiles enable row level security;alter table public.handbook_pages enable row level security;alter table public.page_versions enable row level security;
alter table public.decisions enable row level security;alter table public.decision_replacements enable row level security;alter table public.change_entries enable row level security;
alter table public.tasks enable row level security;alter table public.flows enable row level security;alter table public.comments enable row level security;
alter table public.object_links enable row level security;alter table public.glossary_terms enable row level security;alter table public.audit_events enable row level security;alter table public.search_documents enable row level security;

revoke all on all tables in schema public from anon,authenticated;
grant select on public.profiles,public.handbook_pages,public.page_versions,public.decisions,public.decision_replacements,public.change_entries,public.tasks,public.flows,public.comments,public.object_links,public.glossary_terms,public.search_documents to authenticated;
grant insert,update on public.handbook_pages,public.decisions,public.tasks,public.flows,public.comments,public.glossary_terms to authenticated;
grant insert on public.page_versions,public.decision_replacements,public.change_entries,public.object_links to authenticated;
grant update on public.profiles to authenticated;grant select on public.audit_events to authenticated;grant usage,select on sequence public.audit_events_id_seq to authenticated;
grant execute on function public.search_workspace(text,text,text,text,text) to authenticated;

create policy read_profiles on public.profiles for select to authenticated using(true);
create policy read_handbook on public.handbook_pages for select to authenticated using(true);create policy edit_handbook on public.handbook_pages for all to authenticated using(private.current_user_role() in ('Admin','Editor')) with check(private.current_user_role() in ('Admin','Editor'));
create policy read_versions on public.page_versions for select to authenticated using(true);create policy append_versions on public.page_versions for insert to authenticated with check(private.current_user_role() in ('Admin','Editor'));
create policy read_decisions on public.decisions for select to authenticated using(true);create policy edit_decisions on public.decisions for all to authenticated using(private.current_user_role() in ('Admin','Editor')) with check(private.current_user_role() in ('Admin','Editor'));
create policy propose_decisions on public.decisions for insert to authenticated with check(private.current_user_role()='Contributor' and status in ('Working Proposal','Open Question'));
create policy update_proposed_decisions on public.decisions for update to authenticated using(private.current_user_role()='Contributor' and status in ('Working Proposal','Open Question')) with check(private.current_user_role()='Contributor' and status in ('Working Proposal','Open Question'));
create policy read_replacements on public.decision_replacements for select to authenticated using(true);create policy append_replacements on public.decision_replacements for insert to authenticated with check(private.current_user_role() in ('Admin','Editor'));
create policy read_changes on public.change_entries for select to authenticated using(true);create policy append_changes on public.change_entries for insert to authenticated with check(private.current_user_role() in ('Admin','Editor'));
create policy read_tasks on public.tasks for select to authenticated using(true);create policy edit_tasks on public.tasks for all to authenticated using(private.current_user_role() in ('Admin','Editor','Contributor')) with check(private.current_user_role() in ('Admin','Editor','Contributor'));
create policy read_flows on public.flows for select to authenticated using(true);create policy edit_flows on public.flows for all to authenticated using(private.current_user_role() in ('Admin','Editor')) with check(private.current_user_role() in ('Admin','Editor'));
create policy read_comments on public.comments for select to authenticated using(true);create policy create_comments on public.comments for insert to authenticated with check(private.current_user_role() in ('Admin','Editor','Contributor') and author_id=(select auth.uid()));create policy update_own_comments on public.comments for update to authenticated using(author_id=(select auth.uid()) or private.current_user_role() in ('Admin','Editor')) with check(author_id=(select auth.uid()) or private.current_user_role() in ('Admin','Editor'));
create policy read_links on public.object_links for select to authenticated using(true);create policy append_links on public.object_links for insert to authenticated with check(private.current_user_role() in ('Admin','Editor','Contributor'));
create policy read_glossary on public.glossary_terms for select to authenticated using(true);create policy edit_glossary on public.glossary_terms for all to authenticated using(private.current_user_role() in ('Admin','Editor')) with check(private.current_user_role() in ('Admin','Editor'));
create policy admin_profile_update on public.profiles for update to authenticated using(private.current_user_role()='Admin') with check(private.current_user_role()='Admin');
create policy admin_audit_read on public.audit_events for select to authenticated using(private.current_user_role()='Admin');
create policy read_search on public.search_documents for select to authenticated using(true);
