(function(){
  if(!matchMedia('(pointer:fine)').matches||!matchMedia('(min-width:1025px)').matches)return;
  if(window.__noGPU)return; /* use native OS cursor on software renderer — RAF loop would lag */
  var dot=document.createElement('div');dot.id='cur-dot';
  var ring=document.createElement('div');ring.id='cur-ring';
  document.body.appendChild(dot);document.body.appendChild(ring);
  document.body.classList.add('has-custom-cursor');
  var reduce=!matchMedia('(prefers-reduced-motion: no-preference)').matches;
  var mx=innerWidth/2,my=innerHeight/2,dx=mx,dy=my,rx=mx,ry=my,seen=false;
  var hoverSel='a,button,input,textarea,[role=button],.orb,.skc,.skf,.expf,.proj-toggle,.exp-toggle,.proj-card,.thm-btn,.cmdk-hint,.citem,#srail a,.sico';
  function show(){dot.classList.add('on');ring.classList.add('on');}
  function hide(){dot.classList.remove('on');ring.classList.remove('on');}
  addEventListener('pointermove',function(e){mx=e.clientX;my=e.clientY;if(!seen){seen=true;show();}},{passive:true});
  addEventListener('pointerdown',function(){ring.classList.add('down');});
  addEventListener('pointerup',function(){ring.classList.remove('down');});
  document.addEventListener('pointerover',function(e){var t=e.target.closest&&e.target.closest(hoverSel);if(t)ring.classList.add('hover');});
  document.addEventListener('pointerout',function(e){var t=e.target.closest&&e.target.closest(hoverSel);if(t){var to=e.relatedTarget;if(!(to&&to.closest&&to.closest(hoverSel)))ring.classList.remove('hover');}});
  document.documentElement.addEventListener('mouseleave',hide);
  document.documentElement.addEventListener('mouseenter',function(){if(seen)show();});
  if(window.__noGPU){ring.style.display='none';} /* skip lagging ring on software renderer */
  (function loop(){
    var kd=(reduce||window.__noGPU)?1:.4,kr=reduce?1:.18;
    dx+=(mx-dx)*kd;dy+=(my-dy)*kd;rx+=(mx-rx)*kr;ry+=(my-ry)*kr;
    dot.style.transform='translate('+dx.toFixed(2)+'px,'+dy.toFixed(2)+'px)';
    if(!window.__noGPU)ring.style.transform='translate('+rx.toFixed(2)+'px,'+ry.toFixed(2)+'px)';
    requestAnimationFrame(loop);
  })();

  /* kinetic: scroll velocity leans the skills marquee viewport */
  if(!reduce){
    var mq=document.querySelector('.mq'),sk=0;
    if(mq){(function mqLoop(){
      var v=window.__scrollVel||0,target=Math.max(-7,Math.min(7,v*0.18));
      sk+=(target-sk)*0.1;
      mq.style.transform=Math.abs(sk)<0.02?'':'skewX('+sk.toFixed(2)+'deg)';
      requestAnimationFrame(mqLoop);
    })();}
  }
})();
