/* Small teaching diagrams use the same vocabulary as the authored explanation. */
window.TeachingVisuals={render(kind){const box=(label,detail='')=>`<div class="idea-box"><strong>${label}</strong>${detail?`<small>${detail}</small>`:''}</div>`,arrow='<span class="idea-arrow" aria-hidden="true">→</span>';let html='';
 if(kind==='objects')html=box('Account','shared type')+arrow+`<div class="idea-stack">${box('Savings','balance: 100')}${box('Travel','balance: 25')}</div>`;
 if(kind==='access')html=`<div class="access-stack"><div><b>Public</b><span>supported interface</span></div><div><b>Protected</b><span>class + eligible derived code</span></div><div><b>Private</b><span>class members + friends</span></div></div>`;
 if(kind==='abstraction')html=box('Caller','push / pop')+arrow+box('Stack interface','array OR linked storage');
 if(kind==='encapsulation')html=box('withdraw(30)','request')+arrow+box('Check rules','balance ≥ 0')+arrow+box('Update','valid state');
 if(kind==='inheritance')html=box('Person')+arrow+box('Employee')+arrow+box('Manager');
 if(kind==='polymorphism')html=box('Shape.draw()','one interface')+arrow+`<div class="idea-stack">${box('Circle.draw()')}${box('Rectangle.draw()')}</div>`;
 if(kind==='binding')html=box('Shape reference','declared type')+arrow+box('Circle object','actual type')+arrow+box('Circle.draw()','virtual override');
 if(kind==='message')html=box('account','receiver')+arrow+box('deposit','operation')+arrow+box('50','argument');
 if(kind==='lifecycle')html=['Study','Analyze','Design','Build','Maintain'].map(x=>box(x)).join(arrow);
 return html?`<figure class="teaching-diagram" aria-label="${kind} concept diagram">${html}</figure>`:'';
}};
