do $$
declare
  followup_job record;
begin
  select jobid, command into followup_job
  from cron.job where jobname = 'ltos-ai-sales-follow-up';
  if followup_job.jobid is not null then
    perform cron.alter_job(
      job_id := followup_job.jobid,
      command := replace(followup_job.command, 'timeout_milliseconds := 10000', 'timeout_milliseconds := 60000')
    );
  end if;
end $$;
