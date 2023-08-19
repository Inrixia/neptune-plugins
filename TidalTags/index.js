import{intercept as T}from"@neptune";var h="data-test-media-state-indicator-streaming-quality",b=()=>{let e=document.querySelector(`[${h}]`),n=e.getAttribute(h),t=e.children[0];if(t!==null)switch(n){case"HI_RES":if(t.textContent==="MQA")return;t.textContent="MQA",t.style.backgroundColor=null,t.style.color=s[o.MQA].color;break;case"HI_RES_LOSSLESS":if(t.textContent==="HIRES")return;t.textContent="HI-RES",t.style.backgroundColor=null,t.style.color=s[o.HiRes].color;break;default:t.style.backgroundColor=null,t.style.color=null}};import{appendStyle as k}from"@neptune/utils";var y=`
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
`;var S=k(`
${y}
.quality-tag-container {
	display: inline-flex;
	height: 20px;
	font-size: 12px;
	line-height: 20px;
}
.quality-tag {
	justify-content: center;
	align-items: center;
	padding: 0 8px;
	border-radius: 6px;
	background-color: #222222;
	box-sizing: border-box;
	transition: background-color 0.2s;
	margin-left: 5px;
}

/* Toggle Switch Styles */
.switch {
	position: relative;
	display: inline-block;
	width: 60px;
	height: 34px;
}

.switch input {
	opacity: 0;
	width: 0;
	height: 0;
}

.slider {
	position: absolute;
	cursor: pointer;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: #ccc;
	transition: 0.4s;
	border-radius: 17px; /* Rounded corners */
}

.slider:before {
	position: absolute;
	content: "";
	height: 26px;
	width: 26px;
	left: 4px;
	bottom: 4px;
	background-color: white;
	transition: 0.4s;
	border-radius: 50%;  /* Fully rounded corners */
}

input:checked + .slider {
	background-color: #2196F3;
}

input:checked + .slider:before {
	transform: translateX(26px);
}
`);import{getState as I}from"@neptune/store";var x=e=>{if(e.length===0)return;let n=I().content.mediaItems;for(let{elem:t,attr:a}of e){let i=n.get(a)?.item?.mediaMetadata?.tags;if(i===void 0||i.length===1&&i[0]===o.High||t.querySelector(".quality-tag-container"))continue;let r=t.querySelector('[data-test="table-row-title"], [data-test="list-item-track"], [data-test="playqueue-item"]');if(r===null)continue;let g=r.getAttribute("data-test")==="playqueue-item",l=document.createElement("span");l.className="quality-tag-container",g&&i.includes(o.HiRes)&&(i=[o.HiRes]);for(let f of i){if(f===o.High)continue;let c=s[f];if(!c)continue;let u=document.createElement("span");u.className=c.className,u.textContent=c.textContent,u.style.color=c.color,l.appendChild(u)}g?r.insertBefore(l,r.lastElementChild):r.appendChild(l)}};import{html as E}from"@neptune/voby";import{storage as d}from"@plugin";d.showFLACInfo=!0;var w=()=>(setTimeout(()=>{let e=document.getElementById("flacInfoToggle");e.checked!==d.showFLACInfo&&(e.checked=d.showFLACInfo)}),E`<div class="settings-section">
		<h3 class="settings-header">Show FLAC Info</h3>
		<p class="settings-explainer">Toggle on to show Sample Rate/Bit Depth:</p>
		<label class="switch">
			<input type="checkbox" id="flacInfoToggle" onChange=${e=>d.showFLACInfo=e.target.checked} />
			<span class="slider" />
		</label>
	</div>`);var o={High:"LOSSLESS",MQA:"MQA",HiRes:"HIRES_LOSSLESS",Atmos:"DOLBY_ATMOS"},s={[o.MQA]:{className:"quality-tag",textContent:"MQA",color:"rgb(249, 186, 122)"},[o.HiRes]:{className:"quality-tag",textContent:"HiRes",color:"#ffd432"},[o.Atmos]:{className:"quality-tag",textContent:"Atmos",color:"#0052a3"}},A=e=>{let n=[],t=document.querySelectorAll(`[${e}]`);for(let a of t)n.push({elem:a,attr:a.getAttribute(e)});return n},q=T(["playbackControls/SET_PLAYBACK_STATE","playbackControls/MEDIA_PRODUCT_TRANSITION"],()=>setTimeout(b)),C=()=>{p.disconnect(),x([...A("data-track-id"),...A("data-track--content-id")]),p.observe(document.body,{childList:!0,subtree:!0})},m,Q=()=>{m===void 0&&C(),clearTimeout(m),m=setTimeout(()=>{C(),m=void 0},5)},p=new MutationObserver(Q);p.observe(document.body,{childList:!0,subtree:!0});var j=()=>{p.disconnect(),S(),q()};export{o as Quality,w as Settings,j as onUnload,s as tagData};
