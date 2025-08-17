-- Food items and meals
create table if not exists public.food_items (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references auth.users on delete cascade,
  name         text not null,
  calories     numeric not null,
  protein      numeric not null,
  carbs        numeric not null,
  fat          numeric not null,
  created_at   timestamptz default now()
);

create table if not exists public.meals (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references auth.users on delete cascade,
  meal_time    timestamptz default now()
);

create table if not exists public.meal_items (
  meal_id      uuid references public.meals on delete cascade,
  food_id      uuid references public.food_items on delete cascade,
  portion_mult numeric default 1.0,   -- 1 = default portion
  primary key (meal_id, food_id)
);

-- Enable row-level security
alter table public.food_items enable row level security;
alter table public.meals      enable row level security;
alter table public.meal_items enable row level security;

-- Policies: owner can select/insert/update/delete
create policy "Users can manage own food" on public.food_items
  using ( auth.uid() = user_id ) with check ( auth.uid() = user_id );

create policy "Users can manage own meals" on public.meals
  using ( auth.uid() = user_id ) with check ( auth.uid() = user_id );

create policy "Users can manage own meal items" on public.meal_items
  using ( auth.uid() = ( select user_id from public.meals where id = meal_id ) )
  with check ( auth.uid() = ( select user_id from public.meals where id = meal_id ) );
