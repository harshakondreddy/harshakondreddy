/* ── Tesseract — a real 4D hypercube, double-rotated in the XW/YZ/ZW planes and
      perspective-projected 4D→3D→2D. Scroll velocity feeds the W-axis rotation,
      the mouse steers the XW/YZ planes. Static single frame on reduced-motion
      and software renderers (no RAF loop, per the no-gpu policy). ── */
(function(){
  var cv=document.getElementById('tsr'),hero=document.getElementById('home');
  if(!cv||!hero)return;
  var ctx=cv.getContext('2d');if(!ctx)return;
  var motion=matchMedia('(prefers-reduced-motion: no-preference)').matches;
  var fine=matchMedia('(pointer:fine)').matches;
  var still=(!motion||!!window.__noGPU);
  var DPR=Math.min(devicePixelRatio||1,2),W=0,H=0;

  /* 16 vertices (±1)⁴ + the 32 edges that differ in exactly one coordinate */
  var V=[],E=[],i,b;
  for(i=0;i<16;i++)V.push([i&1?1:-1,i&2?1:-1,i&4?1:-1,i&8?1:-1]);
  for(i=0;i<16;i++)for(b=0;b<4;b++){var j=i^(1<<b);if(j>i)E.push([i,j]);}

  var a=0.35,rb=0.62,rc=0;          /* XW, YZ, ZW angles */
  var mx=0,my=0,tmx=0,tmy=0;        /* eased mouse steer */

  function isLight(){return document.documentElement.getAttribute('data-theme')==='light';}
  function size(){
    W=hero.offsetWidth;H=hero.offsetHeight;
    cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);
    ctx.setTransform(DPR,0,0,DPR,0,0);
  }
  function draw(){
    ctx.clearRect(0,0,W,H);
    var desk=W>1024;
    /* mobile hero stacks vertically — anchor the hypercube behind the avatar near the bottom */
    var cx=desk?W*.69:W*.5, cy=desk?H*.47:H*.8;
    var sc=Math.min(W,H)*(desk?.155:.13);
    var ca=Math.cos(a+mx),sa=Math.sin(a+mx),cb=Math.cos(rb+my),sb=Math.sin(rb+my),cc=Math.cos(rc),scw=Math.sin(rc);
    var P=[],S=[],k;
    for(k=0;k<16;k++){
      var x=V[k][0],y=V[k][1],z=V[k][2],w=V[k][3];
      var x1=x*ca-w*sa, w1=x*sa+w*ca;          /* rotate XW */
      var y1=y*cb-z*sb, z1=y*sb+z*cb;          /* rotate YZ */
      var z2=z1*cc-w1*scw, w2=z1*scw+w1*cc;    /* rotate ZW */
      var k4=2.6/(2.6-w2*.72);                 /* 4D → 3D perspective */
      var X=x1*k4,Y=y1*k4,Z=z2*k4;
      var k3=3.4/(3.4-Z*.9);                   /* 3D → 2D perspective */
      P.push([cx+X*k3*sc,cy+Y*k3*sc]);
      S.push(k4*k3);
    }
    var light=isLight(),e,t;
    for(e=0;e<E.length;e++){
      var p=P[E[e][0]],q=P[E[e][1]];
      t=Math.max(0,Math.min(1,((S[E[e][0]]+S[E[e][1]])/2-.72)/.78));
      ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1]);
      ctx.lineWidth=.6+t*1.5;
      ctx.strokeStyle=light?'rgba(195,74,9,'+(.10+t*.30).toFixed(3)+')'
                           :'rgba(255,138,54,'+(.09+t*.36).toFixed(3)+')';
      ctx.stroke();
    }
    for(k=0;k<16;k++){
      t=Math.max(0,Math.min(1,(S[k]-.72)/.78));
      ctx.beginPath();ctx.arc(P[k][0],P[k][1],1+t*1.8,0,Math.PI*2);
      ctx.fillStyle=light?'rgba(195,74,9,'+(.16+t*.36).toFixed(3)+')'
                         :'rgba(255,170,90,'+(.14+t*.44).toFixed(3)+')';
      ctx.fill();
    }
  }

  size();draw();
  addEventListener('resize',function(){size();draw();},{passive:true});
  /* theme flips repaint the static frame too */
  new MutationObserver(draw).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  if(still)return;   /* reduced-motion / no-gpu: keep the sculpture, skip the loop */

  if(fine){
    hero.addEventListener('pointermove',function(e){tmx=(e.clientX/innerWidth-.5)*.7;tmy=(e.clientY/innerHeight-.5)*.5;},{passive:true});
    hero.addEventListener('pointerleave',function(){tmx=0;tmy=0;});
  }
  var paused=false,inView=true,raf=null,tid;
  var coarse=matchMedia('(pointer:coarse)').matches,fr=0;
  function loop(){
    if(paused||!inView){raf=null;return;}
    mx+=(tmx-mx)*.05;my+=(tmy-my)*.05;
    var sv=Math.min(Math.abs(window.__scrollVel||0)*.0012,.05);
    a+=.0035+sv;rb+=.0022+sv*.6;rc+=.0016;
    if(!coarse||(fr^=1))draw();   /* 30fps on touch devices */
    raf=requestAnimationFrame(loop);
  }
  function resume(){paused=false;if(!raf&&inView)raf=requestAnimationFrame(loop);}
  raf=requestAnimationFrame(loop);
  /* same discipline as the particle layer: pause while scrolling, offscreen, or hidden */
  addEventListener('scroll',function(){paused=true;clearTimeout(tid);tid=setTimeout(resume,200);},{passive:true});
  new IntersectionObserver(function(en){inView=en[0].isIntersecting;if(inView)resume();}).observe(hero);
  document.addEventListener('visibilitychange',function(){if(document.hidden)paused=true;else resume();});
})();

