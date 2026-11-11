/* Reads personal details from window.SITE, which _layouts/default.html fills from _data/site.yml and _data/hero.yml. */
var SITE=window.SITE||{};
/* Icon as a small SVG mask (same rules as _includes/icon.html), e.g. ico('fa-solid fa-house') */
function ico(cls){
  var u='',fam='solid',fa='';
  cls.split(' ').forEach(function(p){
    if(p.indexOf('devicon-')===0){var n=p.slice(8);u='https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons/'+n.split('-')[0]+'/'+n+'.svg';}
    else if(p==='fa-brands')fam='brands';else if(p==='fa-regular')fam='regular';
    else if(p!=='fa-solid'&&p.indexOf('fa-')===0)fa=p.slice(3);
  });
  if(!u&&fa)u='https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.0/svgs/'+fam+'/'+fa+'.svg';
  return '<i class="ico '+cls+'" style="--ico:url('+u+')" aria-hidden="true"></i>';
}
window.ico=ico;
/* ── Theme toggle (persists; defaults to device setting) ── */
(function(){
  var root=document.documentElement,btn=document.getElementById('thm');
  btn.addEventListener('click',function(){
    var t=root.getAttribute('data-theme')==='dark'?'light':'dark';
    function apply(){root.setAttribute('data-theme',t);try{localStorage.setItem('hk-theme',t);}catch(e){}}
    /* Circular reveal from the toggle button (View Transitions API); instant switch where unsupported */
    if(document.startViewTransition&&matchMedia('(prefers-reduced-motion: no-preference)').matches){
      var r=btn.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;
      root.style.setProperty('--vtx',x+'px');root.style.setProperty('--vty',y+'px');
      root.style.setProperty('--vtr',Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y))+'px');
      document.startViewTransition(apply);
    }else apply();
  });
  var mq=window.matchMedia('(prefers-color-scheme:light)');
  function ap(){if(!localStorage.getItem('hk-theme'))root.setAttribute('data-theme',mq.matches?'light':'dark');}
  if(mq.addEventListener)mq.addEventListener('change',ap);else if(mq.addListener)mq.addListener(ap);
})();

/* ── Scroll reveal: each block animates in once, triggered just before it reaches the screen,
      so scrolling back up or down never shows faded or blank areas ── */
var SDA=!!(window.CSS&&CSS.supports&&CSS.supports('animation-timeline: scroll()'));   /* progress bar only */
if(SDA)document.documentElement.classList.add('sda');
(function(){
  var revEls=Array.from(document.querySelectorAll('.reveal,.reveal-left,.reveal-right,.reveal-zoom'));
  function showVisible(){
    revEls=revEls.filter(function(el){
      if(el.classList.contains('shown'))return false;
      var r=el.getBoundingClientRect();
      if(r.top<innerHeight*1.4){el.classList.add('shown');return false;}   /* in view, just below, or already scrolled past */
      return true;
    });
  }
  var obs=new IntersectionObserver(function(entries){
    entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('shown');obs.unobserve(e.target);}});
  },{threshold:0,rootMargin:'0px 0px 40% 0px'});
  revEls.forEach(function(el){obs.observe(el);});
  /* Fallback: also check on scroll end and after programmatic jumps */
  var rv_t;
  window.addEventListener('scroll',function(){clearTimeout(rv_t);rv_t=setTimeout(showVisible,120);},{passive:true});
  setTimeout(showVisible,500);
})();



/* ── Typed.js ── */
if(typeof Typed!=='undefined')new Typed('#typed',{strings:SITE.typedRoles,typeSpeed:55,backSpeed:28,backDelay:2200,loop:true,smartBackspace:true});

