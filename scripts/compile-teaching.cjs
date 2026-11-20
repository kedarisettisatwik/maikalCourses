/* Keep original source readings intact; build teaching stages from authored explanations. */
const foundations=require('../courses/authored/oops-foundations.cjs');
const definitions=require('../courses/authored/oops-definitions.cjs');
function paragraphs(text){const out=[];for(const paragraph of String(text||'').split(/\n\s*\n/).map(s=>s.trim()).filter(Boolean)){const sentences=paragraph.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g)||[paragraph];let current='';for(const sentence of sentences){if(current&&(current+' '+sentence).trim().split(/\s+/).length>90){out.push(current.trim());current='';}current+=sentence+' ';}if(current.trim())out.push(current.trim());}return out;}
function compile(c,ch,reading,legacy){
 // Do not replace unreviewed textbook coverage with a much shorter companion summary.
 if(c.id!=='oops'||ch.id!==1){if(c.id==='oops')for(const session of legacy)if(session.kind==='definitions')for(const card of session.cards){const definition=definitions[card.title.toLowerCase().replace(/\s+/g,' ').trim()];if(definition){card.text=definition;card.authored=true;}}return {sessions:legacy,legacyLearningIds:[],legacySummaryIds:[],teachingSource:'full source reading; rewrite pending',reviewedRewrite:false};}
 const originalLearning=legacy.filter(s=>s.kind==='learning'),originalSummary=legacy.filter(s=>s.kind==='summary');
 const guides=c.id==='oops'&&ch.id===1?foundations:ch.lessons.filter(l=>!/^Chapter map|^Connect the concepts|^Source reading|^Complete source/i.test(l.title));
 if(!guides.length)throw Error('No teaching guides for '+c.id+' '+ch.id);
 const stages=[],reviews=[];let index=0;
 const visualByIndex=['objects','objects','access','abstraction','encapsulation','inheritance','polymorphism','binding','message'];
 for(const [guideIndex,guide]of guides.entries()){
  const cards=paragraphs(guide.body).map(text=>({title:guide.title,text,kind:'explanation'}));
  if(c.id==='oops'&&ch.id===1&&cards[0])cards[0].visual=visualByIndex[guideIndex]||(guideIndex>=18&&guideIndex<=22?'lifecycle':null);
  if(guide.code)cards.push({title:guide.title+' · Example',text:guide.takeaway,code:guide.code,kind:'example'});
  if(!cards.length)continue;
  const pool=guide.questions?.length?guide.questions:ch.questions;
  const words=new Set((guide.title+' '+guide.body).toLowerCase().match(/[a-z]{4,}/g)||[]),score=q=>(q.question+' '+q.explanation).toLowerCase().split(/\W+/).filter(w=>words.has(w)).length;
  const question=[...pool].sort((a,b)=>score(b)-score(a))[0];if(!question)throw Error('No checkpoint for '+guide.title);
  for(let offset=0;offset<cards.length;offset+=4){index++;const part=cards.slice(offset,offset+4);stages.push({id:originalLearning[index-1]?.id||c.id+'-'+ch.id+'-learning-teach-'+index,kind:'learning',title:guide.title,topics:[guide.title],goal:guide.takeaway,cards:part,questions:[question],authored:true});}
  reviews.push({title:guide.title,text:guide.takeaway,kind:'review'});
 }
 for(let i=0;i<reviews.length;i+=4){const cards=reviews.slice(i,i+4),question=stages[Math.min(stages.length-1,i)].questions[0];stages.push({id:c.id+'-'+ch.id+'-summary-teach-'+(i/4+1),kind:'summary',title:cards.length===1?cards[0].title:'Connect: '+cards.slice(0,2).map(c=>c.title).join(' & '),topics:cards.map(c=>c.title),goal:'Recall the key ideas, then explain how they work together.',cards,questions:[question],authored:true});}
 const retained=legacy.filter(s=>!['learning','summary'].includes(s.kind));
 if(c.id==='oops')for(const session of retained)if(session.kind==='definitions')for(const card of session.cards){const definition=definitions[card.title.toLowerCase().replace(/\s+/g,' ').trim()];if(definition){card.text=definition;card.kind='definition';card.authored=true;}}
 const result={sessions:[...stages,...retained],legacyLearningIds:originalLearning.map(s=>s.id),legacySummaryIds:originalSummary.map(s=>s.id),teachingSource:c.id==='oops'&&ch.id===1?'reviewed local rewrite':'companion explanation curriculum',reviewedRewrite:c.id==='oops'&&ch.id===1};
 return result;
}
module.exports={compile,paragraphs};
