const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const files=[...html.matchAll(/<script defer src="(courses\/[^\"]+)"/g)].map(m=>m[1]),sandbox={window:{}};vm.createContext(sandbox);
for(const f of files)vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),sandbox);
const courses=sandbox.window.COURSES;assert(courses?.length);const ids=new Set();let lessons=0,questions=0;
for(const c of courses){assert(/^[a-z0-9-]+$/.test(c.id));assert(!ids.has(c.id));ids.add(c.id);assert(fs.existsSync(path.join(root,c.pdf)));assert(Number.isInteger(c.pdfOffset));assert(c.title&&c.shortTitle&&c.language&&c.attribution&&c.edition);
 c.chapters.forEach((ch,i)=>{assert.equal(ch.id,i+1);assert(ch.page<=ch.end);if(i)assert(ch.page>c.chapters[i-1].end);assert.equal(ch.lessons.length,4);assert.equal(ch.questions.length,2);assert(ch.terms.length>=2);
 ch.lessons.forEach(l=>{assert(l.title&&l.body&&l.takeaway);lessons++;});ch.questions.forEach(q=>{assert.equal(q.options.length,4);assert(q.answer>=0&&q.answer<q.options.length);assert(q.explanation);questions++;});});}
assert.equal(courses[0].chapters.length,14);
for(const m of html.matchAll(/(?:href|src)="([^"#]+)"/g))if(!/^https?:/.test(m[1]))assert(fs.existsSync(path.join(root,m[1])),m[1]);
console.log(`Validated ${courses.length} courses, ${lessons} lessons, ${questions} questions, PDFs and local assets.`);
