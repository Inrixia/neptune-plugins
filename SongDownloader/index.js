var P=(c=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(c,{get:(r,m)=>(typeof require<"u"?require:r)[m]}):c)(function(c){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+c+'" is not supported')});var N={};(function c(r,m,s,h){var y=!!(r.Worker&&r.Blob&&r.Promise&&r.OffscreenCanvas&&r.OffscreenCanvasRenderingContext2D&&r.HTMLCanvasElement&&r.HTMLCanvasElement.prototype.transferControlToOffscreen&&r.URL&&r.URL.createObjectURL);function v(){}function S(t){var e=m.exports.Promise,i=e!==void 0?e:r.Promise;return typeof i=="function"?new i(t):(t(v,v),null)}var x=function(){var t=Math.floor(16.666666666666668),e,i,n={},d=0;return typeof requestAnimationFrame=="function"&&typeof cancelAnimationFrame=="function"?(e=function(l){var o=Math.random();return n[o]=requestAnimationFrame(function a(p){d===p||d+t-1<p?(d=p,delete n[o],l()):n[o]=requestAnimationFrame(a)}),o},i=function(l){n[l]&&cancelAnimationFrame(n[l])}):(e=function(l){return setTimeout(l,t)},i=function(l){return clearTimeout(l)}),{frame:e,cancel:i}}(),re=function(){var t,e,i={};function n(d){function l(o,a){d.postMessage({options:o||{},callback:a})}d.init=function(a){var p=a.transferControlToOffscreen();d.postMessage({canvas:p},[p])},d.fire=function(a,p,M){if(e)return l(a,null),e;var u=Math.random().toString(36).slice(2);return e=S(function(w){function b(f){f.data.callback===u&&(delete i[u],d.removeEventListener("message",b),e=null,M(),w())}d.addEventListener("message",b),l(a,u),i[u]=b.bind(null,{data:{callback:u}})}),e},d.reset=function(){d.postMessage({reset:!0});for(var a in i)i[a](),delete i[a]}}return function(){if(t)return t;if(!s&&y){var d=["var CONFETTI, SIZE = {}, module = {};","("+c.toString()+")(this, module, true, SIZE);","onmessage = function(msg) {","  if (msg.data.options) {","    CONFETTI(msg.data.options).then(function () {","      if (msg.data.callback) {","        postMessage({ callback: msg.data.callback });","      }","    });","  } else if (msg.data.reset) {","    CONFETTI && CONFETTI.reset();","  } else if (msg.data.resize) {","    SIZE.width = msg.data.resize.width;","    SIZE.height = msg.data.resize.height;","  } else if (msg.data.canvas) {","    SIZE.width = msg.data.canvas.width;","    SIZE.height = msg.data.canvas.height;","    CONFETTI = module.exports.create(msg.data.canvas);","  }","}"].join(`
`);try{t=new Worker(URL.createObjectURL(new Blob([d])))}catch(l){return typeof console!==void 0&&typeof console.warn=="function"&&console.warn("\u{1F38A} Could not load worker",l),null}n(t)}return t}}(),ne={particleCount:50,angle:90,spread:45,startVelocity:45,decay:.9,gravity:1,drift:0,ticks:200,x:.5,y:.5,shapes:["square","circle"],zIndex:100,colors:["#26ccff","#a25afd","#ff5e7e","#88ff5a","#fcff42","#ffa62d","#ff36ff"],disableForReducedMotion:!1,scalar:1};function oe(t,e){return e?e(t):t}function ae(t){return t!=null}function g(t,e,i){return oe(t&&ae(t[e])?t[e]:ne[e],i)}function ie(t){return t<0?0:Math.floor(t)}function se(t,e){return Math.floor(Math.random()*(e-t))+t}function F(t){return parseInt(t,16)}function ce(t){return t.map(le)}function le(t){var e=String(t).replace(/[^0-9a-f]/gi,"");return e.length<6&&(e=e[0]+e[0]+e[1]+e[1]+e[2]+e[2]),{r:F(e.substring(0,2)),g:F(e.substring(2,4)),b:F(e.substring(4,6))}}function de(t){var e=g(t,"origin",Object);return e.x=g(e,"x",Number),e.y=g(e,"y",Number),e}function ue(t){t.width=document.documentElement.clientWidth,t.height=document.documentElement.clientHeight}function fe(t){var e=t.getBoundingClientRect();t.width=e.width,t.height=e.height}function me(t){var e=document.createElement("canvas");return e.style.position="fixed",e.style.top="0px",e.style.left="0px",e.style.pointerEvents="none",e.style.zIndex=t,e}function he(t,e,i,n,d,l,o,a,p){t.save(),t.translate(e,i),t.rotate(l),t.scale(n,d),t.arc(0,0,1,o,a,p),t.restore()}function pe(t){var e=t.angle*(Math.PI/180),i=t.spread*(Math.PI/180);return{x:t.x,y:t.y,wobble:Math.random()*10,wobbleSpeed:Math.min(.11,Math.random()*.1+.05),velocity:t.startVelocity*.5+Math.random()*t.startVelocity,angle2D:-e+(.5*i-Math.random()*i),tiltAngle:(Math.random()*(.75-.25)+.25)*Math.PI,color:t.color,shape:t.shape,tick:0,totalTicks:t.ticks,decay:t.decay,drift:t.drift,random:Math.random()+2,tiltSin:0,tiltCos:0,wobbleX:0,wobbleY:0,gravity:t.gravity*3,ovalScalar:.6,scalar:t.scalar}}function ge(t,e){e.x+=Math.cos(e.angle2D)*e.velocity+e.drift,e.y+=Math.sin(e.angle2D)*e.velocity+e.gravity,e.wobble+=e.wobbleSpeed,e.velocity*=e.decay,e.tiltAngle+=.1,e.tiltSin=Math.sin(e.tiltAngle),e.tiltCos=Math.cos(e.tiltAngle),e.random=Math.random()+2,e.wobbleX=e.x+10*e.scalar*Math.cos(e.wobble),e.wobbleY=e.y+10*e.scalar*Math.sin(e.wobble);var i=e.tick++/e.totalTicks,n=e.x+e.random*e.tiltCos,d=e.y+e.random*e.tiltSin,l=e.wobbleX+e.random*e.tiltCos,o=e.wobbleY+e.random*e.tiltSin;if(t.fillStyle="rgba("+e.color.r+", "+e.color.g+", "+e.color.b+", "+(1-i)+")",t.beginPath(),e.shape==="circle")t.ellipse?t.ellipse(e.x,e.y,Math.abs(l-n)*e.ovalScalar,Math.abs(o-d)*e.ovalScalar,Math.PI/10*e.wobble,0,2*Math.PI):he(t,e.x,e.y,Math.abs(l-n)*e.ovalScalar,Math.abs(o-d)*e.ovalScalar,Math.PI/10*e.wobble,0,2*Math.PI);else if(e.shape==="star")for(var a=Math.PI/2*3,p=4*e.scalar,M=8*e.scalar,u=e.x,w=e.y,b=5,f=Math.PI/b;b--;)u=e.x+Math.cos(a)*M,w=e.y+Math.sin(a)*M,t.lineTo(u,w),a+=f,u=e.x+Math.cos(a)*p,w=e.y+Math.sin(a)*p,t.lineTo(u,w),a+=f;else t.moveTo(Math.floor(e.x),Math.floor(e.y)),t.lineTo(Math.floor(e.wobbleX),Math.floor(d)),t.lineTo(Math.floor(l),Math.floor(o)),t.lineTo(Math.floor(n),Math.floor(e.wobbleY));return t.closePath(),t.fill(),e.tick<e.totalTicks}function ye(t,e,i,n,d){var l=e.slice(),o=t.getContext("2d"),a,p,M=S(function(u){function w(){a=p=null,o.clearRect(0,0,n.width,n.height),d(),u()}function b(){s&&!(n.width===h.width&&n.height===h.height)&&(n.width=t.width=h.width,n.height=t.height=h.height),!n.width&&!n.height&&(i(t),n.width=t.width,n.height=t.height),o.clearRect(0,0,n.width,n.height),l=l.filter(function(f){return ge(o,f)}),l.length?a=x.frame(b):w()}a=x.frame(b),p=w});return{addFettis:function(u){return l=l.concat(u),M},canvas:t,promise:M,reset:function(){a&&x.cancel(a),p&&p()}}}function U(t,e){var i=!t,n=!!g(e||{},"resize"),d=g(e,"disableForReducedMotion",Boolean),l=y&&!!g(e||{},"useWorker"),o=l?re():null,a=i?ue:fe,p=t&&o?!!t.__confetti_initialized:!1,M=typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion)").matches,u;function w(f,O,A){for(var k=g(f,"particleCount",ie),L=g(f,"angle",Number),R=g(f,"spread",Number),I=g(f,"startVelocity",Number),ve=g(f,"decay",Number),be=g(f,"gravity",Number),we=g(f,"drift",Number),_=g(f,"colors",ce),Me=g(f,"ticks",Number),H=g(f,"shapes"),Se=g(f,"scalar"),j=de(f),z=k,B=[],xe=t.width*j.x,Ie=t.height*j.y;z--;)B.push(pe({x:xe,y:Ie,angle:L,spread:R,startVelocity:I,color:_[z%_.length],shape:H[se(0,H.length)],ticks:Me,decay:ve,gravity:be,drift:we,scalar:Se}));return u?u.addFettis(B):(u=ye(t,B,a,O,A),u.promise)}function b(f){var O=d||g(f,"disableForReducedMotion",Boolean),A=g(f,"zIndex",Number);if(O&&M)return S(function(I){I()});i&&u?t=u.canvas:i&&!t&&(t=me(A),document.body.appendChild(t)),n&&!p&&a(t);var k={width:t.width,height:t.height};o&&!p&&o.init(t),p=!0,o&&(t.__confetti_initialized=!0);function L(){if(o){var I={getBoundingClientRect:function(){if(!i)return t.getBoundingClientRect()}};a(I),o.postMessage({resize:{width:I.width,height:I.height}});return}k.width=k.height=null}function R(){u=null,n&&r.removeEventListener("resize",L),i&&t&&(document.body.removeChild(t),t=null,p=!1)}return n&&r.addEventListener("resize",L,!1),o?o.fire(f,k,R):w(f,k,R)}return b.reset=function(){o&&o.reset(),u&&u.reset()},b}var D;function $(){return D||(D=U(null,{useWorker:!0,resize:!0})),D}m.exports=function(){return $().apply(this,arguments)},m.exports.reset=function(){$().reset()},m.exports.create=U})(function(){return typeof window<"u"?window:typeof self<"u"?self:this||{}}(),N,!1);var W=N.exports,Ne=N.exports.create;import{getState as De}from"@neptune/store";import{intercept as Oe}from"@neptune";import{storage as Ae}from"@plugin";import{appendStyle as Ee}from"@neptune/utils";var K=Ee(`
.download-button {
	align-items: center;
	display: flex;
	font-weight: 500;
	padding: 14px 16px;
	width: 100%;
	flex-grow: 1;
	height: 1.72rem;
	color: #b878ff;
}
.download-button:hover {
	background-color: #9e46ff;
	color: #fff;
}

#qualityDropdown {
    padding: 10px;
    width: 200px;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    appearance: none;
    background-color: #2f2f2f;
    color: #ffffff;
    cursor: pointer;
}

#qualityDropdown:hover {
    border-color: #b0b0b0;
}

