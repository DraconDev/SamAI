import{a as se,r as C,j as d,s as oe,d as ie,e as T,f as ae,b as re}from"./style-BTVcNkca.js";import{b as S}from"./chrome-DgJzWTln.js";var M;(function(e){e.STRING="string",e.NUMBER="number",e.INTEGER="integer",e.BOOLEAN="boolean",e.ARRAY="array",e.OBJECT="object"})(M||(M={}));/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var G;(function(e){e.LANGUAGE_UNSPECIFIED="language_unspecified",e.PYTHON="python"})(G||(G={}));var D;(function(e){e.OUTCOME_UNSPECIFIED="outcome_unspecified",e.OUTCOME_OK="outcome_ok",e.OUTCOME_FAILED="outcome_failed",e.OUTCOME_DEADLINE_EXCEEDED="outcome_deadline_exceeded"})(D||(D={}));/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const j=["user","model","function","system"];var L;(function(e){e.HARM_CATEGORY_UNSPECIFIED="HARM_CATEGORY_UNSPECIFIED",e.HARM_CATEGORY_HATE_SPEECH="HARM_CATEGORY_HATE_SPEECH",e.HARM_CATEGORY_SEXUALLY_EXPLICIT="HARM_CATEGORY_SEXUALLY_EXPLICIT",e.HARM_CATEGORY_HARASSMENT="HARM_CATEGORY_HARASSMENT",e.HARM_CATEGORY_DANGEROUS_CONTENT="HARM_CATEGORY_DANGEROUS_CONTENT"})(L||(L={}));var F;(function(e){e.HARM_BLOCK_THRESHOLD_UNSPECIFIED="HARM_BLOCK_THRESHOLD_UNSPECIFIED",e.BLOCK_LOW_AND_ABOVE="BLOCK_LOW_AND_ABOVE",e.BLOCK_MEDIUM_AND_ABOVE="BLOCK_MEDIUM_AND_ABOVE",e.BLOCK_ONLY_HIGH="BLOCK_ONLY_HIGH",e.BLOCK_NONE="BLOCK_NONE"})(F||(F={}));var U;(function(e){e.HARM_PROBABILITY_UNSPECIFIED="HARM_PROBABILITY_UNSPECIFIED",e.NEGLIGIBLE="NEGLIGIBLE",e.LOW="LOW",e.MEDIUM="MEDIUM",e.HIGH="HIGH"})(U||(U={}));var P;(function(e){e.BLOCKED_REASON_UNSPECIFIED="BLOCKED_REASON_UNSPECIFIED",e.SAFETY="SAFETY",e.OTHER="OTHER"})(P||(P={}));var A;(function(e){e.FINISH_REASON_UNSPECIFIED="FINISH_REASON_UNSPECIFIED",e.STOP="STOP",e.MAX_TOKENS="MAX_TOKENS",e.SAFETY="SAFETY",e.RECITATION="RECITATION",e.LANGUAGE="LANGUAGE",e.OTHER="OTHER"})(A||(A={}));var $;(function(e){e.TASK_TYPE_UNSPECIFIED="TASK_TYPE_UNSPECIFIED",e.RETRIEVAL_QUERY="RETRIEVAL_QUERY",e.RETRIEVAL_DOCUMENT="RETRIEVAL_DOCUMENT",e.SEMANTIC_SIMILARITY="SEMANTIC_SIMILARITY",e.CLASSIFICATION="CLASSIFICATION",e.CLUSTERING="CLUSTERING"})($||($={}));var k;(function(e){e.MODE_UNSPECIFIED="MODE_UNSPECIFIED",e.AUTO="AUTO",e.ANY="ANY",e.NONE="NONE"})(k||(k={}));var H;(function(e){e.MODE_UNSPECIFIED="MODE_UNSPECIFIED",e.MODE_DYNAMIC="MODE_DYNAMIC"})(H||(H={}));/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class h extends Error{constructor(t){super(`[GoogleGenerativeAI Error]: ${t}`)}}class I extends h{constructor(t,n){super(t),this.response=n}}class X extends h{constructor(t,n,s,o){super(t),this.status=n,this.statusText=s,this.errorDetails=o}}class _ extends h{}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ce="https://generativelanguage.googleapis.com",le="v1beta",de="0.21.0",ue="genai-js";var y;(function(e){e.GENERATE_CONTENT="generateContent",e.STREAM_GENERATE_CONTENT="streamGenerateContent",e.COUNT_TOKENS="countTokens",e.EMBED_CONTENT="embedContent",e.BATCH_EMBED_CONTENTS="batchEmbedContents"})(y||(y={}));class fe{constructor(t,n,s,o,i){this.model=t,this.task=n,this.apiKey=s,this.stream=o,this.requestOptions=i}toString(){var t,n;const s=((t=this.requestOptions)===null||t===void 0?void 0:t.apiVersion)||le;let i=`${((n=this.requestOptions)===null||n===void 0?void 0:n.baseUrl)||ce}/${s}/${this.model}:${this.task}`;return this.stream&&(i+="?alt=sse"),i}}function ge(e){const t=[];return e!=null&&e.apiClient&&t.push(e.apiClient),t.push(`${ue}/${de}`),t.join(" ")}async function he(e){var t;const n=new Headers;n.append("Content-Type","application/json"),n.append("x-goog-api-client",ge(e.requestOptions)),n.append("x-goog-api-key",e.apiKey);let s=(t=e.requestOptions)===null||t===void 0?void 0:t.customHeaders;if(s){if(!(s instanceof Headers))try{s=new Headers(s)}catch(o){throw new _(`unable to convert customHeaders value ${JSON.stringify(s)} to Headers: ${o.message}`)}for(const[o,i]of s.entries()){if(o==="x-goog-api-key")throw new _(`Cannot set reserved header name ${o}`);if(o==="x-goog-api-client")throw new _(`Header name ${o} can only be set using the apiClient field`);n.append(o,i)}}return n}async function pe(e,t,n,s,o,i){const a=new fe(e,t,n,s,i);return{url:a.toString(),fetchOptions:Object.assign(Object.assign({},ve(i)),{method:"POST",headers:await he(a),body:o})}}async function w(e,t,n,s,o,i={},a=fetch){const{url:r,fetchOptions:c}=await pe(e,t,n,s,o,i);return Ee(r,c,a)}async function Ee(e,t,n=fetch){let s;try{s=await n(e,t)}catch(o){me(o,e)}return s.ok||await Ce(s,e),s}function me(e,t){let n=e;throw e instanceof X||e instanceof _||(n=new h(`Error fetching from ${t.toString()}: ${e.message}`),n.stack=e.stack),n}async function Ce(e,t){let n="",s;try{const o=await e.json();n=o.error.message,o.error.details&&(n+=` ${JSON.stringify(o.error.details)}`,s=o.error.details)}catch{}throw new X(`Error fetching from ${t.toString()}: [${e.status} ${e.statusText}] ${n}`,e.status,e.statusText,s)}function ve(e){const t={};if((e==null?void 0:e.signal)!==void 0||(e==null?void 0:e.timeout)>=0){const n=new AbortController;(e==null?void 0:e.timeout)>=0&&setTimeout(()=>n.abort(),e.timeout),e!=null&&e.signal&&e.signal.addEventListener("abort",()=>{n.abort()}),t.signal=n.signal}return t}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function x(e){return e.text=()=>{if(e.candidates&&e.candidates.length>0){if(e.candidates.length>1&&console.warn(`This response had ${e.candidates.length} candidates. Returning text from the first candidate only. Access response.candidates directly to use the other candidates.`),N(e.candidates[0]))throw new I(`${v(e)}`,e);return _e(e)}else if(e.promptFeedback)throw new I(`Text not available. ${v(e)}`,e);return""},e.functionCall=()=>{if(e.candidates&&e.candidates.length>0){if(e.candidates.length>1&&console.warn(`This response had ${e.candidates.length} candidates. Returning function calls from the first candidate only. Access response.candidates directly to use the other candidates.`),N(e.candidates[0]))throw new I(`${v(e)}`,e);return console.warn("response.functionCall() is deprecated. Use response.functionCalls() instead."),K(e)[0]}else if(e.promptFeedback)throw new I(`Function call not available. ${v(e)}`,e)},e.functionCalls=()=>{if(e.candidates&&e.candidates.length>0){if(e.candidates.length>1&&console.warn(`This response had ${e.candidates.length} candidates. Returning function calls from the first candidate only. Access response.candidates directly to use the other candidates.`),N(e.candidates[0]))throw new I(`${v(e)}`,e);return K(e)}else if(e.promptFeedback)throw new I(`Function call not available. ${v(e)}`,e)},e}function _e(e){var t,n,s,o;const i=[];if(!((n=(t=e.candidates)===null||t===void 0?void 0:t[0].content)===null||n===void 0)&&n.parts)for(const a of(o=(s=e.candidates)===null||s===void 0?void 0:s[0].content)===null||o===void 0?void 0:o.parts)a.text&&i.push(a.text),a.executableCode&&i.push("\n```"+a.executableCode.language+`
`+a.executableCode.code+"\n```\n"),a.codeExecutionResult&&i.push("\n```\n"+a.codeExecutionResult.output+"\n```\n");return i.length>0?i.join(""):""}function K(e){var t,n,s,o;const i=[];if(!((n=(t=e.candidates)===null||t===void 0?void 0:t[0].content)===null||n===void 0)&&n.parts)for(const a of(o=(s=e.candidates)===null||s===void 0?void 0:s[0].content)===null||o===void 0?void 0:o.parts)a.functionCall&&i.push(a.functionCall);if(i.length>0)return i}const ye=[A.RECITATION,A.SAFETY,A.LANGUAGE];function N(e){return!!e.finishReason&&ye.includes(e.finishReason)}function v(e){var t,n,s;let o="";if((!e.candidates||e.candidates.length===0)&&e.promptFeedback)o+="Response was blocked",!((t=e.promptFeedback)===null||t===void 0)&&t.blockReason&&(o+=` due to ${e.promptFeedback.blockReason}`),!((n=e.promptFeedback)===null||n===void 0)&&n.blockReasonMessage&&(o+=`: ${e.promptFeedback.blockReasonMessage}`);else if(!((s=e.candidates)===null||s===void 0)&&s[0]){const i=e.candidates[0];N(i)&&(o+=`Candidate was blocked due to ${i.finishReason}`,i.finishMessage&&(o+=`: ${i.finishMessage}`))}return o}function R(e){return this instanceof R?(this.v=e,this):new R(e)}function Ie(e,t,n){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var s=n.apply(e,t||[]),o,i=[];return o={},a("next"),a("throw"),a("return"),o[Symbol.asyncIterator]=function(){return this},o;function a(u){s[u]&&(o[u]=function(l){return new Promise(function(g,f){i.push([u,l,g,f])>1||r(u,l)})})}function r(u,l){try{c(s[u](l))}catch(g){m(i[0][3],g)}}function c(u){u.value instanceof R?Promise.resolve(u.value.v).then(p,E):m(i[0][2],u)}function p(u){r("next",u)}function E(u){r("throw",u)}function m(u,l){u(l),i.shift(),i.length&&r(i[0][0],i[0][1])}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const B=/^data\: (.*)(?:\n\n|\r\r|\r\n\r\n)/;function Se(e){const t=e.body.pipeThrough(new TextDecoderStream("utf8",{fatal:!0})),n=Oe(t),[s,o]=n.tee();return{stream:Re(s),response:Ae(o)}}async function Ae(e){const t=[],n=e.getReader();for(;;){const{done:s,value:o}=await n.read();if(s)return x(we(t));t.push(o)}}function Re(e){return Ie(this,arguments,function*(){const n=e.getReader();for(;;){const{value:s,done:o}=yield R(n.read());if(o)break;yield yield R(x(s))}})}function Oe(e){const t=e.getReader();return new ReadableStream({start(s){let o="";return i();function i(){return t.read().then(({value:a,done:r})=>{if(r){if(o.trim()){s.error(new h("Failed to parse stream"));return}s.close();return}o+=a;let c=o.match(B),p;for(;c;){try{p=JSON.parse(c[1])}catch{s.error(new h(`Error parsing JSON response: "${c[1]}"`));return}s.enqueue(p),o=o.substring(c[0].length),c=o.match(B)}return i()})}}})}function we(e){const t=e[e.length-1],n={promptFeedback:t==null?void 0:t.promptFeedback};for(const s of e){if(s.candidates)for(const o of s.candidates){const i=o.index;if(n.candidates||(n.candidates=[]),n.candidates[i]||(n.candidates[i]={index:o.index}),n.candidates[i].citationMetadata=o.citationMetadata,n.candidates[i].groundingMetadata=o.groundingMetadata,n.candidates[i].finishReason=o.finishReason,n.candidates[i].finishMessage=o.finishMessage,n.candidates[i].safetyRatings=o.safetyRatings,o.content&&o.content.parts){n.candidates[i].content||(n.candidates[i].content={role:o.content.role||"user",parts:[]});const a={};for(const r of o.content.parts)r.text&&(a.text=r.text),r.functionCall&&(a.functionCall=r.functionCall),r.executableCode&&(a.executableCode=r.executableCode),r.codeExecutionResult&&(a.codeExecutionResult=r.codeExecutionResult),Object.keys(a).length===0&&(a.text=""),n.candidates[i].content.parts.push(a)}}s.usageMetadata&&(n.usageMetadata=s.usageMetadata)}return n}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Q(e,t,n,s){const o=await w(t,y.STREAM_GENERATE_CONTENT,e,!0,JSON.stringify(n),s);return Se(o)}async function Z(e,t,n,s){const i=await(await w(t,y.GENERATE_CONTENT,e,!1,JSON.stringify(n),s)).json();return{response:x(i)}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ee(e){if(e!=null){if(typeof e=="string")return{role:"system",parts:[{text:e}]};if(e.text)return{role:"system",parts:[e]};if(e.parts)return e.role?e:{role:"system",parts:e.parts}}}function O(e){let t=[];if(typeof e=="string")t=[{text:e}];else for(const n of e)typeof n=="string"?t.push({text:n}):t.push(n);return Ne(t)}function Ne(e){const t={role:"user",parts:[]},n={role:"function",parts:[]};let s=!1,o=!1;for(const i of e)"functionResponse"in i?(n.parts.push(i),o=!0):(t.parts.push(i),s=!0);if(s&&o)throw new h("Within a single message, FunctionResponse cannot be mixed with other type of part in the request for sending chat message.");if(!s&&!o)throw new h("No content is provided for sending chat message.");return s?t:n}function be(e,t){var n;let s={model:t==null?void 0:t.model,generationConfig:t==null?void 0:t.generationConfig,safetySettings:t==null?void 0:t.safetySettings,tools:t==null?void 0:t.tools,toolConfig:t==null?void 0:t.toolConfig,systemInstruction:t==null?void 0:t.systemInstruction,cachedContent:(n=t==null?void 0:t.cachedContent)===null||n===void 0?void 0:n.name,contents:[]};const o=e.generateContentRequest!=null;if(e.contents){if(o)throw new _("CountTokensRequest must have one of contents or generateContentRequest, not both.");s.contents=e.contents}else if(o)s=Object.assign(Object.assign({},s),e.generateContentRequest);else{const i=O(e);s.contents=[i]}return{generateContentRequest:s}}function Y(e){let t;return e.contents?t=e:t={contents:[O(e)]},e.systemInstruction&&(t.systemInstruction=ee(e.systemInstruction)),t}function xe(e){return typeof e=="string"||Array.isArray(e)?{content:O(e)}:e}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const q=["text","inlineData","functionCall","functionResponse","executableCode","codeExecutionResult"],Te={user:["text","inlineData"],function:["functionResponse"],model:["text","functionCall","executableCode","codeExecutionResult"],system:["text"]};function Me(e){let t=!1;for(const n of e){const{role:s,parts:o}=n;if(!t&&s!=="user")throw new h(`First content should be with role 'user', got ${s}`);if(!j.includes(s))throw new h(`Each item should include role field. Got ${s} but valid roles are: ${JSON.stringify(j)}`);if(!Array.isArray(o))throw new h("Content should have 'parts' property with an array of Parts");if(o.length===0)throw new h("Each Content should have at least one part");const i={text:0,inlineData:0,functionCall:0,functionResponse:0,fileData:0,executableCode:0,codeExecutionResult:0};for(const r of o)for(const c of q)c in r&&(i[c]+=1);const a=Te[s];for(const r of q)if(!a.includes(r)&&i[r]>0)throw new h(`Content with role '${s}' can't contain '${r}' part`);t=!0}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const V="SILENT_ERROR";class Ge{constructor(t,n,s,o={}){this.model=n,this.params=s,this._requestOptions=o,this._history=[],this._sendPromise=Promise.resolve(),this._apiKey=t,s!=null&&s.history&&(Me(s.history),this._history=s.history)}async getHistory(){return await this._sendPromise,this._history}async sendMessage(t,n={}){var s,o,i,a,r,c;await this._sendPromise;const p=O(t),E={safetySettings:(s=this.params)===null||s===void 0?void 0:s.safetySettings,generationConfig:(o=this.params)===null||o===void 0?void 0:o.generationConfig,tools:(i=this.params)===null||i===void 0?void 0:i.tools,toolConfig:(a=this.params)===null||a===void 0?void 0:a.toolConfig,systemInstruction:(r=this.params)===null||r===void 0?void 0:r.systemInstruction,cachedContent:(c=this.params)===null||c===void 0?void 0:c.cachedContent,contents:[...this._history,p]},m=Object.assign(Object.assign({},this._requestOptions),n);let u;return this._sendPromise=this._sendPromise.then(()=>Z(this._apiKey,this.model,E,m)).then(l=>{var g;if(l.response.candidates&&l.response.candidates.length>0){this._history.push(p);const f=Object.assign({parts:[],role:"model"},(g=l.response.candidates)===null||g===void 0?void 0:g[0].content);this._history.push(f)}else{const f=v(l.response);f&&console.warn(`sendMessage() was unsuccessful. ${f}. Inspect response object for details.`)}u=l}),await this._sendPromise,u}async sendMessageStream(t,n={}){var s,o,i,a,r,c;await this._sendPromise;const p=O(t),E={safetySettings:(s=this.params)===null||s===void 0?void 0:s.safetySettings,generationConfig:(o=this.params)===null||o===void 0?void 0:o.generationConfig,tools:(i=this.params)===null||i===void 0?void 0:i.tools,toolConfig:(a=this.params)===null||a===void 0?void 0:a.toolConfig,systemInstruction:(r=this.params)===null||r===void 0?void 0:r.systemInstruction,cachedContent:(c=this.params)===null||c===void 0?void 0:c.cachedContent,contents:[...this._history,p]},m=Object.assign(Object.assign({},this._requestOptions),n),u=Q(this._apiKey,this.model,E,m);return this._sendPromise=this._sendPromise.then(()=>u).catch(l=>{throw new Error(V)}).then(l=>l.response).then(l=>{if(l.candidates&&l.candidates.length>0){this._history.push(p);const g=Object.assign({},l.candidates[0].content);g.role||(g.role="model"),this._history.push(g)}else{const g=v(l);g&&console.warn(`sendMessageStream() was unsuccessful. ${g}. Inspect response object for details.`)}}).catch(l=>{l.message!==V&&console.error(l)}),u}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function De(e,t,n,s){return(await w(t,y.COUNT_TOKENS,e,!1,JSON.stringify(n),s)).json()}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function je(e,t,n,s){return(await w(t,y.EMBED_CONTENT,e,!1,JSON.stringify(n),s)).json()}async function Le(e,t,n,s){const o=n.requests.map(a=>Object.assign(Object.assign({},a),{model:t}));return(await w(t,y.BATCH_EMBED_CONTENTS,e,!1,JSON.stringify({requests:o}),s)).json()}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class J{constructor(t,n,s={}){this.apiKey=t,this._requestOptions=s,n.model.includes("/")?this.model=n.model:this.model=`models/${n.model}`,this.generationConfig=n.generationConfig||{},this.safetySettings=n.safetySettings||[],this.tools=n.tools,this.toolConfig=n.toolConfig,this.systemInstruction=ee(n.systemInstruction),this.cachedContent=n.cachedContent}async generateContent(t,n={}){var s;const o=Y(t),i=Object.assign(Object.assign({},this._requestOptions),n);return Z(this.apiKey,this.model,Object.assign({generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:(s=this.cachedContent)===null||s===void 0?void 0:s.name},o),i)}async generateContentStream(t,n={}){var s;const o=Y(t),i=Object.assign(Object.assign({},this._requestOptions),n);return Q(this.apiKey,this.model,Object.assign({generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:(s=this.cachedContent)===null||s===void 0?void 0:s.name},o),i)}startChat(t){var n;return new Ge(this.apiKey,this.model,Object.assign({generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:(n=this.cachedContent)===null||n===void 0?void 0:n.name},t),this._requestOptions)}async countTokens(t,n={}){const s=be(t,{model:this.model,generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:this.cachedContent}),o=Object.assign(Object.assign({},this._requestOptions),n);return De(this.apiKey,this.model,s,o)}async embedContent(t,n={}){const s=xe(t),o=Object.assign(Object.assign({},this._requestOptions),n);return je(this.apiKey,this.model,s,o)}async batchEmbedContents(t,n={}){const s=Object.assign(Object.assign({},this._requestOptions),n);return Le(this.apiKey,this.model,t,s)}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fe{constructor(t){this.apiKey=t}getGenerativeModel(t,n){if(!t.model)throw new h("Must provide a model name. Example: genai.getGenerativeModel({ model: 'my-model-name' })");return new J(this.apiKey,t,n)}getGenerativeModelFromCachedContent(t,n,s){if(!t.name)throw new _("Cached content must contain a `name` field.");if(!t.model)throw new _("Cached content must contain a `model` field.");const o=["model","systemInstruction"];for(const a of o)if(n!=null&&n[a]&&t[a]&&(n==null?void 0:n[a])!==t[a]){if(a==="model"){const r=n.model.startsWith("models/")?n.model.replace("models/",""):n.model,c=t.model.startsWith("models/")?t.model.replace("models/",""):t.model;if(r===c)continue}throw new _(`Different value for "${a}" specified in modelParams (${n[a]}) and cachedContent (${t[a]})`)}const i=Object.assign(Object.assign({},n),{model:t.model,tools:t.tools,toolConfig:t.toolConfig,systemInstruction:t.systemInstruction,cachedContent:t});return new J(this.apiKey,i,s)}}let W,b;function Ue(e){try{console.log("[SamAI Gemini] Initializing GoogleGenerativeAI"),W=new Fe(e),console.log("[SamAI Gemini] Creating model instance"),b=W.getGenerativeModel({model:"gemini-2.0-flash"}),console.log("[SamAI Gemini] Model initialized successfully")}catch(t){throw console.error("[SamAI Gemini] Error initializing model:",{message:t.message,stack:t.stack,errorType:t.constructor.name}),t}}async function z(e){try{console.log("[SamAI Gemini] Generating response for prompt:",e);const t=await se.getValue();if(console.log("[SamAI Gemini] Retrieved store:",{hasApiKey:!!t.apiKey}),!t.apiKey)return console.warn("[SamAI Gemini] No API key found in store"),null;b?console.log("[SamAI Gemini] Using existing model instance"):(console.log("[SamAI Gemini] Model not initialized, initializing with API key"),Ue(t.apiKey)),console.log("[SamAI Gemini] Sending request to Gemini API");const n=await b.generateContent(e);if(console.log("[SamAI Gemini] Raw API response:",n),!n||!n.response)throw console.error("[SamAI Gemini] Empty response from API:",n),new Error("Empty response from Gemini API");if(!n.response.candidates||!n.response.candidates[0]||!n.response.candidates[0].content||!n.response.candidates[0].content.parts||!n.response.candidates[0].content.parts[0]||!n.response.candidates[0].content.parts[0].text)throw console.error("[SamAI Gemini] Invalid response structure:",n.response),new Error("No candidates in response from Gemini API");const s=n.response.candidates[0].content.parts[0].text;return console.log("[SamAI Gemini] Successfully generated response"),s.trim()}catch(t){return console.error("Error generating Gemini response:",{timestamp:new Date().toISOString(),message:t.message,stack:t.stack,errorType:t.constructor.name}),null}}function Pe(){const[e,t]=C.useState(""),[n,s]=C.useState(""),[o,i]=C.useState(null),[a,r]=C.useState(""),[c,p]=C.useState(!1),[E,m]=C.useState(!1);C.useEffect(()=>{(async()=>{try{const f=await S.storage.local.get(["inputInfo","pageContent"]);f.inputInfo&&i(f.inputInfo),f.pageContent&&r(f.pageContent)}catch(f){console.error("Error loading stored data:",f)}})()},[]),C.useEffect(()=>()=>{S.storage.local.remove("inputInfo").catch(console.error)},[]);const u=async g=>{if(g.preventDefault(),!(!e.trim()||c||!o)){p(!0);try{const f=await z(e);if(!f){console.error("Error generating response");return}await S.runtime.sendMessage({type:"setInputValue",value:f}),t(""),await S.storage.local.remove("inputInfo"),window.close()}catch(f){console.error("Error processing input:",f)}finally{p(!1)}}},l=async g=>{if(g.preventDefault(),!(!n.trim()||E)){console.log("[Page Assistant] Starting submission with prompt:",n),m(!0);try{console.log("[Page Assistant] Generating response...");const f=await z(`${n}

Content: ${a}`);if(!f)throw console.error("[Page Assistant] No response received"),new Error("Failed to generate response");console.log("[Page Assistant] Response received, length:",f.length),console.log("[Page Assistant] Adding messages to chat..."),(await oe.getValue()).continuePreviousChat||(console.log("[Page Assistant] Starting fresh chat..."),await ie.setValue({messages:[]}));const te={role:"user",content:`Question about page: ${n}`,timestamp:new Date().toLocaleTimeString()},ne={role:"assistant",content:f,timestamp:new Date().toLocaleTimeString()};await T(te),await T(ne),console.log("[Page Assistant] Messages added to chat"),console.log("[Page Assistant] Opening chat page..."),await S.tabs.create({url:"chat.html"}),console.log("[Page Assistant] Chat page opened"),s(""),console.log("[Page Assistant] Closing popup..."),window.close()}catch(f){console.error("Error processing page:",f)}finally{m(!1)}}};return d.jsx("div",{className:"min-w-[300px] min-h-[300px] bg-gradient-to-br from-[#1a1b2e] to-[#0D0E16] shadow-xl p-6 text-gray-100 overflow-y-auto",children:d.jsxs("div",{className:"flex flex-col h-full space-y-6",children:[d.jsxs("div",{className:`space-y-3 flex-none ${o?"":"opacity-50"}`,children:[d.jsx("h2",{className:"font-semibold text-transparent bg-gradient-to-r from-[#818cf8] to-[#4f46e5] bg-clip-text",children:"Input Assistant"}),d.jsxs("form",{onSubmit:u,className:"flex flex-col gap-3",children:[d.jsx("input",{type:"text",value:e,onChange:g=>t(g.target.value),placeholder:"Type your message...",className:"w-full p-3 placeholder-gray-500 transition-all duration-200 bg-[#1E1F2E] border border-[#2E2F3E] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-[#4f46e5]",autoFocus:!!o,disabled:!o}),d.jsx("button",{type:"submit",disabled:c||!o,className:`w-full p-2.5 bg-gradient-to-r from-[#4f46e5] to-[#818cf8] text-white rounded-lg 
                          hover:opacity-90 focus:outline-none focus:ring-2 
                          focus:ring-[#4f46e5] focus:ring-offset-2 focus:ring-offset-[#1a1b2e]
                          transition-all duration-200 transform hover:scale-[0.98] 
                          ${c?"opacity-75 cursor-not-allowed":""}`,children:c?d.jsxs("div",{className:"flex items-center justify-center gap-2",children:[d.jsx("div",{className:"w-4 h-4",children:d.jsx("svg",{viewBox:"0 0 50 50",children:d.jsx("path",{d:"M25,25 m-20,0 a20,20 0 1,1 40,0 a20,20 0 1,1 -40,0",fill:"none",stroke:"currentColor",strokeWidth:"3",strokeLinecap:"round",className:"animate-[dash_1.5s_ease-in-out_infinite]",style:{strokeDasharray:"90,150",strokeDashoffset:"-35",animation:"dash 1.5s ease-in-out infinite, rotate 2s linear infinite"}})})}),d.jsx("span",{children:"Processing..."})]}):"Send"})]}),!o&&d.jsx("p",{className:"text-sm italic text-gray-400",children:"Click on an input field to enable this assistant"})]}),d.jsxs("div",{className:"relative flex-1",children:[d.jsx("h2",{className:"font-semibold text-transparent bg-gradient-to-r from-[#818cf8] to-[#4f46e5] bg-clip-text mb-3",children:"Page Assistant"}),d.jsxs("form",{onSubmit:l,className:"flex flex-col gap-3",children:[d.jsx("input",{type:"text",value:n,onChange:g=>s(g.target.value),placeholder:"Type 'summarize' or ask a question about the page...",className:"w-full p-3 placeholder-gray-500 transition-all duration-200 bg-[#1E1F2E] border border-[#2E2F3E] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-[#4f46e5]",autoFocus:!o}),d.jsx("button",{type:"submit",disabled:E,className:`w-full p-2.5 bg-gradient-to-r from-[#4f46e5] to-[#818cf8] text-white rounded-lg 
                        hover:opacity-90 focus:outline-none focus:ring-2 
                        focus:ring-[#4f46e5] focus:ring-offset-2 focus:ring-offset-[#1a1b2e]
                        transition-all duration-200 transform hover:scale-[0.98]
                        ${E?"opacity-75 cursor-not-allowed":""}`,children:E?d.jsxs("div",{className:"flex items-center justify-center gap-2",children:[d.jsx("div",{className:"w-4 h-4",children:d.jsx("svg",{viewBox:"0 0 50 50",children:d.jsx("path",{d:"M25,25 m-20,0 a20,20 0 1,1 40,0 a20,20 0 1,1 -40,0",fill:"none",stroke:"currentColor",strokeWidth:"3",strokeLinecap:"round",className:"animate-[dash_1.5s_ease-in-out_infinite]",style:{strokeDasharray:"90,150",strokeDashoffset:"-35",animation:"dash 1.5s ease-in-out infinite, rotate 2s linear infinite"}})})}),d.jsx("span",{children:"Processing..."})]}):"Send"})]})]})]})})}const $e=ae.createRoot(document.getElementById("root"));$e.render(d.jsx(re.StrictMode,{children:d.jsx(Pe,{})}));
