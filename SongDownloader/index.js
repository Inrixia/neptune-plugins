var $=(n=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(n,{get:(r,u)=>(typeof require<"u"?require:r)[u]}):n)(function(n){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+n+'" is not supported')});var N={};(function n(r,u,o,c){var y=!!(r.Worker&&r.Blob&&r.Promise&&r.OffscreenCanvas&&r.OffscreenCanvasRenderingContext2D&&r.HTMLCanvasElement&&r.HTMLCanvasElement.prototype.transferControlToOffscreen&&r.URL&&r.URL.createObjectURL);function v(){}function b(t){var e=u.exports.Promise,l=e!==void 0?e:r.Promise;return typeof l=="function"?new l(t):(t(v,v),null)}var w=function(){var t=Math.floor(16.666666666666668),e,l,a={},f=0;return typeof requestAnimationFrame=="function"&&typeof cancelAnimationFrame=="function"?(e=function(d){var i=Math.random();return a[i]=requestAnimationFrame(function s(p){f===p||f+t-1<p?(f=p,delete a[i],d()):a[i]=requestAnimationFrame(s)}),i},l=function(d){a[d]&&cancelAnimationFrame(a[d])}):(e=function(d){return setTimeout(d,t)},l=function(d){return clearTimeout(d)}),{frame:e,cancel:l}}(),S=function(){var t,e,l={};function a(f){function d(i,s){f.postMessage({options:i||{},callback:s})}f.init=function(s){var p=s.transferControlToOffscreen();f.postMessage({canvas:p},[p])},f.fire=function(s,p,I){if(e)return d(s,null),e;var h=Math.random().toString(36).slice(2);return e=b(function(x){function M(m){m.data.callback===h&&(delete l[h],f.removeEventListener("message",M),e=null,I(),x())}f.addEventListener("message",M),d(s,h),l[h]=M.bind(null,{data:{callback:h}})}),e},f.reset=function(){f.postMessage({reset:!0});for(var s in l)l[s](),delete l[s]}}return function(){if(t)return t;if(!o&&y){var f=["var CONFETTI, SIZE = {}, module = {};","("+n.toString()+")(this, module, true, SIZE);","onmessage = function(msg) {","  if (msg.data.options) {","    CONFETTI(msg.data.options).then(function () {","      if (msg.data.callback) {","        postMessage({ callback: msg.data.callback });","      }","    });","  } else if (msg.data.reset) {","    CONFETTI && CONFETTI.reset();","  } else if (msg.data.resize) {","    SIZE.width = msg.data.resize.width;","    SIZE.height = msg.data.resize.height;","  } else if (msg.data.canvas) {","    SIZE.width = msg.data.canvas.width;","    SIZE.height = msg.data.canvas.height;","    CONFETTI = module.exports.create(msg.data.canvas);","  }","}"].join(`
`);try{t=new Worker(URL.createObjectURL(new Blob([f])))}catch(d){return typeof console!==void 0&&typeof console.warn=="function"&&console.warn("\u{1F38A} Could not load worker",d),null}a(t)}return t}}(),ae={particleCount:50,angle:90,spread:45,startVelocity:45,decay:.9,gravity:1,drift:0,ticks:200,x:.5,y:.5,shapes:["square","circle"],zIndex:100,colors:["#26ccff","#a25afd","#ff5e7e","#88ff5a","#fcff42","#ffa62d","#ff36ff"],disableForReducedMotion:!1,scalar:1};function ie(t,e){return e?e(t):t}function se(t){return t!=null}function g(t,e,l){return ie(t&&se(t[e])?t[e]:ae[e],l)}function le(t){return t<0?0:Math.floor(t)}function ce(t,e){return Math.floor(Math.random()*(e-t))+t}function B(t){return parseInt(t,16)}function de(t){return t.map(ue)}function ue(t){var e=String(t).replace(/[^0-9a-f]/gi,"");return e.length<6&&(e=e[0]+e[0]+e[1]+e[1]+e[2]+e[2]),{r:B(e.substring(0,2)),g:B(e.substring(2,4)),b:B(e.substring(4,6))}}function fe(t){var e=g(t,"origin",Object);return e.x=g(e,"x",Number),e.y=g(e,"y",Number),e}function he(t){t.width=document.documentElement.clientWidth,t.height=document.documentElement.clientHeight}function me(t){var e=t.getBoundingClientRect();t.width=e.width,t.height=e.height}function pe(t){var e=document.createElement("canvas");return e.style.position="fixed",e.style.top="0px",e.style.left="0px",e.style.pointerEvents="none",e.style.zIndex=t,e}function ge(t,e,l,a,f,d,i,s,p){t.save(),t.translate(e,l),t.rotate(d),t.scale(a,f),t.arc(0,0,1,i,s,p),t.restore()}function ye(t){var e=t.angle*(Math.PI/180),l=t.spread*(Math.PI/180);return{x:t.x,y:t.y,wobble:Math.random()*10,wobbleSpeed:Math.min(.11,Math.random()*.1+.05),velocity:t.startVelocity*.5+Math.random()*t.startVelocity,angle2D:-e+(.5*l-Math.random()*l),tiltAngle:(Math.random()*(.75-.25)+.25)*Math.PI,color:t.color,shape:t.shape,tick:0,totalTicks:t.ticks,decay:t.decay,drift:t.drift,random:Math.random()+2,tiltSin:0,tiltCos:0,wobbleX:0,wobbleY:0,gravity:t.gravity*3,ovalScalar:.6,scalar:t.scalar}}function ve(t,e){e.x+=Math.cos(e.angle2D)*e.velocity+e.drift,e.y+=Math.sin(e.angle2D)*e.velocity+e.gravity,e.wobble+=e.wobbleSpeed,e.velocity*=e.decay,e.tiltAngle+=.1,e.tiltSin=Math.sin(e.tiltAngle),e.tiltCos=Math.cos(e.tiltAngle),e.random=Math.random()+2,e.wobbleX=e.x+10*e.scalar*Math.cos(e.wobble),e.wobbleY=e.y+10*e.scalar*Math.sin(e.wobble);var l=e.tick++/e.totalTicks,a=e.x+e.random*e.tiltCos,f=e.y+e.random*e.tiltSin,d=e.wobbleX+e.random*e.tiltCos,i=e.wobbleY+e.random*e.tiltSin;if(t.fillStyle="rgba("+e.color.r+", "+e.color.g+", "+e.color.b+", "+(1-l)+")",t.beginPath(),e.shape==="circle")t.ellipse?t.ellipse(e.x,e.y,Math.abs(d-a)*e.ovalScalar,Math.abs(i-f)*e.ovalScalar,Math.PI/10*e.wobble,0,2*Math.PI):ge(t,e.x,e.y,Math.abs(d-a)*e.ovalScalar,Math.abs(i-f)*e.ovalScalar,Math.PI/10*e.wobble,0,2*Math.PI);else if(e.shape==="star")for(var s=Math.PI/2*3,p=4*e.scalar,I=8*e.scalar,h=e.x,x=e.y,M=5,m=Math.PI/M;M--;)h=e.x+Math.cos(s)*I,x=e.y+Math.sin(s)*I,t.lineTo(h,x),s+=m,h=e.x+Math.cos(s)*p,x=e.y+Math.sin(s)*p,t.lineTo(h,x),s+=m;else t.moveTo(Math.floor(e.x),Math.floor(e.y)),t.lineTo(Math.floor(e.wobbleX),Math.floor(f)),t.lineTo(Math.floor(d),Math.floor(i)),t.lineTo(Math.floor(a),Math.floor(e.wobbleY));return t.closePath(),t.fill(),e.tick<e.totalTicks}function be(t,e,l,a,f){var d=e.slice(),i=t.getContext("2d"),s,p,I=b(function(h){function x(){s=p=null,i.clearRect(0,0,a.width,a.height),f(),h()}function M(){o&&!(a.width===c.width&&a.height===c.height)&&(a.width=t.width=c.width,a.height=t.height=c.height),!a.width&&!a.height&&(l(t),a.width=t.width,a.height=t.height),i.clearRect(0,0,a.width,a.height),d=d.filter(function(m){return ve(i,m)}),d.length?s=w.frame(M):x()}s=w.frame(M),p=x});return{addFettis:function(h){return d=d.concat(h),I},canvas:t,promise:I,reset:function(){s&&w.cancel(s),p&&p()}}}function H(t,e){var l=!t,a=!!g(e||{},"resize"),f=g(e,"disableForReducedMotion",Boolean),d=y&&!!g(e||{},"useWorker"),i=d?S():null,s=l?he:me,p=t&&i?!!t.__confetti_initialized:!1,I=typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion)").matches,h;function x(m,O,A){for(var T=g(m,"particleCount",le),L=g(m,"angle",Number),F=g(m,"spread",Number),E=g(m,"startVelocity",Number),we=g(m,"decay",Number),Me=g(m,"gravity",Number),xe=g(m,"drift",Number),z=g(m,"colors",de),Se=g(m,"ticks",Number),W=g(m,"shapes"),Ie=g(m,"scalar"),j=fe(m),K=T,P=[],ke=t.width*j.x,Ee=t.height*j.y;K--;)P.push(ye({x:ke,y:Ee,angle:L,spread:F,startVelocity:E,color:z[K%z.length],shape:W[ce(0,W.length)],ticks:Se,decay:we,gravity:Me,drift:xe,scalar:Ie}));return h?h.addFettis(P):(h=be(t,P,s,O,A),h.promise)}function M(m){var O=f||g(m,"disableForReducedMotion",Boolean),A=g(m,"zIndex",Number);if(O&&I)return b(function(E){E()});l&&h?t=h.canvas:l&&!t&&(t=pe(A),document.body.appendChild(t)),a&&!p&&s(t);var T={width:t.width,height:t.height};i&&!p&&i.init(t),p=!0,i&&(t.__confetti_initialized=!0);function L(){if(i){var E={getBoundingClientRect:function(){if(!l)return t.getBoundingClientRect()}};s(E),i.postMessage({resize:{width:E.width,height:E.height}});return}T.width=T.height=null}function F(){h=null,a&&r.removeEventListener("resize",L),l&&t&&(document.body.removeChild(t),t=null,p=!1)}return a&&r.addEventListener("resize",L,!1),i?i.fire(m,T,F):x(m,T,F)}return M.reset=function(){i&&i.reset(),h&&h.reset()},M}var D;function _(){return D||(D=H(null,{useWorker:!0,resize:!0})),D}u.exports=function(){return _().apply(this,arguments)},u.exports.reset=function(){_().reset()},u.exports.create=H})(function(){return typeof window<"u"?window:typeof self<"u"?self:this||{}}(),N,!1);var V=N.exports,qe=N.exports.create;import{getState as Oe}from"@neptune/store";import{intercept as Ae}from"@neptune";import{storage as Pe}from"@plugin";import{appendStyle as Te}from"@neptune/utils";var Z=Te(`
.download-button {
	align-items: center;
	display: flex;
	font-weight: 500;
	padding: 14px 16px;
	width: 100%;
	flex-grow: 1;
	height: 1.72rem;
	color: #b878ff;
    position: relative;
}
.download-button:hover {
	background-color: #9e46ff;
	color: #fff;
}
.download-button::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: var(--progress, 0); /* Initially set to 0 */
    background: rgba(255, 255, 255, 0.25); /* Loading bar color */
    z-index: 1;
}
.download-button.loading {
    background-color: #9e46ff;
    cursor: not-allowed;
    color: #fff;
}
.download-button span {
    z-index: 2;
    position: relative;
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
`);import{html as G}from"@neptune/voby";import{storage as q}from"@plugin";var k={HiRes:"HI_RES_LOSSLESS",MQA:"HI_RES",High:"LOSSLESS"},Q=Object.values(k),X=new Set(Q),Y=[k.HiRes,k.High],R=Object.fromEntries(Object.entries(k).map(([n,r])=>[r,n])),ze={LOSSLESS:k.High,HIRES_LOSSLESS:k.HiRes,MQA:k.MQA};q.desiredDownloadQuality=k.HiRes;var Ce=()=>G`<div class="settings-section">
		<h3 class="settings-header">Download Quality</h3>
		<p class="settings-explainer">Select the desired max download quality:</p>
		<select id="qualityDropdown" onChange=${r=>q.desiredDownloadQuality=r.target.value}>
			${Y.map(r=>G`<option value=${r} selected=${q.desiredDownloadQuality===r}>${R[r]}</option>`)}
		</select>
	</div>`;var Le=$("crypto"),Fe="UIlTTEMmmLfGowo/UC60x2H45W6MdGgTRfo/umg4754=",J=async n=>{let r=Buffer.from(Fe,"base64"),u=Buffer.from(n,"base64"),o=u.slice(0,16),c=u.slice(16),v=Le.createDecipheriv("aes-256-cbc",r,o).update(c),b=v.slice(0,16),w=v.slice(16,24);return{key:b,nonce:w}};import{getState as Be}from"@neptune/store";var Re=$("https"),U=()=>{let n=Be();return{Authorization:`Bearer ${n.session.oAuthAccessToken}`,"x-tidal-token":n.session.apiToken}},ee=(n,r)=>new Promise((u,o)=>{let c=Re.request(n,{headers:U()},y=>{let v=parseInt(y.headers["content-length"],10),b=0,w=[];y.on("data",S=>{w.push(S),b+=S.length,r!==void 0&&r({total:v,downloaded:b,percent:b/v*100})}),y.on("end",()=>{let S=Buffer.concat(w);r({total:v,downloaded:v,percent:100}),u(S)})});c.on("error",o),c.end()});var te=async(n,r)=>{if(!X.has(r))throw new Error(`Invalid audio quality: ${r}, should be one of ${Q.join(", ")}`);if(n===void 0)throw new Error("trackId is required");let u=`https://desktop.tidal.com/v1/tracks/${n}/playbackinfopostpaywall/v4?audioquality=${r}&playbackmode=STREAM&assetpresentation=FULL`,o=await fetch(u,{headers:U()}).then(y=>y.json()),c=JSON.parse(atob(o.manifest));if(c.encryptionType!=="OLD_AES")throw new Error(`Unexpected manifest encryption type ${c.encryptionType}`);return o.manifest=c,o.cryptKey=await J(c.keyId),o};var De=$("crypto"),re=async(n,r,u)=>{let o=Buffer.concat([u,Buffer.alloc(8,0)]),c=new De.createDecipheriv("aes-128-ctr",r,o);return Buffer.concat([c.update(n),c.final()])};var oe=(n,r)=>{let u=URL.createObjectURL(n),o=document.createElement("a");o.href=u,o.download=r,o.click(),URL.revokeObjectURL(u)};var ne=async(n,r,u,o)=>{let c=await te(n,u),{key:y,nonce:v}=c.cryptKey,b=c.manifest.urls[0],w=await ee(b,o),S=await re(w,y,v);oe(new Blob([S],{type:"application/octet-stream"}),`${r} [${R[c.audioQuality]}].flac`)};V();var C={},$e=n=>({prep:()=>{let r=C[n];r.disabled=!0,r.classList.add("loading"),r.textContent="Fetching Meta..."},tick:({total:r,downloaded:u,percent:o})=>{let c=C[n];c.style.setProperty("--progress",`${o}%`);let y=(u/1048576).toFixed(0),v=(r/1048576).toFixed(0);c.textContent=`Downloading... ${y}/${v}MB ${o.toFixed(0)}%`},clear:()=>{let r=C[n];r.classList.remove("loading"),r.disabled=!1,r.style.removeProperty("--progress"),r.textContent="Download"}}),Ne=Ae("contextMenu/OPEN_MEDIA_ITEM",([n])=>setTimeout(()=>{let r=Oe().content.mediaItems.get(n.id.toString())?.item,u=document.querySelector('[data-type="list-container__context-menu"]'),o=document.createElement("button");o.type="button",o.role="menuitem",o.textContent="Download",o.className="download-button",C[r.id]?.disabled===!0&&(o.disabled=!0,o.classList.add("loading")),C[r.id]=o,u.appendChild(o);let c=r.artist??r.artists?.[0],y=c!==void 0?` by ${c.name}`:"",v=`${r.title}${y}`,{prep:b,tick:w,clear:S}=$e(r.id);o.addEventListener("click",()=>{b(),ne(r.id,v,Pe.desiredDownloadQuality,w).then(S)})})),yt=()=>{Ne(),Z()};export{Ce as Settings,yt as onUnload};
