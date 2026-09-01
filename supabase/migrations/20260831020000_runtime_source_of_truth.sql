-- Keep every runtime projection derived from canonical Postgres records.

create or replace function private.sync_handbook_search() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if tg_op='DELETE' then delete from public.search_documents where id='handbook:'||old.id; return old; end if;
  insert into public.search_documents(id,object_type,object_id,title,body,status,owner_label,domain,route,historical,updated_at)
  values('handbook:'||new.id,'handbook',new.slug,new.title,coalesce((select content::text from public.page_versions where id=new.current_version_id),''),new.status::text,new.owner_label,new.domain,'/handbook/'||new.slug,false,new.updated_at)
  on conflict(id) do update set object_id=excluded.object_id,title=excluded.title,body=excluded.body,status=excluded.status,owner_label=excluded.owner_label,domain=excluded.domain,route=excluded.route,updated_at=excluded.updated_at;
  return new;
end$$;

create or replace function private.sync_decision_search() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if tg_op='DELETE' then delete from public.search_documents where id='decision:'||old.id; return old; end if;
  insert into public.search_documents(id,object_type,object_id,title,body,status,owner_label,domain,route,historical,updated_at)
  values('decision:'||new.id,'decision',new.decision_code,new.title,new.canonical_text||' '||new.reason||' '||array_to_string(new.sources,' '),new.status::text,new.owner_label,'Governance','/decisions/'||new.decision_code,false,new.updated_at)
  on conflict(id) do update set object_id=excluded.object_id,title=excluded.title,body=excluded.body,status=excluded.status,owner_label=excluded.owner_label,route=excluded.route,updated_at=excluded.updated_at;
  return new;
end$$;

create or replace function private.sync_task_search() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if tg_op='DELETE' then delete from public.search_documents where id='task:'||old.id; return old; end if;
  insert into public.search_documents(id,object_type,object_id,title,body,status,owner_label,domain,route,historical,updated_at)
  values('task:'||new.id,'task',new.task_code,new.title,coalesce(new.outcome,'')||' '||new.task_code,new.status::text,new.owner_label,'Execution','/tasks/'||new.task_code,false,new.updated_at)
  on conflict(id) do update set object_id=excluded.object_id,title=excluded.title,body=excluded.body,status=excluded.status,owner_label=excluded.owner_label,route=excluded.route,updated_at=excluded.updated_at;
  return new;
end$$;

create or replace function private.sync_flow_search() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if tg_op='DELETE' then delete from public.search_documents where id='flow:'||old.id; return old; end if;
  insert into public.search_documents(id,object_type,object_id,title,body,status,owner_label,domain,route,historical,updated_at)
  values('flow:'||new.id,'flow',new.flow_code,new.title,new.description||' '||new.mermaid_source,new.status,new.owner_label,'Flows','/flows/'||new.flow_code,false,new.updated_at)
  on conflict(id) do update set object_id=excluded.object_id,title=excluded.title,body=excluded.body,status=excluded.status,owner_label=excluded.owner_label,route=excluded.route,updated_at=excluded.updated_at;
  return new;
end$$;

create or replace function private.sync_version_search() returns trigger
language plpgsql security definer set search_path='' as $$
declare page_record public.handbook_pages;
begin
  if tg_op='DELETE' then delete from public.search_documents where id='version:'||old.id; return old; end if;
  select * into page_record from public.handbook_pages where id=new.page_id;
  insert into public.search_documents(id,object_type,object_id,title,body,status,owner_label,domain,route,historical,updated_at)
  values('version:'||new.id,'version',new.id::text,page_record.title||' '||new.version,new.change_summary||' '||new.content::text,'Historical',new.author_label,page_record.domain,'/versions',true,new.created_at)
  on conflict(id) do update set title=excluded.title,body=excluded.body,owner_label=excluded.owner_label,domain=excluded.domain,updated_at=excluded.updated_at;
  return new;
end$$;

create or replace function private.sync_change_search() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  insert into public.search_documents(id,object_type,object_id,title,body,status,owner_label,domain,route,historical,updated_at)
  values('change:'||new.id,'change',new.id::text,new.what_changed,new.object_id||' '||new.reason||' '||coalesce(new.before_ref,'')||' '||coalesce(new.after_ref,''),new.change_type,new.author_label,'Change Log','/changes',false,new.created_at)
  on conflict(id) do update set title=excluded.title,body=excluded.body,status=excluded.status,owner_label=excluded.owner_label,updated_at=excluded.updated_at;
  return new;
