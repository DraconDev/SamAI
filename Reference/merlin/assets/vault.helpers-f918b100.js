import{d as L,Q as $}from"./browserPolyfillWrapper-bb116cae.js";import{f as E}from"./analytics-910dabef.js";const S='<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bookmark-plus"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/><line x1="12" x2="12" y1="7" y2="13"/><line x1="15" x2="9" y1="10" y2="10"/></svg>',N='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',A=`
	.merlin-image-wrapper {
		position: relative !important;
		display: inline-block !important;
		color-scheme: light !important;
	}

	.merlin-image-overlay {
		position: fixed;
		display: none;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		background: rgba(255, 255, 255, 0.9);
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 8px;
		cursor: pointer;
		opacity: 0;
		transition: opacity 0.2s ease-in-out;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		z-index: 2147483647;
		will-change: opacity;
	}

	.merlin-image-overlay:hover {
		background: rgba(255, 255, 255, 1);
		border-color: rgba(0, 0, 0, 0.2);
	}

	.merlin-image-overlay.visible {
		opacity: 1;
	}

	.merlin-image-overlay .close-button {
		position: absolute;
		top: -6px;
		right: -6px;
		width: 16px;
		height: 16px;
		background: #fff;
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 50%;
		display: none;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
	}

	.merlin-image-overlay:hover .close-button {
		display: flex;
	}

	.merlin-image-overlay svg {
		width: 20px;
		height: 20px;
		color: #000;
	}

	.merlin-image-overlay .close-button svg {
		width: 12px;
		height: 12px;
		color: #6B7280;
	}
`,F=`
	.merlin-image-container {
		position: relative !important;
		display: inline-block !important;
	}

	.merlin-image-overlay {
		position: absolute !important;
		top: 8px !important;
		right: 8px !important;
		background: rgba(255, 255, 255, 0.9) !important;
		border: none !important;
		border-radius: 6px !important;
		padding: 6px !important;
		cursor: pointer !important;
		opacity: 0 !important;
		transition: opacity 0.2s, transform 0.2s !important;
		display: flex !important;
		align-items: center !important;
		gap: 4px !important;
		justify-content: center !important;
		box-shadow: 0 2px 5px rgba(0,0,0,0.1) !important;
		color: #1e293b !important;
		transform: scale(0.95) !important;
	}

	.merlin-image-overlay:hover {
		background: rgba(255, 255, 255, 1) !important;
			}

	.merlin-image-overlay .close-icon {
		position: absolute !important;
		left: -16px !important;
		top: -16px !important;
		height: 20px !important;
		width: 20px !important;
		border-radius: 9999px !important;
		background: white !important;
		z-index: 2147483646 !important;
		padding: 4px !important;
		opacity: 0 !important;
		transition: opacity 0.2s !important;
		box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
		z-index: 2147483647 !important;
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
	}

	.merlin-image-overlay .close-icon:hover {
		background: #f9fafb !important;
	}

	.merlin-image-overlay.visible {
		opacity: 1 !important;
		transform: scale(1) !important;
	}

	.merlin-image-overlay.visible .close-icon {
		opacity: 1 !important;
	}

	img[data-merlin-processed]:hover ~ .merlin-image-overlay,
	.merlin-image-overlay:hover {
		opacity: 1 !important;
		transform: scale(1) !important;
	}

	img[data-merlin-processed]:hover ~ .merlin-image-overlay .close-icon,
	.merlin-image-overlay:hover .close-icon {
		opacity: 1 !important;
	}
`;function B(t,e,r){window.postMessage({data:{content:t,showPopup:!0,type:e,x:window.innerWidth/2-200,y:window.scrollY+100},from:"saveButton"},"*"),E({eventData:{source:r,type:e},eventName:"SaveToVault",eventType:"Button",feature:"Vault",firedFromFile:"features/vault/index.tsx"})}function M(){const t=window.getSelection();if(!t)return[];const e=[];if(!t||t.rangeCount===0)return e;for(const r of t.getRangeAt(0).cloneContents().querySelectorAll("a"))e.push(r.href);return e.map(r=>r.startsWith("http")?r:`https://${r}`)}function U(){const t=window.getSelection(),e=[];if(!t||t.rangeCount===0)return e;for(const r of t.getRangeAt(0).cloneContents().querySelectorAll("img")){const n=r.src;let a="";try{const p=new URL(n).pathname.split("/"),d=p[p.length-1];d&&/\.(jpg|jpeg|png|gif|webp)$/i.test(d)&&(a=d)}catch{a="image.jpg"}e.push({alt:r.alt||"image",name:a,src:n})}return e.map(r=>({...r,src:r.src.startsWith("http")?r.src:`https://${r.src}`}))}function V(t){try{const e=new URL(t);let r=e.hostname+e.pathname;return r=r.replace(/\/$/,""),e.search&&(r+=e.search),r}catch{return t}}function C(t){let e=0;return t.forEach(r=>{r.selected&&(r.type==="text"||r.type==="markdown"?e+=r.content.length:r.type==="image"?e+=100*1024:r.type==="link"&&(e+=r.content.length+100))}),e<1024?`${e}B`:e<1024*1024?`${(e/1024).toFixed(1)}KB`:`${(e/(1024*1024)).toFixed(1)}MB`}function j(t){var a;let e=0,r=t.parentElement;for(;r&&["ul","ol"].includes(r.tagName.toLowerCase());)e++,r=r.parentElement;return{bullet:((a=t.parentElement)==null?void 0:a.tagName.toLowerCase())==="ol"?"1. ":"- ",indent:"  ".repeat(Math.max(0,e-1))}}function k(t){var l,p,d,g,f;if(t.nodeType===Node.TEXT_NODE)return((l=t.textContent)==null?void 0:l.replace(/\n\s*/g," ").replace(/\s+/g," "))||"";if(t.nodeType!==Node.ELEMENT_NODE)return"";const e=t;if(typeof e.className=="string"&&(e.className.includes("mw-parser-output")||e.className.includes("plainlist")||e.className.includes("reference")||e.className.includes("mw-editsection")))return Array.from(e.childNodes).map(u=>k(u)).join("");if(((p=e.tagName)==null?void 0:p.toLowerCase())==="img"||((d=e.tagName)==null?void 0:d.toLowerCase())==="script"||((g=e.tagName)==null?void 0:g.toLowerCase())==="style")return"";const n=Array.from(e.childNodes).map(u=>k(u)).join("").trim();let a="";switch((f=e.tagName)==null?void 0:f.toLowerCase()){case"style":a="";break;case"p":a=n?`

${n}

`:"";break;case"br":a=`
`;break;case"h1":case"h2":case"h3":case"h4":case"h5":case"h6":a=n?`

${n}

`:"";break;case"strong":case"b":a=n?`**${n}**`:"";break;case"em":case"i":a=n?`*${n}*`:"";break;case"a":{const u=e.href;!u||u==="#"||u.startsWith("javascript:")?a=n:a=n?`[${n}](${u})`:"";break}case"ul":case"ol":a=n?`
${n}
`:"";break;case"li":{const{bullet:u,indent:w}=j(e);a=n?`${w}${u}${n}
`:"";break}case"blockquote":a=n?`
> ${n}
`:"";break;case"code":a=n?`\`${n}\``:"";break;case"pre":a=n?`
\`\`\`
${n}
\`\`\`
`:"";break;default:a=n}return a.replace(/\n{3,}/g,`

`).replace(/^\s+|\s+$/g,"").replace(/\s+/g," ").replace(/\n\s+/g,`
`)}function R(){return L($.ProjectList)}function z(t,e,r){if(r!=null&&r.name)return r.name;if(e==="link")try{const a=new URL(t),l=a.hostname.replace(/^www\./,""),p=a.pathname.split("/")[1]||"";return`${`${l}-${p||"link"}`.replace(/[^a-zA-Z0-9-]/g,"-")}.url`}catch{return`link-${Date.now()}.url`}if(e==="image"&&(r!=null&&r.src))try{const l=new URL(r.src).pathname.split("/"),p=l[l.length-1];return p&&/\.(jpg|jpeg|png|gif|webp)$/i.test(p)?p:`image-${Date.now()}.jpg`}catch{return`image-${Date.now()}.jpg`}const n=t.slice(0,30).replace(/[^a-zA-Z0-9\s-]/g,"").trim().replace(/\s+/g,"-").toLowerCase();return e==="text"?`${n}.txt`:`${n}.md`}function _(t){const e=Array.from(new Set(t.map(n=>n.type))),r=[];return e.includes("text")&&r.push("text"),e.includes("markdown")&&r.push("markdown"),e.includes("link")&&r.push("link"),e.includes("image")&&r.push("image"),r}function T(t){return t?3:5}function P(t,e){return((t==null?void 0:t.filter(n=>n.selected).length)||0)>=T(e)}function D(t){const e=Object.values(t),r=e.filter(l=>l.status==="completed").length,n=e.filter(l=>l.status==="failed").length,a=e.length;return a===0?"":`${r}/${a} files uploaded${n>0?`, ${n} failed`:""}`}function W(t){const e=Object.values(t);if(e.length===0)return 0;const r=e.reduce((n,a)=>a.status==="completed"?n+100:a.status==="failed"?n+0:n+(a.progress||0),0);return Math.round(r/e.length)}function Y(t){return{approxSize:C(t??[]),images:(t==null?void 0:t.filter(e=>e.type==="image"&&e.selected).length)??0,links:(t==null?void 0:t.filter(e=>e.type==="link"&&e.selected).length)??0,markdown:(t==null?void 0:t.filter(e=>e.type==="markdown"&&e.selected).length)??0,text:(t==null?void 0:t.filter(e=>e.type==="text"&&e.selected).length)??0}}function q(t,e){try{let r=function(){var s;if(o)return o;o=document.createElement("button"),o.className="merlin-image-overlay",o.setAttribute("aria-label","Save image to vault"),o.setAttribute("role","button"),o.innerHTML=`
				${S}
				<div class="close-button">
					${N}
				</div>
			`,(s=m==null?void 0:m.shadowRoot)==null||s.appendChild(o);const i=o.querySelector(".close-button");return i==null||i.addEventListener("click",c=>{c.stopPropagation(),u()}),o.addEventListener("click",d),o.addEventListener("mouseenter",()=>{o&&o.classList.add("visible")}),o.addEventListener("mouseleave",()=>{o&&o.classList.remove("visible")}),o},n=function(){if(!t.isConnected){u();return}const i=t.getBoundingClientRect();if(i.top>=-i.height&&i.left>=-i.width&&i.bottom<=window.innerHeight+i.height&&i.right<=window.innerWidth+i.width){const c=r();c.style.transform="translate3d(0,0,0)",c.style.position="fixed",c.style.top=`${i.top+8}px`,c.style.left=`${i.right-36-8}px`,c.style.display="flex"}else o&&(o.style.display="none")},a=function(){v&&(n(),h=requestAnimationFrame(a))},l=function(){v||(v=!0,h=requestAnimationFrame(a))},p=function(){v=!1,h!==null&&(cancelAnimationFrame(h),h=null)},d=function(i){if(i.preventDefault(),i.stopPropagation(),!o)return;o.style.opacity="0.7",setTimeout(()=>{o&&(o.style.opacity="1")},100);const c={data:{content:t.src.replace(/\.webp$/i,".png"),showPopup:!0,type:"image",x:window.innerWidth/2-200,y:window.scrollY+100},from:"saveButton"};window.postMessage(c,"*"),E({eventData:{source:window.location.href,type:"image"},eventName:"SaveToVault",eventType:"Button",feature:"MerlinVault",firedFromFile:"contents/vault.tsx"})},g=function(){o==null||o.classList.add("visible")},f=function(i){if(!o)return;const s=o.getBoundingClientRect();i.clientX>=s.left&&i.clientX<=s.right&&i.clientY>=s.top&&i.clientY<=s.bottom||o.classList.remove("visible")},u=function(){p(),b.forEach(i=>{window.removeEventListener(i,l),window.removeEventListener(i+"end",p)}),["load","transitionend","animationend"].forEach(i=>{window.removeEventListener(i,n)}),y.disconnect(),x.disconnect(),t.removeEventListener("mouseenter",g),t.removeEventListener("mouseleave",f),t.removeAttribute("data-merlin-processed"),o&&(o.remove(),o=null)};if(!t.isConnected||!t.width||!t.height||t.width<100||t.height<100||!(window.location.hostname.includes("google")&&(window.location.pathname.includes("/search")||window.location.pathname.includes("/images")))&&t.src.startsWith("data:"))return;t.setAttribute("data-merlin-processed","true");let m=document.getElementById("merlin-overlay-container");if(!m){m=document.createElement("div"),m.id="merlin-overlay-container",document.body.appendChild(m);const i=m.attachShadow({mode:"open"}),s=document.createElement("style");s.textContent=A,i.appendChild(s)}let o=null,v=!1,h=null;const b=["scroll","resize"];b.forEach(i=>{window.addEventListener(i,l,{passive:!0}),window.addEventListener(i+"end",p,{passive:!0})}),["load","transitionend","animationend"].forEach(i=>{window.addEventListener(i,n,{passive:!0})}),n();const y=new IntersectionObserver(i=>{i.forEach(s=>{s.target===t&&(s.isIntersecting?(n(),l()):(p(),o&&(o.remove(),o=null)))})},{root:null,rootMargin:"50px",threshold:0});y.observe(t);const x=new MutationObserver(i=>{let s=!1;i.forEach(c=>{(c.target===t||t.contains(c.target)||c.target.contains(t))&&(s=!0),c.type==="attributes"&&(c.attributeName==="style"||c.attributeName==="class"||c.attributeName==="src")&&(s=!0)}),s&&o&&n()});x.observe(document.body,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["style","class","src"]}),t.addEventListener("mouseenter",g),t.addEventListener("mouseleave",f),e.push(u)}catch(r){console.error("[processImage] Error processing image:",r)}}export{F as I,U as a,_ as b,Y as c,T as d,M as e,V as f,z as g,D as h,W as i,P as j,k,q as p,B as s,R as u};
