-- Supabase may preinstall this SECURITY DEFINER event-trigger helper.
-- Keep automatic RLS behavior, but remove unnecessary public RPC execution privileges.
do $migration$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke all privileges on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end;
$migration$;
