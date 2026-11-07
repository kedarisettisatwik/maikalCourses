const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const files=[...html.matchAll(/<script defer src="(courses\/[^\"]+)"/g)].map(m=>m[1]),sandbox={window:{}};vm.createContext(sandbox);
for(const f of files)vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),sandbox);
for(const f of ['courses/oops-reading.js','courses/system-design-guides.js','courses/system-design.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),sandbox);
const courses=sandbox.window.COURSES;assert(courses?.length);const ids=new Set();let lessons=0,questions=0;
for(const c of courses){assert(/^[a-z0-9-]+$/.test(c.id));assert(!ids.has(c.id));ids.add(c.id);assert(fs.existsSync(path.join(root,c.pdf)));assert(Number.isInteger(c.pdfOffset));assert(c.title&&c.shortTitle&&c.language&&c.attribution&&c.edition);
 c.chapters.forEach((ch,i)=>{assert.equal(ch.id,i+1);assert(ch.page<=ch.end);if(i)assert(ch.page>c.chapters[i-1].end);assert.equal(ch.lessons.length,4);assert.equal(ch.questions.length,2);assert(ch.terms.length>=2);
 ch.lessons.forEach(l=>{assert(l.title&&l.body&&l.takeaway);lessons++;});ch.questions.forEach(q=>{assert.equal(q.options.length,4);assert(q.answer>=0&&q.answer<q.options.length);assert(q.explanation);questions++;});});}
assert.equal(courses[0].chapters.length,14);
for(const m of html.matchAll(/(?:href|src)="([^"#]+)"/g))if(!/^https?:/.test(m[1]))assert(fs.existsSync(path.join(root,m[1])),m[1]);
console.log(`Validated ${courses.length} courses, ${lessons} lessons, ${questions} questions, PDFs and local assets.`);
const sd=courses.find(c=>c.id==='system-design'),oop=courses.find(c=>c.id==='oops');
assert.equal(sd.chapters.length,189,'Every independently audited archive article exists');
const sdCoverage=JSON.parse(fs.readFileSync(path.join(root,'courses/system-design-coverage.json'),'utf8'));
assert.equal(sdCoverage.articles.length,sd.chapters.length);
let expected=8;
for(const c of sd.chapters){assert.equal(c.page,expected,'No source-page gaps or overlap');assert.equal(c.sourcePages.length,c.end-c.page+1);for(const p of c.sourcePages)assert(fs.existsSync(path.join(root,p)));expected=c.end+1;assert(c.graph.length===4);assert(c.interview.model.length>100);assert(c.lessons[0].body.length>0);}
assert.equal(expected,345,'Archive coverage reaches physical page 344');
for(const page of [10,14,21,25,47,65,73,93,97,162,238])assert(sd.chapters.some(c=>c.page===page),'Articles omitted by the original contents are retained');
expected=8;let keywordCount=0,sectionCount=0;
for(const c of oop.chapters){const r=c.reading;assert(r);assert.equal(r.start,expected);assert(r.fullText.length>1000);assert(r.sections.length>4);assert(r.contents.length>5);assert(r.terms.length>=2);for(const p of r.pages)assert(fs.existsSync(path.join(root,p)));keywordCount+=r.terms.length;sectionCount+=r.sections.length;expected=r.end+1;}
assert.equal(expected,329);assert.equal(keywordCount,81);
assert(!html.includes('id="theme"'),'Single light theme has no dark-mode control');
console.log(`Coverage verified: 189 System Design articles, all 337 source pages; 14 OOP units, ${sectionCount} reading sections, ${keywordCount} keyword definitions, all 321 source pages.`);
