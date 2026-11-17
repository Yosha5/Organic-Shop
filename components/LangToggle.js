'use client';
import { Languages } from 'lucide-react';
import { useLang } from './LangContext';

export default function LangToggle({ className = '' }) {
  const { lang, setLang } = useLang();
  return (
    <button onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')} aria-label="Language"
      className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${className}`}>
      <Languages size={14} /> {lang === 'bn' ? 'English' : 'বাংলা'}
    </button>
  );
}
