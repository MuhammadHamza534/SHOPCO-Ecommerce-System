# SHOP.CO + BERRY commerce platform

This workspace contains two independently runnable React/Vite applications backed by one Supabase project:

| Application | Folder | Purpose |
| --- | --- | --- |
| SHOP.CO | `11th-Assignments` | Public catalog, product details, cart, coupon validation, and cash-on-delivery checkout |
| BERRY | `12th-Assignment` | Protected administrative product, customer, order, and live analytics interface |
| Supabase | `supabase/` | PostgreSQL schema, RLS policies, secure RPC functions, and starter categories |

## What is implemented

- The public catalog only reads published, visible products and uses `/product/:slug` for individual product pages.
- Cart totals do **not** apply a discount until the coupon RPC validates it. Checkout submits only product IDs and selections; prices, coupon value, stock, and totals are recalculated in PostgreSQL.
- `place_order` uses row locks and one transaction to prevent overselling, creates immutable order-item snapshots, adjusts inventory, keeps an order-history event, and supports an idempotency key.
- BERRY requires Supabase email/password authentication and confirms an active `super_admin`, `admin`, or `staff` role before rendering its routes. RLS enforces those permissions server-side.
- Admin product create/edit/archive, stock, category selection, order status update, customers, recent orders, revenue, and low-stock dashboard cards all use the same database.
- Schema includes variants, gallery records, inventory adjustments, coupons, newsletter subscribers, order status history, and website settings so the next management views have durable backend support.

## Supabase setup

1. Create a Supabase project and enable Email/Password authentication.
2. In the SQL editor, run `supabase/migrations/202610290001_ecommerce.sql`, then `supabase/seed.sql`.
3. Create a public Storage bucket named `product-images`. The migration contains the one-time SQL note; add Storage policies that allow `public.is_admin()` to insert/update/delete objects and public read for published image URLs.
4. Register the first admin through Supabase Auth or the public storefront signup route, then promote only that trusted user in the SQL editor:

   ```sql
   update public.profiles
   set role = 'super_admin'
   where id = '<auth-user-uuid>';
   ```

   Do not run this from client code and never expose the Supabase service-role key.

5. Copy `.env.example` to `.env.local` in both application folders and set the same public project URL and anon key:

   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-public-anon-key
   ```

## Local development

In separate terminals:

```powershell
cd 11th-Assignments
npm install
npm run dev
```

```powershell
cd 12th-Assignment
npm install
npm run dev
```

The applications run independently and intentionally share only their Supabase configuration and database. Build either application with `npm run build`.

## Secure data model and operational notes

- Public visitors may read only active categories and published/visible catalog records.
- A customer can read only their own authenticated orders. Guest checkout persists the guest’s email/name on the order but does not grant it arbitrary order lookup.
- `products`, categories, images, coupons, inventory, orders, customer data, and site settings have RLS policies; admin UI hiding is not relied on for authorization.
- `products` are archived instead of hard-deleted, preserving historical order references.
- Order status and payment status are separate. Expand the `order_status_history` trigger/RPC with your business-specific allowed-transition policy before allowing staff to make refund and return decisions in production.
- No payment provider is configured: checkout is a genuine database-backed COD flow. Add a provider-specific server-side integration before enabling card payments.

## Validation completed

On 29 October 2026, both production bundles compiled successfully:

- `11th-Assignments`: `npm run build` passed.
- `12th-Assignment`: `npm run build` passed (Vite reports a non-blocking bundle-size warning because Recharts is included).

The external Supabase project, storage bucket, first admin identity, and live end-to-end database test remain intentionally unverified because no Supabase credentials were supplied.

## Phase 2 operations

The BERRY sidebar now includes Categories, Inventory, Coupons, Newsletter, and Settings & Website Content. These sections persist through the same Supabase REST/RPC layer as the original products and orders screens.

- **Categories**: create, edit, activate/deactivate, order, and nest categories.
- **Inventory**: search stock, identify low/out-of-stock items, and adjust quantity. The checkout transaction locks stock rows and the cancellation/refund trigger restores stock exactly once.
- **Coupons**: create percentage/fixed coupons with thresholds, expiration, usage and per-customer limits; the customer cart still asks the server to validate before showing a discount.
- **Newsletter**: the storefront form now inserts consented subscribers, while BERRY can search, reactivate/unsubscribe, and export CSV.
- **Settings & Website Content**: durable store, shipping, announcement, and hero-content values are managed in `store_settings`.
- **Product images**: product image records and secure authenticated Storage upload/removal are implemented at `#/products/<product-uuid>/images`. Apply the Phase 2 migration before using uploads; the Storage policies reject public writes.

