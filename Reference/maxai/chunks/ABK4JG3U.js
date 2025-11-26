import{b as a}from"./DIGZHHNW.js";var r=class{constructor(t){this.module=t.split("/").map(s=>`[${s}]`).join("")}info(...t){if(a)return;let s=this.getCallStack()}error(...t){if(a)return;let s=this.getCallStack()}warn(...t){if(a)return;let s=this.getCallStack()}debug(...t){if(a)return;let s=this.getCallStack()}getCallStack(){let t=new Error().stack;return t?t.split(`
`).slice(2).join(`
`)?.split(/\n/)?.[1]:""}},e=r;export{e as a};
