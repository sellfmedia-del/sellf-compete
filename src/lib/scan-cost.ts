import { GoogleGenerativeAI } from '@google/generative-ai';

// Standard Gemini 2.5 Pro prices checked 2026-10-26. All prompts stay below
// the 200k-token price tier. Recheck provider pricing before enabling scans.
export const MODEL = 'gemini-2.5-pro';
export const MODEL_LIMITS = {
  discovery: { input: 2048, output: 1024, thinking: 128 },
  arena: { input: 12000, output: 4096, thinking: 1024 },
  audit: { input: 20000, output: 8192, thinking: 2048 },
} as const;
type Stage = keyof typeof MODEL_LIMITS;
type ScanKind = 'arena' | 'audit';

export const SEARCH_OPTIONS = {
  search_depth: 'advanced', auto_parameters: false, max_results: 5,
  chunks_per_source: 2, include_answer: false, include_raw_content: false,
  include_usage: true,
} as const;

export class ScanCostError extends Error {}

function positiveSetting(name: string): number {
  const raw = process.env[name];
  const value = raw?.trim() ? Number(raw) : NaN;
  if (!Number.isFinite(value) || value <= 0) throw new ScanCostError('Scan spending limits have not been configured. Please contact support.');
  return value;
}

export function modelCeilingUsd(stage: Stage): number {
  const limit = MODEL_LIMITS[stage];
  // Conservatively reserve thinking in addition to maxOutputTokens, even on
  // endpoints that count it within the output limit. Never rely on free tiers.
  return (limit.input * 1.25 + (limit.output + limit.thinking) * 10) / 1_000_000;
}

export function createScanBudget(kind: ScanKind, usesActor: boolean) {
  const scanCap = positiveSetting(kind === 'arena' ? 'COMPETE_ARENA_BUDGET_USD' : 'COMPETE_AUDIT_BUDGET_USD');
  const actorCap = usesActor ? positiveSetting('COMPETE_APIFY_MAX_RUN_USD') : 0;
  const searchCap = 2 * positiveSetting('COMPETE_TAVILY_CREDIT_USD');
  const modelCap = modelCeilingUsd(kind) + (kind === 'audit' ? modelCeilingUsd('discovery') : 0);
  const ceiling = actorCap + searchCap + modelCap;
  if (ceiling > scanCap + 1e-9) throw new ScanCostError('This scan exceeds its spending limit. Please contact support.');
  const id = crypto.randomUUID();
  const usedStages = new Set<Stage>();
  let actorStarted = false;
  let searchStarted = false;
  const log = (event: string, details: Record<string, unknown>) => console.info('[ScanCost]', JSON.stringify({ id, kind, event, at: new Date().toISOString(), ...details }));
  log('budget', { ceilingUsd: ceiling, scanCapUsd: scanCap, actorCapUsd: actorCap, searchCapUsd: searchCap, modelCapUsd: modelCap });
  return {
    actorUrl(actor: string) {
      if (!usesActor || actorStarted) throw new ScanCostError('Actor request limit reached.');
      actorStarted = true;
      const query = new URLSearchParams({ timeout: '90', maxTotalChargeUsd: String(actorCap), restartOnError: 'false' });
      log('actor_attempt', { actor, capUsd: actorCap });
      return `https://api.apify.com/v2/acts/${actor}/run-sync-get-dataset-items?${query}`;
    },
    startSearch() {
      if (searchStarted) throw new ScanCostError('Search request limit reached.');
      searchStarted = true;
      log('search_attempt', { maximumCredits: 2 });
    },
    recordSearch(usage: { credits?: number } | undefined) {
      log('search_usage', { credits: typeof usage?.credits === 'number' ? usage.credits : null });
    },
    async generate(stage: Stage, prompt: string) {
      if ((kind === 'arena' && stage !== 'arena') || (kind === 'audit' && stage === 'arena') || usedStages.has(stage)) throw new ScanCostError('Model request limit reached.');
      usedStages.add(stage); // A failed/ambiguous response must never cause a paid retry.
      if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) throw new Error('Model is unavailable.');
      const limit = MODEL_LIMITS[stage];
      // The installed SDK forwards generationConfig unchanged; its older TS
      // declarations do not yet expose the API's thinkingConfig field.
      const generationConfig = { responseMimeType: 'application/json', candidateCount: 1, maxOutputTokens: limit.output, thinkingConfig: { thinkingBudget: limit.thinking } };
      const model = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY).getGenerativeModel({ model: MODEL, generationConfig });
      const count = await model.countTokens(prompt, { timeout: 15000 });
      if (!Number.isInteger(count.totalTokens) || count.totalTokens < 0 || count.totalTokens > limit.input) throw new ScanCostError('The scan input exceeds its token limit. Please shorten the input.');
      log('model_attempt', { stage, inputTokens: count.totalTokens, maxOutputTokens: limit.output, thinkingBudget: limit.thinking });
      const result = await model.generateContent(prompt, { timeout: 120000 });
      const usage = result.response.usageMetadata as (typeof result.response.usageMetadata & { thoughtsTokenCount?: number });
      log('model_usage', { stage, inputTokens: usage?.promptTokenCount ?? null, outputTokens: usage?.candidatesTokenCount ?? null, thinkingTokens: usage?.thoughtsTokenCount ?? null, totalTokens: usage?.totalTokenCount ?? null });
      if (result.response.candidates?.[0]?.finishReason !== 'STOP') throw new Error('The model response was incomplete.');
      return result.response.text();
    },
  };
}

export function compactResearch(results: unknown): { url: string; title: string; content: string }[] {
  if (!Array.isArray(results)) return [];
  return results.slice(0, SEARCH_OPTIONS.max_results).flatMap((row: unknown) => {
    if (!row || typeof row !== 'object') return [];
    const r = row as Record<string, unknown>;
    if (typeof r.url !== 'string' || !/^https?:\/\//.test(r.url)) return [];
    return [{ url: r.url.slice(0, 2000), title: typeof r.title === 'string' ? r.title.slice(0, 200) : '', content: typeof r.content === 'string' ? r.content.slice(0, 2000) : '' }];
  });
}
