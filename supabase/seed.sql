-- Realistic Pangaan workspace seed data. Run after the foundation migration.
insert into public.decisions(decision_code,title,status,canonical_text,reason,owner_label,sources,decided_at) values
('DEC-128','Pangaan Core Architecture v1.1','Approved','Product Passport, 3 Graphs, and Context Engine form the canonical core model.','Freeze the smallest durable model that preserves identity, evidence, decision context, and outcomes.','Sina',array['Master Core','Architecture'],'2026-08-30'),
('DEC-127','Three Graphs Model','Approved','Trust, Contribution, and Economic state remain distinct but linkable graphs.','Separate evidence, attribution, and value without losing cross-graph traceability.','Data',array['3 Graphs'],'2026-08-29'),
('DEC-126','Product Passport v1.3','Approved','The Passport is a lifecycle object with explicit claim, evidence, ownership, and outcome history.','Inventory write-back and returns need durable identity rather than order-local records.','Product',array['Product Passport'],'2026-08-29'),
('DEC-125','Context Engine terminology','Working Proposal','Use Context Engine for computation and Context Inspector for the user-facing view.','Separate system responsibility from interface pattern.','Core',array['Context'],'2026-08-28'),
('DEC-122','DENE governance token scope','Open Question','Define whether governance requires a token or role-based institutional authority.','Current evidence does not justify irreversible token governance.','Founder',array['Governance workshop'],'2026-08-25'),
('DEC-121','Marketplace-first GTM','Deprecated','Lead with a broad consumer marketplace.','Replaced by a seller-first Product Passport wedge.','Strategy',array['GTM memo'],'2026-08-24')
on conflict(decision_code) do nothing;

insert into public.handbook_pages(slug,title,domain,status,owner_label,tags) values
('master-core','01. Master Core','Master Core','Approved','Founder / Core',array['mission','north star','principles']),
('product-passport','02. Product Passport','Product Passport','Approved','Product',array['entity','lifecycle','checkout','returns']),
('three-graphs','03. 3 Graphs','3 Graphs','Approved','Data',array['trust','contribution','economic','provenance']),
('context-engine','04. Context','Context','Working Proposal','Core',array['context','evidence','freshness']),
('architecture','05. Architecture','Architecture','Approved','Engineering',array['system','data','api','permissions']),
('glossary','06. Glossary','Glossary','Approved','Core',array['terms','definitions'])
on conflict(slug) do nothing;

with pages as (select id,slug from public.handbook_pages), dec as (select id,decision_code from public.decisions)
insert into public.page_versions(page_id,version,content,author_label,change_summary,linked_decision_id)
select p.id,v.version,v.content::jsonb,v.author,v.summary,d.id from (values
('master-core','v1.3','{"Mission":"Make trustworthy context usable at the moment a person or system must decide and act.","North Star":"Every feature must either feed the Graph with higher-quality data, or use the Graph for Context, Decision, Action, and Economic Value."}','Sina','Current context language refined','DEC-128'),
('master-core','v1.2','{"North Star":"Every feature must feed the Graph or use it for context."}','Ali','Context language refined','DEC-125'),
('product-passport','v1.3','{"Lifecycle":"Create, enrich, verify, publish, transact, support, return or retire.","Identity":"Durable product identity with explicit provenance."}','Product','Added returns and inventory write-back','DEC-126'),
('three-graphs','v1.2','{"Rule":"Every graph edge exposes source, confidence, recency, and permission."}','Data','Added confidence and provenance rules','DEC-127'),
('architecture','v1.1','{"Security":"Supabase Auth and RLS protect every exposed table; sensitive mutations append audit events."}','Engineering','Added RLS and audit boundary','DEC-128')
) as v(slug,version,content,author,summary,decision_code) join pages p using(slug) left join dec d using(decision_code)
on conflict(page_id,version) do nothing;

update public.handbook_pages p set current_version_id=v.id from lateral(select id from public.page_versions where page_id=p.id order by created_at desc,version desc limit 1)v where p.current_version_id is null;

insert into public.tasks(task_code,title,owner_label,status,priority,outcome) values
('TASK-101','Define Event Schema v1','Data','Backlog','P1',null),('TASK-105','Connector framework','Engineering','Backlog','P1',null),('TASK-108','Search indexing','Engineering','Backlog','P2',null),
('TASK-102','Product Passport v1.3','Product','In Progress','P0','Ship Passport lifecycle and inventory write-back states.'),('TASK-103','Context Engine prototype','AI','In Progress','P0',null),('TASK-104','Decision Register module','Core','In Progress','P1',null),
('TASK-106','Flow documentation MVP','Product','Review','P1','Mermaid source, preview, links, and versions complete.'),('TASK-107','Version history UI','Design','Review','P2',null),
('TASK-109','Auth & roles','Engineering','Done','P0','RLS-backed role model implemented.'),('TASK-110','Handbook baseline','Core','Done','P0','Six canonical domains published.'),('TASK-111','Change Log module','Core','Done','P1','Material changes trace to rationale and decision.')
on conflict(task_code) do nothing;

