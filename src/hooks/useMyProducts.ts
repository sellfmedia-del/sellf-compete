// Dosya Yolu: src/hooks/useMyProducts.ts
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/src/utils/supabase/client';

export type UserProduct = {
  id: string;
  product_link: string;
  category: string;
  platform: string;
  created_at: string;
  updated_at: string;
  latest_data: any;
};

export function useMyProducts() {
  const [products, setProducts] = useState<UserProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const supabase = createClient();

  const fetchProducts = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data, error } = await supabase
        .from('user_products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data && !error) {
        setProducts(data);
      } else if (error) {
        console.error("Error fetching products:", error);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // API'den yeni ürün eklendiğinde listeyi tazelemek için fetchProducts'ı da dışarı aktarıyoruz
  return { products, isLoading, refreshProducts: fetchProducts };
}