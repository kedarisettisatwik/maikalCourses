/* Derive learning labels from the source's headings and glossary, never page numbers. */
const tidy=s=>String(s||'').normalize('NFKC').replace(/[\u00ad\u200b]/g,'').replace(/\s+/g,' ').trim();
function title(s){s=tidy(s).replace(/^(?:unit|chapter)\s*\d+\s*[:.—-]?\s*/i,'').replace(/^\d+(?:\.\d+)*\.?\s+/,'').replace(/^(?:[♦➤•]|[-–—])\s*/,'');if(s===s.toUpperCase()&&/[A-Z]/.test(s))s=s.toLowerCase().replace(/(^|[\s/-])([a-z])/g,(_,a,b)=>a+b.toUpperCase()).replace(/\b(Api|Tcp|Ip|Osi|Sql|Html|Http|Css|Jvm|Jsp|Oop|Ui|Xml|Json|Cpu|Dns|Tls|Ssl|Aes|Rsa|Des)\b/g,s=>s.toUpperCase());return s;}
const stop=new Set('the a an of and to for in on with from this that it is are be as by at or how what why its your their you we our which has have using into'.split(' '));
const tokens=s=>tidy(s).toLowerCase().match(/[a-z][a-z0-9+#-]{2,}/g)?.filter(x=>!stop.has(x))||[];
const generic=/^(?:Source PDF page|Complete source chapter|Chapter map|Learning goals|Think before|Model answer|Interview question|Connect the concepts)/i;
function enrich(ch,reading,sessions,courseId){
 const headings=(reading.contents||[]).map(x=>({raw:tidy((x.number?x.number+' ':'')+x.title),label:title(x.title)})).filter(x=>x.label.length>3);
 const terms=[...new Set([...[(require('./topic-vocabulary.cjs')[courseId]||'').split('|')].flat(),...[...(reading.terms||[]),...ch.terms].map(([t])=>title(t))])].filter(x=>x.length>2);
 const patterns=terms.map(t=>({t,re:new RegExp('\\b'+t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b','i')}));
 let current=title(ch.title),wordOffset=0;
 const sourceMeta=[];
 for(const block of (reading.fullText?[{title:ch.title,body:reading.fullText}]:reading.sections).filter(x=>x.body?.trim())){
  const raw=block.body,lines=raw.split('\n'),events=[];let offset=0;
  const contentsEnd=raw.includes('CONTENTS')?raw.search(/Objectives\s+After studying|Introduction\s*\n(?=[A-Z][a-z])/):0;
  const bodyStart=contentsEnd>0?raw.slice(0,contentsEnd).trim().split(/\s+/).length:0;
  for(let i=0;i<lines.length;i++){
   const line=tidy(lines[i]),noNumber=title(line),known=headings.find(h=>line.toLowerCase()===h.raw.toLowerCase()||noNumber.toLowerCase()===h.label.toLowerCase());
   const words=line.split(' ').length;
   const looksHeading=line.length>=5&&line.length<=95&&words<=11&&!/[.;,]$/.test(line)&&!/(?:CHAP\.|SEC\.|LOVELY PROFESSIONAL|\bNotes\b|Copyright|^Figure\s|^Table\s|^Example\s|^Listing\s)/i.test(line)&&!/^\d+$/.test(line)&&((line===line.toUpperCase()&&/[A-Z]{3}/.test(line))||/^\d+(?:\.\d+)+\s+[A-Z]/.test(line)||(/^[♦➤]/.test(line)));
   if(offset>=bodyStart&&(known||looksHeading)&&!/^(?:chapter|unit|contents|notes|objectives)$/i.test(noNumber))events.push({at:offset,label:known?.label||title(line)});
   offset+=lines[i].trim()?lines[i].trim().split(/\s+/).length:0;
  }
  const words=raw.trim().split(/\s+/);
  for(let i=0;i<words.length;i+=60){const event=events.filter(e=>e.at<=i+15).at(-1);if(event)current=event.label;sourceMeta.push({heading:current,wordOffset:wordOffset+i});}
  wordOffset+=words.length;
 }
 let sourceIndex=0;
 for(const session of sessions){
  const cardTopics=[];
  for(const card of session.cards){
   let heading=card.kind==='source'?sourceMeta[sourceIndex++]?.heading:card.title;
   if(!heading||generic.test(heading)||/^(?:chapter|unit|contents|notes|objectives)$/i.test(heading))heading=ch.title;
   if(card.kind==='prompt')heading=tidy(card.text).replace(/\?$/,'');
   if(card.kind==='interview')heading=cardTopics.at(-1)||session.cards.find(c=>c.kind==='prompt')?.text||ch.title;
   const text=tidy(card.text),lower=text.toLowerCase();
   const matches=patterns.filter(p=>p.re.test(text)).map(p=>p.t).sort((a,b)=>{const score=t=>{const count=lower.split(t.toLowerCase()).length-1;return count*Math.min(2,t.split(' ').length)+(t.toLowerCase()===ch.title.toLowerCase()?-3:0);};return score(b)-score(a)||b.length-a.length;});
   // Headings supply the context; a nearby named concept makes a long section easier to navigate.
   const label=card.kind==='definition'?title(card.title):matches.find(t=>!heading.toLowerCase().includes(t.toLowerCase()))||title(heading);
   card.title=(/^(?:Summary|Review)\s+\d+$/i.test(label)?title(ch.title)+': Key Ideas':title(label)).slice(0,110);card.topic=title(heading).replace(/^(Summary|Review)\s+\d+$/i,'$1').slice(0,120);cardTopics.push(card.title);
  }
  const counts=new Map();for(const t of cardTopics)counts.set(t,(counts.get(t)||0)+1);
  const ordered=[...counts].sort((a,b)=>b[1]-a[1]).map(([t])=>t);
  session.topics=[...new Set(cardTopics)].slice(0,4);
  session.title=(ordered.length>1&&ordered[0].length+ordered[1].length<65?ordered.slice(0,2).join(' & '):ordered[0]||title(ch.title)).slice(0,110);
  if(session.kind==='learning'&&sessions.indexOf(session)===0&&!/^(?:Introduction|Preface|Acknowledgments)$/i.test(ch.title)){session.title=title(ch.title).replace(/^Review of\s+/i,'');session.topics=[session.title,...session.topics.filter(t=>!/Further Readings|Keywords|Contents|^Review of/i.test(t))].filter((x,i,a)=>a.indexOf(x)===i).slice(0,3);}
  session.goal=session.kind==='interview'?'Practice explaining '+session.topics[0].replace(/\?$/,'').toLowerCase()+'.':session.kind==='definitions'?'Build a clear meaning for '+session.topics.join(', ')+'.':session.kind==='summary'?'Connect and review '+session.topics.join(', ')+'.':'Explore '+session.topics.join(', ')+', then check what you understand.';
  // Use definitions that actually occur in this session where available.
  const text=session.cards.map(x=>x.text).join(' ').toLowerCase();
  const relevant=[...(reading.terms||[]),...ch.terms].filter(([term,def])=>text.includes(term.toLowerCase())||tokens(def).filter(t=>text.includes(t)).length>=3);
  if(relevant.length)for(let n=0;n<session.questions.length;n++){
   const [term,def]=relevant[n%relevant.length],other=[...new Set([...ch.terms,...(reading.terms||[])].map(x=>x[0]).filter(t=>t.toLowerCase()!==term.toLowerCase()))];
   const fallback=session.questions[n].options.filter(t=>t.toLowerCase()!==term.toLowerCase());
   const options=[term,...new Set([...other,...fallback])].slice(0,4);
   if(options.length===4){const shift=(ch.id+n)%4;session.questions[n]={question:'Which concept matches this explanation?\n\n'+def,options:options.slice(shift).concat(options.slice(0,shift)),answer:(4-shift)%4,explanation:term+': '+def};}
  }
 }
 return sessions;
}
module.exports={enrich,title};
