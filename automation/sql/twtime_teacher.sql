-- ============================================================
-- 台灣時光探險隊：老師查看學生進度（讀 game_progress 雲端存檔）
-- 另外把 twtime 加進 game_levels，原本的老師查看表格也會出現（每完成一章記一筆 play_log）
-- 需要先跑過 game_progress.sql、play_log.sql
-- ============================================================
insert into public.game_levels(game, title, levels) values
  ('twtime', '台灣時光探險隊（五年級社會）', 34)
on conflict (game) do update set title = excluded.title, levels = excluded.levels;

create or replace function public.teacher_twtime(p_pass text)
returns table(code text, name text, era text, done_chs text[], chapters int, stars int,
              cards int, bosses int, last_played timestamptz)
language plpgsql security definer set search_path = public as $$
begin
  perform assert_teacher(p_pass);
  return query
  select p.code,
         coalesce(nullif(s.label, ''), nullif(p.data->>'name', ''), '（還沒填名字）'),
         coalesce(p.data->>'era', ''),
         coalesce((select array_agg(k order by k) from jsonb_each(coalesce(p.data->'chs', '{}'::jsonb)) as c(k, v)
                   where (c.v->>'done')::boolean), '{}'),
         (select count(*)::int from jsonb_each(coalesce(p.data->'chs', '{}'::jsonb)) as c(k, v) where (c.v->>'done')::boolean),
         (select coalesce(sum(coalesce((c.v->>'stars')::int, 0)), 0)::int from jsonb_each(coalesce(p.data->'chs', '{}'::jsonb)) as c(k, v)),
         case when jsonb_typeof(p.data->'cards') = 'array' then jsonb_array_length(p.data->'cards') else 0 end,
         (select count(*)::int from jsonb_array_elements_text(case when jsonb_typeof(p.data->'g') = 'array' then p.data->'g' else '[]'::jsonb end) as f(x)
          where f.x in ('bossWin','boss_sea','boss_zheng','boss_qing1','boss_qing2','boss_jp1','boss_jp2','boss_post')),
         p.updated_at
  from game_progress p
  left join student_codes s on s.code = p.code
  where p.game = 'twtime'
  order by 2;
end $$;
grant execute on function public.teacher_twtime(text) to anon, authenticated;

notify pgrst, 'reload schema';
