'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { DICT, DEFAULT_LANG } from '@/lib/i18n';

const Ctx = createContext(null);
export const useLang = () => useContext(Ctx);
const BN = '০১২৩৪৫৬৭৮৯';

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(DEFAULT_LANG);

  useEffect(() => {
    try { const s = localStorage.getItem('lang'); if (s === 'en' || s === 'bn') setLangState(s); } catch {}
  }, []);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  const setLang = (l) => { setLangState(l); try { localStorage.setItem('lang', l); } catch {} };
  const num = (v) => String(v).replace(/\d/g, (d) => (lang === 'bn' ? BN[d] : d));
  const t = (key, vars = {}) => {
    let s = DICT[lang][key] ?? DICT.en[key] ?? key;
    for (const k in vars) s = s.replaceAll(`{${k}}`, typeof vars[k] === 'number' ? num(vars[k]) : vars[k]);
    return s;
  };
  const taka = (n) => '৳' + num(Number(n || 0).toLocaleString('en-IN'));
  const loc = (o, f) => (lang === 'bn' && o?.[f + '_bn'] ? o[f + '_bn'] : o?.[f]);
  const cat = (c) => (lang === 'bn' ? c.bn : c.name);
  const date = (d, time) => num(new Date(d)[time ? 'toLocaleString' : 'toLocaleDateString']('en-GB'));

  return <Ctx.Provider value={{ lang, setLang, t, num, taka, loc, cat, date }}>{children}</Ctx.Provider>;
}
