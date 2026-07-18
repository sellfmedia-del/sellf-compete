// Dosya Yolu: src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import AuditTypeSelector from '@/src/components/dashboard/AuditTypeSelector';
import AuditInputForm from '@/src/components/dashboard/AuditInputForm';
import AuditReport from '@/src/components/dashboard/AuditReport';
import { Globe, Lock, Clock } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/src/utils/supabase/client';

interface Profile {
  credits: number;
  is_trial: boolean;
  trial_ends_at: string | null;
}

export default function DashboardPage() {
  const [step, setStep] = useState(1); 
  const [auditType, setAuditType] = useState<'product' | 'idea' | null>(null);
  
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<'Turkish' | 'English'>('English'); 
  
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  // YENİ: Profil ve hata state'leri
  const [profile, setProfile] = useState<Profile | null>(null);
  const [auditError, setAuditError] = useState<string | null>(null);

  const supabase = createClient();

  // YENİ: Sayfa açılışında profili çek (credits, is_trial, trial_ends_at)
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('credits, is_trial, trial_ends_at')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setProfile(data as Profile);
      }
    };
    fetchProfile();
  }, []);

  const handleTypeSelect = (type: 'product' | 'idea') => {
    setAuditType(type);
    setStep(2);
  };

  const startAudit = async (formData: any) => {
    setIsLoading(true);
    setAuditError(null); // YENİ: önceki hatayı temizle
    setSelectedPlatform(formData?.platform || 'General');

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: formData?.url, 
          type: auditType, 
          platform: formData?.platform || 'General',
          documentContent: formData?.documentContent || "",
          language: language 
        }),
      });

      const data = await response.json();

      // YENİ: 403 (trial bitti / kredi bitti) durumunu ayrı ele al
      if (!response.ok) {
        setAuditError(data.error || 'Something went wrong. Please try again.');
        setIsLoading(false);
        return;
      }

      setReportData(data);
      setStep(3);

      // YENİ: Kredi düştü, profili tazele (şerit güncellensin)
      setProfile((prev) => (prev ? { ...prev, credits: prev.credits - 1 } : prev));
    } catch (err) {
      console.error("Audit error:", err);
      setAuditError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // YENİ: Trial gün hesaplama
  const daysLeft = profile?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(profile.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-orange-500 selection:text-white">
      <div className="fixed top-28 right-8 z-50">
        <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 p-1 rounded-full flex items-center gap-1 shadow-2xl">
          <button 
            onClick={() => setLanguage('Turkish')}
            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all ${language === 'Turkish' ? 'bg-orange-500 text-black' : 'text-zinc-500 hover:text-white'}`}
          >
            TR
          </button>
          <button 
            onClick={() => setLanguage('English')}
            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all ${language === 'English' ? 'bg-orange-500 text-black' : 'text-zinc-500 hover:text-white'}`}
          >
            EN
          </button>
          <div className="px-2 text-zinc-700">
            <Globe size={14} />
          </div>
        </div>
      </div>

      <div className="p-8 max-w-5xl mx-auto space-y-12 pb-24">

        {/* YENİ: TRIAL DURUM ŞERİDİ — sadece trial kullanıcısına görünür */}
        {profile?.is_trial && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-orange-500/10 border border-orange-500/20 rounded-3xl px-6 py-4">
            <div className="flex items-center gap-3 text-sm font-bold text-orange-500">
              <Clock size={16} />
              <span>
                {profile.credits} of 3 free audits remaining
                {daysLeft !== null && ` · Trial ends in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`}
              </span>
            </div>
            <Link
              href="/register"
              className="text-[10px] font-black uppercase tracking-widest bg-orange-500 text-black px-4 py-2 rounded-full hover:bg-orange-400 transition-all"
            >
              Upgrade Now
            </Link>
          </div>
        )}

        {/* YENİ: AUDIT HATASI (trial bitti / kredi bitti) */}
        {auditError && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-red-500/10 border border-red-500/20 rounded-3xl px-6 py-4">
            <div className="flex items-center gap-3 text-sm font-bold text-red-400">
              <Lock size={16} />
              <span>{auditError}</span>
            </div>
            <Link
              href="/register"
              className="text-[10px] font-black uppercase tracking-widest bg-white text-black px-4 py-2 rounded-full hover:bg-zinc-200 transition-all shrink-0"
            >
              Subscribe
            </Link>
          </div>
        )}
        
        {step === 1 && (
          <div className="pt-12 animate-in fade-in zoom-in-95 duration-500">
             <div className="text-center mb-12">
                <h2 className="text-3xl font-black tracking-tighter uppercase italic text-white leading-tight">
                  Start New <span className="text-orange-500">Audit</span>
                </h2>
                <p className="text-zinc-500 text-xs mt-3 font-bold uppercase tracking-[0.2em]">Select your entry point to the ecosystem</p>
             </div>
             <AuditTypeSelector onSelect={handleTypeSelect} />
          </div>
        )}

        {step >= 2 && (
          <div className={`animate-in fade-in slide-in-from-bottom-4 duration-700 ${step === 3 ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
            <AuditInputForm 
              type={auditType!} 
              onBack={() => setStep(1)} 
              onStart={startAudit}
              isLoading={isLoading} 
            />
          </div>
        )}

        {step === 3 && reportData && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="h-px bg-zinc-900 w-full my-16" />
            {/* YENİ: onReset prop'u state makinesini sıfırlayacak şekilde bağlandı */}
            <AuditReport 
              data={reportData} 
              auditType={auditType} 
              platform={selectedPlatform} 
              isTrial={profile?.is_trial ?? false}
              onReset={() => {
                setStep(1);             // İlk adıma geri dön
                setAuditType(null);     // Seçimi temizle
                setReportData(null);    // Eski rapor verisini uçur
              }}
            /> 
          </div>
        )}

      </div>
    </div>
  );
}