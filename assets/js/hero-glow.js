(function(){
  var cv=document.getElementById('glfx');
  if(!cv)return;
  var motion=matchMedia('(prefers-reduced-motion: no-preference)').matches;
  var bigEnough=matchMedia('(min-width:1025px)').matches;
  var fine=matchMedia('(pointer:fine)').matches;
  if(!(motion&&bigEnough&&fine))return;

  var gl;
  try{gl=cv.getContext('webgl',{antialias:false,alpha:false,powerPreference:'high-performance'})||cv.getContext('experimental-webgl');}catch(e){}
  if(!gl)return;

  var VS='attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}';
  var FS=[
  'precision highp float;',
  'uniform vec2 u_res;uniform float u_time;uniform vec2 u_mouse;uniform float u_scroll;uniform float u_dark;',
  'float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}',
  'float noise(vec2 p){vec2 i=floor(p),f=fract(p);float a=hash(i),b=hash(i+vec2(1.,0.)),c=hash(i+vec2(0.,1.)),d=hash(i+vec2(1.,1.));vec2 u=f*f*(3.-2.*f);return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);}',
  'float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.02;a*=.5;}return v;}',
  'void main(){',
  '  vec2 uv=gl_FragCoord.xy/u_res.xy;',
  '  vec2 p=(gl_FragCoord.xy-.5*u_res.xy)/u_res.y;',
  '  float t=u_time*.045;',
  '  vec2 m=(u_mouse-.5)*.6;',
  '  vec2 q=vec2(fbm(p*1.8+t),fbm(p*1.8-t+5.2));',
  '  vec2 r=vec2(fbm(p*1.8+q*1.6+t*1.2+m),fbm(p*1.8+q*1.6-t-m));',
  '  float f=fbm(p*1.8+r*1.9);',
  '  vec3 base=mix(vec3(0.91,0.92,0.94),vec3(0.036,0.036,0.056),u_dark);',
  '  float gs=mix(0.50,1.0,u_dark);',
  '  vec3 col=mix(base,vec3(1.0,0.42,0.06),smoothstep(mix(.42,.28,u_dark),.95,f)*gs);',
  '  col=mix(col,vec3(1.0,0.62,0.22),pow(max(f,0.),3.0)*.72*gs);',
  '  vec2 g=fract(p*7.0+vec2(t*2.2+u_scroll*4.0,r.y+u_scroll*2.0));',
  '  float grid=smoothstep(.94,1.,max(g.x,g.y))*0.045*gs;',
  '  col+=vec3(1.,.55,.2)*grid;',
  '  float vig=smoothstep(1.4,.1,length(p));',
  '  col=mix(base,col,vig);',
  '  gl_FragColor=vec4(col,1.0);',
  '}'].join('\n');

  function sh(type,src){var s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){console.warn('glfx',gl.getShaderInfoLog(s));return null;}return s;}
  var vs=sh(gl.VERTEX_SHADER,VS),fs=sh(gl.FRAGMENT_SHADER,FS);
  if(!vs||!fs)return;
  var prog=gl.createProgram();gl.attachShader(prog,vs);gl.attachShader(prog,fs);gl.linkProgram(prog);
  if(!gl.getProgramParameter(prog,gl.LINK_STATUS))return;
  gl.useProgram(prog);
  var buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  var loc=gl.getAttribLocation(prog,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  var uRes=gl.getUniformLocation(prog,'u_res'),uTime=gl.getUniformLocation(prog,'u_time'),
      uMouse=gl.getUniformLocation(prog,'u_mouse'),uScroll=gl.getUniformLocation(prog,'u_scroll'),
      uDark=gl.getUniformLocation(prog,'u_dark');
  var dark=document.documentElement.getAttribute('data-theme')!=='light';
  new MutationObserver(function(){dark=document.documentElement.getAttribute('data-theme')!=='light';})
    .observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});

  var DPR=Math.min(devicePixelRatio||1,1.5),W=0,H=0;
  function resize(){W=Math.round(innerWidth*DPR);H=Math.round(innerHeight*DPR);cv.width=W;cv.height=H;gl.viewport(0,0,W,H);}
  resize();addEventListener('resize',resize,{passive:true});

  var mx=0.5,my=0.5,tmx=0.5,tmy=0.5;
  document.addEventListener('pointermove',function(e){tmx=e.clientX/innerWidth;tmy=1.0-e.clientY/innerHeight;},{passive:true});

  var running=true,t0=performance.now();
  document.addEventListener('visibilitychange',function(){running=!document.hidden;if(running)loop();});

  function loop(){
    if(!running)return;
    mx+=(tmx-mx)*.06;my+=(tmy-my)*.06;
    var pageH=document.body.scrollHeight-innerHeight;
    var sc=pageH>0?Math.min(Math.max(scrollY/pageH,0),1):0;
    gl.uniform2f(uRes,W,H);
    gl.uniform1f(uTime,(performance.now()-t0)*0.001);
    gl.uniform2f(uMouse,mx,my);
    gl.uniform1f(uScroll,sc);
    gl.uniform1f(uDark,dark?1.0:0.0);
    gl.drawArrays(gl.TRIANGLES,0,3);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(function(){cv.classList.add('on');loop();});
})();