### Apply Phase 2 safely

Run `supabase/migrations/202610290002_phase2_operations.sql` after the initial migration. It creates the storage bucket and policies, order-note structure, guest-token foundation, coupon restriction columns, status-transition enforcement, and cancellation/refund stock restoration. Run migrations with the Supabase CLI or SQL editor under a database-owner session—not from either browser app.

### Verification checklist (requires configured Supabase)

1. Sign in as the promoted admin and create a category.
2. Add/edit a product; navigate to its image path and upload a valid image below 5 MB.
3. Confirm the product/image becomes visible in SHOP.CO after publication.
4. Add it to the cart; test an invalid and then valid coupon.
5. Place a COD order, verify stock decreased and the order appears in BERRY.
6. Update its status, then cancel it and verify the one-time stock restoration/history.
7. Subscribe through SHOP.CO and export/update the subscriber from BERRY.

## Phase 3 customer portal and fulfilment

SHOP.CO now provides `/login`, `/register`, `/forgot-password`, `/reset-password`, `/account`, `/account/profile`, `/account/addresses`, `/account/orders`, and `/account/orders/:id`. Customer data is protected by RLS and the authenticated `customer_order_detail` function; passwords are handled only by Supabase Auth.

BERRY now has order search/filter/export, `#/orders/:id` for complete order details, courier/tracking updates, internal notes, a stable print-friendly invoice, and `#/reports` for server-aggregated revenue, status, daily-sales, and top-product reporting.

Apply `supabase/migrations/202610290003_phase3_completion.sql` after Phases 1 and 2. It adds address persistence, private customer and admin order-detail functions, admin report aggregation, and database-authorized shipping/note operations.

### Phase 3 live verification

1. Configure the same public Supabase URL and anon key in both `.env.local` files.
2. Apply the three migrations in timestamp order; do not edit an already-applied migration.
3. Register a customer, confirm email if enabled, then create/edit a saved address and sign back in.
4. Place a COD order while signed in and verify it appears in My Orders; test that a second customer receives an `Order not found` response for its UUID.
5. As an admin, open the order’s Manage link, save tracking/courier values, add a note, move it through valid statuses, print its invoice, and export orders.
6. Confirm BERRY Reports includes the order according to its non-cancelled/non-refunded revenue rules.

Guest order tracking via a verifiable delivery channel remains an external integration requirement: configure transactional email (or an Edge Function signed-token delivery flow) before exposing guest order lookups. The database includes a guest access token foundation, but the application does not expose a guessable reference-only lookup.

## Phase 4 production configuration

The storefront now reads `hero_heading`, `hero_description`, `hero_banner_url`, `hero_banner_mobile_url`, `hero_button_text`, `hero_button_link`, `store_name`, `announcement`, `footer_description`, `store_email`, `store_phone`, and `social_links` from `store_settings`, using the established design content only when a setting is absent. BERRY Settings exposes the primary store, shipping, COD, hero, and footer fields.

Apply [the Phase 4 migration](supabase/migrations/202610290004_phase4_storefront.sql) after the preceding migrations. Its before-insert database trigger makes shipping fee, free-shipping threshold, and COD availability authoritative; the browser display is never trusted for the final order amount.

### Supabase CLI procedure

```powershell
# Install/login once, then work from this repository root.
npm install --global supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

Alternatively, execute the four SQL files in `supabase/migrations/` in lexical order from the project SQL editor. After migration, verify the expected objects:

```sql
select tablename from pg_tables where schemaname = 'public' order by tablename;
select routine_name from information_schema.routines where routine_schema = 'public' order by routine_name;
select policyname, tablename from pg_policies where schemaname in ('public', 'storage') order by tablename, policyname;
select id, public, file_size_limit from storage.buckets where id = 'product-images';
```

In Supabase Auth, set the customer and admin production URLs plus `https://<customer-domain>/#/reset-password` as redirect URLs. Use only the public anon key in both Vite applications; retain `service_role`, Resend/SMTP, and any Edge Function secrets exclusively in Supabase secrets. To provision the initial admin, first register a trusted user, then run the documented one-time `profiles.role = 'super_admin'` SQL update in the project SQL editor.

### Live verification status

No project URL, anon key, CLI session, Storage bucket, or email-provider access was available in this workspace. Therefore migrations, RLS, uploads, Auth, checkout, and report values were **not** live-tested. The build/lint checks only validate the client code. Before deployment, complete the Phase 1–4 checklists above in a non-production Supabase project, including unauthorized API calls, duplicate checkout, cancellation stock restoration, and Storage upload rejection for non-admin users.
