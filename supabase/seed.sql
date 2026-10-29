-- Optional starting content. The catalog is intentionally empty so real business data is never fabricated.
insert into public.categories (name, slug, description, display_order) values
  ('T-shirts','t-shirts','Everyday graphic and classic tees.',1),
  ('Shirts','shirts','Smart and casual shirts.',2),
  ('Jeans','jeans','Denim essentials.',3),
  ('Shorts','shorts','Warm weather staples.',4)
on conflict (slug) do nothing;
