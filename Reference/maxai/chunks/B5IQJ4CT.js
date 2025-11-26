import{c as m}from"./454JMIH7.js";import{e as a}from"./JDSHOLU5.js";import{c as s}from"./HFEXSQX6.js";var d=null,y=0,l=new WeakMap,S=["header",".notion-topbar","#main",'[role="region"]'],v=["data-overlay-container","data-radix-popper-content-wrapper","data-radix-select-content","data-radix-dropdown-menu-content","data-radix-dialog-overlay"],x=["notion-overlay-container"],g=["dialog","alertdialog"],b=t=>t.role==="presentation"||v.some(o=>t.hasAttribute(o))||x.some(o=>t.classList.contains(o)),L=t=>g.includes(t.role),_=t=>t.id==="main"||t.classList.contains("notion-topbar"),T=t=>t.tagName.toLowerCase()==="header",M=t=>t.role==="region",A=(t,o)=>{t.style.width==="100vw"&&(l.has(t)||l.set(t,{width:t.style.width||"",maxWidth:t.style.maxWidth||""}),t.style.width=`calc(100vw - ${o}px)`)},C=(t,o)=>{t.style.maxWidth==="100vw"&&(l.has(t)||l.set(t,{width:t.style.width||"",maxWidth:t.style.maxWidth||""}),t.style.maxWidth=`calc(100vw - ${o}px)`)},N=t=>{_(t)&&t.style.setProperty("max-width","100%","important")},I=t=>{T(t)&&t.style.setProperty("width","100%","important")},H=(t,o)=>{b(t)&&(l.has(t)||l.set(t,{width:t.style.width||"",maxWidth:t.style.maxWidth||""}),t.style.maxWidth=`calc(100vw - ${o}px)`)},O=(t,o)=>{L(t)&&(l.has(t)||l.set(t,{width:t.style.width||"",maxWidth:t.style.maxWidth||""}),t.style.maxWidth=`calc(100vw - ${o}px - 40px)`)},q=(t,o)=>{M(t)&&(l.has(t)||l.set(t,{width:t.style.width||"",maxWidth:t.style.maxWidth||""}),t.style.width=`calc(100vw - ${o}px)`)},r=(t,o)=>{A(t,o),C(t,o),N(t),I(t),H(t,o),O(t,o),q(t,o)},W=t=>{S.flatMap(e=>Array.from(document.querySelectorAll(e))).forEach(e=>{e instanceof HTMLElement&&r(e,t)})},D=(t,o)=>{t.forEach(e=>{e instanceof HTMLElement&&(r(e,o),e.querySelectorAll("*").forEach(c=>{c instanceof HTMLElement&&r(c,o)}))})},k=(t,o)=>{(t.style.width==="100vw"||t.style.maxWidth==="100vw")&&r(t,o)},F=t=>a(o=>{o.forEach(e=>{if(e.addedNodes.length>0&&D(e.addedNodes,t),e.attributeName==="style"){let n=e.target;k(n,t)}})},50),$=t=>{d&&d.disconnect(),y=t,W(y),d=new MutationObserver(F(y)),d.observe(document.body,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["style","class","data-overlay-container","role","id"]})},R=()=>{d&&(d.disconnect(),d=null)},B=()=>{document.querySelectorAll("*").forEach(e=>{if(e instanceof HTMLElement&&l.has(e)){let n=l.get(e);n.width!==void 0&&(e.style.width=n.width),n.maxWidth!==void 0&&(e.style.maxWidth=n.maxWidth),l.delete(e)}}),document.querySelectorAll('[role="region"]').forEach(e=>{e instanceof HTMLElement&&e.style.width.includes("calc(100vw -")&&(e.style.width="")})},X=t=>`
    /* \u4FEE\u590D Notion \u4E2D\u6240\u6709\u4F7F\u7528 100vw \u4F5C\u4E3A width \u7684\u5143\u7D20 */
    *[style*="width: 100vw"],
    *[style*="width:100vw"] {
      width: calc(100vw - ${t}px) !important;
    }
    
    /* \u4FEE\u590D Notion \u4E2D\u6240\u6709\u4F7F\u7528 100vw \u4F5C\u4E3A max-width \u7684\u5143\u7D20 */
    *[style*="max-width: 100vw"],
    *[style*="max-width:100vw"] {
      max-width: calc(100vw - ${t}px) !important;
    }
    
    /* \u4FEE\u590D Notion \u7279\u6B8A\u5E03\u5C40\u5143\u7D20 */
    #main,
    .notion-topbar {
      max-width: 100% !important;
    }
    
    /* \u4FEE\u590D Notion header \u5143\u7D20 */
    header {
      width: 100% !important;
    }
    
    /* \u4FEE\u590D Notion \u5F39\u7A97\u548C\u906E\u76D6\u5C42 */
    div[role="presentation"],
    div[data-overlay-container="true"],
    .notion-overlay-container,
    [data-radix-popper-content-wrapper],
    [data-radix-select-content],
    [data-radix-dropdown-menu-content],
    [data-radix-dialog-overlay] {
      max-width: calc(100vw - ${t}px) !important;
    }
    
    /* \u4FEE\u590D Notion \u6A21\u6001\u6846 */
    [role="dialog"],
    [role="alertdialog"] {
      max-width: calc(100vw - ${t}px - 40px) !important;
    }
    
    /* \u4FEE\u590D region \u5143\u7D20 */
    [role="region"] {
      width: calc(100vw - ${t}px) !important;
    }
    
    /* \u4FEE\u590D\u56FA\u5B9A\u5B9A\u4F4D\u7684\u5168\u5C4F\u5143\u7D20\uFF08width: 100vw\uFF09 */
    [style*="position: fixed"][style*="width: 100vw"],
    [style*="position:fixed"][style*="width:100vw"] {
      width: calc(100vw - ${t}px) !important;
    }
    
    /* \u4FEE\u590D\u56FA\u5B9A\u5B9A\u4F4D\u7684\u5168\u5C4F\u5143\u7D20\uFF08max-width: 100vw\uFF09 */
    [style*="position: fixed"][style*="max-width: 100vw"],
    [style*="position:fixed"][style*="max-width:100vw"] {
      max-width: calc(100vw - ${t}px) !important;
    }
  `,h=t=>{let o="MAXAI__NOTION_100VW_FIX_STYLE",e=document.querySelector(`#${o}`);e||(e=document.createElement("style"),e.id=o,document.head.appendChild(e)),e.textContent=X(t),$(t)},p=()=>{document.querySelector("#MAXAI__NOTION_100VW_FIX_STYLE")?.remove(),B(),R()};var E=["greylock.com","notion.so","teams.live.com"],Y=()=>{let t=document.body.parentElement,o=document.getElementById(s),e=m();if(t&&o){let n=o.offsetWidth||480;if((e==="outlook.live.com"||e==="onedrive.live.com"||e==="outlook.office.com"||e==="outlook.office365.com")&&(t.style.minHeight="100vh"),e==="teams.live.com"&&document.querySelectorAll(".overlay-hybrid").forEach(c=>{c.style.width=`calc(100% - ${n}px)`,c.childNodes.forEach(i=>{i.tagName==="IFRAME"&&(i.style.width="100%")})}),e==="studio.youtube.com"){let c=document.querySelector("#main-container");c.style.width=`calc(100% - ${n}px)`}if(e==="youtube.com"){document.querySelectorAll(".ytp-chrome-bottom").forEach(u=>{u.style.maxWidth="95%"});let c=document.querySelector("ytd-live-chat-frame#chat");c&&window.getComputedStyle(c).position==="fixed"&&(c.style.right=`${n}px`),document.body.style.position="relative",document.head.querySelector("#MAXAI__YOUTUBE_SPECIAL_STYLE")?.remove();let i=document.createElement("style");i.id="MAXAI__YOUTUBE_SPECIAL_STYLE",i.innerHTML=`
        #ytd-player .html5-video-container,
        #ytd-player .html5-video-container .html5-main-video {
          width: 100% !important;
          height: 100% !important;
        }
      `,document.head.appendChild(i)}if(e==="mail.qq.com"&&(t.style.width="100%"),e==="gatesnotes.com"&&(t.style.height="100%"),e==="pangu.huaweicloud.com"&&(t.style.height="100%"),e==="google.com"&&location.pathname.startsWith("/maps")&&(t.style.height="100%"),e==="facebook.com"){let c=document.querySelector('div:has(div[role="main"]) div[role="complementary"] > div');c&&window.getComputedStyle(c).position==="fixed"&&(c.style.right=`${n}px`)}if(e==="discord.com"){let c="MAXAI__DISCORD_SPECIAL_STYLE",i=document.querySelector(`#${c}`);i||(i=document.createElement("style"),i.id=c,document.getElementsByTagName("head")[0].appendChild(i)),i.innerHTML=`html,#app-mount{width:calc(100vw - ${n}px)!important;}`}if(e==="app.slack.com"){let c="MAXAI__SLACK_SPECIAL_STYLE",i=document.querySelector(`#${c}`);i||(i=document.createElement("style"),i.id=c,document.getElementsByTagName("head")[0].appendChild(i)),i.innerHTML=".p-client,.p-ia4_client,.p-ia4_client_container,.p-theme_background,.p-client_workspace_wrapper{width:100%!important;} .c-popover--z_above_fs{z-index:2147483502!important;}"}if(e==="console.cloud.tencent.com"){let c="MAXAI__TENCENT_CLOUD_SPECIAL_STYLE",i=document.querySelector(`#${c}`);i||(i=document.createElement("style"),i.id=c,document.getElementsByTagName("head")[0].appendChild(i)),i.innerHTML="html,body{min-width:auto;}"}if((e==="twitter.com"||e==="npmjs.com")&&(document.body.style.position="relative"),e==="tripo3d.ai"){let c=document.body;c.style.transform="none";let i=document.querySelector("#root > div > div");if(!i)return;i.style.width=`calc(100% - ${n}px)`,i.querySelectorAll("& > div > .ccc").forEach(w=>{w.style.width="100%"})}e==="word.cloud.microsoft"&&location.pathname.startsWith("/open/onedrive")&&document.body.parentElement&&(document.body.parentElement.style.height="100%"),e==="wordtune.com"&&(document.body.style.position="relative"),e==="zh.wikipedia.org"&&(document.body.style.position="relative"),e==="learning.google.com"&&document.body.parentElement&&(document.body.parentElement.style.height="100%"),e==="llamaindex.ai"&&(document.documentElement.style.contain="unset",document.body.style.contain="unset"),e.includes("bing.com")&&(document.documentElement.style.width="unset"),e==="sogou.com"&&(document.documentElement.style.width="unset"),e==="chat.deepseek.com"&&(document.documentElement.style.height="100%"),e==="notion.so"&&h(n)}document.querySelector('embed[type="application/pdf"]')&&(document.body.style.height="100vh"),E.includes(e)&&(document.body.style.overflow="unset")},U=()=>{let t=document.body.parentElement,o=m();if(t){if((o==="outlook.live.com"||o==="onedrive.live.com"||o==="outlook.office.com")&&(t.style.minHeight=""),o==="teams.live.com"&&document.querySelectorAll(".overlay-hybrid").forEach(e=>{e.style.width="100%",e.childNodes.forEach(n=>{n.tagName==="IFRAME"&&(n.style.width="100vw")})}),o==="youtube.com"){document.querySelectorAll(".ytp-chrome-bottom").forEach(n=>{n.style.maxWidth=""});let e=document.querySelector("ytd-live-chat-frame#chat");e&&window.getComputedStyle(e).position==="fixed"&&(e.style.right=""),document.body.style.position="",document.head.querySelector("#MAXAI__YOUTUBE_SPECIAL_STYLE")?.remove()}if(o==="studio.youtube.com"){let e=document.querySelector("#main-container");e.style.width="100%"}if(o==="mail.qq.com"&&(t.style.width=""),o==="gatesnotes.com"&&(t.style.height=""),o==="pangu.huaweicloud.com"&&(t.style.height=""),o==="google.com"&&location.pathname.startsWith("/maps")&&(t.style.height=""),o==="facebook.com"){let e=document.querySelector('div:has(div[role="main"]) div[role="complementary"] > div');e&&window.getComputedStyle(e).position==="fixed"&&(e.style.right="0px")}if(o==="discord.com"&&document.querySelector("#MAXAI__DISCORD_SPECIAL_STYLE")?.remove(),o==="app.slack.com"&&document.querySelector("#MAXAI__SLACK_SPECIAL_STYLE")?.remove(),o==="console.cloud.tencent.com"&&document.querySelector("#MAXAI__TENCENT_CLOUD_SPECIAL_STYLE")?.remove(),o==="twitter.com"&&(document.body.style.position=""),o==="tripo3d.ai"){let e=document.body;e.style.transform="rotate(0)";let n=document.querySelector("#root > div > div");if(!n)return;n.style.width="100%",n.querySelectorAll("& > div > .ccc").forEach(i=>{i.style.width="100vw"})}o==="word.cloud.microsoft"&&location.pathname.startsWith("/open/onedrive")&&document.body.parentElement&&(document.body.parentElement.style.height=""),o==="wordtune.com"&&(document.body.style.position=""),o==="zh.wikipedia.org"&&(document.body.style.position=""),o==="learning.google.com"&&document.body.parentElement&&(document.body.parentElement.style.height=""),o==="llamaindex.ai"&&(document.documentElement.style.contain="paint",document.body.style.contain="paint"),o.includes("bing.com")&&(document.documentElement.style.width="unset"),o==="sogou.com"&&(document.documentElement.style.width="unset"),o==="chat.deepseek.com"&&(document.documentElement.style.height="unset"),o==="notion.so"&&p()}document.querySelector('embed[type="application/pdf"]')&&(document.body.style.height=""),E.includes(o)&&(document.body.style.overflow="")},P=async()=>{let t=document.body.parentElement,o=document.getElementById(s);if(t&&o){let e=o.offsetWidth||480;if(t.style.transition="width .1s ease-inout",t.style.width=`calc(100% - ${e}px)`,t.style.position="relative",Y(),o.classList.contains("open")||(o.classList.remove("close"),o.classList.add("open")),window.getComputedStyle(document.body).transform==="matrix(1, 0, 0, 1, 0, 0)"&&!document.getElementById("MAXAI__TRANSFORM_NONE_STYLE")&&!document.body.classList.contains("transform-none")){let n=document.createElement("style");n.id="MAXAI__TRANSFORM_NONE_STYLE",n.innerHTML="body{transform:none!important;}",document.head.appendChild(n)}return setTimeout(()=>{window.dispatchEvent(new Event("resize"))},300),setTimeout(()=>{window.dispatchEvent(new Event("resize"))},1e3),!0}return!1},V=async()=>{let t=document.body.parentElement,o=document.getElementById(s);return t&&o?(t.style.transition="width .1s ease-inout",t.style.width="100%",t.style.position="",U(),o.classList.remove("open"),o.classList.add("close"),setTimeout(()=>{window.dispatchEvent(new Event("resize"))},300),!0):!1},z=()=>document.getElementById(s)?.classList.contains("open")||!1,et=a(()=>{z()?P():V()},100);export{P as a,V as b,z as c,et as d};
