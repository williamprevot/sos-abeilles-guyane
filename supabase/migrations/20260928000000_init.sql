-- =====================================================================
-- S.O.S Abeilles Guyane — base de données (Supabase / PostgreSQL)
-- À exécuter une fois : Supabase → SQL Editor → coller ce fichier → Run.
--
-- Contenu :
--   • profiles       : comptes de l'équipe (apiculteurs, admin)
--   • reports        : signalements d'essaims envoyés depuis le site
--   • report_events  : historique des changements de statut
--   • bucket privé « photos » pour les photos d'essaims
--   • règles de sécurité (Row Level Security) :
--       - le public peut SEULEMENT déposer un signalement (jamais lire)
--       - les apiculteurs connectés lisent et mettent à jour les signalements
--       - l'admin gère l'équipe et peut supprimer (demandes RGPD, purge)
--   • public_stats() : totaux par commune, sans aucune donnée personnelle
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Équipe
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  email        text,
  display_name text,
  role         text not null default 'en_attente'
               check (role in ('en_attente', 'apiculteur', 'admin')),
  created_at   timestamptz not null default now()
);

-- Chaque nouveau compte (créé par invitation) reçoit un profil « en attente ».
-- Le rôle n'est JAMAIS lu depuis les données fournies à l'inscription.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, nullif(new.raw_user_meta_data ->> 'display_name', ''))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles p
                 where p.id = auth.uid() and p.role in ('apiculteur', 'admin'));
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles p
                 where p.id = auth.uid() and p.role = 'admin');
$$;

-- Via le site (API), seul un admin peut changer un rôle : un apiculteur ne peut pas
-- s'élever lui-même. Les requêtes lancées dans le SQL Editor de Supabase (propriétaire
-- de la base) et la clé service_role (fonction « équipe ») restent autorisées.
create or replace function public.protect_profile_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role
     and session_user = 'authenticator'
     and not public.is_admin()
     and coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Seul un administrateur peut modifier un rôle';
  end if;
  new.id := old.id;
  new.email := old.email;
  return new;
end $$;

drop trigger if exists protect_profile_role on public.profiles;
create trigger protect_profile_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();

alter table public.profiles enable row level security;

drop policy if exists "profiles: lire le sien" on public.profiles;
create policy "profiles: lire le sien" on public.profiles
  for select to authenticated using (id = auth.uid());

drop policy if exists "profiles: l'équipe se voit" on public.profiles;
create policy "profiles: l'équipe se voit" on public.profiles
  for select to authenticated using (public.is_staff());

drop policy if exists "profiles: modifier son nom" on public.profiles;
create policy "profiles: modifier son nom" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "profiles: l'admin gère l'équipe" on public.profiles;
create policy "profiles: l'admin gère l'équipe" on public.profiles
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

revoke all on public.profiles from anon;
revoke insert, delete on public.profiles from authenticated;
grant select, update (display_name, role) on public.profiles to authenticated;

-- ---------------------------------------------------------------------
-- 2. Signalements
-- ---------------------------------------------------------------------
create table if not exists public.reports (
  id                uuid primary key default gen_random_uuid(),
  reference         text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  -- Coordonnées de l'habitant : obligatoires tant que le signalement n'est pas anonymisé
  nom               text check (nom is null or char_length(nom) between 2 and 120),
  telephone         text check (telephone is null or char_length(telephone) between 6 and 40),
  email             text check (email is null or (char_length(email) between 5 and 200 and email like '%@%')),
  commune           text not null check (commune in ('Cayenne', 'Rémire-Montjoly', 'Matoury', 'Macouria',
                                                     'Montsinéry-Tonnegrande', 'Roura')),
  adresse           text check (adresse is null or char_length(adresse) between 3 and 300),
  emplacement       text check (emplacement is null or char_length(emplacement) between 3 and 300),
  depuis            text check (depuis is null or char_length(depuis) <= 80),
  urgence           text check (urgence is null or char_length(urgence) <= 120),
  message           text check (message is null or char_length(message) <= 2000),
  photo_path        text,
  lat               double precision check (lat is null or lat between 1.5 and 6.5),
  lng               double precision check (lng is null or lng between -55.5 and -50.5),
  geo_source        text check (geo_source is null or geo_source in ('gps', 'adresse')),
  lang              text check (lang is null or lang in ('fr', 'en', 'es', 'pt', 'zh')),
  status            text not null default 'nouveau'
                    check (status in ('nouveau', 'planifie', 'recupere', 'annule')),
  status_changed_at timestamptz not null default now(),
  recovered_at      timestamptz,
  assigned_to       uuid references auth.users (id) on delete set null,
  notes             text check (notes is null or char_length(notes) <= 4000),
  anonymized_at     timestamptz,
  constraint coordonnees_requises
    check (anonymized_at is not null or
           (nom is not null and telephone is not null and email is not null
            and adresse is not null and emplacement is not null)),
  constraint photo_dans_son_dossier
    check (photo_path is null or photo_path like 'reports/' || id::text || '/%')
);

