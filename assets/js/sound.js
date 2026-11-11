(function(){
  var btn=document.getElementById('snd'); if(!btn)return;
  var on=localStorage.getItem('hk-sound')!=='off';   /* default ON */
  var ac=null;
  function icon(){btn.innerHTML='<i class="fa-solid '+(on?'fa-volume-high':'fa-volume-xmark')+'"></i>';}
  icon();
  function ensure(){try{if(!ac)ac=new (window.AudioContext||window.webkitAudioContext)();}catch(e){return null;}if(ac.state==='suspended')ac.resume();return ac;}
  function blip(freq,dur,vol,type){if(!on)return;var c=ensure();if(!c)return;
    var o=c.createOscillator(),g=c.createGain();o.type=type||'sine';o.frequency.value=freq;
    g.gain.setValueAtTime(0,c.currentTime);g.gain.linearRampToValueAtTime(vol,c.currentTime+0.008);
    g.gain.exponentialRampToValueAtTime(0.0001,c.currentTime+dur);
    o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+dur+0.02);}
  function whoosh(){if(!on)return;var c=ensure();if(!c)return;
    var len=Math.floor(c.sampleRate*0.4),b=c.createBuffer(1,len,c.sampleRate),d=b.getChannelData(0);
    for(var i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2);
    var s=c.createBufferSource();s.buffer=b;
    var f=c.createBiquadFilter();f.type='bandpass';f.frequency.setValueAtTime(320,c.currentTime);
    f.frequency.exponentialRampToValueAtTime(2400,c.currentTime+0.34);f.Q.value=0.8;
    var g=c.createGain();g.gain.setValueAtTime(0.0001,c.currentTime);g.gain.linearRampToValueAtTime(0.11,c.currentTime+0.05);
    g.gain.exponentialRampToValueAtTime(0.0001,c.currentTime+0.38);
    s.connect(f);f.connect(g);g.connect(c.destination);s.start();s.stop(c.currentTime+0.4);}
  window.__snd={click:function(){blip(440,0.12,0.05,'triangle');},hover:function(){blip(900,0.045,0.02,'sine');},whoosh:whoosh,enabled:function(){return on;}};
  btn.addEventListener('click',function(){on=!on;localStorage.setItem('hk-sound',on?'on':'off');icon();if(on){ensure();blip(660,0.1,0.06,'triangle');}});
  var lastH=0;
  document.addEventListener('pointerover',function(e){if(!on)return;var t=e.target.closest&&e.target.closest('a,button,.orb,.skc,.proj-card,.skf,.expf,[role=button]');if(t&&Date.now()-lastH>70){lastH=Date.now();window.__snd.hover();}});
  document.addEventListener('click',function(e){if(!on)return;var t=e.target.closest&&e.target.closest('a,button,[role=button],.skc');if(t&&t.id!=='snd')window.__snd.click();},true);
})();
