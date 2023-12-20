var y=(o=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(o,{get:(t,n)=>(typeof require<"u"?require:t)[n]}):o)(function(o){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+o+'" is not supported')});import{store as q}from"@neptune";import{intercept as P}from"@neptune";import{storage as T}from"@plugin";import{appendStyle as L}from"@neptune/utils";var h=`
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
`;L(`
${h}
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
`);import{html as B}from"@neptune/voby";import{storage as b}from"@plugin";var p=(e=>(e.HiRes="HI_RES_LOSSLESS",e.MQA="HI_RES",e.High="LOSSLESS",e))(p||{});var g=Object.values(p),S=new Set(g),v=["HI_RES_LOSSLESS","LOSSLESS"],f=Object.fromEntries(Object.entries(p).map(([o,t])=>[t,o]));b.desiredDownloadQuality="HI_RES_LOSSLESS";var D=()=>B`<div class="settings-section">
	<h3 class="settings-header">Download Quality</h3>
	<p class="settings-explainer">Select the desired max download quality:</p>
	<select id="qualityDropdown" onChange=${o=>b.desiredDownloadQuality=o.target.value}>
		${v.map(o=>B`<option value=${o} selected=${b.desiredDownloadQuality===o}>${f[o]}</option>`)}
	</select>
</div>`;var{createDecipheriv:M}=y("crypto"),O="UIlTTEMmmLfGowo/UC60x2H45W6MdGgTRfo/umg4754=",k=async o=>{let t=Buffer.from(O,"base64"),n=Buffer.from(o,"base64"),e=n.slice(0,16),r=n.slice(16),s=M("aes-256-cbc",t,e).update(r),c=s.slice(0,16),a=s.slice(16,24);return{key:c,nonce:a}};import{store as R}from"@neptune";var{request:C}=y("https"),w=()=>{let o=R.getState();return{Authorization:`Bearer ${o.session.oAuthAccessToken}`,"x-tidal-token":o.session.apiToken}},A=(o,t,n=0,e)=>new Promise((r,i)=>{let s=w();if(typeof n!="number")throw new Error("byteRangeStart must be a number");if(e!==void 0){if(typeof e!="number")throw new Error("byteRangeEnd must be a number");s.Range=`bytes=${n}-${e}`}let c=C(o,{headers:s},a=>{let d=-1;if(a.headers["content-range"]){let l=/\/(\d+)$/.exec(a.headers["content-range"]);l&&(d=parseInt(l[1],10))}else a.headers["content-length"]!==void 0&&(d=parseInt(a.headers["content-length"],10));let m=0,x=[];a.on("data",l=>{x.push(l),m+=l.length,t!==void 0&&t({total:d,downloaded:m,percent:m/d*100})}),a.on("end",()=>{let l=Buffer.concat(x);t!==void 0&&t({total:d,downloaded:d,percent:100}),r(l)})});c.on("error",i),c.end()});var I=async(o,t)=>{if(!S.has(t))throw new Error(`Invalid audio quality: ${t}, should be one of ${g.join(", ")}`);if(o===void 0)throw new Error("trackId is required");let n=`https://desktop.tidal.com/v1/tracks/${o}/playbackinfopostpaywall/v4?audioquality=${t}&playbackmode=STREAM&assetpresentation=FULL`,e=await fetch(n,{headers:w()}).then(i=>i.json()),r=JSON.parse(atob(e.manifest));if(r.encryptionType!=="OLD_AES")throw new Error(`Unexpected manifest encryption type ${r.encryptionType}`);return e.manifest=r,e.cryptKey=await k(r.keyId),e};var H=y("crypto"),Q=async(o,t,n)=>{let e=Buffer.concat([n,Buffer.alloc(8,0)]),r=new H.createDecipheriv("aes-128-ctr",t,e);return Buffer.concat([r.update(o),r.final()])};var E=(o,t)=>{let n=URL.createObjectURL(o),e=document.createElement("a");e.href=n,e.download=t,e.click(),URL.revokeObjectURL(n)};var $=async(o,t,n,e)=>{let r=await I(o,n),{key:i,nonce:s}=r.cryptKey,c=r.manifest.urls[0],a=await A(c,e),d=await Q(a,i,s);E(new Blob([d],{type:"application/octet-stream"}),`${t} [${f[r.audioQuality]}].flac`)};var u={},_=o=>({prep:()=>{let t=u[o];t.disabled=!0,t.classList.add("loading"),t.textContent="Fetching Meta..."},tick:({total:t,downloaded:n,percent:e})=>{let r=u[o];r.style.setProperty("--progress",`${e}%`);let i=(n/1048576).toFixed(0),s=(t/1048576).toFixed(0);r.textContent=`Downloading... ${i}/${s}MB ${e.toFixed(0)}%`},clear:()=>{let t=u[o];t.classList.remove("loading"),t.disabled=!1,t.style.removeProperty("--progress"),t.textContent="Download"}}),N=P("contextMenu/OPEN_MEDIA_ITEM",([o])=>{setTimeout(()=>{let t=q.getState().content.mediaItems.get(o.id.toString())?.item;if(t?.contentType!=="track"||t.id===void 0)return;let n=document.querySelector('[data-type="list-container__context-menu"]');if(n===null)return;document.getElementsByClassName("download-button").length>=1&&document.getElementsByClassName("download-button")[0].remove();let e=document.createElement("button");e.type="button",e.role="menuitem",e.textContent="Download",e.className="download-button",u[t.id]?.disabled===!0&&(e.disabled=!0,e.classList.add("loading")),u[t.id]=e,n.appendChild(e);let r=t.artist??t.artists?.[0],i=r!==void 0?` by ${r.name}`:"",s=`${t.title}${i}`,{prep:c,tick:a,clear:d}=_(t.id);e.addEventListener("click",()=>{t.id!==void 0&&(c(),$(t.id,s,T.desiredDownloadQuality,a).then(d))})})}),ht=N;export{D as Settings,ht as onUnload};
