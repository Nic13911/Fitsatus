-- ============================================================
-- FitSatus · Esquema de base de datos (Supabase / PostgreSQL)
-- Corresponde a la Capa de Datos + Capa de Persistencia descritas
-- en la Entrega 2 (arquitectura por capas) y al diagrama de clases
-- de la Entrega 1.
--
-- Cómo usarlo:
-- 1. Crea un proyecto en https://supabase.com
-- 2. Ve a "SQL Editor" -> "New query"
-- 3. Pega y ejecuta todo este archivo
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- Perfiles (extiende auth.users de Supabase) ----------
create table if not exists public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  peso numeric not null check (peso > 0),
  estatura numeric not null check (estatura > 0),
  edad integer not null check (edad > 0),
  sexo text default 'otro' check (sexo in ('femenino', 'masculino', 'otro')),
  nivel_actividad text default 'moderado' check (nivel_actividad in ('sedentario', 'ligero', 'moderado', 'activo')),
  nivel_experiencia text default 'principiante' check (nivel_experiencia in ('principiante', 'intermedio', 'experimentado')),
  created_at timestamptz default now()
);

-- ---------- Objetivos ----------
create table if not exists public.objetivos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users (id) on delete cascade,
  tipo_objetivo text not null check (tipo_objetivo in ('bajar_peso', 'ganar_musculo', 'mantenimiento')),
  meta_peso numeric,
  fecha_inicio date not null default current_date,
  fecha_meta date,
  tdee numeric,
  created_at timestamptz default now()
);

-- ---------- Planes de entrenamiento ----------
create table if not exists public.planes_entrenamiento (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users (id) on delete cascade,
  objetivo_id uuid references public.objetivos (id) on delete set null,
  nivel_dificultad text,
  frecuencia_semanal integer,
  contenido jsonb not null,
  fecha_generacion timestamptz default now()
);

-- ---------- Planes alimenticios ----------
create table if not exists public.planes_alimenticios (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users (id) on delete cascade,
  calorias_objetivo numeric,
  distribucion_macros jsonb,
  sugerencias jsonb,
  fecha_generacion timestamptz default now()
);

-- ---------- Registros diarios de calorías ----------
create table if not exists public.registros_diarios (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users (id) on delete cascade,
  fecha date not null default current_date,
  total_calorias numeric default 0,
  unique (usuario_id, fecha)
);

create table if not exists public.alimentos_registrados (
  id uuid primary key default gen_random_uuid(),
  registro_id uuid not null references public.registros_diarios (id) on delete cascade,
  nombre text not null,
  calorias numeric not null check (calorias > 0),
  created_at timestamptz default now()
);

-- ---------- Progreso (historial de peso) ----------
create table if not exists public.progreso (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users (id) on delete cascade,
  fecha date not null default current_date,
  peso numeric not null check (peso > 0),
  porcentaje_grasa numeric,
  nota text
);

-- ---------- Logros ----------
create table if not exists public.logros (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users (id) on delete cascade,
  codigo text not null,
  nombre text not null,
  descripcion text,
  fecha_obtencion timestamptz default now(),
  unique (usuario_id, codigo)
);

-- ---------- Recordatorios ----------
create table if not exists public.recordatorios (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users (id) on delete cascade,
  tipo text not null check (tipo in ('entrenamiento', 'alimentacion')),
  hora time not null,
  activo boolean default true
);

-- ============================================================
-- Row Level Security: cada usuario solo puede ver y modificar
-- su propia información.
-- ============================================================

alter table public.perfiles enable row level security;
alter table public.objetivos enable row level security;
alter table public.planes_entrenamiento enable row level security;
alter table public.planes_alimenticios enable row level security;
alter table public.registros_diarios enable row level security;
alter table public.alimentos_registrados enable row level security;
alter table public.progreso enable row level security;
alter table public.logros enable row level security;
alter table public.recordatorios enable row level security;

create policy "perfiles: propio" on public.perfiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "objetivos: propio" on public.objetivos
  for all using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);

create policy "planes_entrenamiento: propio" on public.planes_entrenamiento
  for all using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);

create policy "planes_alimenticios: propio" on public.planes_alimenticios
  for all using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);

create policy "registros_diarios: propio" on public.registros_diarios
  for all using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);

create policy "progreso: propio" on public.progreso
  for all using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);

create policy "logros: propio" on public.logros
  for all using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);

create policy "recordatorios: propio" on public.recordatorios
  for all using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);

-- alimentos_registrados no tiene usuario_id directo: se valida a través del registro diario dueño
create policy "alimentos_registrados: propio" on public.alimentos_registrados
  for all using (
    exists (
      select 1 from public.registros_diarios rd
      where rd.id = alimentos_registrados.registro_id
      and rd.usuario_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.registros_diarios rd
      where rd.id = alimentos_registrados.registro_id
      and rd.usuario_id = auth.uid()
    )
  );
