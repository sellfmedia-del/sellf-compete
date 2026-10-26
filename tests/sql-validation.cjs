/* eslint-disable @typescript-eslint/no-require-imports -- Standalone SQL validation harness. */
const {PGlite}=require(process.env.PGLITE_PATH || '@electric-sql/pglite');
const fs=require('node:fs');const assert=require('node:assert/strict');
(async()=>{
 const db=new PGlite();
 await db.exec(`create role anon;create role authenticated;create role service_role; create schema auth; grant usage on schema auth,public to anon,authenticated;create function auth.uid() returns uuid language sql stable as 'select nullif(current_setting(''request.jwt.claim.sub'', true), '''')::uuid'; create table public.profiles(id uuid primary key,credits integer,is_trial boolean default true,trial_ends_at timestamptz,paddle_status text,paddle_subscription_id text,paddle_customer_id text,updated_at timestamptz);create table public.credit_transactions(id uuid primary key default gen_random_uuid(),user_id uuid references profiles(id),amount integer,type text,price_paid numeric,created_at timestamptz default now());grant all on public.profiles,public.credit_transactions to service_role; create function public.handle_new_user() returns trigger language plpgsql security definer as 'begin return new; end;'; insert into profiles(id,credits) values('11111111-1111-1111-1111-111111111111',1),('22222222-2222-2222-2222-222222222222',2);`);
 await db.exec(fs.readFileSync(require('node:path').join(__dirname, '../supabase/migrations/20261026140124_secure_compete_credit_rpc.sql'),'utf8'));
 await db.exec('set role anon');await assert.rejects(db.query("select public.decrement_credits('11111111-1111-1111-1111-111111111111')"),e=>e.code==='42501');await db.exec('reset role');
 await db.exec("select set_config('request.jwt.claim.sub','11111111-1111-1111-1111-111111111111',false);set role authenticated;");
 await assert.rejects(db.query("select public.decrement_credits('22222222-2222-2222-2222-222222222222')"),e=>e.code==='42501');
 await db.query("select public.decrement_credits('11111111-1111-1111-1111-111111111111')");
 await assert.rejects(db.query("select public.decrement_credits('11111111-1111-1111-1111-111111111111')"),e=>e.code==='P0001');await db.exec('reset role');
 const r=await db.query('select credits from profiles order by id');assert.deepEqual(r.rows.map(r=>r.credits),[0,2]);
 const grants=await db.query("select has_function_privilege('anon','public.handle_new_user()','execute') as anon, has_function_privilege('authenticated','public.handle_new_user()','execute') as authenticated");assert.deepEqual(grants.rows[0],{anon:false,authenticated:false});
 await db.exec('set role service_role');
 const pay="select public.apply_compete_payment('11111111-1111-1111-1111-111111111111','txn_test_1',5,'subscription',22,'sub_test','ctm_test','2026-10-26T12:00:00Z') as applied";
 assert.equal((await db.query(pay)).rows[0].applied,true);assert.equal((await db.query(pay)).rows[0].applied,false);
 await db.query("select public.apply_compete_subscription_status('sub_test','canceled','2026-10-26T14:00:00Z')");
 await db.query("select public.apply_compete_subscription_status('sub_test','active','2026-10-26T13:00:00Z')");
 await db.query("select public.apply_compete_payment('11111111-1111-1111-1111-111111111111','txn_test_2',1,'credit',1.9,null,'ctm_test','2026-10-26T15:00:00Z')");
 await db.exec('reset role');
 const profile=(await db.query("select credits,is_trial,paddle_status,paddle_subscription_id from profiles where id='11111111-1111-1111-1111-111111111111'")).rows[0];
 assert.deepEqual(profile,{credits:6,is_trial:false,paddle_status:'canceled',paddle_subscription_id:'sub_test'});
 assert.equal((await db.query('select count(*)::int as n from credit_transactions')).rows[0].n,2);
 await db.exec('set role authenticated');await assert.rejects(db.query(pay),e=>e.code==='42501');await db.exec('reset role');
 console.log('SQL validation: migration applied locally; anonymous and cross-account access denied; owner decrement succeeds; exhausted balance rejected; trigger API execution revoked; unrelated balance preserved; repeated payments credited once; purchase clears trial; stale subscription events ignored; credit purchase cannot reactivate canceled subscription; payment functions restricted to service role.');await db.close();
})().catch(e=>{console.error(e);process.exit(1)});
