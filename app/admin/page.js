'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Package, ClipboardList, LogOut, Trash2, Pencil } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/components/LangContext';
import LangToggle from '@/components/LangToggle';
import { CATEGORIES, PLACEHOLDER } from '@/lib/utils';

const EMPTY = { title: '', title_bn: '', category: 'honey', price: '', discount_price: '', description: '', description_bn: '', in_stock: true, featured: false, image_url: '' };
const STATUSES = ['Pending', 'Shipped', 'Delivered'];
const CATS = CATEGORIES.filter((c) => c.slug !== 'offer-zone');

export default function AdminDashboard() {
  const router = useRouter();
  const { t, num, taka, loc, cat, date } = useLang();
  const [ok, setOk] = useState(false);
  const [tab, setTab] = useState('overview');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');

  async function load() {
    const [p, o] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
    ]);
    setProducts(p.data || []); setOrders(o.data || []);
  }

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.replace('/admin/login');
      const { data: row } = await supabase.from('admins').select('user_id').eq('user_id', session.user.id).maybeSingle();
      if (!row) { await supabase.auth.signOut(); return router.replace('/admin/login'); }
      setOk(true); load();
    })();
  }, []);

  const logout = async () => { await supabase.auth.signOut(); router.push('/admin/login'); };
  const flash = (m) => { setNote(m); setTimeout(() => setNote(''), 2500); };

  async function saveProduct(e) {
    e.preventDefault(); setBusy(true);
    let image_url = form.image_url;
    if (file) {
      const path = `${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, '_')}`;
      const { error } = await supabase.storage.from('product-images').upload(path, file);
      if (error) { setBusy(false); return flash(t('ad.imgFail') + error.message); }
      image_url = supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl;
    }
    const payload = {
      title: form.title, title_bn: form.title_bn || null, category: form.category, price: Number(form.price),
      discount_price: form.discount_price === '' || form.discount_price == null ? null : Number(form.discount_price),
      description: form.description, description_bn: form.description_bn || null,
      in_stock: form.in_stock, featured: form.featured, image_url,
    };
    const { error } = editId ? await supabase.from('products').update(payload).eq('id', editId) : await supabase.from('products').insert(payload);
    setBusy(false);
    if (error) return flash(t('ad.err') + error.message);
    flash(editId ? t('ad.updated') : t('ad.added'));
    setForm(EMPTY); setEditId(null); setFile(null); load();
  }

  const edit = (p) => {
    setEditId(p.id);
    setForm({ ...EMPTY, ...p, title_bn: p.title_bn || '', description_bn: p.description_bn || '', description: p.description || '', discount_price: p.discount_price ?? '' });
    setFile(null); window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const remove = async (id) => { if (confirm(t('ad.confirmDel'))) { await supabase.from('products').delete().eq('id', id); load(); } };
  const setStatus = async (id, status) => { await supabase.from('orders').update({ status }).eq('id', id); load(); };

  if (!ok) return <p className="py-20 text-center text-gray-500">{t('ad.checking')}</p>;

  const pending = orders.filter((o) => o.status === 'Pending').length;
  const revenue = orders.filter((o) => o.status === 'Delivered').reduce((s, o) => s + Number(o.total), 0);
  const f = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const TABS = [['overview', 'ad.overview', LayoutDashboard], ['products', 'ad.products', Package], ['orders', 'ad.orders', ClipboardList]];

  return (
    <div className="min-h-screen bg-gray-100 md:flex">
      <aside className="bg-teal-dark p-4 text-white md:min-h-screen md:w-56">
        <div className="mb-4 flex items-center justify-between md:block">
          <h1 className="text-xl font-extrabold md:mb-3">{t('ad.panel')}</h1>
          <LangToggle className="border-white/60 text-white" />
        </div>
        <nav className="flex flex-wrap gap-2 md:flex-col">
          {TABS.map(([k, label, Icon]) => (
            <button key={k} onClick={() => setTab(k)} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${tab === k ? 'bg-brand' : 'hover:bg-white/10'}`}>
              <Icon size={16} /> {t(label)}
            </button>
          ))}
          <button onClick={logout} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-white/10 md:mt-6"><LogOut size={16} /> {t('ad.logout')}</button>
        </nav>
      </aside>

      <main className="min-w-0 flex-1 p-4 md:p-8">
        {note && <div className="fixed right-4 top-4 z-50 rounded-lg bg-teal px-4 py-2 text-white shadow">{note}</div>}

        {tab === 'overview' && (
          <div className="grid gap-4 sm:grid-cols-3">
            {[[t('ad.totalOrders'), num(orders.length), 'text-teal-dark'], [t('ad.pending'), num(pending), 'text-brand'], [t('ad.revenue'), taka(revenue), 'text-teal']].map(([l, v, c]) => (
              <div key={l} className="rounded-2xl bg-white p-6 shadow-sm"><p className="text-sm text-gray-500">{l}</p><p className={`mt-1 text-3xl font-extrabold ${c}`}>{v}</p></div>
            ))}
            <div className="rounded-2xl bg-white p-6 shadow-sm sm:col-span-3"><p className="text-sm text-gray-500">{t('ad.listed')}: <b>{num(products.length)}</b></p></div>
          </div>
        )}

        {tab === 'products' && (
          <div className="space-y-6">
            <form onSubmit={saveProduct} className="grid gap-4 rounded-2xl bg-white p-5 shadow-sm md:grid-cols-2">
              <h2 className="text-lg font-bold text-teal-dark md:col-span-2">{editId ? t('ad.editProd') : t('ad.addNew')}</h2>
              <div><label className="label">{t('ad.title')} *</label><input required className="input" value={form.title} onChange={f('title')} /></div>
              <div><label className="label">{t('ad.titleBn')}</label><input className="input" value={form.title_bn} onChange={f('title_bn')} /></div>
              <div><label className="label">{t('ad.category')} *</label>
                <select className="input" value={form.category} onChange={f('category')}>{CATS.map((c) => <option key={c.slug} value={c.slug}>{cat(c)}</option>)}</select></div>
              <div><label className="label">{t('ad.price')} *</label><input required type="number" min="0" className="input" value={form.price} onChange={f('price')} /></div>
              <div><label className="label">{t('ad.discount')}</label><input type="number" min="0" className="input" value={form.discount_price} onChange={f('discount_price')} /></div>
              <div><label className="label">{t('ad.image')}</label><input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="text-sm" />
                {form.image_url && !file && <img src={form.image_url} alt="" className="mt-2 h-16 w-16 rounded object-cover" />}</div>
              <div><label className="label">{t('ad.desc')}</label><textarea rows={3} className="input" value={form.description} onChange={f('description')} /></div>
              <div><label className="label">{t('ad.descBn')}</label><textarea rows={3} className="input" value={form.description_bn} onChange={f('description_bn')} /></div>
              <div className="flex items-center gap-6 text-sm md:col-span-2">
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.in_stock} onChange={f('in_stock')} /> {t('ad.inStock')}</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.featured} onChange={f('featured')} /> {t('ad.featured')}</label>
              </div>
              <div className="flex gap-2 md:col-span-2">
                <button disabled={busy} className="rounded-lg bg-brand px-6 py-2 font-bold text-white disabled:opacity-60">{busy ? t('ad.saving') : editId ? t('ad.update') : t('ad.add')}</button>
                {editId && <button type="button" onClick={() => { setEditId(null); setForm(EMPTY); }} className="rounded-lg border px-6 py-2">{t('ad.cancel')}</button>}
              </div>
            </form>

            <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-teal-light text-teal-dark"><tr><th className="p-3">{t('ad.thProduct')}</th><th>{t('ad.category')}</th><th>{t('ad.price').replace(' (৳)', '')}</th><th>{t('ad.thStock')}</th><th></th></tr></thead>
                <tbody>
                  {products.map((p) => {
                    const c = CATEGORIES.find((x) => x.slug === p.category);
                    return (
                      <tr key={p.id} className="border-t">
                        <td className="flex items-center gap-2 p-3"><img src={p.image_url || PLACEHOLDER} alt="" className="h-10 w-10 rounded object-cover" />{loc(p, 'title')}</td>
                        <td>{c ? cat(c) : p.category}</td>
                        <td>{p.discount_price ? <><b className="text-brand">{taka(p.discount_price)}</b> <s className="text-gray-400">{taka(p.price)}</s></> : taka(p.price)}</td>
                        <td>{p.in_stock ? t('ad.inStock') : t('ad.out')}</td>
                        <td className="space-x-3 pr-3 text-right">
                          <button onClick={() => edit(p)} className="text-teal"><Pencil size={16} /></button>
                          <button onClick={() => remove(p.id)} className="text-red-500"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-teal-light text-teal-dark"><tr><th className="p-3">{t('ad.thOrder')}</th><th>{t('ad.thCustomer')}</th><th>{t('ad.thItems')}</th><th>{t('ad.thTotal')}</th><th>{t('ad.thStatus')}</th></tr></thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t align-top">
                    <td className="p-3"><b>{o.order_no}</b><br /><span className="text-xs text-gray-500">{date(o.created_at, true)}</span></td>
                    <td><b>{o.customer_name}</b><br /><a href={`tel:${o.phone}`} className="text-brand">{o.phone}</a><br /><span className="text-xs text-gray-600">{o.address}</span></td>
                    <td>{o.items.map((i) => <div key={i.id}>{loc(i, 'title')} × {num(i.qty)}</div>)}</td>
                    <td><b>{taka(o.total)}</b><br /><span className="text-xs">{t('pay.' + o.payment_method)}{o.payment_ref ? ` (${o.payment_ref})` : ''}</span></td>
                    <td className="pr-3">
                      <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)}
                        className={`rounded-lg border px-2 py-1 font-semibold ${o.status === 'Delivered' ? 'text-teal' : o.status === 'Shipped' ? 'text-blue-600' : 'text-brand'}`}>
                        {STATUSES.map((s) => <option key={s} value={s}>{t('status.' + s)}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && <p className="p-6 text-center text-gray-500">{t('ad.noOrders')}</p>}
          </div>
        )}
      </main>
    </div>
  );
}
