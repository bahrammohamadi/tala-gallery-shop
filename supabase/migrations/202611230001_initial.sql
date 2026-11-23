begin;

create extension if not exists pgcrypto;

create type public.app_role as enum ('customer', 'staff', 'manager', 'admin');
create type public.order_status as enum ('inquiry', 'pending_confirmation', 'payment_pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
create type public.making_fee_mode as enum ('per_gram_irr', 'percent_of_gold');
create type public.payment_status as enum ('created', 'pending', 'verified', 'failed', 'refunded');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'customer',
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name_fa text not null,
  name_en text not null,
  description_fa text not null default '',
  description_en text not null default '',
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.collections(id) on delete restrict,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name_fa text not null,
  name_en text not null,
  description_fa text not null default '',
  description_en text not null default '',
  story_fa text not null default '',
  story_en text not null default '',
  model_code text,
  seo_title_fa text,
  seo_title_en text,
  seo_description_fa text,
  seo_description_en text,
  sort_order integer not null default 0,
  is_published boolean not null default false,
  is_archived boolean not null default false,
  published_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text not null unique,
  name_fa text not null default '',
  name_en text not null default '',
  purity_per_mille smallint not null check (purity_per_mille between 1 and 1000),
  weight_grams numeric(12,3) not null check (weight_grams > 0),
  ring_size text,
  metal_color text,
  gemstone_spec jsonb not null default '{}'::jsonb,
  gemstone_value_irr bigint not null default 0 check (gemstone_value_irr >= 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete cascade,
  storage_path text not null unique,
  alt_fa text not null default '',
  alt_en text not null default '',
  media_type text not null default 'image' check (media_type in ('image', 'model_3d', 'sequence')),
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.pricing_rules (
  id text primary key default 'default' check (id = 'default'),
  making_fee_mode public.making_fee_mode not null,
  making_fee_value numeric(16,4) not null check (making_fee_value >= 0),
  merchant_margin_percent numeric(8,4) not null check (merchant_margin_percent >= 0),
  tax_percent numeric(8,4) not null check (tax_percent >= 0),
  shipping_irr bigint not null check (shipping_irr >= 0),
  quote_ttl_seconds integer not null check (quote_ttl_seconds > 0),
  max_rate_age_seconds integer not null check (max_rate_age_seconds > 0),
  is_active boolean not null default true,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.gold_rate_snapshots (
  id uuid primary key default gen_random_uuid(),
  rate_per_gram_irr bigint not null check (rate_per_gram_irr > 0),
  reference_purity_per_mille smallint not null check (reference_purity_per_mille between 1 and 1000),
  source text not null check (length(trim(source)) >= 3),
  captured_at timestamptz not null,
  is_verified boolean not null default false,
  verified_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.price_quotes (
  id uuid primary key default gen_random_uuid(),
  product_variant_id uuid not null references public.product_variants(id) on delete restrict,
  amount_irr bigint not null check (amount_irr >= 0),
  amount_toman_rounded bigint not null check (amount_toman_rounded >= 0),
  rate_source text not null,
  rate_captured_at timestamptz not null,
  expires_at timestamptz not null,
  snapshot jsonb not null,
  created_at timestamptz not null default now()
);

create table public.promotions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code = upper(code)),
  discount_type text not null check (discount_type in ('fixed_irr', 'percent')),
  discount_value numeric(16,4) not null check (discount_value >= 0),
  starts_at timestamptz,
  ends_at timestamptz,
  max_uses integer check (max_uses is null or max_uses >= 0),
  uses_count integer not null default 0 check (uses_count >= 0),
  is_active boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('TL-' || upper(substr(encode(gen_random_bytes(8), 'hex'), 1, 10))),
  idempotency_key text not null unique,
  user_id uuid not null references public.profiles(id) on delete restrict,
  status public.order_status not null default 'pending_confirmation',
  currency char(3) not null default 'IRR' check (currency = 'IRR'),
  amount_irr bigint not null check (amount_irr >= 0),
  amount_toman_rounded bigint not null check (amount_toman_rounded >= 0),
  price_quote_id uuid references public.price_quotes(id) on delete restrict,
  pricing_snapshot jsonb not null,
  contact_snapshot jsonb not null default '{}'::jsonb,
  shipping_snapshot jsonb not null default '{}'::jsonb,
  payment_confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  product_variant_id uuid not null references public.product_variants(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_amount_irr bigint not null check (unit_amount_irr >= 0),
  line_amount_irr bigint not null check (line_amount_irr >= 0),
  product_snapshot jsonb not null,
  created_at timestamptz not null default now()
);

create table public.inventory_reservations (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_variant_id uuid not null references public.product_variants(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  status text not null default 'reserved' check (status in ('reserved', 'committed', 'released', 'expired')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table public.payment_attempts (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  provider text not null,
  provider_transaction_id text,
  idempotency_key text not null unique,
  amount_irr bigint not null check (amount_irr >= 0),
  status public.payment_status not null default 'created',
  request_snapshot jsonb not null default '{}'::jsonb,
  callback_snapshot jsonb not null default '{}'::jsonb,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status public.order_status not null,
  note text not null default '',
  actor_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (length(trim(full_name)) between 2 and 120),
  phone text not null check (length(trim(phone)) between 7 and 40),
  email text,
  message text not null default '' check (length(message) <= 1000),
  requested_items jsonb not null default '[]'::jsonb,
  status text not null default 'new' check (status in ('new', 'reviewing', 'responded', 'closed')),
  assigned_to uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table public.homepage_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique,
  content_fa jsonb not null default '{}'::jsonb,
  content_en jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  is_published boolean not null default false,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  subject_type text not null,
  subject_id text,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

create index products_collection_published_idx on public.products(collection_id, is_published, sort_order);
create index variants_product_active_idx on public.product_variants(product_id, is_active);
create index gold_rate_verified_captured_idx on public.gold_rate_snapshots(is_verified, captured_at desc);
create index orders_user_created_idx on public.orders(user_id, created_at desc);
create index inquiries_status_created_idx on public.inquiries(status, created_at desc);
create index audit_created_idx on public.audit_logs(created_at desc);
create index reservations_variant_expiry_idx on public.inventory_reservations(product_variant_id, status, expires_at);

create or replace function public.is_store_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role in ('admin', 'manager')
  );
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.guard_profile_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_store_admin() then
    raise exception 'Profile role changes require a store administrator';
  end if;
  return new;
end;
$$;

create trigger profiles_role_guard before update on public.profiles
  for each row execute procedure public.guard_profile_role_change();

create or replace function public.audit_sensitive_row_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  old_row jsonb;
  new_row jsonb;
  row_id text;
  action_name text;
begin
  if tg_op in ('UPDATE', 'DELETE') then old_row := to_jsonb(old); end if;
  if tg_op in ('INSERT', 'UPDATE') then new_row := to_jsonb(new); end if;
  if tg_table_name = 'orders' then
    old_row := old_row - 'contact_snapshot' - 'shipping_snapshot';
    new_row := new_row - 'contact_snapshot' - 'shipping_snapshot';
  end if;
  row_id := coalesce(new_row ->> 'id', old_row ->> 'id');
  action_name := lower(tg_op) || '.' || tg_table_name;
  insert into public.audit_logs(actor_id, action, subject_type, subject_id, before_data, after_data)
  values (auth.uid(), action_name, tg_table_name, row_id, old_row, new_row);
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

create or replace function public.guard_immutable_row()
returns trigger
language plpgsql
as $$
begin
  raise exception '% rows are immutable; create a new record instead', tg_table_name;
end;
$$;

create or replace function public.guard_published_product()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_published and not new.is_archived and not exists (
    select 1 from public.product_variants v
    where v.product_id = new.id and v.is_active and v.weight_grams > 0 and v.purity_per_mille > 0
  ) then
    raise exception 'A product needs a verified active variant before publication';
  end if;
  return new;
end;
$$;

create trigger products_require_real_variant before insert or update of is_published, is_archived on public.products
  for each row execute procedure public.guard_published_product();

create or replace function public.guard_order_price_snapshot()
returns trigger
language plpgsql
as $$
begin
  if new.amount_irr is distinct from old.amount_irr
     or new.amount_toman_rounded is distinct from old.amount_toman_rounded
     or new.currency is distinct from old.currency
     or new.price_quote_id is distinct from old.price_quote_id
     or new.pricing_snapshot is distinct from old.pricing_snapshot then
    raise exception 'Order pricing snapshots are immutable';
  end if;
  return new;
end;
$$;

create trigger order_price_snapshot_guard before update on public.orders
  for each row execute procedure public.guard_order_price_snapshot();
create trigger order_items_immutable before update or delete on public.order_items
  for each row execute procedure public.guard_immutable_row();
create trigger price_quotes_immutable before update or delete on public.price_quotes
  for each row execute procedure public.guard_immutable_row();
create trigger gold_rates_immutable before update or delete on public.gold_rate_snapshots
  for each row execute procedure public.guard_immutable_row();
create trigger payment_attempts_immutable_callback before delete on public.payment_attempts
  for each row execute procedure public.guard_immutable_row();

create trigger audit_collections after insert or update or delete on public.collections
  for each row execute procedure public.audit_sensitive_row_change();
create trigger audit_products after insert or update or delete on public.products
  for each row execute procedure public.audit_sensitive_row_change();
create trigger audit_variants after insert or update or delete on public.product_variants
  for each row execute procedure public.audit_sensitive_row_change();
create trigger audit_pricing_rules after insert or update or delete on public.pricing_rules
  for each row execute procedure public.audit_sensitive_row_change();
create trigger audit_gold_rates after insert or update or delete on public.gold_rate_snapshots
  for each row execute procedure public.audit_sensitive_row_change();
create trigger audit_orders after insert or update or delete on public.orders
  for each row execute procedure public.audit_sensitive_row_change();
create trigger audit_promotions after insert or update or delete on public.promotions
  for each row execute procedure public.audit_sensitive_row_change();
create trigger audit_homepage_sections after insert or update or delete on public.homepage_sections
  for each row execute procedure public.audit_sensitive_row_change();

create trigger collections_updated_at before update on public.collections for each row execute procedure public.set_updated_at();
create trigger products_updated_at before update on public.products for each row execute procedure public.set_updated_at();
create trigger variants_updated_at before update on public.product_variants for each row execute procedure public.set_updated_at();
create trigger profiles_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
create trigger pricing_rules_updated_at before update on public.pricing_rules for each row execute procedure public.set_updated_at();
create trigger promotions_updated_at before update on public.promotions for each row execute procedure public.set_updated_at();
create trigger orders_updated_at before update on public.orders for each row execute procedure public.set_updated_at();
create trigger payment_attempts_updated_at before update on public.payment_attempts for each row execute procedure public.set_updated_at();
create trigger inquiries_updated_at before update on public.inquiries for each row execute procedure public.set_updated_at();
create trigger homepage_sections_updated_at before update on public.homepage_sections for each row execute procedure public.set_updated_at();
create trigger site_settings_updated_at before update on public.site_settings for each row execute procedure public.set_updated_at();

create or replace function public.admin_save_pricing_rules(
  p_making_fee_mode public.making_fee_mode,
  p_making_fee_value numeric,
  p_merchant_margin_percent numeric,
  p_tax_percent numeric,
  p_shipping_irr bigint,
  p_quote_ttl_seconds integer,
  p_max_rate_age_seconds integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  saved public.pricing_rules;
begin
  if not public.is_store_admin() then raise exception 'Administrator access required'; end if;
  if p_making_fee_value < 0 or p_merchant_margin_percent < 0 or p_tax_percent < 0
     or p_shipping_irr < 0 or p_quote_ttl_seconds <= 0 or p_max_rate_age_seconds <= 0 then
    raise exception 'Invalid pricing configuration';
  end if;
  insert into public.pricing_rules (
    id, making_fee_mode, making_fee_value, merchant_margin_percent, tax_percent,
    shipping_irr, quote_ttl_seconds, max_rate_age_seconds, is_active, updated_by
  ) values (
    'default', p_making_fee_mode, p_making_fee_value, p_merchant_margin_percent, p_tax_percent,
    p_shipping_irr, p_quote_ttl_seconds, p_max_rate_age_seconds, true, auth.uid()
  )
  on conflict (id) do update set
    making_fee_mode = excluded.making_fee_mode,
    making_fee_value = excluded.making_fee_value,
    merchant_margin_percent = excluded.merchant_margin_percent,
    tax_percent = excluded.tax_percent,
    shipping_irr = excluded.shipping_irr,
    quote_ttl_seconds = excluded.quote_ttl_seconds,
    max_rate_age_seconds = excluded.max_rate_age_seconds,
    is_active = true,
    updated_by = auth.uid(),
    updated_at = now()
  returning * into saved;
  return to_jsonb(saved);
end;
$$;

alter table public.profiles enable row level security;
alter table public.collections enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_media enable row level security;
alter table public.pricing_rules enable row level security;
alter table public.gold_rate_snapshots enable row level security;
alter table public.price_quotes enable row level security;
alter table public.promotions enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.inventory_reservations enable row level security;
alter table public.payment_attempts enable row level security;
alter table public.order_events enable row level security;
alter table public.inquiries enable row level security;
alter table public.site_settings enable row level security;
alter table public.homepage_sections enable row level security;
alter table public.audit_logs enable row level security;

create policy profiles_read_self_or_admin on public.profiles for select to authenticated
  using (id = (select auth.uid()) or public.is_store_admin());
create policy profiles_update_self on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy profiles_admin_manage on public.profiles for all to authenticated
  using (public.is_store_admin()) with check (public.is_store_admin());

create policy collections_public_read on public.collections for select to anon, authenticated
  using (is_published or public.is_store_admin());
create policy collections_admin_manage on public.collections for all to authenticated
  using (public.is_store_admin()) with check (public.is_store_admin());

create policy products_public_read on public.products for select to anon, authenticated
  using ((is_published and not is_archived) or public.is_store_admin());
create policy products_admin_manage on public.products for all to authenticated
  using (public.is_store_admin()) with check (public.is_store_admin());

create policy variants_public_read on public.product_variants for select to anon, authenticated
  using (
    (is_active and exists (
      select 1 from public.products p
      where p.id = product_id and p.is_published and not p.is_archived
    )) or public.is_store_admin()
  );
create policy variants_admin_manage on public.product_variants for all to authenticated
  using (public.is_store_admin()) with check (public.is_store_admin());

create policy media_public_read on public.product_media for select to anon, authenticated
  using (
    exists (
      select 1 from public.products p
      where p.id = product_id and p.is_published and not p.is_archived
    ) or public.is_store_admin()
  );
create policy media_admin_manage on public.product_media for all to authenticated
  using (public.is_store_admin()) with check (public.is_store_admin());

create policy pricing_rules_admin_read on public.pricing_rules for select to authenticated using (public.is_store_admin());
create policy gold_rate_admin_read on public.gold_rate_snapshots for select to authenticated using (public.is_store_admin());
create policy gold_rate_admin_insert on public.gold_rate_snapshots for insert to authenticated
  with check (public.is_store_admin() and verified_by = (select auth.uid()));
create policy quotes_admin_read on public.price_quotes for select to authenticated using (public.is_store_admin());
create policy promotions_admin_manage on public.promotions for all to authenticated using (public.is_store_admin()) with check (public.is_store_admin());

create policy orders_owner_or_admin_read on public.orders for select to authenticated
  using (user_id = (select auth.uid()) or public.is_store_admin());
create policy order_items_owner_or_admin_read on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = (select auth.uid()) or public.is_store_admin())));
create policy reservations_owner_or_admin_read on public.inventory_reservations for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = (select auth.uid()) or public.is_store_admin())));
create policy payment_attempts_owner_or_admin_read on public.payment_attempts for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = (select auth.uid()) or public.is_store_admin())));
create policy order_events_owner_or_admin_read on public.order_events for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = (select auth.uid()) or public.is_store_admin())));

