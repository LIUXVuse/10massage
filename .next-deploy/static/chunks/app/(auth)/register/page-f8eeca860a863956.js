(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[678],{774:(e,s,t)=>{Promise.resolve().then(t.t.bind(t,8173,23)),Promise.resolve().then(t.bind(t,3338))},3338:(e,s,t)=>{"use strict";t.d(s,{RegisterForm:()=>m});var r=t(5155),a=t(2115),o=t(6046),i=t(9606),n=t(2679),l=t(3415),d=t(3312),c=t(3900);let u=l.Ik({name:l.Yj().min(2,"姓名至少需要2個字元"),email:l.Yj().email("請輸入有效的電子郵件"),password:l.Yj().min(6,"密碼至少需要6個字元"),phone:l.Yj().optional()});function m(){let e=(0,o.useRouter)(),[s,t]=(0,a.useState)(""),[l,m]=(0,a.useState)(!1),{register:p,handleSubmit:f,formState:{errors:h}}=(0,i.mN)({resolver:(0,n.u)(u)});async function x(s){try{m(!0),t("");let r=await fetch("/api/auth/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)});if(!r.ok){let e=await r.json();throw Error(e.message)}e.push("/login?registered=true")}catch(e){t(e instanceof Error?e.message:"註冊時發生錯誤")}finally{m(!1)}}return(0,r.jsxs)("form",{onSubmit:f(x),className:"space-y-4",children:[(0,r.jsxs)("div",{className:"space-y-2",children:[(0,r.jsx)(c.p,{id:"name",placeholder:"您的姓名",type:"text",autoCapitalize:"none",autoComplete:"name",autoCorrect:"off",disabled:l,...p("name")}),(null==h?void 0:h.name)&&(0,r.jsx)("p",{className:"text-sm text-red-500",children:h.name.message})]}),(0,r.jsxs)("div",{className:"space-y-2",children:[(0,r.jsx)(c.p,{id:"email",placeholder:"name@example.com",type:"email",autoCapitalize:"none",autoComplete:"email",autoCorrect:"off",disabled:l,...p("email")}),(null==h?void 0:h.email)&&(0,r.jsx)("p",{className:"text-sm text-red-500",children:h.email.message})]}),(0,r.jsxs)("div",{className:"space-y-2",children:[(0,r.jsx)(c.p,{id:"password",placeholder:"請輸入密碼",type:"password",autoComplete:"new-password",disabled:l,...p("password")}),(null==h?void 0:h.password)&&(0,r.jsx)("p",{className:"text-sm text-red-500",children:h.password.message})]}),(0,r.jsxs)("div",{className:"space-y-2",children:[(0,r.jsx)(c.p,{id:"phone",placeholder:"電話號碼（選填）",type:"tel",autoComplete:"tel",disabled:l,...p("phone")}),(null==h?void 0:h.phone)&&(0,r.jsx)("p",{className:"text-sm text-red-500",children:h.phone.message})]}),s&&(0,r.jsx)("p",{className:"text-sm text-red-500",children:s}),(0,r.jsx)(d.$,{type:"submit",className:"w-full",disabled:l,children:l?"註冊中...":"註冊"})]})}},3312:(e,s,t)=>{"use strict";t.d(s,{$:()=>d});var r=t(5155),a=t(2115),o=t(2317),i=t(1027),n=t(1567);let l=(0,i.F)("inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",{variants:{variant:{default:"bg-primary text-primary-foreground shadow hover:bg-primary/90",destructive:"bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",outline:"border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",secondary:"bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",ghost:"hover:bg-accent hover:text-accent-foreground",link:"text-primary underline-offset-4 hover:underline"},size:{default:"h-9 px-4 py-2",sm:"h-8 rounded-md px-3 text-xs",lg:"h-10 rounded-md px-8",icon:"h-9 w-9"}},defaultVariants:{variant:"default",size:"default"}}),d=a.forwardRef((e,s)=>{let{className:t,variant:a,size:i,asChild:d=!1,...c}=e,u=d?o.DX:"button";return(0,r.jsx)(u,{className:(0,n.cn)(l({variant:a,size:i,className:t})),ref:s,...c})});d.displayName="Button"},3900:(e,s,t)=>{"use strict";t.d(s,{p:()=>i});var r=t(5155),a=t(2115),o=t(1567);let i=a.forwardRef((e,s)=>{let{className:t,type:a,...i}=e;return(0,r.jsx)("input",{type:a,className:(0,o.cn)("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",t),ref:s,...i})});i.displayName="Input"},1567:(e,s,t)=>{"use strict";t.d(s,{cn:()=>o});var r=t(3463),a=t(9795);function o(){for(var e=arguments.length,s=Array(e),t=0;t<e;t++)s[t]=arguments[t];return(0,a.QP)((0,r.$)(s))}}},e=>{var s=s=>e(e.s=s);e.O(0,[374,130,40,441,517,358],()=>s(774)),_N_E=e.O()}]);