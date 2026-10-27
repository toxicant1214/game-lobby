# 遊戲書房：自動做遊戲流程

排程每小時跑一次，照這份文件做。人（pi）只需要：在試算表把 F 欄改成「前製素材整理完成」，以及最後測試、合併 PR。

## 資料來源

- 需求試算表：遊戲書房共備整理表
  https://docs.google.com/spreadsheets/d/14Vc3jgRtbq2FrfT4DUrMYkJEfTPvm3aaBxgQ-FlWTwE/edit （工作表1）
  欄位：A 年級 / B 科目 / C 提案人 / D 版本／單元 / E 遊戲構想 / F 開發進度
- 素材庫（Google Drive）：遊戲書房素材庫，id `1q8nr8arzc51lccc9ptcndQRqnQoowwIC`
  每個需求一個子資料夾，名稱接近 D 欄（例如「南一L7-L12成語」）。裡面有課文／詞語清單（pdf、docx）和〈關卡建議〉。
- 用 Google Drive 連接器讀（帳號 pi1050911@gmail.com）。

## 每次執行的步驟

1. 讀試算表。找出 F 欄 = 「前製素材整理完成」的列。
2. 跟 `automation/handled.json` 比對（key = `D 欄文字`）。已經處理過的跳過。沒有新的就直接結束，不要通知。
3. 對每個新的需求（一次最多做一個，其他留給下一小時）：
   1. 先在 `handled.json` 加上這筆（`{"key": D欄, "row": 列號, "started": 日期, "branch": 分支名}`），commit 到 main 並 push，避免下一次重複做。
   2. 到素材庫找對應子資料夾，讀所有檔案。找不到素材或內容不夠做遊戲 → 不要硬做，改成通知 pi 缺什麼。
   3. 用 `course-game-maker` skill 做遊戲，關卡依 E 欄構想和〈關卡建議〉。
   4. 用 `add-to-game-lobby` skill 的規則做成 Netlify 版本，放進 `遊戲/G<年級><學期><科目>:<名稱>小遊戲/index.html`，並在 `遊戲/index.html` 的遊戲清單加一筆、`遊戲/admin.html` 的 #which 選單加一個選項。
   5. 寫排行榜 SQL 到 `automation/sql/<table>.sql`（照 `automation/sql/` 裡最新那份的格式：新資料表 + submit_xxx 函式，並把新表加進 reset_leaderboards() 的清單、admin_reset_game() 的 case）。
   6. 用 Supabase Management API 執行 SQL：
      `POST https://api.supabase.com/v1/projects/wbxpqyrkgdaqvtsmijoe/database/query`，
      body `{"query": "<SQL>"}`。金鑰設在雲端環境的「網路密鑰」，由 proxy 自動加上 Authorization header，不用自己帶（看不到金鑰是正常的）。
      如果回 401，代表網路密鑰沒設好：不要猜金鑰，把 SQL 留在 PR 裡，請 pi 手動貼到 Supabase SQL Editor，並告訴 pi 網路密鑰要檢查。
      執行前先查現有的 reset_leaderboards() 內容（`select pg_get_functiondef('public.reset_leaderboards'::regproc)`），確定沒漏掉任何舊表。
   7. 開分支 `game/<英文短名>`，commit，開 PR 到 main。PR 說明寫：哪個需求、關卡內容、Netlify 預覽網址怎麼看、排行榜 SQL 是否已執行成功。
   8. 等 Netlify 的 deploy preview 出現（PR 的檢查項目裡），把預覽網址寫進 PR 留言。
4. 結束時的摘要要寫清楚：做了哪個遊戲、PR 連結、預覽網址、需要 pi 做什麼（測試後按 Merge）。

## pi 的固定規則（每個遊戲都要遵守）

- 成績卡不要有「驗證碼」，也不要有「把這張卡截圖傳給老師」那行。卡片在總分／星星那行就結束（跟除法估商王一樣）。
- 要標學期：大廳寫「115上 南一第 7～12 課」，遊戲首頁寫「115 學年上學期 … 」。學年從日期推：8 月～1 月是上學期，2～7 月是下學期；民國年 = 西元年 − 1911（上學期用當年的學年）。
- pi 喜歡「連續對話」的情境關卡：多輪 LINE 式對話，自動往下播，讓學生選出對的回覆，不要只是單題。
- Netlify 版：`<body>` 後面要有 bz-back 連結、bz-guard、bz-session 腳本，`REMOTE=true`，home() 要有 bz_name 自動帶入（照「除法估商王」複製）。
- 學年換了要做新資料夾，不要覆蓋舊遊戲。

## 不要做的事

- 不要直接 push 遊戲到 main（main 一推就上線）。一律走 PR，讓 pi 測試後自己合併。
- 不要刪除或清空任何現有的 Supabase 資料表。
- 不要改試算表內容（F 欄由 pi 自己改）。
