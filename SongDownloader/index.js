var y=(e=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(e,{get:(t,r)=>(typeof require<"u"?require:t)[r]}):e)(function(e){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+e+'" is not supported')});import{getState as U}from"@neptune/store";import{intercept as C}from"@neptune";import{storage as _}from"@plugin";import{appendStyle as M}from"@neptune/utils";var x=`
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
`;var S=M(`
${x}
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
`);import{html as k}from"@neptune/voby";import{storage as w}from"@plugin";var d={HiRes:"HI_RES_LOSSLESS",MQA:"HI_RES",High:"LOSSLESS"},g=Object.values(d),v=new Set(g),I=[d.HiRes,d.High],u=Object.fromEntries(Object.entries(d).map(([e,t])=>[t,e])),J={LOSSLESS:d.High,HIRES_LOSSLESS:d.HiRes,MQA:d.MQA};w.desiredDownloadQuality=d.HiRes;var A=()=>k`<div class="settings-section">
	<h3 class="settings-header">Download Quality</h3>
	<p class="settings-explainer">Select the desired max download quality:</p>
	<select id="qualityDropdown" onChange=${e=>w.desiredDownloadQuality=e.target.value}>
		${I.map(e=>k`<option value=${e} selected=${w.desiredDownloadQuality===e}>${u[e]}</option>`)}
	</select>
</div>`;var q=y("crypto"),H="UIlTTEMmmLfGowo/UC60x2H45W6MdGgTRfo/umg4754=",$=async e=>{let t=Buffer.from(H,"base64"),r=Buffer.from(e,"base64"),o=r.slice(0,16),n=r.slice(16),i=q.createDecipheriv("aes-256-cbc",t,o).update(n),l=i.slice(0,16),s=i.slice(16,24);return{key:l,nonce:s}};import{getState as O}from"@neptune/store";var R=y("https"),h=()=>{let e=O();return{Authorization:`Bearer ${e.session.oAuthAccessToken}`,"x-tidal-token":e.session.apiToken}},B=(e,t,r=0,o=null)=>new Promise((n,a)=>{let i=h();o!==null&&(i.Range=`bytes=${r}-${o}`);let l=R.request(e,{headers:i},s=>{let c;if(s.headers["content-range"]){let p=/\/(\d+)$/.exec(s.headers["content-range"]);c=p?parseInt(p[1],10):null}else c=parseInt(s.headers["content-length"],10);let m=0,b=[];s.on("data",p=>{b.push(p),m+=p.length,t!==void 0&&t({total:c,downloaded:m,percent:m/c*100})}),s.on("end",()=>{let p=Buffer.concat(b);t({total:c,downloaded:c,percent:100}),n(p)})});l.on("error",a),l.end()});var L=async(e,t)=>{if(!v.has(t))throw new Error(`Invalid audio quality: ${t}, should be one of ${g.join(", ")}`);if(e===void 0)throw new Error("trackId is required");let r=`https://desktop.tidal.com/v1/tracks/${e}/playbackinfopostpaywall/v4?audioquality=${t}&playbackmode=STREAM&assetpresentation=FULL`,o=await fetch(r,{headers:h()}).then(a=>a.json()),n=JSON.parse(atob(o.manifest));if(n.encryptionType!=="OLD_AES")throw new Error(`Unexpected manifest encryption type ${n.encryptionType}`);return o.manifest=n,o.cryptKey=await $(n.keyId),o};var T=y("crypto"),E=async(e,t,r)=>{let o=Buffer.concat([r,Buffer.alloc(8,0)]),n=new T.createDecipheriv("aes-128-ctr",t,o);return Buffer.concat([n.update(e),n.final()])};var D=(e,t)=>{let r=URL.createObjectURL(e),o=document.createElement("a");o.href=r,o.download=t,o.click(),URL.revokeObjectURL(r)};var Q=async(e,t,r,o)=>{let n=await L(e,r),{key:a,nonce:i}=n.cryptKey,l=n.manifest.urls[0],s=await B(l,o),c=await E(s,a,i);D(new Blob([c],{type:"application/octet-stream"}),`${t} [${u[n.audioQuality]}].flac`)};var f={},j=e=>({prep:()=>{let t=f[e];t.disabled=!0,t.classList.add("loading"),t.textContent="Fetching Meta..."},tick:({total:t,downloaded:r,percent:o})=>{let n=f[e];n.style.setProperty("--progress",`${o}%`);let a=(r/1048576).toFixed(0),i=(t/1048576).toFixed(0);n.textContent=`Downloading... ${a}/${i}MB ${o.toFixed(0)}%`},clear:()=>{let t=f[e];t.classList.remove("loading"),t.disabled=!1,t.style.removeProperty("--progress"),t.textContent="Download"}}),F=C("contextMenu/OPEN_MEDIA_ITEM",([e])=>setTimeout(()=>{let t=U().content.mediaItems.get(e.id.toString())?.item,r=document.querySelector('[data-type="list-container__context-menu"]'),o=document.createElement("button");o.type="button",o.role="menuitem",o.textContent="Download",o.className="download-button",f[t.id]?.disabled===!0&&(o.disabled=!0,o.classList.add("loading")),f[t.id]=o,r.appendChild(o);let n=t.artist??t.artists?.[0],a=n!==void 0?` by ${n.name}`:"",i=`${t.title}${a}`,{prep:l,tick:s,clear:c}=j(t.id);o.addEventListener("click",()=>{l(),Q(t.id,i,_.desiredDownloadQuality,s).then(c)})})),xt=()=>{F(),S()};export{A as Settings,xt as onUnload};
