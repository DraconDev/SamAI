import{r as a}from"./localStorage-70c0cae5.js";import{c as w}from"./createReactComponent-640fc4e6.js";let u;const U=new Uint8Array(16);function v(){if(!u&&(u=typeof crypto<"u"&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto),!u))throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");return u(U)}const n=[];for(let e=0;e<256;++e)n.push((e+256).toString(16).slice(1));function x(e,t=0){return n[e[t+0]]+n[e[t+1]]+n[e[t+2]]+n[e[t+3]]+"-"+n[e[t+4]]+n[e[t+5]]+"-"+n[e[t+6]]+n[e[t+7]]+"-"+n[e[t+8]]+n[e[t+9]]+"-"+n[e[t+10]]+n[e[t+11]]+n[e[t+12]]+n[e[t+13]]+n[e[t+14]]+n[e[t+15]]}const k=typeof crypto<"u"&&crypto.randomUUID&&crypto.randomUUID.bind(crypto),m={randomUUID:k};function A(e,t,c){if(m.randomUUID&&!t&&!e)return m.randomUUID();e=e||{};const r=e.random||(e.rng||v)();if(r[6]=r[6]&15|64,r[8]=r[8]&63|128,t){c=c||0;for(let o=0;o<16;++o)t[c+o]=r[o];return t}return x(r)}/**
 * @license lucide-react v0.364.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var I={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.364.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const C=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();/**
 * @license lucide-react v0.364.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const D=(e,t)=>{const c=a.forwardRef(({color:r="currentColor",size:o=24,strokeWidth:i=2,absoluteStrokeWidth:p,className:l="",children:d,...s},y)=>a.createElement("svg",{ref:y,...I,width:o,height:o,stroke:r,strokeWidth:p?Number(i)*24/Number(o):i,className:["lucide",`lucide-${C(e)}`,l].join(" "),...s},[...t.map(([g,h])=>a.createElement(g,h)),...Array.isArray(d)?d:[d]]));return c.displayName=`${e}`,c};var E=w("check","IconCheck",[["path",{d:"M5 12l5 5l10 -10",key:"svg-0"}]]);export{E as I,D as c,A as v};
