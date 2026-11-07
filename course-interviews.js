/* An actual final Interview chapter for every book; original IDs stay stable. */
window.CourseInterviews={
 ensure(course){
  if(course.chapters.some(ch=>ch.kind==='book-interview'))return;
  const id=Math.max(...course.chapters.map(c=>c.id))+1;
  course.chapters.push({id,title:'Interview',kind:'book-interview',description:'Book-wide questions and model answers, grouped by source chapter. Review definitions, mechanisms, trade-offs, and applied scenarios.',lessons:[],questions:[],terms:[]});
 },
 bank(course){const items=[],seen=new Set();const add=(chapter,question,answer,type)=>{const key=chapter.id+':'+question.toLowerCase().replace(/\W/g,'');if(seen.has(key))return;seen.add(key);items.push({chapterId:chapter.id,chapterTitle:chapter.title,question,answer,type});};
  for(const c of course.chapters){if(c.kind==='book-interview')continue;
   for(const qa of c.interviewQAs||[])add(c,qa.question,qa.answer,'Question & answer');
   for(const q of c.questions||[])add(c,q.question,q.options[q.answer]+(q.options[q.answer].trim()===q.explanation.trim()?'':' '+q.explanation),'Concept check');
   for(const [term,definition] of c.terms||[])add(c,'What is '+term+'?',definition,course.definitionsLabel||'Definition');
   if(c.interview){add(c,'Apply the ideas from “'+c.title+'”: '+c.interview.prompt,c.interview.model,'Applied scenario');add(c,'Which engineering decisions should you explain for “'+c.title+'”?',c.interview.focus,'Chapter synthesis');}
   else for(const l of c.lessons||[])add(c,'Explain “'+l.title+'” with its key distinction.',l.takeaway,'Chapter synthesis');
  }
  return items;
 }
};
