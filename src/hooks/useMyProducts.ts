// Dosya Yolu: src/hooks/useMyProducts.ts
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/src/utils/supabase/client';

export type UserProduct = {
  id: string;
  product_link: string;
  category: string;
  platform: string;
  competitor_brands: string[];   // YENİ: Hata veren eksik tanım eklendi
  competitor_products: string[]; // YENİ: Rakiplerin link dizisi eklendi
  created_at: string;
  updated_at: string;
  latest_data: any;
  historical_data: any;          // YENİ: Geçmiş veri tanımı eklendi
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

  // YENİ: ARENA ÜRÜN SİLME FONKSİYONU
  const deleteProduct = async (id: string) => {
    const { error } = await supabase
      .from('user_products')
      .delete()
      .eq('id', id);

    if (!error) {
      // Sayfayı tamamen tazelemek yerine yerel state'den anında düşürerek hız kazandırıyoruz
      setProducts((prev) => prev.filter((product) => product.id !== id));
      return { success: true };
    } else {
      console.error("Error deleting product:", error);
      return { success: false, error };
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // API'den yeni ürün eklendiğinde listeyi tazelemek için fetchProducts'ı da dışarı aktarıyoruz
  // YENİ: deleteProduct dışarı aktarılanlar arasına eklendi
  return { products, isLoading, refreshProducts: fetchProducts, deleteProduct };
}