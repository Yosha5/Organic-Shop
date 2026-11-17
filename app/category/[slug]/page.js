'use client';
import { Suspense, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { CATEGORIES } from '@/lib/utils';
import { useLang } from '@/components/LangContext';
import ProductSection from '@/components/ProductSection';

function Inner() {
  const { slug } = useParams();
  const q = useSearchParams().get('q');
  const { t, num, cat } = useLang();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('new');

  useEffect(() => {
    setLoading(true);
    let query = supabase.from('products').select('*');
    if (slug === 'offer-zone') query = query.not('discount_price', 'is', null);
    else if (slug !== 'all') query = query.eq('category', slug);
    if (q) query = query.or(`title.ilike.%${q}%,title_bn.ilike.%${q}%`);
    query.order('created_at', { ascending: false }).then(({ data }) => { setProducts(data || []); setLoading(false); });
  }, [slug, q]);

  const price = (p) => p.discount_price || p.price;
  const sorted = [...products].sort((a, b) => (sort === 'low' ? price(a) - price(b) : sort === 'high' ? price(b) - price(a) : 0));
  const found = CATEGORIES.find((c) => c.slug === slug);
  const title = q ? t('cat.search', { q }) : found ? cat(found) : t('cat.all');

  return (
    <>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 pt-6">
        <span className="text-sm text-gray-500">{t('cat.items', { n: products.length })}</span>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="input !w-auto">
          <option value="new">{t('sort.new')}</option>
          <option value="low">{t('sort.low')}</option>
          <option value="high">{t('sort.high')}</option>
        </select>
      </div>
      {loading ? <p className="py-10 text-center text-gray-500">{t('cat.loading')}</p>
        : sorted.length ? <ProductSection title={title} products={sorted} />
        : <p className="py-16 text-center text-gray-500">{t('cat.none')}</p>}
    </>
  );
}

export default function CategoryPage() {
  return <Suspense fallback={null}><Inner /></Suspense>;
}
