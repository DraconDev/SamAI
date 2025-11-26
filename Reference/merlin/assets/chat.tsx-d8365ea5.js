import{i as n,j as t}from"./localStorage-70c0cae5.js";import{a as p}from"./client-4954293f.js";import{C as c}from"./index-82f4bfa1.js";import{M as d}from"./select-456431be.js";import{T as l}from"./themeContext-5e650432.js";import{c as h,a as x,b as u,d as f,e as C}from"./chatIframe-a17298e1.js";import{m as g}from"./index-eedd1636.js";/* empty css             */import"./i18n-bc409d68.js";import{q as j,Q as v}from"./browserPolyfillWrapper-bb116cae.js";import{C as E,R}from"./reactQueryProviderExtension-4a0c189d.js";import{c as P}from"./index-82b528a6.js";import"./index-6e4841df.js";import"./button-274f6d28.js";import"./IconCheck-e595c264.js";import"./createReactComponent-640fc4e6.js";import"./index-e4326246.js";import"./analytics-910dabef.js";import"./index-f3a3d194.js";import"./merlin-logo-4543e454.js";import"./helper-0e21f9fb.js";import"./motion-6c2f4b83.js";import"./useTranslation-24cdda08.js";import"./IconLoader-280e82e6.js";import"./webAccess-4d0d2b1d.js";import"./backend-0efbfbef.js";import"./persist-4b6dccac.js";import"./useSSE-f967edd7.js";import"./debounce-c70d88e0.js";import"./utils-9bb6629d.js";import"./types-ad7f11a6.js";import"./tooltip-d01590d2.js";import"./accordion-25b76479.js";import"./IconArrowUpRight-b5286921.js";import"./IconArrowLeft-27560546.js";function T(){return t.jsx(E,{children:t.jsx(R,{children:t.jsx(c,{children:t.jsx(l,{children:t.jsx(d,{children:t.jsx(u,{children:t.jsx(f,{children:t.jsx(C,{})})})})})})})})}const y=async()=>{if(document.getElementById("merlin-chat"))return;const e=await j.fetchQuery(v.MerlinConfig);if(e&&e.misc.chat.gui!=="native")return;const o=document.createElement("merlin-component");o.id="merlin-chat",o.className="merlin chat";const i=o.attachShadow({mode:"open"}),s=document.createElement("style");s.textContent=`${P}
    :host(#merlin-chat) {
    }
    .reactAppRoot {
      all: initial; /* 1st rule so subsequent properties are reset. */
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      position: relative;
      z-index: 2147483647;
    }
    .dark {
        ${h}
    }
    ${x}
    `.replaceAll(":root",":host");const r=document.createElement("div");r.id="reactAppRoot",r.className="reactAppRoot",n.forEach(a=>{r.addEventListener(a,m=>{m.stopPropagation()})}),i.appendChild(s),i.appendChild(r),g(o),p(r).render(t.jsx(T,{}))};y();
