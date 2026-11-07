/* Reserve physical shelf space, pull forward, then turn. Initial pointer position
   does not open a book; resting spines are flat surfaces, never angled covers. */
(() => {
 let picked=null,revealTimer=null,latestPointer='mouse';
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const returns=new WeakMap();
 function putBack(link){clearTimeout(returns.get(link));const open=link.classList.contains('is-picked');if(open)link.style.setProperty('--return-from',getComputedStyle(link.querySelector('.book-object')).transform);link.classList.remove('is-picked');if(open&&!reduce.matches){link.classList.add('is-returning');returns.set(link,setTimeout(()=>{link.classList.remove('is-returning','is-spacing');},950));}else link.classList.remove('is-spacing','is-returning');}
 function clear(){clearTimeout(revealTimer);const previous=picked;picked=null;if(previous)putBack(previous);}
 function pick(link){if(picked===link||link.classList.contains('is-arriving'))return;clear();clearTimeout(returns.get(link));link.classList.remove('is-returning');picked=link;link.classList.add('is-spacing');revealTimer=setTimeout(()=>{if(link.isConnected&&picked===link)link.classList.add('is-picked');},reduce.matches?0:700);}
 window.LibraryMotion={enter(){document.querySelectorAll('.book-link').forEach(link=>{if(reduce.matches)return;link.classList.add('is-arriving');link.addEventListener('animationend',event=>{if(event.animationName!=='book-land')return;link.classList.remove('is-arriving');if(link.matches(':focus-visible'))pick(link);},{once:true});});}};
 document.addEventListener('pointermove',event=>{latestPointer=event.pointerType||'mouse';if(latestPointer==='touch')return;const link=event.target.closest('.book-link');if(link)pick(link);else if(!event.target.closest('.bookshelf-scene'))clear();},{passive:true});
 document.addEventListener('pointerdown',event=>{latestPointer=event.pointerType||'mouse';},{passive:true});
 document.addEventListener('click',event=>{const link=event.target.closest('.book-link');if(!link||latestPointer!=='touch')return;if(picked!==link||!link.classList.contains('is-picked')){event.preventDefault();pick(link);const label=document.querySelector('#shelf-book-label');if(label)label.textContent='Tap the open book again to enter the course.';}});
 document.addEventListener('focusin',event=>{const link=event.target.closest('.book-link');if(link&&link.matches(':focus-visible'))pick(link);});
 document.addEventListener('keydown',event=>{if(event.key==='Escape')clear();});
 document.addEventListener('pointerout',event=>{if(event.pointerType!=='touch'&&!event.relatedTarget)clear();});
 window.addEventListener('hashchange',clear);
})();
