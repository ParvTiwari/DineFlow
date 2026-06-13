-- Supabase keepalive maintenance job
-- Writes one heartbeat row every few days and prunes old rows so the
-- table never grows unbounded. Run this once in the Supabase SQL Editor.
--
-- NOTE: pg_cron runs inside Postgres. Internal DB activity does not always
-- reset Supabase's free-tier inactivity timer (which is based on external
-- API/connection activity). Pair this with an external pinger (e.g. a
-- GitHub Action) for a reliable keepalive. See README / project notes.

-- 1. Enable pg_cron (Supabase ships it; this is a no-op if already enabled)
create extension if not exists pg_cron;

-- 2. Heartbeat table
create table if not exists public.db_keepalive (
  id         bigserial   primary key,
  note       text        not null default 'supabase_keepalive_ping',
  created_at timestamptz not null default now()
);

-- 3. Function the cron job runs: insert one row, prune rows older than 7 days
create or replace function public.run_keepalive_cycle()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.db_keepalive (note)
  values ('scheduled heartbeat');

  delete from public.db_keepalive
  where created_at < now() - interval '7 days';
end;
$$;

-- 4. Remove any existing schedule with the same name before recreating it
--    (avoids duplicate jobs if this script is re-run)
do $$
declare
  existing_jobid bigint;
begin
  select jobid into existing_jobid
  from cron.job
  where jobname = 'db-keepalive';

  if existing_jobid is not null then
    perform cron.unschedule(existing_jobid);
  end if;
end;
$$;

-- 5. Schedule it. Free projects pause after ~7 days idle, so run every 3 days
--    to stay comfortably inside the window.
--    pg_cron format: minute hour day-of-month month day-of-week
--    '0 6 */3 * *' = 06:00 UTC every 3rd day-of-month.
select cron.schedule(
  'db-keepalive',
  '0 6 */3 * *',
  $$ select public.run_keepalive_cycle(); $$
);

-- Inspect the schedule:
--   select * from cron.job where jobname = 'db-keepalive';
-- Inspect run history:
--   select * from cron.job_run_details order by start_time desc limit 10;