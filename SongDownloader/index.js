var b=(t=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(t,{get:(e,o)=>(typeof require<"u"?require:e)[o]}):t)(function(t){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+t+'" is not supported')});import{store as P}from"@neptune";import{intercept as _}from"@neptune";import{storage as N}from"@plugin";import{appendStyle as T}from"@neptune/utils";var k=`
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
`;T(`
${k}
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
`);import{html as I}from"@neptune/voby";import{storage as l}from"@plugin";var y=(n=>(n.HiRes="HI_RES_LOSSLESS",n.MQA="HI_RES",n.High="LOSSLESS",n))(y||{});var h=Object.values(y),S=new Set(h),v=["HI_RES_LOSSLESS","LOSSLESS"],g=Object.fromEntries(Object.entries(y).map(([t,e])=>[e,t]));import{store as L}from"@neptune";var{request:C}=b("https"),w=null,x=()=>{if(w===null)throw new Error("oAuthAccessToken token not set");let t=L.getState();return{Authorization:`Bearer ${w}`,"x-tidal-token":t.session.clientId}},f=t=>w=t,B=(t,e,o=0,n)=>new Promise((r,s)=>{let i=x();if(typeof o!="number")throw new Error("byteRangeStart must be a number");if(n!==void 0){if(typeof n!="number")throw new Error("byteRangeEnd must be a number");i.Range=`bytes=${o}-${n}`}let d=C(t,{headers:i},a=>{let c=-1;if(a.headers["content-range"]){let u=/\/(\d+)$/.exec(a.headers["content-range"]);u&&(c=parseInt(u[1],10))}else a.headers["content-length"]!==void 0&&(c=parseInt(a.headers["content-length"],10));let p=0,A=[];a.on("data",u=>{A.push(u),p+=u.length,e!==void 0&&e({total:c,downloaded:p,percent:p/c*100})}),a.on("end",()=>{let u=Buffer.concat(A);e!==void 0&&e({total:c,downloaded:c,percent:100}),r(u)})});d.on("error",s),d.end()});l.desiredDownloadQuality??="HI_RES_LOSSLESS";l.oAuthAccessToken??=null;l.oAuthAccessToken!==null&&f(l.oAuthAccessToken);var D=()=>I`<div class="settings-section">
	<br class="settings-spacer" />
	<h3 class="settings-header">OAuth Access Token</h3>
	<p class="settings-explainer">Use Ctrl+Shift+I to open inspector tools. Go to Network and enter the Bearer token from a tidal api request here</p>
	<input onChange=${({target:t})=>l.oAuthAccessToken=f(t.value===""?null:t.value)} value=${l.oAuthAccessToken} />

	<h3 class="settings-header">Download Quality</h3>
	<p class="settings-explainer">Select the desired max download quality:</p>
	<select id="qualityDropdown" onChange=${t=>l.desiredDownloadQuality=t.target.value}>
		${v.map(t=>I`<option value=${t} selected=${l.desiredDownloadQuality===t}>${g[t]}</option>`)}
	</select>
</div>`;var{createDecipheriv:R}=b("crypto"),H="UIlTTEMmmLfGowo/UC60x2H45W6MdGgTRfo/umg4754=",O=async t=>{let e=Buffer.from(H,"base64"),o=Buffer.from(t,"base64"),n=o.slice(0,16),r=o.slice(16),i=R("aes-256-cbc",e,n).update(r),d=i.slice(0,16),a=i.slice(16,24);return{key:d,nonce:a}};var Q=async(t,e)=>{if(!S.has(e))throw new Error(`Invalid audio quality: ${e}, should be one of ${h.join(", ")}`);if(t===void 0)throw new Error("trackId is required");let o=`https://desktop.tidal.com/v1/tracks/${t}/playbackinfopostpaywall/v4?audioquality=${e}&playbackmode=STREAM&assetpresentation=FULL`,n=await fetch(o,{headers:x()}).then(s=>{if(s.status===401)throw alert("Failed to fetch Stream Info... Invalid OAuth Access Token! Please update it in settings."),f(null),new Error("Invalid OAuth Access Token!");return s.json()}),r=JSON.parse(atob(n.manifest));if(r.encryptionType!=="OLD_AES")throw new Error(`Unexpected manifest encryption type ${r.encryptionType}`);return n.manifest=r,n.cryptKey=await O(r.keyId),n};var q=b("crypto"),E=async(t,e,o)=>{let n=Buffer.concat([o,Buffer.alloc(8,0)]),r=new q.createDecipheriv("aes-128-ctr",e,n);return Buffer.concat([r.update(t),r.final()])};var $=(t,e)=>{let o=URL.createObjectURL(t),n=document.createElement("a");n.href=o,n.download=e,n.click(),URL.revokeObjectURL(o)};var M=async(t,e,o,n)=>{let r=await Q(t,o),{key:s,nonce:i}=r.cryptKey,d=r.manifest.urls[0],a=await B(d,n),c=await E(a,s,i);$(new Blob([c],{type:"application/octet-stream"}),`${e} [${g[r.audioQuality]}].flac`)};var m={},U=t=>({prep:()=>{let e=m[t];e.disabled=!0,e.classList.add("loading"),e.textContent="Fetching Meta..."},tick:({total:e,downloaded:o,percent:n})=>{let r=m[t];r.style.setProperty("--progress",`${n}%`);let s=(o/1048576).toFixed(0),i=(e/1048576).toFixed(0);r.textContent=`Downloading... ${s}/${i}MB ${n.toFixed(0)}%`},clear:()=>{let e=m[t];e.classList.remove("loading"),e.disabled=!1,e.style.removeProperty("--progress"),e.textContent="Download"}}),F=_("contextMenu/OPEN_MEDIA_ITEM",([t])=>{setTimeout(()=>{let o=P.getState().content.mediaItems[+t.id]?.item;if(o?.contentType!=="track"||o.id===void 0)return;let n=document.querySelector('[data-type="list-container__context-menu"]');if(n===null)return;document.getElementsByClassName("download-button").length>=1&&document.getElementsByClassName("download-button")[0].remove();let r=document.createElement("button");r.type="button",r.role="menuitem",r.textContent="Download",r.className="download-button",m[o.id]?.disabled===!0&&(r.disabled=!0,r.classList.add("loading")),m[o.id]=r,n.appendChild(r);let s=o.artist??o.artists?.[0],i=s!==void 0?` by ${s.name}`:"",d=`${o.title}${i}`,{prep:a,tick:c,clear:p}=U(o.id);r.addEventListener("click",()=>{o.id!==void 0&&(a(),M(o.id,d,N.desiredDownloadQuality,c).then(p))})})}),St=F;export{D as Settings,St as onUnload};
