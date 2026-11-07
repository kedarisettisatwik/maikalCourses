/* Shared course renderer: routing and persistence use course IDs, never a single
   hard-coded course. No framework, backend, or build step is required for Pages. */
(() => {
 'use strict';
 const $ = (s, root=document) => root.querySelector(s);
 const main = $('#main');
 const esc = value => String(value).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const route = (c, suffix='') => `#course/${c.id}${suffix}`;
 let course = COURSES[0], chapter = null, tab = 'learn', state = {}, quizSession = {}, flashIndex = 0, flashBack = false;
 let storageAvailable = true, toastTimer;
 function read(key, fallback) { try { const raw=localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { storageAvailable=false; return fallback; } }
 function write(key,value) { try { localStorage.setItem(key,JSON.stringify(value)); } catch { storageAvailable=false; } }
 function loadState() { const data=read(`maikal:${course.id}:v1`,{}); state={readings:data?.readings&&typeof data.readings==='object'?data.readings:{},notes:data?.notes&&typeof data.notes==='object'?data.notes:{},done:Array.isArray(data?.done)?data.done.filter(id=>course.chapters.some(c=>c.id===id)):[],answers:data?.answers&&typeof data.answers==='object'?data.answers:{},last:Number.isInteger(data?.last)?data.last:1}; }
 function save() { write(`maikal:${course.id}:v1`,state); updateProgress(); }
 function notify(message) { $('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),2600); }
 document.documentElement.dataset.theme='light';
 $('#menu').addEventListener('click',()=>{const open=document.body.classList.toggle('menu-open');$('#menu').setAttribute('aria-expanded',String(open));});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){document.body.classList.remove('menu-open');$('#menu').setAttribute('aria-expanded','false');}});
 function updateProgress(){
  $('#progress-label').textContent=`${state.done.length} / ${course.chapters.length}`;
  $('#course-progress').max=course.chapters.length;$('#course-progress').value=state.done.length;
  $('#save-status').textContent=storageAvailable?'Progress saved on this device':'Storage unavailable; progress lasts this visit';
  document.querySelectorAll('.nav-link').forEach(link=>{const id=Number(link.dataset.chapter);link.classList.toggle('complete',state.done.includes(id));$('.num',link).textContent=state.done.includes(id)?'✓':String(id).padStart(2,'0');});
 }
 function nav(){
  const query=$('#search').value.toLowerCase().trim();
  const filtered=course.chapters.filter(c=>`${c.title} ${c.description} ${c.lessons.map(l=>l.title).join(' ')} ${c.terms.flat().join(' ')}`.toLowerCase().includes(query));
  $('#chapter-nav').innerHTML=filtered.map(c=>`<a class="nav-link ${chapter?.id===c.id?'active':''}" ${chapter?.id===c.id?'aria-current="page"':''} data-chapter="${c.id}" href="${route(course,`/chapter/${c.id}`)}"><span class="num">${String(c.id).padStart(2,'0')}</span><span>${esc(c.title)}</span></a>`).join('')||'<p class="empty">No matching chapter. Try a different topic.</p>';
  updateProgress();
 }
 $('#search').addEventListener('input',nav);
 function svgDiagram(type='objects', hero=false){
  const box=(x,y,w,h,title,sub='',accent=false)=>`<g class="float"><rect class="${accent?'accentbox':'box'}" x="${x}" y="${y}" width="${w}" height="${h}" rx="12"/><text x="${x+16}" y="${y+29}" font-size="13" font-weight="700">${esc(title)}</text>${sub?`<text x="${x+16}" y="${y+52}" font-size="10" opacity=".7">${esc(sub)}</text>`:''}</g>`;
  const line=(x,y,x2,y2)=>`<path class="connector" d="M${x} ${y} L${x2} ${y2}"/><circle cx="${x2}" cy="${y2}" r="3" fill="var(--accent)"/>`;
  let body, label;
  if(type==='inheritance'){
   label='Inheritance: two specializations share a base interface';
   body=box(170,15,180,66,'Animal','eat() • move()',true)+line(260,81,260,112)+line(260,112,120,112)+line(260,112,400,112)+line(120,112,120,150)+line(400,112,400,150)+box(25,150,190,76,'Dog : Animal','bark()')+box(305,150,190,76,'Cat : Animal','meow()');
  }else if(type==='dispatch'){
   label='A base reference dispatches to the actual object’s virtual override';
   body=box(12,88,155,75,'Animal&','sound()',true)+line(167,125,270,125)+box(270,28,220,75,'Dog','sound() → "Woof"')+box(270,161,220,75,'Cat','sound() → "Meow"')+line(235,125,235,65)+line(235,65,270,65)+line(235,125,235,198)+line(235,198,270,198);
  }else if(type==='memory'||type==='reference'){
   label='A pointer stores an address; a reference is another name for the same object';
   body=box(25,40,180,75,'int* pointer','address of value',true)+line(205,78,310,78)+box(310,40,180,75,'int value','10')+box(25,165,180,65,'int& alias','same object')+line(205,198,400,198)+line(400,198,400,115);
  }else if(type==='lifetime'){
   label='An object’s lifetime runs from construction to destruction';
   body=box(10,85,145,80,'Construct','initialize state',true)+line(155,125,188,125)+box(188,85,145,80,'Use','valid operations')+line(333,125,366,125)+box(366,85,145,80,'Destroy','release resources');
  }else if(type==='files'||type==='format'){
   label='A stream transports data between your program and an input or output device';
   body=box(10,85,145,80,type==='files'?'File input':'Keyboard','input stream')+line(155,125,188,125)+box(188,85,145,80,'Program','process data',true)+line(333,125,366,125)+box(366,85,145,80,type==='files'?'File output':'Console','output stream');
  }else if(type==='templates'||type==='overload'||type==='conversion'){
   label=type==='templates'?'One template produces specializations for compatible types':'Values and types determine the selected operation';
   body=box(160,15,200,75,type==='templates'?'template <T>':type==='overload'?'twice(value)':'Conversion','one intentional interface',true)+line(260,90,260,123)+line(90,123,430,123)+line(90,123,90,160)+line(260,123,260,160)+line(430,123,430,160)+box(10,160,150,75,'int','whole values')+box(185,160,150,75,'double','fractional values')+box(360,160,150,75,'class type','custom behavior');
  }else if(type==='complex'){
   label='An overloaded + combines complex-number components';
   body=box(10,85,140,80,'2 + 3i','left operand')+`<text x="165" y="132" font-size="25">+</text>`+box(200,85,140,80,'4 + 1i','right operand')+`<text x="354" y="132" font-size="25">=</text>`+box(390,85,120,80,'6 + 4i','result',true);
  }else if(type==='static'){
   label='Separate instances access one shared static member';
   body=box(155,15,210,75,'Counter::created','shared value: 2',true)+line(260,90,260,125)+line(120,125,400,125)+line(120,125,120,160)+line(400,125,400,160)+box(25,160,190,75,'Object a','independent instance')+box(305,160,190,75,'Object b','independent instance');
  }else{
   label='One class blueprint creates independent objects with state and behavior';
   body=`<path d="M20 35H500M20 85H500M20 135H500M20 185H500M20 235H500M70 15V255M170 15V255M270 15V255M370 15V255M470 15V255" stroke="var(--line)" stroke-dasharray="2 5" opacity=".65"/>`+box(162,12,205,85,'class Account','balance • deposit()',true)+line(264,97,264,125)+line(112,125,410,125)+line(112,125,112,160)+line(410,125,410,160)+box(10,160,205,85,'savings : Account','balance = 1,200')+box(307,160,205,85,'travel : Account','balance = 450');
  }
  return `<svg viewBox="0 0 520 270" role="img" aria-label="${esc(label)}">${body}</svg>`;
 }
 function breadcrumb(items){return `<div class="breadcrumb"><a href="#home">Course library</a>${items.map(i=>`<span>/</span>${i.href?`<a href="${i.href}">${esc(i.text)}</a>`:`<span>${esc(i.text)}</span>`}`).join('')}</div>`;}
 function library(){
  document.body.classList.add('library');
  document.title='Maikal Courses · Your learning shelf';
  main.innerHTML=window.bookshelfHTML(COURSES,esc);
 }
 function overview(){
  const completed=state.done.length, resume=course.chapters.find(c=>c.id===state.last&&!state.done.includes(c.id))||course.chapters.find(c=>!state.done.includes(c.id))||course.chapters[0];
  main.innerHTML=`${breadcrumb([{text:course.title}])}<section class="hero"><div><div class="eyebrow">${esc(course.edition)} · ${esc(course.language)}</div><h1>${esc(course.heroTitle?.[0]||'Think in objects.')}<br><span>${esc(course.heroTitle?.[1]||'Build understanding.')}</span></h1><p>${esc(course.heroDescription||'Make C++ click with visual explanations, interactive experiments, and practice that builds real understanding.')}</p><a class="button primary" href="${route(course,`/chapter/${resume.id}`)}">${completed||Object.keys(state.answers).length?'Continue learning':'Start learning'} <span>↗</span></a></div><div class="hero-art">${course.id==='system-design'?LearningVisuals.graph(['Client','API boundary','Service','Storage']):svgDiagram('objects',true)}</div></section><div class="stats"><div class="stat"><strong>${course.chapters.length}</strong><span>ordered chapters</span></div><div class="stat"><strong>${course.chapters.reduce((n,c)=>n+c.lessons.length,0)}</strong><span>bite-size lessons</span></div><div class="stat"><strong>${course.chapters.reduce((n,c)=>n+c.questions.length,0)}</strong><span>practice questions</span></div><div class="stat"><strong>${Math.round(completed/course.chapters.length*100)}%</strong><span>completed</span></div></div><section><div class="section-heading"><h2>${course.id==='oops'?'A clear path through OOP':'Every article. In source order.'}</h2><p>Follow your textbook’s order. Stop, explore, and test yourself along the way.</p></div><label class="course-filter-label" for="course-filter">Search the full course</label><input id="course-filter" type="search" placeholder="Find a chapter, concept, or definition"><p id="filter-count" class="storage-note">${course.chapters.length} chapters in source order</p><div class="curriculum">${course.chapters.map(c=>`<a class="chapter-card" data-card-index="${c.id}" href="${route(course,`/chapter/${c.id}`)}"><div class="card-top"><span class="chapter-number">CHAPTER ${String(c.id).padStart(2,'0')}</span><span class="card-status">${state.done.includes(c.id)?'✓ Completed':c.id===resume.id&&completed?'Up next':esc(c.category||course.language)}</span></div><h3>${esc(c.title)}</h3><p>${esc(c.description)}</p><div class="card-bottom"><span>${c.lessons.length} lessons · ${c.questions.length} checkpoints · pp. ${c.page}–${c.end}</span><b>↗</b></div></a>`).join('')}</div></section><section class="bottom-feature"><div><h3>Make it stick.</h3><p>Revisit key concepts with flashcards, then take the final revision quiz.</p></div><a class="button" href="${route(course,'/revision')}">Revision room ↗</a></section>${sourceNote()}`;
 }
 function sourceNote(){return `<p class="source-note">${esc(course.attribution)} <a href="${course.pdf}" target="_blank" rel="noopener">Open source PDF ↗</a><br>Guided explanations are companion notes. Full source readings and original scans retain the supplied material. Archived claims may contain errors; corrections and modern extensions are identified separately. ${esc(course.sourceDisclaimer||'Code blocks are illustrative snippets unless shown as a full program; examples use C++17 and require the appropriate standard headers.')}</p>`;}
 function codeHTML(code){return `<div class="code-window"><div class="code-header"><span>${esc(course.language)} · worked example</span><button data-action="copy">Copy</button></div><pre><code>${esc(code)}</code></pre></div>`;}
 function quizHTML(q,index,final=false){
  const key=`${chapter?.id||0}:${index}`;
  const selected=final?quizSession[index]:state.answers[key];
  const valid=Number.isInteger(selected)&&selected>=0&&selected<q.options.length;
  const prefix=final?`Question ${index+1} of ${allQuestions().length}`:`Quick check ${index+1} of ${chapter.questions.length}`;
  return `<section class="quiz" data-quiz="${index}" data-final="${final}"><div class="quiz-label">${prefix}</div><h3>${esc(q.question)}</h3><div class="options">${q.options.map((option,i)=>`<button class="option ${valid&&i===q.answer?'correct':''} ${valid&&i===selected&&i!==q.answer?'incorrect':''}" data-action="answer" data-option="${i}" ${valid?'disabled':''}><span class="letter">${'ABCD'[i]}</span><span>${esc(option)}${valid&&i===q.answer?' ✓':''}</span></button>`).join('')}</div>${valid?`<p class="feedback" role="status"><strong>${selected===q.answer?'Correct.':'Not quite.'}</strong> ${esc(q.explanation)}</p>`:''}</section>`;
 }
 function chapterTabs(){return [['learn','Learn'],...(chapter.reading?[['full','Full textbook'],['glossary','Definitions']]:[]),['summary','Summary'],['flashcards','Flashcards'],...(chapter.interview?[['interview','Interview']]:[])];}
 function sourcePagesHTML(pages,start){return pages?.length?`<details class="source-pages"><summary>Original illustrated pages (${pages.length})</summary><p>Read every figure, annotation, and diagram exactly as supplied. Page images preserve material that text extraction cannot capture.</p>${pages.map((src,i)=>`<figure><a href="${src}" target="_blank" rel="noopener" aria-label="Open original PDF page ${start+i} at full size"><img src="${src}" loading="lazy" decoding="async" width="1043" height="1350" alt="Original course PDF page ${start+i}, including its diagrams and labels"></a><figcaption>Physical PDF page ${start+i} · Select the page to enlarge</figcaption></figure>`).join('')}</details>`:'';}
 function readingParagraphs(text){return text.split(/\n\s*\n/).filter(Boolean).map(p=>`<p class="source-transcript">${esc(p)}</p>`).join('');}
 function renderFullReading(panel){const r=chapter.reading;panel.innerHTML=`<div class="full-reading"><h2>The complete textbook chapter</h2><p>This is the full source reading, not a condensed summary. It preserves explanations, examples, definitions, self-assessments, review questions, and further readings. Original page scans preserve every figure and layout.</p><div class="callout"><strong>Read critically.</strong> This archived textbook contains outdated syntax and inaccuracies. The guided lessons flag important corrections; the source is preserved as originally supplied.</div><div class="reading-contents"><h3>Source contents</h3>${r.contents.map(h=>`<span>${esc(h.number)} ${esc(h.title)}</span>`).join('')}</div>${sourcePagesHTML(r.pages,r.start)}${r.sections.map((section,i)=>`<details class="reading-section" open><summary>${esc(section.title)}</summary>${readingParagraphs(section.body)}<button data-action="reading-done" data-section="${i}" aria-pressed="${Boolean(state.readings?.[chapter.id]?.includes(i))}">${state.readings?.[chapter.id]?.includes(i)?'✓ Section read':'Mark section read'}</button></details>`).join('')}${footerHTML()}</div>`;}
 function renderGlossary(panel){const terms=chapter.reading?.terms||chapter.terms;panel.innerHTML=`<div class="full-reading"><h2>Every original keyword definition</h2><p>The textbook’s keyword section is preserved below. Guided flashcards cover core concepts; original definitions may use dated terminology or contain errors.</p><div class="glossary">${terms.map(([term,definition])=>`<details open><summary>${esc(term)}</summary><p>${esc(definition)}</p></details>`).join('')}</div><details class="reading-section"><summary>Original keyword section in full</summary>${readingParagraphs(chapter.reading?.glossary||'')}</details>${footerHTML()}</div>`;}
 function renderInterview(panel){const interview=chapter.interview;panel.innerHTML=`<section class="interview-workout"><div class="eyebrow">EXPLAIN IT BEFORE REVEALING</div><h2>${esc(interview.prompt)}</h2><p>Connect your answer to this article: ${esc(interview.focus)}</p><label for="interview-answer">Your design notes</label><textarea id="interview-answer" rows="9" placeholder="Requirements, assumptions, data path, decisions, failures, and alternatives…">${esc(state.notes?.[chapter.id]||'')}</textarea><small>Saved locally for this course and chapter.</small><details class="reading-section"><summary>Reveal a model approach</summary><p>${esc(interview.model)}</p></details><div class="rubric"><h3>Self-review</h3>${['Did I state the scope and measurable requirements?','Did I trace the request or data path?','Did I explain an alternative and its trade-off?','Did I handle a failure, retry, or recovery case?'].map(t=>`<label><input type="checkbox"> ${t}</label>`).join('')}</div><p>These are guided self-practice prompts, not automated grading. Related articles reuse foundation scenarios so you can transfer the same reasoning to different contexts.</p>${footerHTML()}</section>`;}
 function renderChapter(){
  document.title=`${chapter.title} · ${course.shortTitle}`;
  main.innerHTML=`${breadcrumb([{text:course.shortTitle,href:route(course)},{text:`Chapter ${chapter.id}`}])}<header class="lesson-header"><div class="eyebrow">CHAPTER ${String(chapter.id).padStart(2,'0')} OF ${course.chapters.length}</div><h1>${esc(chapter.title)}</h1><p>${esc(chapter.description)}</p>${chapter.reading?`<div class="coverage-banner"><strong>Full textbook coverage</strong><span>${chapter.reading.sections.length} reading sections and ${chapter.reading.terms.length} original keyword definitions.</span><button data-action="tab" data-tab="full">Read full chapter →</button></div>`:''}<div class="lesson-meta"><span>${chapter.lessons.length} lessons</span><span>${chapter.questions.length} checkpoints</span><a href="${course.pdf}#page=${chapter.page+course.pdfOffset}" target="_blank" rel="noopener">${course.pageLabel||'Textbook'} pp. ${chapter.page}–${chapter.end} ↗</a><span>${state.done.includes(chapter.id)?'✓ Completed':''}</span></div></header><div class="tabs" role="tablist" aria-label="Chapter views">${chapterTabs().map(([id,title])=>`<button class="tab ${tab===id?'active':''}" id="tab-${id}" role="tab" aria-selected="${tab===id}" aria-controls="lesson-panel" tabindex="${tab===id?0:-1}" data-action="tab" data-tab="${id}">${title}</button>`).join('')}</div><div id="lesson-panel" role="tabpanel" aria-labelledby="tab-${tab}"></div>`;
  const panel=$('#lesson-panel');
  if(tab==='learn'){
   panel.innerHTML=`<div class="lesson-layout"><article class="lesson-body">${chapter.note?`<aside class="callout"><strong>Textbook note.</strong> ${esc(chapter.note)}</aside>`:''}${course.id==='oops'?OOPVisuals.markup(chapter.id):''}<figure class="diagram">${chapter.graph?LearningVisuals.graph(chapter.graph):svgDiagram(chapter.demo)}<figcaption>Explore the concept visually, then try it below.</figcaption></figure>${chapter.lessons.map((l,i)=>`<section class="topic" id="topic-${i}"><span class="topic-index">${chapter.id}.${i+1}</span><h2>${esc(l.title)}</h2>${l.body.split('\n\n').map(p=>`<p>${esc(p)}</p>`).join('')}${l.source?sourcePagesHTML(chapter.sourcePages,chapter.page):''}${l.code?codeHTML(l.code):''}<div class="callout"><strong>Remember:</strong> ${esc(l.takeaway)}</div></section>${i===1?quizHTML(chapter.questions[0],0):''}${i===2?demoHTML(chapter.demo):''}${i===chapter.lessons.length-1?quizHTML(chapter.questions[1],1):''}`).join('')}${referenceHTML()}${footerHTML()}</article><aside class="in-this-unit"><strong>In this chapter</strong>${chapter.lessons.map((l,i)=>`<a href="#topic-${i}" data-action="topic" data-topic="topic-${i}">${esc(l.title)}</a>`).join('')}<a href="${course.pdf}#page=${chapter.page+course.pdfOffset}" target="_blank" rel="noopener">Read the textbook ↗</a></aside></div>`;
   initDemo();
  }else if(tab==='summary'){
   panel.innerHTML=`<div class="summary-panel"><h2>The chapter’s key ideas</h2><ul class="summary-list">${chapter.lessons.map(l=>`<li>${esc(l.takeaway)}</li>`).join('')}</ul><h3>Put it into words</h3><p>Without checking the lesson, explain how ${esc(chapter.terms[0][0].toLowerCase())} works and give your own example.</p><div class="glossary">${chapter.terms.map(([term,definition])=>`<details><summary>${esc(term)}</summary><p>${esc(definition)}</p></details>`).join('')}</div>${chapter.note?`<div class="callout">${esc(chapter.note)}</div>`:''}${footerHTML()}</div>`;
  }else if(tab==='full')renderFullReading(panel);
  else if(tab==='glossary')renderGlossary(panel);
  else if(tab==='interview')renderInterview(panel);
  else renderFlashcards(panel,chapter.terms,false);
  bindTabKeys();
 }
 function referenceHTML(){return chapter.references?.length?`<aside class="reference-links"><strong>Standards and documentation for companion corrections</strong>${chapter.references.map(([label,url])=>`<a href="${esc(url)}" target="_blank" rel="noopener">${esc(label)} ↗</a>`).join('')}</aside>`:'';}
 function footerHTML(){
  const index=course.chapters.findIndex(c=>c.id===chapter.id),next=course.chapters[index+1];
  return `<div class="lesson-footer"><button data-action="complete" class="primary">${state.done.includes(chapter.id)?'✓ Completed · Undo':'Mark chapter complete'}</button>${next?`<a class="button" href="${route(course,`/chapter/${next.id}`)}">Next chapter →</a>`:`<a class="button" href="${route(course,'/revision')}">Final revision →</a>`}</div><p class="storage-note">Completion is self-tracked. Quiz answers and progress stay in this browser.</p>`;
 }
 function bindTabKeys(){document.querySelectorAll('[role=tab]').forEach(button=>button.addEventListener('keydown',e=>{const tabs=[...document.querySelectorAll('[role=tab]')];let i=tabs.indexOf(button);if(e.key==='ArrowRight')i=(i+1)%tabs.length;else if(e.key==='ArrowLeft')i=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')i=0;else if(e.key==='End')i=tabs.length-1;else return;e.preventDefault();tab=tabs[i].dataset.tab;flashIndex=0;flashBack=false;renderChapter();$(`#tab-${tab}`).focus();}));}
 function allTerms(){return course.chapters.flatMap(c=>c.terms.map(([term,definition])=>[term,definition,c.id]));}
 function allQuestions(){const list=course.chapters.flatMap(c=>c.questions.map(q=>({...q,chapterId:c.id})));return course.deduplicateFinal?list.filter((q,i)=>list.findIndex(x=>x.question===q.question)===i):list;}
 function renderFlashcards(target,terms,revision){
  flashIndex=((flashIndex%terms.length)+terms.length)%terms.length;
  const item=terms[flashIndex];
  target.innerHTML=`<div class="summary-panel"><h2>Recall before you reveal.</h2><p>Explain the term out loud, then flip the card to check your understanding.</p><button class="flashcard" data-action="flip" aria-label="${flashBack?'Show term':'Reveal definition'}"><small>${flashBack?'DEFINITION':'WHAT DOES THIS MEAN?'}</small><span class="${flashBack?'answer':''}">${esc(flashBack?item[1]:item[0])}</span><small style="margin:22px 0 0">${flashBack?'Click to show term':'Click to reveal answer'}</small></button><div class="flash-nav"><button data-action="flash-prev">← Previous</button><span>${flashIndex+1} / ${terms.length}</span><button data-action="flash-next">Next →</button></div>${revision?`<p class="storage-note">From chapter ${item[2]}. <a href="${route(course,`/chapter/${item[2]}`)}" style="text-decoration:underline">Review the lesson</a></p>`:footerHTML()}</div>`;
 }
 function revision(){
  document.title=`Revision room · ${course.shortTitle}`;
  main.innerHTML=`${breadcrumb([{text:course.shortTitle,href:route(course)},{text:'Revision room'}])}<header class="lesson-header"><div class="eyebrow">RECALL · CONNECT · PRACTICE</div><h1>Knowledge that stays.</h1><p>Revisit the essentials, explain them in your own words, and see where you need another look.</p></header><div class="revision-grid"><section class="revision-panel"><h3>Flashcard deck</h3><p>${allTerms().length} essential terms from all ${course.chapters.length} chapters. Think first, flip second.</p><button data-action="revision-cards" class="primary">Practice flashcards</button></section><section class="revision-panel"><h3>Final revision quiz</h3><p>${allQuestions().length} questions in textbook order, with explanations after every answer. No timer.</p><a class="button" href="${route(course,'/final')}">Take the quiz →</a></section></div><div id="revision-cards"></div><h2 class="revision-heading">Your chapter checklist</h2><div class="glossary">${course.chapters.map(c=>`<details><summary>${state.done.includes(c.id)?'✓ ':''}${c.id}. ${esc(c.title)}</summary><p>${c.lessons.map(l=>esc(l.takeaway)).join('<br><br>')}</p><p><a href="${route(course,`/chapter/${c.id}`)}" style="text-decoration:underline">Review chapter →</a></p></details>`).join('')}</div><p class="storage-note">Saved on this device: ${state.done.length} / ${course.chapters.length} chapters. This does not sync across devices.</p><button class="reset" data-action="reset">Reset this course’s progress</button><div id="reset-confirm"></div>`;
 }
 function finalQuiz(){
  document.title=`Final quiz · ${course.shortTitle}`;
  main.innerHTML=`${breadcrumb([{text:course.shortTitle,href:route(course)},{text:'Revision room',href:route(course,'/revision')},{text:'Final quiz'}])}<div class="final-intro"><div class="eyebrow">FINAL REVISION</div><h1>Connect the dots.</h1><p>One course, ${allQuestions().length} questions. Choose an answer to get feedback. Your chapter practice answers stay separate.</p><div id="final-progress" role="status"></div><div id="final-results"></div>${allQuestions().map((q,i)=>quizHTML(q,i,true)).join('')}<button data-action="restart-final">Restart final quiz</button></div>`;
  updateFinalScore();
 }
 function updateFinalScore(){const questions=allQuestions(),answered=Object.keys(quizSession).length,correct=questions.filter((q,i)=>quizSession[i]===q.answer).length;$('#final-progress').textContent=`${answered} / ${questions.length} answered · ${correct} correct`;
  if(answered===questions.length){const weak=[...new Set(questions.filter((q,i)=>quizSession[i]!==q.answer).map(q=>q.chapterId))];$('#final-results').innerHTML=`<section class="quiz-results"><h3>Revision complete</h3><div class="score">${correct} / ${questions.length}</div><p>${weak.length?'Revisit these chapters, then try again:':'All answers correct. Try explaining the concepts without the options next.'}</p>${weak.map(id=>`<a class="button" href="${route(course,`/chapter/${id}`)}">Chapter ${id}</a> `).join('')}</section>`;}
 }
 function demoHTML(type){
  if(type.startsWith('system-'))return LearningVisuals.markup(type,chapter);
  const configs={
   objects:['Build two independent objects','Choose the active account, then deposit. The other object keeps its own balance.','<button data-demo="select-a">Savings</button><button data-demo="select-b">Travel</button><button data-demo="deposit">Deposit 100</button>'],
   reference:['An alias, not a copy','Move the value. Watch the reference change with it while the earlier copy stays unchanged.','<label for="value-range">Original value</label><input id="value-range" type="range" min="0" max="100" value="10">'],
   overload:['Which overload gets called?','Choose an argument type to trace compile-time overload selection.','<button data-demo="int">twice(3)</button><button data-demo="double">twice(3.5)</button>'],
   static:['One shared counter','Create instances and observe the class-level count. Here we count all creations, not live objects.','<button data-demo="create">Create object</button>'],
   lifetime:['Step through a lifetime','Construct a then b, enter their scope, and watch destruction happen in reverse.','<button data-demo="step">Next step</button>'],
   complex:['Add complex numbers','Change the real component of the left operand. The overloaded + adds matching components.','<label for="complex-real">Left real component</label><input id="complex-real" type="range" min="-10" max="10" value="2">'],
   conversion:['Watch a conversion','Change the metre value and compare a class conversion with integer truncation.','<label for="metres">Metres</label><input id="metres" type="range" min="0" max="100" value="37">'],
   inheritance:['Explore an inheritance relationship','Choose a form to see which classes inherit from which bases.','<button data-demo="single">Single</button><button data-demo="multiple">Multiple</button><button data-demo="diamond">Virtual diamond</button>'],
   dispatch:['Same call. Different behavior.','Change the concrete object behind Animal& and choose virtual or non-virtual dispatch.','<label for="animal">Concrete object</label><select id="animal"><option>Dog</option><option>Cat</option></select><button data-demo="virtual">Virtual call</button><button data-demo="nonvirtual">Non-virtual call</button>'],
   memory:['Follow the allocation','Allocate an integer, read it, then release it. The demo blocks invalid operations.','<button data-demo="allocate">new int{42}</button><button data-demo="read">Read *p</button><button data-demo="release">delete p</button>'],
   format:['Format a number','Adjust precision with fixed enabled. This changes presentation, not the stored value.','<label for="precision">Decimal places</label><input id="precision" type="range" min="0" max="6" value="2">'],
   files:['Append or overwrite?','Simulate writes to a file in memory. No files on your computer are changed.','<button data-demo="append">Append a line</button><button data-demo="overwrite">Overwrite file</button>'],
   templates:['Instantiate a template','Choose a type. The same maximum function pattern works when > is supported.','<button data-demo="int">maximum(3, 7)</button><button data-demo="double">maximum(2.5, 1.2)</button><button data-demo="string">maximum(string A, B)</button>']
  };
  const d=configs[type]||configs.objects;
  return `<section class="demo" data-type="${type}"><div class="quiz-label">INTERACTIVE LAB · GUIDED SIMULATION</div><h3>${d[0]}</h3><p>${d[1]}</p><div class="demo-controls">${d[2]}<button data-demo="reset">Reset</button></div><output class="demo-output" aria-live="polite" aria-atomic="true"></output><small>These controls simulate the illustrated concept; they do not compile or execute arbitrary C++.</small></section>`;
 }
 let demoState={};
 function initDemo(){if(chapter?.demo?.startsWith('system-')){LearningVisuals.init($('.system-lab'),chapter);return;}demoState={a:1200,b:450,active:'a',count:0,step:0,allocated:false,file:'First note\n',message:'',dispatch:'virtual',inheritance:'single',arg:'int'};updateDemo();}
 function updateDemo(){const root=$('.demo');if(!root||root.classList.contains('system-lab'))return;let output='';const d=demoState;
  switch(root.dataset.type){
   case 'objects':output=`savings.balance = ${d.a}\ntravel.balance  = ${d.b}\nActive object: ${d.active==='a'?'savings':'travel'}`;break;
   case 'reference':{const v=$('#value-range').value;output=`value = ${v}\nalias = ${v}  // same object\ncopy  = 10  // separate earlier copy`;break;}
   case 'overload':output=d.arg==='int'?'twice(int) selected at compile time\n2 × 3 = 6':'twice(double) selected at compile time\n2 × 3.5 = 7.0';break;
   case 'static':output=`Objects created: ${d.count}\nCounter::created = ${d.count}\nEvery instance accesses this one shared value.`;break;
   case 'lifetime':{const steps=['Before scope: no objects','Construct a → a is alive','Construct b → a and b are alive','Use objects within their scope','Scope exit: destroy b first','Then destroy a → no objects remain'];output=`Step ${d.step+1} / ${steps.length}\n${steps[d.step]}`;$('[data-demo=step]').disabled=d.step===5;break;}
   case 'complex':{const real=Number($('#complex-real').value);output=`(${real} + 3i) + (4 + 1i)\n= (${real} + 4) + (3 + 1)i\n= ${real+4} + 4i`;break;}
   case 'conversion':{const m=Number($('#metres').value)/10;output=`Distance{${m.toFixed(1)}} → double: ${m.toFixed(1)} metres\nConverted units: ${(m*100).toFixed(0)} centimetres\nstatic_cast<int>(${m.toFixed(1)}) → ${Math.trunc(m)}`;break;}
   case 'inheritance':output={single:'Animal → Dog\nDog has an Animal base subobject.',multiple:'Printer + Scanner → Copier\nCopier has two direct base subobjects.',diamond:'Root → Left and Right → Leaf\nWith virtual inheritance, Leaf shares ONE Root subobject.\nWithout it, there would be TWO Root subobjects.'}[d.inheritance];break;
   case 'dispatch':{const name=$('#animal').value;output=`${name} concrete;\nAnimal& a = concrete;\na.sound();\n→ ${d.dispatch==='virtual'?(name==='Dog'?'"Woof" from Dog::sound()':'"Meow" from Cat::sound()'):'"?" from Animal::sound()'}\n${d.dispatch==='virtual'?'Virtual: dynamic object type selects the override.':'Non-virtual: the reference’s static type selects the function.'}`;break;}
   case 'memory':output=d.message||'p = nullptr\nNo allocation. Choose new int{42} to begin.';$('[data-demo=allocate]').disabled=d.allocated;$('[data-demo=read]').disabled=!d.allocated;$('[data-demo=release]').disabled=!d.allocated;break;
   case 'format':{const p=Number($('#precision').value);output=`Stored value: 3.141592\nfixed << setprecision(${p})\nConsole output: ${3.141592.toFixed(p)}`;break;}
   case 'files':output=`notes.txt (simulated)\n────────────────────\n${d.file}`;break;
   case 'templates':output={int:'T = int\nmaximum<int>(3, 7) → 7',double:'T = double\nmaximum<double>(2.5, 1.2) → 2.5',string:'T = std::string\nmaximum<string>("A", "B") → "B"\nComparison is lexicographical.'}[d.arg];break;
  }
  $('.demo-output',root).textContent=output;
 }
 main.addEventListener('input',e=>{
  if(e.target.id==='interview-answer'){state.notes=state.notes||{};state.notes[chapter.id]=e.target.value;save();}
  if(e.target.id==='course-filter'){const query=e.target.value.toLowerCase().trim();let shown=0;document.querySelectorAll('.chapter-card').forEach(card=>{const c=course.chapters.find(c=>c.id===Number(card.dataset.cardIndex));const match=!query||[c.title,c.description,c.category,...c.lessons.map(l=>l.title),...c.terms.flat()].join(' ').toLowerCase().includes(query);card.hidden=!match;if(match)shown++;});$('#filter-count').textContent=shown+' matching chapters';}
  if(e.target.closest('.demo'))updateDemo();
 });
 main.addEventListener('change',e=>{if(e.target.closest('.demo'))updateDemo();});
 main.addEventListener('click',async e=>{
  const demoButton=e.target.closest('[data-demo]');
  if(demoButton){const action=demoButton.dataset.demo,d=demoState;
   if(action==='reset'){const type=demoButton.closest('.demo').dataset.type;demoButton.closest('.demo').outerHTML=demoHTML(type);initDemo();return;}
   if(action==='select-a')d.active='a';if(action==='select-b')d.active='b';if(action==='deposit')d[d.active]+=100;
   if(['int','double','string'].includes(action))d.arg=action;if(action==='create')d.count++;if(action==='step')d.step=Math.min(5,d.step+1);
   if(['single','multiple','diamond'].includes(action))d.inheritance=action;if(['virtual','nonvirtual'].includes(action))d.dispatch=action;
   if(action==='allocate'){d.allocated=true;d.message='p → allocated int\n*p = 42';}if(action==='read')d.message='Dereference valid: *p is 42';if(action==='release'){d.allocated=false;d.message='delete p; p = nullptr;\nResource released. Reading *p would now be invalid.';}
   if(action==='append')d.file+='Another note\n';if(action==='overwrite')d.file='Replacement note\n';updateDemo();return;
  }
  const button=e.target.closest('[data-action]');if(!button)return;
  switch(button.dataset.action){
   case 'retry-load':render();break;
   case 'reading-done':{state.readings=state.readings||{};const list=state.readings[chapter.id]||[];const index=Number(button.dataset.section),done=list.includes(index);state.readings[chapter.id]=done?list.filter(i=>i!==index):[...list,index];save();button.textContent=done?'Mark section read':'✓ Section read';button.setAttribute('aria-pressed',String(!done));break;}
   case 'topic':e.preventDefault();document.getElementById(button.dataset.topic)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});break;
   case 'tab':tab=button.dataset.tab;flashIndex=0;flashBack=false;renderChapter();$(`#tab-${tab}`).focus();break;
   case 'copy':try{await navigator.clipboard.writeText($('code',button.closest('.code-window')).textContent);button.textContent='Copied';setTimeout(()=>{button.textContent='Copy';},1500);}catch{notify('Copy unavailable. Select the code and copy it manually.');}break;
   case 'answer':{const root=button.closest('.quiz'),i=Number(root.dataset.quiz),answer=Number(button.dataset.option),final=root.dataset.final==='true',q=final?allQuestions()[i]:chapter.questions[i];if(final)quizSession[i]=answer;else{state.answers[`${chapter.id}:${i}`]=answer;save();}root.outerHTML=quizHTML(q,i,final);if(final)updateFinalScore();break;}
   case 'complete':{const done=state.done.includes(chapter.id);state.done=done?state.done.filter(id=>id!==chapter.id):[...state.done,chapter.id];save();nav();button.textContent=done?'Mark chapter complete':'✓ Completed · Undo';notify(done?'Chapter marked incomplete':'Chapter complete. Keep going!');break;}
   case 'flip':flashBack=!flashBack;renderFlashcards(chapter?$('#lesson-panel'):$('#revision-cards'),chapter?chapter.terms:allTerms(),!chapter);break;
   case 'flash-prev':case 'flash-next':flashIndex+=button.dataset.action==='flash-next'?1:-1;flashBack=false;renderFlashcards(chapter?$('#lesson-panel'):$('#revision-cards'),chapter?chapter.terms:allTerms(),!chapter);break;
   case 'revision-cards':flashIndex=0;flashBack=false;renderFlashcards($('#revision-cards'),allTerms(),true);$('#revision-cards').scrollIntoView({block:'start'});break;
   case 'restart-final':quizSession={};finalQuiz();window.scrollTo(0,0);break;
   case 'reset':$('#reset-confirm').innerHTML='<div class="callout">Reset chapter completions and practice answers for this course? <button data-action="confirm-reset">Reset progress</button> <button data-action="cancel-reset">Keep progress</button></div>';break;
   case 'cancel-reset':$('#reset-confirm').innerHTML='';break;
   case 'confirm-reset':state={done:[],answers:{},last:1,readings:{},notes:{}};quizSession={};save();nav();revision();notify('Progress reset for this course only.');break;
  }
 });
 const courseScripts=new Map();
 function loadCourseScript(src){if(courseScripts.has(src))return courseScripts.get(src);const pending=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=src;script.onload=resolve;script.onerror=()=>{courseScripts.delete(src);script.remove();reject(new Error('Course reading could not be loaded.'));};document.head.append(script);});courseScripts.set(src,pending);return pending;}
 async function render(){
  const parts=location.hash.slice(1).split('/');
  if(parts[0]==='topic-0'||parts[0]?.startsWith('topic-'))return;
  document.body.classList.remove('menu-open','library');$('#menu').setAttribute('aria-expanded','false');
  let selected=COURSES.find(c=>c.id===parts[1]);
  if(parts[0]!=='course'||!selected){chapter=null;library();return;}
  const snapshot=location.hash;
  try {
   if(selected.contentScript||selected.readingScript&&!selected.chapters[0].reading){
    main.innerHTML='<section class="course-loading" role="status" aria-live="polite"><div class="eyebrow">OPENING YOUR BOOK</div><h1>Making room for ideas.</h1><div class="reading-skeleton"></div><div class="reading-skeleton"></div><div class="reading-skeleton short"></div><p>Loading the complete course reading and chapter index…</p></section>';
    if(selected.contentPrerequisite)await loadCourseScript(selected.contentPrerequisite);
    if(selected.contentScript)await loadCourseScript(selected.contentScript);
    selected=COURSES.find(c=>c.id===parts[1]);
    if(selected.readingScript&&!selected.chapters[0].reading)await loadCourseScript(selected.readingScript);
    if(location.hash!==snapshot)return;
   }
  }catch(error){if(location.hash!==snapshot)return;main.innerHTML='<section class="course-loading" role="alert"><h1>The book didn’t open.</h1><p>Check your connection, then retry loading the course. Your saved progress is kept.</p><button data-action="retry-load">Try again</button><a class="button" href="#home">Back to shelf</a></section>';return;}
  const changed=course.id!==selected.id;course=selected;loadState();if(changed){quizSession={};$('#search').value='';}
  $('.course-name').textContent=`${course.shortTitle.toUpperCase()} / ${course.language}`;
  $('.source-link').href=course.pdf;$('#search').placeholder=course.id==='system-design'?'Try caching or sharding…':'Try inheritance or pointers…';$('.overview-link').href=route(course);$('.overview-link span').textContent='Course overview';$('.sidebar-bottom a').href=route(course,'/revision');$('.nav-caption span').textContent=course.chapters.length;
  chapter=parts[2]==='chapter'?course.chapters.find(c=>String(c.id)===parts[3])||null:null;
  tab='learn';flashIndex=0;flashBack=false;
  if(chapter){state.last=chapter.id;save();renderChapter();}
  else if(parts[2]==='revision')revision();else if(parts[2]==='final')finalQuiz();else overview();
  nav();window.scrollTo(0,0);main.focus({preventScroll:true});
 }
 window.addEventListener('hashchange',render);loadState();render();
})();
