-- Run this whole script in Supabase > SQL Editor
create extension if not exists pgcrypto;

-- ADMINS: only users listed here can manage the shop
create table if not exists admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz default now()
);

create or replace function is_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;

-- PRODUCTS
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,               -- slug: honey, oil-ghee, spices, nuts-seeds ...
  price numeric(10,2) not null check (price >= 0),
  discount_price numeric(10,2) check (discount_price >= 0),
  description text default '',
  image_url text,
  in_stock boolean not null default true,
  featured boolean not null default false,  -- shows in "Top Selling"
  created_at timestamptz default now()
);

-- ORDERS
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_no text unique not null default
    ('GB' || to_char(now(),'YYMMDD') || lpad(floor(random()*100000)::int::text, 5, '0')),
  customer_name text not null,
  phone text not null,
  address text not null,
  payment_method text not null default 'Cash on Delivery',
  payment_ref text,                      -- bKash/Nagad transaction ID
  items jsonb not null,                  -- [{id,title,price,qty}]
  subtotal numeric(10,2) not null,
  delivery_fee numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  status text not null default 'Pending' check (status in ('Pending','Shipped','Delivered')),
  created_at timestamptz default now()
);

alter table products enable row level security;
alter table orders   enable row level security;
alter table admins   enable row level security;

-- products: public read, admin write
create policy "products read"   on products for select using (true);
create policy "products insert" on products for insert with check (is_admin());
create policy "products update" on products for update using (is_admin());
create policy "products delete" on products for delete using (is_admin());

-- orders: anyone can place (always Pending), only admin can read/update/delete
create policy "orders place"  on orders for insert with check (status = 'Pending');
create policy "orders read"   on orders for select using (is_admin());
create policy "orders update" on orders for update using (is_admin());
create policy "orders delete" on orders for delete using (is_admin());

-- admins: a logged-in user can only check their own row
create policy "admins self" on admins for select using (user_id = auth.uid());

-- Public order tracking by Order ID (exposes only safe fields)
create or replace function track_order(p_order_no text)
returns table (order_no text, status text, total numeric, items jsonb, created_at timestamptz, customer_name text)
language sql security definer set search_path = public as $$
  select o.order_no, o.status, o.total, o.items, o.created_at, o.customer_name
  from orders o where upper(o.order_no) = upper(trim(p_order_no)) limit 1;
$$;
grant execute on function track_order(text) to anon, authenticated;

-- Image storage bucket
insert into storage.buckets (id, name, public) values ('product-images','product-images', true)
on conflict (id) do nothing;
create policy "images public read" on storage.objects for select using (bucket_id = 'product-images');
create policy "images admin write" on storage.objects for insert with check (bucket_id = 'product-images' and is_admin());
create policy "images admin update" on storage.objects for update using (bucket_id = 'product-images' and is_admin());
create policy "images admin delete" on storage.objects for delete using (bucket_id = 'product-images' and is_admin());

-- AFTER creating your admin user in Authentication > Users, run (change the email):
-- insert into admins (user_id, email) select id, email from auth.users where email = 'owner@example.com';

-- Lets checkout fetch the order ID just created (most recent order for that phone, last 2 minutes only)
create or replace function latest_order_for(p_phone text)
returns text language sql security definer set search_path = public as $$
  select order_no from orders
  where phone = p_phone and created_at > now() - interval '2 minutes'
  order by created_at desc limit 1;
$$;
grant execute on function latest_order_for(text) to anon, authenticated;
-- Adds Bangla fields for products (safe to run more than once)
alter table products
  add column if not exists title_bn text,
  add column if not exists description_bn text;
