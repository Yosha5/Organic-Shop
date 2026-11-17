'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PackageCheck, Truck, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/components/LangContext';

const STEPS = [{ s: 'Pending', icon: Clock }, { s: 'Shipped', icon: Truck }, { s: 'Delivered', icon: PackageCheck }];

function Inner() {
  const preset = useSearchParams().get('id') || '';
  const { lang, t, num, taka, loc, date } = useLang();
  const [query, setQuery] = useState(preset);
  const [orders, setOrders] = useState([]);
  const [msg, setMsg] = useState(false);
  const [loading, setLoading] = useState(false);

  async function lookup(value) {
    const clean = value.trim();
    if (!clean) return;
    setLoading(true);
    setMsg(false);
    setOrders([]);
    const { data, error } = await supabase.rpc('track_order', { p_order_no: clean });
    setLoading(false);
    if (error || !data?.length) return setMsg(true);
    setOrders(data);
  }

  useEffect(() => { if (preset) lookup(preset); }, [preset]);

  const placeholderText = lang === 'bn'
    ? 'অর্ডার আইডি অথবা মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)'
    : 'Enter Order ID or Phone Number (e.g. 017XXXXXXXX)';

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold text-teal-dark">{t('tr.title')}</h1>
      <p className="mb-4 text-sm text-gray-500">
        {lang === 'bn'
          ? 'অর্ডার আইডি ভুলে গেলে আপনার মোবাইল নম্বর দিয়েই অর্ডারের অবস্থা জানতে পারবেন।'
          : 'Forgot your Order ID? You can track using your phone number.'}
      </p>

      <form onSubmit={(e) => { e.preventDefault(); lookup(query); }} className="flex gap-2">
        <input
          className="input"
          placeholder={placeholderText}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          required
        />
        <button disabled={loading} className="shrink-0 rounded-lg bg-brand px-5 font-bold text-white disabled:opacity-60">
          {loading ? '...' : t('tr.btn')}
        </button>
      </form>

      {msg && <p className="mt-4 text-red-600">{t('tr.none')}</p>}

      <div className="mt-6 space-y-5">
        {orders.map((order) => {
          const step = STEPS.findIndex((x) => x.s === order.status);
          return (
            <div key={order.order_no} className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">
                {t('tr.order')} <b className="text-brand">{order.order_no}</b> · {date(order.created_at)}
              </p>
              <div className="my-6 flex items-center justify-between">
                {STEPS.map((x, i) => (
                  <div key={x.s} className="flex flex-1 flex-col items-center text-xs">
                    <span className={`rounded-full p-3 ${i <= step ? 'bg-teal text-white' : 'bg-gray-100 text-gray-400'}`}>
                      <x.icon size={20} />
                    </span>
                    <span className={`mt-1 font-semibold ${i <= step ? 'text-teal' : 'text-gray-400'}`}>
                      {t('status.' + x.s)}
                    </span>
                  </div>
                ))}
              </div>
              {order.items.map((i) => (
                <div key={i.id} className="flex justify-between border-t py-2 text-sm">
                  <span>{loc(i, 'title')} × {num(i.qty)}</span>
                  <span>{taka(i.price * i.qty)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t pt-3 font-bold">
                <span>{t('co.total')}</span>
                <span className="text-brand">{taka(order.total)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Track() {
  return <Suspense fallback={null}><Inner /></Suspense>;
}