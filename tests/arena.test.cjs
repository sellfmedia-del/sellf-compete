/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS test harness loads TS sources without a new runtime dependency. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const Module = require('node:module');
const path = require('node:path');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, filename);
const data = require('../src/lib/arena-data.ts');
const { PLATFORMS, getPlatform } = require('../src/lib/platforms.ts');
const { validateArenaInput, publicUrl } = require('../src/lib/input-validation.ts');
const access = require('../src/lib/server-access.ts');
const { runArenaEngine } = require('../src/lib/services/arenaEngine.ts');
const date = '2026-10-26T12:00:00Z';

for (const [value, expected] of [['1.299,90 TL',1299.9],['$1,299.90',1299.9],['1,299',1299],['4,5',4.5],['Not verified',null],['1K+',null],['10–20',null],['4.5 out of 5',null],['2 for 100 TL',null]]) {
  test(`numeric parsing: ${value}`, () => assert.equal(data.parseNumeric(value), expected));
}
test('all eight platforms and historical aliases are supported', () => {
  assert.equal(PLATFORMS.length,8);
  for (const p of PLATFORMS) assert.equal(getPlatform(p.label).id,p.id);
  assert.equal(getPlatform('My Website').id,'website');
  assert.equal(getPlatform('Physical Store').id,'physical-store');
  assert.equal(getPlatform('N11'),undefined);
});
test('product identity survives title slug and tracking changes', () => {
  assert.equal(data.canonicalUrl('https://www.trendyol.com/a/old-name-p-123?utm_source=x'),data.canonicalUrl('https://trendyol.com/b/new-name-p-123'));
  assert.equal(data.canonicalUrl('https://www.amazon.com/name/dp/B09X7MPX8L?ref=ad'),data.canonicalUrl('https://amazon.com/dp/B09X7MPX8L'));
  assert.notEqual(data.canonicalUrl('https://shop.com/p?variant=red'),data.canonicalUrl('https://shop.com/p?variant=blue'));
});
test('Trendyol nested fields and separate reviews are normalized', () => {
  const url='https://www.trendyol.com/test/item-p-123';
  const rows=[{type:'product',id:'123',url,title:'Product',pricing:{current_price:899,currency:'TRY'},metrics:{rating:{average_rating:4.4,comment_count:1286,total_count:2000}}},...Array.from({length:50},(_,i)=>({type:'review',id:String(i),url,comment:`Review ${i}`,parent_product:{url}})),{type:'review',url:'https://trendyol.com/other-p-222',comment:'Other product'}];
  const [p]=data.normalizeMarketplaceDataset(rows,date);
  assert.equal(p.price_amount,899);assert.equal(p.total_reviews,1286);assert.equal(p.average_rating,4.4);
  assert.equal(p.analyzed_reviews_count,50);assert.equal(p.recent_10_reviews.length,10);
  assert.ok(!p.recent_10_reviews.includes('Other product'));
});
test('Amazon structured price and totals are normalized', () => {
  const p=data.normalizeMarketplaceItem({url:'https://amazon.com/dp/B09X7MPX8L',price:{value:145.5,currency:'$'},stars:4.8,reviewsCount:36704},date);
  assert.equal(p.price_amount,145.5);assert.equal(p.currency,'USD');assert.equal(p.total_reviews,36704);
});
test('source error rows cannot become successful observations', () => assert.equal(data.normalizeMarketplaceItem({url:'https://amazon.com/dp/B09X7MPX8L',error:'product_not_found'},date),null));
test('unknown metrics remain unknown rather than zero', () => {
  const p=data.normalizeMarketplaceItem({url:'https://shop.com/p',title:'Product'},date);
  assert.equal(p.price_amount,null);assert.equal(p.total_reviews,null);assert.equal(p.average_rating,null);
});
test('absolute, percent, review and rating changes are computed from measurements', () => {
  const old={...data.emptyObservation('https://shop.com/p','p'),data_status:'observed',observed_at:date,price_amount:999,currency:'TRY',total_reviews:1240,average_rating:4.3};
  const current={...old,price_amount:899,total_reviews:1286,average_rating:4.4};
  const result=data.compareObservation(current,old);
  assert.equal(result.delta.price.change,-100);assert.equal(result.delta.price.percent,-10.01);assert.equal(result.delta.reviews.change,46);assert.equal(result.delta.rating.change,0.1);
});
test('zero baseline, different currency and legacy AI values are not fabricated comparisons', () => {
  assert.equal(data.metricDelta(0,10).percent,null);
  const old={...data.emptyObservation('https://shop.com/p','p'),data_status:'observed',observed_at:date,price_amount:10,currency:'USD'};
  assert.equal(data.compareObservation({...old,currency:'TRY'},old).delta.price,null);
  assert.equal(data.compareObservation(old,{current_price:'100 TL'}).delta.price,null);
});
test('invalid private URLs, malformed arrays and too many rivals are rejected', () => {
  for(const url of ['http://127.0.0.1','http://localhost','https://user:pass@shop.com','http://169.254.169.254/latest','http://[::1]'])assert.equal(publicUrl(url),null);
  assert.throws(()=>validateArenaInput({platform:'website',productLink:'https://shop.com',category:'x',competitorBrands:'invalid'}));
  assert.throws(()=>validateArenaInput({platform:'website',productLink:'https://shop.com',category:'x',competitorProducts:Array(6).fill('https://shop.com')}));
  for(const platform of ['b2b','physical-store']) assert.equal(validateArenaInput({platform,productLink:'Istanbul retail store',category:'Furniture'}).platform.id,platform);
});

