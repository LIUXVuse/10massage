(()=>{var e={};e.id=809,e.ids=[809],e.modules={10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},19121:e=>{"use strict";e.exports=require("next/dist/server/app-render/action-async-storage.external.js")},3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},33873:e=>{"use strict";e.exports=require("path")},79551:e=>{"use strict";e.exports=require("url")},19542:(e,t,r)=>{"use strict";r.r(t),r.d(t,{GlobalError:()=>i.a,__next_app__:()=>p,pages:()=>c,routeModule:()=>m,tree:()=>l});var s=r(70260),a=r(28203),o=r(25155),i=r.n(o),n=r(67292),d={};for(let e in n)0>["default","tree","pages","GlobalError","__next_app__","routeModule"].indexOf(e)&&(d[e]=()=>n[e]);r.d(t,d);let l=["",{children:["(dashboard)",{children:["users",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(r.bind(r,47362)),"D:\\projects\\10massage\\src\\app\\(dashboard)\\users\\page.tsx"]}]},{}]},{layout:[()=>Promise.resolve().then(r.bind(r,58426)),"D:\\projects\\10massage\\src\\app\\(dashboard)\\layout.tsx"],"not-found":[()=>Promise.resolve().then(r.t.bind(r,19937,23)),"next/dist/client/components/not-found-error"],forbidden:[()=>Promise.resolve().then(r.t.bind(r,69116,23)),"next/dist/client/components/forbidden-error"],unauthorized:[()=>Promise.resolve().then(r.t.bind(r,41485,23)),"next/dist/client/components/unauthorized-error"],metadata:{icon:[async e=>(await Promise.resolve().then(r.bind(r,70440))).default(e)],apple:[],openGraph:[],twitter:[],manifest:void 0}}]},{layout:[()=>Promise.resolve().then(r.bind(r,71354)),"D:\\projects\\10massage\\src\\app\\layout.tsx"],"not-found":[()=>Promise.resolve().then(r.t.bind(r,19937,23)),"next/dist/client/components/not-found-error"],forbidden:[()=>Promise.resolve().then(r.t.bind(r,69116,23)),"next/dist/client/components/forbidden-error"],unauthorized:[()=>Promise.resolve().then(r.t.bind(r,41485,23)),"next/dist/client/components/unauthorized-error"],metadata:{icon:[async e=>(await Promise.resolve().then(r.bind(r,70440))).default(e)],apple:[],openGraph:[],twitter:[],manifest:void 0}}],c=["D:\\projects\\10massage\\src\\app\\(dashboard)\\users\\page.tsx"],p={require:r,loadChunk:()=>Promise.resolve()},m=new s.AppPageRouteModule({definition:{kind:a.RouteKind.APP_PAGE,page:"/(dashboard)/users/page",pathname:"/users",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:l}})},35201:(e,t,r)=>{Promise.resolve().then(r.bind(r,47362))},71649:(e,t,r)=>{Promise.resolve().then(r.bind(r,90629))},90629:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>K});var s,a=r(45512),o=r(58009),i=r(90993),n=r(79334),d=r(53087);let l={data:""},c=e=>"object"==typeof window?((e?e.querySelector("#_goober"):window._goober)||Object.assign((e||document.head).appendChild(document.createElement("style")),{innerHTML:" ",id:"_goober"})).firstChild:e||l,p=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,m=/\/\*[^]*?\*\/|  +/g,u=/\n+/g,x=(e,t)=>{let r="",s="",a="";for(let o in e){let i=e[o];"@"==o[0]?"i"==o[1]?r=o+" "+i+";":s+="f"==o[1]?x(i,o):o+"{"+x(i,"k"==o[1]?"":t)+"}":"object"==typeof i?s+=x(i,t?t.replace(/([^,])+/g,e=>o.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):o):null!=i&&(o=/^--/.test(o)?o:o.replace(/[A-Z]/g,"-$&").toLowerCase(),a+=x.p?x.p(o,i):o+":"+i+";")}return r+(t&&a?t+"{"+a+"}":a)+s},h={},g=e=>{if("object"==typeof e){let t="";for(let r in e)t+=r+g(e[r]);return t}return e},f=(e,t,r,s,a)=>{let o=g(e),i=h[o]||(h[o]=(e=>{let t=0,r=11;for(;t<e.length;)r=101*r+e.charCodeAt(t++)>>>0;return"go"+r})(o));if(!h[i]){let t=o!==e?e:(e=>{let t,r,s=[{}];for(;t=p.exec(e.replace(m,""));)t[4]?s.shift():t[3]?(r=t[3].replace(u," ").trim(),s.unshift(s[0][r]=s[0][r]||{})):s[0][t[1]]=t[2].replace(u," ").trim();return s[0]})(e);h[i]=x(a?{["@keyframes "+i]:t}:t,r?"":"."+i)}let n=r&&h.g?h.g:null;return r&&(h.g=h[i]),((e,t,r,s)=>{s?t.data=t.data.replace(s,e):-1===t.data.indexOf(e)&&(t.data=r?e+t.data:t.data+e)})(h[i],t,s,n),i},b=(e,t,r)=>e.reduce((e,s,a)=>{let o=t[a];if(o&&o.call){let e=o(r),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;o=t?"."+t:e&&"object"==typeof e?e.props?"":x(e,""):!1===e?"":e}return e+s+(null==o?"":o)},"");function y(e){let t=this||{},r=e.call?e(t.p):e;return f(r.unshift?r.raw?b(r,[].slice.call(arguments,1),t.p):r.reduce((e,r)=>Object.assign(e,r&&r.call?r(t.p):r),{}):r,c(t.target),t.g,t.o,t.k)}y.bind({g:1});let v,j,w,N=y.bind({k:1});function k(e,t){let r=this||{};return function(){let s=arguments;function a(o,i){let n=Object.assign({},o),d=n.className||a.className;r.p=Object.assign({theme:j&&j()},n),r.o=/ *go\d+/.test(d),n.className=y.apply(r,s)+(d?" "+d:""),t&&(n.ref=i);let l=e;return e[0]&&(l=n.as||e,delete n.as),w&&l[0]&&w(n),v(l,n)}return t?t(a):a}}var P=e=>"function"==typeof e,_=(e,t)=>P(e)?e(t):e,C=(()=>{let e=0;return()=>(++e).toString()})(),A=((()=>{let e;return()=>e})(),(e,t)=>{switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,20)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:r}=t;return A(e,{type:e.toasts.find(e=>e.id===r.id)?1:0,toast:r});case 3:let{toastId:s}=t;return{...e,toasts:e.toasts.map(e=>e.id===s||void 0===s?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let a=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+a}))}}}),$=[],S={toasts:[],pausedAt:void 0},q=e=>{S=A(S,e),$.forEach(e=>{e(S)})},D={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},E=(e,t="blank",r)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...r,id:(null==r?void 0:r.id)||C()}),z=e=>(t,r)=>{let s=E(t,e,r);return q({type:2,toast:s}),s.id},M=(e,t)=>z("blank")(e,t);M.error=z("error"),M.success=z("success"),M.loading=z("loading"),M.custom=z("custom"),M.dismiss=e=>{q({type:3,toastId:e})},M.remove=e=>q({type:4,toastId:e}),M.promise=(e,t,r)=>{let s=M.loading(t.loading,{...r,...null==r?void 0:r.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let a=t.success?_(t.success,e):void 0;return a?M.success(a,{id:s,...r,...null==r?void 0:r.success}):M.dismiss(s),e}).catch(e=>{let a=t.error?_(t.error,e):void 0;a?M.error(a,{id:s,...r,...null==r?void 0:r.error}):M.dismiss(s)}),e};var U=new Map,I=1e3,O=N`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,G=N`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,R=N`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,F=(k("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${O} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${G} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${R} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,N`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`),T=(k("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${F} 1s linear infinite;
`,N`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`),L=N`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,H=(k("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${T} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${L} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,k("div")`
  position: absolute;
