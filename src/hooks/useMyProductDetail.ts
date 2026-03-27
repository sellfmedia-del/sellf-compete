// Dosya Yolu: src/hooks/useMyProductDetail.ts
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/src/utils/supabase/client';

export function useMyProductDetail(id: string | undefined) {
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const supabase = createClient();

  useEffect(() => {
    if (!id) return;

    const fetchProductDetail = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_products')
        .select('*')
        .eq('id', id)
        .single();

      if (data && !error) {
        setProduct(data);
      } else {
        console.error("Failed to fetch product details:", error);
      }
      setIsLoading(false);
    };

    fetchProductDetail();
  }, [id]);

  return { product, isLoading };
}