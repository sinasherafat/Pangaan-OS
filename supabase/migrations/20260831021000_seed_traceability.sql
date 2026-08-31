-- Complete the relational graph for the existing database seed workspace.
insert into public.object_links(source_type,source_id,target_type,target_id,relation_type)
values
('task','TASK-101','decision','DEC-128','caused_by'),('task','TASK-101','handbook','architecture','implements'),
('task','TASK-105','decision','DEC-128','caused_by'),('task','TASK-105','handbook','architecture','implements'),
('task','TASK-108','decision','DEC-128','caused_by'),('task','TASK-108','handbook','architecture','implements'),
('task','TASK-103','decision','DEC-125','caused_by'),('task','TASK-103','handbook','context-engine','implements'),
('task','TASK-104','decision','DEC-128','caused_by'),('task','TASK-104','handbook','master-core','implements'),
('task','TASK-106','decision','DEC-128','caused_by'),('task','TASK-106','handbook','architecture','implements'),
('task','TASK-107','decision','DEC-128','caused_by'),('task','TASK-107','handbook','master-core','implements'),
('task','TASK-109','decision','DEC-128','caused_by'),('task','TASK-109','handbook','architecture','implements'),
('task','TASK-110','decision','DEC-128','caused_by'),('task','TASK-110','handbook','master-core','implements'),
('task','TASK-111','decision','DEC-128','caused_by'),('task','TASK-111','handbook','master-core','implements'),
('flow','FLOW-001','handbook','master-core','documents'),('flow','FLOW-002','decision','DEC-126','implements'),
('flow','FLOW-003','decision','DEC-127','implements'),('flow','FLOW-003','handbook','architecture','documents'),
('flow','FLOW-004','decision','DEC-125','implements'),('flow','FLOW-004','handbook','context-engine','documents'),
('flow','FLOW-005','decision','DEC-126','implements'),('flow','FLOW-005','handbook','product-passport','documents'),
('flow','FLOW-006','decision','DEC-127','implements'),('flow','FLOW-006','handbook','three-graphs','documents'),
('flow','FLOW-007','handbook','architecture','documents')
on conflict(source_type,source_id,target_type,target_id,relation_type) do nothing;
