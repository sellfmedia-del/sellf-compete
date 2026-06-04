// Dosya Yolu: src/hooks/useAuditHistory.ts
import { useEffect, useState } from 'react';
import { createClient } from '@/src/utils/supabase/client';

export type Audit = {
  id: string;
  created_at: string;
  platform: string;
  input_type: string;
  status: string;
  raw_data: any; 
};

export function useAuditHistory() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [filteredAudits, setFilteredAudits] = useState<Audit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const supabase = createClient();

  useEffect(() => {
    const fetchAudits = async () => {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from('audits')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (data && !error) {
          setAudits(data);
          setFilteredAudits(data);
        }
      }
      setIsLoading(false);
    };

    fetchAudits();
  }, []);

  useEffect(() => {
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = audits.filter(audit => 
      audit.platform.toLowerCase().includes(lowerQuery) || 
      audit.input_type.toLowerCase().includes(lowerQuery) ||
      audit.id.toLowerCase().includes(lowerQuery)
    );
    setFilteredAudits(filtered);
  }, [searchQuery, audits]);

  // Dosya Yolu: src/hooks/useAuditHistory.ts

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation(); // YENİ: Tıklama olayının üstteki <Link> bileşenine sıçramasını engeller
    
    if (!confirm("Are you sure you want to permanently delete this audit report?")) return;

    const originalAudits = [...audits];
    
    // 1. Optimistic UI: Kullanıcıyı bekletmemek için ekrandan anında kaldır
    setAudits(audits.filter(a => a.id !== id));
    
    // 2. KRİTİK DÜZELTME: Sona `.select()` ekliyoruz. 
    // RLS engeline takılırsak Supabase hata vermez ama geriye boş dizi '[]' döndürür.
    const { data, error } = await supabase
      .from('audits')
      .delete()
      .eq('id', id)
      .select();
    
    // Eğer hata varsa VEYA dönen veri boşsa (RLS engellediyse) geri al (Rollback)
    if (error || !data || data.length === 0) {
      console.error("Delete failed or blocked by Supabase RLS:", error);
      
      // Arayüzü eski haline döndür
      setAudits(originalAudits);
      
      alert("Delete action rejected by database. Ensure your Supabase RLS DELETE policy is active.");
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getScore = (rawData: any) => {
    try {
      const parsed = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
      return parsed?.deepSentiment?.overall_score || 'N/A';
    } catch {
      return 'N/A';
    }
  };

  // UI'ın ihtiyaç duyduğu her şeyi dışarı aktarıyoruz
  return {
    audits,
    filteredAudits,
    isLoading,
    searchQuery,
    setSearchQuery,
    handleDelete,
    formatDate,
    getScore
  };
}