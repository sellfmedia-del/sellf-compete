export function previewIsReadOnly() {
  if (process.env.VERCEL_ENV !== 'preview') return false;
  try { return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || '').hostname === 'yfighbxyrofdymnlizjf.supabase.co'; }
  catch { return true; }
}
