-- SellfCompete only: yfighbxyrofdymnlizjf.
-- Prepared for review; do not run against SellfTask or another project.
-- Compatible with existing authenticated callers during a rolling release.
begin;
create or replace function public.decrement_credits(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or auth.uid() is distinct from target_user_id then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  update public.profiles set credits = credits - 1
  where id = target_user_id and credits > 0;
  if not found then
    raise exception 'Insufficient credits' using errcode = 'P0001';
  end if;
end;
$$;
revoke all on function public.decrement_credits(uuid) from public, anon;
grant execute on function public.decrement_credits(uuid) to authenticated;
-- Trigger execution is not affected by revoking direct API invocation rights.
alter function public.handle_new_user() set search_path = '';
revoke all on function public.handle_new_user() from public, anon, authenticated;
commit;

-- Apply payment credits and their audit record in one transaction, once per payment.
begin;
alter table public.credit_transactions add column if not exists external_reference text;
create unique index if not exists credit_transactions_external_reference_idx
on public.credit_transactions(external_reference) where external_reference is not null;
alter table public.profiles add column if not exists paddle_event_at timestamptz;

create or replace function public.apply_compete_payment(
  p_user_id uuid, p_transaction_id text, p_credits integer, p_plan text,
  p_price_paid numeric, p_subscription_id text, p_customer_id text, p_occurred_at timestamptz
) returns boolean language plpgsql security invoker set search_path = '' as $$
declare inserted_id uuid;
begin
  if p_transaction_id is null or p_transaction_id not like 'txn_%'
    or p_plan not in ('credit','subscription') or p_credits < 1 or p_credits > 500
    or p_price_paid < 0 or p_occurred_at is null then
    raise exception 'Invalid payment';
  end if;
  -- Serialize payment and consumption updates on this account row.
  perform 1 from public.profiles where id = p_user_id for update;
  if not found then raise exception 'Profile not found'; end if;
  insert into public.credit_transactions(user_id,amount,type,price_paid,external_reference)
  values(p_user_id,p_credits,p_plan,p_price_paid,p_transaction_id)
  on conflict(external_reference) where external_reference is not null do nothing
  returning id into inserted_id;
  if inserted_id is null then return false; end if;
  update public.profiles set
    credits = coalesce(credits,0) + p_credits,
    paddle_status = case when p_plan='subscription' and (paddle_event_at is null or p_occurred_at >= paddle_event_at) then 'active' else paddle_status end,
    paddle_subscription_id = case when p_plan='subscription' and (paddle_event_at is null or p_occurred_at >= paddle_event_at) then p_subscription_id else paddle_subscription_id end,
    paddle_customer_id = coalesce(paddle_customer_id,p_customer_id),
    is_trial = case when p_plan='subscription' then false else is_trial end,
    trial_ends_at = case when p_plan='subscription' then null else trial_ends_at end,
    paddle_event_at = case when p_plan='subscription' then greatest(paddle_event_at,p_occurred_at) else paddle_event_at end,
    updated_at = now()
  where id=p_user_id;
  return true;
end; $$;
revoke all on function public.apply_compete_payment(uuid,text,integer,text,numeric,text,text,timestamptz) from public, anon, authenticated;
grant execute on function public.apply_compete_payment(uuid,text,integer,text,numeric,text,text,timestamptz) to service_role;

create or replace function public.apply_compete_subscription_status(p_subscription_id text,p_status text,p_occurred_at timestamptz)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  if p_status not in ('active','canceled','paused','past_due','trialing') or p_occurred_at is null then raise exception 'Invalid subscription status'; end if;
  update public.profiles set paddle_status=p_status,paddle_event_at=p_occurred_at,updated_at=now()
  where paddle_subscription_id=p_subscription_id and (paddle_event_at is null or p_occurred_at >= paddle_event_at);
end; $$;
revoke all on function public.apply_compete_subscription_status(text,text,timestamptz) from public, anon, authenticated;
grant execute on function public.apply_compete_subscription_status(text,text,timestamptz) to service_role;
commit;
