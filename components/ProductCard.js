'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingCart } from 'lucide-react';
import { useShop } from './CartContext';
import { useLang } from './LangContext';
import { salePrice, discountPct, PLACEHOLDER } from '@/lib/utils';

export default function ProductCard({ p }) {
  const { add, wishlist, toggleWish } = useShop();
  const { t, num, taka, loc } = useLang();
  const router = useRouter();
  const pct = discountPct(p);
  const liked = wishlist.includes(p.id);
  const title = loc(p, 'title');

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md">
      {pct > 0 && <span className="absolute left-2 top-2 z-10 rounded-full bg-brand px-2 py-0.5 text-xs font-bold text-white">-{num(pct)}%</span>}
      <button onClick={() => toggleWish(p.id)} aria-label={t('nav.wishlist')} className="absolute right-2 top-2 z-10 rounded-full bg-white/90 p-1.5 shadow">
        <Heart size={16} className={liked ? 'fill-brand text-brand' : 'text-gray-500'} />
      </button>
      <Link href={`/product/${p.id}`} className="block aspect-square overflow-hidden bg-brand-light">
        <img src={p.image_url || PLACEHOLDER} alt={title} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link href={`/product/${p.id}`} className="line-clamp-2 min-h-[2.5rem] text-sm font-medium text-gray-800 hover:text-brand">{title}</Link>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-brand">{taka(salePrice(p))}</span>
          {pct > 0 && <span className="text-sm text-gray-400 line-through">{taka(p.price)}</span>}
        </div>
        {p.in_stock ? (
          <div className="mt-auto grid grid-cols-2 gap-2">
            <button onClick={() => add(p)} className="flex items-center justify-center gap-1 rounded-lg border border-teal px-1 py-2 text-xs font-semibold text-teal hover:bg-teal hover:text-white">
              <ShoppingCart size={14} /> {t('card.add')}
            </button>
            <button onClick={() => { add(p, 1, false); router.push('/checkout'); }} className="rounded-lg bg-brand px-1 py-2 text-xs font-semibold text-white hover:bg-brand-dark">
              {t('card.buy')}
            </button>
          </div>
        ) : (
          <div className="mt-auto rounded-lg bg-gray-100 py-2 text-center text-xs font-semibold text-gray-500">{t('card.out')}</div>
        )}
      </div>
    </div>
  );
}