end$$;

create or replace function private.sync_comment_search() returns trigger
language plpgsql security definer set search_path='' as $$
declare author_name text;
begin
  if tg_op='DELETE' then delete from public.search_documents where id='comment:'||old.id; return old; end if;
  select name into author_name from public.profiles where id=new.author_id;
  insert into public.search_documents(id,object_type,object_id,title,body,status,owner_label,domain,route,historical,updated_at)
  values('comment:'||new.id,'comment',new.id::text,'Comment on '||new.object_id,new.body,case when new.resolved_at is null then 'Open' else 'Resolved' end,coalesce(author_name,'Team member'),'Discussion',case new.object_type when 'handbook' then '/handbook/'||new.object_id when 'decision' then '/decisions/'||new.object_id when 'task' then '/tasks/'||new.object_id when 'flow' then '/flows/'||new.object_id else '/' end,false,new.created_at)
  on conflict(id) do update set title=excluded.title,body=excluded.body,status=excluded.status,owner_label=excluded.owner_label,route=excluded.route,updated_at=excluded.updated_at;
  return new;
end$$;

create or replace function private.sync_glossary_search() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if tg_op='DELETE' then delete from public.search_documents where id='glossary:'||old.id; return old; end if;
  insert into public.search_documents(id,object_type,object_id,title,body,status,owner_label,domain,route,historical,updated_at)
  values('glossary:'||new.id,'glossary',new.id::text,new.term,new.definition||' '||array_to_string(new.deprecated_aliases,' '),new.status::text,'Core','Glossary','/handbook/glossary',false,new.updated_at)
  on conflict(id) do update set title=excluded.title,body=excluded.body,status=excluded.status,updated_at=excluded.updated_at;
  return new;
end$$;

drop trigger if exists handbook_search_sync on public.handbook_pages;
drop trigger if exists decision_search_sync on public.decisions;
drop trigger if exists task_search_sync on public.tasks;
drop trigger if exists flow_search_sync on public.flows;
drop trigger if exists version_search_sync on public.page_versions;
drop trigger if exists change_search_sync on public.change_entries;
drop trigger if exists comment_search_sync on public.comments;
drop trigger if exists glossary_search_sync on public.glossary_terms;
create trigger handbook_search_sync after insert or update or delete on public.handbook_pages for each row execute function private.sync_handbook_search();
create trigger decision_search_sync after insert or update or delete on public.decisions for each row execute function private.sync_decision_search();
create trigger task_search_sync after insert or update or delete on public.tasks for each row execute function private.sync_task_search();
create trigger flow_search_sync after insert or update or delete on public.flows for each row execute function private.sync_flow_search();
create trigger version_search_sync after insert or update or delete on public.page_versions for each row execute function private.sync_version_search();
create trigger change_search_sync after insert on public.change_entries for each row execute function private.sync_change_search();
create trigger comment_search_sync after insert or update or delete on public.comments for each row execute function private.sync_comment_search();
create trigger glossary_search_sync after insert or update or delete on public.glossary_terms for each row execute function private.sync_glossary_search();

create or replace function public.save_handbook_revision(page_slug text,revision_content jsonb,revision_summary text,decision_code text default null)
returns uuid language plpgsql security invoker set search_path='' as $$
declare page_record public.handbook_pages; decision_id uuid; revision_id uuid; next_version text;
begin
  select * into page_record from public.handbook_pages where slug=page_slug for update;
  if page_record.id is null then raise exception 'Handbook page not found'; end if;
  if decision_code is not null and decision_code<>'' then select id into decision_id from public.decisions where public.decisions.decision_code=save_handbook_revision.decision_code; end if;
  select 'v1.'||(coalesce(max(nullif(regexp_replace(version,'^v[0-9]+\.','',''),'')::int),0)+1)::text into next_version from public.page_versions where page_id=page_record.id;
  insert into public.page_versions(page_id,version,content,created_by,author_label,change_summary,linked_decision_id)
  values(page_record.id,next_version,revision_content,(select auth.uid()),coalesce((select name from public.profiles where id=(select auth.uid())),'Team member'),revision_summary,decision_id) returning id into revision_id;
  update public.handbook_pages set current_version_id=revision_id where id=page_record.id;
  insert into public.change_entries(object_type,object_id,change_type,what_changed,reason,before_ref,after_ref,linked_decision_id,author_id,author_label)
  values('document',page_slug,'document',page_record.title||' updated',revision_summary,coalesce((select version from public.page_versions where id=page_record.current_version_id),'—'),next_version,decision_id,(select auth.uid()),coalesce((select name from public.profiles where id=(select auth.uid())),'Team member'));
  return revision_id;
