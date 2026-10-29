-- Phase 2 operational hardening. Apply after 202610290001_ecommerce.sql.
create table if not exists public.order_notes (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade,
  note text not null check (length(trim(note)) > 0), is_customer_visible boolean not null default false,
  created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now()
);
alter table public.order_notes enable row level security;
create policy "admins manage order notes" on public.order_notes for all using (public.is_admin()) with check (public.is_admin());
create policy "customers read visible own notes" on public.order_notes for select using (is_customer_visible and exists (select 1 from public.orders o where o.id=order_id and o.user_id=auth.uid()));

alter table public.orders add column if not exists guest_access_token uuid not null default gen_random_uuid();
create unique index if not exists orders_guest_access_token_idx on public.orders(guest_access_token);
alter table public.coupons add column if not exists category_ids uuid[] not null default '{}';
alter table public.coupons add column if not exists product_ids uuid[] not null default '{}';

create or replace function public.enforce_order_transition() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.status = new.status then return new; end if;
  if not public.is_admin() then raise exception 'Only administrators may change order status'; end if;
  if old.status in ('cancelled','refunded') then raise exception 'A closed order cannot be moved to another status'; end if;
  if new.status not in ('confirmed','processing','packed','shipped','out_for_delivery','delivered','cancelled','returned','refunded') then raise exception 'Invalid order status transition'; end if;
  return new;
end; $$;
drop trigger if exists orders_status_transition on public.orders;
create trigger orders_status_transition before update of status on public.orders for each row execute procedure public.enforce_order_transition();

create or replace function public.restore_stock_on_cancellation() returns trigger language plpgsql security definer set search_path = public as $$
declare item public.order_items;
begin
  if old.status not in ('cancelled','refunded') and new.status in ('cancelled','refunded') then
    for item in select * from public.order_items where order_id=new.id loop
      if item.variant_id is not null then update public.product_variants set stock_quantity=stock_quantity+item.quantity where id=item.variant_id;
      elsif item.product_id is not null then update public.products set stock_quantity=stock_quantity+item.quantity where id=item.product_id; end if;
      insert into public.inventory_adjustments(product_id,variant_id,delta,reason,order_id,changed_by) values(item.product_id,item.variant_id,item.quantity,'order cancellation',new.id,auth.uid());
    end loop;
  end if; return new;
end; $$;
drop trigger if exists restore_order_stock on public.orders;
create trigger restore_order_stock after update of status on public.orders for each row execute procedure public.restore_stock_on_cancellation();

-- Create the bucket once. Object policies keep writes restricted to the profile role check.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values ('product-images','product-images',true,5242880,array['image/jpeg','image/png','image/webp','image/gif']) on conflict (id) do update set public=true;
create policy "public reads product images" on storage.objects for select using (bucket_id='product-images');
create policy "admins upload product images" on storage.objects for insert with check (bucket_id='product-images' and public.is_admin());
create policy "admins update product images" on storage.objects for update using (bucket_id='product-images' and public.is_admin()) with check (bucket_id='product-images' and public.is_admin());
create policy "admins delete product images" on storage.objects for delete using (bucket_id='product-images' and public.is_admin());
