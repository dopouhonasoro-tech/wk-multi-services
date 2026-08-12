-- ═══════════════════════════════════════════════════════════════════
-- WK MULTI-SERVICES — schéma de la base produits
-- À coller UNE FOIS dans Supabase : SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════════════

-- 1. Table des produits (motos et accessoires)
create table if not exists public.produits (
  id uuid primary key default gen_random_uuid(),
  categorie text not null check (categorie in ('moto', 'accessoire')),
  nom text not null,
  caracteristique text,
  description text,
  prix integer,
  image_url text,
  badge text,
  actif boolean not null default true,
  ordre integer not null default 0,
  cree_le timestamptz not null default now()
);

alter table public.produits enable row level security;

-- Le site public (clé anonyme) ne voit que les produits actifs, en lecture seule.
create policy "Lecture publique des produits actifs"
  on public.produits for select
  to anon
  using (actif = true);

-- Un administrateur connecté (via /admin.html) a tous les droits.
create policy "Accès complet pour les administrateurs connectés"
  on public.produits for all
  to authenticated
  using (true)
  with check (true);

-- 2. Espace de stockage pour les photos produits
insert into storage.buckets (id, name, public)
values ('produits', 'produits', true)
on conflict (id) do nothing;

create policy "Lecture publique des images produits"
  on storage.objects for select
  to public
  using (bucket_id = 'produits');

create policy "Gestion des images par les administrateurs"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'produits')
  with check (bucket_id = 'produits');
