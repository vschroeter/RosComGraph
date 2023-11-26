import{c as F,b as ie,Q as D,i as me}from"./QSpinner-f7fe29b3.js";import{c as S,h as u,g as ae,a as qe,T as Ce,r as $,a1 as Se,w as H,b as re,al as Ke,s as Z,C as we,aq as Ee,ac as X,E as Ae,F as Ne,a9 as $e,J as ee,K as Be,L as P,R as Qe,M as z,N as te,Z as le,ag as ze,O as Fe,Q as Le}from"./index-d8ad34b5.js";import{Q as Oe}from"./QSeparator-f888f88f.js";import{u as ce,a as oe,f as Pe,g as Ie,h as Me}from"./use-checkbox-83d67318.js";import{b as Re,Q as je}from"./directives-333953e0.js";const ne=F({name:"QCardSection",props:{tag:{type:String,default:"div"},horizontal:Boolean},setup(l,{slots:g}){const s=S(()=>`q-card__section q-card__section--${l.horizontal===!0?"horiz row no-wrap":"vert"}`);return()=>u(l.tag,{class:s.value},ie(g.default))}}),De=F({name:"QCard",props:{...ce,tag:{type:String,default:"div"},square:Boolean,flat:Boolean,bordered:Boolean},setup(l,{slots:g}){const{proxy:{$q:s}}=ae(),h=oe(l,s),x=S(()=>"q-card"+(h.value===!0?" q-card--dark q-dark":"")+(l.bordered===!0?" q-card--bordered":"")+(l.square===!0?" q-card--square no-border-radius":"")+(l.flat===!0?" q-card--flat no-shadow":""));return()=>u(l.tag,{class:x.value},ie(g.default))}}),He=u("div",{key:"svg",class:"q-checkbox__bg absolute"},[u("svg",{class:"q-checkbox__svg fit absolute-full",viewBox:"0 0 24 24"},[u("path",{class:"q-checkbox__truthy",fill:"none",d:"M1.73,12.91 8.1,19.28 22.79,4.59"}),u("path",{class:"q-checkbox__indet",d:"M4,14H20V10H4"})])]),Ve=F({name:"QCheckbox",props:Pe,emits:Ie,setup(l){function g(s,h){const x=S(()=>(s.value===!0?l.checkedIcon:h.value===!0?l.indeterminateIcon:l.uncheckedIcon)||null);return()=>x.value!==null?[u("div",{key:"icon",class:"q-checkbox__icon-container absolute-full flex flex-center no-wrap"},[u(D,{class:"q-checkbox__icon",name:x.value})])]:[He]}return Me("checkbox",g)}}),Ue=F({name:"QSlideTransition",props:{appear:Boolean,duration:{type:Number,default:300}},emits:["show","hide"],setup(l,{slots:g,emit:s}){let h=!1,x,E,v=null,m=null,o,k;function _(){x&&x(),x=null,h=!1,v!==null&&(clearTimeout(v),v=null),m!==null&&(clearTimeout(m),m=null),E!==void 0&&E.removeEventListener("transitionend",o),o=null}function N(r,w,y){w!==void 0&&(r.style.height=`${w}px`),r.style.transition=`height ${l.duration}ms cubic-bezier(.25, .8, .50, 1)`,h=!0,x=y}function q(r,w){r.style.overflowY=null,r.style.height=null,r.style.transition=null,_(),w!==k&&s(w)}function K(r,w){let y=0;E=r,h===!0?(_(),y=r.offsetHeight===r.scrollHeight?0:void 0):(k="hide",r.style.overflowY="hidden"),N(r,y,w),v=setTimeout(()=>{v=null,r.style.height=`${r.scrollHeight}px`,o=C=>{m=null,(Object(C)!==C||C.target===r)&&q(r,"show")},r.addEventListener("transitionend",o),m=setTimeout(o,l.duration*1.1)},100)}function A(r,w){let y;E=r,h===!0?_():(k="show",r.style.overflowY="hidden",y=r.scrollHeight),N(r,y,w),v=setTimeout(()=>{v=null,r.style.height=0,o=C=>{m=null,(Object(C)!==C||C.target===r)&&q(r,"hide")},r.addEventListener("transitionend",o),m=setTimeout(o,l.duration*1.1)},100)}return qe(()=>{h===!0&&_()}),()=>u(Ce,{css:!1,appear:l.appear,onEnter:K,onLeave:A},g.default)}}),Ye=["none","strict","leaf","leaf-filtered"],pe=F({name:"QTree",props:{...ce,nodes:{type:Array,required:!0},nodeKey:{type:String,required:!0},labelKey:{type:String,default:"label"},childrenKey:{type:String,default:"children"},dense:Boolean,color:String,controlColor:String,textColor:String,selectedColor:String,icon:String,tickStrategy:{type:String,default:"none",validator:l=>Ye.includes(l)},ticked:Array,expanded:Array,selected:{},noSelectionUnset:Boolean,defaultExpandAll:Boolean,accordion:Boolean,filter:String,filterMethod:Function,duration:Number,noConnectors:Boolean,noTransition:Boolean,noNodesLabel:String,noResultsLabel:String},emits:["update:expanded","update:ticked","update:selected","lazyLoad","afterShow","afterHide"],setup(l,{slots:g,emit:s}){const{proxy:h}=ae(),{$q:x}=h,E=oe(l,x),v=$({}),m=$(l.ticked||[]),o=$(l.expanded||[]);let k={};Se(()=>{k={}});const _=S(()=>`q-tree q-tree--${l.dense===!0?"dense":"standard"}`+(l.noConnectors===!0?" q-tree--no-connectors":"")+(E.value===!0?" q-tree--dark":"")+(l.color!==void 0?` text-${l.color}`:"")),N=S(()=>l.selected!==void 0),q=S(()=>l.icon||x.iconSet.tree.icon),K=S(()=>l.controlColor||l.color),A=S(()=>l.textColor!==void 0?` text-${l.textColor}`:""),r=S(()=>{const t=l.selectedColor||l.color;return t?` text-${t}`:""}),w=S(()=>l.filterMethod!==void 0?l.filterMethod:(t,n)=>{const e=n.toLowerCase();return t[l.labelKey]&&t[l.labelKey].toLowerCase().indexOf(e)>-1}),y=S(()=>{const t={},n=(e,a)=>{const i=e.tickStrategy||(a?a.tickStrategy:l.tickStrategy),d=e[l.nodeKey],f=e[l.childrenKey]&&Array.isArray(e[l.childrenKey])&&e[l.childrenKey].length!==0,B=e.disabled!==!0&&N.value===!0&&e.selectable!==!1,T=e.disabled!==!0&&e.expandable!==!1,_e=i!=="none",O=i==="strict",J=i==="leaf-filtered",R=i==="leaf"||i==="leaf-filtered";let j=e.disabled!==!0&&e.tickable!==!1;R===!0&&j===!0&&a&&a.tickable!==!0&&(j=!1);let Q=e.lazy;Q===!0&&v.value[d]!==void 0&&Array.isArray(e[l.childrenKey])===!0&&(Q=v.value[d]);const c={key:d,parent:a,isParent:f,lazy:Q,disabled:e.disabled,link:e.disabled!==!0&&(B===!0||T===!0&&(f===!0||Q===!0)),children:[],matchesFilter:l.filter?w.value(e,l.filter):!0,selected:d===l.selected&&B===!0,selectable:B,expanded:f===!0?o.value.includes(d):!1,expandable:T,noTick:e.noTick===!0||O!==!0&&Q&&Q!=="loaded",tickable:j,tickStrategy:i,hasTicking:_e,strictTicking:O,leafFilteredTicking:J,leafTicking:R,ticked:O===!0?m.value.includes(d):f===!0?!1:m.value.includes(d)};if(t[d]=c,f===!0&&(c.children=e[l.childrenKey].map(b=>n(b,c)),l.filter&&(c.matchesFilter!==!0?c.matchesFilter=c.children.some(b=>b.matchesFilter):c.noTick!==!0&&c.disabled!==!0&&c.tickable===!0&&J===!0&&c.children.every(b=>b.matchesFilter!==!0||b.noTick===!0||b.tickable!==!0)===!0&&(c.tickable=!1)),c.matchesFilter===!0&&(c.noTick!==!0&&O!==!0&&c.children.every(b=>b.noTick)===!0&&(c.noTick=!0),R))){if(c.ticked=!1,c.indeterminate=c.children.some(b=>b.indeterminate===!0),c.tickable=c.tickable===!0&&c.children.some(b=>b.tickable),c.indeterminate!==!0){const b=c.children.reduce((W,Te)=>Te.ticked===!0?W+1:W,0);b===c.children.length?c.ticked=!0:b>0&&(c.indeterminate=!0)}c.indeterminate===!0&&(c.indeterminateNextState=c.children.every(b=>b.tickable!==!0||b.ticked!==!0))}return c};return l.nodes.forEach(e=>n(e,null)),t});H(()=>l.ticked,t=>{m.value=t}),H(()=>l.expanded,t=>{o.value=t});function C(t){const n=[].reduce,e=(a,i)=>{if(a||!i)return a;if(Array.isArray(i)===!0)return n.call(Object(i),e,a);if(i[l.nodeKey]===t)return i;if(i[l.childrenKey])return e(null,i[l.childrenKey])};return e(null,l.nodes)}function de(){return m.value.map(t=>C(t))}function ue(){return o.value.map(t=>C(t))}function se(t){return t&&y.value[t]?y.value[t].expanded:!1}function fe(){l.expanded!==void 0?s("update:expanded",[]):o.value=[]}function V(){const t=[],n=e=>{e[l.childrenKey]&&e[l.childrenKey].length!==0&&e.expandable!==!1&&e.disabled!==!0&&(t.push(e[l.nodeKey]),e[l.childrenKey].forEach(n))};l.nodes.forEach(n),l.expanded!==void 0?s("update:expanded",t):o.value=t}function I(t,n,e=C(t),a=y.value[t]){if(a.lazy&&a.lazy!=="loaded"){if(a.lazy==="loading")return;v.value[t]="loading",Array.isArray(e[l.childrenKey])!==!0&&(e[l.childrenKey]=[]),s("lazyLoad",{node:e,key:t,done:i=>{v.value[t]="loaded",e[l.childrenKey]=Array.isArray(i)===!0?i:[],re(()=>{const d=y.value[t];d&&d.isParent===!0&&U(t,!0)})},fail:()=>{delete v.value[t],e[l.childrenKey].length===0&&delete e[l.childrenKey]}})}else a.isParent===!0&&a.expandable===!0&&U(t,n)}function U(t,n){let e=o.value;const a=l.expanded!==void 0;if(a===!0&&(e=e.slice()),n){if(l.accordion&&y.value[t]){const i=[];y.value[t].parent?y.value[t].parent.children.forEach(d=>{d.key!==t&&d.expandable===!0&&i.push(d.key)}):l.nodes.forEach(d=>{const f=d[l.nodeKey];f!==t&&i.push(f)}),i.length!==0&&(e=e.filter(d=>i.includes(d)===!1))}e=e.concat([t]).filter((i,d,f)=>f.indexOf(i)===d)}else e=e.filter(i=>i!==t);a===!0?s("update:expanded",e):o.value=e}function he(t){return t&&y.value[t]?y.value[t].ticked:!1}function L(t,n){let e=m.value;const a=l.ticked!==void 0;a===!0&&(e=e.slice()),n?e=e.concat(t).filter((i,d,f)=>f.indexOf(i)===d):e=e.filter(i=>t.includes(i)===!1),a===!0&&s("update:ticked",e)}function ve(t,n,e){const a={tree:h,node:t,key:e,color:l.color,dark:E.value};return X(a,"expanded",()=>n.expanded,i=>{i!==n.expanded&&I(e,i)}),X(a,"ticked",()=>n.ticked,i=>{i!==n.ticked&&L([e],i)}),a}function Y(t){return(l.filter?t.filter(n=>y.value[n[l.nodeKey]].matchesFilter):t).map(n=>ge(n))}function ye(t){if(t.icon!==void 0)return u(D,{class:"q-tree__icon q-mr-sm",name:t.icon,color:t.iconColor});const n=t.img||t.avatar;if(n)return u("img",{class:`q-tree__${t.img?"img":"avatar"} q-mr-sm`,src:n})}function be(){s("afterShow")}function ke(){s("afterHide")}function ge(t){const n=t[l.nodeKey],e=y.value[n],a=t.header&&g[`header-${t.header}`]||g["default-header"],i=e.isParent===!0?Y(t[l.childrenKey]):[],d=i.length!==0||e.lazy&&e.lazy!=="loaded";let f=t.body&&g[`body-${t.body}`]||g["default-body"];const B=a!==void 0||f!==void 0?ve(t,e,n):null;return f!==void 0&&(f=u("div",{class:"q-tree__node-body relative-position"},[u("div",{class:A.value},[f(B)])])),u("div",{key:n,class:`q-tree__node relative-position q-tree__node--${d===!0?"parent":"child"}`},[u("div",{class:"q-tree__node-header relative-position row no-wrap items-center"+(e.link===!0?" q-tree__node--link q-hoverable q-focusable":"")+(e.selected===!0?" q-tree__node--selected":"")+(e.disabled===!0?" q-tree__node--disabled":""),tabindex:e.link===!0?0:-1,ariaExpanded:i.length>0?e.expanded:null,role:"treeitem",onClick:T=>{G(t,e,T)},onKeypress(T){Ke(T)!==!0&&(T.keyCode===13?G(t,e,T,!0):T.keyCode===32&&M(t,e,T,!0))}},[u("div",{class:"q-focus-helper",tabindex:-1,ref:T=>{k[e.key]=T}}),e.lazy==="loading"?u(me,{class:"q-tree__spinner",color:K.value}):d===!0?u(D,{class:"q-tree__arrow"+(e.expanded===!0?" q-tree__arrow--rotate":""),name:q.value,onClick(T){M(t,e,T)}}):null,e.hasTicking===!0&&e.noTick!==!0?u(Ve,{class:"q-tree__tickbox",modelValue:e.indeterminate===!0?null:e.ticked,color:K.value,dark:E.value,dense:!0,keepColor:!0,disable:e.tickable!==!0,onKeydown:Z,"onUpdate:modelValue":T=>{xe(e,T)}}):null,u("div",{class:"q-tree__node-header-content col row no-wrap items-center"+(e.selected===!0?r.value:A.value)},[a?a(B):[ye(t),u("div",t[l.labelKey])]])]),d===!0?l.noTransition===!0?e.expanded===!0?u("div",{class:"q-tree__node-collapsible"+A.value,key:`${n}__q`},[f,u("div",{class:"q-tree__children"+(e.disabled===!0?" q-tree__node--disabled":""),role:"group"},i)]):null:u(Ue,{duration:l.duration,onShow:be,onHide:ke},()=>we(u("div",{class:"q-tree__node-collapsible"+A.value,key:`${n}__q`},[f,u("div",{class:"q-tree__children"+(e.disabled===!0?" q-tree__node--disabled":""),role:"group"},i)]),[[Ee,e.expanded]])):f])}function p(t){const n=k[t];n&&n.focus()}function G(t,n,e,a){a!==!0&&n.selectable!==!1&&p(n.key),N.value&&n.selectable?l.noSelectionUnset===!1?s("update:selected",n.key!==l.selected?n.key:null):n.key!==l.selected&&s("update:selected",n.key===void 0?null:n.key):M(t,n,e,a),typeof t.handler=="function"&&t.handler(t)}function M(t,n,e,a){e!==void 0&&Z(e),a!==!0&&n.selectable!==!1&&p(n.key),I(n.key,!n.expanded,t,n)}function xe(t,n){if(t.indeterminate===!0&&(n=t.indeterminateNextState),t.strictTicking)L([t.key],n);else if(t.leafTicking){const e=[],a=i=>{i.isParent?(n!==!0&&i.noTick!==!0&&i.tickable===!0&&e.push(i.key),i.leafTicking===!0&&i.children.forEach(a)):i.noTick!==!0&&i.tickable===!0&&(i.leafFilteredTicking!==!0||i.matchesFilter===!0)&&e.push(i.key)};a(t),L(e,n)}}return l.defaultExpandAll===!0&&V(),Object.assign(h,{getNodeByKey:C,getTickedNodes:de,getExpandedNodes:ue,isExpanded:se,collapseAll:fe,expandAll:V,setExpanded:I,isTicked:he,setTicked:L}),()=>{const t=Y(l.nodes);return u("div",{class:_.value,role:"tree"},t.length===0?l.filter?l.noResultsLabel||x.lang.tree.noResults:l.noNodesLabel||x.lang.tree.noNodes:t)}}}),Ge={key:0},Je={class:"text-h6"},We={class:"text-subtitle2"},nt=Ae({__name:"MainRightDrawer",setup(l){const g=$(null),s=$(null),h=Ne(),x=$(null);Re(()=>{var o;return(o=x.value)==null?void 0:o.bBox},10,0,0);const E=$(200);$e(g,o=>{const k=o[0],{width:_,height:N}=k.contentRect;E.value=_});const v=$(null);H(()=>h.selectedTopic,()=>{var o;if(h.selectedTopic){v.value=h.selectedTopic;const k=h.selectedTopic;if(k.messageType.definition)return;(o=h.systemInfoConnection)==null||o.getTopicTypeInfo(k).then(_=>{k.messageType.definition=_.definition}).catch(_=>{console.error("TOPIC TYPE INFO ERROR:",_)})}});const m=S(()=>{var N;const o=(N=v.value)==null?void 0:N.messageType.definition;if(!o)return[{label:"No definition available"}];const k=[];function _(q,K){return typeof q=="object"?Array.isArray(q)?{label:`${K} (Array)`,children:q.map((A,r)=>_(A,`${K}[${r}]`))}:{label:`${K}`,children:Object.entries(q).map(([A,r])=>_(r,A))}:{label:`${K} (${q})`}}return Object.entries(o).forEach(([q,K])=>{k.push(_(K,q))}),re(()=>{var q;(q=s.value)==null||q.expandAll()}),k.length==0?[{label:"–"}]:k});return(o,k)=>(ee(),Be(je,{class:"column items-stretch justify-start"},{default:P(()=>[v.value?(ee(),Qe("div",Ge,[z(De,{class:"q-ma-md"},{default:P(()=>[z(ne,null,{default:P(()=>[te("div",Je,le(v.value.name),1),te("div",We,le(v.value.messageType.name),1)]),_:1}),z(Oe,{dark:"",inset:""}),z(ne,null,{default:P(()=>[ze(" Message Type Definition: "),z(Fe(pe),{ref_key:"refTree",ref:s,nodes:m.value,"node-key":"label","default-expand-all":!0},null,8,["nodes"])]),_:1})]),_:1})])):Le("",!0)]),_:1}))}});export{nt as default};