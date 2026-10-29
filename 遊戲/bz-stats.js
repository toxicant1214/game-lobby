/* 遊玩次數和全破紀錄（所有遊戲共用）
   bzLog(遊戲代號, 關卡, 分數, 是否過關)：每玩完一關呼叫一次
   bzStats(遊戲代號)：排行榜用，回傳 { 遮過的名字: { plays: 次數, cleared: 是否全破 } }
   bzStatsNow[遊戲代號]：bzStats 讀完之後的同一份資料（給不能等待的程式用） */
(function(){
  var U = "https://wbxpqyrkgdaqvtsmijoe.supabase.co/rest/v1/rpc/";
  var K = "sb_publishable_04ZnsTSBxbREalRf2NWfeA_L1rzM9V4";
  function get(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
  function rpc(fn, args){
    return fetch(U + fn, { method:"POST", headers:{ apikey:K, "Content-Type":"application/json" }, body: JSON.stringify(args) })
      .then(function(r){ return r.ok ? r.json() : null; });
  }
  var cache = {};
  window.bzStatsNow = {};
  window.bzLog = function(game, world, score, passed){
    var code = get("bz_code");
    if(!code) return Promise.resolve(false);
    delete cache[game];
    return rpc("log_play", { p_code: code, p_game: game, p_world: String(world),
      p_score: Math.max(0, Math.round(Number(score) || 0)), p_passed: !!passed })
      .then(function(){ return window.bzStats(game); })
      .catch(function(){ return false; });
  };
  window.bzStats = function(game){
    if(!cache[game]){
      cache[game] = rpc("game_stats", { p_game: game }).then(function(rows){
        var m = {};
        (rows || []).forEach(function(r){
          var x = m[r.name] || (m[r.name] = { plays: 0, cleared: false });
          x.plays += r.plays; x.cleared = x.cleared || r.cleared;
        });
        window.bzStatsNow[game] = m;
        return m;
      }).catch(function(){ delete cache[game]; return window.bzStatsNow[game] || {}; });
    }
    return cache[game];
  };
  /* 名字後面的小標記，例如「王○明 🏆」 */
  window.bzTag = function(game, name){
    var s = (window.bzStatsNow[game] || {})[name];
    return s && s.cleared ? " 🏆" : "";
  };
  window.bzPlays = function(game, name){
    var s = (window.bzStatsNow[game] || {})[name];
    return s ? s.plays : 0;
  };
})();
