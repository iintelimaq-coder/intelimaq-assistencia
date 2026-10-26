-- Execute este SQL no SQL Editor do Supabase.
-- Ele cria o cadastro de empresas e vincula os atendimentos a uma empresa.

create table if not exists public.empresas (
  id bigint generated always as identity primary key,
  nome text not null unique,
  criado_em timestamptz not null default now()
);

alter table public.atendimentos
  add column if not exists empresa_id bigint references public.empresas(id),
  add column if not exists contato text;

alter table public.empresas enable row level security;

-- Para a configuração simplificada sem login escolhida pelo usuário.
-- Isso permite leitura e gravação públicas; use apenas se aceitar esse risco.
drop policy if exists "Leitura pública de empresas" on public.empresas;
create policy "Leitura pública de empresas" on public.empresas for select to anon using (true);
drop policy if exists "Cadastro público de empresas" on public.empresas;
create policy "Cadastro público de empresas" on public.empresas for insert to anon with check (true);
drop policy if exists "Edição pública de empresas" on public.empresas;
create policy "Edição pública de empresas" on public.empresas for update to anon using (true) with check (true);

-- Confirma que o papel anon pode usar a tabela; as políticas existentes de atendimentos
-- para SELECT/INSERT/UPDATE devem continuar ativas.
grant select, insert, update on public.empresas to anon;
grant select, insert, update on public.atendimentos to anon;
grant usage, select on all sequences in schema public to anon;
