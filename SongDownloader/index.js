var y=(e=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(e,{get:(t,o)=>(typeof require<"u"?require:t)[o]}):e)(function(e){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+e+'" is not supported')});import{store as T}from"@neptune";import{intercept as _}from"@neptune";import{storage as F}from"@plugin";import{appendStyle as M}from"@neptune/utils";var x=`
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
.settings-spacer {
    margin-bottom: 15px;
}
`;M(`
${x}
.download-button {
	align-items: center;
	display: flex;
	font-weight: 500;
	padding: 20px 16px;
	width: 100%;
	flex-grow: 1;
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
`);import{html as I}from"@neptune/voby";import{storage as b}from"@plugin";var p=(a=>(a.HiRes="HI_RES_LOSSLESS",a.MQA="HI_RES",a.High="LOSSLESS",a.Low="HIGH",a.Lowest="LOW",a))(p||{});var g=Object.values(p),S=["HI_RES_LOSSLESS","LOSSLESS"],m=Object.fromEntries(Object.entries(p).map(([e,t])=>[t,e]));b.desiredDownloadQuality??="HI_RES_LOSSLESS";var $=()=>I`<div class="settings-section">
	<h3 class="settings-header">Download Quality</h3>
	<p class="settings-explainer">Select the desired max download quality:</p>
	<select id="qualityDropdown" onChange=${e=>b.desiredDownloadQuality=e.target.value}>
		${S.map(e=>I`<option value=${e} selected=${b.desiredDownloadQuality===e}>${m[e]}</option>`)}
	</select>
</div>`;var{createDecipheriv:D}=y("crypto"),O="UIlTTEMmmLfGowo/UC60x2H45W6MdGgTRfo/umg4754=",B=async e=>{let t=Buffer.from(O,"base64"),o=Buffer.from(e,"base64"),r=o.slice(0,16),n=o.slice(16),s=D("aes-256-cbc",t,r).update(n),c=s.slice(0,16),i=s.slice(16,24);return{key:c,nonce:i}};import{modules as C}from"@neptune";var{request:Q}=y("https"),H=e=>{for(let t of C)if(typeof t?.exports=="object")for(let o in t.exports){let r=t.exports[o]?.[e];if(typeof r=="function")return r}},R=H("getCredentials"),w=async()=>{let{clientId:e,token:t}=await R();return{Authorization:`Bearer ${t}`,"x-tidal-token":e}},v=async(e,t,o=0,r)=>{let n=await w();if(typeof o!="number")throw new Error("byteRangeStart must be a number");if(r!==void 0){if(typeof r!="number")throw new Error("byteRangeEnd must be a number");n.Range=`bytes=${o}-${r}`}return new Promise((a,s)=>{let c=Q(e,{headers:n},i=>{let d=-1;if(i.headers["content-range"]){let l=/\/(\d+)$/.exec(i.headers["content-range"]);l&&(d=parseInt(l[1],10))}else i.headers["content-length"]!==void 0&&(d=parseInt(i.headers["content-length"],10));let u=0,h=[];i.on("data",l=>{h.push(l),u+=l.length,t!==void 0&&t({total:d,downloaded:u,percent:u/d*100})}),i.on("end",()=>{let l=Buffer.concat(h);t!==void 0&&t({total:d,downloaded:d,percent:100}),a(l)})});c.on("error",s),c.end()})};var k=async(e,t)=>{if(!g.includes(t))throw new Error(`Cannot get Stream Info! Invalid audio quality: ${t}, should be one of ${g.join(", ")}`);if(e===void 0)throw new Error("Cannot get Stream Info! trackId is missing");try{let o=`https://desktop.tidal.com/v1/tracks/${e}/playbackinfo?audioquality=${t}&playbackmode=STREAM&assetpresentation=FULL`,r=await fetch(o,{headers:await w()}).then(a=>{if(a.status===401)throw alert("Failed to fetch Stream Info... Invalid OAuth Access Token!"),new Error("Invalid OAuth Access Token!");return a.json()}),n=JSON.parse(atob(r.manifest));if(n.encryptionType!=="OLD_AES")throw new Error(`Unexpected manifest encryption type ${n.encryptionType}`);return r.manifest=n,r.cryptKey=await B(n.keyId),r}catch(o){throw new Error(`Failed to decode Stream Info! ${o?.message}`)}};var q=y("crypto"),A=async(e,t,o)=>{let r=Buffer.concat([o,Buffer.alloc(8,0)]),n=new q.createDecipheriv("aes-128-ctr",t,r);return Buffer.concat([n.update(e),n.final()])};var E=(e,t)=>{let o=URL.createObjectURL(e),r=document.createElement("a");r.href=o,r.download=t,r.click(),URL.revokeObjectURL(o)};var L=async(e,t,o,r)=>{let n=await k(e,o),{key:a,nonce:s}=n.cryptKey,c=n.manifest.urls[0],i=await v(c,r),d=await A(i,a,s);E(new Blob([d],{type:"application/octet-stream"}),`${t} [${m[n.audioQuality]}].flac`)};var f={},P=e=>({prep:()=>{let t=f[e];t.disabled=!0,t.classList.add("loading"),t.textContent="Fetching Meta..."},tick:({total:t,downloaded:o,percent:r})=>{let n=f[e];n.style.setProperty("--progress",`${r}%`);let a=(o/1048576).toFixed(0),s=(t/1048576).toFixed(0);n.textContent=`Downloading... ${a}/${s}MB ${r.toFixed(0)}%`},clear:()=>{let t=f[e];t.classList.remove("loading"),t.disabled=!1,t.style.removeProperty("--progress"),t.textContent="Download"}}),N=_("contextMenu/OPEN_MEDIA_ITEM",([e])=>{setTimeout(()=>{let o=T.getState().content.mediaItems[+e.id]?.item;if(o?.contentType!=="track"||o.id===void 0)return;let r=document.querySelector('[data-type="list-container__context-menu"]');if(r===null)return;document.getElementsByClassName("download-button").length>=1&&document.getElementsByClassName("download-button")[0].remove();let n=document.createElement("button");n.type="button",n.role="menuitem",n.textContent="Download",n.className="download-button",f[o.id]?.disabled===!0&&(n.disabled=!0,n.classList.add("loading")),f[o.id]=n,r.appendChild(n);let a=o.artist??o.artists?.[0],s=a!==void 0?` by ${a.name}`:"",c=`${o.title}${s}`,{prep:i,tick:d,clear:u}=P(o.id);n.addEventListener("click",()=>{o.id!==void 0&&(i(),L(o.id,c,F.desiredDownloadQuality,d).catch(alert).finally(u))})})}),St=N;export{$ as Settings,St as onUnload};
