'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLang } from './LangContext';

const SLIDES = [
  { k: 'slide1', href: '/category/honey', bg: 'from-brand to-amber-500' },
  { k: 'slide2', href: '/category/oil-ghee', bg: 'from-teal-dark to-teal' },
  { k: 'slide3', href: '/category/offer-zone', bg: 'from-orange-700 to-brand' },
];

export default function Carousel() {
  const { t } = useLang();
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((x) => (x + 1) % SLIDES.length), 5000);
    return () => clearInterval(id);
  }, []);
  const go = (d) => setI((x) => (x + d + SLIDES.length) % SLIDES.length);

  return (
    <div className="relative mx-auto mt-4 max-w-7xl overflow-hidden rounded-2xl px-4 sm:px-0">
      <div className="flex transition-transform duration-500" style={{ transform: `translateX(-${i * 100}%)` }}>
        {SLIDES.map((s) => (
          <div key={s.k} className={`flex h-44 w-full shrink-0 flex-col justify-center bg-gradient-to-r ${s.bg} px-8 text-white sm:h-64 sm:px-16`}>
            <h2 className="text-2xl font-extrabold sm:text-5xl">{t(s.k + '.t')}</h2>
            <p className="mt-2 text-sm sm:text-lg">{t(s.k + '.s')}</p>
            <Link href={s.href} className="mt-4 w-fit rounded-full bg-white px-5 py-2 text-sm font-bold text-brand">{t('shopNow')}</Link>
          </div>
        ))}
      </div>
      <button onClick={() => go(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5" aria-label="Previous"><ChevronLeft /></button>
      <button onClick={() => go(1)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5" aria-label="Next"><ChevronRight /></button>
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
        {SLIDES.map((_, n) => <span key={n} className={`h-2 w-2 rounded-full ${n === i ? 'bg-white' : 'bg-white/50'}`} />)}
      </div>
    </div>
  );
}
