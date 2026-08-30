begin;
select plan(8);
select has_table('public','handbook_pages','handbook pages exists');
select has_table('public','page_versions','page versions exists');
select has_table('public','audit_events','audit events exists');
select policies_are('public','handbook_pages',array['edit_handbook','read_handbook'],'handbook RLS policies installed');
select policies_are('public','page_versions',array['append_versions','read_versions'],'version history is read + append only');
select policies_are('public','decisions',array['edit_decisions','propose_decisions','read_decisions','update_proposed_decisions'],'decision approval boundary installed');
select policies_are('public','comments',array['create_comments','read_comments','update_own_comments'],'contextual comment policies installed');
select function_returns('public','search_workspace',array['text','text','text','text','text'],'record','search RPC exists');
select * from finish();
rollback;

