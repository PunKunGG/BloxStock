-- Read-only Phase 2A audit. Run as an administrative role after migrations.
select c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'
order by c.relname;

select conrelid::regclass as table_name, conname, contype,
       pg_get_constraintdef(oid) as definition
from pg_constraint
where connamespace = 'public'::regnamespace
order by conrelid::regclass::text, conname;

select tablename, indexname, indexdef
from pg_indexes where schemaname = 'public'
order by tablename, indexname;

-- Expected: anon/authenticated always false; service_role SELECT only.
select role_name, table_name, privilege,
       has_table_privilege(role_name, 'public.' || table_name, privilege) as allowed
from (values ('anon'), ('authenticated'), ('service_role')) roles(role_name)
cross join (values ('fruits'), ('stock_rotations'), ('stock_items'), ('sync_runs')) tables(table_name)
cross join (values ('SELECT'), ('INSERT'), ('UPDATE'), ('DELETE'), ('TRUNCATE'), ('REFERENCES'), ('TRIGGER')) privileges(privilege)
order by role_name, table_name, privilege;

-- Expected: zero policies. Browser access is not needed in Phase 2A.
select tablename, policyname, roles, cmd, qual, with_check
from pg_policies where schemaname = 'public';

select p.proname, p.prosecdef as security_definer,
       has_function_privilege('anon', p.oid, 'EXECUTE') as anon_execute,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_execute
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
order by p.proname;

-- Expected after Phase 2A: zero. Never inserts fixture data.
select 'fruits' as table_name, count(*) as row_count from public.fruits
union all select 'stock_rotations', count(*) from public.stock_rotations
union all select 'stock_items', count(*) from public.stock_items
union all select 'sync_runs', count(*) from public.sync_runs;
