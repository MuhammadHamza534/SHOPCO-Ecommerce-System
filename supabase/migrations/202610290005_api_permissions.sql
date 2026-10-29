-- API privileges for projects created with automatic API table exposure disabled.
-- RLS remains the authorization boundary; these grants only allow PostgREST to evaluate existing policies.

grant usage on schema public to anon, authenticated;

-- Public storefront reads remain limited by the existing published/active RLS policies.
grant select on table public.categories, public.products, public.product_variants, public.product_images, public.store_settings to anon, authenticated;

-- The authenticated role can read only its own profile, unless is_admin() authorizes broader access.
grant select on table public.profiles to authenticated;

-- Customer and administrator reads/updates; each operation is constrained by existing RLS.
grant select, update on table public.orders to authenticated;
grant select on table public.order_items to authenticated;
grant select, insert, update, delete on table public.customer_addresses to authenticated;

-- Administrative dashboard writes; existing RLS policies require an active administrator role.
grant insert, update, delete on table public.categories, public.products, public.product_variants, public.product_images, public.coupons, public.store_settings to authenticated;

-- Newsletter signup is public; subscriber management is constrained to administrators by RLS.
grant insert on table public.newsletter_subscribers to anon, authenticated;
grant select, update on table public.newsletter_subscribers to authenticated;
create policy "admin newsletter updates" on public.newsletter_subscribers for update using (public.is_admin()) with check (public.is_admin());

-- RPC access is explicit. Security-definer functions enforce their own authorization.
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.validate_coupon(text, numeric, jsonb), public.place_order(jsonb) to anon, authenticated;
grant execute on function public.admin_dashboard(text), public.admin_customers() to authenticated;
