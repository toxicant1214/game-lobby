/* 遊戲書房串接（倍思學院）：書房名字自動帶入＋跨裝置雲端存檔。
   獨立檔案，必須在 save-storage.js 之前載入；不改動遊戲本身的程式。
   沒有從書房登入（沒有學生代碼）時完全不動作，遊戲照原本的本機存檔運作。 */
(function(){
  'use strict';
  var SB_URL = 'https://wbxpqyrkgdaqvtsmijoe.supabase.co';
  var SB_KEY = 'sb_publishable_04ZnsTSBxbREalRf2NWfeA_L1rzM9V4';
  var GAME = 'island';
  var MAIN = 'island-time-rpg-v3';
  var KEYS = [MAIN, MAIN + '-voyage-v1', MAIN + '-prehistory-v1'];
  var OWNER = 'bz-island-owner', STAMP = 'bz-island-stamp', RELOADED = 'bz-island-reloaded';

  var proto = Storage.prototype, rawGet = proto.getItem, rawSet = proto.setItem, rawDel = proto.removeItem;
  var ls; try { ls = window.localStorage; rawGet.call(ls, 'x'); } catch (e) { return; }
  function get(k){ try { return rawGet.call(ls, k); } catch (e) { return null; } }
  function set(k, v){ try { v == null ? rawDel.call(ls, k) : rawSet.call(ls, k, v); } catch (e) {} }

  var code = (get('bz_code') || '').trim().toUpperCase();
  var bookName = (get('bz_name') || '').trim().slice(0, 12);
  if (new URLSearchParams(location.search).has('qa')) return;   // 測試模式不同步
  if (!/^[A-Z0-9]{5}$/.test(code)) return;                        // 沒從書房登入：純本機

  /* 1. 換人：這台裝置上的進度屬於別的代碼，先清掉再向雲端拿自己的 */
  var owner = get(OWNER);
  if (owner && owner !== code) { KEYS.forEach(function(k){ set(k, null); }); set(STAMP, null); }
  set(OWNER, code);

  /* 2. 名字：主存檔裡的名字換成書房名字 */
  function fixName(text){
    if (!bookName || !text) return text;
    try { var o = JSON.parse(text); if (o && typeof o === 'object' && o.name !== bookName) { o.name = bookName; return JSON.stringify(o); } } catch (e) {}
    return text;
  }
  var cur = get(MAIN); if (cur) set(MAIN, fixName(cur));

  /* 3. 攔截遊戲的存檔寫入，記錄時間並排程上傳 */
  var ready = false, dirty = false, timer = null;
  function touched(){ if (!ready) { dirty = true; return; } set(STAMP, String(Date.now())); schedule(); }
  proto.setItem = function(k, v){
    if (this === ls && KEYS.indexOf(k) >= 0) { rawSet.call(this, k, k === MAIN ? fixName(String(v)) : v); touched(); return; }
    return rawSet.call(this, k, v);
  };
  proto.removeItem = function(k){
    var r = rawDel.call(this, k);
    if (this === ls && KEYS.indexOf(k) >= 0) touched();
    return r;
  };

  function rpc(fn, args, keepalive){
    return fetch(SB_URL + '/rest/v1/rpc/' + fn, { method: 'POST', keepalive: !!keepalive,
      headers: { apikey: SB_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(args) })
      .then(function(r){ if (!r.ok) throw new Error(r.status); return r.json(); });
  }
  function bundle(){ var d = {}; KEYS.forEach(function(k){ var v = get(k); if (v != null) d[k] = v; }); return d; }
  function push(final){
    clearTimeout(timer); timer = null;
    var stamp = Number(get(STAMP) || 0); if (!stamp) return;
    var args = { p_code: code, p_game: GAME, p_data: bundle(), p_stamp: stamp };
    var small = JSON.stringify(args).length < 60000;
    rpc('save_game_save', args, final && small).catch(function(){});
  }
  function schedule(){ if (!timer) timer = setTimeout(push, 4000); }
  document.addEventListener('visibilitychange', function(){ if (document.hidden && timer) push(true); });
  window.addEventListener('pagehide', function(){ if (timer) push(true); });

  /* 4. 開啟時向雲端拿進度：雲端比較新就換上並重新整理一次 */
  rpc('load_game_save', { p_code: code, p_game: GAME }).then(function(r){
    var local = Number(get(STAMP) || 0), hasLocal = !!get(MAIN);
    if (r && r.ok && r.data && Number(r.stamp) > local && !sessionStorage.getItem(RELOADED)) {
      KEYS.forEach(function(k){ set(k, k in r.data ? (k === MAIN ? fixName(r.data[k]) : r.data[k]) : null); });
      set(STAMP, String(r.stamp));
      try { sessionStorage.setItem(RELOADED, '1'); } catch (e) {}
      location.reload(); return;
    }
    try { sessionStorage.removeItem(RELOADED); } catch (e) {}
    ready = true;
    if (r && r.ok && (dirty || (hasLocal && local > Number(r.stamp || 0)) || (hasLocal && !r.data))) {
      if (!local || dirty) set(STAMP, String(Date.now()));
      push();
    }
  }).catch(function(){ ready = true; if (dirty) { set(STAMP, String(Date.now())); schedule(); } });

  /* 5. 選角畫面：名字欄直接填書房名字、不能改 */
  if (bookName) {
    var lock = function(){
      var el = document.getElementById('player-name');
      if (el && (el.value !== bookName || !el.readOnly)) {
        el.value = bookName; el.readOnly = true; el.title = '名字來自遊戲書房';
        el.style.opacity = '.85';
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    };
    new MutationObserver(lock).observe(document.documentElement, { childList: true, subtree: true });
  }
})();
