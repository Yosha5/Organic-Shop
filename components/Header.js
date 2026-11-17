'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search, Truck, User, Heart, ShoppingCart, Menu, X, Leaf } from 'lucide-react';
import { useShop } from './CartContext';
import { useLang } from './LangContext';
import LangToggle from './LangToggle';
import { CATEGORIES, FREE_DELIVERY_OVER } from '@/lib/utils';

export default function Header() {
  const { count, setOpen, wishlist } = useShop();
  const { t, num, cat } = useLang();
  const router = useRouter();
  const [q, setQ] = useState('');
  const [menu, setMenu] = useState(false);
  const phone = process.env.NEXT_PUBLIC_SHOP_PHONE || '+8801XXXXXXXXX';

  const submit = (e) => {
    e.preventDefault();
    if (q.trim()) router.push(`/category/all?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <div className="bg-teal-dark py-1 text-center text-xs text-white">{t('topbar', { amt: num(FREE_DELIVERY_OVER), phone: num(phone) })}</div>
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <button className="md:hidden" onClick={() => setMenu(!menu)} aria-label={t('nav.menu')}>{menu ? <X /> : <Menu />}</button>
        <Link href="/" className="flex items-center gap-1 text-2xl font-extrabold text-brand">
          <Leaf className="text-teal" /> {t('brand.a')}<span className="text-teal-dark">{t('brand.b')}</span>
        </Link>
        <form onSubmit={submit} className="mx-4 hidden flex-1 md:flex">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('search.ph')}
            className="w-full rounded-l-lg border border-r-0 border-gray-300 px-4 py-2 outline-none focus:border-brand" />
          <button className="rounded-r-lg bg-brand px-5 text-white hover:bg-brand-dark" aria-label={t('search.btn')}><Search size={18} /></button>
        </form>
        <nav className="ml-auto flex items-center gap-3 text-sm text-gray-700 sm:gap-4">
          <LangToggle className="border-teal text-teal" />
          <Link href="/track" className="hidden items-center gap-1 hover:text-brand lg:flex"><Truck size={18} /> {t('nav.track')}</Link>
          <Link href="/admin/login" className="hidden items-center gap-1 hover:text-brand sm:flex"><User size={18} /> {t('nav.signin')}</Link>
          <span className="relative hidden sm:block" title={t('nav.wishlist')}>
            <Heart size={20} />
            {wishlist.length > 0 && <b className="absolute -right-2 -top-2 rounded-full bg-teal px-1.5 text-[10px] text-white">{num(wishlist.length)}</b>}
          </span>
          <button onClick={() => setOpen(true)} className="relative" aria-label={t('nav.cart')}>
            <ShoppingCart size={22} />
            <b className="absolute -right-2 -top-2 rounded-full bg-brand px-1.5 text-[10px] text-white">{num(count)}</b>
          </button>
        </nav>
      </div>
      <form onSubmit={submit} className="flex px-4 pb-3 md:hidden">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('search.ph2')} className="w-full rounded-l-lg border border-r-0 border-gray-300 px-3 py-2 text-sm outline-none" />
        <button className="rounded-r-lg bg-brand px-4 text-white" aria-label={t('search.btn')}><Search size={16} /></button>
      </form>
      <div className={`${menu ? 'block' : 'hidden'} border-t bg-teal md:block`}>
        <ul className="mx-auto flex max-w-7xl flex-col md:flex-row md:overflow-x-auto">
          {CATEGORIES.map((c) => (
            <li key={c.slug}>
              <Link href={`/category/${c.slug}`} onClick={() => setMenu(false)} className="flex items-center gap-1 whitespace-nowrap px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-dark">
                <c.icon size={15} /> {cat(c)}
              </Link>
            </li>
          ))}
          <li className="md:hidden"><Link href="/track" onClick={() => setMenu(false)} className="block px-4 py-2.5 text-sm text-white">{t('nav.track')}</Link></li>
          <li className="md:hidden"><Link href="/admin/login" onClick={() => setMenu(false)} className="block px-4 py-2.5 text-sm text-white">{t('nav.signin')}</Link></li>
        </ul>
      </div>
    </header>
  );
}
