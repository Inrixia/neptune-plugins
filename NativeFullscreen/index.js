import{intercept as d}from"@neptune";import{html as g}from"@neptune/voby";import{storage as i}from"@plugin";var r=e=>{i.settings??={};for(let t of Object.keys(e))i.settings[t]??=e[t];return i.settings};import{html as p}from"@neptune/voby";import{html as a}from"@neptune/voby";var l=({children:e,tooltip:t})=>a`
	<div style="margin-bottom: 15px;display: flex;justify-content: space-between;align-items: center;" title="${t}">${e}</div>
`;var c=({checked:e,onClick:t,title:n,tooltip:m})=>(e??=!1,p`
		<${l} tooltip=${m}>
			<label for="switch-${n}" style="font-size: 1.2em;margin-bottom: 5px;">${n}</label>
			<input id="switch-${n}" class="neptune-switch-checkbox" type="checkbox" checked=${e} />
			<span onClick=${t} class="neptune-switch" />
		<//>
	`);var o=r({useTidalFullscreen:!1}),y=()=>g`<div>
	<${c} checked=${o.useTidalFullscreen} onClick=${()=>o.useTidalFullscreen=!o.useTidalFullscreen} title="Always use Tidal Fullscreen mode" />
</div>`;var s,f=d("view/FULLSCREEN_ALLOWED",()=>s||o.useTidalFullscreen?s=void 0:!0),S=d("view/REQUEST_FULLSCREEN",()=>{s=!0}),u=e=>{if(e.key==="F11"&&(e.preventDefault(),document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen(),!o.useTidalFullscreen&&!document.fullscreenElement)){let t=document.querySelector("div[class^='bar--']"),n=document.querySelector("div[class^='mainContainer--'] > div[class^='containerRow--']");t!==null&&n!==null&&(document.fullscreenElement?(n.style.maxHeight="",t.style.display="",document.body.removeAttribute("is-fullscreen")):(n.style.maxHeight="100%",t.style.display="none",document.body.setAttribute("is-fullscreen","")))}};window.addEventListener("keydown",u);var q=()=>{f(),S(),window.removeEventListener("keydown",u)};export{y as Settings,q as onUnload};