end$$;
revoke all on function public.save_handbook_revision(text,jsonb,text,text) from public;
grant execute on function public.save_handbook_revision(text,jsonb,text,text) to authenticated;

-- Backfill current seed records into every searchable family.
insert into public.search_documents(id,object_type,object_id,title,body,status,owner_label,domain,route,historical,updated_at)
select 'change:'||id,'change',id::text,what_changed,object_id||' '||reason||' '||coalesce(before_ref,'')||' '||coalesce(after_ref,''),change_type,author_label,'Change Log','/changes',false,created_at from public.change_entries on conflict(id) do update set title=excluded.title,body=excluded.body,status=excluded.status,owner_label=excluded.owner_label,updated_at=excluded.updated_at;
insert into public.search_documents(id,object_type,object_id,title,body,status,owner_label,domain,route,historical,updated_at)
select 'comment:'||c.id,'comment',c.id::text,'Comment on '||c.object_id,c.body,case when c.resolved_at is null then 'Open' else 'Resolved' end,coalesce(p.name,'Team member'),'Discussion',case c.object_type when 'handbook' then '/handbook/'||c.object_id when 'decision' then '/decisions/'||c.object_id when 'task' then '/tasks/'||c.object_id when 'flow' then '/flows/'||c.object_id else '/' end,false,c.created_at from public.comments c left join public.profiles p on p.id=c.author_id on conflict(id) do update set title=excluded.title,body=excluded.body,status=excluded.status,owner_label=excluded.owner_label,route=excluded.route,updated_at=excluded.updated_at;
insert into public.search_documents(id,object_type,object_id,title,body,status,owner_label,domain,route,historical,updated_at)
select 'glossary:'||id,'glossary',id::text,term,definition||' '||array_to_string(deprecated_aliases,' '),status::text,'Core','Glossary','/handbook/glossary',false,updated_at from public.glossary_terms on conflict(id) do update set title=excluded.title,body=excluded.body,status=excluded.status,updated_at=excluded.updated_at;

-- The complete approved copy now lives in immutable database revisions, not a runtime bundle.
with page as (select id from public.handbook_pages where slug='master-core'), decision as (select id from public.decisions where decision_code='DEC-128'), revision as (
  insert into public.page_versions(page_id,version,content,author_label,change_summary,linked_decision_id)
  select page.id,'v1.4','{"Mission":"Make trustworthy context usable at the moment a person or system must decide and act.","North Star":"Every feature must either feed the Graph with higher-quality data, or use the Graph for Context, Decision, Action, and Economic Value. If it does neither, it is probably not a core Pangaan feature.","Core Principles":"Ground truth over opinions. Long-term network value over short-term vanity metrics. Explainability, provenance, and user control. Seller-first wedge; network-scale architecture. Tokens only after proven utility and economic activity.","Scope / Non-goals":"Pangaan connects trustworthy product identity, context, decisions, and outcomes. It is not a generic marketplace, social network, or speculative token product.","Canonical Architecture":"Product Passport ↔ 3 Graphs ↔ Context Engine form the core model. Decisions and evidence remain traceable through every action."}'::jsonb,'Core','Materialized the complete canonical page in Postgres',decision.id from page,decision on conflict(page_id,version) do update set content=excluded.content returning id,page_id
) update public.handbook_pages set current_version_id=revision.id from revision where handbook_pages.id=revision.page_id;

