-- ============================================================
-- 遊戲進度雲端存檔（跨裝置接著玩），所有大型遊戲共用，只要跑一次
-- 一個學生代碼 × 一個遊戲 = 一份進度（JSON）。以最後存檔時間較新的為準。
-- 目前使用：台灣時光探險隊（game = 'twtime'）
-- ============================================================
create table if not exists public.game_progress (
  code       text not null,
  game       text not null,
  data       jsonb not null,
  saved_at   bigint not null default 0,        -- 遊戲端存檔時間（毫秒），比新舊用
  updated_at timestamptz not null default now(),
  primary key (code, game)
);
alter table public.game_progress enable row level security;   -- 只能透過下面的函式讀寫

create or replace function public.save_progress(p_code text, p_game text, p_data jsonb, p_saved_at bigint)
returns boolean language plpgsql security definer set search_path = public as $$
declare c text := upper(trim(coalesce(p_code, '')));
begin
  if not exists (select 1 from student_codes where code = c and active) then return false; end if;
  if coalesce(p_game, '') !~ '^[a-z0-9_]{1,20}$' then return false; end if;
  if p_data is null or octet_length(p_data::text) > 200000 then return false; end if;
  insert into game_progress(code, game, data, saved_at, updated_at)
  values (c, p_game, p_data, coalesce(p_saved_at, 0), now())
  on conflict (code, game) do update
    set data = excluded.data, saved_at = excluded.saved_at, updated_at = now()
    where game_progress.saved_at <= excluded.saved_at;      -- 舊裝置的舊進度不會蓋掉新的
  return true;
end $$;
grant execute on function public.save_progress(text, text, jsonb, bigint) to anon, authenticated;

create or replace function public.load_progress(p_code text, p_game text)
returns table(data jsonb, saved_at bigint)
language sql stable security definer set search_path = public as $$
  select g.data, g.saved_at from game_progress g
  where g.code = upper(trim(coalesce(p_code, ''))) and g.game = p_game
    and exists (select 1 from student_codes s where s.code = g.code and s.active)
$$;
grant execute on function public.load_progress(text, text) to anon, authenticated;

notify pgrst, 'reload schema';
