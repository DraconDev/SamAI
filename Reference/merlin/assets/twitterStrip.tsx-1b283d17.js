import{j as p,r as E,P as x,S}from"./localStorage-70c0cae5.js";import{a as w}from"./client-4954293f.js";import{q as v,Q as g,a as C}from"./browserPolyfillWrapper-bb116cae.js";import{C as q,R}from"./reactQueryProviderExtension-4a0c189d.js";import{F as A}from"./index-f1987876.js";import{T as W}from"./themeContext-5e650432.js";import{c as P}from"./index-82b528a6.js";import{d as h}from"./debounce-c70d88e0.js";import{v as j}from"./IconCheck-e595c264.js";import"./persist-4b6dccac.js";import"./index-f3a3d194.js";import"./index-6f85b927.js";import"./backend-0efbfbef.js";import"./button-274f6d28.js";import"./useTranslation-24cdda08.js";import"./useSSE-f967edd7.js";import"./createReactComponent-640fc4e6.js";import"./motion-6c2f4b83.js";import"./index-9546331f.js";import"./analytics-910dabef.js";import"./index-eedd1636.js";import"./helper-0e21f9fb.js";import"./IconLoader-280e82e6.js";import"./index-602940e1.js";import"./foyerLogo-6509e919.js";import"./IconArrowLeft-27560546.js";import"./IconReload-8cc62b54.js";const F=async()=>{var a,c;const n=await v.fetchQuery(g.MerlinConfig);if(n&&!n.fabStrip.twitter.visible)return;const r=(c=(a=n.fabStrip)==null?void 0:a.twitter)==null?void 0:c.containerClassname,o=await O(r);o&&!o.querySelector("merlin-component")&&T(e=>o.insertBefore(e,o.firstChild.nextSibling));const s=new MutationObserver(h(()=>{try{const t=document.querySelector("[id^='typeaheadDropdownWrapped-']"),i=document.querySelector(".merlin.fabStrip");t?i&&(i.style.zIndex="0"):i.style.zIndex="1000"}catch{}const e=document.querySelectorAll(r||".css-175oi2r.r-1iusvr4.r-16y2uox.r-1777fci.r-1h8ys4a.r-1bylmt5.r-13tjlyg.r-7qyjyx.r-1ftll1t");if(e.length>0)for(let t=0;t<e.length;t++)e[t].querySelector("merlin-component")||T(i=>e[t].insertBefore(i,e[t].firstChild.nextSibling))},300)),l={childList:!0,subtree:!0};s.observe(document.body,l)},O=n=>new Promise(r=>{const o=new MutationObserver(h(()=>{const s=document.querySelector(n||".css-175oi2r.r-1iusvr4.r-16y2uox.r-1777fci.r-1h8ys4a.r-1bylmt5.r-13tjlyg.r-7qyjyx.r-1ftll1t");s&&(r(s),o.disconnect())},300));o.observe(document.body,{childList:!0,subtree:!0})}),T=async n=>{var b;const r=document.createElement("merlin-component");r.id="merlin-fabStrip",r.className="merlin fabStrip";const o=r.attachShadow({mode:"open"}),s=document.createElement("style");s.textContent=`${P}
    :host(.merlin.fabStrip) {
      all: initial; /* 1st rule so subsequent properties are reset. */
      position: relative;
      display: block;
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      z-index: 1000;
    }
    .fabStrip {
      all: initial; /* 1st rule so subsequent properties are reset. */
      position: relative;
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    .fabStrip ::-webkit-scrollbar {
      display: none;
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    `;const l=document.createElement("div");l.id="reactAppRoot",l.className="reactAppRoot fabStrip "+j(),o.appendChild(s),o.appendChild(l),n(r);const a={};let c=null,e=null,t=null,i=null,d=null,y="";try{if(e=r.closest('[data-testid="cellInnerDiv"], [aria-labelledby="modal-header"]'),e&&(d=e.querySelector("article"),d&&(c=d.querySelector('[data-testid="tweetText"]')),t=e.querySelector('[data-testid="attachments"]'),i=e.querySelector('article a div[dir="ltr"]')),c){const m=c.textContent;a.tweetText=m}i&&(y=i.textContent.trim(),a.postBy=y);try{if(t){const m=(b=t.textContent)==null?void 0:b.trim();m&&(a.quoteTweetText=m)}}catch{}}catch{}let u,f;d||t?(u=x.TWEET_REPLY,f=S.TWITTER.TWEET_REPLY):(u=x.TWEET,f=S.TWITTER.TWEET),w(l).render(p.jsx(I,{contextData:a,editor:r,mountOn:f,promptsFor:u}))};function I(n){var t,i;const{contextData:r,editor:o,mountOn:s,promptsFor:l}=n,[a,c]=E.useState("");return(i=(t=C().details)==null?void 0:t.twitter)!=null&&i.isEnabled?p.jsx(q,{children:p.jsx(R,{children:p.jsx(W,{overrideThemeForWebsite:!0,children:p.jsx(A,{contextData:r,dotMenuPosition:"top",editor:o,host:"twitter",mountOn:s,promptsFor:l,setTextareaValue:c,textareaValue:a})})})}):null}F();
