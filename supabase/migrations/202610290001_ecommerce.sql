-- SHOP.CO / BERRY shared backend. Apply with `supabase db push` or the Supabase SQL editor.
create extension if not exists pgcrypto;

create type public.app_role as enum ('super_admin', 'admin', 'staff', 'customer');
create type public.product_status as enum ('draft', 'published', 'archived');
create type public.order_status as enum ('pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned', 'refunded');
create type public.payment_status as enum ('pending', 'paid', 'failed', 'refunded');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '', phone text, role public.app_role not null default 'customer',
  status text not null default 'active' check (status in ('active', 'suspended')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.categories (
  id uuid primary key default gen_random_uuid(), parent_id uuid references public.categories(id) on delete restrict,
  name text not null, slug text not null unique, description text, image_url text, display_order integer not null default 0,
  is_active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.products (
  id uuid primary key default gen_random_uuid(), category_id uuid not null references public.categories(id) on delete restrict,
  name text not null, slug text not null unique, sku text not null unique, description text not null default '', short_description text,
  regular_price numeric(12,2) not null check (regular_price >= 0), sale_price numeric(12,2) check (sale_price is null or (sale_price >= 0 and sale_price <= regular_price)),
  cost_price numeric(12,2), currency text not null default 'USD', stock_quantity integer not null default 0 check (stock_quantity >= 0),
  low_stock_threshold integer not null default 5 check (low_stock_threshold >= 0), status public.product_status not null default 'draft', visibility boolean not null default true,
  featured boolean not null default false, new_arrival boolean not null default false, best_seller boolean not null default false, rating numeric(2,1) not null default 0 check (rating >= 0 and rating <= 5),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.product_variants (
  id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade,
  sku text unique, size text, color text, price_override numeric(12,2) check (price_override is null or price_override >= 0), stock_quantity integer not null default 0 check (stock_quantity >= 0),
  created_at timestamptz not null default now(), unique nulls not distinct (product_id, size, color)
);
create table public.product_images (
  id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade,
  url text not null, storage_path text, alt_text text, position integer not null default 0, created_at timestamptz not null default now()
);
create table public.coupons (
  id uuid primary key default gen_random_uuid(), code text not null unique, discount_type text not null check (discount_type in ('percent', 'fixed')),
  amount numeric(12,2) not null check (amount > 0), minimum_order_amount numeric(12,2) not null default 0, maximum_discount numeric(12,2), starts_at timestamptz, expires_at timestamptz,
  usage_limit integer, per_customer_limit integer, usage_count integer not null default 0, is_active boolean not null default true, created_at timestamptz not null default now()
);
create table public.orders (
  id uuid primary key default gen_random_uuid(), order_number bigint generated always as identity unique,
  user_id uuid references auth.users(id) on delete set null, customer_name text not null, customer_email text not null, customer_phone text,
  shipping_address jsonb not null default '{}'::jsonb, status public.order_status not null default 'pending', payment_method text not null default 'cod', payment_status public.payment_status not null default 'pending',
  subtotal numeric(12,2) not null, discount_amount numeric(12,2) not null default 0, shipping_fee numeric(12,2) not null default 0, tax_amount numeric(12,2) not null default 0, total_amount numeric(12,2) not null,
  coupon_id uuid references public.coupons(id) on delete set null, idempotency_key uuid not null unique, tracking_number text, courier text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.order_items (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null, variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null, product_sku text, image_url text, selected_size text, selected_color text, quantity integer not null check (quantity > 0), unit_price numeric(12,2) not null, line_total numeric(12,2) not null
);
create table public.order_status_history (id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade, status public.order_status not null, note text, changed_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now());
create table public.inventory_adjustments (id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade, variant_id uuid references public.product_variants(id) on delete cascade, delta integer not null, reason text not null, order_id uuid references public.orders(id) on delete set null, changed_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now());
create table public.newsletter_subscribers (id uuid primary key default gen_random_uuid(), email text not null unique, status text not null default 'active' check (status in ('active', 'unsubscribed')), consent_at timestamptz not null default now(), unsubscribed_at timestamptz, created_at timestamptz not null default now());
create table public.store_settings (key text primary key, value jsonb not null, updated_at timestamptz not null default now(), updated_by uuid references auth.users(id) on delete set null);
create index products_public_idx on public.products(status, visibility, category_id); create index orders_user_idx on public.orders(user_id, created_at desc); create index orders_status_idx on public.orders(status, created_at desc);

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$ select exists (select 1 from public.profiles where id = auth.uid() and role in ('super_admin','admin','staff') and status = 'active') $$;
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$ begin insert into public.profiles(id, full_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name','')); return new; end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
create or replace function public.set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
create trigger products_updated before update on public.products for each row execute procedure public.set_updated_at(); create trigger profiles_updated before update on public.profiles for each row execute procedure public.set_updated_at(); create trigger orders_updated before update on public.orders for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security; alter table public.categories enable row level security; alter table public.products enable row level security; alter table public.product_variants enable row level security; alter table public.product_images enable row level security; alter table public.coupons enable row level security; alter table public.orders enable row level security; alter table public.order_items enable row level security; alter table public.order_status_history enable row level security; alter table public.inventory_adjustments enable row level security; alter table public.newsletter_subscribers enable row level security; alter table public.store_settings enable row level security;
create policy "profiles own or admin" on public.profiles for select using (id = auth.uid() or public.is_admin()); create policy "admin profiles" on public.profiles for update using (public.is_admin()) with check (public.is_admin());
create policy "public active categories" on public.categories for select using (is_active or public.is_admin()); create policy "admin categories" on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy "public catalog" on public.products for select using ((status = 'published' and visibility) or public.is_admin()); create policy "admin catalog" on public.products for all using (public.is_admin()) with check (public.is_admin());
create policy "public variants" on public.product_variants for select using (exists(select 1 from public.products p where p.id=product_id and ((p.status='published' and p.visibility) or public.is_admin()))); create policy "admin variants" on public.product_variants for all using (public.is_admin()) with check (public.is_admin());
create policy "public images" on public.product_images for select using (exists(select 1 from public.products p where p.id=product_id and ((p.status='published' and p.visibility) or public.is_admin()))); create policy "admin images" on public.product_images for all using (public.is_admin()) with check (public.is_admin());
create policy "admin coupons" on public.coupons for all using (public.is_admin()) with check (public.is_admin());
create policy "orders own or admin" on public.orders for select using (user_id = auth.uid() or public.is_admin()); create policy "admin order updates" on public.orders for update using (public.is_admin()) with check (public.is_admin());
create policy "items own or admin" on public.order_items for select using (public.is_admin() or exists(select 1 from public.orders o where o.id=order_id and o.user_id=auth.uid())); create policy "admin order items" on public.order_items for all using (public.is_admin()) with check (public.is_admin());
create policy "admin histories" on public.order_status_history for all using (public.is_admin()) with check (public.is_admin()); create policy "admin inventory" on public.inventory_adjustments for all using (public.is_admin()) with check (public.is_admin());
create policy "newsletter insert" on public.newsletter_subscribers for insert with check (status='active'); create policy "admin newsletter" on public.newsletter_subscribers for select using (public.is_admin()); create policy "public settings" on public.store_settings for select using (true); create policy "admin settings" on public.store_settings for all using (public.is_admin()) with check (public.is_admin());

create or replace function public.validate_coupon(p_code text, p_subtotal numeric, p_items jsonb default '[]') returns jsonb language plpgsql security definer set search_path = public as $$ declare c public.coupons; discount numeric := 0; begin select * into c from public.coupons where upper(code)=upper(trim(p_code)) and is_active and (starts_at is null or starts_at <= now()) and (expires_at is null or expires_at > now()) and (usage_limit is null or usage_count < usage_limit); if not found then return jsonb_build_object('valid',false,'message','Coupon is not available.'); end if; if p_subtotal < c.minimum_order_amount then return jsonb_build_object('valid',false,'message','Minimum order amount has not been reached.'); end if; discount := case when c.discount_type='percent' then round(p_subtotal*c.amount/100,2) else c.amount end; if c.maximum_discount is not null then discount := least(discount,c.maximum_discount); end if; return jsonb_build_object('valid',true,'coupon_id',c.id,'code',c.code,'discount',least(discount,p_subtotal)); end; $$;

create or replace function public.place_order(p_checkout jsonb) returns jsonb language plpgsql security definer set search_path = public as $$ declare v_order public.orders; v_item jsonb; v_product public.products; v_variant public.product_variants; v_subtotal numeric := 0; v_discount numeric := 0; v_shipping numeric := 15; v_coupon jsonb; v_key uuid; begin
  v_key := (p_checkout->>'idempotency_key')::uuid; if exists(select 1 from public.orders where idempotency_key=v_key) then select * into v_order from public.orders where idempotency_key=v_key; return jsonb_build_object('order_id',v_order.id,'order_number',v_order.order_number,'duplicate',true); end if;
  for v_item in select * from jsonb_array_elements(coalesce(p_checkout->'items','[]'::jsonb)) loop
    select * into v_product from public.products where id=(v_item->>'product_id')::uuid and status='published' and visibility for update; if not found then raise exception 'A product is no longer available.'; end if;
    if v_item ? 'variant_id' and nullif(v_item->>'variant_id','') is not null then select * into v_variant from public.product_variants where id=(v_item->>'variant_id')::uuid and product_id=v_product.id for update; if not found or v_variant.stock_quantity < (v_item->>'quantity')::int then raise exception 'The selected variant is out of stock.'; end if; else v_variant := null; if v_product.stock_quantity < (v_item->>'quantity')::int then raise exception 'Insufficient stock for %',v_product.name; end if; end if;
    v_subtotal := v_subtotal + coalesce(v_variant.price_override, v_product.sale_price, v_product.regular_price) * (v_item->>'quantity')::int;
  end loop;
  if jsonb_array_length(coalesce(p_checkout->'items','[]'::jsonb))=0 then raise exception 'Your cart is empty.'; end if;
  if coalesce(p_checkout->>'coupon_code','') <> '' then v_coupon := public.validate_coupon(p_checkout->>'coupon_code',v_subtotal,p_checkout->'items'); if coalesce((v_coupon->>'valid')::boolean,false) then v_discount := (v_coupon->>'discount')::numeric; end if; end if;
  if v_subtotal >= 200 then v_shipping := 0; end if;
  insert into public.orders(user_id,customer_name,customer_email,customer_phone,shipping_address,subtotal,discount_amount,shipping_fee,total_amount,coupon_id,idempotency_key) values (auth.uid(),p_checkout->>'customer_name',p_checkout->>'customer_email',p_checkout->>'customer_phone',coalesce(p_checkout->'shipping_address','{}'),v_subtotal,v_discount,v_shipping,v_subtotal-v_discount+v_shipping,nullif(v_coupon->>'coupon_id','')::uuid,v_key) returning * into v_order;
  for v_item in select * from jsonb_array_elements(p_checkout->'items') loop select * into v_product from public.products where id=(v_item->>'product_id')::uuid for update; if v_item ? 'variant_id' and nullif(v_item->>'variant_id','') is not null then select * into v_variant from public.product_variants where id=(v_item->>'variant_id')::uuid for update; update public.product_variants set stock_quantity=stock_quantity-(v_item->>'quantity')::int where id=v_variant.id; else v_variant:=null; update public.products set stock_quantity=stock_quantity-(v_item->>'quantity')::int where id=v_product.id; end if; insert into public.order_items(order_id,product_id,variant_id,product_name,product_sku,image_url,selected_size,selected_color,quantity,unit_price,line_total) values(v_order.id,v_product.id,v_variant.id,v_product.name,coalesce(v_variant.sku,v_product.sku),(select url from public.product_images where product_id=v_product.id order by position limit 1),v_item->>'size',v_item->>'color',(v_item->>'quantity')::int,coalesce(v_variant.price_override,v_product.sale_price,v_product.regular_price),coalesce(v_variant.price_override,v_product.sale_price,v_product.regular_price)*(v_item->>'quantity')::int); insert into public.inventory_adjustments(product_id,variant_id,delta,reason,order_id) values(v_product.id,v_variant.id,-(v_item->>'quantity')::int,'order',v_order.id); end loop;
  if v_coupon ? 'coupon_id' then update public.coupons set usage_count=usage_count+1 where id=(v_coupon->>'coupon_id')::uuid; end if; insert into public.order_status_history(order_id,status,note,changed_by) values(v_order.id,'pending','Order placed',auth.uid()); return jsonb_build_object('order_id',v_order.id,'order_number',v_order.order_number,'total',v_order.total_amount); end; $$;

create or replace function public.admin_dashboard(p_period text default '30d') returns jsonb language sql security definer set search_path = public as $$ select jsonb_build_object('total_revenue',coalesce(sum(total_amount) filter(where status not in ('cancelled','refunded')),0),'total_orders',count(*),'pending_orders',count(*) filter(where status='pending'),'completed_orders',count(*) filter(where status='delivered'),'average_order_value',coalesce(avg(total_amount) filter(where status not in ('cancelled','refunded')),0),'low_stock_products',(select count(*) from products where stock_quantity <= low_stock_threshold and status='published'),'recent_orders',coalesce(jsonb_agg(jsonb_build_object('id',id,'order_number',order_number,'customer_name',customer_name,'total_amount',total_amount) order by created_at desc) filter(where true),'[]'::jsonb)) from (select * from orders where created_at >= now() - case p_period when '7d' then interval '7 days' when 'today' then interval '1 day' when 'year' then interval '1 year' else interval '30 days' end) o where public.is_admin() $$;
create or replace function public.admin_customers() returns jsonb language sql security definer set search_path = public as $$ select coalesce(jsonb_agg(row_to_json(x)),'[]') from (select p.id,p.full_name,p.phone,p.created_at,au.email,count(o.id) as orders,coalesce(sum(o.total_amount) filter(where o.status not in ('cancelled','refunded')),0) as spent,max(o.created_at) as last_order_date from profiles p join auth.users au on au.id=p.id left join orders o on o.user_id=p.id where p.role='customer' group by p.id,au.email) x where public.is_admin() $$;

-- Storage setup (run once in SQL editor): insert into storage.buckets(id,name,public) values ('product-images','product-images',true) on conflict do nothing;
-- Create first admin only after signup: update public.profiles set role='super_admin' where id = '<auth-user-uuid>';