/* ── Z-space scroll depth: sections surface from translateZ(-160px) as they
      enter the viewport. Desktop fine-pointer + motion + real GPU only. ── */
(function(){
  if(!matchMedia('(prefers-reduced-motion: no-preference)').matches)return;
  if(!matchMedia('(pointer:fine)').matches)return;
  if(window.__noGPU||innerWidth<1025)return;
  var els=[].slice.call(document.querySelectorAll('section[data-num]'));
  if(!els.length)return;
  document.body.classList.add('fx-depth');
  var tick=false;
  function upd(){
    var s=scrollY,vh=innerHeight;
    for(var i=0;i<els.length;i++){
      var p=Math.max(0,Math.min(1,(s+vh-els[i].offsetTop)/(vh*.55)));
      var ease=1-Math.pow(1-p,3);
      els[i].style.setProperty('--dz',(-160*(1-ease)).toFixed(1)+'px');
      els[i].style.setProperty('--drx',(3.5*(1-ease)).toFixed(2)+'deg');
    }
    tick=false;
  }
  addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(upd);}},{passive:true});
  addEventListener('resize',upd,{passive:true});
  addEventListener('load',upd);
  upd();
})();

/* ── Time dimension: live Atlanta clock + time-of-day greeting ── */
(function(){
  var t=document.getElementById('hctime'),g=document.getElementById('hgreet'),z=document.getElementById('hctz');
  if(!t||!g)return;
  var fmt,hfmt;
  try{
    fmt=new Intl.DateTimeFormat('en-US',{timeZone:(window.SITE&&SITE.clockTimezone)||'America/New_York',hourCycle:'h23',hour:'2-digit',minute:'2-digit',second:'2-digit'});
    hfmt=new Intl.DateTimeFormat('en-US',{timeZone:(window.SITE&&SITE.clockTimezone)||'America/New_York',hourCycle:'h23',hour:'numeric'});
    if(z){
      var parts=new Intl.DateTimeFormat('en-US',{timeZone:(window.SITE&&SITE.clockTimezone)||'America/New_York',timeZoneName:'short'}).formatToParts(new Date());
      for(var i=0;i<parts.length;i++)if(parts[i].type==='timeZoneName')z.textContent=parts[i].value;
    }
  }catch(e){var hc=document.getElementById('hclock');if(hc)hc.style.display='none';return;}
  function tickC(){
    var now=new Date();
    t.textContent=fmt.format(now);
    var h=parseInt(hfmt.format(now),10);
    g.textContent=h<5?'Working late':h<12?'Good morning':h<17?'Good afternoon':'Good evening';
  }
  tickC();setInterval(tickC,1000);
})();
