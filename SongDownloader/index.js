var P=(c=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(c,{get:(t,m)=>(typeof require<"u"?require:t)[m]}):c)(function(c){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+c+'" is not supported')});var N={};(function c(t,m,s,p){var v=!!(t.Worker&&t.Blob&&t.Promise&&t.OffscreenCanvas&&t.OffscreenCanvasRenderingContext2D&&t.HTMLCanvasElement&&t.HTMLCanvasElement.prototype.transferControlToOffscreen&&t.URL&&t.URL.createObjectURL);function b(){}function S(r){var e=m.exports.Promise,i=e!==void 0?e:t.Promise;return typeof i=="function"?new i(r):(r(b,b),null)}var x=function(){var r=Math.floor(16.666666666666668),e,i,n={},d=0;return typeof requestAnimationFrame=="function"&&typeof cancelAnimationFrame=="function"?(e=function(l){var o=Math.random();return n[o]=requestAnimationFrame(function a(h){d===h||d+r-1<h?(d=h,delete n[o],l()):n[o]=requestAnimationFrame(a)}),o},i=function(l){n[l]&&cancelAnimationFrame(n[l])}):(e=function(l){return setTimeout(l,r)},i=function(l){return clearTimeout(l)}),{frame:e,cancel:i}}(),te=function(){var r,e,i={};function n(d){function l(o,a){d.postMessage({options:o||{},callback:a})}d.init=function(a){var h=a.transferControlToOffscreen();d.postMessage({canvas:h},[h])},d.fire=function(a,h,M){if(e)return l(a,null),e;var u=Math.random().toString(36).slice(2);return e=S(function(w){function y(f){f.data.callback===u&&(delete i[u],d.removeEventListener("message",y),e=null,M(),w())}d.addEventListener("message",y),l(a,u),i[u]=y.bind(null,{data:{callback:u}})}),e},d.reset=function(){d.postMessage({reset:!0});for(var a in i)i[a](),delete i[a]}}return function(){if(r)return r;if(!s&&v){var d=["var CONFETTI, SIZE = {}, module = {};","("+c.toString()+")(this, module, true, SIZE);","onmessage = function(msg) {","  if (msg.data.options) {","    CONFETTI(msg.data.options).then(function () {","      if (msg.data.callback) {","        postMessage({ callback: msg.data.callback });","      }","    });","  } else if (msg.data.reset) {","    CONFETTI && CONFETTI.reset();","  } else if (msg.data.resize) {","    SIZE.width = msg.data.resize.width;","    SIZE.height = msg.data.resize.height;","  } else if (msg.data.canvas) {","    SIZE.width = msg.data.canvas.width;","    SIZE.height = msg.data.canvas.height;","    CONFETTI = module.exports.create(msg.data.canvas);","  }","}"].join(`
`);try{r=new Worker(URL.createObjectURL(new Blob([d])))}catch(l){return typeof console!==void 0&&typeof console.warn=="function"&&console.warn("\u{1F38A} Could not load worker",l),null}n(r)}return r}}(),ne={particleCount:50,angle:90,spread:45,startVelocity:45,decay:.9,gravity:1,drift:0,ticks:200,x:.5,y:.5,shapes:["square","circle"],zIndex:100,colors:["#26ccff","#a25afd","#ff5e7e","#88ff5a","#fcff42","#ffa62d","#ff36ff"],disableForReducedMotion:!1,scalar:1};function oe(r,e){return e?e(r):r}function ae(r){return r!=null}function g(r,e,i){return oe(r&&ae(r[e])?r[e]:ne[e],i)}function ie(r){return r<0?0:Math.floor(r)}function se(r,e){return Math.floor(Math.random()*(e-r))+r}function F(r){return parseInt(r,16)}function ce(r){return r.map(le)}function le(r){var e=String(r).replace(/[^0-9a-f]/gi,"");return e.length<6&&(e=e[0]+e[0]+e[1]+e[1]+e[2]+e[2]),{r:F(e.substring(0,2)),g:F(e.substring(2,4)),b:F(e.substring(4,6))}}function de(r){var e=g(r,"origin",Object);return e.x=g(e,"x",Number),e.y=g(e,"y",Number),e}function ue(r){r.width=document.documentElement.clientWidth,r.height=document.documentElement.clientHeight}function fe(r){var e=r.getBoundingClientRect();r.width=e.width,r.height=e.height}function me(r){var e=document.createElement("canvas");return e.style.position="fixed",e.style.top="0px",e.style.left="0px",e.style.pointerEvents="none",e.style.zIndex=r,e}function he(r,e,i,n,d,l,o,a,h){r.save(),r.translate(e,i),r.rotate(l),r.scale(n,d),r.arc(0,0,1,o,a,h),r.restore()}function pe(r){var e=r.angle*(Math.PI/180),i=r.spread*(Math.PI/180);return{x:r.x,y:r.y,wobble:Math.random()*10,wobbleSpeed:Math.min(.11,Math.random()*.1+.05),velocity:r.startVelocity*.5+Math.random()*r.startVelocity,angle2D:-e+(.5*i-Math.random()*i),tiltAngle:(Math.random()*(.75-.25)+.25)*Math.PI,color:r.color,shape:r.shape,tick:0,totalTicks:r.ticks,decay:r.decay,drift:r.drift,random:Math.random()+2,tiltSin:0,tiltCos:0,wobbleX:0,wobbleY:0,gravity:r.gravity*3,ovalScalar:.6,scalar:r.scalar}}function ge(r,e){e.x+=Math.cos(e.angle2D)*e.velocity+e.drift,e.y+=Math.sin(e.angle2D)*e.velocity+e.gravity,e.wobble+=e.wobbleSpeed,e.velocity*=e.decay,e.tiltAngle+=.1,e.tiltSin=Math.sin(e.tiltAngle),e.tiltCos=Math.cos(e.tiltAngle),e.random=Math.random()+2,e.wobbleX=e.x+10*e.scalar*Math.cos(e.wobble),e.wobbleY=e.y+10*e.scalar*Math.sin(e.wobble);var i=e.tick++/e.totalTicks,n=e.x+e.random*e.tiltCos,d=e.y+e.random*e.tiltSin,l=e.wobbleX+e.random*e.tiltCos,o=e.wobbleY+e.random*e.tiltSin;if(r.fillStyle="rgba("+e.color.r+", "+e.color.g+", "+e.color.b+", "+(1-i)+")",r.beginPath(),e.shape==="circle")r.ellipse?r.ellipse(e.x,e.y,Math.abs(l-n)*e.ovalScalar,Math.abs(o-d)*e.ovalScalar,Math.PI/10*e.wobble,0,2*Math.PI):he(r,e.x,e.y,Math.abs(l-n)*e.ovalScalar,Math.abs(o-d)*e.ovalScalar,Math.PI/10*e.wobble,0,2*Math.PI);else if(e.shape==="star")for(var a=Math.PI/2*3,h=4*e.scalar,M=8*e.scalar,u=e.x,w=e.y,y=5,f=Math.PI/y;y--;)u=e.x+Math.cos(a)*M,w=e.y+Math.sin(a)*M,r.lineTo(u,w),a+=f,u=e.x+Math.cos(a)*h,w=e.y+Math.sin(a)*h,r.lineTo(u,w),a+=f;else r.moveTo(Math.floor(e.x),Math.floor(e.y)),r.lineTo(Math.floor(e.wobbleX),Math.floor(d)),r.lineTo(Math.floor(l),Math.floor(o)),r.lineTo(Math.floor(n),Math.floor(e.wobbleY));return r.closePath(),r.fill(),e.tick<e.totalTicks}function ye(r,e,i,n,d){var l=e.slice(),o=r.getContext("2d"),a,h,M=S(function(u){function w(){a=h=null,o.clearRect(0,0,n.width,n.height),d(),u()}function y(){s&&!(n.width===p.width&&n.height===p.height)&&(n.width=r.width=p.width,n.height=r.height=p.height),!n.width&&!n.height&&(i(r),n.width=r.width,n.height=r.height),o.clearRect(0,0,n.width,n.height),l=l.filter(function(f){return ge(o,f)}),l.length?a=x.frame(y):w()}a=x.frame(y),h=w});return{addFettis:function(u){return l=l.concat(u),M},canvas:r,promise:M,reset:function(){a&&x.cancel(a),h&&h()}}}function U(r,e){var i=!r,n=!!g(e||{},"resize"),d=g(e,"disableForReducedMotion",Boolean),l=v&&!!g(e||{},"useWorker"),o=l?te():null,a=i?ue:fe,h=r&&o?!!r.__confetti_initialized:!1,M=typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion)").matches,u;function w(f,O,A){for(var k=g(f,"particleCount",ie),L=g(f,"angle",Number),R=g(f,"spread",Number),I=g(f,"startVelocity",Number),ve=g(f,"decay",Number),be=g(f,"gravity",Number),we=g(f,"drift",Number),$=g(f,"colors",ce),Me=g(f,"ticks",Number),H=g(f,"shapes"),Se=g(f,"scalar"),j=de(f),z=k,B=[],xe=r.width*j.x,Ie=r.height*j.y;z--;)B.push(pe({x:xe,y:Ie,angle:L,spread:R,startVelocity:I,color:$[z%$.length],shape:H[se(0,H.length)],ticks:Me,decay:ve,gravity:be,drift:we,scalar:Se}));return u?u.addFettis(B):(u=ye(r,B,a,O,A),u.promise)}function y(f){var O=d||g(f,"disableForReducedMotion",Boolean),A=g(f,"zIndex",Number);if(O&&M)return S(function(I){I()});i&&u?r=u.canvas:i&&!r&&(r=me(A),document.body.appendChild(r)),n&&!h&&a(r);var k={width:r.width,height:r.height};o&&!h&&o.init(r),h=!0,o&&(r.__confetti_initialized=!0);function L(){if(o){var I={getBoundingClientRect:function(){if(!i)return r.getBoundingClientRect()}};a(I),o.postMessage({resize:{width:I.width,height:I.height}});return}k.width=k.height=null}function R(){u=null,n&&t.removeEventListener("resize",L),i&&r&&(document.body.removeChild(r),r=null,h=!1)}return n&&t.addEventListener("resize",L,!1),o?o.fire(f,k,R):w(f,k,R)}return y.reset=function(){o&&o.reset(),u&&u.reset()},y}var D;function _(){return D||(D=U(null,{useWorker:!0,resize:!0})),D}m.exports=function(){return _().apply(this,arguments)},m.exports.reset=function(){_().reset()},m.exports.create=U})(function(){return typeof window<"u"?window:typeof self<"u"?self:this||{}}(),N,!1);var W=N.exports,Ne=N.exports.create;import{getState as De}from"@neptune/store";import{intercept as Oe}from"@neptune";import{storage as Ae}from"@plugin";import{appendStyle as Ee}from"@neptune/utils";var K=Ee(`
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
`);import{html as Z}from"@neptune/voby";import{storage as Q}from"@plugin";var E={HiRes:"HI_RES_LOSSLESS",MQA:"HI_RES",High:"LOSSLESS"},T=Object.values(E),V=new Set(T),C=Object.fromEntries(Object.entries(E).map(([c,t])=>[t,c])),_e=Object.values(C),$e={LOSSLESS:E.High,HIRES_LOSSLESS:E.HiRes,MQA:E.MQA};Q.desiredDownloadQuality=E.HiRes;var ke=()=>Z`<div class="settings-section">
		<h3 class="settings-header">Download Quality</h3>
		<p class="settings-explainer">Select the desired max download quality:</p>
		<select id="qualityDropdown" onChange=${t=>Q.desiredDownloadQuality=t.target.value}>
			${T.map(t=>Z`<option value=${t} selected=${Q.desiredDownloadQuality===t}>${C[t]}</option>`)}
		</select>
	</div>`;var Te=P("crypto"),Ce="UIlTTEMmmLfGowo/UC60x2H45W6MdGgTRfo/umg4754=",X=async c=>{let t=Buffer.from(Ce,"base64"),m=Buffer.from(c,"base64"),s=m.slice(0,16),p=m.slice(16),b=Te.createDecipheriv("aes-256-cbc",t,s).update(p),S=b.slice(0,16),x=b.slice(16,24);return{key:S,nonce:x}};import{getState as Re}from"@neptune/store";var Le=P("https"),q=()=>{let c=Re();return{Authorization:`Bearer ${c.session.oAuthAccessToken}`,"x-tidal-token":c.session.apiToken}},Y=c=>new Promise((t,m)=>{let s=Le.request(c,{headers:q()},p=>{let v=[];p.on("data",b=>v.push(b)),p.on("end",()=>{let b=Buffer.concat(v);t(b)})});s.on("error",m),s.end()});var G=async(c,t)=>{if(!V.has(t))throw new Error(`Invalid audio quality: ${t}, should be one of ${T.join(", ")}`);if(c===void 0)throw new Error("trackId is required");let m=`https://desktop.tidal.com/v1/tracks/${c}/playbackinfopostpaywall/v4?audioquality=${t}&playbackmode=STREAM&assetpresentation=FULL`,s=await fetch(m,{headers:q()}).then(v=>v.json()),p=JSON.parse(atob(s.manifest));if(p.encryptionType!=="OLD_AES")throw new Error(`Unexpected manifest encryption type ${p.encryptionType}`);return s.manifest=p,s.cryptKey=await X(p.keyId),s};var Fe=P("crypto"),J=async(c,t,m)=>{let s=Buffer.concat([m,Buffer.alloc(8,0)]),p=new Fe.createDecipheriv("aes-128-ctr",t,s);return Buffer.concat([p.update(c),p.final()])};var ee=(c,t)=>{let m=URL.createObjectURL(c),s=document.createElement("a");s.href=m,s.download=t,s.click(),URL.revokeObjectURL(m)};var re=async(c,t,m)=>{let s=await G(c,m),{key:p,nonce:v}=s.cryptKey,b=s.manifest.urls[0],S=await Y(b),x=await J(S,p,v);ee(new Blob([x],{type:"application/octet-stream"}),`${t}.flac`)};W();var Be=Oe("contextMenu/OPEN_MEDIA_ITEM",([c])=>setTimeout(()=>{let t=De().content.mediaItems.get(c.id.toString())?.item;if(t===void 0)return;console.log(t);let m=document.querySelector('[data-type="list-container__context-menu"]'),s=document.createElement("button");s.type="button",s.role="menuitem",s.textContent="Download",s.className="download-button",m.appendChild(s);let p=`${t.title} by ${t.artist.name} [${C[t.audioQuality]}]`;s.addEventListener("click",()=>re(t.id,p,Ae.desiredDownloadQuality))})),pr=()=>{Be(),K()};export{ke as Settings,pr as onUnload};
