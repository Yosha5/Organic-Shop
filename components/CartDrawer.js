'use client';
import Link from 'next/link';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useShop } from './CartContext';
import { useLang } from './LangContext';
import { PLACEHOLDER } from '@/lib/utils';

export default function CartDrawer() {
  const { open, setOpen, items, setQty, subtotal, count } = useShop();
  const { t, num, taka, loc } = useLang();
  return (
    <>
      <div onClick={() => setOpen(false)} className={`fixed inset-0 z-50 bg-black/40 transition ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`} />
      <aside className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-xl transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between bg-teal px-4 py-3 text-white">
          <h3 className="flex items-center gap-2 font-bold"><ShoppingBag size={18} /> {t('cart.title')} ({num(count)})</h3>
          <button onClick={() => setOpen(false)} aria-label="Close"><X /></button>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {items.length === 0 && <p className="mt-10 text-center text-gray-500">{t('cart.empty')}</p>}
          {items.map((i) => (
            <div key={i.id} className="flex gap-3 border-b pb-3">
              <img src={i.image_url || PLACEHOLDER} alt="" className="h-16 w-16 rounded-lg object-cover" />
              <div className="flex-1">
                <p className="line-clamp-2 text-sm font-medium">{loc(i, 'title')}</p>
                <p className="text-sm font-bold text-brand">{taka(i.price)}</p>
                <div className="mt-1 flex items-center gap-2">
                  <button onClick={() => setQty(i.id, i.qty - 1)} className="rounded border p-1"><Minus size={12} /></button>
                  <span className="w-6 text-center text-sm">{num(i.qty)}</span>
                  <button onClick={() => setQty(i.id, i.qty + 1)} className="rounded border p-1"><Plus size={12} /></button>
                  <button onClick={() => setQty(i.id, 0)} className="ml-auto text-red-500"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t p-4">
          <div className="mb-3 flex justify-between font-bold"><span>{t('cart.subtotal')}</span><span className="text-brand">{taka(subtotal)}</span></div>
          <Link href="/checkout" onClick={() => setOpen(false)}
            className={`block rounded-lg bg-brand py-3 text-center font-bold text-white hover:bg-brand-dark ${items.length ? '' : 'pointer-events-none opacity-50'}`}>
            {t('cart.checkout')}
          </Link>
        </div>
      </aside>
    </>
  );
}