create index if not exists reports_created_at_idx on public.reports (created_at desc);
create index if not exists reports_status_idx on public.reports (status);
create index if not exists reports_commune_idx on public.reports (commune);

create table if not exists public.report_events (
  id              bigint generated always as identity primary key,
  report_id       uuid not null references public.reports (id) on delete cascade,
  status          text not null,
  changed_by      uuid references auth.users (id) on delete set null,
  changed_by_name text,
  created_at      timestamptz not null default now()
);
create index if not exists report_events_report_idx on public.report_events (report_id, created_at);

-- Dates de suivi + historique, remplis automatiquement
create or replace function public.reports_before_write()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    -- Un dépôt public ne peut pas choisir son statut, ses dates ni son responsable.
    if not public.is_staff() then
      new.status := 'nouveau';
      new.assigned_to := null;
      new.notes := null;
      new.recovered_at := null;
      new.anonymized_at := null;
      new.created_at := now();
    end if;
    new.status_changed_at := now();
    new.updated_at := now();
    if new.status = 'recupere' then new.recovered_at := now(); end if;
    return new;
  end if;
  -- UPDATE
  new.id := old.id;
  new.created_at := old.created_at;
  new.updated_at := now();
  if new.status is distinct from old.status then
    new.status_changed_at := now();
    new.recovered_at := case when new.status = 'recupere' then now() else null end;
  end if;
  return new;
end $$;

drop trigger if exists reports_before_write on public.reports;
create trigger reports_before_write
  before insert or update on public.reports
  for each row execute function public.reports_before_write();

create or replace function public.reports_after_write()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    insert into public.report_events (report_id, status, changed_by, changed_by_name)
    values (new.id, new.status, auth.uid(),
            (select coalesce(p.display_name, p.email) from public.profiles p where p.id = auth.uid()));
  end if;
  return null;
end $$;

drop trigger if exists reports_after_write on public.reports;
create trigger reports_after_write
  after insert or update on public.reports
  for each row execute function public.reports_after_write();

-- Frein anti-abus : au plus 20 dépôts publics toutes les 10 minutes.
create or replace function public.reports_rate_limit()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not public.is_staff() and
     (select count(*) from public.reports where created_at > now() - interval '10 minutes') >= 20 then
    raise exception 'Trop de signalements en peu de temps, réessayez dans quelques minutes';
  end if;
  return new;
end $$;

drop trigger if exists reports_rate_limit on public.reports;
create trigger reports_rate_limit
  before insert on public.reports
  for each row execute function public.reports_rate_limit();

alter table public.reports enable row level security;
alter table public.report_events enable row level security;

-- Le public (site) : dépôt uniquement. Aucune lecture possible.
drop policy if exists "reports: dépôt public" on public.reports;
create policy "reports: dépôt public" on public.reports
  for insert to anon, authenticated
  with check (status = 'nouveau' and assigned_to is null and notes is null);

drop policy if exists "reports: l'équipe lit" on public.reports;
create policy "reports: l'équipe lit" on public.reports
  for select to authenticated using (public.is_staff());

