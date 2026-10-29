-- Read-only staging verification. Run after migrations 001–004 are applied.
-- Do not run this file as a migration.

select 'tables' as check_name, array_agg(tablename order by tablename) as result
from pg_tables where schemaname = 'public' and tablename in (
  'profiles','categories','products','product_variants','product_images','coupons','orders','order_items',
  'order_status_history','inventory_adjustments','newsletter_subscribers','store_settings','customer_addresses','order_notes'
);

select 'rls enabled' as check_name, relname as table_name, relrowsecurity as enabled
from pg_class join pg_namespace on pg_namespace.oid=pg_class.relnamespace
where nspname='public' and relname in ('profiles','products','orders','order_items','customer_addresses','store_settings','order_notes')
order by relname;

select 'policies' as check_name, tablename, policyname
from pg_policies where schemaname in ('public','storage') order by tablename,policyname;

select 'functions' as check_name, routine_name
from information_schema.routines
where routine_schema='public' and routine_name in (
  'place_order','validate_coupon','is_admin','admin_dashboard','admin_reports','customer_order_detail','admin_order_detail','update_shipping'
) order by routine_name;

select 'storage bucket' as check_name, id, public, file_size_limit, allowed_mime_types
from storage.buckets where id='product-images';

select 'migration history' as check_name, version, name
from supabase_migrations.schema_migrations order by version;

-- Expected negative tests (execute using separate anon/customer/admin JWT sessions, never against production data):
-- anon: select * from public.orders;                   -- returns no private rows
-- customer A: select * from public.orders where user_id <> auth.uid(); -- returns no rows
-- customer: update public.products set stock_quantity=0; -- rejected by RLS
-- customer: insert into storage.objects(bucket_id,name) values ('product-images','x'); -- rejected by Storage policy
