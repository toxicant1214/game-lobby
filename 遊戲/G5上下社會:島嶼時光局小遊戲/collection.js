'use strict';
// Shared wallet for historical memory cards; original creature cards are retired.
let ccValidated=null,ccBusy=false,ccPage='summon',ccLastReward='';
function ccMilestones(){const list=[{key:'starter',title:'新手探險補給',tickets:3,complete:!!state.name}];
 CH.forEach((c,i)=>list.push({key:'pre:'+i,title:'史前｜'+c.title,tickets:1,complete:(state.progress[i]?.stars||0)>0,era:'prehistory',chapter:i}));
 const h=state.ocean?.lessons||{};V15_SEA_PHASES.forEach((p,i)=>list.push({key:'sea:'+i,title:'大航海｜'+p.title,tickets:1,complete:p.ids.every(id=>{const m=HISTORY_MISSIONS.find(m=>m.id===id);return h.done?.includes(id)||(h.eventAnswers?.[id]?.length||h.steps?.[id]||0)>=m.items.length}),era:'voyage',chapter:i}));
 for(const[era,chapters]of[['zheng',ZHENG_CHAPTERS],['qing',QING_CHAPTERS],['japan',JAPAN_CHAPTERS],['postwar',POSTWAR_CHAPTERS]])chapters.forEach((c,i)=>{const p=state[era]?.chapters?.[c.id];list.push({key:era+':'+c.id,title:({zheng:'鄭氏',qing:'清領',japan:'日治',postwar:'戰後'})[era]+'｜'+c.title,tickets:1,complete:!!(p?.activity&&p.delivered&&p.answers?.length===c.questions.length),era,chapter:i})});
 const pk=state.prehistoryKnowledge,o=state.ocean;const finals=[!!pk&&(pk.rewarded||pk.recall?.length===3&&pk.sorted?.length===6&&pk.located?.length===6&&pk.orderDone),!!o&&(o.tasks?.review||h.done?.length===6&&h.reviewDone?.length===6),...['zheng','qing','japan','postwar'].map((era,i)=>!!state[era]&&(state[era].rewarded===true||state[era].final?.length===[6,16,21,26][i]))];
 ['史前','大航海','鄭氏','清領','日治','戰後'].forEach((name,i)=>list.push({key:'final:'+i,title:name+'年代總複習',tickets:2,complete:finals[i]}));return list}
function ccNumber(n,fallback=0,max=1000000000){return Number.isInteger(n)&&n>=0&&n<=max?n:fallback}
function ccRoll(c){let x=c.seed>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;c.seed=x>>>0||7331;return c.seed/4294967296}
function ccSample(a,c){return a[Math.min(a.length-1,Math.floor(ccRoll(c)*a.length))]}
function ccState(){
 if(state.collection===ccValidated&&ccValidated)return ccValidated;
 const old=state.collection&&typeof state.collection==='object'&&!Array.isArray(state.collection)?state.collection:{};
 const complete=()=>ccMilestones().filter(m=>m.complete).map(m=>m.key);
 const validKeys=new Set(ccMilestones().map(m=>m.key));
 const deferred=old.v===2?old.deferredClaims:Array.isArray(old.legacy)?old.legacy:complete();
 const c={v:2,tickets:ccNumber(old.tickets),rewardCredits:ccNumber(old.rewardCredits)%3,claims:old.claims&&typeof old.claims==='object'&&!Array.isArray(old.claims)?Object.fromEntries(Object.entries(old.claims).filter(([k,v])=>validKeys.has(k)&&v===true)):{},deferredClaims:Array.isArray(deferred)?[...new Set(deferred.filter(k=>validKeys.has(k)))]:complete(),seed:(ccNumber(old.seed,7331,4294967295)>>>0)||7331};
 // Rebuild from a whitelist: owned, legacy, creature teams/reveals/battles never enter this wallet.
 state.collection=c;ccValidated=c;return c;
}
function ccReward(c,credits=1){c.rewardCredits=(c.rewardCredits||0)+credits;const tickets=Math.floor(c.rewardCredits/3);c.rewardCredits%=3;c.tickets+=tickets;return tickets}
function ccGrant(c,m){if(c.claims[m.key])return false;c.claims[m.key]=true;ccReward(c,m.tickets);return true}
function ccTransaction(fn){if(ccBusy)return false;const old=JSON.stringify(ccState());ccBusy=true;try{const result=fn(ccState());save();if(!saveOK){state.collection=JSON.parse(old);ccValidated=null;toast('尚未成功存檔，這次操作沒有扣券。請先匯出進度。');return false}return result===undefined?true:result}catch(e){state.collection=JSON.parse(old);ccValidated=null;toast('操作未完成，卡牌與抽卡券已保留。');console.error(e);return false}finally{ccBusy=false}}
// Historic earned milestones remain pending for explicit backfill; future completions grant once.
const ccSaveBefore=save;save=function(){const c=state.collection?ccState():null,backup=c?JSON.stringify(c):null;let earned=0;if(c)for(const m of ccMilestones())if(m.complete&&!c.deferredClaims.includes(m.key)&&ccGrant(c,m))earned+=m.tickets;ccSaveBefore();if(!saveOK&&backup){state.collection=JSON.parse(backup);ccValidated=null}else if(earned)ccLastReward=c.tickets>JSON.parse(backup).tickets?'完成旅程補給，抽卡券已存入錢包。':'旅程補給已保存。'};
function ccPending(){const c=ccState();return ccMilestones().filter(m=>m.complete&&!c.claims[m.key])}
function ccSummonSound(kind,rare=false){feedback.unlock?.();if(!feedback.audio||typeof feedback.note!=='function')return feedback.sfx(kind==='charge'?'portal':'card');const at=feedback.audio.currentTime+.02;if(kind==='charge'){feedback.note(65,at,.8,'sine',.15,'sfx',260);[196,247,294,392,494,587,784].forEach((f,i)=>feedback.note(f,at+i*.075,.24,'triangle',.09));}else{[0,4,7,12,...(rare?[16,19,24]:[])].forEach((n,i)=>feedback.note(261.63*2**(n/12),at+i*.055,.65,'triangle',.11));feedback.note(65,at,.5,'sine',.18);}}
function ccRift(){return `<div class="cc-rift" aria-hidden="true"><i></i><i></i><i></i><b>✦</b>${Array.from({length:16},(_,i)=>`<em style="--a:${i*22.5}deg;--d:${i%4*.27}s"></em>`).join('')}</div>`}
function ccClaim(){const ms=ccPending();if(!ms.length)return;let amount=ms.reduce((n,m)=>n+m.tickets,0);if(ccTransaction(c=>{for(const m of ms)ccGrant(c,m)})){feedback.sfx('clear');ccLastReward='旅程補給已領取並保存。';ccOpen('summon')}}

function ccOpen(page='summon'){return h17Open(page)}
Object.assign(actions,{ccclaim:ccClaim,ccclose:()=>{dismiss();render()}});
ccState();
