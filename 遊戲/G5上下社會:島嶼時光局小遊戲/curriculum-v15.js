'use strict';
// Stable chapter IDs and question indices preserve existing bags, rewards and progress.
Object.assign(QING_SOURCES,{rent:['臺灣文獻館｜清代南崁租佃契字研究','https://www.th.gov.tw/News_Content/128/4208/']});
QING_CHAPTERS[1].questions[4].source='rent';
JAPAN_CHAPTERS[1].stations[1]='學校與公共衛生';
Object.assign(JAPAN_SOURCES,{
 clock:['國臺圖｜日治時期的時間與作息','https://www.ntl.edu.tw/public/Attachment/131111195377.PDF'],
 industrial:['國臺圖｜日治時期工業發展','https://www.ntl.edu.tw/public/Attachment/261311575189.PDF'],
 lin:['臺灣文獻館｜林獻堂與議會請願','https://www.th.gov.tw/Epaper_Content/238/5396/']
});
Object.assign(POSTWAR_SOURCES,{
 press:['國家檔案｜報禁與1988解禁','https://art.archives.gov.tw/tw/art/1558.html'],
 party:['國家檔案｜黨禁與結社制度變化','https://art.archives.gov.tw/tw/art/1565.html'],
 labor:['國家檔案｜戰後紡織、女工與城鄉移動','https://www.archives.gov.tw/tw/arctw/69.html?dataId=c76882a58c1513e9f9da83aaaba3717d&stage=cp'],
 rural:['國家檔案｜農村家政與戰後經濟','https://art.archives.gov.tw/tw/art/1239.html'],
 women:['國立歷史博物館｜女性勞動與家庭代工','https://exhibitonline.nmh.gov.tw/herstory/page03.html'],
 apec:['APEC｜Chinese Taipei自1991參與','https://www.apec.org/press/news-releases/2016/0825_mou'],
 wto:['WTO｜Chinese Taipei於2002入會','https://www.wto.org/english/thewto_e/acc_e/a1_taipei_chinois_e.htm']
});
const V15_SEA_OLD=HISTORY_MISSIONS.map(m=>({...m,items:[...m.items]}));
const v15OldItem=(id,n)=>({...V15_SEA_OLD.find(m=>m.id===id).items[n],legacy:[id,n]});
const V15_SEA_PHASES=[
 {title:'① 南方荷蘭據點',date:'1624年起',place:'大員・今臺南安平',power:'荷蘭東印度公司',ids:['crops','language','religion']},
 {title:'② 北方西班牙據點',date:'1626—1628',place:'雞籠、淡水・今基隆、新北',power:'西班牙',ids:['forts']},
 {title:'③ 南北交會與據點改變',date:'1642—1644',place:'雞籠、淡水',power:'荷蘭與西班牙交戰；之後荷蘭接掌',ids:['war']},
 {title:'④ 南方反抗與統治轉折',date:'1652—1662',place:'臺南一帶',power:'荷蘭統治下的反抗；後接鄭荷戰爭',ids:['resistance']}
];
function v15Phase(id){return V15_SEA_PHASES.find(p=>p.ids.includes(id))}
function v15PhaseDone(p){const h=historyState();return p.ids.every(id=>h.done.includes(id))}
function v15SeaUnlocked(id){const n=V15_SEA_PHASES.findIndex(p=>p.ids.includes(id));return n>=0&&V15_SEA_PHASES.slice(0,n).every(v15PhaseDone)}
const v15Changes={
 crops:{phaseDate:'1624年起｜農業交流主題',items:V15_SEA_OLD[0].items.map((q,n)=>v15OldItem('crops',n))},
 language:{title:'南方通譯的手稿',place:'南方大員・新港文與契約',scene:'harbor',node:'translation',phaseDate:'荷蘭時期｜另回顧清代延續',items:V15_SEA_OLD[1].items.map((q,n)=>v15OldItem('language',n))},
 religion:{title:'南方的城堡與教會',place:'南方大員・熱蘭遮城與改革宗',scene:'harbor',node:'church',phaseDate:'1624年起｜南方據點主題',brief:'先把南方荷蘭據點記清楚；北方西班牙的城堡與天主教，下一段再探索。',memory:'荷蘭東印度公司在南部大員建立據點，熱蘭遮城遺跡連結今臺南安平古堡。南部荷蘭傳教活動主要為基督新教改革宗，並學習當地語言。',items:[v15OldItem('forts',0),v15OldItem('religion',0),v15OldItem('religion',2),Hq('南方航線紀錄','大員據點最能連結哪一項目的？',['利用東亞航線從事貿易與經營據點','只為取得北部西班牙天主教堂'],0,'荷蘭東印度公司透過據點參與亞洲貿易；大員是南方荷蘭據點，不能換成北方西班牙據點。','war')],review:Hq('南方記憶','哪組是同一條南方線索？',['大員—荷蘭—熱蘭遮城—改革宗','雞籠—西班牙—熱蘭遮城—改革宗'],0,'南部大員連結荷蘭、熱蘭遮城與改革宗。北部西班牙另有據點與天主教活動。','religion')},
 forts:{title:'北方城堡與傳教路線',place:'北方雞籠、淡水・西班牙',scene:'north',node:'viewpoint',phaseDate:'1626雞籠 → 1628淡水',brief:'船從馬尼拉駛來。先找雞籠，再去淡水，把西班牙的城堡與天主教接在北方。',memory:'1626西班牙自馬尼拉到雞籠建聖薩爾瓦多城（今基隆和平島遺址）；1628於淡水建聖多明哥城。北部西班牙傳教主要是天主教。今日紅毛城主堡不是1628原城完整留存。',items:[Hq('1626・從哪裡來','西班牙前往北臺灣的船隊主要從哪個據點出發？',['馬尼拉','南部大員荷蘭商館'],0,'馬尼拉是西班牙在菲律賓的重要據點；1626船隊先到雞籠，再向淡水擴展。','keelung'),v15OldItem('forts',2),v15OldItem('forts',3),v15OldItem('religion',1),Hq('北方旅行單','先替兩處北方據點排出正確先後。',['1626雞籠→1628淡水','1626淡水→1628雞籠'],0,'西班牙先在雞籠建立據點，後在淡水建聖多明哥城；1642與1644的控制變化下一段再讀。','tamsui')],review:Hq('北方記憶','哪一組屬於北方西班牙線索？',['雞籠與淡水—聖薩爾瓦多、聖多明哥—天主教','大員—熱蘭遮城—改革宗'],0,'西班牙在北部雞籠建聖薩爾瓦多城、在淡水建聖多明哥城，並傳播天主教；荷蘭在南部主要傳播改革宗。','religion')},
 war:{title:'1642急報與1644重建',phaseDate:'1642戰爭 → 1644重建',place:'北方雞籠、淡水・據點易手',memory:'1642年荷蘭擊敗北部西班牙勢力，西班牙退出北臺灣。1644年荷蘭在淡水興建安東尼堡，這座建築是今日紅毛城主堡的前身。',items:[v15OldItem('war',0),v15OldItem('war',1),v15OldItem('war',2),v15OldItem('forts',4)]},
 resistance:{title:'1652反抗到1662轉折',phaseDate:'1652事件 → 1653建城 → 1661—1662鄭荷戰爭',items:[v15OldItem('resistance',0),v15OldItem('resistance',1),v15OldItem('resistance',2),v15OldItem('resistance',3),v15OldItem('war',3)]}
};
for(const m of HISTORY_MISSIONS){Object.assign(m,v15Changes[m.id]);m.items.forEach((q,n)=>{q.key=m.id+'-'+n;q.region=v15Phase(m.id).place});}
HISTORY_MISSIONS.find(m=>m.id==='resistance').memory+=' 1661鄭成功來臺，1662荷蘭投降，與1652郭懷一事件不同。';
// Re-map completed old questions by identity, not their former numeric slot.
const v15HistoryStateBefore=historyState;
historyState=function(){const h=v15HistoryStateBefore();if(h.contentRevision!==15){const answered={};for(const m of V15_SEA_OLD)answered[m.id]=Array.isArray(h.eventAnswers?.[m.id])?[...h.eventAnswers[m.id]]:Array.from({length:h.steps[m.id]||0},(_,n)=>n);h.eventAnswers={};for(const m of HISTORY_MISSIONS){h.eventAnswers[m.id]=m.items.flatMap((q,n)=>q.legacy&&answered[q.legacy[0]]?.includes(q.legacy[1])?[n]:[]);h.steps[m.id]=h.eventAnswers[m.id].length}h.reviewDone=[];h.contentRevision=15;h.active=null;h.reviewing=false;return v15HistoryStateBefore()}return h};
// Remove obsolete north-side Xinkan points; place every investigation in its own region.
Object.assign(RPG_SEA_STATIONS.language,{scene:'harbor',names:['南方通譯手稿','新港文契約箱'],positions:[[.37,.82],[.87,.52]]});
Object.assign(RPG_SEA_STATIONS.religion,{scene:'harbor',names:['熱蘭遮城調查單','改革宗教會紀錄'],positions:[[.73,.36],[.63,.82]]});
Object.assign(RPG_SEA_STATIONS.forts,{scene:'north',names:['雞籠的城堡圖','淡水與天主教紀錄'],positions:[[.53,.56],[.82,.73]]});
for(const s of Object.values(SEA_SCENES))s.nodes=s.nodes.filter(n=>!n.evidence);
for(const [id,s] of Object.entries(RPG_SEA_STATIONS))s.positions.forEach(([x,y],k)=>SEA_SCENES[s.scene].nodes.push({id:'evidence-'+id+'-'+k,name:s.names[k],x,y,evidence:id,part:k,icon:s.icon}));
// A conversation continues through all remaining questions at the touched mission point.
nextSeaEvent=function(m,station=null){const a=seaAnswered()[m.id];return m.items.findIndex((q,n)=>!a.includes(n))};
const v15HistoryOpenBefore=historyOpen;
historyOpen=function(id,station=null){if(id&&!v15SeaUnlocked(id))return v15SeaLocked();if(id)voyage().quest=id;return v15HistoryOpenBefore(id,station)};
function v15SeaLocked(){const p=V15_SEA_PHASES.find(p=>!v15PhaseDone(p));feedback.sfx('wrong');return rpgSpeaker('先把這段航線記清楚',`<p>下一段會比較不同地方。先完成「${p.title}」的調查，才不會把南北或年份混在一起。</p>`,btn('查看目前委託','rpgquests','primary')+btn('繼續探索','rpgeventclose','quiet'),p.date+'｜'+p.place)}
const v15GuideBefore=rpgGuideSea;rpgGuideSea=function(id){if(!v15SeaUnlocked(id))return v15SeaLocked();return v15GuideBefore(id)};
rpgQuestBoard=function(){if(screen!=='ocean')return rpgJournal();seaMode='explore';render();const h=historyState();panel('沿航線找回記憶',`<p>先南方，再北方，最後比較據點易手與統治轉折。每個調查點可連續回答，中途離開會記住進度。</p>${V15_SEA_PHASES.map(p=>`<section class="v15-phase"><h3>${p.title}</h3><small>${p.date}｜${p.place}</small><div class="rpg-quest-list">${p.ids.map(id=>{const m=HISTORY_MISSIONS.find(m=>m.id===id);return `<button data-rpg-quest="${id}" ${v15SeaUnlocked(id)?'':'disabled'}><strong>${m.icon} ${m.title}</strong><small>${h.done.includes(id)?'✓ 已收藏':!v15SeaUnlocked(id)?'先完成前一段':h.steps[id]+'/'+m.items.length+' 個線索'}</small></button>`}).join('')}</div></section>`).join('')}${h.done.length===6?btn('南北比較・營火回想','historyreview','primary'):''}`,btn('回到探索','rpgeventclose','quiet'));overlay.className='rpg-workbench-overlay'};actions.rpgquests=rpgQuestBoard;actions.historyboard=rpgQuestBoard;
const v15BeginTravelBefore=seaBeginTravel;seaBeginTravel=function(to){if(to==='north'&&!v15PhaseDone(V15_SEA_PHASES[0]))return v15SeaLocked();return v15BeginTravelBefore(to)};
const v15SeaInteractBefore=seaInteract;seaInteract=function(id){const o=voyage();if(o.scene==='north'&&id==='recorder'&&!o.tasks.north)return seaNarrate([['小澄','現在的航線來到1626年。西班牙船隊從馬尼拉出發，先在雞籠建立據點，1628年再到淡水。'],['小澄','這裡的線索是聖薩爾瓦多城、聖多明哥城與天主教。南方大員的荷蘭、改革宗與新港文，別搬到這裡。','北方印記：1626、1628']],()=>{o.tasks.north=true});return v15SeaInteractBefore(id)};
const v15GoalBefore=seaGoal;seaGoal=function(){if(voyage().tasks.cargo){const p=V15_SEA_PHASES.find(p=>!v15PhaseDone(p));if(p)return p.date+'｜'+p.title+'：'+HISTORY_MISSIONS.find(m=>p.ids.includes(m.id)&&!historyState().done.includes(m.id)).title}return v15GoalBefore()};
actions.oceanhint=()=>{const p=V15_SEA_PHASES.find(p=>!v15PhaseDone(p));if(voyage().tasks.cargo&&p)return rpgGuideSea(p.ids.find(id=>!historyState().done.includes(id)));if(voyage().scene==='sea')return toast('從海圖選擇目前開放的港口。');seaGo(voyage().scene==='north'?'recorder':voyage().scene==='warehouse'?'clerk':voyage().tasks.south?'warehouse':'dock')};
const v15SeaHeaderBefore=seaHeader;seaHeader=function(){let html=v15SeaHeaderBefore().replace(/v\d+\.\d+/g,'v15.1');const m=HISTORY_MISSIONS.find(m=>m.id===voyage().quest),p=m&&v15Phase(m.id);if(m&&RPG_SEA_STATIONS[m.id].scene===voyage().scene)html+=`<div class="v15-sea-context">${m.phaseDate}｜${p.place}｜${p.power}</div>`;return html};
const v15EraDetailBefore=eraDetailUI;eraDetailUI=function(){if(state.uiEra!=='voyage')return v15EraDetailBefore();return `<main class="era-screen era-detail"><header><div>${btn('← 時代總覽','rpgages','quiet')}<h1>大航海時代</h1><p>1624 → 1626／1628 → 1642／1644 → 1652／1653 → 1661／1662</p><p>先辨南北，再看控制者與事件怎麼改變。</p></div>${btn('接續航線 →','oceanenter','primary')}</header><div class="era-chapters">${V15_SEA_PHASES.map((p,i)=>`<button class="era-chapter" data-v15-phase="${i}" ${v15SeaUnlocked(p.ids[0])?'':'disabled'}><img src="assets/maritime-${i===1||i===2?'north':i===3?'warehouse':'harbor'}-v7.png" alt=""><span><small>${p.date}｜${p.place}</small><strong>${p.title}</strong><em>${p.power}</em><b>${v15PhaseDone(p)?'✓ 線索已收藏':v15SeaUnlocked(p.ids[0])?'出發探索 →':'先完成前一段調查'}</b></span></button>`).join('')}</div><footer>${btn('▤ 航線手帳','rpgjournal')}${btn('✦ 南北綜合回想','rpgoceanreview')}${btn('跨章記憶連線','v15recall')}</footer></main>`};
// Correct the family summary: 1681 belongs to the later succession chapter.
ZHENG_CHAPTERS[2].memory='鄭成功在1662年去世，兒子鄭經接續經營臺灣，1664年將東都改稱東寧。鄭芝龍、鄭成功、鄭經是三代父子；鄭克臧與鄭克塽則都是鄭經的兒子。陳永華協助政務與教育。1681年鄭經去世後發生權力鬥爭，鄭克臧遇害，鄭克塽繼位。';
ZHENG_CHAPTERS[2].timeNote='1662年鄭成功去世後，由兒子鄭經接續。1681年鄭經去世後，家族爆發爭權，鄭克臧遇害，鄭克塽被擁立。';
function v15YearLabel(c,q){const years=(c.date.match(/\d{4}/g)||[]).map(Number),start=years[0]||c.anchor,end=Math.max(...years,c.anchor||start);return q.eventYear?(q.eventYear<start?'回顧':q.eventYear>end?'前瞻比較':'本段史料')+'｜'+q.eventYear+'年':c.date}
const v15SpeakerBefore=rpgSpeaker;rpgSpeaker=function(who,body,buttons,object='',portrait=''){let q,c;if(screen==='qing'&&qRun&&!qRun.final){c=QING_CHAPTERS[qRun.chapter];q=c.questions[qRun.index]}else if(screen==='japan'&&jRun&&!jRun.final){c=JAPAN_CHAPTERS[jRun.chapter];q=c.questions[jRun.index]}else if(screen==='postwar'&&wRun&&!wRun.final){c=POSTWAR_CHAPTERS[wRun.chapter];q=c.questions[wRun.index]}else if(screen==='zheng'&&zRun&&!zRun.final){c=ZHENG_CHAPTERS[zRun.chapter];q=c.questions[zRun.index]}if(q&&c)body=`<small class="v15-time">${v15YearLabel(c,q)}</small>${c.timeNote?`<p class="v15-story">${c.timeNote}</p>`:''}${q.context?`<p class="v15-story">${q.context}</p>`:''}`+body;
 if(screen==='ocean'&&rpgEvent?.kind==='sea'){const m=rpgEvent.m,p=v15Phase(m.id);body=`<small class="v15-time">${m.phaseDate}｜${p.place}<br>${p.power}</small>`+body}
 return v15SpeakerBefore(who,body,buttons,object,portrait)};
