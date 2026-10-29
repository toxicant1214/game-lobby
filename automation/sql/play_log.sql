-- ============================================================
-- 遊玩次數、全破紀錄、老師查看名單（所有遊戲共用，只要跑一次）
-- 每個遊戲每玩完一關，就呼叫 log_play() 記一筆。
-- 新遊戲：在下面 game_levels 加一行（遊戲代號、名稱、關卡數），再跑一次這份。
-- 老師密碼不寫在這裡：存在 admin_secret 的 id = 2（只存雜湊）。
-- ============================================================

create table if not exists public.play_log (
  id        bigserial primary key,
  code      text not null,            -- 學生代碼（student_codes.code）
  game      text not null,            -- 遊戲代號，和主任室清除排行榜用的一樣
  world     text not null,            -- 哪一關
  score     int  not null default 0,
  passed    boolean not null default false,
  played_at timestamptz not null default now()
);
create index if not exists play_log_game_code on public.play_log(game, code);
alter table public.play_log enable row level security;   -- 沒有開放直接讀寫，只能透過下面的函式

-- 每個遊戲有幾關（每一關都過關 = 全破）
create table if not exists public.game_levels (
  game   text primary key,
  title  text not null,
  levels int  not null
);
alter table public.game_levels enable row level security;
drop policy if exists "anyone can read game_levels" on public.game_levels;
create policy "anyone can read game_levels" on public.game_levels for select using (true);
grant select on public.game_levels to anon, authenticated;

insert into public.game_levels(game, title, levels) values
  ('plants',   '植物大冒險（三上自然）',            1),   -- 一次玩完 7 關，玩完就算全破
  ('air',      '空氣和水大冒險（三上自然）',        4),
  ('force',    '力量大冒險（三上自然）',            4),
  ('aquatic',  '水之國生存挑戰（四上自然）',        1),   -- 一次玩完全部關卡
  ('yb',       '因倍數大冒險（五上數學）',          15),  -- 5 種玩法 × 3 種難度
  ('family',   '家庭稱謂大挑戰（三上社會）',        1),
  ('moon',     '追月小偵探（四上自然）',            5),
  ('laojia',   '阿嬤的三合院（四上社會）',          5),
  ('traffic',  '環島交通王（四上社會）',            6),
  ('divking',  '除法估商王（四上數學）',            6),
  ('idiom4',   '成語大冒險 康軒版（四上國語）',     4),
  ('idiomn4',  '成語大冒險 南一版（四上國語）',     4),
  ('idiomh4',  '成語大冒險 翰林版（四上國語）',     4),
  ('idiomn3b', '成語大冒險 南一版 L7～12（三上國語）', 5)
on conflict (game) do update set title = excluded.title, levels = excluded.levels;

-- 排行榜上的名字只顯示部分（王小明 → 王○明），和大廳的 maskName() 一樣
create or replace function public.mask_name(n text)
returns text language sql immutable as $$
  select case when char_length(t) <= 1 then t
              when char_length(t) = 2 then left(t, 1) || '○'
              else left(t, 1) || repeat('○', char_length(t) - 2) || right(t, 1) end
  from (select trim(coalesce(n, '')) as t) x
$$;

-- 遊戲每玩完一關呼叫一次
create or replace function public.log_play(p_code text, p_game text, p_world text, p_score int, p_passed boolean)
returns boolean language plpgsql security definer set search_path = public as $$
declare c text := upper(trim(coalesce(p_code, '')));
begin
  if not exists (select 1 from student_codes where code = c and active) then return false; end if;
  if not exists (select 1 from game_levels where game = p_game) then return false; end if;
  if coalesce(p_world, '') !~ '^[A-Za-z0-9_-]{1,20}$' then return false; end if;
  -- 同一關 3 秒內重複送出只算一次
  if exists (select 1 from play_log where code = c and game = p_game and world = p_world
             and played_at > now() - interval '3 seconds') then return false; end if;
  insert into play_log(code, game, world, score, passed)
  values (c, p_game, p_world, greatest(0, least(coalesce(p_score, 0), 100000)), coalesce(p_passed, false));
  return true;
end $$;
grant execute on function public.log_play(text, text, text, int, boolean) to anon, authenticated;

