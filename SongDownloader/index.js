var $=(n,e)=>{let t=document.getElementById(e);t||(t=document.createElement("style"),t.id=e,document.head.appendChild(t)),t.innerHTML=n};var oe=`
.context-button {
	align-items: center;
	display: flex;
	font-weight: 500;
	padding: 20px 16px;
	width: 100%;
	flex-grow: 1;
	color: #b878ff;
    position: relative;
}
.context-button:hover {
	background-color: #9e46ff;
	color: #fff;
}
.context-button::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: var(--progress, 0); /* Initially set to 0 */
    background: rgba(255, 255, 255, 0.25); /* Loading bar color */
    z-index: 1;
}
.context-button.loading {
    background-color: #9e46ff;
    cursor: not-allowed;
    color: #fff;
}
.context-button span {
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
`;$(oe,"neptune-downloader");import{actions as k}from"@neptune";var C=n=>{let e=a=>{let c=(...s)=>{a(n,...s)};return c.withContext=s=>(...d)=>{a(n,s,...d)},c},t=e(console.log),r=e(console.warn),o=e(console.error),i=(a,c,s)=>{let d=l=>{a(l),c({message:`${n} - ${l}`,category:"OTHER",severity:s})};return d.withContext=l=>{let h=a.withContext(l);return m=>{h(m),m instanceof Error&&(m=m.message),c({message:`${n}.${l} - ${m}`,category:"OTHER",severity:s})}},d};return{log:t,warn:r,err:o,msg:{log:i(t,k.message.messageInfo,"INFO"),warn:i(r,k.message.messageWarn,"WARN"),err:i(o,k.message.messageError,"ERROR")}}},p=C("[lib]");import{intercept as R}from"@neptune";import{store as F}from"@neptune";import{intercept as H}from"@neptune";var f=(n,e,t,{timeoutMs:r,cancel:o}={})=>{r??=5e3,o??=!1;let i,a,c=new Promise((h,m)=>{i=h,a=m}),s=H(e,h=>{if(i(h),o)return!0},!0),d=H(t,a,!0),l=setTimeout(()=>a(`${t}_TIMEOUT`),r);return n(),c.finally(()=>{clearTimeout(l),s(),d()})};import{store as ie}from"@neptune";var K=()=>ie.getState()?.playbackControls??{};var I=class{static _cache={};static current(e){if(e??=K()?.playbackContext,e?.actualProductId!==void 0)return this.ensure(e.actualProductId)}static async ensure(e){if(e===void 0)return;let t=this._cache[e];if(t!==void 0)return t;let r=F.getState().content.mediaItems;for(let o in r){let i=r[o]?.item;i?.contentType==="track"&&(this._cache[o]=i)}if(this._cache[e]===void 0){let o=window.location.pathname;await f(()=>neptune.actions.router.replace(`/track/${e}`),["page/IS_DONE_LOADING"],[]),neptune.actions.router.replace(o);let a=F.getState().content.mediaItems[+e]?.item;a?.contentType==="track"&&(this._cache[e]=a)}return this._cache[e]}};import{actions as G,store as he}from"@neptune";var M=(n,e)=>e.some(t=>n instanceof t),V,N;function ae(){return V||(V=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function se(){return N||(N=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}var D=new WeakMap,L=new WeakMap,b=new WeakMap;function ce(n){let e=new Promise((t,r)=>{let o=()=>{n.removeEventListener("success",i),n.removeEventListener("error",a)},i=()=>{t(y(n.result)),o()},a=()=>{r(n.error),o()};n.addEventListener("success",i),n.addEventListener("error",a)});return b.set(e,n),e}function de(n){if(D.has(n))return;let e=new Promise((t,r)=>{let o=()=>{n.removeEventListener("complete",i),n.removeEventListener("error",a),n.removeEventListener("abort",a)},i=()=>{t(),o()},a=()=>{r(n.error||new DOMException("AbortError","AbortError")),o()};n.addEventListener("complete",i),n.addEventListener("error",a),n.addEventListener("abort",a)});D.set(n,e)}var _={get(n,e,t){if(n instanceof IDBTransaction){if(e==="done")return D.get(n);if(e==="store")return t.objectStoreNames[1]?void 0:t.objectStore(t.objectStoreNames[0])}return y(n[e])},set(n,e,t){return n[e]=t,!0},has(n,e){return n instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in n}};function U(n){_=n(_)}function ue(n){return se().includes(n)?function(...e){return n.apply(B(this),e),y(this.request)}:function(...e){return y(n.apply(B(this),e))}}function le(n){return typeof n=="function"?ue(n):(n instanceof IDBTransaction&&de(n),M(n,ae())?new Proxy(n,_):n)}function y(n){if(n instanceof IDBRequest)return ce(n);if(L.has(n))return L.get(n);let e=le(n);return e!==n&&(L.set(n,e),b.set(e,n)),e}var B=n=>b.get(n);function Q(n,e,{blocked:t,upgrade:r,blocking:o,terminated:i}={}){let a=indexedDB.open(n,e),c=y(a);return r&&a.addEventListener("upgradeneeded",s=>{r(y(a.result),s.oldVersion,s.newVersion,y(a.transaction),s)}),t&&a.addEventListener("blocked",s=>t(s.oldVersion,s.newVersion,s)),c.then(s=>{i&&s.addEventListener("close",()=>i()),o&&s.addEventListener("versionchange",d=>o(d.oldVersion,d.newVersion,d))}).catch(()=>{}),c}var me=["get","getKey","getAll","getAllKeys","count"],pe=["put","add","delete","clear"],v=new Map;function j(n,e){if(!(n instanceof IDBDatabase&&!(e in n)&&typeof e=="string"))return;if(v.get(e))return v.get(e);let t=e.replace(/FromIndex$/,""),r=e!==t,o=pe.includes(t);if(!(t in(r?IDBIndex:IDBObjectStore).prototype)||!(o||me.includes(t)))return;let i=async function(a,...c){let s=this.transaction(a,o?"readwrite":"readonly"),d=s.store;return r&&(d=d.index(c.shift())),(await Promise.all([d[t](...c),o&&s.done]))[0]};return v.set(e,i),i}U(n=>({...n,get:(e,t,r)=>j(e,t)||n.get(e,t,r),has:(e,t)=>!!j(e,t)||n.has(e,t)}));var fe=["continue","continuePrimaryKey","advance"],W={},O=new WeakMap,Y=new WeakMap,ye={get(n,e){if(!fe.includes(e))return n[e];let t=W[e];return t||(t=W[e]=function(...r){O.set(this,Y.get(this)[e](...r))}),t}};async function*ge(...n){let e=this;if(e instanceof IDBCursor||(e=await e.openCursor(...n)),!e)return;e=e;let t=new Proxy(e,ye);for(Y.set(t,e),b.set(t,B(e));e;)yield t,e=await(O.get(t)||e.continue()),O.delete(t)}function q(n,e){return e===Symbol.asyncIterator&&M(n,[IDBIndex,IDBObjectStore,IDBCursor])||e==="iterate"&&M(n,[IDBIndex,IDBObjectStore])}U(n=>({...n,get(e,t,r){return q(e,t)?ge:n.get(e,t,r)},has(e,t){return q(e,t)||n.has(e,t)}}));var T=class{constructor(e){this.avalibleSlots=e}queued=[];async obtain(){return this.avalibleSlots>0?this.avalibleSlots--:new Promise(e=>this.queued.push(()=>e(this.avalibleSlots--)))}release(){this.avalibleSlots++,this.queued.shift()?.()}};var z="@inrixia/sharedStorage",u=class n{constructor(e,t){this.storeName=e;n.openDB(e,t)}static db;static openSema=new T(1);static async openDB(e,t){await this.openSema.obtain();try{let r=i=>async()=>{await i.close(),this.openDB(e,t)};this.db=Q(z).then(async i=>(i.addEventListener("versionchange",r(i)),i.objectStoreNames.contains(e)?i:(await i.close(),Q(z,i.version+1,{blocking:r(i),upgrade(a){a.createObjectStore(e,t)}}))));let o=await this.db;o.addEventListener("versionchange",r(o))}finally{this.openSema.release()}}static close(){return this.db?.then(e=>e.close())}add(e,t){return n.db.then(r=>r.add(this.storeName,e,t))}clear(){return n.db.then(e=>e.clear(this.storeName))}count(e){return n.db.then(t=>t.count(this.storeName,e))}delete(e){return n.db.then(t=>t.delete(this.storeName,e))}get(e){return n.db.then(t=>t.get(this.storeName,e))}getAll(e,t){return n.db.then(r=>r.getAll(this.storeName,e,t))}getAllKeys(e,t){return n.db.then(r=>r.getAllKeys(this.storeName,e,t))}getKey(e){return n.db.then(t=>t.getKey(this.storeName,e))}put(e,t){return n.db.then(r=>r.put(this.storeName,e,t))}};var We=1e3*60*60*24,w=class{static _cache={};static _trackItemsCache=new u("AlbumCache.trackItems",{keyPath:"albumId"});static async get(e){if(e===void 0)return;let t=this._cache[e];if(t!==void 0)return t;let r=he.getState().content.albums;for(let o in r)this._cache[o]=r[o];if(this._cache[e]===void 0){let o=await f(()=>G.content.loadAlbum({albumId:e}),["content/LOAD_ALBUM_SUCCESS"],[]).then(i=>i?.[0].album).catch(p.warn.withContext("AlbumCache.get"));o!==void 0&&(this._cache[e]=o)}return this._cache[e]}static async getTrackItems(e){if(e===void 0)return;let t=await this._trackItemsCache.get(e),r=this.updateTrackItems(e);return t?.trackItems!==void 0?t.trackItems:r}static async updateTrackItems(e){let t=await f(()=>G.content.loadAllAlbumMediaItems({albumId:e}),["content/LOAD_ALL_ALBUM_MEDIA_ITEMS_SUCCESS"],["content/LOAD_ALL_ALBUM_MEDIA_ITEMS_FAIL"],{timeoutMs:2e3}).catch(p.warn.withContext("PlaylistCache.getTrackItems.interceptPromise"));if(t?.[0]?.mediaItems===void 0)return(await this._trackItemsCache.get(e))?.trackItems;let r=Array.from((t?.[0]?.mediaItems).map(o=>o?.item).filter(o=>o?.contentType==="track"));return await this._trackItemsCache.put({albumId:e,trackItems:r}),r}};import{actions as Ie}from"@neptune";var S=class extends u{maxAge;constructor(e,t){let{maxAge:r,storeSchema:o}=t??{};super(e,o),this.maxAge=r}setExpires(e,t){if(t!==void 0)e.__expires=t;else if(this.maxAge!==void 0)e.__expires=Date.now()+this.maxAge;else throw new Error("maxAge or expires must be set!")}clearExpires(e){delete e.__expires}isTooOld(e){return e?.__expires===void 0?!0:Date.now()>e.__expires}async add(e,t){return this.setExpires(e),super.add(e,t)}async put(e,t){return this.setExpires(e),super.put(e,t)}async addExpires(e,t,r){return this.setExpires(e,t),super.add(e,r)}async putExpires(e,t,r){return this.setExpires(e,t),super.put(e,r)}async get(e){let t=await super.get(e);if(!this.isTooOld(t))return this.clearExpires(t),t}async getWithExpiry(e){let t=await super.get(e);if(t===void 0)return{value:void 0,expires:void 0,expired:void 0};let r=t.__expires,o=this.isTooOld(t);return this.clearExpires(t),{value:t,expires:r,expired:o}}async getAll(e,t){return(await super.getAll(e,t)).filter(this.isTooOld.bind(this)).map(this.clearExpires.bind(this))}};var A=class{static _trackItemsCache=new S("PlaylistCache.trackItems",{maxAge:3e4,storeSchema:{keyPath:"playlistUUID"}});static async getTrackItems(e){if(e===void 0)return;let t=await this._trackItemsCache.get(e),r=this.updateTrackItems(e);return t?.trackItems!==void 0?t.trackItems:r}static async updateTrackItems(e){let t=await f(()=>Ie.content.loadListItemsPage({loadAll:!0,listName:`playlists/${e}`,listType:"mediaItems"}),["content/LOAD_LIST_ITEMS_PAGE_SUCCESS"],["content/LOAD_LIST_ITEMS_PAGE_FAIL"],{timeoutMs:2e3}).catch(p.warn.withContext("PlaylistCache.getTrackItems.interceptPromise"));if(t?.[0]?.items===void 0)return(await this._trackItemsCache.get(e))?.trackItems;let r=Array.from((t?.[0]?.items).map(o=>o?.item).filter(o=>o?.contentType==="track"));return await this._trackItemsCache.put({playlistUUID:e,trackItems:r}),r}};var g=class n{static _albumsCache={};static _playlistsCache={};static _intercepts=[R(["contextMenu/OPEN_MEDIA_ITEM"],([e])=>{(async()=>this._onOpen({type:"TRACK"},await this.getTrackItems([e.id])))()}),R(["contextMenu/OPEN_MULTI_MEDIA_ITEM"],([e])=>{(async()=>this._onOpen({type:"TRACK"},await this.getTrackItems(e.ids)))()}),R("contextMenu/OPEN",([e])=>{switch(e.type){case"ALBUM":{w.getTrackItems(e.id).then(t=>{t!==void 0&&this._onOpen({type:"ALBUM",albumId:e.id},t)});break}case"PLAYLIST":{A.getTrackItems(e.id).then(t=>{t!==void 0&&this._onOpen({type:"PLAYLIST",playlistId:e.id},t)});break}}})];static async getTrackItems(e){return(await Promise.all(e.map(I.ensure.bind(I)))).filter(r=>r!==void 0)}static _onOpen(e,t){setTimeout(async()=>{let r=0,o=document.querySelector('[data-type="list-container__context-menu"]');for(;o===null&&r<50;)await new Promise(i=>setTimeout(i,50)),o=document.querySelector('[data-type="list-container__context-menu"]');if(o!==null)for(let i of this._listeners)i(e,o,t).catch(p.err.withContext("ContextMenu.listener"))})}static _listeners=[];static onOpen(e){n._listeners.push(e)}static onUnload(){this._intercepts.forEach(e=>e())}};var J=async()=>{await u.close(),await g.onUnload()};import{html as be}from"@neptune/voby";import{storage as X}from"@plugin";var Z=n=>X.settings??(X.settings=n);var P=(i=>(i.HiRes="HI_RES_LOSSLESS",i.MQA="HI_RES",i.High="LOSSLESS",i.Low="HIGH",i.Lowest="LOW",i))(P||{});var mt=Object.values(P),ee=["HI_RES_LOSSLESS","LOSSLESS","HIGH","LOW"],pt=Object.fromEntries(Object.entries(P).map(([n,e])=>[e,n]));import{html as te}from"@neptune/voby";var ne=({selected:n,onSelect:e,options:t,title:r})=>te`
		<div style="margin-bottom: 15px;display: flex;justify-content: space-between;align-items: center;">
			<label for="dropdown-${r}" style="font-size: 1.2em;margin-right: 10px;">${r}</label>
			<select id="dropdown-${r}" value=${n} onChange=${i=>e?.(i.target.value)} style="flex-grow: 1; max-width: 180px;">
				${t.map(i=>te`<option value=${i} selected=${i===n}>${i}</option>`)}
			</select>
		</div>
	`;import{html as xe}from"@neptune/voby";var re=({text:n,onText:e,title:t})=>xe`
		<div style="margin-bottom: 15px;display: flex;justify-content: space-between;align-items: center;">
			<label for="text-${t}" style="font-size: 1.2em;margin-right: 16px;">${t}</label>
			<input id="text-${t}" value=${n} onChange=${o=>e?.(o.target.value)} style="flex-grow: 1;" />
		</div>
	`;var E=Z({desiredDownloadQuality:"HI_RES_LOSSLESS",defaultDownloadPath:""}),Te=()=>be`<div>
	<${ne}
		selected=${E.desiredDownloadQuality}
		onSelect=${n=>E.desiredDownloadQuality=n}
		options=${ee}
		title="Download Quality"
	/>
	<${re} text=${E.defaultDownloadPath} onText=${n=>E.defaultDownloadPath=n} title="Download Path" />
	Specifying download path to save to will disable download prompt and save all files to the specified path.
</div>`;var Ct=C("[SongDownloader]"),x={},we=n=>({prep:()=>{let e=x[n];e.disabled=!0,e.classList.add("loading"),e.textContent="Fetching Meta..."},onProgress:({total:e,downloaded:t,percent:r})=>{let o=x[n];o.style.setProperty("--progress",`${r}%`);let i=(t/1048576).toFixed(0),a=(e/1048576).toFixed(0);o.textContent=`Downloading... ${i}/${a}MB ${r.toFixed(0)}%`},clear:()=>{let e=x[n];e.classList.remove("loading"),e.disabled=!1,e.style.removeProperty("--progress"),e.textContent="Download"}}),Mt=J;g.onOpen(async(n,e,t)=>{if(document.getElementById("download-button")?.remove(),t.length===0)return;let r=document.createElement("button");r.type="button",r.role="menuitem",r.textContent=`Download ${t.length}`,r.id="download-button",r.className="context-button";let o=JSON.stringify(t.map(s=>s.id).sort());x[o]?.disabled===!0&&(r.disabled=!0,r.classList.add("loading")),x[o]=r;let{prep:i,onProgress:a,clear:c}=we(o);r.addEventListener("click",async()=>{if(o!==void 0){i();for(let s of t)s.id;c()}}),e.appendChild(r)});export{Te as Settings,Mt as onUnload};
