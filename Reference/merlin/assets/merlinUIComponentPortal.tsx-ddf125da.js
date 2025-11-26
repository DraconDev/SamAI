import{i as m,j as e}from"./localStorage-70c0cae5.js";import{T as i}from"./themeContext-5e650432.js";/* empty css             */import{a as d}from"./client-4954293f.js";import{c}from"./index-82b528a6.js";const l=async()=>{if(document.getElementById("merlin-uicomponentportal"))return;const o=document.createElement("merlin-component");o.id="merlin-uicomponentportal",o.className="merlin merlin-uicomponentportal";const r=o.attachShadow({mode:"open"}),n=document.createElement("style");n.textContent=`${c}
    :host(#merlin-uicomponentportal) {
    }   
    .reactAppRoot {
      all: initial; /* 1st rule so subsequent properties are reset. */
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      position: fixed;
      top: 0;
      left: 0;
      z-index: 2147483650;
    }
    `.replaceAll(":root",":host");const t=document.createElement("div");t.id="reactAppRoot",t.className="reactAppRoot",m.forEach(p=>{t.addEventListener(p,s=>{s.stopPropagation()})}),r.appendChild(n),r.appendChild(t);const a=d(t);document.documentElement.append(o),a.render(e.jsxs(e.Fragment,{children:[e.jsx(i,{children:e.jsx("div",{id:"reactAppRootWithTheme"})}),e.jsx(i,{overrideThemeForWebsite:!0,children:e.jsx("div",{id:"reactAppRootWithWebsiteOverrideTheme"})})]}))};l();