#qualityDropdown:focus {
    outline: none;
    border-color: #4f4f4f;
}

.settings-section {
    color: #ffffff;
    padding: 20px;
    background-color: rgb(24, 24, 27);
}

.settings-header {
    font-size: 1.2em;
    margin-bottom: 5px;
    font-weight: bold;
}

.settings-explainer {
    font-size: 0.9em;
    margin-bottom: 15px;
    opacity: 0.85;
}
`);import{html as Z}from"@neptune/voby";import{storage as Q}from"@plugin";var E={HiRes:"HI_RES_LOSSLESS",MQA:"HI_RES",High:"LOSSLESS"},T=Object.values(E),V=new Set(T),C=Object.fromEntries(Object.entries(E).map(([c,r])=>[r,c])),$e=Object.values(C),_e={LOSSLESS:E.High,HIRES_LOSSLESS:E.HiRes,MQA:E.MQA};Q.desiredDownloadQuality=E.HiRes;var ke=()=>Z`<div class="settings-section">
		<h3 class="settings-header">Download Quality</h3>
		<p class="settings-explainer">Select the desired max download quality:</p>
		<select id="qualityDropdown" onChange=${r=>Q.desiredDownloadQuality=r.target.value}>
			${T.map(r=>Z`<option value=${r} selected=${Q.desiredDownloadQuality===r}>${C[r]}</option>`)}
		</select>
	</div>`;var Te=P("crypto"),Ce="UIlTTEMmmLfGowo/UC60x2H45W6MdGgTRfo/umg4754=",X=async c=>{let r=Buffer.from(Ce,"base64"),m=Buffer.from(c,"base64"),s=m.slice(0,16),h=m.slice(16),v=Te.createDecipheriv("aes-256-cbc",r,s).update(h),S=v.slice(0,16),x=v.slice(16,24);return{key:S,nonce:x}};import{getState as Re}from"@neptune/store";var Le=P("https"),q=()=>{let c=Re();return{Authorization:`Bearer ${c.session.oAuthAccessToken}`,"x-tidal-token":c.session.apiToken}},Y=c=>new Promise((r,m)=>{let s=Le.request(c,{headers:q()},h=>{let y=[];h.on("data",v=>y.push(v)),h.on("end",()=>{let v=Buffer.concat(y);r(v)})});s.on("error",m),s.end()});var G=async(c,r)=>{if(!V.has(r))throw new Error(`Invalid audio quality: ${r}, should be one of ${T.join(", ")}`);if(c===void 0)throw new Error("trackId is required");let m=`https://desktop.tidal.com/v1/tracks/${c}/playbackinfopostpaywall/v4?audioquality=${r}&playbackmode=STREAM&assetpresentation=FULL`,s=await fetch(m,{headers:q()}).then(y=>y.json()),h=JSON.parse(atob(s.manifest));if(h.encryptionType!=="OLD_AES")throw new Error(`Unexpected manifest encryption type ${h.encryptionType}`);return s.manifest=h,s.cryptKey=await X(h.keyId),s};var Fe=P("crypto"),J=async(c,r,m)=>{let s=Buffer.concat([m,Buffer.alloc(8,0)]),h=new Fe.createDecipheriv("aes-128-ctr",r,s);return Buffer.concat([h.update(c),h.final()])};var ee=(c,r)=>{let m=URL.createObjectURL(c),s=document.createElement("a");s.href=m,s.download=r,s.click(),URL.revokeObjectURL(m)};var te=async(c,r,m)=>{let s=await G(c,m),{key:h,nonce:y}=s.cryptKey,v=s.manifest.urls[0],S=await Y(v),x=await J(S,h,y);ee(new Blob([x],{type:"application/octet-stream"}),`${r}.flac`)};W();var Be=Oe("contextMenu/OPEN_MEDIA_ITEM",([c])=>setTimeout(()=>{let r=De().content.mediaItems.get(c.id.toString())?.item;if(r===void 0)return;let m=document.querySelector('[data-type="list-container__context-menu"]'),s=document.createElement("button");s.type="button",s.role="menuitem",s.textContent="Download",s.className="download-button",m.appendChild(s);let h=r.artist??r.artists?.[0],y=h!==void 0?` by ${h.name}`:"",v=`${r.title}${y} [${C[r.audioQuality]}]`;s.addEventListener("click",()=>te(r.id,v,Ae.desiredDownloadQuality))})),pt=()=>{Be(),K()};export{ke as Settings,pt as onUnload};
