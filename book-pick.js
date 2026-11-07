/* Reserve physical shelf space, pull forward, then turn. Initial pointer position
   does not open a book; resting spines are flat surfaces, never angled covers. */
(() => {
 let picked=null,revealTimer=null,latestPointer='mouse';
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 function clear(){clearTimeout(revealTimer);document.querySelectorAll('.book-link').forEach(el=>el.classList.remove('is-spacing','is-picked'));picked=null;}
 function pick(link){if(picked===link)return;clear();picked=link;link.classList.add('is-spacing');revealTimer=setTimeout(()=>{if(link.isConnected&&picked===link)link.classList.add('is-picked');},reduce.matches?0:280);}
 document.addEventListener('pointermove',event=>{latestPointer=event.pointerType||'mouse';if(latestPointer==='touch')return;const link=event.target.closest('.book-link');if(link)pick(link);else if(!event.target.closest('.bookshelf-scene'))clear();},{passive:true});
 document.addEventListener('pointerdown',event=>{latestPointer=event.pointerType||'mouse';},{passive:true});
 document.addEventListener('click',event=>{const link=event.target.closest('.book-link');if(!link||latestPointer!=='touch')return;if(picked!==link||!link.classList.contains('is-picked')){event.preventDefault();pick(link);const label=document.querySelector('#shelf-book-label');if(label)label.textContent='Tap the open book again to enter the course.';}});
 document.addEventListener('focusin',event=>{const link=event.target.closest('.book-link');if(link&&link.matches(':focus-visible'))pick(link);});
 document.addEventListener('keydown',event=>{if(event.key==='Escape')clear();});
 document.addEventListener('pointerout',event=>{if(event.pointerType!=='touch'&&!event.relatedTarget)clear();});
 window.addEventListener('hashchange',clear);
})();

