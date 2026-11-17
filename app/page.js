'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { CATEGORIES } from '@/lib/utils';
import { useLang } from '@/components/LangContext';
import Carousel from '@/components/Carousel';
import ProductSection from '@/components/ProductSection';

export default function Home() {
  const { t, cat } = useLang();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('products').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setProducts(data || []); setLoading(false); });
  }, []);

  const top = products.filter((p) => p.featured).slice(0, 10);
  const honey = products.filter((p) => p.category === 'honey').slice(0, 5);

  return (
    <>
      <Carousel />
      <section className="mx-auto max-w-7xl px-4 py-6">
        <h2 className="mb-4 text-xl font-bold text-teal-dark">{t('home.featured')}</h2>
        <div className="grid grid-cols-4 gap-3 md:grid-cols-8">
          {CATEGORIES.map((c) => (
            <Link key={c.slug} href={`/category/${c.slug}`} className="flex flex-col items-center gap-2 rounded-xl bg-white p-3 text-center text-xs font-medium shadow-sm transition hover:shadow-md sm:text-sm">
              <span className="rounded-full bg-brand-light p-3 text-brand"><c.icon size={22} /></span>
              {cat(c)}
            </Link>
          ))}
        </div>
      </section>
      {loading && <p className="py-10 text-center text-gray-500">{t('home.loading')}</p>}
      <ProductSection title={t('home.top')} products={top.length ? top : products.slice(0, 5)} href="/category/all" />
      <ProductSection title={t('home.honey')} products={honey} href="/category/honey" />
      <ProductSection title={t('home.just')} products={products.slice(0, 15)} href="/category/all" />
      {!loading && products.length === 0 && <p className="py-10 text-center text-gray-500">{t('home.empty')}</p>}
    </>
  );
}
