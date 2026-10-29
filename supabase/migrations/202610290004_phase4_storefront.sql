-- Phase 4: store settings are authoritative for checkout totals and COD availability.
create or replace function public.apply_store_checkout_settings() returns trigger language plpgsql security definer set search_path=public as $$
declare shipping numeric := 15; threshold numeric := 200; cod_enabled boolean := true;
begin
  select coalesce((value #>> '{}')::numeric,shipping) into shipping from store_settings where key='shipping_fee';
  select coalesce((value #>> '{}')::numeric,threshold) into threshold from store_settings where key='free_shipping_threshold';
  select coalesce((value #>> '{}')::boolean,cod_enabled) into cod_enabled from store_settings where key='cod_enabled';
  if new.payment_method='cod' and not cod_enabled then raise exception 'Cash on delivery is unavailable'; end if;
  new.shipping_fee := case when new.subtotal >= threshold then 0 else shipping end;
  new.total_amount := new.subtotal-new.discount_amount+new.shipping_fee+new.tax_amount;
  return new;
end; $$;
drop trigger if exists orders_apply_store_checkout_settings on public.orders;
create trigger orders_apply_store_checkout_settings before insert on public.orders for each row execute procedure public.apply_store_checkout_settings();

insert into public.store_settings(key,value) values
 ('store_name','"SHOP.CO"'::jsonb),('currency','"USD"'::jsonb),('shipping_fee','15'::jsonb),('free_shipping_threshold','200'::jsonb),('cod_enabled','true'::jsonb)
on conflict(key) do nothing;
