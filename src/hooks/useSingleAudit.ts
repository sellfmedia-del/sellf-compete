// Dosya Yolu: src/hooks/useSingleAudit.ts
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/src/utils/supabase/client';

export function useSingleAudit(id: string | undefined) {
  const [audit, setAudit] = useState<any>(null);
  const [parsedData, setParsedData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const supabase = createClient();

  useEffect(() => {
    if (!id) return;

    const fetchAudit = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('audits')
        .select('*')
        .eq('id', id)
        .single();

      if (data && !error) {
        setAudit(data);
        try {
          // Gemini'den gelen raw_data string ise JSON'a çevir, zaten JSON ise direkt kullan
          const parsed = typeof data.raw_data === 'string' ? JSON.parse(data.raw_data) : data.raw_data;
          setParsedData(parsed);
        } catch (e) {
          console.error("Failed to parse audit data", e);
        }
      }
      setIsLoading(false);
    };

    fetchAudit();
  }, [id]);

  return { audit, parsedData, isLoading };
}