insert into public.flows(flow_code,title,description,mermaid_source,status,owner_label) values
('FLOW-001','Decision Loop','From signal and evidence through human authority to auditable outcome.',E'flowchart TD\n A[Event / Signal] --> B[Context Engine]\n B --> C[Evidence / Confidence]\n C --> D{Decision Gate}\n D -->|Monitor| E[Observe Only]\n D -->|Approve| F[Human / Agent Action]\n F --> G[Outcome]\n G --> H[Graph Update]\n H -.-> D','Published','Core'),
('FLOW-002','Product Passport Lifecycle','Canonical Passport states from creation through retirement.',E'flowchart LR\n A[Create] --> B[Enrich] --> C[Verify] --> D[Publish]\n D --> E[Transact] --> F[Support]\n F --> G{Outcome}\n G --> H[Return]\n G --> I[Retire]','Published','Product'),
('FLOW-003','Data Ingestion','Permissioned ingestion with validation and provenance.',E'flowchart LR\n A[Source] --> B[Validate] --> C[Normalize]\n C --> D[Attach Provenance] --> E[Policy Check] --> F[Canonical Store]','Published','Data'),
('FLOW-004','Agent Action','Future-safe action boundary with explicit human authority.',E'flowchart TD\n A[Context] --> B[Recommendation]\n B --> C{Authority}\n C -->|Reject| D[Record rationale]\n C -->|Approve| E[Execute]\n E --> F[Audit event]','Draft','Core'),
('FLOW-005','Checkout / Outcome','Commercial outcome writes back to the Product Passport.',E'flowchart LR\n A[Checkout] --> B[Order] --> C[Fulfillment] --> D[Outcome]\n D --> E[Passport event]\n D --> F[Economic Graph]','Draft','Product'),
('FLOW-006','Graph Write','Attributable policy-checked writes to the three graphs.',E'flowchart LR\n A[Event] --> B[Permission] --> C[Evidence]\n C --> D{Graph}\n D --> E[Trust]\n D --> F[Contribution]\n D --> G[Economic]','Published','Data'),
('FLOW-007','Consent / Revocation','User authority over context use and downstream writes.',E'flowchart LR\n A[Consent] --> B[Scoped use] --> C[Audit]\n D[Revocation] --> E[Stop future use] --> F[Record effect]','Draft','Legal')
on conflict(flow_code) do nothing;

insert into public.glossary_terms(term,definition,status,deprecated_aliases) values
('Product Passport','The durable identity and living record of a product across its lifecycle.','Approved',array['digital product record']),
('Context','Permission-filtered evidence and history relevant to a present decision or action.','Approved',array[]::text[]),
('Decision Episode','The auditable sequence from signal and evidence through human authority to outcome.','Approved',array[]::text[]),
('Graph Write','An attributable, policy-checked update to Trust, Contribution, or Economic Graph state.','Approved',array[]::text[])
on conflict(term) do nothing;

insert into public.change_entries(object_type,object_id,change_type,what_changed,reason,before_ref,after_ref,linked_decision_id,author_label)
select x.object_type,x.object_id,x.change_type,x.what_changed,x.reason,x.before_ref,x.after_ref,d.id,x.author_label from (values
('decision','DEC-128','decision','Pangaan Core Architecture approved','Freeze the canonical core model','Working Proposal','Approved','DEC-128','Sina'),
('document','product-passport','document','Lifecycle updated to v1.3','Add inventory write-back and returns','v1.2','v1.3','DEC-126','Product'),
('flow','FLOW-001','flow','Approval branch documented','Human authority must remain explicit','v1','v2','DEC-128','Core'),
('document','context-engine','document','Promoted to working proposal','Terminology needs team review','Draft','Working Proposal','DEC-125','Core'),
('decision','DEC-121','decision','Marketplace-first direction deprecated','Seller-first Passport wedge has stronger evidence','Approved','Deprecated','DEC-121','Strategy')
)x(object_type,object_id,change_type,what_changed,reason,before_ref,after_ref,decision_code,author_label) join public.decisions d using(decision_code);

insert into public.search_documents(id,object_type,object_id,title,body,status,owner_label,domain,route,historical)
select 'handbook:'||id,'handbook',id::text,title,coalesce((select content::text from public.page_versions where id=current_version_id),''),status::text,owner_label,domain,'/handbook/'||slug,false from public.handbook_pages
on conflict(id) do update set title=excluded.title,body=excluded.body,status=excluded.status,updated_at=now();
insert into public.search_documents(id,object_type,object_id,title,body,status,owner_label,domain,route,historical)
select 'decision:'||id,'decision',decision_code,title,canonical_text||' '||reason,status::text,owner_label,'Governance','/decisions/'||decision_code,false from public.decisions on conflict(id) do nothing;
insert into public.search_documents(id,object_type,object_id,title,body,status,owner_label,domain,route,historical)
select 'task:'||id,'task',task_code,title,coalesce(outcome,'')||' '||task_code,status::text,owner_label,'Execution','/tasks/'||task_code,false from public.tasks on conflict(id) do nothing;
insert into public.search_documents(id,object_type,object_id,title,body,status,owner_label,domain,route,historical)
select 'flow:'||id,'flow',flow_code,title,description||' '||mermaid_source,status,owner_label,'Flows','/flows/'||flow_code,false from public.flows on conflict(id) do nothing;
insert into public.search_documents(id,object_type,object_id,title,body,status,owner_label,domain,route,historical)
select 'version:'||id,'version',id::text,p.title||' '||v.version,v.change_summary||' '||v.content::text,'Historical',v.author_label,p.domain,'/versions',true from public.page_versions v join public.handbook_pages p on p.id=v.page_id on conflict(id) do nothing;

