var background=function(){"use strict";var Ie,Ce,Se,Ae;function Re(e){return e==null||typeof e=="function"?{main:e}:e}const O=((Ce=(Ie=globalThis.browser)==null?void 0:Ie.runtime)==null?void 0:Ce.id)==null?globalThis.chrome:globalThis.browser;var Q;(function(e){e.STRING="string",e.NUMBER="number",e.INTEGER="integer",e.BOOLEAN="boolean",e.ARRAY="array",e.OBJECT="object"})(Q||(Q={}));/**
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
 */var Z;(function(e){e.LANGUAGE_UNSPECIFIED="language_unspecified",e.PYTHON="python"})(Z||(Z={}));var ee;(function(e){e.OUTCOME_UNSPECIFIED="outcome_unspecified",e.OUTCOME_OK="outcome_ok",e.OUTCOME_FAILED="outcome_failed",e.OUTCOME_DEADLINE_EXCEEDED="outcome_deadline_exceeded"})(ee||(ee={}));/**
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
 */const te=["user","model","function","system"];var ne;(function(e){e.HARM_CATEGORY_UNSPECIFIED="HARM_CATEGORY_UNSPECIFIED",e.HARM_CATEGORY_HATE_SPEECH="HARM_CATEGORY_HATE_SPEECH",e.HARM_CATEGORY_SEXUALLY_EXPLICIT="HARM_CATEGORY_SEXUALLY_EXPLICIT",e.HARM_CATEGORY_HARASSMENT="HARM_CATEGORY_HARASSMENT",e.HARM_CATEGORY_DANGEROUS_CONTENT="HARM_CATEGORY_DANGEROUS_CONTENT"})(ne||(ne={}));var se;(function(e){e.HARM_BLOCK_THRESHOLD_UNSPECIFIED="HARM_BLOCK_THRESHOLD_UNSPECIFIED",e.BLOCK_LOW_AND_ABOVE="BLOCK_LOW_AND_ABOVE",e.BLOCK_MEDIUM_AND_ABOVE="BLOCK_MEDIUM_AND_ABOVE",e.BLOCK_ONLY_HIGH="BLOCK_ONLY_HIGH",e.BLOCK_NONE="BLOCK_NONE"})(se||(se={}));var oe;(function(e){e.HARM_PROBABILITY_UNSPECIFIED="HARM_PROBABILITY_UNSPECIFIED",e.NEGLIGIBLE="NEGLIGIBLE",e.LOW="LOW",e.MEDIUM="MEDIUM",e.HIGH="HIGH"})(oe||(oe={}));var ie;(function(e){e.BLOCKED_REASON_UNSPECIFIED="BLOCKED_REASON_UNSPECIFIED",e.SAFETY="SAFETY",e.OTHER="OTHER"})(ie||(ie={}));var k;(function(e){e.FINISH_REASON_UNSPECIFIED="FINISH_REASON_UNSPECIFIED",e.STOP="STOP",e.MAX_TOKENS="MAX_TOKENS",e.SAFETY="SAFETY",e.RECITATION="RECITATION",e.LANGUAGE="LANGUAGE",e.OTHER="OTHER"})(k||(k={}));var re;(function(e){e.TASK_TYPE_UNSPECIFIED="TASK_TYPE_UNSPECIFIED",e.RETRIEVAL_QUERY="RETRIEVAL_QUERY",e.RETRIEVAL_DOCUMENT="RETRIEVAL_DOCUMENT",e.SEMANTIC_SIMILARITY="SEMANTIC_SIMILARITY",e.CLASSIFICATION="CLASSIFICATION",e.CLUSTERING="CLUSTERING"})(re||(re={}));var ae;(function(e){e.MODE_UNSPECIFIED="MODE_UNSPECIFIED",e.AUTO="AUTO",e.ANY="ANY",e.NONE="NONE"})(ae||(ae={}));var ce;(function(e){e.MODE_UNSPECIFIED="MODE_UNSPECIFIED",e.MODE_DYNAMIC="MODE_DYNAMIC"})(ce||(ce={}));/**
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
 */class R extends Error{constructor(t){super(`[GoogleGenerativeAI Error]: ${t}`)}}class G extends R{constructor(t,n){super(t),this.response=n}}class le extends R{constructor(t,n,s,o){super(t),this.status=n,this.statusText=s,this.errorDetails=o}}class M extends R{}/**
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
 */const be="https://generativelanguage.googleapis.com",Me="v1beta",Te="0.21.0",Ne="genai-js";var N;(function(e){e.GENERATE_CONTENT="generateContent",e.STREAM_GENERATE_CONTENT="streamGenerateContent",e.COUNT_TOKENS="countTokens",e.EMBED_CONTENT="embedContent",e.BATCH_EMBED_CONTENTS="batchEmbedContents"})(N||(N={}));class xe{constructor(t,n,s,o,i){this.model=t,this.task=n,this.apiKey=s,this.stream=o,this.requestOptions=i}toString(){var t,n;const s=((t=this.requestOptions)===null||t===void 0?void 0:t.apiVersion)||Me;let i=`${((n=this.requestOptions)===null||n===void 0?void 0:n.baseUrl)||be}/${s}/${this.model}:${this.task}`;return this.stream&&(i+="?alt=sse"),i}}function Ge(e){const t=[];return e!=null&&e.apiClient&&t.push(e.apiClient),t.push(`${Ne}/${Te}`),t.join(" ")}async function Le(e){var t;const n=new Headers;n.append("Content-Type","application/json"),n.append("x-goog-api-client",Ge(e.requestOptions)),n.append("x-goog-api-key",e.apiKey);let s=(t=e.requestOptions)===null||t===void 0?void 0:t.customHeaders;if(s){if(!(s instanceof Headers))try{s=new Headers(s)}catch(o){throw new M(`unable to convert customHeaders value ${JSON.stringify(s)} to Headers: ${o.message}`)}for(const[o,i]of s.entries()){if(o==="x-goog-api-key")throw new M(`Cannot set reserved header name ${o}`);if(o==="x-goog-api-client")throw new M(`Header name ${o} can only be set using the apiClient field`);n.append(o,i)}}return n}async function ke(e,t,n,s,o,i){const l=new xe(e,t,n,s,i);return{url:l.toString(),fetchOptions:Object.assign(Object.assign({},Ue(i)),{method:"POST",headers:await Le(l),body:o})}}async function K(e,t,n,s,o,i={},l=fetch){const{url:d,fetchOptions:g}=await ke(e,t,n,s,o,i);return Ke(d,g,l)}async function Ke(e,t,n=fetch){let s;try{s=await n(e,t)}catch(o){De(o,e)}return s.ok||await $e(s,e),s}function De(e,t){let n=e;throw e instanceof le||e instanceof M||(n=new R(`Error fetching from ${t.toString()}: ${e.message}`),n.stack=e.stack),n}async function $e(e,t){let n="",s;try{const o=await e.json();n=o.error.message,o.error.details&&(n+=` ${JSON.stringify(o.error.details)}`,s=o.error.details)}catch{}throw new le(`Error fetching from ${t.toString()}: [${e.status} ${e.statusText}] ${n}`,e.status,e.statusText,s)}function Ue(e){const t={};if((e==null?void 0:e.signal)!==void 0||(e==null?void 0:e.timeout)>=0){const n=new AbortController;(e==null?void 0:e.timeout)>=0&&setTimeout(()=>n.abort(),e.timeout),e!=null&&e.signal&&e.signal.addEventListener("abort",()=>{n.abort()}),t.signal=n.signal}return t}/**
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
 */function B(e){return e.text=()=>{if(e.candidates&&e.candidates.length>0){if(e.candidates.length>1&&console.warn(`This response had ${e.candidates.length} candidates. Returning text from the first candidate only. Access response.candidates directly to use the other candidates.`),j(e.candidates[0]))throw new G(`${T(e)}`,e);return Fe(e)}else if(e.promptFeedback)throw new G(`Text not available. ${T(e)}`,e);return""},e.functionCall=()=>{if(e.candidates&&e.candidates.length>0){if(e.candidates.length>1&&console.warn(`This response had ${e.candidates.length} candidates. Returning function calls from the first candidate only. Access response.candidates directly to use the other candidates.`),j(e.candidates[0]))throw new G(`${T(e)}`,e);return console.warn("response.functionCall() is deprecated. Use response.functionCalls() instead."),ue(e)[0]}else if(e.promptFeedback)throw new G(`Function call not available. ${T(e)}`,e)},e.functionCalls=()=>{if(e.candidates&&e.candidates.length>0){if(e.candidates.length>1&&console.warn(`This response had ${e.candidates.length} candidates. Returning function calls from the first candidate only. Access response.candidates directly to use the other candidates.`),j(e.candidates[0]))throw new G(`${T(e)}`,e);return ue(e)}else if(e.promptFeedback)throw new G(`Function call not available. ${T(e)}`,e)},e}function Fe(e){var t,n,s,o;const i=[];if(!((n=(t=e.candidates)===null||t===void 0?void 0:t[0].content)===null||n===void 0)&&n.parts)for(const l of(o=(s=e.candidates)===null||s===void 0?void 0:s[0].content)===null||o===void 0?void 0:o.parts)l.text&&i.push(l.text),l.executableCode&&i.push("\n```"+l.executableCode.language+`
`+l.executableCode.code+"\n```\n"),l.codeExecutionResult&&i.push("\n```\n"+l.codeExecutionResult.output+"\n```\n");return i.length>0?i.join(""):""}function ue(e){var t,n,s,o;const i=[];if(!((n=(t=e.candidates)===null||t===void 0?void 0:t[0].content)===null||n===void 0)&&n.parts)for(const l of(o=(s=e.candidates)===null||s===void 0?void 0:s[0].content)===null||o===void 0?void 0:o.parts)l.functionCall&&i.push(l.functionCall);if(i.length>0)return i}const je=[k.RECITATION,k.SAFETY,k.LANGUAGE];function j(e){return!!e.finishReason&&je.includes(e.finishReason)}function T(e){var t,n,s;let o="";if((!e.candidates||e.candidates.length===0)&&e.promptFeedback)o+="Response was blocked",!((t=e.promptFeedback)===null||t===void 0)&&t.blockReason&&(o+=` due to ${e.promptFeedback.blockReason}`),!((n=e.promptFeedback)===null||n===void 0)&&n.blockReasonMessage&&(o+=`: ${e.promptFeedback.blockReasonMessage}`);else if(!((s=e.candidates)===null||s===void 0)&&s[0]){const i=e.candidates[0];j(i)&&(o+=`Candidate was blocked due to ${i.finishReason}`,i.finishMessage&&(o+=`: ${i.finishMessage}`))}return o}function D(e){return this instanceof D?(this.v=e,this):new D(e)}function qe(e,t,n){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var s=n.apply(e,t||[]),o,i=[];return o={},l("next"),l("throw"),l("return"),o[Symbol.asyncIterator]=function(){return this},o;function l(y){s[y]&&(o[y]=function(m){return new Promise(function(C,c){i.push([y,m,C,c])>1||d(y,m)})})}function d(y,m){try{g(s[y](m))}catch(C){I(i[0][3],C)}}function g(y){y.value instanceof D?Promise.resolve(y.value.v).then(_,v):I(i[0][2],y)}function _(y){d("next",y)}function v(y){d("throw",y)}function I(y,m){y(m),i.shift(),i.length&&d(i[0][0],i[0][1])}}typeof SuppressedError=="function"&&SuppressedError;/**
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
 */const de=/^data\: (.*)(?:\n\n|\r\r|\r\n\r\n)/;function He(e){const t=e.body.pipeThrough(new TextDecoderStream("utf8",{fatal:!0})),n=Pe(t),[s,o]=n.tee();return{stream:Be(s),response:Ve(o)}}async function Ve(e){const t=[],n=e.getReader();for(;;){const{done:s,value:o}=await n.read();if(s)return B(Ye(t));t.push(o)}}function Be(e){return qe(this,arguments,function*(){const n=e.getReader();for(;;){const{value:s,done:o}=yield D(n.read());if(o)break;yield yield D(B(s))}})}function Pe(e){const t=e.getReader();return new ReadableStream({start(s){let o="";return i();function i(){return t.read().then(({value:l,done:d})=>{if(d){if(o.trim()){s.error(new R("Failed to parse stream"));return}s.close();return}o+=l;let g=o.match(de),_;for(;g;){try{_=JSON.parse(g[1])}catch{s.error(new R(`Error parsing JSON response: "${g[1]}"`));return}s.enqueue(_),o=o.substring(g[0].length),g=o.match(de)}return i()})}}})}function Ye(e){const t=e[e.length-1],n={promptFeedback:t==null?void 0:t.promptFeedback};for(const s of e){if(s.candidates)for(const o of s.candidates){const i=o.index;if(n.candidates||(n.candidates=[]),n.candidates[i]||(n.candidates[i]={index:o.index}),n.candidates[i].citationMetadata=o.citationMetadata,n.candidates[i].groundingMetadata=o.groundingMetadata,n.candidates[i].finishReason=o.finishReason,n.candidates[i].finishMessage=o.finishMessage,n.candidates[i].safetyRatings=o.safetyRatings,o.content&&o.content.parts){n.candidates[i].content||(n.candidates[i].content={role:o.content.role||"user",parts:[]});const l={};for(const d of o.content.parts)d.text&&(l.text=d.text),d.functionCall&&(l.functionCall=d.functionCall),d.executableCode&&(l.executableCode=d.executableCode),d.codeExecutionResult&&(l.codeExecutionResult=d.codeExecutionResult),Object.keys(l).length===0&&(l.text=""),n.candidates[i].content.parts.push(l)}}s.usageMetadata&&(n.usageMetadata=s.usageMetadata)}return n}/**
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
 */async function fe(e,t,n,s){const o=await K(t,N.STREAM_GENERATE_CONTENT,e,!0,JSON.stringify(n),s);return He(o)}async function he(e,t,n,s){const i=await(await K(t,N.GENERATE_CONTENT,e,!1,JSON.stringify(n),s)).json();return{response:B(i)}}/**
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
 */function ge(e){if(e!=null){if(typeof e=="string")return{role:"system",parts:[{text:e}]};if(e.text)return{role:"system",parts:[e]};if(e.parts)return e.role?e:{role:"system",parts:e.parts}}}function $(e){let t=[];if(typeof e=="string")t=[{text:e}];else for(const n of e)typeof n=="string"?t.push({text:n}):t.push(n);return We(t)}function We(e){const t={role:"user",parts:[]},n={role:"function",parts:[]};let s=!1,o=!1;for(const i of e)"functionResponse"in i?(n.parts.push(i),o=!0):(t.parts.push(i),s=!0);if(s&&o)throw new R("Within a single message, FunctionResponse cannot be mixed with other type of part in the request for sending chat message.");if(!s&&!o)throw new R("No content is provided for sending chat message.");return s?t:n}function Je(e,t){var n;let s={model:t==null?void 0:t.model,generationConfig:t==null?void 0:t.generationConfig,safetySettings:t==null?void 0:t.safetySettings,tools:t==null?void 0:t.tools,toolConfig:t==null?void 0:t.toolConfig,systemInstruction:t==null?void 0:t.systemInstruction,cachedContent:(n=t==null?void 0:t.cachedContent)===null||n===void 0?void 0:n.name,contents:[]};const o=e.generateContentRequest!=null;if(e.contents){if(o)throw new M("CountTokensRequest must have one of contents or generateContentRequest, not both.");s.contents=e.contents}else if(o)s=Object.assign(Object.assign({},s),e.generateContentRequest);else{const i=$(e);s.contents=[i]}return{generateContentRequest:s}}function me(e){let t;return e.contents?t=e:t={contents:[$(e)]},e.systemInstruction&&(t.systemInstruction=ge(e.systemInstruction)),t}function Xe(e){return typeof e=="string"||Array.isArray(e)?{content:$(e)}:e}/**
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
 */const ve=["text","inlineData","functionCall","functionResponse","executableCode","codeExecutionResult"],ze={user:["text","inlineData"],function:["functionResponse"],model:["text","functionCall","executableCode","codeExecutionResult"],system:["text"]};function Qe(e){let t=!1;for(const n of e){const{role:s,parts:o}=n;if(!t&&s!=="user")throw new R(`First content should be with role 'user', got ${s}`);if(!te.includes(s))throw new R(`Each item should include role field. Got ${s} but valid roles are: ${JSON.stringify(te)}`);if(!Array.isArray(o))throw new R("Content should have 'parts' property with an array of Parts");if(o.length===0)throw new R("Each Content should have at least one part");const i={text:0,inlineData:0,functionCall:0,functionResponse:0,fileData:0,executableCode:0,codeExecutionResult:0};for(const d of o)for(const g of ve)g in d&&(i[g]+=1);const l=ze[s];for(const d of ve)if(!l.includes(d)&&i[d]>0)throw new R(`Content with role '${s}' can't contain '${d}' part`);t=!0}}/**
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
 */const ye="SILENT_ERROR";class Ze{constructor(t,n,s,o={}){this.model=n,this.params=s,this._requestOptions=o,this._history=[],this._sendPromise=Promise.resolve(),this._apiKey=t,s!=null&&s.history&&(Qe(s.history),this._history=s.history)}async getHistory(){return await this._sendPromise,this._history}async sendMessage(t,n={}){var s,o,i,l,d,g;await this._sendPromise;const _=$(t),v={safetySettings:(s=this.params)===null||s===void 0?void 0:s.safetySettings,generationConfig:(o=this.params)===null||o===void 0?void 0:o.generationConfig,tools:(i=this.params)===null||i===void 0?void 0:i.tools,toolConfig:(l=this.params)===null||l===void 0?void 0:l.toolConfig,systemInstruction:(d=this.params)===null||d===void 0?void 0:d.systemInstruction,cachedContent:(g=this.params)===null||g===void 0?void 0:g.cachedContent,contents:[...this._history,_]},I=Object.assign(Object.assign({},this._requestOptions),n);let y;return this._sendPromise=this._sendPromise.then(()=>he(this._apiKey,this.model,v,I)).then(m=>{var C;if(m.response.candidates&&m.response.candidates.length>0){this._history.push(_);const c=Object.assign({parts:[],role:"model"},(C=m.response.candidates)===null||C===void 0?void 0:C[0].content);this._history.push(c)}else{const c=T(m.response);c&&console.warn(`sendMessage() was unsuccessful. ${c}. Inspect response object for details.`)}y=m}),await this._sendPromise,y}async sendMessageStream(t,n={}){var s,o,i,l,d,g;await this._sendPromise;const _=$(t),v={safetySettings:(s=this.params)===null||s===void 0?void 0:s.safetySettings,generationConfig:(o=this.params)===null||o===void 0?void 0:o.generationConfig,tools:(i=this.params)===null||i===void 0?void 0:i.tools,toolConfig:(l=this.params)===null||l===void 0?void 0:l.toolConfig,systemInstruction:(d=this.params)===null||d===void 0?void 0:d.systemInstruction,cachedContent:(g=this.params)===null||g===void 0?void 0:g.cachedContent,contents:[...this._history,_]},I=Object.assign(Object.assign({},this._requestOptions),n),y=fe(this._apiKey,this.model,v,I);return this._sendPromise=this._sendPromise.then(()=>y).catch(m=>{throw new Error(ye)}).then(m=>m.response).then(m=>{if(m.candidates&&m.candidates.length>0){this._history.push(_);const C=Object.assign({},m.candidates[0].content);C.role||(C.role="model"),this._history.push(C)}else{const C=T(m);C&&console.warn(`sendMessageStream() was unsuccessful. ${C}. Inspect response object for details.`)}}).catch(m=>{m.message!==ye&&console.error(m)}),y}}/**
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
 */async function et(e,t,n,s){return(await K(t,N.COUNT_TOKENS,e,!1,JSON.stringify(n),s)).json()}/**
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
 */async function tt(e,t,n,s){return(await K(t,N.EMBED_CONTENT,e,!1,JSON.stringify(n),s)).json()}async function nt(e,t,n,s){const o=n.requests.map(l=>Object.assign(Object.assign({},l),{model:t}));return(await K(t,N.BATCH_EMBED_CONTENTS,e,!1,JSON.stringify({requests:o}),s)).json()}/**
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
 */class Ee{constructor(t,n,s={}){this.apiKey=t,this._requestOptions=s,n.model.includes("/")?this.model=n.model:this.model=`models/${n.model}`,this.generationConfig=n.generationConfig||{},this.safetySettings=n.safetySettings||[],this.tools=n.tools,this.toolConfig=n.toolConfig,this.systemInstruction=ge(n.systemInstruction),this.cachedContent=n.cachedContent}async generateContent(t,n={}){var s;const o=me(t),i=Object.assign(Object.assign({},this._requestOptions),n);return he(this.apiKey,this.model,Object.assign({generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:(s=this.cachedContent)===null||s===void 0?void 0:s.name},o),i)}async generateContentStream(t,n={}){var s;const o=me(t),i=Object.assign(Object.assign({},this._requestOptions),n);return fe(this.apiKey,this.model,Object.assign({generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:(s=this.cachedContent)===null||s===void 0?void 0:s.name},o),i)}startChat(t){var n;return new Ze(this.apiKey,this.model,Object.assign({generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:(n=this.cachedContent)===null||n===void 0?void 0:n.name},t),this._requestOptions)}async countTokens(t,n={}){const s=Je(t,{model:this.model,generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:this.cachedContent}),o=Object.assign(Object.assign({},this._requestOptions),n);return et(this.apiKey,this.model,s,o)}async embedContent(t,n={}){const s=Xe(t),o=Object.assign(Object.assign({},this._requestOptions),n);return tt(this.apiKey,this.model,s,o)}async batchEmbedContents(t,n={}){const s=Object.assign(Object.assign({},this._requestOptions),n);return nt(this.apiKey,this.model,t,s)}}/**
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
 */class st{constructor(t){this.apiKey=t}getGenerativeModel(t,n){if(!t.model)throw new R("Must provide a model name. Example: genai.getGenerativeModel({ model: 'my-model-name' })");return new Ee(this.apiKey,t,n)}getGenerativeModelFromCachedContent(t,n,s){if(!t.name)throw new M("Cached content must contain a `name` field.");if(!t.model)throw new M("Cached content must contain a `model` field.");const o=["model","systemInstruction"];for(const l of o)if(n!=null&&n[l]&&t[l]&&(n==null?void 0:n[l])!==t[l]){if(l==="model"){const d=n.model.startsWith("models/")?n.model.replace("models/",""):n.model,g=t.model.startsWith("models/")?t.model.replace("models/",""):t.model;if(d===g)continue}throw new M(`Different value for "${l}" specified in modelParams (${n[l]}) and cachedContent (${t[l]})`)}const i=Object.assign(Object.assign({},n),{model:t.model,tools:t.tools,toolConfig:t.toolConfig,systemInstruction:t.systemInstruction,cachedContent:t});return new Ee(this.apiKey,i,s)}}var we=Object.prototype.hasOwnProperty;function P(e,t){var n,s;if(e===t)return!0;if(e&&t&&(n=e.constructor)===t.constructor){if(n===Date)return e.getTime()===t.getTime();if(n===RegExp)return e.toString()===t.toString();if(n===Array){if((s=e.length)===t.length)for(;s--&&P(e[s],t[s]););return s===-1}if(!n||typeof e=="object"){s=0;for(n in e)if(we.call(e,n)&&++s&&!we.call(t,n)||!(n in t)||!P(e[n],t[n]))return!1;return Object.keys(t).length===s}}return e!==e&&t!==t}const ot=new Error("request for lock canceled");var it=function(e,t,n,s){function o(i){return i instanceof n?i:new n(function(l){l(i)})}return new(n||(n=Promise))(function(i,l){function d(v){try{_(s.next(v))}catch(I){l(I)}}function g(v){try{_(s.throw(v))}catch(I){l(I)}}function _(v){v.done?i(v.value):o(v.value).then(d,g)}_((s=s.apply(e,t||[])).next())})};class rt{constructor(t,n=ot){this._value=t,this._cancelError=n,this._queue=[],this._weightedWaiters=[]}acquire(t=1,n=0){if(t<=0)throw new Error(`invalid weight ${t}: must be positive`);return new Promise((s,o)=>{const i={resolve:s,reject:o,weight:t,priority:n},l=pe(this._queue,d=>n<=d.priority);l===-1&&t<=this._value?this._dispatchItem(i):this._queue.splice(l+1,0,i)})}runExclusive(t){return it(this,arguments,void 0,function*(n,s=1,o=0){const[i,l]=yield this.acquire(s,o);try{return yield n(i)}finally{l()}})}waitForUnlock(t=1,n=0){if(t<=0)throw new Error(`invalid weight ${t}: must be positive`);return this._couldLockImmediately(t,n)?Promise.resolve():new Promise(s=>{this._weightedWaiters[t-1]||(this._weightedWaiters[t-1]=[]),at(this._weightedWaiters[t-1],{resolve:s,priority:n})})}isLocked(){return this._value<=0}getValue(){return this._value}setValue(t){this._value=t,this._dispatchQueue()}release(t=1){if(t<=0)throw new Error(`invalid weight ${t}: must be positive`);this._value+=t,this._dispatchQueue()}cancel(){this._queue.forEach(t=>t.reject(this._cancelError)),this._queue=[]}_dispatchQueue(){for(this._drainUnlockWaiters();this._queue.length>0&&this._queue[0].weight<=this._value;)this._dispatchItem(this._queue.shift()),this._drainUnlockWaiters()}_dispatchItem(t){const n=this._value;this._value-=t.weight,t.resolve([n,this._newReleaser(t.weight)])}_newReleaser(t){let n=!1;return()=>{n||(n=!0,this.release(t))}}_drainUnlockWaiters(){if(this._queue.length===0)for(let t=this._value;t>0;t--){const n=this._weightedWaiters[t-1];n&&(n.forEach(s=>s.resolve()),this._weightedWaiters[t-1]=[])}else{const t=this._queue[0].priority;for(let n=this._value;n>0;n--){const s=this._weightedWaiters[n-1];if(!s)continue;const o=s.findIndex(i=>i.priority<=t);(o===-1?s:s.splice(0,o)).forEach(i=>i.resolve())}}}_couldLockImmediately(t,n){return(this._queue.length===0||this._queue[0].priority<n)&&t<=this._value}}function at(e,t){const n=pe(e,s=>t.priority<=s.priority);e.splice(n+1,0,t)}function pe(e,t){for(let n=e.length-1;n>=0;n--)if(t(e[n]))return n;return-1}var ct=function(e,t,n,s){function o(i){return i instanceof n?i:new n(function(l){l(i)})}return new(n||(n=Promise))(function(i,l){function d(v){try{_(s.next(v))}catch(I){l(I)}}function g(v){try{_(s.throw(v))}catch(I){l(I)}}function _(v){v.done?i(v.value):o(v.value).then(d,g)}_((s=s.apply(e,t||[])).next())})};class lt{constructor(t){this._semaphore=new rt(1,t)}acquire(){return ct(this,arguments,void 0,function*(t=0){const[,n]=yield this._semaphore.acquire(1,t);return n})}runExclusive(t,n=0){return this._semaphore.runExclusive(()=>t(),1,n)}isLocked(){return this._semaphore.isLocked()}waitForUnlock(t=0){return this._semaphore.waitForUnlock(1,t)}release(){this._semaphore.isLocked()&&this._semaphore.release()}cancel(){return this._semaphore.cancel()}}const q=((Ae=(Se=globalThis.browser)==null?void 0:Se.runtime)==null?void 0:Ae.id)==null?globalThis.chrome:globalThis.browser,Y=ut();function ut(){const e={local:H("local"),session:H("session"),sync:H("sync"),managed:H("managed")},t=c=>{const a=e[c];if(a==null){const r=Object.keys(e).join(", ");throw Error(`Invalid area "${c}". Options: ${r}`)}return a},n=c=>{const a=c.indexOf(":"),r=c.substring(0,a),u=c.substring(a+1);if(u==null)throw Error(`Storage key should be in the form of "area:key", but received "${c}"`);return{driverArea:r,driverKey:u,driver:t(r)}},s=c=>c+"$",o=(c,a)=>{const r={...c};return Object.entries(a).forEach(([u,f])=>{f==null?delete r[u]:r[u]=f}),r},i=(c,a)=>c??a??null,l=c=>typeof c=="object"&&!Array.isArray(c)?c:{},d=async(c,a,r)=>{const u=await c.getItem(a);return i(u,(r==null?void 0:r.fallback)??(r==null?void 0:r.defaultValue))},g=async(c,a)=>{const r=s(a),u=await c.getItem(r);return l(u)},_=async(c,a,r)=>{await c.setItem(a,r??null)},v=async(c,a,r)=>{const u=s(a),f=l(await c.getItem(u));await c.setItem(u,o(f,r))},I=async(c,a,r)=>{if(await c.removeItem(a),r!=null&&r.removeMeta){const u=s(a);await c.removeItem(u)}},y=async(c,a,r)=>{const u=s(a);if(r==null)await c.removeItem(u);else{const f=l(await c.getItem(u));[r].flat().forEach(h=>delete f[h]),await c.setItem(u,f)}},m=(c,a,r)=>c.watch(a,r);return{getItem:async(c,a)=>{const{driver:r,driverKey:u}=n(c);return await d(r,u,a)},getItems:async c=>{const a=new Map,r=new Map,u=[];c.forEach(h=>{let E,w;typeof h=="string"?E=h:"getValue"in h?(E=h.key,w={fallback:h.fallback}):(E=h.key,w=h.options),u.push(E);const{driverArea:b,driverKey:S}=n(E),A=a.get(b)??[];a.set(b,A.concat(S)),r.set(E,w)});const f=new Map;return await Promise.all(Array.from(a.entries()).map(async([h,E])=>{(await e[h].getItems(E)).forEach(b=>{const S=`${h}:${b.key}`,A=r.get(S),p=i(b.value,(A==null?void 0:A.fallback)??(A==null?void 0:A.defaultValue));f.set(S,p)})})),u.map(h=>({key:h,value:f.get(h)}))},getMeta:async c=>{const{driver:a,driverKey:r}=n(c);return await g(a,r)},getMetas:async c=>{const a=c.map(f=>{const h=typeof f=="string"?f:f.key,{driverArea:E,driverKey:w}=n(h);return{key:h,driverArea:E,driverKey:w,driverMetaKey:s(w)}}),r=a.reduce((f,h)=>{var E;return f[E=h.driverArea]??(f[E]=[]),f[h.driverArea].push(h),f},{}),u={};return await Promise.all(Object.entries(r).map(async([f,h])=>{const E=await q.storage[f].get(h.map(w=>w.driverMetaKey));h.forEach(w=>{u[w.key]=E[w.driverMetaKey]??{}})})),a.map(f=>({key:f.key,meta:u[f.key]}))},setItem:async(c,a)=>{const{driver:r,driverKey:u}=n(c);await _(r,u,a)},setItems:async c=>{const a={};c.forEach(r=>{const{driverArea:u,driverKey:f}=n("key"in r?r.key:r.item.key);a[u]??(a[u]=[]),a[u].push({key:f,value:r.value})}),await Promise.all(Object.entries(a).map(async([r,u])=>{await t(r).setItems(u)}))},setMeta:async(c,a)=>{const{driver:r,driverKey:u}=n(c);await v(r,u,a)},setMetas:async c=>{const a={};c.forEach(r=>{const{driverArea:u,driverKey:f}=n("key"in r?r.key:r.item.key);a[u]??(a[u]=[]),a[u].push({key:f,properties:r.meta})}),await Promise.all(Object.entries(a).map(async([r,u])=>{const f=t(r),h=u.map(({key:S})=>s(S));console.log(r,h);const E=await f.getItems(h),w=Object.fromEntries(E.map(({key:S,value:A})=>[S,l(A)])),b=u.map(({key:S,properties:A})=>{const p=s(S);return{key:p,value:o(w[p]??{},A)}});await f.setItems(b)}))},removeItem:async(c,a)=>{const{driver:r,driverKey:u}=n(c);await I(r,u,a)},removeItems:async c=>{const a={};c.forEach(r=>{let u,f;typeof r=="string"?u=r:"getValue"in r?u=r.key:"item"in r?(u=r.item.key,f=r.options):(u=r.key,f=r.options);const{driverArea:h,driverKey:E}=n(u);a[h]??(a[h]=[]),a[h].push(E),f!=null&&f.removeMeta&&a[h].push(s(E))}),await Promise.all(Object.entries(a).map(async([r,u])=>{await t(r).removeItems(u)}))},clear:async c=>{await t(c).clear()},removeMeta:async(c,a)=>{const{driver:r,driverKey:u}=n(c);await y(r,u,a)},snapshot:async(c,a)=>{var f;const u=await t(c).snapshot();return(f=a==null?void 0:a.excludeKeys)==null||f.forEach(h=>{delete u[h],delete u[s(h)]}),u},restoreSnapshot:async(c,a)=>{await t(c).restoreSnapshot(a)},watch:(c,a)=>{const{driver:r,driverKey:u}=n(c);return m(r,u,a)},unwatch(){Object.values(e).forEach(c=>{c.unwatch()})},defineItem:(c,a)=>{const{driver:r,driverKey:u}=n(c),{version:f=1,migrations:h={}}=a??{};if(f<1)throw Error("Storage item version cannot be less than 1. Initial versions should be set to 1, not 0.");const E=async()=>{var Oe;const p=s(u),[{value:x},{value:L}]=await r.getItems([u,p]);if(x==null)return;const U=(L==null?void 0:L.v)??1;if(U>f)throw Error(`Version downgrade detected (v${U} -> v${f}) for "${c}"`);console.debug(`[@wxt-dev/storage] Running storage migration for ${c}: v${U} -> v${f}`);const wt=Array.from({length:f-U},(X,z)=>U+z+1);let F=x;for(const X of wt)try{F=await((Oe=h==null?void 0:h[X])==null?void 0:Oe.call(h,F))??F}catch(z){throw Error(`v${X} migration failed for "${c}"`,{cause:z})}await r.setItems([{key:u,value:F},{key:p,value:{...L,v:f}}]),console.debug(`[@wxt-dev/storage] Storage migration completed for ${c} v${f}`,{migratedValue:F})},w=(a==null?void 0:a.migrations)==null?Promise.resolve():E().catch(p=>{console.error(`[@wxt-dev/storage] Migration failed for ${c}`,p)}),b=new lt,S=()=>(a==null?void 0:a.fallback)??(a==null?void 0:a.defaultValue)??null,A=()=>b.runExclusive(async()=>{const p=await r.getItem(u);if(p!=null||(a==null?void 0:a.init)==null)return p;const x=await a.init();return await r.setItem(u,x),x});return w.then(A),{key:c,get defaultValue(){return S()},get fallback(){return S()},getValue:async()=>(await w,a!=null&&a.init?await A():await d(r,u,a)),getMeta:async()=>(await w,await g(r,u)),setValue:async p=>(await w,await _(r,u,p)),setMeta:async p=>(await w,await v(r,u,p)),removeValue:async p=>(await w,await I(r,u,p)),removeMeta:async p=>(await w,await y(r,u,p)),watch:p=>m(r,u,(x,L)=>p(x??S(),L??S())),migrate:E}}}}function H(e){const t=()=>{if(q.runtime==null)throw Error(["'wxt/storage' must be loaded in a web extension environment",`
 - If thrown during a build, see https://github.com/wxt-dev/wxt/issues/371`,` - If thrown during tests, mock 'wxt/browser' correctly. See https://wxt.dev/guide/go-further/testing.html
`].join(`
`));if(q.storage==null)throw Error("You must add the 'storage' permission to your manifest to use 'wxt/storage'");const s=q.storage[e];if(s==null)throw Error(`"browser.storage.${e}" is undefined`);return s},n=new Set;return{getItem:async s=>(await t().get(s))[s],getItems:async s=>{const o=await t().get(s);return s.map(i=>({key:i,value:o[i]??null}))},setItem:async(s,o)=>{o==null?await t().remove(s):await t().set({[s]:o})},setItems:async s=>{const o=s.reduce((i,{key:l,value:d})=>(i[l]=d,i),{});await t().set(o)},removeItem:async s=>{await t().remove(s)},removeItems:async s=>{await t().remove(s)},clear:async()=>{await t().clear()},snapshot:async()=>await t().get(),restoreSnapshot:async s=>{await t().set(s)},watch(s,o){const i=l=>{const d=l[s];d!=null&&(P(d.newValue,d.oldValue)||o(d.newValue??null,d.oldValue??null))};return t().onChanged.addListener(i),n.add(i),()=>{t().onChanged.removeListener(i),n.delete(i)}},unwatch(){n.forEach(s=>{t().onChanged.removeListener(s)}),n.clear()}}}const dt={messages:[]};Y.defineItem("local:chat",{fallback:dt});const ft={searchActive:!0,promptStyle:"short",continuePreviousChat:!1};Y.defineItem("sync:searchSettings",{fallback:ft});const ht={apiKey:""},gt=Y.defineItem("sync:apiKey",{fallback:ht});let _e,W;function mt(e){try{console.log("[SamAI Gemini] Initializing GoogleGenerativeAI"),_e=new st(e),console.log("[SamAI Gemini] Creating model instance"),W=_e.getGenerativeModel({model:"gemini-2.0-flash"}),console.log("[SamAI Gemini] Model initialized successfully")}catch(t){throw console.error("[SamAI Gemini] Error initializing model:",{message:t.message,stack:t.stack,errorType:t.constructor.name}),t}}async function vt(e){try{console.log("[SamAI Gemini] Generating response for prompt:",e);const t=await gt.getValue();if(console.log("[SamAI Gemini] Retrieved store:",{hasApiKey:!!t.apiKey}),!t.apiKey)return console.warn("[SamAI Gemini] No API key found in store"),null;W?console.log("[SamAI Gemini] Using existing model instance"):(console.log("[SamAI Gemini] Model not initialized, initializing with API key"),mt(t.apiKey)),console.log("[SamAI Gemini] Sending request to Gemini API");const n=await W.generateContent(e);if(console.log("[SamAI Gemini] Raw API response:",n),!n||!n.response)throw console.error("[SamAI Gemini] Empty response from API:",n),new Error("Empty response from Gemini API");if(!n.response.candidates||!n.response.candidates[0]||!n.response.candidates[0].content||!n.response.candidates[0].content.parts||!n.response.candidates[0].content.parts[0]||!n.response.candidates[0].content.parts[0].text)throw console.error("[SamAI Gemini] Invalid response structure:",n.response),new Error("No candidates in response from Gemini API");const s=n.response.candidates[0].content.parts[0].text;return console.log("[SamAI Gemini] Successfully generated response"),s.trim()}catch(t){return console.error("Error generating Gemini response:",{timestamp:new Date().toISOString(),message:t.message,stack:t.stack,errorType:t.constructor.name}),null}}const yt=Re(()=>{let e=null;O.contextMenus.create({id:"samai-context-menu",title:"Sam",contexts:["all"]}),O.runtime.onMessage.addListener((t,n,s)=>{if(console.log("[SamAI Background] Received message:",t),t.type==="generateGeminiResponse")return console.log("[SamAI Background] Attempting to generate Gemini response"),n.tab?(vt(t.prompt).then(o=>{o===null?console.error("[SamAI Background] Response generation failed - null response"):console.log("[SamAI Background] Successfully generated response"),console.log("[SamAI Background] Response text:",o),s(o)}).catch(o=>{console.error("[SamAI Background] Error generating response:",{message:o.message,stack:o.stack}),s(null)}),!0):(console.error("[SamAI Background] No sender tab found"),s(null),!0);if(t.type==="setInputValue"&&e)return O.tabs.sendMessage(e,t).then(o=>{s(o)}).catch(o=>{console.error("Error forwarding message:",o),s({success:!1,error:"Failed to forward message to content script"})}),!0}),O.contextMenus.onClicked.addListener(async(t,n)=>{if(n!=null&&n.id){e=n.id;try{console.log("Content script registered in tab:",n.id);const s={type:"getInputInfo"};console.log("Sending message to content script:",s);const o=await O.tabs.sendMessage(n.id,s);console.log("Background received response:",o);const i=await O.tabs.sendMessage(n.id,{type:"getPageContent"});console.log("[SamAI Background] Page content length:",(i==null?void 0:i.length)||0),o&&o.messageType==="inputInfo"?(console.log("Input info received:",o),await O.storage.local.set({inputInfo:{value:o.value||"",placeholder:o.placeholder||"",inputType:o.inputType||"",elementId:o.id||"",elementName:o.name||""},pageContent:i||"Unable to access page content"})):(await O.storage.local.remove("inputInfo"),await O.storage.local.set({pageContent:i||"Unable to access page content"})),O.windows.create({url:O.runtime.getURL("/context-popup.html"),type:"popup",width:400,height:450})}catch(s){console.error("Error in background script:",s),O.windows.create({url:O.runtime.getURL("/context-popup.html"),type:"popup",width:400,height:450})}}}),O.tabs.onRemoved.addListener(t=>{t===e&&(e=null)})});function pt(){}function V(e,...t){}const Et={debug:(...e)=>V(console.debug,...e),log:(...e)=>V(console.log,...e),warn:(...e)=>V(console.warn,...e),error:(...e)=>V(console.error,...e)};let J;try{J=yt.main(),J instanceof Promise&&console.warn("The background's main() function return a promise, but it must be synchronous")}catch(e){throw Et.error("The background crashed on startup!"),e}return J}();
background;
