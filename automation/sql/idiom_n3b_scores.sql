-- ============================================================
-- 成語大冒險（南一三上國語 L7～12）排行榜（整份貼進 Supabase SQL Editor，按 Run 一次）
-- ============================================================
create table if not exists public.idiom_n3b_scores (
  player_id  text not null,
  world      text not null,            -- w1~w5、total 總分
  name       text not null,
  score      int  not null default 0,
  secs       int  not null default 0,
  stars      int  not null default 0,
  updated_at timestamptz not null default now(),
  primary key (player_id, world)
);
alter table public.idiom_n3b_scores enable row level security;
drop policy if exists "anyone can read idiom_n3b" on public.idiom_n3b_scores;
create policy "anyone can read idiom_n3b" on public.idiom_n3b_scores for select using (true);

create or replace function public.submit_idiom_n3b(p_world text, p_id text, p_name text, p_score int, p_secs int, p_stars int)
returns int language plpgsql security definer set search_path = public as $$
declare r int;
begin
  if p_world !~ '^(w[1-5]|total)$' then return null; end if;
  if p_score < 0 or p_score > 2000 or p_secs < 0 or p_secs > 36000 then return null; end if;
  if length(trim(p_name)) = 0 or length(p_name) > 12 then return null; end if;
  insert into idiom_n3b_scores(player_id, world, name, score, secs, stars, updated_at)
  values (p_id, p_world, trim(p_name), p_score, p_secs, p_stars, now())
  on conflict (player_id, world) do update
    set score = excluded.score, secs = excluded.secs, name = excluded.name, updated_at = now()
    where excluded.score > idiom_n3b_scores.score
       or (excluded.score = idiom_n3b_scores.score and excluded.secs < idiom_n3b_scores.secs);
  update idiom_n3b_scores set stars = greatest(stars, p_stars), name = trim(p_name)
    where player_id = p_id and world = p_world;
  select count(*) + 1 into r from idiom_n3b_scores m, idiom_n3b_scores me
    where me.player_id = p_id and me.world = p_world and m.world = p_world
      and (m.score > me.score or (m.score = me.score and m.secs < me.secs));
  return r;
end $$;
grant execute on function public.submit_idiom_n3b(text, text, text, int, int, int) to anon, authenticated;
grant select on public.idiom_n3b_scores to anon, authenticated;

-- 加進「每兩個月清除」和主任一鍵清除的名單
create or replace function public.reset_leaderboards()
returns int language plpgsql security definer set search_path = public as $$
declare
  t text; n int; total int := 0;
  tbls text[] := array['scores','force_scores','air_water_scores','yb_scores','family_quest_scores','moon_scores','laojia_scores','traffic_scores','divking_scores','idiom_k4_scores','idiom_n4_scores','idiom_h4_scores','idiom_n3b_scores'];  -- 新遊戲的表加在這裡
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

-- 主任室：單獨清除某個遊戲的排行榜（含所有新遊戲）
create or replace function public.admin_reset_game(p_pass text, p_game text)
returns int language plpgsql security definer set search_path = public as $$
declare t text; w text := 'true'; n int;
begin
  perform assert_admin(p_pass);
  case p_game
    when 'plants'  then t := 'scores'; w := 'game = ''plants-unit1''';
    when 'aquatic' then t := 'scores'; w := 'game = ''aquatic-plants''';
    when 'force'   then t := 'force_scores';
    when 'air'     then t := 'air_water_scores';
    when 'yb'      then t := 'yb_scores';
    when 'family'  then t := 'family_quest_scores';
    when 'moon'    then t := 'moon_scores';
    when 'laojia'  then t := 'laojia_scores';
    when 'traffic' then t := 'traffic_scores';
    when 'divking' then t := 'divking_scores';
    when 'idiom4'  then t := 'idiom_k4_scores';
    when 'idiomn4' then t := 'idiom_n4_scores';
    when 'idiomh4' then t := 'idiom_h4_scores';
    when 'idiomn3b' then t := 'idiom_n3b_scores';
    else raise exception 'unknown game';
  end case;
  if to_regclass('public.'||t) is null then return 0; end if;
  execute format(
    'insert into score_archive(season, source, data)
     select to_char(now() at time zone ''Asia/Taipei'',''YYYY-MM''), %L, to_jsonb(x) from %I x where %s', t, t, w);
  execute format('delete from %I where %s', t, w);
  get diagnostics n = row_count;
  return n;
end $$;
grant execute on function public.admin_reset_game(text, text) to anon;

notify pgrst, 'reload schema';
