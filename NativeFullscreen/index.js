import{intercept as c}from"@neptune";import{html as a}from"@neptune/voby";import{storage as s}from"@plugin";var i=e=>{s.settings??={};for(let t of Object.keys(e))s.settings[t]??=e[t];return s.settings};import{html as d}from"@neptune/voby";var l=({checked:e,onClick:t,title:n})=>(e??=!1,d`
		<div style="margin-bottom: 15px;display: flex;justify-content: space-between;">
			<label for="switch-${n}" style="font-size: 1.2em;margin-bottom: 5px;">${n}</label>
			<input id="switch-${n}" class="neptune-switch-checkbox" type="checkbox" checked=${e} />
			<span onClick=${t} class="neptune-switch" />
		</div>
	`);var o=i({useTidalFullscreen:!1}),m=()=>a`<div>
	<${l} checked=${o.useTidalFullscreen} onClick=${()=>o.useTidalFullscreen=!o.useTidalFullscreen} title="Always use Tidal Fullscreen mode" />
</div>`;var r,p=c("view/FULLSCREEN_ALLOWED",()=>r||o.useTidalFullscreen?r=void 0:!0),g=c("view/REQUEST_FULLSCREEN",()=>{r=!0}),u=e=>{if(e.key==="F11"&&(e.preventDefault(),document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen(),!o.useTidalFullscreen&&!document.fullscreenElement)){let t=document.querySelector("div[class^='bar--']"),n=document.querySelector("div[class^='mainContainer--'] > div[class^='containerRow--']");t!==null&&n!==null&&(document.fullscreenElement?(n.style.maxHeight="",t.style.display="",document.body.removeAttribute("is-fullscreen")):(n.style.maxHeight="100%",t.style.display="none",document.body.setAttribute("is-fullscreen","")))}};window.addEventListener("keydown",u);var $=()=>{p(),g(),window.removeEventListener("keydown",u)};export{m as Settings,$ as onUnload};
