'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PackageCheck, Truck, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/components/LangContext';

const STEPS = [{ s: 'Pending', icon: Clock }, { s: 'Shipped', icon: Truck }, { s: 'Delivered', icon: PackageCheck }];

function Inner() {
  const preset = useSearchParams().get('id') || '';
  const { t, num, taka, loc, date } = useLang();
  const [id, setId] = useState(preset);
  const [order, setOrder] = useState(null);
  const [msg, setMsg] = useState(false);

  async function lookup(value) {
    setMsg(false); setOrder(null);
    const { data, error } = await supabase.rpc('track_order', { p_order_no: value });
    if (error || !data?.length) return setMsg(true);
    setOrder(data[0]);
  }
  useEffect(() => { if (preset) lookup(preset); }, [preset]);
  const step = order ? STEPS.findIndex((x) => x.s === order.status) : -1;

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="mb-4 text-2xl font-bold text-teal-dark">{t('tr.title')}</h1>
      <form onSubmit={(e) => { e.preventDefault(); lookup(id); }} className="flex gap-2">
        <input className="input" placeholder={t('tr.ph')} value={id} onChange={(e) => setId(e.target.value)} required />
        <button className="rounded-lg bg-brand px-5 font-bold text-white">{t('tr.btn')}</button>
      </form>
      {msg && <p className="mt-4 text-red-600">{t('tr.none')}</p>}
      {order && (
        <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">{t('tr.order')} <b className="text-brand">{order.order_no}</b> · {date(order.created_at)}</p>
          <div className="my-6 flex items-center justify-between">
            {STEPS.map((x, i) => (
              <div key={x.s} className="flex flex-1 flex-col items-center text-xs">
                <span className={`rounded-full p-3 ${i <= step ? 'bg-teal text-white' : 'bg-gray-100 text-gray-400'}`}><x.icon size={20} /></span>
                <span className={`mt-1 font-semibold ${i <= step ? 'text-teal' : 'text-gray-400'}`}>{t('status.' + x.s)}</span>
              </div>
            ))}
          </div>
          {order.items.map((i) => (
            <div key={i.id} className="flex justify-between border-t py-2 text-sm"><span>{loc(i, 'title')} × {num(i.qty)}</span><span>{taka(i.price * i.qty)}</span></div>
          ))}
          <div className="flex justify-between border-t pt-3 font-bold"><span>{t('co.total')}</span><span className="text-brand">{taka(order.total)}</span></div>
        </div>
      )}
    </div>
  );
}

export default function Track() {
  return <Suspense fallback={null}><Inner /></Suspense>;
}
