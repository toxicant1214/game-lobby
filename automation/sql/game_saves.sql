-- ============================================================
-- 遊戲書房：跨裝置雲端存檔（島嶼時光局，之後其他遊戲也能共用）
-- 整份貼進 Supabase SQL Editor，按 Run 一次
-- 不會被「排行榜清除」清掉
-- ============================================================
create table if not exists public.game_saves (
  code       text   not null,            -- 學生代碼
  game       text   not null,            -- 遊戲代號，例如 island
  data       jsonb  not null,
  stamp      bigint not null default 0,  -- 裝置端存檔時間（毫秒），新的才覆蓋
  updated_at timestamptz not null default now(),
  primary key (code, game)
);
alter table public.game_saves enable row level security;   -- 不開放直接讀表，只能透過下面兩個函式
revoke all on public.game_saves from anon, authenticated;

-- 檢查代碼是否有效（沿用書房登入用的 enter_code）
create or replace function public._game_code_ok(p_code text)
returns boolean language plpgsql security definer set search_path = public as $$
declare j jsonb;
begin
  if p_code is null or p_code !~ '^[A-Z0-9]{5}$' then return false; end if;
  select to_jsonb(x) into j from enter_code(p_code) x limit 1;
  if j ? 'enter_code' then j := j->'enter_code'; end if;
  return coalesce((j->>'ok')::boolean, false);
exception when others then return false;
end $$;
revoke execute on function public._game_code_ok(text) from public, anon, authenticated;

create or replace function public.load_game_save(p_code text, p_game text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare s game_saves;
begin
  if p_game !~ '^[a-z0-9_-]{1,30}$' or not _game_code_ok(p_code) then return jsonb_build_object('ok', false); end if;
  select * into s from game_saves where code = p_code and game = p_game;
  return jsonb_build_object('ok', true, 'data', s.data, 'stamp', coalesce(s.stamp, 0));
end $$;

create or replace function public.save_game_save(p_code text, p_game text, p_data jsonb, p_stamp bigint)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  if p_game !~ '^[a-z0-9_-]{1,30}$' or not _game_code_ok(p_code) then return jsonb_build_object('ok', false); end if;
  if p_data is null or jsonb_typeof(p_data) <> 'object' or octet_length(p_data::text) > 3000000 then
    return jsonb_build_object('ok', false, 'why', 'size');
  end if;
  insert into game_saves(code, game, data, stamp, updated_at)
  values (p_code, p_game, p_data, p_stamp, now())
  on conflict (code, game) do update
    set data = excluded.data, stamp = excluded.stamp, updated_at = now()
    where excluded.stamp >= game_saves.stamp;      -- 舊裝置的舊進度不會蓋掉新的
  return jsonb_build_object('ok', true);
end $$;

grant execute on function public.load_game_save(text, text) to anon, authenticated;
grant execute on function public.save_game_save(text, text, jsonb, bigint) to anon, authenticated;

notify pgrst, 'reload schema';