/* ── Scroll: nav + progress + active links (rAF-throttled, no reflow) ── */
var bar=document.getElementById('progress'),nav=document.getElementById('nav');
var navLinks=document.querySelectorAll('.nlinks a');
var tlEl=document.querySelector('.tl'),bttEl=document.getElementById('btt'),hwEl=document.getElementById('hw');
var isTouch=matchMedia('(pointer:coarse)').matches;
var secs=[];
function cacheSecs(){secs=Array.from(document.querySelectorAll('section[id]')).map(function(s){return{id:s.id,el:s};});}
var ticking=false,lastNavY=0,navHidden=false,scrollAccum=0;
function processScroll(){
  var s=window.scrollY;
  var h=Math.max(document.body.scrollHeight-innerHeight,1);
  if(!SDA)bar.style.width=(Math.min(Math.max(s,0),h)/h*100)+'%';
  nav.classList.toggle('on',s>50);
  /* Auto-hide: hide on any downward movement; reveal after 80px of uninterrupted upward travel.
     Any positive dy resets scrollAccum, so rubber-band and address-bar events can't accidentally reveal. */
  var dy=s-lastNavY,menuOpen=(typeof nl!=='undefined'&&nl&&nl.classList.contains('open'));
  var navJumping=document.body.classList.contains('nav-jumping');
  if(s<120||menuOpen){
    if(navHidden){nav.classList.remove('hide');navHidden=false;}
    scrollAccum=0;
  }else if(navJumping){
    scrollAccum=0;
  }else if(dy>0){
    if(!navHidden){nav.classList.add('hide');navHidden=true;}
    scrollAccum=0; /* any downward movement (incl. address-bar hide) resets accumulator */
  }else if(dy<-2){
    scrollAccum+=-dy;
    if(navHidden&&scrollAccum>=80){nav.classList.remove('hide');navHidden=false;scrollAccum=0;}
  }
  lastNavY=s;
  var active='';
  for(var i=secs.length-1;i>=0;i--){
    if(secs[i].el.offsetTop-120<=s){active=secs[i].id;break;}
  }
  navLinks.forEach(function(a){a.classList.toggle('act',a.getAttribute('href')==='#'+active);});
  if(tlEl){var tr=tlEl.getBoundingClientRect();var tp=Math.min(Math.max((innerHeight*.82-tr.top)/tr.height,0),1);tlEl.style.setProperty('--tlp',tp.toFixed(3));}
  if(bttEl)bttEl.classList.toggle('show',s>600);
  if(hwEl&&!isTouch&&s<innerHeight*1.4){
    hwEl.style.transform='translateY('+(s*.08).toFixed(1)+'px)';
    hwEl.style.opacity='1';
  }
  ticking=false;
}
window.addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(processScroll);}},{passive:true});
window.addEventListener('load',function(){cacheSecs();processScroll();});
setTimeout(function(){cacheSecs();processScroll();},400);

/* ── Quick in-page jumps: ~0.45 s ease instead of the browser's slower long-distance smooth scroll ── */
(function(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,anim=0;
  function jump(hash){
    var el=document.querySelector(hash); if(!el)return false;
    var start=scrollY,end=Math.max(0,Math.min(el.getBoundingClientRect().top+start-96,document.documentElement.scrollHeight-innerHeight));
    cancelAnimationFrame(anim);
    if(reduce||Math.abs(end-start)<2){window.scrollTo(0,end);return true;}
    var d=Math.min(520,280+Math.abs(end-start)*.04),t0=performance.now();
    document.documentElement.style.scrollBehavior='auto';
    (function step(t){var p=Math.min((t-t0)/d,1),e=1-Math.pow(1-p,3);window.scrollTo(0,start+(end-start)*e);
      if(p<1)anim=requestAnimationFrame(step);else document.documentElement.style.scrollBehavior='';})(t0);
    return true;
  }
  window.__jump=jump;
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a[href^="#"]'); if(!a)return;
    var h=a.getAttribute('href'); if(!h||h.length<2||!document.querySelector(h))return;
    e.preventDefault(); if(jump(h)&&history.replaceState)history.replaceState(null,'',h);
  });
})();

/* ── Burger ── */
var bur=document.getElementById('bur'),nl=document.getElementById('nlinks');
bur.addEventListener('click',function(){nl.classList.toggle('open');});
nl.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){nl.classList.remove('open');});});

/* ── Photo slideshow ── */
(function(){
  var slides=document.querySelectorAll('.av-slide');
  if(slides.length<2)return;
  var cur=0;
  setInterval(function(){slides[cur].classList.remove('active');cur=(cur+1)%slides.length;slides[cur].classList.add('active');},4500);
})();

