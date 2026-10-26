/* eslint-disable @typescript-eslint/no-require-imports -- No new test runtime dependency. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const Module = require('node:module');
const path = require('node:path');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, filename);

function load(relative, overrides = {}) {
  const filename = path.resolve(__dirname, relative);
  const mod = new Module(filename, module);mod.filename = filename;mod.paths = module.paths;
  const original = mod.require.bind(mod);
  mod.require = id => id in overrides ? overrides[id] : original(id);
  mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, filename);
  return mod.exports;
}

function setup(t, behavior = {}) {
  const saved = { ...process.env }, originalLog = console.info;
  const logs = [], calls = { counts: 0, generations: 0, configs: [], prompts: [] };
  // Deliberately arbitrary TEST budgets. These are not approved release values.
  Object.assign(process.env, { COMPETE_ARENA_BUDGET_USD: '1', COMPETE_AUDIT_BUDGET_USD: '1', COMPETE_APIFY_MAX_RUN_USD: '0.1', COMPETE_TAVILY_CREDIT_USD: '0.008', GOOGLE_GENERATIVE_AI_API_KEY: 'test', APIFY_API_TOKEN: 'test', TAVILY_API_KEY: 'test' });
  console.info = (...args) => logs.push(args.join(' '));
  t.after(() => { process.env = saved;console.info = originalLog; });
  const policy = load('../src/lib/scan-cost.ts', { '@google/generative-ai': { GoogleGenerativeAI: class {
    getGenerativeModel(config) {
      calls.configs.push(config);
      return {
        countTokens: async () => { calls.counts++;return { totalTokens: behavior.tokens ?? 100 }; },
        generateContent: async prompt => {
          calls.generations++;calls.prompts.push(prompt);
          if (behavior.fail) throw Object.assign(Error('provider unavailable'), { status: 503 });
          const value = calls.generations === 1 && behavior.discovery ? { searchQuery: 'test category' } : { topSellers: [], deepSentiment: {}, marketEconomics: {}, strategicGaps: {} };
          return { response: { candidates: [{ finishReason: behavior.finish ?? 'STOP' }], usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 200, thoughtsTokenCount: 128, totalTokenCount: 428 }, text: () => JSON.stringify(value) } };
        },
      };
    }
  } } });
  return { policy, calls, logs };
}

test('missing, invalid or insufficient budgets stop before paid generation', async t => {
  const { policy, calls } = setup(t);
  for (const invalid of ['', 'NaN', '-1', 'Infinity', '0']) {
    process.env.COMPETE_ARENA_BUDGET_USD = invalid;
    assert.throws(() => policy.createScanBudget('arena', false), policy.ScanCostError);
  }
  process.env.COMPETE_ARENA_BUDGET_USD = '0.01';
  assert.throws(() => policy.createScanBudget('arena', false), policy.ScanCostError);
  assert.equal(calls.generations, 0);
});

test('actor spending cap is sent to Apify; search and actor cannot be repeated', t => {
  const { policy } = setup(t);
  const budget = policy.createScanBudget('arena', true);
  const url = new URL(budget.actorUrl('fatihtahta~trendyol-scraper'));
  assert.equal(url.searchParams.get('maxTotalChargeUsd'), '0.1');
  assert.equal(url.searchParams.get('restartOnError'), 'false');
  assert.equal(url.searchParams.get('timeout'), '90');
  assert.throws(() => budget.actorUrl('another-actor'), policy.ScanCostError);
  budget.startSearch();assert.throws(() => budget.startSearch(), policy.ScanCostError);
  assert.throws(() => policy.createScanBudget('arena', false).actorUrl('actor'), policy.ScanCostError);
});

test('actual token count is checked before generation and failed stage cannot be retried', async t => {
  const { policy, calls } = setup(t, { tokens: 12001 });
  const budget = policy.createScanBudget('arena', false);
  await assert.rejects(budget.generate('arena', 'test'), policy.ScanCostError);
  await assert.rejects(budget.generate('arena', 'test'), policy.ScanCostError);
  assert.equal(calls.counts, 1);assert.equal(calls.generations, 0);
});

test('generation preserves Pro model, bounds output/thinking and records usage without prompt text', async t => {
  const { policy, calls, logs } = setup(t);
  const budget = policy.createScanBudget('arena', false);
  await budget.generate('arena', 'CONFIDENTIAL_SOURCE_TEXT');
  assert.equal(calls.generations, 1);
  const config = calls.configs[0];
  assert.equal(config.model, 'gemini-2.5-pro');
  assert.equal(config.generationConfig.maxOutputTokens, 4096);
  assert.equal(config.generationConfig.thinkingConfig.thinkingBudget, 1024);
  assert.equal(config.generationConfig.candidateCount, 1);
  assert.ok(logs.some(line => line.includes('thinkingTokens') && line.includes('128')));
  assert.ok(logs.every(line => !line.includes('CONFIDENTIAL_SOURCE_TEXT') && !line.includes('api_key')));
  await assert.rejects(budget.generate('audit', 'wrong stage'), policy.ScanCostError);
});

test('503 and truncated output do not trigger another billed model request', async t => {
  const { policy, calls } = setup(t, { fail: true });
  const budget = policy.createScanBudget('audit', false);
  await assert.rejects(budget.generate('audit', 'test'));
  await assert.rejects(budget.generate('audit', 'test'), policy.ScanCostError);
  assert.equal(calls.generations, 1);
});

test('incomplete JSON output is rejected rather than accepted or retried', async t => {
  const { policy, calls } = setup(t, { finish: 'MAX_TOKENS' });
  await assert.rejects(policy.createScanBudget('arena', false).generate('arena', 'test'), /incomplete/);
  assert.equal(calls.generations, 1);
});

test('raw pages, arbitrary extra fields and excessive web results do not enter model evidence', t => {
  const { policy } = setup(t);
  const results = policy.compactResearch(Array.from({ length: 20 }, () => ({ url: 'https://example.com', title: 'A'.repeat(500), content: 'B'.repeat(10000), raw_content: 'HUGE_RAW_PAGE' })));
  assert.equal(results.length, 5);assert.equal(results[0].content.length, 2000);assert.equal(results[0].title.length, 200);
  assert.ok(!JSON.stringify(results).includes('HUGE_RAW_PAGE'));
  assert.equal(policy.SEARCH_OPTIONS.include_raw_content, false);
  assert.equal(policy.SEARCH_OPTIONS.auto_parameters, false);
});

test('Audit end-to-end stays at one actor, one search and two bounded generations', async t => {
  const { policy, calls } = setup(t, { discovery: true });
  const oldFetch = global.fetch;t.after(() => { global.fetch = oldFetch; });
  let actors = 0, searches = 0;
  global.fetch = async (url, options) => {
    const payload = JSON.parse(options.body);
    if (String(url).includes('apify.com')) {
      actors++;assert.equal(new URL(url).searchParams.get('maxTotalChargeUsd'), '0.1');
      assert.equal(payload.limit, 10);assert.equal(payload.maxReviews, 10);assert.equal(payload.enrich_data, false);
      return Response.json([{ type: 'product', url: 'https://trendyol.com/item-p-123', title: 'Observed product', pricing: { current_price: 99, currency: 'TRY' } }]);
    }
    searches++;assert.equal(payload.max_results, 5);assert.equal(payload.include_answer, false);assert.equal(payload.include_raw_content, false);
    return Response.json({ results: [{ url: 'https://example.com', title: 'Research', content: 'Observed evidence' }], usage: { credits: 2 } });
  };
  const { runAuditEngine } = load('../src/lib/services/auditService.ts', { '../scan-cost': policy });
  const report = await runAuditEngine('https://trendyol.com/item-p-123', 'product', 'trendyol', 'D'.repeat(100000));
  assert.equal(actors, 1);assert.equal(searches, 1);assert.equal(calls.generations, 2);
  assert.ok(report.warnings.some(w => w.includes('24,000')));
  assert.ok(calls.prompts[1].length < 50000);
});

test('unconfigured engine cannot reach any external source', async t => {
  const { policy, calls } = setup(t);
  delete process.env.COMPETE_AUDIT_BUDGET_USD;
  const oldFetch = global.fetch;t.after(() => { global.fetch = oldFetch; });
  global.fetch = async () => { assert.fail('No provider call is allowed'); };
  const { runAuditEngine } = load('../src/lib/services/auditService.ts', { '../scan-cost': policy });
  await assert.rejects(runAuditEngine('https://example.com', 'product', 'website'), policy.ScanCostError);
  const { runArenaEngine } = load('../src/lib/services/arenaEngine.ts', { '../scan-cost': policy });
  delete process.env.COMPETE_ARENA_BUDGET_USD;
  await assert.rejects(runArenaEngine('https://example.com', 'website', 'test', [], []), policy.ScanCostError);
  assert.equal(calls.generations, 0);
});

test('installed Google SDK forwards thinking/output limits to the actual HTTP request', async t => {
  setup(t);
  // The legacy SDK leaves request-timeout timers pending after mocked responses.
  // Virtualize those timers so this HTTP contract check does not wait 120s.
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const policy = load('../src/lib/scan-cost.ts');
  const originalFetch = global.fetch;t.after(() => { global.fetch = originalFetch; });
  let countCalls = 0, generateCalls = 0;
  global.fetch = async (url, options) => {
    const body = JSON.parse(options.body);
    if (String(url).includes(':countTokens')) { countCalls++;return Response.json({ totalTokens: 100 }); }
    assert.ok(String(url).includes('gemini-2.5-pro:generateContent'));
    generateCalls++;
    assert.equal(body.generationConfig.thinkingConfig.thinkingBudget, 1024);
    assert.equal(body.generationConfig.maxOutputTokens, 4096);
    assert.equal(body.generationConfig.responseMimeType, 'application/json');
    return Response.json({ candidates: [{ content: { parts: [{ text: '{"verified":true}' }], role: 'model' }, finishReason: 'STOP' }], usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 5, thoughtsTokenCount: 128, totalTokenCount: 233 } });
  };
  assert.equal(await policy.createScanBudget('arena', false).generate('arena', 'test'), '{"verified":true}');
  assert.equal(countCalls, 1);assert.equal(generateCalls, 1);
});