function mockDB(credits=1, extras={}) {
  const profile={credits,is_trial:false,trial_ends_at:null,paddle_status:'active',...extras};
  let product={id:'12345678-1234-1234-1234-123456789abc',user_id:'owner',product_link:'https://trendyol.com/test-p-123',platform:'trendyol',category:'test',competitor_brands:[],competitor_products:[],updated_at:date,latest_data:{my_product:{name:'old'}},historical_data:[]};
  return {profile,get product(){return product},from(table){
    let changes=null;const filters=[];
    const builder={select(){return builder},eq(k,v){filters.push([k,v]);return builder},is(k,v){filters.push([k,v]);return builder},update(v){changes=v;return builder},
      async single(){const row=table==='profiles'?profile:product; const matches=filters.every(([k,v])=>k==='id'&&table==='profiles'?true:row?.[k]===v);return {data:matches?{...row}:null,error:matches?null:{message:'not found'}}},
      async maybeSingle(){const row=table==='profiles'?profile:product;const matches=filters.every(([k,v])=>k==='id'&&table==='profiles'?true:row?.[k]===v);if(!matches)return {data:null,error:null};if(table==='profiles')Object.assign(profile,changes);else product={...product,...changes};return {data:{...(table==='profiles'?profile:product)},error:null}}};return builder;
  }};
}
test('concurrent requests cannot spend the same last credit',async()=>{
  const db=mockDB(1);const outcomes=await Promise.allSettled(Array.from({length:10},()=>access.changeCredit(db,'owner',-1,true)));
  assert.equal(outcomes.filter(v=>v.status==='fulfilled').length,1);assert.equal(db.profile.credits,0);
});
test('failed scans refund once; successful scans consume one credit',async()=>{
  const db=mockDB(2);await assert.rejects(access.withCredit(db,'owner',true,async()=>{throw Error('provider failed')}));assert.equal(db.profile.credits,2);
  assert.equal(await access.withCredit(db,'owner',true,async()=>42),42);assert.equal(db.profile.credits,1);
});
test('expired trials, unpaid Arena and exhausted balances fail before work',async()=>{
  for(const [extras,code] of [[{is_trial:true,trial_ends_at:'2020-01-01'},'TRIAL_EXPIRED'],[{paddle_status:null},'SUBSCRIPTION_REQUIRED'],[{credits:0},'CREDITS_EXHAUSTED']]){
    const db=mockDB(1,extras);let ran=false;await assert.rejects(access.withCredit(db,'owner',true,async()=>{ran=true}),e=>e.code===code);assert.equal(ran,false);
  }
});
function loadRoute(overrides) {
  const filename=path.resolve(__dirname,'../src/app/api/arena/update/route.ts');
  const mod=new Module(filename,module);mod.filename=filename;mod.paths=module.paths;
  const original=mod.require.bind(mod);
  mod.require=id=>id in overrides?overrides[id]:original(id);
  mod._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,filename);
  return mod.exports;
}
test('update API authenticates and rejects cross-account product access before collection',async()=>{
  const db=mockDB(3);let ran=false;
  const route=loadRoute({'@/src/lib/platforms':{getPlatform},'@/src/lib/services/arenaEngine':{runArenaEngine:async()=>{ran=true}},'@/src/lib/server-access':{...access,adminClient:()=>db,authenticatedClient:async()=>({client:db,user:{id:'stranger'}})}});
  const response=await route.POST(new Request('http://localhost/api/arena/update',{method:'POST',body:JSON.stringify({productId:db.product.id})}));
  assert.equal(response.status,404);assert.equal(ran,false);assert.equal(db.profile.credits,3);
});
test('update API persists a new snapshot and preserves history without a full reload',async()=>{
  const db=mockDB(3);const snapshot={observed_at:'2026-10-26T13:00:00Z',my_product:{name:'new'}};
  const route=loadRoute({'@/src/lib/platforms':{getPlatform},'@/src/lib/services/arenaEngine':{runArenaEngine:async()=>snapshot},'@/src/lib/server-access':{...access,adminClient:()=>db,authenticatedClient:async()=>({client:db,user:{id:'owner'}})}});
  const response=await route.POST(new Request('http://localhost/api/arena/update',{method:'POST',body:JSON.stringify({productId:db.product.id})}));
  assert.equal(response.status,200);assert.equal(db.product.latest_data.my_product.name,'new');assert.equal(db.product.historical_data.length,1);assert.equal(db.profile.credits,2);
});
test('collection failure preserves previous snapshot and refunds the credit',async()=>{
  const db=mockDB(3);
  const route=loadRoute({'@/src/lib/platforms':{getPlatform},'@/src/lib/services/arenaEngine':{runArenaEngine:async()=>{throw Error('No current data')}},'@/src/lib/server-access':{...access,adminClient:()=>db,authenticatedClient:async()=>({client:db,user:{id:'owner'}})}});
  const response=await route.POST(new Request('http://localhost/api/arena/update',{method:'POST',body:JSON.stringify({productId:db.product.id})}));
  assert.equal(response.status,502);assert.equal(db.product.latest_data.my_product.name,'old');assert.equal(db.product.historical_data.length,0);assert.equal(db.profile.credits,3);
});
test('engine supports eight research routes without manufacturing numeric observations',async()=>{
  const oldFetch=global.fetch;const saved={...process.env};
  process.env.APIFY_API_TOKEN='test';process.env.TAVILY_API_KEY='test';delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  global.fetch=async(url,options)=>{
    if(String(url).includes('apify.com'))return Response.json([{type:'product',url:'https://trendyol.com/p-p-123',title:'Observed product',pricing:{current_price:899,currency:'TRY'},metrics:{rating:{comment_count:20}}}]);
    const query=JSON.parse(options.body).query;assert.ok(query.length>0);
    return Response.json({results:[{url:'https://source.example.com/research',title:'Research',content:'Observed public evidence'}]});
  };
  try {
    for(const platform of PLATFORMS){
      const result=await runArenaEngine('https://trendyol.com/p-p-123',platform.id,'Test',[],[]);
      assert.equal(result.platform,platform.id);assert.ok(result.sources.length>0);
      if(!['amazon','trendyol'].includes(platform.id)) assert.equal(result.my_product.price_amount,null);
    }
  }finally{global.fetch=oldFetch;process.env=saved;}
});

