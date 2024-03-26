var y=(e=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(e,{get:(t,o)=>(typeof require<"u"?require:t)[o]}):e)(function(e){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+e+'" is not supported')});import{store as T}from"@neptune";import{intercept as _}from"@neptune";import{storage as F}from"@plugin";import{appendStyle as O}from"@neptune/utils";var h=`
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
`;O(`
${h}
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
`);import{html as v}from"@neptune/voby";import{storage as g}from"@plugin";var p=(n=>(n.HiRes="HI_RES_LOSSLESS",n.MQA="HI_RES",n.High="LOSSLESS",n))(p||{});var b=Object.values(p),S=new Set(b),k=["HI_RES_LOSSLESS","LOSSLESS"],m=Object.fromEntries(Object.entries(p).map(([e,t])=>[t,e]));g.desiredDownloadQuality??="HI_RES_LOSSLESS";var $=()=>v`<div class="settings-section">
	<h3 class="settings-header">Download Quality</h3>
	<p class="settings-explainer">Select the desired max download quality:</p>
	<select id="qualityDropdown" onChange=${e=>g.desiredDownloadQuality=e.target.value}>
		${k.map(e=>v`<option value=${e} selected=${g.desiredDownloadQuality===e}>${m[e]}</option>`)}
	</select>
</div>`;var{createDecipheriv:C}=y("crypto"),L="UIlTTEMmmLfGowo/UC60x2H45W6MdGgTRfo/umg4754=",B=async e=>{let t=Buffer.from(L,"base64"),o=Buffer.from(e,"base64"),n=o.slice(0,16),r=o.slice(16),s=C("aes-256-cbc",t,n).update(r),c=s.slice(0,16),i=s.slice(16,24);return{key:c,nonce:i}};import{modules as R}from"@neptune";var{request:D}=y("https"),H=e=>{for(let t of R)if(typeof t?.exports=="object")for(let o in t.exports){let n=t.exports[o]?.[e];if(typeof n=="function")return n}},P=H("getCredentials"),w=async()=>{let{clientId:e,token:t}=await P();return{Authorization:`Bearer ${t}`,"x-tidal-token":e}},I=async(e,t,o=0,n)=>{let r=await w();if(typeof o!="number")throw new Error("byteRangeStart must be a number");if(n!==void 0){if(typeof n!="number")throw new Error("byteRangeEnd must be a number");r.Range=`bytes=${o}-${n}`}return new Promise((a,s)=>{let c=D(e,{headers:r},i=>{let d=-1;if(i.headers["content-range"]){let l=/\/(\d+)$/.exec(i.headers["content-range"]);l&&(d=parseInt(l[1],10))}else i.headers["content-length"]!==void 0&&(d=parseInt(i.headers["content-length"],10));let u=0,x=[];i.on("data",l=>{x.push(l),u+=l.length,t!==void 0&&t({total:d,downloaded:u,percent:u/d*100})}),i.on("end",()=>{let l=Buffer.concat(x);t!==void 0&&t({total:d,downloaded:d,percent:100}),a(l)})});c.on("error",s),c.end()})};var A=async(e,t)=>{if(!S.has(t))throw new Error(`Invalid audio quality: ${t}, should be one of ${b.join(", ")}`);if(e===void 0)throw new Error("trackId is required");let o=`https://desktop.tidal.com/v1/tracks/${e}/playbackinfo?audioquality=${t}&playbackmode=STREAM&assetpresentation=FULL`,n=await fetch(o,{headers:await w()}).then(a=>{if(a.status===401)throw alert("Failed to fetch Stream Info... Invalid OAuth Access Token!"),new Error("Invalid OAuth Access Token!");return a.json()}),r=JSON.parse(atob(n.manifest));if(r.encryptionType!=="OLD_AES")throw new Error(`Unexpected manifest encryption type ${r.encryptionType}`);return n.manifest=r,n.cryptKey=await B(r.keyId),n};var q=y("crypto"),Q=async(e,t,o)=>{let n=Buffer.concat([o,Buffer.alloc(8,0)]),r=new q.createDecipheriv("aes-128-ctr",t,n);return Buffer.concat([r.update(e),r.final()])};var E=(e,t)=>{let o=URL.createObjectURL(e),n=document.createElement("a");n.href=o,n.download=t,n.click(),URL.revokeObjectURL(o)};var M=async(e,t,o,n)=>{let r=await A(e,o),{key:a,nonce:s}=r.cryptKey,c=r.manifest.urls[0],i=await I(c,n),d=await Q(i,a,s);E(new Blob([d],{type:"application/octet-stream"}),`${t} [${m[r.audioQuality]}].flac`)};var f={},N=e=>({prep:()=>{let t=f[e];t.disabled=!0,t.classList.add("loading"),t.textContent="Fetching Meta..."},tick:({total:t,downloaded:o,percent:n})=>{let r=f[e];r.style.setProperty("--progress",`${n}%`);let a=(o/1048576).toFixed(0),s=(t/1048576).toFixed(0);r.textContent=`Downloading... ${a}/${s}MB ${n.toFixed(0)}%`},clear:()=>{let t=f[e];t.classList.remove("loading"),t.disabled=!1,t.style.removeProperty("--progress"),t.textContent="Download"}}),U=_("contextMenu/OPEN_MEDIA_ITEM",([e])=>{setTimeout(()=>{let o=T.getState().content.mediaItems[+e.id]?.item;if(o?.contentType!=="track"||o.id===void 0)return;let n=document.querySelector('[data-type="list-container__context-menu"]');if(n===null)return;document.getElementsByClassName("download-button").length>=1&&document.getElementsByClassName("download-button")[0].remove();let r=document.createElement("button");r.type="button",r.role="menuitem",r.textContent="Download",r.className="download-button",f[o.id]?.disabled===!0&&(r.disabled=!0,r.classList.add("loading")),f[o.id]=r,n.appendChild(r);let a=o.artist??o.artists?.[0],s=a!==void 0?` by ${a.name}`:"",c=`${o.title}${s}`,{prep:i,tick:d,clear:u}=N(o.id);r.addEventListener("click",()=>{o.id!==void 0&&(i(),M(o.id,c,F.desiredDownloadQuality,d).then(u))})})}),kt=U;export{$ as Settings,kt as onUnload};
