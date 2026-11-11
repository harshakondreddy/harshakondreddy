(function(){
  var mq=document.querySelector('.mq'),track=document.querySelector('.mq-track');
  if(!mq||!track)return;
  track.style.animation='none';
  track.style.willChange='transform';
  var offset=0,vel=0,dragging=false;
  var prevX=0,prevT=0;
  var trackHalf=0,paused=false;
  var AUTO=0.5;
  function measure(){trackHalf=Math.round(track.scrollWidth/2);return trackHalf>0;}
  if(!measure())window.addEventListener('load',measure,{once:true});
  function wrap(v){if(!trackHalf)return v;v=v%trackHalf;if(v>0)v-=trackHalf;return v;}
  var mqOn=true,mqRaf=0;
  new IntersectionObserver(function(en){mqOn=en[0].isIntersecting;if(mqOn&&!mqRaf)loop();}).observe(mq);
  function loop(){
    mqRaf=0;if(!mqOn)return;
    if(!dragging){vel=Math.abs(vel)>0.06?vel*0.94:(paused?0:-AUTO);offset+=vel;}
    if(trackHalf)offset=wrap(offset);
    track.style.transform='translateX('+offset.toFixed(1)+'px)';
    mqRaf=requestAnimationFrame(loop);
  }
  loop();

  /* Unified pointer-event drag — same approach as the orbital icons (mouse + touch via pan-y).
     Direction is decided from the START of the gesture; vertical panning is left to the browser. */
  var startX=0,startY=0,intentDecided=false,isHoriz=false,activePid=-1;
  function moveCalc(x){
    var now=Date.now(),dt=Math.max(now-prevT,1),dx=x-prevX;
    vel=Math.max(-50,Math.min(50,dx/dt*16));
    offset+=dx;prevX=x;prevT=now;
  }
  function endDrag(){dragging=false;intentDecided=false;isHoriz=false;activePid=-1;mq.classList.remove('mq-drag');}

  mq.addEventListener('pointerdown',function(e){
    if(e.pointerType==='mouse'&&e.button!==0)return;
    if(!trackHalf&&!measure())return;
    startX=e.clientX;startY=e.clientY;
    intentDecided=false;isHoriz=false;activePid=e.pointerId;
    vel=0;prevX=startX;prevT=Date.now();
    /* Mouse: commit immediately — no ambiguity with vertical scroll */
    if(e.pointerType!=='touch'){
      dragging=true;mq.classList.add('mq-drag');
      try{mq.setPointerCapture(e.pointerId);}catch(_){}
      e.preventDefault();
    }
  });
  mq.addEventListener('pointermove',function(e){
    if(e.pointerId!==activePid)return;
    /* Touch: wait to distinguish horizontal drag from vertical scroll */
    if(!intentDecided){
      var adx=Math.abs(e.clientX-startX),ady=Math.abs(e.clientY-startY);
      if(adx<5&&ady<5)return;
      intentDecided=true;
      isHoriz=adx>ady*0.8;
      if(isHoriz){
        dragging=true;mq.classList.add('mq-drag');
        try{mq.setPointerCapture(e.pointerId);}catch(_){}
      }
    }
    if(!isHoriz)return;
    moveCalc(e.clientX);
    e.preventDefault();
  });
  mq.addEventListener('pointerup',function(e){if(e.pointerId===activePid)endDrag();});
  mq.addEventListener('pointercancel',function(e){if(e.pointerId===activePid)endDrag();});

  mq.addEventListener('mouseenter',function(){if(!dragging)paused=true;});
  mq.addEventListener('mouseleave',function(){paused=false;});
})();
