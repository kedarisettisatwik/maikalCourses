/* Lightweight shelf metadata. Full source readings load only when a course opens. */
(() => {
 const oop=window.COURSES.find(c=>c.id==='oops');
 oop.readingScript='courses/oops-reading.js';oop.bookTitle='Object-oriented Programming';oop.bookSubtitle='C++ / complete textbook companion';
 window.COURSES.push({id:'system-design',title:'System Design',shortTitle:'System Design Studio',bookTitle:'System Design',bookSubtitle:'Architecture & interview practice',language:'Architecture',edition:'BIG ARCHIVE / 2023',pdf:'assets/system-design/source.pdf',description:'All 189 archive articles, original diagrams, and interview companion notes.',contentScript:'courses/system-design.js',contentPrerequisite:'courses/system-design-guides.js',chapters:Array.from({length:189},(_,i)=>({id:i+1}))});
})();
