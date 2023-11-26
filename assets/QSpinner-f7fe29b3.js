import{c,ax as b,E as _,h as r,C as M,g as j}from"./index-d8ad34b5.js";const g={xs:18,sm:24,md:32,lg:38,xl:46},q={size:String};function C(e,n=g){return c(()=>e.size!==void 0?{fontSize:e.size in n?`${n[e.size]}px`:e.size}:null)}const p=e=>b(_(e)),H=e=>b(e);function Q(e,n){return e!==void 0&&e()||n}function J(e,n){if(e!==void 0){const a=e();if(a!=null)return a.slice()}return n}function l(e,n){return e!==void 0?n.concat(e()):n}function K(e,n){return e===void 0?n:n!==void 0?n.concat(e()):e()}function L(e,n,a,f,u,o){n.key=f+u;const s=r(e,n,a);return u===!0?M(s,o()):s}const x="0 0 24 24",S=e=>e,d=e=>`ionicons ${e}`,z={"mdi-":e=>`mdi ${e}`,"icon-":S,"bt-":e=>`bt ${e}`,"eva-":e=>`eva ${e}`,"ion-md":d,"ion-ios":d,"ion-logo":d,"iconfont ":S,"ti-":e=>`themify-icon ${e}`,"bi-":e=>`bootstrap-icons ${e}`},w={o_:"-outlined",r_:"-round",s_:"-sharp"},$={sym_o_:"-outlined",sym_r_:"-rounded",sym_s_:"-sharp"},D=new RegExp("^("+Object.keys(z).join("|")+")"),F=new RegExp("^("+Object.keys(w).join("|")+")"),y=new RegExp("^("+Object.keys($).join("|")+")"),I=/^[Mm]\s?[-+]?\.?\d/,O=/^img:/,N=/^svguse:/,P=/^ion-/,U=/^(fa-(sharp|solid|regular|light|brands|duotone|thin)|[lf]a[srlbdk]?) /,T=p({name:"QIcon",props:{...q,tag:{type:String,default:"i"},name:String,color:String,left:Boolean,right:Boolean},setup(e,{slots:n}){const{proxy:{$q:a}}=j(),f=C(e),u=c(()=>"q-icon"+(e.left===!0?" on-left":"")+(e.right===!0?" on-right":"")+(e.color!==void 0?` text-${e.color}`:"")),o=c(()=>{let s,t=e.name;if(t==="none"||!t)return{none:!0};if(a.iconMapFn!==null){const i=a.iconMapFn(t);if(i!==void 0)if(i.icon!==void 0){if(t=i.icon,t==="none"||!t)return{none:!0}}else return{cls:i.cls,content:i.content!==void 0?i.content:" "}}if(I.test(t)===!0){const[i,m=x]=t.split("|");return{svg:!0,viewBox:m,nodes:i.split("&&").map(k=>{const[E,R,B]=k.split("@@");return r("path",{style:R,d:E,transform:B})})}}if(O.test(t)===!0)return{img:!0,src:t.substring(4)};if(N.test(t)===!0){const[i,m=x]=t.split("|");return{svguse:!0,src:i.substring(7),viewBox:m}}let v=" ";const h=t.match(D);if(h!==null)s=z[h[1]](t);else if(U.test(t)===!0)s=t;else if(P.test(t)===!0)s=`ionicons ion-${a.platform.is.ios===!0?"ios":"md"}${t.substring(3)}`;else if(y.test(t)===!0){s="notranslate material-symbols";const i=t.match(y);i!==null&&(t=t.substring(6),s+=$[i[1]]),v=t}else{s="notranslate material-icons";const i=t.match(F);i!==null&&(t=t.substring(2),s+=w[i[1]]),v=t}return{cls:s,content:v}});return()=>{const s={class:u.value,style:f.value,"aria-hidden":"true",role:"presentation"};return o.value.none===!0?r(e.tag,s,Q(n.default)):o.value.img===!0?r("span",s,l(n.default,[r("img",{src:o.value.src})])):o.value.svg===!0?r("span",s,l(n.default,[r("svg",{viewBox:o.value.viewBox||"0 0 24 24"},o.value.nodes)])):o.value.svguse===!0?r("span",s,l(n.default,[r("svg",{viewBox:o.value.viewBox},[r("use",{"xlink:href":o.value.src})])])):(o.value.cls!==void 0&&(s.class+=" "+o.value.cls),r(e.tag,s,l(n.default,[o.value.content])))}}}),V={size:{type:[Number,String],default:"1em"},color:String};function A(e){return{cSize:c(()=>e.size in g?`${g[e.size]}px`:e.size),classes:c(()=>"q-spinner"+(e.color?` text-${e.color}`:""))}}const W=p({name:"QSpinner",props:{...V,thickness:{type:Number,default:5}},setup(e){const{cSize:n,classes:a}=A(e);return()=>r("svg",{class:a.value+" q-spinner-mat",width:n.value,height:n.value,viewBox:"25 25 50 50"},[r("circle",{class:"path",cx:"50",cy:"50",r:"20",fill:"none",stroke:"currentColor","stroke-width":e.thickness,"stroke-miterlimit":"10"})])}});export{T as Q,C as a,Q as b,p as c,J as d,l as e,H as f,L as g,K as h,W as i,q as u};