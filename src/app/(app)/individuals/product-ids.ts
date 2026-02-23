import { supabaseBrowser } from '@/lib/supabase/client';

export async function getProductIdByType(productType: string) {
  const supabase = supabaseBrowser();
  const { data, error } = await supabase
    .from('products')
    .select('id, type')
    .eq('type', productType)
    .single();
  console.log('getProductIdByType:', { productType, data, error });
  if (error || !data) return null;
  return data.id;
}