drop policy if exists "reports: l'équipe met à jour" on public.reports;
create policy "reports: l'équipe met à jour" on public.reports
  for update to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists "reports: l'admin supprime" on public.reports;
create policy "reports: l'admin supprime" on public.reports
  for delete to authenticated using (public.is_admin());

drop policy if exists "report_events: l'équipe lit" on public.report_events;
create policy "report_events: l'équipe lit" on public.report_events
  for select to authenticated using (public.is_staff());

-- Droits par colonne : le public ne peut remplir que les champs du formulaire.
revoke all on public.reports from anon, authenticated;
grant insert (id, reference, nom, telephone, email, commune, adresse, emplacement, depuis, urgence,
              message, photo_path, lat, lng, geo_source, lang)
  on public.reports to anon, authenticated;
grant select, delete on public.reports to authenticated;
grant update (status, notes, assigned_to, lat, lng, geo_source) on public.reports to authenticated;
revoke all on public.report_events from anon, authenticated;
grant select on public.report_events to authenticated;

-- Durée de conservation : 12 mois après la clôture (récupéré ou annulé), les
-- coordonnées, l'adresse, la position, les notes et la photo sont effacées.
-- Restent la commune, les dates et le statut, pour les statistiques.
-- (L'espace apiculteur supprime d'abord les photos, puis appelle cette fonction.)
create or replace function public.anonymize_reports(report_ids uuid[])
returns integer language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  if not public.is_admin() then
    raise exception 'Réservé aux administrateurs';
  end if;
  update public.reports set
    nom = null, telephone = null, email = null, adresse = null, emplacement = null,
    message = null, notes = null, photo_path = null, lat = null, lng = null, geo_source = null,
    anonymized_at = now()
  where id = any (report_ids)
    and anonymized_at is null
    and status in ('recupere', 'annule')
    and status_changed_at < now() - interval '12 months';
  get diagnostics n = row_count;
  return n;
end $$;
revoke all on function public.anonymize_reports(uuid[]) from public;
grant execute on function public.anonymize_reports(uuid[]) to authenticated;

-- Mises à jour en direct dans l'espace apiculteur (les règles ci-dessus s'appliquent aussi).
do $$ begin
  alter publication supabase_realtime add table public.reports;
exception when duplicate_object then null; when undefined_object then null;
end $$;

-- ---------------------------------------------------------------------
-- 3. Statistiques publiques (totaux par commune, sans donnée personnelle)
-- ---------------------------------------------------------------------
create or replace function public.public_stats()
returns table (commune text, sauves bigint, signalements bigint)
language sql stable security definer set search_path = public as $$
  select c.commune,
         count(r.id) filter (where r.status = 'recupere') as sauves,
         count(r.id) as signalements
  from (values ('Cayenne'), ('Rémire-Montjoly'), ('Matoury'), ('Macouria'),
               ('Montsinéry-Tonnegrande'), ('Roura')) as c (commune)
  left join public.reports r on r.commune = c.commune
  group by c.commune
  order by sauves desc, c.commune;
$$;
revoke all on function public.public_stats() from public;
grant execute on function public.public_stats() to anon, authenticated;

-- ---------------------------------------------------------------------
-- 4. Photos (bucket privé, 10 Mo max, images seulement)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', false, 10485760,
        array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'])
on conflict (id) do update
  set public = false, file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "photos: dépôt public" on storage.objects;
create policy "photos: dépôt public" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = 'reports');

drop policy if exists "photos: l'équipe regarde" on storage.objects;
create policy "photos: l'équipe regarde" on storage.objects
  for select to authenticated
  using (bucket_id = 'photos' and public.is_staff());

drop policy if exists "photos: l'admin supprime" on storage.objects;
create policy "photos: l'admin supprime" on storage.objects
  for delete to authenticated
  using (bucket_id = 'photos' and public.is_admin());

-- ---------------------------------------------------------------------
-- 5. Premier administrateur
-- Après avoir créé votre compte (Authentication → Users → Invite user),
-- exécutez UNE fois, avec votre email :
--
--   update public.profiles set role = 'admin' where email = 'vous@exemple.com';
-- ---------------------------------------------------------------------
