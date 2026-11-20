/* One course-wide route. Only nearby gates, nodes and road segments enter the DOM. */
(()=>{'use strict';let active=null;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function layout(course,track='all',completed=[]){
 const passed=new Set(completed),items=[];let y=105,index=0,prior=null;
 for(const [chapterIndex,ch]of course.chapters.entries()){
  const lessons=ch.sessions.filter(s=>track==='all'||s.kind===track);if(!lessons.length)continue;
  items.push({type:'gate',chapter:ch,chapterIndex,x:180,y,complete:lessons.filter(s=>passed.has(s.id)).length,total:lessons.length});y+=155;
  for(const lesson of lessons){const done=passed.has(lesson.id),unlocked=done||prior===null||passed.has(prior);items.push({type:'lesson',chapter:ch,lesson,index,x:180+Math.sin(index*1.16)*68,y,done,unlocked});index++;prior=lesson.id;y+=172;}
  y+=45;
 }
 return {items,height:y+40,count:index};
}
function road(items,from,to,top,height){const points=items.slice(Math.max(0,from-1),Math.min(items.length,to+2));let d='';for(const [i,p]of points.entries()){if(!i)d=`M${p.x} ${p.y-top}`;else{const prev=points[i-1],gap=Math.min(86,(p.y-prev.y)/2);d+=` C${prev.x} ${prev.y-top+gap} ${p.x} ${p.y-top-gap} ${p.x} ${p.y-top}`;}}return `<svg class="trail-svg" viewBox="0 0 360 ${height}" preserveAspectRatio="none" aria-hidden="true"><path class="trail-edge" d="${d}"/><path class="trail-road" d="${d}"/><path class="trail-stitches" d="${d}"/></svg>`;}
function draw(){const a=active;if(!a)return;const rect=a.host.getBoundingClientRect(),min=-rect.top-650,max=-rect.top+innerHeight+900;let from=a.route.items.findIndex(p=>p.y>=min);if(from<0)from=Math.max(0,a.route.items.length-1);let to=from;while(to<a.route.items.length-1&&a.route.items[to+1].y<=max)to++;const key=from+':'+to;if(a.key===key)return;a.key=key;const top=Math.max(0,a.route.items[Math.max(0,from-1)]?.y-100||0),bottom=Math.min(a.route.height,(a.route.items[Math.min(a.route.items.length-1,to+1)]?.y||0)+180),height=bottom-top;
 a.host.innerHTML=`<div class="trail-road-window" style="top:${top}px;height:${height}px">${road(a.route.items,from,to,top,height)}</div>`+a.route.items.slice(from,to+1).map(item=>{
  if(item.type==='gate')return `<section class="chapter-gate ${item.complete===item.total?'gate-complete':''}" data-chapter-gate="${item.chapter.id}" style="top:${item.y}px"><span class="gate-section">${item.chapterIndex?'NEXT SECTION':'YOUR JOURNEY STARTS HERE'} · ${String(item.chapterIndex+1).padStart(2,'0')}</span><h2>${esc(item.chapter.title)}</h2><span class="gate-progress">${item.complete} / ${item.total} adventures${item.complete===item.total?' · Complete ✓':''}</span><span class="gate-post left" aria-hidden="true"></span><span class="gate-post right" aria-hidden="true"></span></section>`;
  const s=item.lesson,symbol=item.done?'✓':s.kind==='interview'?'★':s.kind==='definitions'?'◆':s.kind==='summary'?'▤':'●';return `<div class="stage-stop" role="listitem" aria-posinset="${item.index+1}" aria-setsize="${a.route.count}" data-chapter="${item.chapter.id}" style="left:${item.x/3.6}%;top:${item.y}px"><button class="stage-node ${item.done?'done':item.unlocked?'current':'locked'}" data-action="stage" data-course="${a.course.id}" data-stage="${s.id}" ${item.unlocked?'':'disabled'} aria-label="${esc(s.title)}${item.done?', completed':item.unlocked?'':', locked'}"><span aria-hidden="true">${symbol}</span></button><span class="stage-label"><small>${({learning:'Explore',summary:'Review',definitions:'Define',interview:'Explain'})[s.kind]}</small>${esc(s.title)}</span>${item.unlocked&&!item.done?`<span class="stage-miko" aria-hidden="true">${a.fox()}</span>`:''}</div>`;
 }).join('');
}
function scroll(){if(active&&!active.frame)active.frame=requestAnimationFrame(()=>{if(active)active.frame=null;draw();});}
function focus(chapter){if(!active)return;const item=chapter?active.route.items.find(p=>p.type==='gate'&&String(p.chapter.id)===String(chapter)):active.route.items.find(p=>p.type==='lesson'&&p.unlocked&&!p.done)||active.route.items[0];if(item){window.scrollTo({top:active.host.getBoundingClientRect().top+scrollY+item.y-145,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}}
function destroy(){if(active?.frame)cancelAnimationFrame(active.frame);active=null;window.removeEventListener('scroll',scroll);window.removeEventListener('resize',scroll);}
function mount(options){destroy();active={...options,route:layout(options.course,options.track,options.completed),key:''};active.host.style.height=active.route.height+'px';active.host.setAttribute('role','list');active.host.setAttribute('aria-label','Continuous course trail with chapter gates');window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('resize',scroll,{passive:true});draw();return active.route;}
function atmosphere(theme){return `<div class="world-atmosphere atmosphere-${theme}" aria-hidden="true">${Array.from({length:14},(_,i)=>`<i class="world-particle" style="--p:${i};left:${(i*37+9)%100}%;top:${(i*23+5)%100}%;--duration:${14+i%6*3}s;--delay:${-i*3}s;--size:${6+(i%4)*4}px"></i>`).join('')}</div>`;}
window.WorldTrail={mount,destroy,focus,layout,atmosphere};
})();
