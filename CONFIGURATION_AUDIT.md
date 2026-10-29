# Supabase staging connection audit

Date: 29 October 2026

## Current local state

- Both React apps read the same names: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Their checked-in `.env.example` files contain placeholders only; no `.env.local` exists in either application.
- Both application `.gitignore` files ignore `*.local`, so `.env.local` will not be committed.
- Four migrations are present in chronological order under `supabase/migrations/`.
- No Supabase CLI executable, Supabase `config.toml`, linked project reference, or authenticated CLI session is available in this workspace.
- No Supabase URL, public anon key, service-role key, database password, or project reference was supplied. No remote project was contacted.

## Blocking minimum

The project owner needs to create/link a **staging** Supabase project and securely provision the two public browser values in each local `.env.local`:

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<publishable-anon-key>
```

Then install/sign in to the CLI locally and run the non-mutating validation:

```powershell
npx supabase login
npx supabase link --project-ref <staging-project-ref>
npx supabase migration list
npx supabase db push --dry-run
```

Do not run `db push` until the dry-run is reviewed and the project owner explicitly approves the staging migration. After applying, run `supabase/verification.sql` in the SQL editor and execute the end-to-end checklist in `README.md`.

## Security observations

- Browser clients use only the public anon key; no privileged key appears in frontend source.
- The first Super Admin must be assigned through a privileged SQL-editor/administrative operation after the trusted account is created. Public role self-assignment is not implemented.
- Storage upload paths use authenticated requests and database `is_admin()` policies; those policies need live negative tests after migration.
- Checkout is a security-definer transaction that locks inventory rows and derives pricing from database products. This cannot be proved without a live PostgreSQL execution.
