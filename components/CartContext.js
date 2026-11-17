'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { salePrice } from '@/lib/utils';

const Ctx = createContext(null);
export const useShop = () => useContext(Ctx);

export function ShopProvider({ children }) {
  const [items, setItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setItems(JSON.parse(localStorage.getItem('cart') || '[]'));
      setWishlist(JSON.parse(localStorage.getItem('wish') || '[]'));
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem('cart', JSON.stringify(items)); }, [items, ready]);
  useEffect(() => { if (ready) localStorage.setItem('wish', JSON.stringify(wishlist)); }, [wishlist, ready]);

  const add = (p, qty = 1, openDrawer = true) => {
    setItems((prev) => {
      const found = prev.find((i) => i.id === p.id);
      if (found) return prev.map((i) => (i.id === p.id ? { ...i, qty: i.qty + qty } : i));
      return [...prev, { id: p.id, title: p.title, title_bn: p.title_bn, image_url: p.image_url, price: salePrice(p), qty }];
    });
    if (openDrawer) setOpen(true);
  };
  const setQty = (id, qty) =>
    setItems((prev) => (qty <= 0 ? prev.filter((i) => i.id !== id) : prev.map((i) => (i.id === id ? { ...i, qty } : i))));
  const clear = () => setItems([]);
  const toggleWish = (id) => setWishlist((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]));

  const count = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);

  return (
    <Ctx.Provider value={{ items, add, setQty, clear, count, subtotal, open, setOpen, wishlist, toggleWish }}>
      {children}
    </Ctx.Provider>
  );
}