with page as (select id from public.handbook_pages where slug='product-passport'), decision as (select id from public.decisions where decision_code='DEC-126'), revision as (
  insert into public.page_versions(page_id,version,content,author_label,change_summary,linked_decision_id)
  select page.id,'v1.4','{"Concept":"A Product Passport is the durable identity for a product, its claims, provenance, contribution, and economic outcomes.","Entity model":"Passport identity, actors, claims, evidence, permissions, lifecycle events, graph writes, and outcomes are explicit objects.","Lifecycle":"Create → enrich → verify → publish → transact → support → return or retire. Every transition records provenance.","Buyer / Seller / Creator / Expert views":"Each actor sees the same canonical object through role-appropriate context and permissions.","Checkout / Orders / Returns":"Commercial outcomes write back verified lifecycle events without overwriting historical identity."}'::jsonb,'Product','Materialized the complete canonical page in Postgres',decision.id from page,decision on conflict(page_id,version) do update set content=excluded.content returning id,page_id
) update public.handbook_pages set current_version_id=revision.id from revision where handbook_pages.id=revision.page_id;

with page as (select id from public.handbook_pages where slug='three-graphs'), decision as (select id from public.decisions where decision_code='DEC-127'), revision as (
  insert into public.page_versions(page_id,version,content,author_label,change_summary,linked_decision_id)
  select page.id,'v1.3','{"Trust Graph":"Represents claims, evidence, actors, confidence, provenance, and dispute state.","Contribution Graph":"Records who contributed knowledge, verification, distribution, or value to an outcome.","Economic Graph":"Connects transactions, attribution, incentives, and realized outcomes.","Provenance / confidence":"Every edge carries source, recency, confidence, and permission context.","Graph write rules":"Writes are event-derived, attributable, reversible by correction, and never silently destructive."}'::jsonb,'Data','Materialized the complete canonical page in Postgres',decision.id from page,decision on conflict(page_id,version) do update set content=excluded.content returning id,page_id
) update public.handbook_pages set current_version_id=revision.id from revision where handbook_pages.id=revision.page_id;

with page as (select id from public.handbook_pages where slug='context-engine'), decision as (select id from public.decisions where decision_code='DEC-125'), revision as (
  insert into public.page_versions(page_id,version,content,author_label,change_summary,linked_decision_id)
  select page.id,'v1.0','{"Context Engine":"Builds a permission-filtered view of relevant evidence, history, and current signals.","Context Inspector":"Explains the status, provenance, related objects, and recent changes around the current object.","Current / historical / trusted context":"Current context is time-sensitive; historical context explains drift; trusted context meets evidence and freshness rules.","Evidence / freshness":"Sources expose confidence, last verification, and staleness rather than hiding uncertainty.","Proactive behavior":"Future agents may suggest actions, but human authority and auditable decisions remain explicit."}'::jsonb,'Core','Canonical database baseline',decision.id from page,decision on conflict(page_id,version) do update set content=excluded.content returning id,page_id
) update public.handbook_pages set current_version_id=revision.id from revision where handbook_pages.id=revision.page_id;

with page as (select id from public.handbook_pages where slug='architecture'), decision as (select id from public.decisions where decision_code='DEC-128'), revision as (
  insert into public.page_versions(page_id,version,content,author_label,change_summary,linked_decision_id)
  select page.id,'v1.2','{"System map":"Interfaces → application services → canonical objects → Postgres → event and graph projections.","Data model":"Stable objects, immutable revisions, universal links, and append-only audit events.","Event schema":"Events identify actor, object, action, prior state, new state, rationale, and timestamp.","API / connectors":"Internal typed boundaries first. External connectors are narrow, permissioned, and observable.","Permissions / security":"Supabase Auth, RLS, server-only secrets, role-aware mutations, sanitized content, and audit logs."}'::jsonb,'Engineering','Materialized the complete canonical page in Postgres',decision.id from page,decision on conflict(page_id,version) do update set content=excluded.content returning id,page_id
) update public.handbook_pages set current_version_id=revision.id from revision where handbook_pages.id=revision.page_id;

with page as (select id from public.handbook_pages where slug='glossary'), revision as (
  insert into public.page_versions(page_id,version,content,author_label,change_summary)
  select page.id,'v1.0',(select jsonb_object_agg(term,definition order by term) from public.glossary_terms),'Core','Canonical glossary database baseline' from page on conflict(page_id,version) do update set content=excluded.content returning id,page_id
) update public.handbook_pages set current_version_id=revision.id from revision where handbook_pages.id=revision.page_id;

-- Refresh current Handbook projections after current_version_id backfill.
update public.handbook_pages set updated_at=updated_at;
