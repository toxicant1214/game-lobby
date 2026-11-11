'use strict';
// Hand-item interaction is supplied by delivery-v17.2.js.
const v171InteractBefore=interact;
function v171RememberEra(){const era=h17CanonicalEra(screen);if(!era)return;const h=h17State();h.visited=Array.isArray(h.visited)?h.visited:[];if(!h.visited.includes(era))h.visited.push(era);h.lastPlayed=era;save()}
for(const [key,original]of[['pre',enter],['sea',enterVoyage],['zheng',zEnter],['qing',qEnter],['japan',jEnter],['postwar',wEnter]]){const wrapped=function(...args){const result=original(...args);if(h17CanonicalEra(screen)===key)v171RememberEra();return result};if(key==='pre')enter=wrapped;if(key==='sea')enterVoyage=wrapped;if(key==='zheng')zEnter=wrapped;if(key==='qing')qEnter=wrapped;if(key==='japan')jEnter=wrapped;if(key==='postwar')wEnter=wrapped}
// A pointer release commits the registration even when an IME consumes its following click.
// Never rerender the input while it is composing, and never commit twice.
let v171Registration=null,v171NameComposing=false;
const v171StartBefore=actions.start;
function v171RegistrationIntent(){if(screen!=='setup')return null;const input=document.querySelector('#player-name');if(!input)return null;if(!v171Registration||v171Registration.input!==input||v171Registration.done)v171Registration={input,done:false,released:false,pointer:null};return v171Registration}
function v171CommitRegistration(){const r=v171Registration;if(!r||r.done||!r.released||screen!=='setup')return;const name=String(r.input.value||'').trim();if(!name){r.released=false;r.pointer=null;v171NameComposing=false;toast('先替探險員取個暱稱吧。');return}r.done=true;v171NameComposing=false;v171StartBefore()}
function v171RequestRegistration(){const r=v171RegistrationIntent();if(!r||r.done)return;r.released=true;r.input.blur?.();setTimeout(v171CommitRegistration,v171NameComposing?80:0)}
actions.start=v171RequestRegistration;
document.addEventListener('compositionstart',e=>{if(e.target.id==='player-name'){v171NameComposing=true;v171RegistrationIntent()}},true);
document.addEventListener('compositionend',e=>{if(e.target.id==='player-name'){v171NameComposing=false;if(v171Registration?.released)v171CommitRegistration()}},true);
document.addEventListener('pointerdown',e=>{const b=e.target.closest?.('[data-act="start"]');if(!b||b.dataset.act!=='start'||screen!=='setup')return;const r=v171RegistrationIntent();if(r){r.pointer=e.pointerId;r.button=b;r.released=false}},true);
document.addEventListener('pointerup',e=>{const r=v171Registration;if(!r||r.pointer!==e.pointerId||r.done||screen!=='setup')return;const b=e.target.closest?.('[data-act="start"]'),rect=r.button?.getBoundingClientRect();const within=rect&&e.clientX>=rect.left&&e.clientX<=rect.right&&e.clientY>=rect.top&&e.clientY<=rect.bottom;if(b||within)v171RequestRegistration();else r.pointer=null},true);
document.addEventListener('pointercancel',()=>{if(v171Registration){v171Registration.pointer=null;v171Registration.released=false}},true);
document.addEventListener('click',e=>{const b=e.target.closest?.('[data-act="start"]');if(!b||b.dataset.act!=='start')return;e.preventDefault();e.stopImmediatePropagation();if(screen==='setup')v171RequestRegistration()},true);
document.addEventListener('keydown',e=>{if(e.target.id==='player-name'&&e.key==='Enter'&&!e.isComposing&&e.keyCode!==229&&!v171NameComposing){e.preventDefault();v171RequestRegistration()}},true);
const v171FlowRenderBefore=render;render=function(){v171FlowRenderBefore();document.querySelectorAll('.brand small').forEach(e=>e.textContent=e.textContent.replace(/v\d+\.\d+/g,'v17.1'))};
render();
