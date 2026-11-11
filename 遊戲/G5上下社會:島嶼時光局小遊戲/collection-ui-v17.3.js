'use strict';
// Keep the living companion separate from the historical card collection.
const v173RenderBefore=render;render=function(){
 v173RenderBefore();
 document.querySelectorAll('.brand small').forEach(e=>e.textContent=e.textContent.replace(/v\d+\.\d+/g,'v17.3'));
 if(!state.name)return;
 const wallet=ccState(),count=Object.keys(h17State().owned).length;
 const host=['cover','base'].includes(screen)?document.querySelector('.era-screen header')||document.querySelector('.cover .actions'):document.querySelector('.field-tools')||document.querySelector('.sea-toolbar')||document.querySelector('.z-tools,.q-tools,.j-tools,.w-tools');
 if(host&&!host.querySelector('[data-act="ccopen"]'))host.insertAdjacentHTML('beforeend',`<button data-act="ccopen" class="cc-entry primary" aria-label="歷史卡冊與知識委託">✦ 時光卡冊 <small>${count}/500 · ${wallet.tickets}券</small></button>`);
 const petHost=host||document.querySelector('.brand nav');
 if(petHost&&!app.querySelector('[data-act="pet"],[data-act="h17pet"]'))petHost.insertAdjacentHTML('beforeend',btn('🐾 夥伴小窩','h17pet','quiet'));
 document.querySelectorAll('[data-act="pet"]').forEach(b=>{b.textContent='🐾 夥伴小窩';b.setAttribute('aria-label','夥伴小窩')});
};
const v173SettingsBefore=actions.settings;actions.settings=()=>{v173SettingsBefore();overlay.querySelector('.buttons')?.insertAdjacentHTML('beforeend',btn('🐾 夥伴小窩','h17pet'))};
render();
