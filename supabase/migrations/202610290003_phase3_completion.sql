-- Phase 3: customer portal, private order details and reporting.
create table public.customer_addresses (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default 'Home', recipient_name text not null, phone text, address_line1 text not null, address_line2 text,
  city text not null, region text, postal_code text, country text not null, is_default boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create unique index customer_addresses_one_default_idx on public.customer_addresses(user_id) where is_default;
create trigger addresses_updated before update on public.customer_addresses for each row execute procedure public.set_updated_at();
alter table public.customer_addresses enable row level security;
create policy "customers manage own addresses" on public.customer_addresses for all using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy "admins read addresses" on public.customer_addresses for select using (public.is_admin());

create or replace function public.set_default_address(p_address_id uuid) returns void language plpgsql security definer set search_path=public as $$
begin
  if not exists(select 1 from customer_addresses where id=p_address_id and user_id=auth.uid()) then raise exception 'Address not found'; end if;
  update customer_addresses set is_default=false where user_id=auth.uid(); update customer_addresses set is_default=true where id=p_address_id and user_id=auth.uid();
end; $$;

create or replace function public.customer_order_detail(p_order_id uuid) returns jsonb language plpgsql security definer set search_path=public as $$
declare result jsonb;
begin
  select jsonb_build_object('order',to_jsonb(o),'items',coalesce((select jsonb_agg(to_jsonb(i) order by i.id) from order_items i where i.order_id=o.id),'[]'::jsonb),'history',coalesce((select jsonb_agg(to_jsonb(h) order by h.created_at) from order_status_history h where h.order_id=o.id),'[]'::jsonb),'notes',coalesce((select jsonb_agg(to_jsonb(n) order by n.created_at) from order_notes n where n.order_id=o.id and n.is_customer_visible),'[]'::jsonb)) into result from orders o where o.id=p_order_id and (o.user_id=auth.uid() or public.is_admin());
  if result is null then raise exception 'Order not found'; end if; return result;
end; $$;

create or replace function public.admin_order_detail(p_order_id uuid) returns jsonb language plpgsql security definer set search_path=public as $$
declare result jsonb;
begin
  if not public.is_admin() then raise exception 'Unauthorized'; end if;
  select jsonb_build_object('order',to_jsonb(o),'items',coalesce((select jsonb_agg(to_jsonb(i) order by i.id) from order_items i where i.order_id=o.id),'[]'::jsonb),'history',coalesce((select jsonb_agg(to_jsonb(h) order by h.created_at) from order_status_history h where h.order_id=o.id),'[]'::jsonb),'notes',coalesce((select jsonb_agg(to_jsonb(n) order by n.created_at) from order_notes n where n.order_id=o.id),'[]'::jsonb)) into result from orders o where o.id=p_order_id;
  if result is null then raise exception 'Order not found'; end if; return result;
end; $$;

create or replace function public.add_order_note(p_order_id uuid,p_note text,p_customer_visible boolean default false) returns void language plpgsql security definer set search_path=public as $$
begin if not public.is_admin() then raise exception 'Unauthorized'; end if; insert into order_notes(order_id,note,is_customer_visible,created_by) values(p_order_id,trim(p_note),p_customer_visible,auth.uid()); end; $$;
create or replace function public.update_shipping(p_order_id uuid,p_courier text,p_tracking_number text) returns void language plpgsql security definer set search_path=public as $$
begin if not public.is_admin() then raise exception 'Unauthorized'; end if; update orders set courier=nullif(trim(p_courier),''),tracking_number=nullif(trim(p_tracking_number),'') where id=p_order_id; if not found then raise exception 'Order not found'; end if; end; $$;

create or replace function public.admin_reports(p_from timestamptz default now()-interval '30 days',p_to timestamptz default now()) returns jsonb language plpgsql security definer set search_path=public as $$
begin
 if not public.is_admin() then raise exception 'Unauthorized'; end if;
 return jsonb_build_object(
 'summary',(select jsonb_build_object('revenue',coalesce(sum(total_amount) filter(where status not in ('cancelled','refunded')),0),'orders',count(*),'completed',count(*) filter(where status='delivered'),'average_order_value',coalesce(avg(total_amount) filter(where status not in ('cancelled','refunded')),0)) from orders where created_at>=p_from and created_at<p_to),
 'daily_sales',(select coalesce(jsonb_agg(jsonb_build_object('day',sale_day,'revenue',revenue,'orders',order_count) order by sale_day),'[]'::jsonb) from (select date(created_at) AS sale_day,coalesce(sum(total_amount) filter(where status not in ('cancelled','refunded')),0) revenue,count(*) order_count from orders where created_at>=p_from and created_at<p_to group by 1) s),
 'status_counts',(select coalesce(jsonb_object_agg(status,count),'{}'::jsonb) from (select status::text,count(*) from orders where created_at>=p_from and created_at<p_to group by 1) s),
 'top_products',(select coalesce(jsonb_agg(jsonb_build_object('name',product_name,'units',units,'revenue',revenue) order by revenue desc),'[]'::jsonb) from (select i.product_name,sum(i.quantity) units,sum(i.line_total) revenue from order_items i join orders o on o.id=i.order_id where o.created_at>=p_from and o.created_at<p_to and o.status not in ('cancelled','refunded') group by i.product_name limit 10) p)
 );
end; $$;

revoke all on function public.admin_order_detail(uuid),public.admin_reports(timestamptz,timestamptz),public.add_order_note(uuid,text,boolean),public.update_shipping(uuid,text,text) from anon;
grant execute on function public.customer_order_detail(uuid),public.set_default_address(uuid) to authenticated;
grant execute on function public.admin_order_detail(uuid),public.admin_reports(timestamptz,timestamptz),public.add_order_note(uuid,text,boolean),public.update_shipping(uuid,text,text) to authenticated;
