var y=(t=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(t,{get:(e,o)=>(typeof require<"u"?require:e)[o]}):t)(function(t){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+t+'" is not supported')});import{store as q}from"@neptune";import{intercept as P}from"@neptune";import{storage as T}from"@plugin";import{appendStyle as $}from"@neptune/utils";var h=`
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
`;$(`
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
`);import{html as B}from"@neptune/voby";import{storage as g}from"@plugin";var f=(n=>(n.HiRes="HI_RES_LOSSLESS",n.MQA="HI_RES",n.High="LOSSLESS",n))(f||{});var b=Object.values(f),S=new Set(b),v=["HI_RES_LOSSLESS","LOSSLESS"],m=Object.fromEntries(Object.entries(f).map(([t,e])=>[e,t]));g.desiredDownloadQuality??="HI_RES_LOSSLESS";var L=()=>B`<div class="settings-section">
	<h3 class="settings-header">Download Quality</h3>
	<p class="settings-explainer">Select the desired max download quality:</p>
	<select id="qualityDropdown" onChange=${t=>g.desiredDownloadQuality=t.target.value}>
		${v.map(t=>B`<option value=${t} selected=${g.desiredDownloadQuality===t}>${m[t]}</option>`)}
	</select>
</div>`;var{createDecipheriv:D}=y("crypto"),O="UIlTTEMmmLfGowo/UC60x2H45W6MdGgTRfo/umg4754=",k=async t=>{let e=Buffer.from(O,"base64"),o=Buffer.from(t,"base64"),n=o.slice(0,16),r=o.slice(16),s=D("aes-256-cbc",e,n).update(r),c=s.slice(0,16),i=s.slice(16,24);return{key:c,nonce:i}};import{store as R}from"@neptune";var{request:C}=y("https"),w=()=>{let t=R.getState();return{Authorization:`Bearer ${t.session.oAuthAccessToken}`,"x-tidal-token":t.session.clientId}},I=(t,e,o=0,n)=>new Promise((r,a)=>{let s=w();if(typeof o!="number")throw new Error("byteRangeStart must be a number");if(n!==void 0){if(typeof n!="number")throw new Error("byteRangeEnd must be a number");s.Range=`bytes=${o}-${n}`}let c=C(t,{headers:s},i=>{let d=-1;if(i.headers["content-range"]){let l=/\/(\d+)$/.exec(i.headers["content-range"]);l&&(d=parseInt(l[1],10))}else i.headers["content-length"]!==void 0&&(d=parseInt(i.headers["content-length"],10));let u=0,x=[];i.on("data",l=>{x.push(l),u+=l.length,e!==void 0&&e({total:d,downloaded:u,percent:u/d*100})}),i.on("end",()=>{let l=Buffer.concat(x);e!==void 0&&e({total:d,downloaded:d,percent:100}),r(l)})});c.on("error",a),c.end()});var A=async(t,e)=>{if(!S.has(e))throw new Error(`Invalid audio quality: ${e}, should be one of ${b.join(", ")}`);if(t===void 0)throw new Error("trackId is required");let o=`https://desktop.tidal.com/v1/tracks/${t}/playbackinfopostpaywall/v4?audioquality=${e}&playbackmode=STREAM&assetpresentation=FULL`,n=await fetch(o,{headers:w()}).then(a=>a.json()),r=JSON.parse(atob(n.manifest));if(r.encryptionType!=="OLD_AES")throw new Error(`Unexpected manifest encryption type ${r.encryptionType}`);return n.manifest=r,n.cryptKey=await k(r.keyId),n};var H=y("crypto"),Q=async(t,e,o)=>{let n=Buffer.concat([o,Buffer.alloc(8,0)]),r=new H.createDecipheriv("aes-128-ctr",e,n);return Buffer.concat([r.update(t),r.final()])};var E=(t,e)=>{let o=URL.createObjectURL(t),n=document.createElement("a");n.href=o,n.download=e,n.click(),URL.revokeObjectURL(o)};var M=async(t,e,o,n)=>{let r=await A(t,o),{key:a,nonce:s}=r.cryptKey,c=r.manifest.urls[0],i=await I(c,n),d=await Q(i,a,s);E(new Blob([d],{type:"application/octet-stream"}),`${e} [${m[r.audioQuality]}].flac`)};var p={},_=t=>({prep:()=>{let e=p[t];e.disabled=!0,e.classList.add("loading"),e.textContent="Fetching Meta..."},tick:({total:e,downloaded:o,percent:n})=>{let r=p[t];r.style.setProperty("--progress",`${n}%`);let a=(o/1048576).toFixed(0),s=(e/1048576).toFixed(0);r.textContent=`Downloading... ${a}/${s}MB ${n.toFixed(0)}%`},clear:()=>{let e=p[t];e.classList.remove("loading"),e.disabled=!1,e.style.removeProperty("--progress"),e.textContent="Download"}}),N=P("contextMenu/OPEN_MEDIA_ITEM",([t])=>{setTimeout(()=>{let o=q.getState().content.mediaItems[+t.id]?.item;if(o?.contentType!=="track"||o.id===void 0)return;let n=document.querySelector('[data-type="list-container__context-menu"]');if(n===null)return;document.getElementsByClassName("download-button").length>=1&&document.getElementsByClassName("download-button")[0].remove();let r=document.createElement("button");r.type="button",r.role="menuitem",r.textContent="Download",r.className="download-button",p[o.id]?.disabled===!0&&(r.disabled=!0,r.classList.add("loading")),p[o.id]=r,n.appendChild(r);let a=o.artist??o.artists?.[0],s=a!==void 0?` by ${a.name}`:"",c=`${o.title}${s}`,{prep:i,tick:d,clear:u}=_(o.id);r.addEventListener("click",()=>{o.id!==void 0&&(i(),M(o.id,c,T.desiredDownloadQuality,d).then(u))})})}),ht=N;export{L as Settings,ht as onUnload};
