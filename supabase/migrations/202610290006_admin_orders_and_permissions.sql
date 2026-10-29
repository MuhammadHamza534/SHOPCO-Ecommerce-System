-- Complete the minimum API permissions and provide an admin-only derived orders list.
-- No private table is exposed to anon; RLS remains enabled and authoritative.

-- These SELECT grants are required by existing admin UI read paths and remain restricted by RLS.
grant select on table public.coupons, public.inventory_adjustments, public.order_status_history to authenticated;

create or replace function public.admin_orders(
  p_search text default null,
  p_status public.order_status default null,
  p_limit integer default 100,
  p_offset integer default 0
)
returns table(
  id uuid,
  order_number bigint,
  customer_name text,
  customer_email text,
  customer_phone text,
  created_at timestamptz,
  item_count integer,
  subtotal numeric,
  discount_amount numeric,
  shipping_fee numeric,
  total_amount numeric,
  payment_method text,
  payment_status public.payment_status,
  status public.order_status,
  tracking_number text,
  courier text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Unauthorized';
  end if;

  return query
  select
    o.id,
    o.order_number,
    o.customer_name,
    o.customer_email,
    o.customer_phone,
    o.created_at,
    coalesce(sum(oi.quantity), 0)::integer as item_count,
    o.subtotal,
    o.discount_amount,
    o.shipping_fee,
    o.total_amount,
    o.payment_method,
    o.payment_status,
    o.status,
    o.tracking_number,
    o.courier
  from public.orders o
  left join public.order_items oi on oi.order_id = o.id
  where (p_search is null or p_search = '' or o.order_number::text ilike '%' || p_search || '%' or o.customer_name ilike '%' || p_search || '%' or o.customer_email ilike '%' || p_search || '%')
    and (p_status is null or o.status = p_status)
  group by o.id
  order by o.created_at desc
  limit least(greatest(coalesce(p_limit, 100), 1), 200)
  offset greatest(coalesce(p_offset, 0), 0);
end;
$$;

revoke all on function public.admin_orders(text, public.order_status, integer, integer) from anon;
grant execute on function public.admin_orders(text, public.order_status, integer, integer) to authenticated;
