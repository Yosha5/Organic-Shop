'use client';
import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useShop } from '@/components/CartContext';
import { useLang } from '@/components/LangContext';
import { FREE_DELIVERY_OVER } from '@/lib/utils';

const PAYMENTS = ['Cash on Delivery', 'bKash', 'Nagad']; // stored in English in the database

export default function Checkout() {
  const { items, subtotal, clear } = useShop();
  const { t, num, taka, loc } = useLang();
  const [f, setF] = useState({ name: '', phone: '', address: '', area: 'dhaka', payment: 'Cash on Delivery', ref: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(null);

  const fee = f.area === 'dhaka' ? 60 : 120;
  const delivery = items.length ? (subtotal >= FREE_DELIVERY_OVER ? 0 : fee) : 0;
  const total = subtotal + delivery;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const phone = process.env.NEXT_PUBLIC_SHOP_PHONE || '01XXXXXXXXX';

  async function submit(e) {
    e.preventDefault();
    setErr('');
    if (!/^01[3-9]\d{8}$/.test(f.phone.replace(/[\s-]/g, ''))) return setErr(t('co.errPhone'));
    if (f.payment !== 'Cash on Delivery' && !f.ref.trim()) return setErr(t('co.errTxn'));
    setBusy(true);
    const { error } = await supabase.from('orders').insert({
      customer_name: f.name.trim(), phone: f.phone.trim(), address: f.address.trim(),
      payment_method: f.payment, payment_ref: f.ref.trim() || null,
      items: items.map((i) => ({ id: i.id, title: i.title, title_bn: i.title_bn || null, price: i.price, qty: i.qty })),
      subtotal, delivery_fee: delivery, total,
    });
    if (error) { setBusy(false); return setErr(t('co.errFail')); }
    const { data } = await supabase.rpc('latest_order_for', { p_phone: f.phone.trim() });
    setDone(data || 'OK');
    clear();
    setBusy(false);
  }

  if (done)
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <CheckCircle2 className="mx-auto text-teal" size={64} />
        <h1 className="mt-4 text-2xl font-bold text-teal-dark">{t('done.title')}</h1>
        <p className="mt-2 text-gray-600">{t('done.id')}</p>
        <p className="my-2 rounded-lg bg-brand-light py-3 text-2xl font-extrabold tracking-wider text-brand">{done}</p>
        <p className="text-sm text-gray-500">{t('done.hint')}</p>
        <Link href={`/track?id=${done}`} className="mt-6 inline-block rounded-lg bg-brand px-6 py-3 font-bold text-white">{t('nav.track')}</Link>
      </div>
    );

  if (!items.length)
    return <p className="py-20 text-center text-gray-500">{t('co.empty')} <Link href="/" className="text-brand underline">{t('co.continue')}</Link></p>;

  return (
    <form onSubmit={submit} className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-5">
      <div className="space-y-4 rounded-2xl bg-white p-5 shadow-sm md:col-span-3">
        <h2 className="text-lg font-bold text-teal-dark">{t('co.details')}</h2>
        <div><label className="label">{t('co.name')} *</label><input required className="input" value={f.name} onChange={set('name')} /></div>
        <div><label className="label">{t('co.phone')} *</label><input required inputMode="tel" className="input" placeholder="01XXXXXXXXX" value={f.phone} onChange={set('phone')} /></div>
        <div><label className="label">{t('co.address')} *</label><textarea required rows={3} className="input" value={f.address} onChange={set('address')} /></div>
        <div>
          <label className="label">{t('co.area')}</label>
          <select className="input" value={f.area} onChange={set('area')}>
            <option value="dhaka">{t('co.dhaka', { fee: taka(60) })}</option>
            <option value="outside">{t('co.outside', { fee: taka(120) })}</option>
          </select>
        </div>
        <h2 className="pt-2 text-lg font-bold text-teal-dark">{t('co.payment')}</h2>
        <div className="grid gap-2 sm:grid-cols-3">
          {PAYMENTS.map((m) => (
            <label key={m} className={`cursor-pointer rounded-lg border-2 p-3 text-center text-sm font-semibold ${f.payment === m ? 'border-brand bg-brand-light text-brand' : 'border-gray-200'}`}>
              <input type="radio" name="pay" className="hidden" checked={f.payment === m} onChange={() => setF({ ...f, payment: m })} />{t('pay.' + m)}
            </label>
          ))}
        </div>
        {f.payment !== 'Cash on Delivery' && (
          <div className="rounded-lg bg-teal-light p-3 text-sm">
            <p>{t('co.send', { amt: taka(total), method: t('pay.' + f.payment), phone: num(phone) })}</p>
            <input className="input mt-2" placeholder={t('co.txn')} value={f.ref} onChange={set('ref')} />
          </div>
        )}
        {err && <p className="rounded bg-red-50 p-2 text-sm text-red-600">{err}</p>}
      </div>
      <div className="h-fit space-y-3 rounded-2xl bg-white p-5 shadow-sm md:col-span-2">
        <h2 className="text-lg font-bold text-teal-dark">{t('co.summary')}</h2>
        {items.map((i) => (
          <div key={i.id} className="flex justify-between gap-2 text-sm"><span>{loc(i, 'title')} × {num(i.qty)}</span><span>{taka(i.price * i.qty)}</span></div>
        ))}
        <hr />
        <div className="flex justify-between text-sm"><span>{t('cart.subtotal')}</span><span>{taka(subtotal)}</span></div>
        <div className="flex justify-between text-sm"><span>{t('co.delivery')}</span><span>{delivery ? taka(delivery) : t('co.free')}</span></div>
        <div className="flex justify-between text-lg font-extrabold"><span>{t('co.total')}</span><span className="text-brand">{taka(total)}</span></div>
        <button disabled={busy} className="w-full rounded-lg bg-brand py-3 font-bold text-white hover:bg-brand-dark disabled:opacity-60">{busy ? t('co.placing') : t('co.confirm')}</button>
      </div>
    </form>
  );
}
