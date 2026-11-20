/* Trail geometry and node positions share the same coordinate system. */
window.WorldMap={
 point(index){return {x:180+Math.sin(index*1.16)*68,y:65+index*172};},
 trail(count,start=0){const points=Array.from({length:count},(_,i)=>({...this.point(start+i),y:65+i*172}));let d=points.length?`M${points[0].x} ${points[0].y}`:'';for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i];d+=` C${a.x} ${a.y+86} ${b.x} ${b.y-86} ${b.x} ${b.y}`;}return `<svg class="trail-svg" viewBox="0 0 360 ${Math.max(172,count*172)}" preserveAspectRatio="none" aria-hidden="true"><path class="trail-edge" d="${d}"/><path class="trail-road" d="${d}"/><path class="trail-stitches" d="${d}"/></svg>`;}
};
