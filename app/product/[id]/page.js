'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useShop } from '@/components/CartContext';
import { useLang } from '@/components/LangContext';
import ProductSection from '@/components/ProductSection';
import { salePrice, discountPct, PLACEHOLDER } from '@/lib/utils';

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { add } = useShop();
  const { t, num, taka, loc } = useLang();
  const [p, setP] = useState(null);
  const [related, setRelated] = useState([]);
  const [qty, setQty] = useState(1);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    supabase.from('products').select('*').eq('id', id).single().then(({ data }) => {
      if (!data) return setMissing(true);
      setP(data);
      supabase.from('products').select('*').eq('category', data.category).neq('id', id).limit(5).then(({ data: r }) => setRelated(r || []));
    });
  }, [id]);

  if (missing) return <p className="py-20 text-center">{t('p.notFound')}</p>;
  if (!p) return <p className="py-20 text-center text-gray-500">{t('cat.loading')}</p>;
  const pct = discountPct(p);

  return (
    <>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 md:grid-cols-2">
        <img src={p.image_url || PLACEHOLDER} alt={loc(p, 'title')} className="w-full rounded-2xl bg-brand-light object-cover" />
        <div>
          <h1 className="text-2xl font-bold text-teal-dark">{loc(p, 'title')}</h1>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-brand">{taka(salePrice(p))}</span>
            {pct > 0 && <><span className="text-gray-400 line-through">{taka(p.price)}</span>
              <span className="rounded-full bg-brand px-2 py-0.5 text-xs font-bold text-white">-{num(pct)}%</span></>}
          </div>
          <p className={`mt-2 text-sm font-semibold ${p.in_stock ? 'text-teal' : 'text-red-500'}`}>{p.in_stock ? t('p.in') : t('p.out')}</p>
          <p className="mt-4 whitespace-pre-line text-gray-700">{loc(p, 'description')}</p>
          {p.in_stock && (
            <>
              <div className="mt-6 flex items-center gap-3">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="rounded border p-2"><Minus size={16} /></button>
                <span className="w-8 text-center font-bold">{num(qty)}</span>
                <button onClick={() => setQty(qty + 1)} className="rounded border p-2"><Plus size={16} /></button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button onClick={() => add(p, qty)} className="flex items-center justify-center gap-2 rounded-lg border-2 border-teal py-3 font-bold text-teal hover:bg-teal hover:text-white">
                  <ShoppingCart size={18} /> {t('card.add')}
                </button>
                <button onClick={() => { add(p, qty, false); router.push('/checkout'); }} className="rounded-lg bg-brand py-3 font-bold text-white hover:bg-brand-dark">{t('card.buy')}</button>
              </div>
            </>
          )}
        </div>
      </div>
      <ProductSection title={t('p.related')} products={related} />
    </>
  );
}
