(function(){
  var w=document.getElementById('pgwipe'); if(!w)return;
  var lbl=w.querySelector('.pw-label'),busy=false;
  var names={home:'Home',about:'About',skills:'Skills',experience:'Experience',education:'Education',certifications:'Certifications',projects:'Projects',contact:'Contact'};
  function scrollNow(el){
    if(window.__lenis)window.__lenis.scrollTo(el,{offset:-96,immediate:true});
    else el.scrollIntoView({block:'start',behavior:'auto'});   /* respects html{scroll-padding-top:96px}; idempotent */
  }
  function reset(){document.body.classList.remove('nav-jumping');w.classList.add('notrans');w.classList.remove('cover','reveal');void w.offsetWidth;w.classList.remove('notrans');busy=false;}
  window.__wipeGo=function(hash){
    var el=document.querySelector(hash); if(!el)return false;
    var reduce=!matchMedia('(prefers-reduced-motion: no-preference)').matches;
    /* skip CSS wipe transition on software renderer — transitionend may not fire reliably */
    if(reduce||window.__noGPU){document.body.classList.add('nav-jumping');void document.body.offsetHeight;scrollNow(el);requestAnimationFrame(function(){document.body.classList.remove('nav-jumping');});return true;}
    if(busy)return true;
    busy=true;
    if(window.__snd)window.__snd.whoosh();
    lbl.textContent=names[hash.replace('#','')]||hash.replace('#','');
    w.classList.add('notrans');w.classList.remove('cover','reveal');
    void w.offsetWidth;                       /* snap to base (below screen), no transition */
    w.classList.remove('notrans');
    var safety=setTimeout(reset,3000);        /* never get stuck if a transitionend is missed */
    function onCover(e){
      if(e.target!==w||e.propertyName!=='transform')return;
      w.removeEventListener('transitionend',onCover);
      document.body.classList.add('nav-jumping');   /* force full layout so the target is exact */
      void document.body.offsetHeight;
      var n=0;
      (function converge(){                          /* re-scroll for a few frames while covered, until layout settles */
        scrollNow(el);
        if(++n<7){requestAnimationFrame(converge);}
        else{w.addEventListener('transitionend',onReveal);w.classList.remove('cover');w.classList.add('reveal');}
      })();
    }
    function onReveal(e){
      if(e.target!==w||e.propertyName!=='transform')return;
      w.removeEventListener('transitionend',onReveal);
      clearTimeout(safety);reset();
    }
    w.addEventListener('transitionend',onCover);
    requestAnimationFrame(function(){w.classList.add('cover');});
    return true;
  };
  /* Intercept in-page anchor clicks in capture phase so this owns the navigation
     (independent of Lenis) and no other handler double-scrolls. */
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a[href^="#"]'); if(!a)return;
    var h=a.getAttribute('href'); if(!h||h.length<2)return;
    if(!document.querySelector(h))return;
    e.preventDefault();e.stopImmediatePropagation();
    var nl=document.getElementById('nlinks'); if(nl)nl.classList.remove('open');
    window.__wipeGo(h);
  },true);
})();
