# Customer authentication deployment settings

The storefront uses `HashRouter`, but confirmation links deliberately return to a query-string callback so Supabase's token fragment does not conflict with the client route hash.

The application sends this redirect value automatically:

```text
https://YOUR-CUSTOMER-VERCEL-DOMAIN/?auth_callback=1
```

Configure Supabase Auth before testing a confirmation email:

1. Set **Site URL** to the production SHOP.CO Vercel URL.
2. Add the exact production callback URL above to **Additional Redirect URLs**.
3. Add local callbacks for development, for example:
   - `http://localhost:5173/?auth_callback=1`
   - `http://127.0.0.1:5173/?auth_callback=1`
4. Keep Confirm email enabled if verification is required for the store.
5. Confirm Vercel has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` configured for the customer project, then redeploy.

The default Supabase email service is suitable for limited staging tests. Configure a transactional SMTP provider in Supabase Auth for reliable delivery to regular customers and for password-recovery messages.
