import{r as l,j as e,a as u}from"./localStorage-70c0cae5.js";import{a as m}from"./client-4954293f.js";import{u as p,q as y,Q as f,a as b}from"./browserPolyfillWrapper-bb116cae.js";import{C as g,R as w}from"./reactQueryProviderExtension-4a0c189d.js";import{c as T}from"./index-f3a3d194.js";import{F as h}from"./foyerLogo-6509e919.js";import{a as x}from"./utils-9bb6629d.js";import{o as v}from"./index-eedd1636.js";import{c as E,T as M,a as S,b as _,s as C,e as j,P as c,Y as A}from"./tooltip-d01590d2.js";import{B as N}from"./button-274f6d28.js";import{u as R}from"./useTranslation-24cdda08.js";import{C as B}from"./index-82f4bfa1.js";import{c as L}from"./index-82b528a6.js";import"./persist-4b6dccac.js";import"./types-ad7f11a6.js";import"./index-6e4841df.js";function F(){const{t:n}=R(),t=x(),o=p(),[s,r]=l.useState({adsState:!1,queryCost:0,tweetifyQueryCost:0}),i=a=>{if(a.preventDefault(),!o.isAuthenticated){v(u);return}C({action:j.HANDLE_SUMMARIZE_FROM_MID_BUTTON,type:c.FROM_TWEETIFY_MID_BUTTONS})};return l.useEffect(()=>{function a(d){d.data.type===c.FROM_YT_SUMMARIZER&&d.data.action==A.UPDATE_COST_AND_ADS_STATE&&r(d.data.context)}return window.addEventListener("message",a),()=>window.removeEventListener("message",a)},[]),e.jsx(l.Fragment,{children:e.jsx(E,{children:e.jsxs(M,{children:[e.jsx(S,{children:e.jsx("div",{className:"w-fit rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-[1px]",children:e.jsxs(N,{className:T("gap-2 rounded-full border !border-none border-purple-500 hover:bg-secondary",t==="dark"&&"dark"),size:"sm",variant:"secondary",type:"button",onClick:i,children:[e.jsx("div",{className:"size-4",children:e.jsx(h,{})}),o.isAuthenticated?"Summarize":e.jsx(e.Fragment,{children:o.isLoading?"Logging in...":"Login"})]})})}),e.jsx(_,{className:"max-w-32 rounded-lg border border-muted-foreground/20 text-center",sideOffset:8,children:s.adsState?n("yt_lib.wait_ad"):`${n("yt_lib.will_use")} ${s.queryCost??4} ${o.isTeams?n("yt_lib.words"):n("yt_lib.free_summ")}`})]})})})}function I(){var t,o;return(o=(t=b().details)==null?void 0:t.youtube)!=null&&o.isEnabled?e.jsx(g,{children:e.jsx(w,{children:e.jsx(B,{children:e.jsx(F,{})})})}):null}function O(){return new Promise(n=>{const t=new MutationObserver(()=>{const s=document.querySelector("ytd-menu-renderer[class='style-scope ytd-watch-metadata'] div#top-level-buttons-computed.top-level-buttons.style-scope.ytd-menu-renderer");s&&(n(s),t.disconnect())}),o=document.getElementById("page-manager");t.observe(o,{childList:!0,subtree:!0})})}const P=async n=>{const t=document.createElement("merlin-component");t.id="merlin-tweetify-buttons",t.className="merlin tweetify-buttons";const o=t.attachShadow({mode:"open"}),s=document.createElement("style");s.textContent=`${L}
:host(#merlin-tweetify-buttons) {
    all: initial; /* 1st rule so subsequent properties are reset. */
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}
.ytTweetifyButtonsAppRoot {
    z-index: 1 !important;
    display: inline-block;
  vertical-align: middle;
  margin-left: 8px; 
	font-family:
		"DM Sans Merlin",
		system-ui,
		-apple-system,
		BlinkMacSystemFont,
		Ubuntu,
		sans-serif !important;
}
}
`;const r=document.createElement("div");r.id="ytTweetifyButtonsAppRoot",r.className="ytTweetifyButtonsAppRoot",o.appendChild(s),o.appendChild(r),n(t),m(r).render(e.jsx(I,{}))},U=async()=>{if(document.getElementById("merlin-tweetify-buttons"))return;const n=await y.fetchQuery(f.MerlinConfig);if(!(n&&!n.tweetify.visible)&&(await O(),document.body)){const t=new MutationObserver(()=>{const s=document.querySelectorAll("ytd-menu-renderer[class='style-scope ytd-watch-metadata'] div#top-level-buttons-computed.top-level-buttons.style-scope.ytd-menu-renderer");if(s.length>0)for(let r=0;r<s.length;r++)s[r].nextElementSibling.id!=="merlin-tweetify-buttons"&&(P(i=>s[r].insertAdjacentElement("beforeend",i)),t.disconnect())}),o=document.querySelector("ytd-menu-renderer[class='style-scope ytd-watch-metadata'] div#top-level-buttons-computed.top-level-buttons.style-scope.ytd-menu-renderer");o?t.observe(o,{attributes:!0,childList:!0,subtree:!0}):console.warn("Target node for observation not found")}};U();
