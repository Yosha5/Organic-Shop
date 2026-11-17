'use client';
import Link from 'next/link';
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube, Leaf } from 'lucide-react';
import { useLang } from './LangContext';
import { CATEGORIES } from '@/lib/utils';

export default function Footer() {
  const { t, num, cat } = useLang();
  const phone = process.env.NEXT_PUBLIC_SHOP_PHONE || '+8801XXXXXXXXX';
  return (
    <footer className="mt-10 bg-teal-dark text-sm text-teal-light">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="mb-3 flex items-center gap-1 text-2xl font-extrabold text-white"><Leaf /> {t('brand.a')}{t('brand.b')}</div>
          <p>{t('footer.tagline')}</p>
          <div className="mt-4 flex gap-3">
            <a href="#" aria-label="Facebook"><Facebook /></a>
            <a href="#" aria-label="Instagram"><Instagram /></a>
            <a href="#" aria-label="YouTube"><Youtube /></a>
          </div>
        </div>
        <div>
          <h4 className="mb-3 font-bold text-white">{t('footer.contact')}</h4>
          <p className="mb-2 flex gap-2"><Phone size={16} /> {num(phone)}</p>
          <p className="mb-2 flex gap-2"><Mail size={16} /> support@organicbazar.com</p>
          <p className="flex gap-2"><MapPin size={16} /> {t('footer.address')}</p>
        </div>
        <div>
          <h4 className="mb-3 font-bold text-white">{t('footer.policies')}</h4>
          <ul className="space-y-2">
            <li><a href="#">{t('footer.privacy')}</a></li>
            <li><a href="#">{t('footer.terms')}</a></li>
            <li><a href="#">{t('footer.refund')}</a></li>
            <li><a href="#">{t('footer.deliveryPolicy')}</a></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-bold text-white">{t('footer.quick')}</h4>
          <ul className="space-y-2">
            <li><Link href="/track">{t('nav.track')}</Link></li>
            <li><Link href="/category/offer-zone">{cat(CATEGORIES[0])}</Link></li>
            <li><Link href="/checkout">{t('footer.checkout')}</Link></li>
          </ul>
          <p className="mt-4 text-xs">{t('footer.accept')}</p>
        </div>
      </div>
      <div className="bg-black/20 py-3 text-center text-xs">© {num(new Date().getFullYear())} {t('brand.a')}{t('brand.b')}. {t('footer.rights')}</div>
    </footer>
  );
}