create policy inquiries_admin_read on public.inquiries for select to authenticated using (public.is_store_admin());
create policy inquiries_admin_update on public.inquiries for update to authenticated using (public.is_store_admin()) with check (public.is_store_admin());
create policy settings_admin_manage on public.site_settings for all to authenticated using (public.is_store_admin()) with check (public.is_store_admin());
create policy homepage_public_read on public.homepage_sections for select to anon, authenticated using (is_published or public.is_store_admin());
create policy homepage_admin_manage on public.homepage_sections for all to authenticated using (public.is_store_admin()) with check (public.is_store_admin());
create policy audit_admin_read on public.audit_logs for select to authenticated using (public.is_store_admin());

insert into public.collections (slug, name_fa, name_en, description_fa, description_en, sort_order, is_published) values
  ('rings', 'انگشترها', 'Rings', 'حلقه‌هایی با حضوری آرام؛ از خط نرم یک بند تا یک نقطه‌ی نور.', 'Quietly expressive forms, from a softened band to a single point of light.', 1, true),
  ('necklaces', 'گردنبندها', 'Necklaces', 'تناسبی ظریف برای همراهی نزدیک با پوست و نور.', 'Considered proportions made to sit close to the skin and catch the light.', 2, true),
  ('bracelets', 'دستبندها', 'Bracelets', 'حرکتی نرم دور مچ؛ ساخته‌شده برای هر روز و هر خاطره.', 'A fluid line around the wrist, made for the everyday and the remembered.', 3, true),
  ('earrings', 'گوشواره‌ها', 'Earrings', 'جزئیاتی کوچک که با هر حرکت، نوری تازه پیدا می‌کنند.', 'Small details that find a new glint with every movement.', 4, true),
  ('sets', 'نیم‌ست‌ها', 'Jewellery sets', 'قطعه‌هایی هم‌زبان؛ بدون آن‌که یکسان باشند.', 'Pieces in conversation with one another, never simply matching.', 5, true);

-- Public users can read published product media; only store administrators can upload or delete it.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-media', 'product-media', true, 12582912, array['image/jpeg', 'image/png', 'image/webp', 'model/gltf-binary', 'model/gltf+json'])
on conflict (id) do nothing;

create policy product_media_bucket_public_read on storage.objects for select to anon, authenticated
  using (bucket_id = 'product-media');
create policy product_media_bucket_admin_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'product-media' and public.is_store_admin());
create policy product_media_bucket_admin_update on storage.objects for update to authenticated
  using (bucket_id = 'product-media' and public.is_store_admin())
  with check (bucket_id = 'product-media' and public.is_store_admin());
create policy product_media_bucket_admin_delete on storage.objects for delete to authenticated
  using (bucket_id = 'product-media' and public.is_store_admin());

commit;