-- 排行榜用：每個名字（遮過）玩了幾次、有沒有全破。不含代碼和完整姓名。
create or replace function public.game_stats(p_game text)
returns table(name text, plays int, cleared boolean)
language sql stable security definer set search_path = public as $$
  select mask_name(s.label), count(*)::int,
         count(distinct l.world) filter (where l.passed) >= g.levels
  from play_log l
  join student_codes s on s.code = l.code
  join game_levels g on g.game = l.game
  where l.game = p_game and s.label <> ''
  group by s.code, s.label, g.levels
$$;
grant execute on function public.game_stats(text) to anon, authenticated;

-- 老師密碼（id = 2）或主任密碼（id = 1）都可以看名單
create or replace function public.assert_teacher(p_pass text)
returns void language plpgsql security definer set search_path = public, extensions as $$
begin
  if not exists (select 1 from admin_secret
                 where id in (1, 2) and pass_hash is not null and crypt(p_pass, pass_hash) = pass_hash) then
    raise exception 'wrong password';
  end if;
end $$;
revoke execute on function public.assert_teacher(text) from public, anon, authenticated;

-- 老師查看：所有玩過的孩子（完整姓名）。p_game = 'all' 或空白就是全部遊戲。
create or replace function public.teacher_report(p_pass text, p_game text)
returns table(game text, title text, code text, name text, plays int, passed_levels int, levels int,
              cleared boolean, total_best int, last_played timestamptz)
language plpgsql security definer set search_path = public as $$
begin
  perform assert_teacher(p_pass);
  return query
  with per_world as (
    select l.game, l.code, l.world, max(l.score) as best, count(*) as n,
           bool_or(l.passed) as ok, max(l.played_at) as last_at
    from play_log l
    where coalesce(p_game, 'all') in ('all', '') or l.game = p_game
    group by l.game, l.code, l.world
  )
  select w.game, g.title, w.code, coalesce(nullif(s.label, ''), '（還沒填名字）'),
         sum(w.n)::int, (count(*) filter (where w.ok))::int, g.levels,
         (count(*) filter (where w.ok)) >= g.levels,
         sum(w.best)::int, max(w.last_at)
  from per_world w
  join game_levels g on g.game = w.game
  left join student_codes s on s.code = w.code
  group by w.game, g.title, g.levels, w.code, s.label
  order by g.title, 4;
end $$;
grant execute on function public.teacher_report(text, text) to anon, authenticated;

-- 主任室清除某個遊戲（或全部）的排行榜時，遊玩紀錄也一起清除（先備份到 score_archive）
create or replace function public.admin_reset_plays(p_pass text, p_game text)
returns int language plpgsql security definer set search_path = public as $$
declare n int;
begin
  perform assert_admin(p_pass);
  insert into score_archive(season, source, data)
    select to_char(now() at time zone 'Asia/Taipei', 'YYYY-MM'), 'play_log', to_jsonb(x)
    from play_log x where p_game = 'all' or x.game = p_game;
  delete from play_log where p_game = 'all' or game = p_game;
  get diagnostics n = row_count;
  return n;
end $$;
grant execute on function public.admin_reset_plays(text, text) to anon;

-- 每兩個月自動清除（和主任室「全部遊戲」清除）也包含遊玩紀錄
-- 注意：之後每個新遊戲的 SQL 重寫這個函式時，清單第一個要保留 'play_log'
create or replace function public.reset_leaderboards()
returns int language plpgsql security definer set search_path = public as $$
declare
  t text; n int; total int := 0;
  tbls text[] := array['play_log','scores','force_scores','air_water_scores','yb_scores','family_quest_scores','moon_scores','laojia_scores','traffic_scores','divking_scores','idiom_k4_scores','idiom_n4_scores','idiom_h4_scores','idiom_n3b_scores'];  -- 新遊戲的表加在這裡
begin
  foreach t in array tbls loop
    if to_regclass('public.'||t) is not null then
      execute format(
        'insert into score_archive(season, source, data)
         select to_char(now() at time zone ''Asia/Taipei'',''YYYY-MM''), %L, to_jsonb(x) from %I x', t, t);
      execute format('delete from %I where true', t);
      get diagnostics n = row_count; total := total + n;
    end if;
  end loop;
  return total;
end $$;
revoke execute on function public.reset_leaderboards() from public, anon, authenticated;

notify pgrst, 'reload schema';