`,k("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,N`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`);function J(){let[e,t]=(0,o.useState)([]),[r,s]=(0,o.useState)(!0),[i,n]=(0,o.useState)(null),d=async(r,s)=>{try{if(n(r),!(await fetch("/api/users",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:r,role:s})})).ok)throw Error("更新用戶角色失敗");t(e.map(e=>e.id===r?{...e,role:s}:e)),M.success("用戶角色已更新")}catch(e){console.error("更新用戶角色錯誤:",e),M.error("更新用戶角色失敗")}finally{n(null)}};return(0,a.jsx)("div",{children:(0,a.jsx)("div",{className:"bg-white shadow rounded-lg overflow-hidden",children:(0,a.jsxs)("table",{className:"min-w-full divide-y divide-gray-200",children:[(0,a.jsx)("thead",{className:"bg-gray-50",children:(0,a.jsxs)("tr",{children:[(0,a.jsx)("th",{scope:"col",className:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",children:"用戶名"}),(0,a.jsx)("th",{scope:"col",className:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",children:"電子郵件"}),(0,a.jsx)("th",{scope:"col",className:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",children:"目前角色"}),(0,a.jsx)("th",{scope:"col",className:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",children:"設定角色"})]})}),(0,a.jsx)("tbody",{className:"bg-white divide-y divide-gray-200",children:r?(0,a.jsx)("tr",{children:(0,a.jsx)("td",{colSpan:4,className:"px-6 py-4 whitespace-nowrap text-center",children:"載入中..."})}):0===e.length?(0,a.jsx)("tr",{children:(0,a.jsx)("td",{colSpan:4,className:"px-6 py-4 whitespace-nowrap text-center",children:"沒有用戶數據"})}):e.map(e=>(0,a.jsxs)("tr",{children:[(0,a.jsx)("td",{className:"px-6 py-4 whitespace-nowrap",children:(0,a.jsxs)("div",{className:"flex items-center",children:[e.image?(0,a.jsx)("img",{className:"h-10 w-10 rounded-full mr-3",src:e.image,alt:e.name}):(0,a.jsx)("div",{className:"h-10 w-10 rounded-full bg-gray-200 mr-3 flex items-center justify-center",children:(0,a.jsx)("span",{className:"text-gray-500",children:e.name?.[0]?.toUpperCase()||"?"})}),(0,a.jsx)("div",{className:"ml-4",children:(0,a.jsx)("div",{className:"text-sm font-medium text-gray-900",children:e.name||"未命名"})})]})}),(0,a.jsx)("td",{className:"px-6 py-4 whitespace-nowrap",children:(0,a.jsx)("div",{className:"text-sm text-gray-900",children:e.email})}),(0,a.jsx)("td",{className:"px-6 py-4 whitespace-nowrap",children:(0,a.jsx)("span",{className:`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${e.role?.toUpperCase()==="ADMIN"?"bg-purple-100 text-purple-800":e.role?.toUpperCase()==="MASSEUR"?"bg-green-100 text-green-800":"bg-blue-100 text-blue-800"}`,children:e.role?.toUpperCase()==="ADMIN"?"管理員":e.role?.toUpperCase()==="MASSEUR"?"按摩師":"一般用戶"})}),(0,a.jsx)("td",{className:"px-6 py-4 whitespace-nowrap text-sm text-gray-500",children:(0,a.jsxs)("select",{value:e.role,onChange:t=>d(e.id,t.target.value),disabled:i===e.id,className:"mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm",children:[(0,a.jsx)("option",{value:"user",children:"一般用戶"}),(0,a.jsx)("option",{value:"masseur",children:"按摩師"}),(0,a.jsx)("option",{value:"admin",children:"管理員"})]})})]},e.id))})]})})})}function K(){let{data:e}=(0,i.useSession)({required:!0,onUnauthenticated(){(0,n.redirect)("/login")}});return(0,d.q)(e),(0,a.jsxs)("div",{className:"p-4",children:[(0,a.jsxs)("div",{className:"mb-6",children:[(0,a.jsx)("h1",{className:"text-2xl font-bold",children:"用戶管理"}),(0,a.jsx)("p",{className:"text-gray-600",children:"管理系統中的所有用戶和角色分配"})]}),(0,a.jsxs)("div",{className:"bg-white rounded-lg shadow-sm p-6 mb-6",children:[(0,a.jsx)("h2",{className:"text-xl font-semibold mb-4",children:"角色說明"}),(0,a.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[(0,a.jsxs)("div",{className:"p-4 border rounded-lg",children:[(0,a.jsx)("div",{className:"text-lg font-medium mb-1 text-blue-600",children:"一般用戶"}),(0,a.jsx)("p",{className:"text-sm text-gray-600",children:"只能查看和預約服務，管理個人資料。"})]}),(0,a.jsxs)("div",{className:"p-4 border rounded-lg",children:[(0,a.jsx)("div",{className:"text-lg font-medium mb-1 text-green-600",children:"按摩師"}),(0,a.jsx)("p",{className:"text-sm text-gray-600",children:"可以查看預約情況並管理自己的排程。"})]}),(0,a.jsxs)("div",{className:"p-4 border rounded-lg",children:[(0,a.jsx)("div",{className:"text-lg font-medium mb-1 text-purple-600",children:"管理員"}),(0,a.jsx)("p",{className:"text-sm text-gray-600",children:"可以進行系統全部設定，管理用戶、服務和按摩師。"})]})]})]}),(0,a.jsxs)("div",{className:"bg-white rounded-lg shadow-sm p-6",children:[(0,a.jsx)("h2",{className:"text-xl font-semibold mb-4",children:"用戶列表"}),(0,a.jsx)(J,{})]})]})}k("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${H} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,k("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,k("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,s=o.createElement,x.p=void 0,v=s,j=void 0,w=void 0,y`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`},47362:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>s});let s=(0,r(46760).registerClientReference)(function(){throw Error("Attempted to call the default export of \"D:\\\\projects\\\\10massage\\\\src\\\\app\\\\(dashboard)\\\\users\\\\page.tsx\" from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"D:\\projects\\10massage\\src\\app\\(dashboard)\\users\\page.tsx","default")}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),s=t.X(0,[638,154,347,77,504,899],()=>r(19542));module.exports=s})();