/* ── Premium interactions: spotlight, tilt, magnetic, parallax, counters ── */
(function(){
  var fine=matchMedia('(pointer:fine)').matches;
  var motion=matchMedia('(prefers-reduced-motion: no-preference)').matches;

  /* Cursor spotlight on all cards */
  var cards=document.querySelectorAll('.tlic,.proj-card,.cert-card,.edu-card,.sttile,.ach,.citem,.cform');
  cards.forEach(function(c){c.classList.add('spot');});
  if(fine&&!window.__noGPU){
    cards.forEach(function(c){
      c.addEventListener('pointermove',function(e){
        var r=c.getBoundingClientRect();
        c.style.setProperty('--mx',(e.clientX-r.left)+'px');
        c.style.setProperty('--my',(e.clientY-r.top)+'px');
      });
    });
  }

  if(fine&&motion&&!window.__noGPU){
    /* Cursor-tracked 3D tilt on all cards */
    function tiltify(sel,max){
      document.querySelectorAll(sel).forEach(function(c){
        c.addEventListener('pointermove',function(e){
          var r=c.getBoundingClientRect();
          var px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;
          c.style.transform='perspective(900px) rotateX('+(-py*max).toFixed(2)+'deg) rotateY('+(px*max*1.15).toFixed(2)+'deg) translateY(-3px)';
        });
        c.addEventListener('pointerleave',function(){c.style.transform='';});
      });
    }
    tiltify('.proj-card',5);
    tiltify('.tlic,.cert-card,.edu-card,.tools-card,.ach,.citem',3);

    /* Magnetic buttons */
    document.querySelectorAll('.hbtns a,.srow a').forEach(function(b){
      b.addEventListener('pointermove',function(e){
        var r=b.getBoundingClientRect();
        b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.18).toFixed(1)+'px,'+((e.clientY-r.top-r.height/2)*.3-2).toFixed(1)+'px)';
      });
      b.addEventListener('pointerleave',function(){b.style.transform='';});
    });

    /* Hero mouse parallax */
    var hw=document.getElementById('hw'),hr=document.querySelector('.hr'),hl=document.querySelector('.hl'),prx=0,pry=0,pRaf=null;
    if(hw&&hr&&hl){
      hw.addEventListener('pointermove',function(e){
        prx=e.clientX/innerWidth-.5;pry=e.clientY/innerHeight-.5;
        if(!pRaf)pRaf=requestAnimationFrame(function(){
          hr.style.transform='translate('+(prx*14).toFixed(1)+'px,'+(pry*10).toFixed(1)+'px)';
          hl.style.transform='translate('+(prx*-6).toFixed(1)+'px,'+(pry*-4).toFixed(1)+'px)';
          pRaf=null;
        });
      });
      hw.addEventListener('pointerleave',function(){hr.style.transform='';hl.style.transform='';});
    }
  }

  /* Scroll velocity (read by the 4D cube and orbit icons; no animation loop here) */
  var vLast=scrollY;
  window.addEventListener('scroll',function(){window.__scrollVel=scrollY-vLast;vLast=scrollY;},{passive:true});

  /* Animated stat counters */
  var cObs=new IntersectionObserver(function(es){
    es.forEach(function(en){
      if(!en.isIntersecting)return;
      cObs.unobserve(en.target);
      var el=en.target,m=el.textContent.trim().match(/^(\d+)(.*)$/);
      if(!m)return;
      var n=+m[1],suf=m[2],t0=null;
      function step(t){
        if(!t0)t0=t;
        var p=Math.min((t-t0)/1100,1);p=1-Math.pow(1-p,3);
        el.textContent=Math.round(n*p)+suf;
        if(p<1)requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  },{threshold:.6});
  document.querySelectorAll('.sttile .val,.ms-v').forEach(function(v){cObs.observe(v);});

  /* Back to top */
  var btt=document.getElementById('btt');
  btt.addEventListener('click',function(){
    window.scrollTo({top:0,behavior:'smooth'});
  });
})();

/* ── 3D orbital icons around avatar (interactive: drag to pull + fling to spin) ── */
(function(){
  var avw=document.querySelector('.avw');if(!avw)return;
  var orbs=[].slice.call(avw.querySelectorAll('.orb'));if(!orbs.length)return;
  if(!matchMedia('(prefers-reduced-motion: no-preference)').matches)return;
  if(window.__noGPU)return; /* skip 3D orbital animation on software renderer */
  var fine=matchMedia('(pointer:fine)').matches;
  var N=orbs.length,t=Math.PI/5;
  var speed=1,tSpeed=1;            /* hover brake */
  var tilt=.38,tTilt=.38;          /* plane flatness */
  var rotZ=-10,tRotZ=-10;          /* plane roll, deg */
  var spinVel=0;                   /* fling momentum (rad/frame), decays */
  var ring=document.createElement('div');ring.className='orb-ring';avw.appendChild(ring);
  var cur=orbs.map(function(){return{x:0,y:0,s:1,o:1,init:false};});
  var returning=orbs.map(function(){return false;});
  var dragIdx=-1,dragX=0,dragY=0,lastAng=0;

  avw.addEventListener('pointerenter',function(){if(dragIdx<0)tSpeed=.12;});
  avw.addEventListener('pointerleave',function(){if(dragIdx<0)tSpeed=1;});
  if(fine){
    var hero=document.getElementById('home');
    hero.addEventListener('pointermove',function(e){
      tRotZ=-10+(e.clientX/innerWidth-.5)*30;
      tTilt=.38+(e.clientY/innerHeight-.5)*.22;
    });
    hero.addEventListener('pointerleave',function(){tRotZ=-10;tTilt=.38;});
  }
  /* gyroscope steering on touch devices (where no permission prompt is required) */
  if(matchMedia('(pointer:coarse)').matches&&window.DeviceOrientationEvent&&typeof DeviceOrientationEvent.requestPermission!=='function'){
    window.addEventListener('deviceorientation',function(e){
      if(e.gamma==null)return;
      tRotZ=-10+Math.max(-20,Math.min(20,e.gamma*.7));
      tTilt=.38+Math.max(-.16,Math.min(.16,((e.beta||45)-45)*.004));
    },{passive:true});
  }

  /* ── drag-to-pull + fling-to-spin (pointer = touch or mouse) ── */
  function center(){var r=avw.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};}
  function angDiff(a,b){var d=a-b;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return d;}
  avw.addEventListener('pointerdown',function(e){
    var orbEl=e.target.closest('.orb');if(!orbEl)return;
    dragIdx=orbs.indexOf(orbEl);if(dragIdx<0)return;
    var c=center();dragX=e.clientX-c.x;dragY=e.clientY-c.y;
    lastAng=Math.atan2(dragY,dragX);tSpeed=.12;
    try{avw.setPointerCapture(e.pointerId);}catch(_){}
    e.preventDefault();
  });
  avw.addEventListener('pointermove',function(e){
    if(dragIdx<0)return;
    var c=center();dragX=e.clientX-c.x;dragY=e.clientY-c.y;
    var ang=Math.atan2(dragY,dragX),dA=angDiff(ang,lastAng);lastAng=ang;
    spinVel=Math.max(-.18,Math.min(.18,spinVel+dA*.35));   /* circular drag spins the ring */
    e.preventDefault();
  });
  function endDrag(e){
    if(dragIdx<0)return;
    returning[dragIdx]=true;dragIdx=-1;tSpeed=1;
    try{avw.releasePointerCapture(e.pointerId);}catch(_){}
  }
  avw.addEventListener('pointerup',endDrag);
  avw.addEventListener('pointercancel',endDrag);

  var _orbR=avw.offsetWidth/2+(innerWidth<768?28:42);
  window.addEventListener('resize',function(){_orbR=avw.offsetWidth/2+(innerWidth<768?28:42);},{passive:true});
  function frame(){
    var R=_orbR;
    speed+=(tSpeed-speed)*.05;tilt+=(tTilt-tilt)*.06;rotZ+=(tRotZ-rotZ)*.06;
    var sv=Math.min(Math.abs(window.__scrollVel||0)*.02,1.6);window.__scrollVel=(window.__scrollVel||0)*.9;
    t+=.0042*(speed+sv)+spinVel; spinVel*=.92; if(Math.abs(spinVel)<.0003)spinVel=0;
    var rad=rotZ*Math.PI/180,cz=Math.cos(rad),sz=Math.sin(rad);
    for(var i=0;i<N;i++){
      var a=t+i*(Math.PI*2/N);
      var x=Math.cos(a)*R, z=Math.sin(a), y=z*R*tilt;
      var X=x*cz-y*sz, Y=x*sz+y*cz, d=(z+1)/2;
      var tx=X,ty=Y,ts=.74+.42*d,to=.42+.58*d,tz=(z>0?3:0);
      if(i===dragIdx){tx=dragX;ty=dragY;ts=1.4;to=1;tz=10;}
      var k=(i===dragIdx)?.4:(returning[i]?.16:1);
      var o=cur[i];
      if(!o.init){o.x=tx;o.y=ty;o.s=ts;o.o=to;o.init=true;}
      o.x+=(tx-o.x)*k;o.y+=(ty-o.y)*k;o.s+=(ts-o.s)*k;o.o+=(to-o.o)*k;
      if(returning[i]&&Math.abs(tx-o.x)<1.2&&Math.abs(ty-o.y)<1.2)returning[i]=false;
      var el=orbs[i];
      el.style.transform='translate('+o.x.toFixed(1)+'px,'+o.y.toFixed(1)+'px) scale('+o.s.toFixed(3)+')';
      el.style.opacity=o.o.toFixed(2);
      el.style.zIndex=(i===dragIdx)?10:tz;
    }
    ring.style.width=(R*2)+'px';
    ring.style.height=(R*2*tilt)+'px';
    ring.style.transform='translate(-50%,-50%) rotate('+rotZ.toFixed(1)+'deg)';
    orbRaf=orbOn?requestAnimationFrame(frame):0;
  }
  var orbOn=true,orbRaf=requestAnimationFrame(frame);
  new IntersectionObserver(function(en){orbOn=en[0].isIntersecting;if(orbOn&&!orbRaf)orbRaf=requestAnimationFrame(frame);}).observe(avw);
  document.addEventListener('visibilitychange',function(){orbOn=!document.hidden;if(orbOn&&!orbRaf)orbRaf=requestAnimationFrame(frame);});
})();

/* ════════════════ NEW INTERACTION LAYER ════════════════ */
(function(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function goTo(hash){ if(window.__jump)window.__jump(hash); }

  /* ── Boot intro dismiss (fail-safe: also auto-hides via CSS) ── */
  (function(){
    var boot=document.getElementById('boot'); if(!boot)return;
    function kill(){boot.classList.add('gone');setTimeout(function(){if(boot&&boot.parentNode)boot.parentNode.removeChild(boot);},600);}
    if(reduce){kill();return;}
    var t=setTimeout(kill,2400);
    boot.addEventListener('click',function(){clearTimeout(t);kill();});
  })();

  /* ── Side rail active sync ── */
  (function(){
    var rail=document.getElementById('srail'); if(!rail)return;
    var dots=[].slice.call(rail.querySelectorAll('a'));
    var secs=dots.map(function(d){return document.querySelector(d.getAttribute('href'));});
    var ticking=false;
    function upd(){
      var s=scrollY,active=0;
      for(var i=secs.length-1;i>=0;i--){ if(secs[i]&&secs[i].offsetTop-140<=s){active=i;break;} }
      dots.forEach(function(d,i){d.classList.toggle('act',i===active);});
      ticking=false;
    }
    addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(upd);}},{passive:true});
    addEventListener('load',upd); upd();
  })();

  /* ── Command palette ── */
  (function(){
    var modal=document.getElementById('cmdk'),input=document.getElementById('cmdkInput'),list=document.getElementById('cmdkList'),hint=document.getElementById('cmdkHint');
    if(!modal||!input||!list)return;
    var cmds=[
      {label:'Home',sub:'Top of page',icon:'fa-house',kw:'home top start',run:function(){goTo('#home');}},
      {label:'About',sub:'Background & stats',icon:'fa-user',kw:'about bio',run:function(){goTo('#about');}},
      {label:'Skills',sub:'Tech arsenal',icon:'fa-layer-group',kw:'skills tech stack',run:function(){goTo('#skills');}},
      {label:'Experience',sub:'Career timeline',icon:'fa-briefcase',kw:'experience work jobs career',run:function(){goTo('#experience');}},
      {label:'Education',sub:'Academic background',icon:'fa-graduation-cap',kw:'education degree school',run:function(){goTo('#education');}},
      {label:'Certifications',sub:'Licenses & certs',icon:'fa-certificate',kw:'certifications aws cisco',run:function(){goTo('#certifications');}},
      {label:'Projects',sub:'Featured work',icon:'fa-diagram-project',kw:'projects case study',run:function(){goTo('#projects');}},
      {label:'Toggle theme',sub:'Dark / light mode',icon:'fa-circle-half-stroke',kw:'theme dark light mode',run:function(){var b=document.getElementById('thm');if(b)b.click();}},
      {label:'Copy email',sub:SITE.email,icon:'fa-envelope',kw:'email copy contact',run:function(){if(navigator.clipboard)navigator.clipboard.writeText(SITE.email);}},
      {label:'Open GitHub',sub:SITE.githubLabel,icon:'fa-brands fa-github',kw:'github profile',run:function(){window.open(SITE.githubUrl,'_blank','noopener');}},
      {label:'Open LinkedIn',sub:SITE.linkedinLabel,icon:'fa-brands fa-linkedin',kw:'linkedin profile',run:function(){window.open(SITE.linkedinUrl,'_blank','noopener');}}
    ];
    var sel=0,view=cmds.slice();
    function render(){
      list.innerHTML='';
      if(!view.length){list.innerHTML='<div class="cmdk-empty">No matching commands</div>';return;}
      view.forEach(function(c,i){
        var fa=c.icon.indexOf('fa-brands')===0?c.icon:'fa-solid '+c.icon;
        var d=document.createElement('div');
        d.className='cmdk-item'+(i===sel?' sel':'');
        d.innerHTML='<span class="ci-ic">'+ico(fa)+'</span><span><div>'+c.label+'</div><div class="ci-sub">'+c.sub+'</div></span>';
        d.addEventListener('click',function(){fire(c);});
        d.addEventListener('mousemove',function(){if(sel!==i){sel=i;mark();}});
        list.appendChild(d);
      });
    }
    function mark(){[].slice.call(list.children).forEach(function(ch,i){ch.classList.toggle('sel',i===sel);});}
    function filter(){
      var q=input.value.trim().toLowerCase();
      view=q?cmds.filter(function(c){return (c.label+' '+c.sub+' '+c.kw).toLowerCase().indexOf(q)>-1;}):cmds.slice();
      sel=0;render();
    }
    function open(){modal.classList.add('open');document.body.classList.add('modal-open');input.value='';view=cmds.slice();sel=0;render();setTimeout(function(){input.focus();},40);}
    function close(){modal.classList.remove('open');document.body.classList.remove('modal-open');}
    function fire(c){close();setTimeout(function(){c.run();},120);}
    if(hint)hint.addEventListener('click',open);
    input.addEventListener('input',filter);
    modal.addEventListener('mousedown',function(e){if(e.target===modal)close();});
    document.addEventListener('keydown',function(e){
      if((e.metaKey||e.ctrlKey)&&(e.key==='k'||e.key==='K')){e.preventDefault();modal.classList.contains('open')?close():open();return;}
      if(!modal.classList.contains('open'))return;
      if(e.key==='Escape'){e.preventDefault();close();}
      else if(e.key==='ArrowDown'){e.preventDefault();if(view.length){sel=(sel+1)%view.length;mark();list.children[sel].scrollIntoView({block:'nearest'});}}
      else if(e.key==='ArrowUp'){e.preventDefault();if(view.length){sel=(sel-1+view.length)%view.length;mark();list.children[sel].scrollIntoView({block:'nearest'});}}
      else if(e.key==='Enter'){e.preventDefault();if(view[sel])fire(view[sel]);}
    });
  })();

  /* ── Live Ops dashboard: counters + sparklines ── */
  (function(){
    var dash=document.getElementById('dash'); if(!dash)return;
    var sparks=[].slice.call(dash.querySelectorAll('[data-spark]'));
    sparks.forEach(function(sp){sp.innerHTML='';for(var i=0;i<14;i++){var b=document.createElement('i');b.style.height=(30+Math.random()*70)+'%';sp.appendChild(b);}});
    var animated=false,timer=null;
    function countUp(el){
      var target=parseFloat(el.getAttribute('data-count')),suf=el.getAttribute('data-suffix')||'',dec=target%1!==0,t0=null,dur=1200;
      function step(t){if(!t0)t0=t;var p=Math.min((t-t0)/dur,1);p=1-Math.pow(1-p,3);var v=target*p;el.textContent=(dec?v.toFixed(1):Math.round(v))+suf;if(p<1)requestAnimationFrame(step);}
      requestAnimationFrame(step);
    }
    function liveTick(){ if(reduce)return; sparks.forEach(function(sp){var bars=sp.children;for(var i=0;i<bars.length-1;i++)bars[i].style.height=bars[i+1].style.height;bars[bars.length-1].style.height=(30+Math.random()*70)+'%';}); }
    var io=new IntersectionObserver(function(es){
      es.forEach(function(en){
        if(en.isIntersecting&&!animated){animated=true;dash.querySelectorAll('[data-count]').forEach(countUp);}
        if(en.isIntersecting){if(!timer&&!reduce)timer=setInterval(liveTick,1600);}
        else{if(timer){clearInterval(timer);timer=null;}}
      });
    },{threshold:.3});
    dash.querySelectorAll('[data-count]').forEach(function(e){e.textContent='0';});   /* HTML holds the real value for no-JS readers */
    io.observe(dash);
  })();

  /* ── Skills: category filter + core highlight ── */
  (function(){
    var section=document.getElementById('skills'); if(!section)return;
    var cats=[].slice.call(section.querySelectorAll('.scat'));
    if(!cats.length)return;
    var wrap=document.createElement('div');wrap.className='sk-filters';
    var labels=['All'].concat(cats.map(function(c){var h=c.querySelector('.scat-hd span');return h?h.textContent.trim():'';}));
    labels.forEach(function(lbl,i){
      var b=document.createElement('button');b.className='skf'+(i===0?' act':'');b.type='button';b.textContent=lbl;
      b.addEventListener('click',function(){
        wrap.querySelectorAll('.skf').forEach(function(x){x.classList.remove('act');});b.classList.add('act');
        cats.forEach(function(c,ci){c.classList.toggle('hide',i!==0&&ci!==i-1);});
      });
      wrap.appendChild(b);
    });
    var skats=section.querySelector('.skats');
    if(skats)skats.parentNode.insertBefore(wrap,skats);
    /* core skills and their % come from "core_percent" in _data/skills.yml (rendered as data-prof) */
    var prof={};
    section.querySelectorAll('.skc[data-prof]').forEach(function(c){var s=c.querySelector('span');if(s)prof[s.textContent.trim().toLowerCase()]=c.getAttribute('data-prof');});
    section.querySelectorAll('.skc').forEach(function(chip){
      var span=chip.querySelector('span'),name=span?span.textContent.trim().toLowerCase():'';
      if(prof[name]!=null){
        chip.classList.add('core');
        chip.setAttribute('data-prof',prof[name]);
        chip.title='Proficiency '+prof[name]+'% · core stack';
        chip.setAttribute('role','button');chip.setAttribute('tabindex','0');
        chip.setAttribute('aria-label',name+' — proficiency '+prof[name]+'%, core stack');
        chip.addEventListener('click',function(){chip.classList.toggle('show');});
        chip.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();chip.classList.toggle('show');}});
      }
    });
  })();

  /* ── Experience: tech filter + metric chips + collapse ── */
  (function(){
    var section=document.getElementById('experience'); if(!section)return;
    var roles=[].slice.call(section.querySelectorAll('.tli'));
    if(!roles.length)return;
    roles.forEach(function(tli,idx){
      var card=tli.querySelector('.tlic'); if(!card)return;
      var co=(tli.querySelector('.tli-co')||{textContent:''}).textContent.toLowerCase();
      var desc=card.querySelector('.tli-desc');
      var tags=card.querySelector('.tags');
      /* metric chips are rendered from the "highlights" of each job in _data/experience.yml */
      /* wrap bullets for collapse */
      if(desc){
        var body=document.createElement('div');body.className='exp-body';
        desc.parentNode.insertBefore(body,desc);body.appendChild(desc);
        var btn=document.createElement('button');btn.className='exp-toggle';btn.type='button';
        btn.innerHTML='View details '+ico('fa-solid fa-chevron-down');
        (tags||body).parentNode.insertBefore(btn,(tags||body).nextSibling);
        function setH(){ body.style.maxHeight=tli.classList.contains('exp-open')?body.scrollHeight+'px':''; }
        setH();
        btn.addEventListener('click',function(e){
          e.stopPropagation();
          tli.classList.toggle('exp-open');
          var o=tli.classList.contains('exp-open');
          btn.firstChild.textContent=(o?'Hide details':'View details')+' ';
          setH();
        });
        addEventListener('resize',function(){if(tli.classList.contains('exp-open'))body.style.maxHeight=body.scrollHeight+'px';});
      }
    });
    /* Double-tap to expand / collapse on touch devices */
    if(matchMedia('(pointer:coarse)').matches){
      var dtLast={};
      roles.forEach(function(tli,idx){
        var card=tli.querySelector('.tlic');if(!card)return;
        card.addEventListener('touchend',function(e){
          if(e.changedTouches.length>1)return;
          var now=Date.now();
          if(now-(dtLast[idx]||0)<350){
            e.preventDefault();
            var btn=tli.querySelector('.exp-toggle');if(btn)btn.click();
          }
          dtLast[idx]=now;
        },{passive:false});
      });
    }
    /* Double-click to expand / collapse on desktop (fine-pointer) */
    if(matchMedia('(pointer:fine)').matches){
      roles.forEach(function(tli){
        var card=tli.querySelector('.tlic');if(!card)return;
        card.addEventListener('dblclick',function(){
          var btn=tli.querySelector('.exp-toggle');if(btn)btn.click();
        });
      });
    }

    /* tech filter */
    var techs=SITE.experienceFilters||[];   /* from filter_buttons in _data/experience.yml */
    var roleTech=roles.map(function(tli){return [].slice.call(tli.querySelectorAll('.tag')).map(function(t){return t.textContent.toLowerCase();}).join(' ');});
    var present=techs.filter(function(t){var k=t.toLowerCase();return roleTech.some(function(rt){return rt.indexOf(k)>-1;});});
    var bar=document.createElement('div');bar.className='exp-filters';
    ['All'].concat(present).forEach(function(t,i){
      var b=document.createElement('button');b.className='expf'+(i===0?' act':'');b.type='button';b.textContent=t;
      b.addEventListener('click',function(){
        bar.querySelectorAll('.expf').forEach(function(x){x.classList.remove('act');});b.classList.add('act');
        var k=t.toLowerCase();
        roles.forEach(function(tli,ri){ tli.classList.toggle('dim', i!==0 && roleTech[ri].indexOf(k)===-1 ); });
      });
      bar.appendChild(b);
    });
    var tl=section.querySelector('.tl');
    if(tl)tl.parentNode.insertBefore(bar,tl);
  })();

  /* ── Projects: inline expand / collapse case studies ── */
  (function(){
    var cards=[].slice.call(document.querySelectorAll('.proj-card')); if(!cards.length)return;
    /* Case-study text comes from the case_study block of each project in _data/projects.yml */
    var details=SITE.caseStudies||[];
    cards.forEach(function(card,i){
      var d=details[i]; if(!d)return;
      var detail=document.createElement('div');
      detail.className='proj-detail';
      detail.id='projd'+i;
      detail.innerHTML=
        '<div class="pm-metrics">'+(d.metrics||[]).map(function(m){return '<div class="pm-metric"><b>'+m[0]+'</b><span>'+m[1]+'</span></div>';}).join('')+'</div>'+
        '<div class="pm-sec"><h3>'+ico('fa-solid fa-triangle-exclamation')+' The Challenge</h3><p>'+d.challenge+'</p></div>'+
        '<div class="pm-sec"><h3>'+ico('fa-solid fa-screwdriver-wrench')+' Approach</h3><p>'+d.approach+'</p></div>'+
        '<div class="pm-sec" style="margin-bottom:0"><h3>'+ico('fa-solid fa-chart-line')+' Impact</h3><p>'+d.impact+'</p></div>';
      var tags=card.querySelector('.tags');
      if(tags)card.insertBefore(detail,tags); else card.appendChild(detail);
      var btn=document.createElement('button');
      btn.className='proj-toggle';btn.type='button';
      btn.setAttribute('aria-expanded','false');btn.setAttribute('aria-controls',detail.id);
      btn.innerHTML='View case study '+ico('fa-solid fa-chevron-down');
      card.appendChild(btn);
      function setH(){ detail.style.maxHeight=card.classList.contains('open')?detail.scrollHeight+'px':'0px'; }
      btn.addEventListener('click',function(){
        var o=!card.classList.contains('open');
        card.classList.toggle('open',o);
        btn.setAttribute('aria-expanded',o?'true':'false');
        btn.firstChild.textContent=(o?'Hide case study':'View case study')+' ';
        setH();
      });
      addEventListener('resize',function(){if(card.classList.contains('open'))detail.style.maxHeight=detail.scrollHeight+'px';});
    });
  })();
})();
