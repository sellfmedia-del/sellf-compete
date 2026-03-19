'use client';

import React, { useState } from 'react';
import AuditTypeSelector from '@/src/components/dashboard/AuditTypeSelector';
import AuditInputForm from '@/src/components/dashboard/AuditInputForm';
import AuditReport from '@/src/components/dashboard/AuditReport';

export default function DashboardPage() {
  const [step, setStep] = useState(1); 
  const [auditType, setAuditType] = useState<'product' | 'idea' | null>(null);
  
  // Yeni eklenen state'ler
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTypeSelect = (type: 'product' | 'idea') => {
    setAuditType(type);
    setStep(2);
  };

  // Motoru çalıştıran ana fonksiyon
  const startAudit = async (formData: any) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: formData?.url, 
          type: auditType, 
          platform: formData?.platform || 'General',
          // HATA ÇÖZÜMÜ: Formdan gelen çıkarılmış dosya metnini backend'e gönderiyoruz
          documentContent: formData?.documentContent || "" 
        }),
      });
      const data = await response.json();
      setReportData(data);
      setStep(3);
    } catch (err) {
      console.error("Audit error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-orange-500 selection:text-white">
      <div className="p-8 max-w-5xl mx-auto space-y-12 pb-24">
        
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
              isLoading={isLoading} // Loading durumunu forma gönderiyoruz
            />
          </div>
        )}

        {step === 3 && reportData && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="h-px bg-zinc-900 w-full my-16" />
            <AuditReport data={reportData} /> {/* Gelen veriyi rapora basıyoruz */}
          </div>
        )}

      </div>
    </div>
  );
}