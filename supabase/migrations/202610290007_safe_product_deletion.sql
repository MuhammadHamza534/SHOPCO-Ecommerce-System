-- Safe hard deletion for unused catalog records only.
-- Historical order items and inventory movements intentionally block deletion.
create or replace function public.admin_delete_product(p_product_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_paths jsonb;
begin
  if not public.is_admin() then
    raise exception 'Unauthorized';
  end if;

  if not exists (select 1 from public.products where id = p_product_id) then
    raise exception 'Product not found';
  end if;

  if exists (select 1 from public.order_items where product_id = p_product_id) then
    raise exception 'Products referenced by order history cannot be permanently deleted. Archive this product instead.';
  end if;

  if exists (select 1 from public.inventory_adjustments where product_id = p_product_id) then
    raise exception 'Products with inventory history cannot be permanently deleted. Archive this product instead.';
  end if;

  select coalesce(jsonb_agg(storage_path) filter (where storage_path is not null), '[]'::jsonb)
  into v_paths
  from public.product_images
  where product_id = p_product_id;

  delete from public.products where id = p_product_id;

  return jsonb_build_object('deleted_product_id', p_product_id, 'storage_paths', v_paths);
end;
$$;

revoke all on function public.admin_delete_product(uuid) from anon;
grant execute on function public.admin_delete_product(uuid) to authenticated;
