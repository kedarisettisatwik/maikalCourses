/* Rebuild from the locally audited PDF extraction, not from an external service. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const source=JSON.parse(fs.readFileSync(path.join(root,'../systemDesign/chapters.json'),'utf8'));
const focus=new Map(fs.readFileSync(path.join(root,'courses/system-design-focus.txt'),'utf8').trim().split(/\r?\n/).map(line=>{const [page,guide,...rest]=line.split('|');return[Number(page),{guide,focus:rest.join('|')}];}));
assert.equal(source.length,189);assert.equal(focus.size,source.length);
const articles=source.map(s=>{assert(focus.has(s.page),`Missing authored notes at ${s.page}`);for(let p=s.page;p<=s.end;p++)assert(fs.existsSync(path.join(root,`assets/system-design/pages/page-${String(p).padStart(3,'0')}.jpg`)));return {...s,...focus.get(s.page)};});
const start=`/* 189 audited articles. Source order and repeated articles are preserved. */\n(() => {\nconst articles = ${JSON.stringify(articles)};\n`;
const implementation=`
const guides=window.SD_GUIDES;
const referenceMap={
 identity:[['OAuth Security Best Current Practice (RFC 9700)','https://www.rfc-editor.org/rfc/rfc9700.html'],['JWT specification (RFC 7519)','https://www.rfc-editor.org/rfc/rfc7519.html']],
 api:[['HTTP Semantics (RFC 9110)','https://www.rfc-editor.org/rfc/rfc9110.html']],
 security:[['OWASP Password Storage Cheat Sheet','https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html']],
 cache:[['Redis persistence documentation','https://redis.io/docs/latest/management/persistence/']],
 messaging:[['Apache Kafka design and delivery semantics','https://kafka.apache.org/40/design/design/']],
 containers:[['Kubernetes Services','https://kubernetes.io/docs/concepts/services-networking/service/']]
};
const chapters=articles.map(a=>{
 const g=guides[a.guide];
 if(!g)throw new Error('Unknown system-design guide: '+a.guide);
 const sourceText=a.text.replace(/\\u0000/g,'').replace(/—|–/g,'-').replace(/\\n(?=[^\\n])/g,' ');
 const paragraphs=sourceText.match(/[^.!?]+[.!?]+(?:["”']|$)?|[^.!?]+$/g)||[sourceText];
 let body='',part='';for(const sentence of paragraphs){part+=sentence;if(part.length>650){body+=part.trim()+'\\n\\n';part='';}}body+=part.trim();
 return {id:a.id,title:a.title.replace(/—|–/g,'-'),page:a.page,end:a.end,category:g.name,description:a.focus,
  note:'Historical archive: company stacks, product capabilities, prices, and statistics describe the source publication, not a verified current state. Original readings are preserved for coverage; companion notes correct oversimplifications and add interview practice.',
  lessons:[
   {title:'Complete source article',body, takeaway:'Read the original article and diagrams, then distinguish its historical claims from the engineering principles.',source:true},
   {title:g.name+': understand the mechanism',body:g.basics,takeaway:g.terms[0][1]},
   {title:'Trade-offs and failure modes',body:a.focus+'\\n\\n'+g.decisions,takeaway:a.focus},
   {title:'Interview workout',body:'Practice prompt: '+g.scenario+'\\n\\nModel approach: '+g.model+'\\n\\nConnect it to this article: '+a.focus,takeaway:'Explain assumptions, the request or data path, one alternative, and a failure or recovery path.'}
  ],
  questions:g.quiz.map(q=>({question:q[0],options:q[1],answer:q[2],explanation:q[3]})),
  terms:g.terms, demo:'system-'+a.guide, graph:g.diagram,
  sourcePages:Array.from({length:a.end-a.page+1},(_,i)=>'assets/system-design/pages/page-'+String(a.page+i).padStart(3,'0')+'.jpg'),
  interview:{prompt:g.scenario,model:g.model,focus:a.focus},references:referenceMap[a.guide]||[]
 };
});
for(let i=0;i<chapters.length;i++){const c=chapters[i],a=articles[i];c.reading={start:a.page,end:a.end,sections:[{title:a.title,body:a.text}],contents:[{number:'',title:a.title}],pages:c.sourcePages,originalKeywords:false,terms:c.terms,glossary:c.terms.map(t=>t[0]+': '+t[1]).join('\\n\\n')};}
window.COURSES=[...(window.COURSES||[]).filter(c=>c.id!=='system-design'),{
 id:'system-design',title:'System Design',shortTitle:'System Design Studio',bookTitle:'System Design',bookSubtitle:'Architecture & interview practice',
 language:'Architecture',edition:'BIG ARCHIVE / 2023',pdf:'assets/system-design/source.pdf',pdfOffset:0,pageLabel:'PDF',
 description:'Read all 189 archive articles, unpack the engineering trade-offs, and practice explaining your design decisions.',
 heroTitle:['Design the system.','Defend the decisions.'],heroDescription:'Explore every archive article, original diagram, and the engineering decisions behind a strong interview answer.',
 attribution:'Source: the supplied BIG ARCHIVE: SYSTEM DESIGN 2023 PDF (344 physical pages). Its article order, repeated topics, and original illustrations are preserved. Individual articles credit their respective authors and engineering sources.',
 sourceDisclaimer:'Historical source readings are provided in full alongside original page scans. Interview companion notes are additions, not claims about current company architectures. Related articles share explicitly labelled foundation checks. The final quiz deduplicates these checks.',
 definitionsLabel:'Companion definitions',deduplicateFinal:true,chapters
}];
})();\n`;
fs.writeFileSync(path.join(root,'courses/system-design.js'),start+implementation);
fs.writeFileSync(path.join(root,'courses/system-design-coverage.json'),JSON.stringify({pdfPages:344,frontMatter:[1,7],articles:articles.map(({id,title,page,end})=>({id,title,page,end})),sourcePages:337},null,2));
console.log('Built all 189 articles and verified all 337 original reading-page images.');