const { paymentEntitlement, CREDIT_PRICE_ID, SUBSCRIPTION_PRICE_ID } = require('../src/lib/payment-policy.ts');
test('payment credits come from signed price items, not client plan labels', () => {
  assert.deepEqual(paymentEntitlement([{price:{id:CREDIT_PRICE_ID},quantity:2}]),{credits:2,plan:'credit'});
  assert.deepEqual(paymentEntitlement([{price:{id:SUBSCRIPTION_PRICE_ID},quantity:1}]),{credits:5,plan:'subscription'});
  assert.throws(()=>paymentEntitlement([{price:{id:'unrelated-price'},quantity:1}]));
  assert.throws(()=>paymentEntitlement([{price:null,quantity:1}]));
  assert.throws(()=>paymentEntitlement([{price:{id:CREDIT_PRICE_ID},quantity:0}]));
});

test('preview mode blocks writes against the production project without blocking production', () => {
  const {previewIsReadOnly}=require('../src/lib/preview-safety.ts');
  const oldEnv=process.env.VERCEL_ENV, oldUrl=process.env.NEXT_PUBLIC_SUPABASE_URL;
  try {
    process.env.VERCEL_ENV='preview';process.env.NEXT_PUBLIC_SUPABASE_URL='https://yfighbxyrofdymnlizjf.supabase.co';assert.equal(previewIsReadOnly(),true);
    process.env.VERCEL_ENV='production';assert.equal(previewIsReadOnly(),false);
    process.env.VERCEL_ENV='preview';process.env.NEXT_PUBLIC_SUPABASE_URL='https://isolated-test-project.supabase.co';assert.equal(previewIsReadOnly(),false);
  } finally { if(oldEnv===undefined)delete process.env.VERCEL_ENV;else process.env.VERCEL_ENV=oldEnv;if(oldUrl===undefined)delete process.env.NEXT_PUBLIC_SUPABASE_URL;else process.env.NEXT_PUBLIC_SUPABASE_URL=oldUrl; }
});

test('old source snapshots cannot be labeled as new observations', () => {
 const p=data.normalizeMarketplaceItem({url:'https://trendyol.com/p-p-123',pricing:{current_price:899},source_context:{scraped_time:'2026-10-01T12:00:00Z'}},date);
 assert.equal(p.data_status,'stale');assert.equal(p.observed_at,'2026-10-01T12:00:00Z');
});
