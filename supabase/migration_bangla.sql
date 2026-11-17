-- Adds Bangla fields for products (safe to run more than once)
alter table products
  add column if not exists title_bn text,
  add column if not exists description_bn text;