// Mixed retrieval draws only from investigated chapters; answers never overwrite story progress.
let v15RecallRun=null;
function v15RecallPool(){const pool=[];for(const [era,list,progress] of [['qing',QING_CHAPTERS,qProgress],['japan',JAPAN_CHAPTERS,jProgress],['postwar',POSTWAR_CHAPTERS,wProgress]])list.forEach((c,i)=>c.questions.forEach((q,n)=>{if(q.revision===15&&progress(i).answers.includes(n))pool.push({id:era+':'+c.id+':'+n,era,c,q})}));return pool}
function v15Recall(){const pool=v15RecallPool(),seen=state.recallV15?.done||[];if(!pool.length)return rpgSpeaker('記憶連線還在等待','<p>先完成清領、日治或戰後的新重點調查，再到這裡跨章回想。</p>',btn('回到旅程','v15recallclose','primary'));const pending=pool.filter(p=>!seen.includes(p.id));v15RecallRun={queue:(pending.length?pending:pool).slice(0,3),step:0,feedback:null};v15RecallShow()}
function v15RecallShow(){const r=v15RecallRun,p=r.queue[r.step];rpgSpeaker('營火旁・跨章記憶連線',`<small class="v15-time">${v15YearLabel(p.c,p.q)}｜${p.c.title}</small><p>${p.q.q}</p>${r.feedback?`<div class="rpg-answer ${r.feedback.correct?'right':''}"><strong>${r.feedback.correct?'✦ 接上了':'回看這段線索'}</strong><p>${p.q.why}</p></div>`:`<div class="rpg-choices">${[1,2,0].map(n=>`<button data-v15-recall="${n}">${p.q.o[n]}</button>`).join('')}</div>`}`,r.feedback?btn(r.feedback.correct?r.step+1===r.queue.length?'完成這輪回想':'下一段記憶 →':'再試一次','v15recallnext','primary')+btn('先離開，下次繼續','v15recallclose','quiet'):btn('先離開，下次繼續','v15recallclose','quiet'),`${r.step+1}/${r.queue.length}｜只抽已完成的調查`)}
function v15RecallAnswer(n){const r=v15RecallRun;if(!r||r.feedback||!Number.isInteger(n)||!r.queue[r.step].q.o[n])return;r.feedback={correct:n===r.queue[r.step].q.a};if(r.feedback.correct){state.recallV15=state.recallV15||{done:[]};if(!state.recallV15.done.includes(r.queue[r.step].id))state.recallV15.done.push(r.queue[r.step].id);save()}feedback.sfx(r.feedback.correct?'pickup':'wrong');v15RecallShow()}
actions.v15recall=v15Recall;actions.v15recallclose=()=>{v15RecallRun=null;dismiss();render()};actions.v15recallnext=()=>{const r=v15RecallRun;if(!r?.feedback)return;if(!r.feedback.correct){r.feedback=null;return v15RecallShow()}if(++r.step<r.queue.length){r.feedback=null;return v15RecallShow()}v15RecallRun=null;feedback.sfx('clear');rpgSpeaker('這輪記憶接上了','<p>已記住完成的線索。下次優先回想其他重點；故事、背包和章節進度都保留。</p>',btn('回到旅程','v15recallclose','primary'))};
const v15ActorsBefore=seaActors;seaActors=function(){return v15ActorsBefore().filter(n=>!n.evidence||v15SeaUnlocked(n.evidence))};
const v15RenderBefore=render;render=function(){v15RenderBefore();if(screen==='ocean'){for(const n of SEA_SCENES[voyage().scene]?.nodes||[]){if(!n.evidence)continue;const e=spotsLayer.querySelector(`[data-seanode="${n.id}"]`);if(!v15SeaUnlocked(n.evidence))e?.remove();else if(historyState().done.includes(n.evidence)){const bubble=e?.querySelector('.bubble');if(bubble)bubble.textContent='✓'}}}if(screen==='base'&&['qing','japan','postwar'].includes(state.uiEra))document.querySelector('.era-detail footer')?.insertAdjacentHTML('beforeend',btn('✦ 跨章記憶連線','v15recall'));document.querySelectorAll('.brand small').forEach(e=>e.textContent=e.textContent.replace(/v\d+\.\d+/g,'v15.1'))};
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;const d=b.dataset;if(d.v15Recall!==undefined)v15RecallAnswer(+d.v15Recall);if(d.v15Phase!==undefined){const p=V15_SEA_PHASES[+d.v15Phase];if(!p||!v15SeaUnlocked(p.ids[0]))return;enterVoyage();voyage().intro=true;seaMode='explore';rpgGuideSea(p.ids.find(id=>!historyState().done.includes(id))||p.ids[0]);seaSave();render()}});
render();
