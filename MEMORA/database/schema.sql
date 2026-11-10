-- MEMORA Supabase / PostgreSQL foundation
create extension if not exists pgcrypto;
create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text,
 created_at timestamptz not null default now()
);
create table if not exists public.subscriptions (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 plan text not null default 'free' check (plan in ('free','pro')),
 status text not null default 'preview',
 provider_customer_id text,
 created_at timestamptz not null default now()
);
create table if not exists public.documents (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 name text not null, storage_path text, extracted_text text, page_count integer default 0,
 extraction_status text not null default 'pending', created_at timestamptz not null default now()
);
create table if not exists public.document_sections (
 id uuid primary key default gen_random_uuid(), document_id uuid not null references public.documents(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade, title text, body text not null, page_number integer
);
create table if not exists public.study_sets (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 document_id uuid references public.documents(id) on delete set null, title text not null, subject text,
 reviewer jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);
create table if not exists public.flashcard_decks (
 id uuid primary key default gen_random_uuid(), study_set_id uuid not null references public.study_sets(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade, title text not null
);
create table if not exists public.flashcards (
 id uuid primary key default gen_random_uuid(), deck_id uuid not null references public.flashcard_decks(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade, front text not null, back text not null,
 due_at timestamptz not null default now(), interval_days integer not null default 0, ease numeric not null default 2.5, repetitions integer not null default 0
);
create table if not exists public.examinations (
 id uuid primary key default gen_random_uuid(), study_set_id uuid not null references public.study_sets(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade, title text not null, settings jsonb not null default '{}'::jsonb
);
create table if not exists public.questions (
 id uuid primary key default gen_random_uuid(), examination_id uuid not null references public.examinations(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade, question text not null, choices jsonb, answer text not null,
 explanation text, topic text, source_reference text, supported boolean not null default false
);
create table if not exists public.examination_attempts (
 id uuid primary key default gen_random_uuid(), examination_id uuid not null references public.examinations(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade, score integer not null, total integer not null,
 duration_seconds integer, created_at timestamptz not null default now()
);
create table if not exists public.answers (
 id uuid primary key default gen_random_uuid(), attempt_id uuid not null references public.examination_attempts(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade, question_id uuid not null references public.questions(id) on delete cascade,
 response text, is_correct boolean not null default false
);
create table if not exists public.mistakes (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 question_id uuid references public.questions(id) on delete set null, topic text, user_answer text, created_at timestamptz not null default now()
);
create table if not exists public.study_sessions (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 study_set_id uuid references public.study_sets(id) on delete set null, duration_minutes integer not null default 0,
 created_at timestamptz not null default now()
);
create table if not exists public.review_schedules (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 flashcard_id uuid not null references public.flashcards(id) on delete cascade, due_at timestamptz not null,
 interval_days integer not null default 0, ease numeric not null default 2.5
);
create table if not exists public.usage_quotas (
 user_id uuid primary key references auth.users(id) on delete cascade, period_start date not null default current_date,
 generation_count integer not null default 0, document_bytes bigint not null default 0
);
create index if not exists idx_documents_user on public.documents(user_id);
create index if not exists idx_sets_user on public.study_sets(user_id);
create index if not exists idx_cards_due on public.flashcards(user_id,due_at);
create index if not exists idx_attempts_user_date on public.examination_attempts(user_id,created_at desc);
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.documents enable row level security;
alter table public.document_sections enable row level security;
alter table public.study_sets enable row level security;
alter table public.flashcard_decks enable row level security;
alter table public.flashcards enable row level security;
alter table public.examinations enable row level security;
alter table public.questions enable row level security;
alter table public.examination_attempts enable row level security;
alter table public.answers enable row level security;
alter table public.mistakes enable row level security;
alter table public.study_sessions enable row level security;
alter table public.review_schedules enable row level security;
alter table public.usage_quotas enable row level security;
do $$ declare t text; begin
 foreach t in array array['profiles','subscriptions','documents','document_sections','study_sets','flashcard_decks','flashcards','examinations','questions','examination_attempts','answers','mistakes','study_sessions','review_schedules','usage_quotas'] loop
  execute format('drop policy if exists owner_all on public.%I',t);
  execute format('create policy owner_all on public.%I for all using (auth.uid() = user_id) with check (auth.uid() = user_id)',t);
 end loop;
end $$;
-- profiles uses id rather than user_id
drop policy if exists profile_owner on public.profiles;
create policy profile_owner on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
