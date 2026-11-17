'use client';
import Link from 'next/link';
import ProductCard from './ProductCard';
import { useLang } from './LangContext';

export default function ProductSection({ title, products, href }) {
  const { t } = useLang();
  if (!products?.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between border-b-2 border-brand/20 pb-2">
        <h2 className="text-xl font-bold text-teal-dark">{title}</h2>
        {href && <Link href={href} className="text-sm font-semibold text-brand hover:underline">{t('home.viewAll')}</Link>}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {products.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </section>
  );
}
