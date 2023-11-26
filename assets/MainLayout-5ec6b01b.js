import{Q as Ae}from"./QBtn-d681477c.js";import{c as E,u as ut,a as st,Q as $t,h as kt,b as fe,d as Bt,e as ve,f as Vt,g as Ne,i as Et}from"./QSpinner-f7fe29b3.js";import{c as d,h as q,r as T,i as Pe,o as te,a as X,n as Oe,b as de,g as R,l as D,d as oe,e as O,w as x,f as le,p as dt,j as Pt,k as ae,m as Ot,H as Ie,q as Q,s as ct,t as Qt,u as Dt,v as ie,x as qe,y as Xe,z as Se,A as Ve,B as Ce,C as Ee,T as Ht,D as Mt,E as Rt,F as Ft,G,I as Wt,J as je,K as Ue,L as k,M as L,N as A,O as B,P as _e,Q as At}from"./index-d8ad34b5.js";import{g as Nt,a as ft,b as vt,c as xe,h as It,d as Xt,u as jt,e as Ut,f as Yt,i as Kt,j as Gt,k as Jt,Q as Zt,l as eo}from"./use-transition-4337363c.js";import{u as Qe,a as De}from"./use-checkbox-83d67318.js";const to=E({name:"QAvatar",props:{...ut,fontSize:String,color:String,textColor:String,icon:String,square:Boolean,rounded:Boolean},setup(e,{slots:o}){const n=st(e),r=d(()=>"q-avatar"+(e.color?` bg-${e.color}`:"")+(e.textColor?` text-${e.textColor} q-chip--colored`:"")+(e.square===!0?" q-avatar--square":e.rounded===!0?" rounded-borders":"")),t=d(()=>e.fontSize?{fontSize:e.fontSize}:null);return()=>{const l=e.icon!==void 0?[q($t,{name:e.icon})]:void 0;return q("div",{class:r.value,style:n.value},[q("div",{class:"q-avatar__content row flex-center overflow-hidden",style:t.value},kt(o.default,l))])}}}),oo=E({name:"QToolbarTitle",props:{shrink:Boolean},setup(e,{slots:o}){const n=d(()=>"q-toolbar__title ellipsis"+(e.shrink===!0?" col-shrink":""));return()=>q("div",{class:n.value},fe(o.default))}}),Ye=E({name:"QToolbar",props:{inset:Boolean},setup(e,{slots:o}){const n=d(()=>"q-toolbar row no-wrap items-center"+(e.inset===!0?" q-toolbar--inset":""));return()=>q("div",{class:n.value,role:"toolbar"},fe(o.default))}});function lo(){const e=T(!Pe.value);return e.value===!1&&te(()=>{e.value=!0}),e}const ht=typeof ResizeObserver!="undefined",Ke=ht===!0?{}:{style:"display:block;position:absolute;top:0;left:0;right:0;bottom:0;height:100%;width:100%;overflow:hidden;pointer-events:none;z-index:-1;",url:"about:blank"},ce=E({name:"QResizeObserver",props:{debounce:{type:[String,Number],default:100}},emits:["resize"],setup(e,{emit:o}){let n=null,r,t={width:-1,height:-1};function l(c){c===!0||e.debounce===0||e.debounce==="0"?a():n===null&&(n=setTimeout(a,e.debounce))}function a(){if(n!==null&&(clearTimeout(n),n=null),r){const{offsetWidth:c,offsetHeight:s}=r;(c!==t.width||s!==t.height)&&(t={width:c,height:s},o("resize",t))}}const{proxy:h}=R();if(ht===!0){let c;const s=i=>{r=h.$el.parentNode,r?(c=new ResizeObserver(l),c.observe(r),a()):i!==!0&&de(()=>{s(!0)})};return te(()=>{s()}),X(()=>{n!==null&&clearTimeout(n),c!==void 0&&(c.disconnect!==void 0?c.disconnect():r&&c.unobserve(r))}),Oe}else{let i=function(){n!==null&&(clearTimeout(n),n=null),s!==void 0&&(s.removeEventListener!==void 0&&s.removeEventListener("resize",l,D.passive),s=void 0)},C=function(){i(),r&&r.contentDocument&&(s=r.contentDocument.defaultView,s.addEventListener("resize",l,D.passive),a())};const c=lo();let s;return te(()=>{de(()=>{r=h.$el,r&&C()})}),X(i),h.trigger=l,()=>{if(c.value===!0)return q("object",{style:Ke.style,tabindex:-1,type:"text/html",data:Ke.url,"aria-hidden":"true",onLoad:C})}}}}),no=E({name:"QHeader",props:{modelValue:{type:Boolean,default:!0},reveal:Boolean,revealOffset:{type:Number,default:250},bordered:Boolean,elevated:Boolean,heightHint:{type:[String,Number],default:50}},emits:["reveal","focusin"],setup(e,{slots:o,emit:n}){const{proxy:{$q:r}}=R(),t=oe(le,O);if(t===O)return console.error("QHeader needs to be child of QLayout"),O;const l=T(parseInt(e.heightHint,10)),a=T(!0),h=d(()=>e.reveal===!0||t.view.value.indexOf("H")>-1||r.platform.is.ios&&t.isContainer.value===!0),c=d(()=>{if(e.modelValue!==!0)return 0;if(h.value===!0)return a.value===!0?l.value:0;const g=l.value-t.scroll.value.position;return g>0?g:0}),s=d(()=>e.modelValue!==!0||h.value===!0&&a.value!==!0),i=d(()=>e.modelValue===!0&&s.value===!0&&e.reveal===!0),C=d(()=>"q-header q-layout__section--marginal "+(h.value===!0?"fixed":"absolute")+"-top"+(e.bordered===!0?" q-header--bordered":"")+(s.value===!0?" q-header--hidden":"")+(e.modelValue!==!0?" q-layout--prevent-focus":"")),S=d(()=>{const g=t.rows.value.top,$={};return g[0]==="l"&&t.left.space===!0&&($[r.lang.rtl===!0?"right":"left"]=`${t.left.size}px`),g[2]==="r"&&t.right.space===!0&&($[r.lang.rtl===!0?"left":"right"]=`${t.right.size}px`),$});function m(g,$){t.update("header",g,$)}function v(g,$){g.value!==$&&(g.value=$)}function w({height:g}){v(l,g),m("size",g)}function _(g){i.value===!0&&v(a,!0),n("focusin",g)}x(()=>e.modelValue,g=>{m("space",g),v(a,!0),t.animate()}),x(c,g=>{m("offset",g)}),x(()=>e.reveal,g=>{g===!1&&v(a,e.modelValue)}),x(a,g=>{t.animate(),n("reveal",g)}),x(t.scroll,g=>{e.reveal===!0&&v(a,g.direction==="up"||g.position<=e.revealOffset||g.position-g.inflectionPoint<100)});const b={};return t.instances.header=b,e.modelValue===!0&&m("size",l.value),m("space",e.modelValue),m("offset",c.value),X(()=>{t.instances.header===b&&(t.instances.header=void 0,m("size",0),m("offset",0),m("space",!1))}),()=>{const g=Bt(o.default,[]);return e.elevated===!0&&g.push(q("div",{class:"q-layout__shadow absolute-full overflow-hidden no-pointer-events"})),g.push(q(ce,{debounce:0,onResize:w})),q("header",{class:C.value,style:S.value,onFocusin:_},g)}}}),ze=E({name:"QPageContainer",setup(e,{slots:o}){const{proxy:{$q:n}}=R(),r=oe(le,O);if(r===O)return console.error("QPageContainer needs to be child of QLayout"),O;dt(Pt,!0);const t=d(()=>{const l={};return r.header.space===!0&&(l.paddingTop=`${r.header.size}px`),r.right.space===!0&&(l[`padding${n.lang.rtl===!0?"Left":"Right"}`]=`${r.right.size}px`),r.footer.space===!0&&(l.paddingBottom=`${r.footer.size}px`),r.left.space===!0&&(l[`padding${n.lang.rtl===!0?"Right":"Left"}`]=`${r.left.size}px`),l});return()=>q("div",{class:"q-page-container",style:t.value},fe(o.default))}}),{passive:Ge}=D,ro=["both","horizontal","vertical"],ao=E({name:"QScrollObserver",props:{axis:{type:String,validator:e=>ro.includes(e),default:"vertical"},debounce:[String,Number],scrollTarget:{default:void 0}},emits:["scroll"],setup(e,{emit:o}){const n={position:{top:0,left:0},direction:"down",directionChanged:!1,delta:{top:0,left:0},inflectionPoint:{top:0,left:0}};let r=null,t,l;x(()=>e.scrollTarget,()=>{c(),h()});function a(){r!==null&&r();const C=Math.max(0,ft(t)),S=vt(t),m={top:C-n.position.top,left:S-n.position.left};if(e.axis==="vertical"&&m.top===0||e.axis==="horizontal"&&m.left===0)return;const v=Math.abs(m.top)>=Math.abs(m.left)?m.top<0?"up":"down":m.left<0?"left":"right";n.position={top:C,left:S},n.directionChanged=n.direction!==v,n.delta=m,n.directionChanged===!0&&(n.direction=v,n.inflectionPoint=n.position),o("scroll",{...n})}function h(){t=Nt(l,e.scrollTarget),t.addEventListener("scroll",s,Ge),s(!0)}function c(){t!==void 0&&(t.removeEventListener("scroll",s,Ge),t=void 0)}function s(C){if(C===!0||e.debounce===0||e.debounce==="0")a();else if(r===null){const[S,m]=e.debounce?[setTimeout(a,e.debounce),clearTimeout]:[requestAnimationFrame(a),cancelAnimationFrame];r=()=>{m(S),r=null}}}const{proxy:i}=R();return x(()=>i.$q.lang.rtl,a),te(()=>{l=i.$el.parentNode,h()}),X(()=>{r!==null&&r(),c()}),Object.assign(i,{trigger:s,getPosition:()=>n}),Oe}}),Le=E({name:"QLayout",props:{container:Boolean,view:{type:String,default:"hhh lpr fff",validator:e=>/^(h|l)h(h|r) lpr (f|l)f(f|r)$/.test(e.toLowerCase())},onScroll:Function,onScrollHeight:Function,onResize:Function},setup(e,{slots:o,emit:n}){const{proxy:{$q:r}}=R(),t=T(null),l=T(r.screen.height),a=T(e.container===!0?0:r.screen.width),h=T({position:0,direction:"down",inflectionPoint:0}),c=T(0),s=T(Pe.value===!0?0:xe()),i=d(()=>"q-layout q-layout--"+(e.container===!0?"containerized":"standard")),C=d(()=>e.container===!1?{minHeight:r.screen.height+"px"}:null),S=d(()=>s.value!==0?{[r.lang.rtl===!0?"left":"right"]:`${s.value}px`}:null),m=d(()=>s.value!==0?{[r.lang.rtl===!0?"right":"left"]:0,[r.lang.rtl===!0?"left":"right"]:`-${s.value}px`,width:`calc(100% + ${s.value}px)`}:null);function v(y){if(e.container===!0||document.qScrollPrevented!==!0){const f={position:y.position.top,direction:y.direction,directionChanged:y.directionChanged,inflectionPoint:y.inflectionPoint.top,delta:y.delta.top};h.value=f,e.onScroll!==void 0&&n("scroll",f)}}function w(y){const{height:f,width:z}=y;let H=!1;l.value!==f&&(H=!0,l.value=f,e.onScrollHeight!==void 0&&n("scrollHeight",f),b()),a.value!==z&&(H=!0,a.value=z),H===!0&&e.onResize!==void 0&&n("resize",y)}function _({height:y}){c.value!==y&&(c.value=y,b())}function b(){if(e.container===!0){const y=l.value>c.value?xe():0;s.value!==y&&(s.value=y)}}let g=null;const $={instances:{},view:d(()=>e.view),isContainer:d(()=>e.container),rootRef:t,height:l,containerHeight:c,scrollbarWidth:s,totalWidth:d(()=>a.value+s.value),rows:d(()=>{const y=e.view.toLowerCase().split(" ");return{top:y[0].split(""),middle:y[1].split(""),bottom:y[2].split("")}}),header:ae({size:0,offset:0,space:!1}),right:ae({size:300,offset:0,space:!1}),footer:ae({size:0,offset:0,space:!1}),left:ae({size:300,offset:0,space:!1}),scroll:h,animate(){g!==null?clearTimeout(g):document.body.classList.add("q-body--layout-animate"),g=setTimeout(()=>{g=null,document.body.classList.remove("q-body--layout-animate")},155)},update(y,f,z){$[y][f]=z}};if(dt(le,$),xe()>0){let z=function(){y=null,f.classList.remove("hide-scrollbar")},H=function(){if(y===null){if(f.scrollHeight>r.screen.height)return;f.classList.add("hide-scrollbar")}else clearTimeout(y);y=setTimeout(z,300)},Y=function(N){y!==null&&N==="remove"&&(clearTimeout(y),z()),window[`${N}EventListener`]("resize",H)},y=null;const f=document.body;x(()=>e.container!==!0?"add":"remove",Y),e.container!==!0&&Y("add"),Ot(()=>{Y("remove")})}return()=>{const y=ve(o.default,[q(ao,{onScroll:v}),q(ce,{onResize:w})]),f=q("div",{class:i.value,style:C.value,ref:e.container===!0?void 0:t,tabindex:-1},y);return e.container===!0?q("div",{class:"q-layout-container overflow-hidden",ref:t},[q(ce,{onResize:_}),q("div",{class:"absolute-full",style:S.value},[q("div",{class:"scroll",style:m.value},[f])])]):f}}});function io(e,o,n){let r;function t(){r!==void 0&&(Ie.remove(r),r=void 0)}return X(()=>{e.value===!0&&t()}),{removeFromHistory:t,addToHistory(){r={condition:()=>n.value===!0,handler:o},Ie.add(r)}}}let J=0,Te,$e,Z,ke=!1,Je,Ze,et,I=null;function uo(e){so(e)&&ct(e)}function so(e){if(e.target===document.body||e.target.classList.contains("q-layout__backdrop"))return!0;const o=Qt(e),n=e.shiftKey&&!e.deltaX,r=!n&&Math.abs(e.deltaX)<=Math.abs(e.deltaY),t=n||r?e.deltaY:e.deltaX;for(let l=0;l<o.length;l++){const a=o[l];if(It(a,r))return r?t<0&&a.scrollTop===0?!0:t>0&&a.scrollTop+a.clientHeight===a.scrollHeight:t<0&&a.scrollLeft===0?!0:t>0&&a.scrollLeft+a.clientWidth===a.scrollWidth}return!0}function tt(e){e.target===document&&(document.scrollingElement.scrollTop=document.scrollingElement.scrollTop)}function ue(e){ke!==!0&&(ke=!0,requestAnimationFrame(()=>{ke=!1;const{height:o}=e.target,{clientHeight:n,scrollTop:r}=document.scrollingElement;(Z===void 0||o!==window.innerHeight)&&(Z=n-o,document.scrollingElement.scrollTop=r),r>Z&&(document.scrollingElement.scrollTop-=Math.ceil((r-Z)/8))}))}function ot(e){const o=document.body,n=window.visualViewport!==void 0;if(e==="add"){const{overflowY:r,overflowX:t}=window.getComputedStyle(o);Te=vt(window),$e=ft(window),Je=o.style.left,Ze=o.style.top,et=window.location.href,o.style.left=`-${Te}px`,o.style.top=`-${$e}px`,t!=="hidden"&&(t==="scroll"||o.scrollWidth>window.innerWidth)&&o.classList.add("q-body--force-scrollbar-x"),r!=="hidden"&&(r==="scroll"||o.scrollHeight>window.innerHeight)&&o.classList.add("q-body--force-scrollbar-y"),o.classList.add("q-body--prevent-scroll"),document.qScrollPrevented=!0,Q.is.ios===!0&&(n===!0?(window.scrollTo(0,0),window.visualViewport.addEventListener("resize",ue,D.passiveCapture),window.visualViewport.addEventListener("scroll",ue,D.passiveCapture),window.scrollTo(0,0)):window.addEventListener("scroll",tt,D.passiveCapture))}Q.is.desktop===!0&&Q.is.mac===!0&&window[`${e}EventListener`]("wheel",uo,D.notPassive),e==="remove"&&(Q.is.ios===!0&&(n===!0?(window.visualViewport.removeEventListener("resize",ue,D.passiveCapture),window.visualViewport.removeEventListener("scroll",ue,D.passiveCapture)):window.removeEventListener("scroll",tt,D.passiveCapture)),o.classList.remove("q-body--prevent-scroll"),o.classList.remove("q-body--force-scrollbar-x"),o.classList.remove("q-body--force-scrollbar-y"),document.qScrollPrevented=!1,o.style.left=Je,o.style.top=Ze,window.location.href===et&&window.scrollTo(Te,$e),Z=void 0)}function co(e){let o="add";if(e===!0){if(J++,I!==null){clearTimeout(I),I=null;return}if(J>1)return}else{if(J===0||(J--,J>0))return;if(o="remove",Q.is.ios===!0&&Q.is.nativeMobile===!0){I!==null&&clearTimeout(I),I=setTimeout(()=>{ot(o),I=null},100);return}}ot(o)}function fo(){let e;return{preventBodyScroll(o){o!==e&&(e!==void 0||o===!0)&&(e=o,co(o))}}}const He={left:!0,right:!0,up:!0,down:!0,horizontal:!0,vertical:!0},vo=Object.keys(He);He.all=!0;function lt(e){const o={};for(const n of vo)e[n]===!0&&(o[n]=!0);return Object.keys(o).length===0?He:(o.horizontal===!0?o.left=o.right=!0:o.left===!0&&o.right===!0&&(o.horizontal=!0),o.vertical===!0?o.up=o.down=!0:o.up===!0&&o.down===!0&&(o.vertical=!0),o.horizontal===!0&&o.vertical===!0&&(o.all=!0),o)}const ho=["INPUT","TEXTAREA"];function nt(e,o){return o.event===void 0&&e.target!==void 0&&e.target.draggable!==!0&&typeof o.handler=="function"&&ho.includes(e.target.nodeName.toUpperCase())===!1&&(e.qClonedBy===void 0||e.qClonedBy.indexOf(o.uid)===-1)}function Be(e,o,n){const r=Ve(e);let t,l=r.left-o.event.x,a=r.top-o.event.y,h=Math.abs(l),c=Math.abs(a);const s=o.direction;s.horizontal===!0&&s.vertical!==!0?t=l<0?"left":"right":s.horizontal!==!0&&s.vertical===!0?t=a<0?"up":"down":s.up===!0&&a<0?(t="up",h>c&&(s.left===!0&&l<0?t="left":s.right===!0&&l>0&&(t="right"))):s.down===!0&&a>0?(t="down",h>c&&(s.left===!0&&l<0?t="left":s.right===!0&&l>0&&(t="right"))):s.left===!0&&l<0?(t="left",h<c&&(s.up===!0&&a<0?t="up":s.down===!0&&a>0&&(t="down"))):s.right===!0&&l>0&&(t="right",h<c&&(s.up===!0&&a<0?t="up":s.down===!0&&a>0&&(t="down")));let i=!1;if(t===void 0&&n===!1){if(o.event.isFirst===!0||o.event.lastDir===void 0)return{};t=o.event.lastDir,i=!0,t==="left"||t==="right"?(r.left-=l,h=0,l=0):(r.top-=a,c=0,a=0)}return{synthetic:i,payload:{evt:e,touch:o.event.mouse!==!0,mouse:o.event.mouse===!0,position:r,direction:t,isFirst:o.event.isFirst,isFinal:n===!0,duration:Date.now()-o.event.time,distance:{x:h,y:c},offset:{x:l,y:a},delta:{x:r.left-o.event.lastX,y:r.top-o.event.lastY}}}}let mo=0;const ee=Vt({name:"touch-pan",beforeMount(e,{value:o,modifiers:n}){if(n.mouse!==!0&&Q.has.touch!==!0)return;function r(l,a){n.mouse===!0&&a===!0?ct(l):(n.stop===!0&&Se(l),n.prevent===!0&&Xe(l))}const t={uid:"qvtp_"+mo++,handler:o,modifiers:n,direction:lt(n),noop:Oe,mouseStart(l){nt(l,t)&&Dt(l)&&(ie(t,"temp",[[document,"mousemove","move","notPassiveCapture"],[document,"mouseup","end","passiveCapture"]]),t.start(l,!0))},touchStart(l){if(nt(l,t)){const a=l.target;ie(t,"temp",[[a,"touchmove","move","notPassiveCapture"],[a,"touchcancel","end","passiveCapture"],[a,"touchend","end","passiveCapture"]]),t.start(l)}},start(l,a){if(Q.is.firefox===!0&&qe(e,!0),t.lastEvt=l,a===!0||n.stop===!0){if(t.direction.all!==!0&&(a!==!0||t.modifiers.mouseAllDir!==!0&&t.modifiers.mousealldir!==!0)){const s=l.type.indexOf("mouse")>-1?new MouseEvent(l.type,l):new TouchEvent(l.type,l);l.defaultPrevented===!0&&Xe(s),l.cancelBubble===!0&&Se(s),Object.assign(s,{qKeyEvent:l.qKeyEvent,qClickOutside:l.qClickOutside,qAnchorHandled:l.qAnchorHandled,qClonedBy:l.qClonedBy===void 0?[t.uid]:l.qClonedBy.concat(t.uid)}),t.initialEvent={target:l.target,event:s}}Se(l)}const{left:h,top:c}=Ve(l);t.event={x:h,y:c,time:Date.now(),mouse:a===!0,detected:!1,isFirst:!0,isFinal:!1,lastX:h,lastY:c}},move(l){if(t.event===void 0)return;const a=Ve(l),h=a.left-t.event.x,c=a.top-t.event.y;if(h===0&&c===0)return;t.lastEvt=l;const s=t.event.mouse===!0,i=()=>{r(l,s);let m;n.preserveCursor!==!0&&n.preservecursor!==!0&&(m=document.documentElement.style.cursor||"",document.documentElement.style.cursor="grabbing"),s===!0&&document.body.classList.add("no-pointer-events--children"),document.body.classList.add("non-selectable"),Xt(),t.styleCleanup=v=>{if(t.styleCleanup=void 0,m!==void 0&&(document.documentElement.style.cursor=m),document.body.classList.remove("non-selectable"),s===!0){const w=()=>{document.body.classList.remove("no-pointer-events--children")};v!==void 0?setTimeout(()=>{w(),v()},50):w()}else v!==void 0&&v()}};if(t.event.detected===!0){t.event.isFirst!==!0&&r(l,t.event.mouse);const{payload:m,synthetic:v}=Be(l,t,!1);m!==void 0&&(t.handler(m)===!1?t.end(l):(t.styleCleanup===void 0&&t.event.isFirst===!0&&i(),t.event.lastX=m.position.left,t.event.lastY=m.position.top,t.event.lastDir=v===!0?void 0:m.direction,t.event.isFirst=!1));return}if(t.direction.all===!0||s===!0&&(t.modifiers.mouseAllDir===!0||t.modifiers.mousealldir===!0)){i(),t.event.detected=!0,t.move(l);return}const C=Math.abs(h),S=Math.abs(c);C!==S&&(t.direction.horizontal===!0&&C>S||t.direction.vertical===!0&&C<S||t.direction.up===!0&&C<S&&c<0||t.direction.down===!0&&C<S&&c>0||t.direction.left===!0&&C>S&&h<0||t.direction.right===!0&&C>S&&h>0?(t.event.detected=!0,t.move(l)):t.end(l,!0))},end(l,a){if(t.event!==void 0){if(Ce(t,"temp"),Q.is.firefox===!0&&qe(e,!1),a===!0)t.styleCleanup!==void 0&&t.styleCleanup(),t.event.detected!==!0&&t.initialEvent!==void 0&&t.initialEvent.target.dispatchEvent(t.initialEvent.event);else if(t.event.detected===!0){t.event.isFirst===!0&&t.handler(Be(l===void 0?t.lastEvt:l,t).payload);const{payload:h}=Be(l===void 0?t.lastEvt:l,t,!0),c=()=>{t.handler(h)};t.styleCleanup!==void 0?t.styleCleanup(c):c()}t.event=void 0,t.initialEvent=void 0,t.lastEvt=void 0}}};if(e.__qtouchpan=t,n.mouse===!0){const l=n.mouseCapture===!0||n.mousecapture===!0?"Capture":"";ie(t,"main",[[e,"mousedown","mouseStart",`passive${l}`]])}Q.has.touch===!0&&ie(t,"main",[[e,"touchstart","touchStart",`passive${n.capture===!0?"Capture":""}`],[e,"touchmove","noop","notPassiveCapture"]])},updated(e,o){const n=e.__qtouchpan;n!==void 0&&(o.oldValue!==o.value&&(typeof value!="function"&&n.end(),n.handler=o.value),n.direction=lt(o.modifiers))},beforeUnmount(e){const o=e.__qtouchpan;o!==void 0&&(o.event!==void 0&&o.end(),Ce(o,"main"),Ce(o,"temp"),Q.is.firefox===!0&&qe(e,!1),o.styleCleanup!==void 0&&o.styleCleanup(),delete e.__qtouchpan)}});function se(e,o,n){return n<=o?o:Math.min(n,Math.max(o,e))}const rt=150,at=E({name:"QDrawer",inheritAttrs:!1,props:{...jt,...Qe,side:{type:String,default:"left",validator:e=>["left","right"].includes(e)},width:{type:Number,default:300},mini:Boolean,miniToOverlay:Boolean,miniWidth:{type:Number,default:57},noMiniAnimation:Boolean,breakpoint:{type:Number,default:1023},showIfAbove:Boolean,behavior:{type:String,validator:e=>["default","desktop","mobile"].includes(e),default:"default"},bordered:Boolean,elevated:Boolean,overlay:Boolean,persistent:Boolean,noSwipeOpen:Boolean,noSwipeClose:Boolean,noSwipeBackdrop:Boolean},emits:[...Ut,"onLayout","miniState"],setup(e,{slots:o,emit:n,attrs:r}){const t=R(),{proxy:{$q:l}}=t,a=De(e,l),{preventBodyScroll:h}=fo(),{registerTimeout:c,removeTimeout:s}=Yt(),i=oe(le,O);if(i===O)return console.error("QDrawer needs to be child of QLayout"),O;let C,S=null,m;const v=T(e.behavior==="mobile"||e.behavior!=="desktop"&&i.totalWidth.value<=e.breakpoint),w=d(()=>e.mini===!0&&v.value!==!0),_=d(()=>w.value===!0?e.miniWidth:e.width),b=T(e.showIfAbove===!0&&v.value===!1?!0:e.modelValue===!0),g=d(()=>e.persistent!==!0&&(v.value===!0||mt.value===!0));function $(u,p){if(H(),u!==!1&&i.animate(),P(0),v.value===!0){const V=i.instances[ne.value];V!==void 0&&V.belowBreakpoint===!0&&V.hide(!1),F(1),i.isContainer.value!==!0&&h(!0)}else F(0),u!==!1&&ye(!1);c(()=>{u!==!1&&ye(!0),p!==!0&&n("show",u)},rt)}function y(u,p){Y(),u!==!1&&i.animate(),F(0),P(j.value*_.value),we(),p!==!0?c(()=>{n("hide",u)},rt):s()}const{show:f,hide:z}=Kt({showing:b,hideOnRouteChange:g,handleShow:$,handleHide:y}),{addToHistory:H,removeFromHistory:Y}=io(b,z,g),N={belowBreakpoint:v,hide:z},M=d(()=>e.side==="right"),j=d(()=>(l.lang.rtl===!0?-1:1)*(M.value===!0?1:-1)),Me=T(0),U=T(!1),he=T(!1),Re=T(_.value*j.value),ne=d(()=>M.value===!0?"left":"right"),me=d(()=>b.value===!0&&v.value===!1&&e.overlay===!1?e.miniToOverlay===!0?e.miniWidth:_.value:0),ge=d(()=>e.overlay===!0||e.miniToOverlay===!0||i.view.value.indexOf(M.value?"R":"L")>-1||l.platform.is.ios===!0&&i.isContainer.value===!0),K=d(()=>e.overlay===!1&&b.value===!0&&v.value===!1),mt=d(()=>e.overlay===!0&&b.value===!0&&v.value===!1),gt=d(()=>"fullscreen q-drawer__backdrop"+(b.value===!1&&U.value===!1?" hidden":"")),bt=d(()=>({backgroundColor:`rgba(0,0,0,${Me.value*.4})`})),Fe=d(()=>M.value===!0?i.rows.value.top[2]==="r":i.rows.value.top[0]==="l"),yt=d(()=>M.value===!0?i.rows.value.bottom[2]==="r":i.rows.value.bottom[0]==="l"),wt=d(()=>{const u={};return i.header.space===!0&&Fe.value===!1&&(ge.value===!0?u.top=`${i.header.offset}px`:i.header.space===!0&&(u.top=`${i.header.size}px`)),i.footer.space===!0&&yt.value===!1&&(ge.value===!0?u.bottom=`${i.footer.offset}px`:i.footer.space===!0&&(u.bottom=`${i.footer.size}px`)),u}),pt=d(()=>{const u={width:`${_.value}px`,transform:`translateX(${Re.value}px)`};return v.value===!0?u:Object.assign(u,wt.value)}),qt=d(()=>"q-drawer__content fit "+(i.isContainer.value!==!0?"scroll":"overflow-auto")),St=d(()=>`q-drawer q-drawer--${e.side}`+(he.value===!0?" q-drawer--mini-animate":"")+(e.bordered===!0?" q-drawer--bordered":"")+(a.value===!0?" q-drawer--dark q-dark":"")+(U.value===!0?" no-transition":b.value===!0?"":" q-layout--prevent-focus")+(v.value===!0?" fixed q-drawer--on-top q-drawer--mobile q-drawer--top-padding":` q-drawer--${w.value===!0?"mini":"standard"}`+(ge.value===!0||K.value!==!0?" fixed":"")+(e.overlay===!0||e.miniToOverlay===!0?" q-drawer--on-top":"")+(Fe.value===!0?" q-drawer--top-padding":""))),Ct=d(()=>{const u=l.lang.rtl===!0?e.side:ne.value;return[[ee,Lt,void 0,{[u]:!0,mouse:!0}]]}),_t=d(()=>{const u=l.lang.rtl===!0?ne.value:e.side;return[[ee,We,void 0,{[u]:!0,mouse:!0}]]}),xt=d(()=>{const u=l.lang.rtl===!0?ne.value:e.side;return[[ee,We,void 0,{[u]:!0,mouse:!0,mouseAllDir:!0}]]});function be(){Tt(v,e.behavior==="mobile"||e.behavior!=="desktop"&&i.totalWidth.value<=e.breakpoint)}x(v,u=>{u===!0?(C=b.value,b.value===!0&&z(!1)):e.overlay===!1&&e.behavior!=="mobile"&&C!==!1&&(b.value===!0?(P(0),F(0),we()):f(!1))}),x(()=>e.side,(u,p)=>{i.instances[p]===N&&(i.instances[p]=void 0,i[p].space=!1,i[p].offset=0),i.instances[u]=N,i[u].size=_.value,i[u].space=K.value,i[u].offset=me.value}),x(i.totalWidth,()=>{(i.isContainer.value===!0||document.qScrollPrevented!==!0)&&be()}),x(()=>e.behavior+e.breakpoint,be),x(i.isContainer,u=>{b.value===!0&&h(u!==!0),u===!0&&be()}),x(i.scrollbarWidth,()=>{P(b.value===!0?0:void 0)}),x(me,u=>{W("offset",u)}),x(K,u=>{n("onLayout",u),W("space",u)}),x(M,()=>{P()}),x(_,u=>{P(),pe(e.miniToOverlay,u)}),x(()=>e.miniToOverlay,u=>{pe(u,_.value)}),x(()=>l.lang.rtl,()=>{P()}),x(()=>e.mini,()=>{e.noMiniAnimation||e.modelValue===!0&&(zt(),i.animate())}),x(w,u=>{n("miniState",u)});function P(u){u===void 0?de(()=>{u=b.value===!0?0:_.value,P(j.value*u)}):(i.isContainer.value===!0&&M.value===!0&&(v.value===!0||Math.abs(u)===_.value)&&(u+=j.value*i.scrollbarWidth.value),Re.value=u)}function F(u){Me.value=u}function ye(u){const p=u===!0?"remove":i.isContainer.value!==!0?"add":"";p!==""&&document.body.classList[p]("q-body--drawer-toggle")}function zt(){S!==null&&clearTimeout(S),t.proxy&&t.proxy.$el&&t.proxy.$el.classList.add("q-drawer--mini-animate"),he.value=!0,S=setTimeout(()=>{S=null,he.value=!1,t&&t.proxy&&t.proxy.$el&&t.proxy.$el.classList.remove("q-drawer--mini-animate")},150)}function Lt(u){if(b.value!==!1)return;const p=_.value,V=se(u.distance.x,0,p);if(u.isFinal===!0){V>=Math.min(75,p)===!0?f():(i.animate(),F(0),P(j.value*p)),U.value=!1;return}P((l.lang.rtl===!0?M.value!==!0:M.value)?Math.max(p-V,0):Math.min(0,V-p)),F(se(V/p,0,1)),u.isFirst===!0&&(U.value=!0)}function We(u){if(b.value!==!0)return;const p=_.value,V=u.direction===e.side,re=(l.lang.rtl===!0?V!==!0:V)?se(u.distance.x,0,p):0;if(u.isFinal===!0){Math.abs(re)<Math.min(75,p)===!0?(i.animate(),F(1),P(0)):z(),U.value=!1;return}P(j.value*re),F(se(1-re/p,0,1)),u.isFirst===!0&&(U.value=!0)}function we(){h(!1),ye(!0)}function W(u,p){i.update(e.side,u,p)}function Tt(u,p){u.value!==p&&(u.value=p)}function pe(u,p){W("size",u===!0?e.miniWidth:p)}return i.instances[e.side]=N,pe(e.miniToOverlay,_.value),W("space",K.value),W("offset",me.value),e.showIfAbove===!0&&e.modelValue!==!0&&b.value===!0&&e["onUpdate:modelValue"]!==void 0&&n("update:modelValue",!0),te(()=>{n("onLayout",K.value),n("miniState",w.value),C=e.showIfAbove===!0;const u=()=>{(b.value===!0?$:y)(!1,!0)};if(i.totalWidth.value!==0){de(u);return}m=x(i.totalWidth,()=>{m(),m=void 0,b.value===!1&&e.showIfAbove===!0&&v.value===!1?f(!1):u()})}),X(()=>{m!==void 0&&m(),S!==null&&(clearTimeout(S),S=null),b.value===!0&&we(),i.instances[e.side]===N&&(i.instances[e.side]=void 0,W("size",0),W("offset",0),W("space",!1))}),()=>{const u=[];v.value===!0&&(e.noSwipeOpen===!1&&u.push(Ee(q("div",{key:"open",class:`q-drawer__opener fixed-${e.side}`,"aria-hidden":"true"}),Ct.value)),u.push(Ne("div",{ref:"backdrop",class:gt.value,style:bt.value,"aria-hidden":"true",onClick:z},void 0,"backdrop",e.noSwipeBackdrop!==!0&&b.value===!0,()=>xt.value)));const p=w.value===!0&&o.mini!==void 0,V=[q("div",{...r,key:""+p,class:[qt.value,r.class]},p===!0?o.mini():fe(o.default))];return e.elevated===!0&&b.value===!0&&V.push(q("div",{class:"q-layout__shadow absolute-full overflow-hidden no-pointer-events"})),u.push(Ne("aside",{ref:"content",class:St.value,style:pt.value},V,"contentclose",e.noSwipeClose!==!0&&v.value===!0,()=>_t.value)),q("div",{class:"q-drawer-container"},u)}}}),go=["top","middle","bottom"],bo=E({name:"QBadge",props:{color:String,textColor:String,floating:Boolean,transparent:Boolean,multiLine:Boolean,outline:Boolean,rounded:Boolean,label:[Number,String],align:{type:String,validator:e=>go.includes(e)}},setup(e,{slots:o}){const n=d(()=>e.align!==void 0?{verticalAlign:e.align}:null),r=d(()=>{const t=e.outline===!0&&e.color||e.textColor;return`q-badge flex inline items-center no-wrap q-badge--${e.multiLine===!0?"multi":"single"}-line`+(e.outline===!0?" q-badge--outline":e.color!==void 0?` bg-${e.color}`:"")+(t!==void 0?` text-${t}`:"")+(e.floating===!0?" q-badge--floating":"")+(e.rounded===!0?" q-badge--rounded":"")+(e.transparent===!0?" q-badge--transparent":"")});return()=>q("div",{class:r.value,style:n.value,role:"status","aria-label":e.label},ve(o.default,e.label!==void 0?[e.label]:[]))}}),yo={xs:2,sm:4,md:6,lg:10,xl:14};function it(e,o,n){return{transform:o===!0?`translateX(${n.lang.rtl===!0?"-":""}100%) scale3d(${-e},1,1)`:`scale3d(${e},1,1)`}}const wo=E({name:"QLinearProgress",props:{...Qe,...ut,value:{type:Number,default:0},buffer:Number,color:String,trackColor:String,reverse:Boolean,stripe:Boolean,indeterminate:Boolean,query:Boolean,rounded:Boolean,animationSpeed:{type:[String,Number],default:2100},instantFeedback:Boolean},setup(e,{slots:o}){const{proxy:n}=R(),r=De(e,n.$q),t=st(e,yo),l=d(()=>e.indeterminate===!0||e.query===!0),a=d(()=>e.reverse!==e.query),h=d(()=>({...t.value!==null?t.value:{},"--q-linear-progress-speed":`${e.animationSpeed}ms`})),c=d(()=>"q-linear-progress"+(e.color!==void 0?` text-${e.color}`:"")+(e.reverse===!0||e.query===!0?" q-linear-progress--reverse":"")+(e.rounded===!0?" rounded-borders":"")),s=d(()=>it(e.buffer!==void 0?e.buffer:1,a.value,n.$q)),i=d(()=>`with${e.instantFeedback===!0?"out":""}-transition`),C=d(()=>`q-linear-progress__track absolute-full q-linear-progress__track--${i.value} q-linear-progress__track--${r.value===!0?"dark":"light"}`+(e.trackColor!==void 0?` bg-${e.trackColor}`:"")),S=d(()=>it(l.value===!0?1:e.value,a.value,n.$q)),m=d(()=>`q-linear-progress__model absolute-full q-linear-progress__model--${i.value} q-linear-progress__model--${l.value===!0?"in":""}determinate`),v=d(()=>({width:`${e.value*100}%`})),w=d(()=>`q-linear-progress__stripe absolute-${e.reverse===!0?"right":"left"} q-linear-progress__stripe--${i.value}`);return()=>{const _=[q("div",{class:C.value,style:s.value}),q("div",{class:m.value,style:S.value})];return e.stripe===!0&&l.value===!1&&_.push(q("div",{class:w.value,style:v.value})),q("div",{class:c.value,style:h.value,role:"progressbar","aria-valuemin":0,"aria-valuemax":1,"aria-valuenow":e.indeterminate===!0?void 0:e.value},ve(o.default,_))}}}),po=E({name:"QInnerLoading",props:{...Qe,...Gt,showing:Boolean,color:String,size:{type:[String,Number],default:42},label:String,labelClass:String,labelStyle:[String,Array,Object]},setup(e,{slots:o}){const n=R(),r=De(e,n.proxy.$q),{transitionProps:t,transitionStyle:l}=Jt(e),a=d(()=>"q-inner-loading absolute-full column flex-center"+(r.value===!0?" q-inner-loading--dark":"")),h=d(()=>"q-inner-loading__label"+(e.labelClass!==void 0?` ${e.labelClass}`:""));function c(){const i=[q(Et,{size:e.size,color:e.color})];return e.label!==void 0&&i.push(q("div",{class:h.value,style:e.labelStyle},[e.label])),i}function s(){return e.showing===!0?q("div",{class:a.value,style:l.value},o.default!==void 0?o.default():c()):null}return()=>q(Ht,t.value,s)}}),qo=E({name:"QFooter",props:{modelValue:{type:Boolean,default:!0},reveal:Boolean,bordered:Boolean,elevated:Boolean,heightHint:{type:[String,Number],default:50}},emits:["reveal","focusin"],setup(e,{slots:o,emit:n}){const{proxy:{$q:r}}=R(),t=oe(le,O);if(t===O)return console.error("QFooter needs to be child of QLayout"),O;const l=T(parseInt(e.heightHint,10)),a=T(!0),h=T(Pe.value===!0||t.isContainer.value===!0?0:window.innerHeight),c=d(()=>e.reveal===!0||t.view.value.indexOf("F")>-1||r.platform.is.ios&&t.isContainer.value===!0),s=d(()=>t.isContainer.value===!0?t.containerHeight.value:h.value),i=d(()=>{if(e.modelValue!==!0)return 0;if(c.value===!0)return a.value===!0?l.value:0;const f=t.scroll.value.position+s.value+l.value-t.height.value;return f>0?f:0}),C=d(()=>e.modelValue!==!0||c.value===!0&&a.value!==!0),S=d(()=>e.modelValue===!0&&C.value===!0&&e.reveal===!0),m=d(()=>"q-footer q-layout__section--marginal "+(c.value===!0?"fixed":"absolute")+"-bottom"+(e.bordered===!0?" q-footer--bordered":"")+(C.value===!0?" q-footer--hidden":"")+(e.modelValue!==!0?" q-layout--prevent-focus"+(c.value!==!0?" hidden":""):"")),v=d(()=>{const f=t.rows.value.bottom,z={};return f[0]==="l"&&t.left.space===!0&&(z[r.lang.rtl===!0?"right":"left"]=`${t.left.size}px`),f[2]==="r"&&t.right.space===!0&&(z[r.lang.rtl===!0?"left":"right"]=`${t.right.size}px`),z});function w(f,z){t.update("footer",f,z)}function _(f,z){f.value!==z&&(f.value=z)}function b({height:f}){_(l,f),w("size",f)}function g(){if(e.reveal!==!0)return;const{direction:f,position:z,inflectionPoint:H}=t.scroll.value;_(a,f==="up"||z-H<100||t.height.value-s.value-z-l.value<300)}function $(f){S.value===!0&&_(a,!0),n("focusin",f)}x(()=>e.modelValue,f=>{w("space",f),_(a,!0),t.animate()}),x(i,f=>{w("offset",f)}),x(()=>e.reveal,f=>{f===!1&&_(a,e.modelValue)}),x(a,f=>{t.animate(),n("reveal",f)}),x([l,t.scroll,t.height],g),x(()=>r.screen.height,f=>{t.isContainer.value!==!0&&_(h,f)});const y={};return t.instances.footer=y,e.modelValue===!0&&w("size",l.value),w("space",e.modelValue),w("offset",i.value),X(()=>{t.instances.footer===y&&(t.instances.footer=void 0,w("size",0),w("offset",0),w("space",!1))}),()=>{const f=ve(o.default,[q(ce,{debounce:0,onResize:b})]);return e.elevated===!0&&f.push(q("div",{class:"q-layout__shadow absolute-full overflow-hidden no-pointer-events"})),q("footer",{class:m.value,style:v.value,onFocusin:$},f)}}});function So(){return oe(Mt)}const Co={class:"row items-center justify-center"},_o={class:"col-auto q-mx-sm"},xo=A("img",{src:"https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg"},null,-1),zo=A("div",{class:"col-auto q-mx-sm"},"ROS Graph Visualization",-1),Lo={class:"col-auto q-mx-lg q-my-sm"},To={class:"q-drawer__resizerl"},$o={class:"q-drawer__resizerr"},ko={class:"absolute-full flex flex-center"},Do=Rt({__name:"MainLayout",setup(e){const o=Ft(),n=So(),r=G("darkMode",!1);x(r,v=>{n.dark.set(v)},{immediate:!0});const t=G("rightDrawerWidth",400),l=G("rightDrawerOpen",!1),a=G("leftDrawerOpen",!0),h=G("leftDrawerWidth",400);function c(){a.value=!a.value}function s(){l.value=!l.value}let i=300;function C(v){v.isFirst===!0&&(i=t.value),t.value=i-v.offset.x}let S=300;function m(v){v.isFirst===!0&&(S=h.value),h.value=S+v.offset.x}return(v,w)=>{const _=Wt("router-view");return je(),Ue(Le,{view:"hHh Lpr fFf"},{default:k(()=>[L(no,{bordered:"",class:"bg-primary text-white"},{default:k(()=>[L(Ye,null,{default:k(()=>[L(Ae,{dense:"",flat:"",round:"",icon:"menu",onClick:c}),L(oo,null,{default:k(()=>[A("div",Co,[A("div",_o,[L(to,null,{default:k(()=>[xo]),_:1})]),zo,A("div",Lo,[L(Zt,{clearable:"",color:"white",modelValue:B(o).topicFilter,"onUpdate:modelValue":w[0]||(w[0]=b=>B(o).topicFilter=b),label:"Topic Filter",rounded:"",outlined:""},null,8,["modelValue"])])])]),_:1}),L(eo,{modelValue:B(r),"onUpdate:modelValue":w[1]||(w[1]=b=>_e(r)?r.value=b:null),"checked-icon":"light_mode",color:"black","unchecked-icon":"dark_mode"},null,8,["modelValue"]),L(Ae,{dense:"",flat:"",round:"",icon:"menu",onClick:s})]),_:1})]),_:1}),L(at,{width:B(h),"show-if-above":B(a),modelValue:B(a),"onUpdate:modelValue":w[2]||(w[2]=b=>_e(a)?a.value=b:null),side:"left",bordered:""},{default:k(()=>[L(Le,{view:"hHh Lpr fFf",container:"",style:{height:"100%"}},{default:k(()=>[L(ze,null,{default:k(()=>[L(_,{name:"LeftSidebarContent"})]),_:1})]),_:1}),Ee(A("div",To,null,512),[[ee,m,void 0,{preserveCursor:!0,prevent:!0,mouse:!0,horizontal:!0}]])]),_:1},8,["width","show-if-above","modelValue"]),L(at,{width:B(t),"show-if-above":B(l),modelValue:B(l),"onUpdate:modelValue":w[3]||(w[3]=b=>_e(l)?l.value=b:null),side:"right",bordered:""},{default:k(()=>[L(Le,{view:"hHh Lpr fFf",container:"",style:{height:"100%"}},{default:k(()=>[L(ze,null,{default:k(()=>[L(_,{name:"RightSidebarContent"})]),_:1})]),_:1}),Ee(A("div",$o,null,512),[[ee,C,void 0,{preserveCursor:!0,prevent:!0,mouse:!0,horizontal:!0}]])]),_:1},8,["width","show-if-above","modelValue"]),L(ze,null,{default:k(()=>[L(_)]),_:1}),B(o).nodesRequested!=null?(je(),Ue(qo,{key:0,bordered:"",class:"bg-grey-8 text-white"},{default:k(()=>[L(Ye,null,{default:k(()=>[L(po,{showing:B(o).nodesRequested!=null},{default:k(()=>{var b;return[L(wo,{stripe:"",size:"30px",value:B(o).nodesResolved,buffer:(b=B(o).nodesRequested)!=null?b:0},{default:k(()=>[A("div",ko,[L(bo,{color:"white","text-color":"accent",label:`${B(o).nodesResolved} / ${B(o).nodesRequested} nodes resolved`},null,8,["label"])])]),_:1},8,["value","buffer"])]}),_:1},8,["showing"])]),_:1})]),_:1})):At("",!0)]),_:1})}}});export{Do as default};