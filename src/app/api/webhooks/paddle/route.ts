// Dosya Yolu: src/app/api/webhooks/paddle/route.ts
import { NextResponse } from 'next/server';
import { Environment, LogLevel, Paddle } from '@paddle/paddle-node-sdk';
import { createClient } from '@supabase/supabase-js';

// 1. SUPABASE ADMIN CLIENT (Tanrı Modu - RLS'i bypass eder)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

// 2. PADDLE BACKEND INSTANCE
const paddle = new Paddle(process.env.PADDLE_API_KEY!, {
  environment: process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === 'production' ? Environment.production : Environment.sandbox,
  logLevel: LogLevel.error,
});

export async function POST(req: Request) {
  // Paddle, doğrulama için isteğin "ham" (raw) halini ve imza başlığını ister
  const signature = req.headers.get('paddle-signature') || '';
  const rawRequestBody = await req.text(); 
  const secretKey = process.env.PADDLE_WEBHOOK_SECRET!;

  try {
    if (!signature || !secretKey) {
      throw new Error('Missing Paddle signature or secret key');
    }

    // 3. KRİPTOGRAFİK DOĞRULAMA (Hacker koruması)
    const eventData = await paddle.webhooks.unmarshal(rawRequestBody, secretKey, signature);
    // 4. SADECE BAŞARILI ÖDEMELERİ FİLTRELE
    if (eventData.eventType === 'transaction.completed') {
      const transaction = eventData.data;
      
      // Kayıt sayfasında pakete koyduğumuz gizli veriyi (customData) açıyoruz
      const customData = transaction.customData as any;
      
      // Güvenlik: Bu ödeme SellfCompete için değilse veya UserID yoksa yoksay
      if (!customData || customData.app !== 'sellfcompete' || !customData.userId) {
         console.log("[Webhook] Ignored: Not a SellfCompete transaction.");
         return NextResponse.json({ status: 'ignored' });
      }

      const userId = customData.userId;
      const planType = customData.planType; // 'credit' veya 'subscription'
      const transactionId = transaction.id;
      
      // İş modeline göre verilecek kredi miktarı (Bunları kendi iş modeline göre değiştirebilirsin)
      const creditsToAdd = planType === 'subscription' ? 500 : 100; 

      // 5. SUPABASE İŞLEMİ A: Mevcut krediyi bul ve üzerine ekle
      const { data: profile, error: fetchError } = await supabaseAdmin
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single();

      if (fetchError) throw fetchError;

      const currentCredits = profile?.credits || 0;
      const newCredits = currentCredits + creditsToAdd;

      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ 
          credits: newCredits,
          paddle_status: 'active', // Katı kilidi (Middleware) açan sihirli kelime
          paddle_subscription_id: transaction.subscriptionId || transactionId,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      // 6. SUPABASE İŞLEMİ B: Denetim ve Fatura Kaydı (Audit Log)
      // Paddle tutarları kuruş (cents) cinsinden de gönderebilir, 100'e bölerek ana birime (Örn: $) çeviriyoruz
      const grandTotal = parseInt(transaction.details?.totals?.grandTotal || "0", 10) / 100;

      const { error: auditError } = await supabaseAdmin
        .from('credit_transactions')
        .insert({
          user_id: userId,
          amount: creditsToAdd,
          type: planType,
          price_paid: grandTotal,
          created_at: new Date().toISOString()
        });

      if (auditError) console.error("Failed to log transaction audit:", auditError);

      console.log(`[Success] Processed ${planType} for User: ${userId}. Added ${creditsToAdd} credits.`);
    }

    return NextResponse.json({ status: 'success' }, { status: 200 });
    
  } catch (error: any) {
    console.error('[Paddle Webhook Error]:', error.message);
    // Güvenlik: Hata detayını dışarı sızdırmıyoruz, sadece 400 dönüyoruz
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 400 });
  }
}