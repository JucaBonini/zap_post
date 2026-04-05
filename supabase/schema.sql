-- Schema for RSS Flow SaaS

-- 1. Profiles Table (Linked to Auth)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  billing_tier text default 'free',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. RSS Feeds Table
create table public.feeds (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  url text not null,
  is_active boolean default true,
  posts_limit_daily integer default 10,
  last_synced_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Posts (Sent History & Deduplication)
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  feed_id uuid references public.feeds on delete cascade not null,
  guid text not null, -- Unique identifier from RSS
  title text,
  link text,
  status text default 'sent', -- 'pending', 'sent'
  sent_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(feed_id, guid) -- Critical for deduplication!
);

-- 4. WhatsApp Instances (Token/Key storage)
create table public.whatsapp_instances (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  instance_name text not null,
  instance_key text not null, -- API Key/Session Name
  status text default 'disconnected',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS (Row Level Security) - Always Pro!
alter table public.profiles enable row level security;
alter table public.feeds enable row level security;
alter table public.posts enable row level security;
alter table public.whatsapp_instances enable row level security;

-- Policies
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

create policy "Users can manage own feeds" on public.feeds for all using (auth.uid() = user_id);

create policy "Users can view own posts" on public.posts for select 
  using (exists (select 1 from public.feeds f where f.id = feed_id and f.user_id = auth.uid()));

create policy "Users can manage own instances" on public.whatsapp_instances for all using (auth.uid() = user_id);
