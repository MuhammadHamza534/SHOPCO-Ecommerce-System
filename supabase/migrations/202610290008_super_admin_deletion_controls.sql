-- Super-admin-only deletion controls.
-- Customer financial history remains retained but is anonymized before Auth deletion.
-- Orders may be permanently removed only when they are explicitly staging/test records.

create or replace function public.admin_delete_customer(p_customer_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_customer public.profiles;
  v_orders_anonymized integer := 0;
begin
  if not exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'super_admin' and status = 'active'
  ) then
    raise exception 'Only an active super administrator may delete customer accounts.';
  end if;

  select * into v_customer from public.profiles where id = p_customer_id for update;
  if not found then raise exception 'Customer not found.'; end if;
  if v_customer.role <> 'customer' then raise exception 'Only customer accounts may be deleted here.'; end if;

  update public.orders
  set customer_name = 'Deleted customer',
      customer_email = 'deleted-' || p_customer_id::text || '@redacted.invalid',
      customer_phone = null,
      shipping_address = '{"redacted":true}'::jsonb
  where user_id = p_customer_id;
  get diagnostics v_orders_anonymized = row_count;

  delete from auth.users where id = p_customer_id;

  return jsonb_build_object('deleted_customer_id', p_customer_id, 'orders_anonymized', v_orders_anonymized);
end;
$$;

create or replace function public.admin_delete_test_order(p_order_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_order public.orders;
  v_item public.order_items;
  v_restored integer := 0;
begin
  if not exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'super_admin' and status = 'active'
  ) then
    raise exception 'Only an active super administrator may delete test orders.';
  end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if not found then raise exception 'Order not found.'; end if;

  if v_order.customer_email not like '%@example.invalid'
     and v_order.customer_name not ilike 'staging %'
     and v_order.customer_name not ilike 'test %' then
    raise exception 'Only clearly identified staging or test orders may be permanently deleted.';
  end if;

  -- A paid, refunded, fulfilled, or otherwise progressed order is a financial
  -- record, not disposable test data. It must be retained and handled through
  -- the normal cancellation/refund workflow instead.
  if v_order.status <> 'pending' or v_order.payment_status <> 'pending' then
    raise exception 'Only unpaid pending test orders may be permanently deleted.';
  end if;

  for v_item in select * from public.order_items where order_id = v_order.id loop
    if v_item.variant_id is not null then
      update public.product_variants set stock_quantity = stock_quantity + v_item.quantity where id = v_item.variant_id;
      v_restored := v_restored + v_item.quantity;
    elsif v_item.product_id is not null then
      update public.products set stock_quantity = stock_quantity + v_item.quantity where id = v_item.product_id;
      v_restored := v_restored + v_item.quantity;
    end if;

    -- Historical items can have a null product after an archival process. They
    -- cannot have stock restored or an adjustment row (product_id is required).
    if v_item.product_id is not null then
      insert into public.inventory_adjustments(product_id, variant_id, delta, reason, order_id, changed_by)
      values (v_item.product_id, v_item.variant_id, v_item.quantity, 'test order deletion restoration', v_order.id, auth.uid());
    end if;
  end loop;

  delete from public.orders where id = v_order.id;

  return jsonb_build_object('deleted_order_id', p_order_id, 'restored_units', v_restored);
end;
$$;

revoke all on function public.admin_delete_customer(uuid) from anon;
revoke all on function public.admin_delete_test_order(uuid) from anon;
grant execute on function public.admin_delete_customer(uuid) to authenticated;
grant execute on function public.admin_delete_test_order(uuid) to authenticated;
