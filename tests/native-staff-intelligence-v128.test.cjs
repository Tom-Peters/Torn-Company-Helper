"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const source=fs.readFileSync(path.join(__dirname,"../Torn-Company-Helper.user.js"),"utf8");
function company(){
 return {profile:{id:101,name:"Demo Fitness",type:{id:29,name:"Fitness Center"},rating:4,trains:2,efficiency:92,
    employees:{capacity:3,hired:2},income:{daily:850000},advertisement_budget:100000},
  staff:[
    {id:11,name:"Sample Alpha",days_in_company:10,position:{name:"Receptionist"},
      stats:{manual_labor:1000,intelligence:50000,endurance:30000},wage:200000,value:1200000,effectiveness:{total:90}},
    {id:12,name:"Sample Beta",days_in_company:1,position:{name:"Cleaner"},
      stats:{manual_labor:85000,intelligence:6000,endurance:24000},wage:100000,value:0,effectiveness:{total:80}}],
  roles:[{name:"Receptionist",requirements:{intelligence:20000,endurance:15000}},
    {name:"Cleaner",requirements:{manual_labor:20000,endurance:10000}},
    {name:"Manager",requirements:{intelligence:90000,endurance:90000}}],
  payments:[{id:"p11",playerId:11,trains:5,ts:100,confirmed:true,amount:1000000},
    {id:"p12",playerId:12,trains:2,ts:200,confirmed:true,amount:500000}],
  training:[{id:"t11",playerId:11,units:2,ts:300}],snapshots:[],stock:[],news:[],logs:[],archived:[],
  whatIf:{},lastRefresh:new Date().toISOString(),lossLimit:500000};
}
function fixture(){
 const elements=new Map(),rows=[],host={prepend(n){elements.set(n.id,n);}};
 function node(){return {style:{},dataset:{},innerHTML:"",hidden:false,_child:null,appendCount:0,
  addEventListener(){},setAttribute(){},getBoundingClientRect(){return {left:3,top:5,width:150,height:45};},
  setPointerCapture(){},appendChild(n){this._child=n;n.parentNode=this;this.appendCount++;},
  querySelector(sel){return sel===":scope > .tch-staff-intel"?this._child:null;},
  remove(){if(this.parentNode)this.parentNode._child=null;}};}
 function staffRow(id){const r=node();r.getAttribute=(k)=>k==="data-user"?String(id):null;return r;}
 const document={createElement:node,getElementById(x){return elements.get(x)||null;},
  querySelector(x){return x==="#mainContainer"?host:null;},
  querySelectorAll(x){return x==='ul.employee-list > li[data-user]'?rows:[];},
  body:{appendChild(n){elements.set(n.id,n);}},documentElement:{appendChild(n){elements.set(n.id,n);}}};
 const window={location:{hostname:"www.torn.com",pathname:"/companies.php"},innerWidth:400,innerHeight:850,
  addEventListener(){},confirm(){return true;}};window.top=window;window.self=window;
 const marker='  const style=document.createElement("style");';
 assert.ok(source.includes(marker));
 const extra='  globalThis.__staffV128={companyDeskV134,staffDeskV134,staffIntelligenceV128,staffInsightHTMLV128,nativeStaffRosterV128,'+
  'syncNativeStaffRowsV128,nativeCompanyDeskHTMLV127,staffBriefV128,staffComparisonV129,'+
  'comparableStaffV129,directorOpportunitiesV129,responsiblePayV129,setCompany(c){companyId=String(c.profile.id);data.byCompany[companyId]=c;}};\n'+marker;
 const sandbox={window,document,location:window.location,Date,Math,Number,Set,Map,JSON,URL,URLSearchParams,Blob,console,
  PDA_storage:{get:async()=>null,set:async()=>true}};
 vm.runInNewContext(source.replace(marker,extra),sandbox,{timeout:1800});
 return {api:sandbox.__staffV128,rows,staffRow};
}
test("Current pay is kept where same-position peer evidence is missing",()=>{
 const {api}=fixture(),m=api.staffIntelligenceV128(company());
 assert.equal(m.byId["11"].payTarget,200000);
 assert.equal(m.byId["12"].payTarget,100000);
 assert.equal(m.byId["11"].payStatus,"Hold");
 assert.equal(m.byId["12"].payStatus,"Hold");
 assert.match(m.byId["11"].source,/Current wage/);
 assert.match(m.byId["12"].source,/Current wage/);
 assert.equal(m.byId["12"].best.name,"Cleaner");
 assert.equal(m.byId["11"].best.name,"Receptionist");
});
test("Same-position comparisons justify only capped raises inside the loss limit",()=>{
 const {api}=fixture(),c=company();c.staff[0].wage=100000;
 c.staff.push({id:13,name:"Sample Gamma",days_in_company:100,position:{name:"Receptionist"},
  stats:{intelligence:40000,endurance:20000},wage:200000,value:0,effectiveness:{total:90}},
  {id:14,name:"Sample Delta",days_in_company:100,position:{name:"Receptionist"},
  stats:{intelligence:40000,endurance:20000},wage:240000,value:0,effectiveness:{total:90}});
 c.profile.employees={hired:4,capacity:4};
 const r=api.staffIntelligenceV128(c).byId["11"];
 assert.equal(r.payStatus,"Review raise");assert.equal(r.payTarget,120000);
 assert.equal(r.payChange,20000);
 c.lossLimit=0;c.profile.income.daily=0;
 const blocked=api.staffIntelligenceV128(c).byId["11"];
 assert.equal(blocked.payStatus,"Hold");assert.equal(blocked.payTarget,100000);
});
test("Confirmed owed trains stay visible even if someone is not eligible",()=>{
 const {api}=fixture(),m=api.staffIntelligenceV128(company());
 assert.equal(m.byId["11"].due,3);assert.equal(m.byId["11"].give,2);
 assert.equal(m.byId["12"].due,2);assert.equal(m.byId["12"].give,0);
 assert.match(m.byId["12"].trainStatus,/72h/);
});
test("Stale company snapshots never claim ready trains",()=>{
 const {api}=fixture(),c=company();c.lastRefresh=new Date(Date.now()-172800000).toISOString();
 const m=api.staffIntelligenceV128(c);
 assert.equal(m.byId["11"].due,3);assert.equal(m.byId["11"].give,0);
 assert.match(m.byId["11"].trainStatus,/Refresh/);
 assert.match(api.nativeCompanyDeskHTMLV127(c),/refresh needed/);
});
test("Native employee rows match only known numeric data-user IDs, never guessed names",()=>{
 const {api,rows,staffRow}=fixture(),c=company(),a=staffRow(11),x=staffRow(999),b=staffRow(12);
 rows.push(a,x,b);api.setCompany(c);api.syncNativeStaffRowsV128(c);
 assert.ok(a._child);assert.equal(x._child,null);assert.ok(b._child);
 assert.match(a._child.innerHTML,/>PAY</);
 assert.match(a._child.innerHTML,/>TRAINS</);
 assert.match(a._child.innerHTML,/>BEST STAT FIT</);
 assert.match(a._child.innerHTML,/data-tch-act="employee-inline"/);
 api.syncNativeStaffRowsV128(c);assert.equal(a.appendCount,1);
 api.syncNativeStaffRowsV128(null);assert.equal(a._child,null);
});
test("Untrusted names, roles and data are HTML escaped",()=>{
 const {api}=fixture(),c=company();c.staff[0].name='<img src=x onerror=alert(1)>';
 c.staff[0].position.name='"><script>bad</script>';
 const m=api.staffIntelligenceV128(c);
 const h=api.staffInsightHTMLV128(m.byId["11"],false)+api.nativeCompanyDeskHTMLV127(c);
 assert.match(h,/&lt;img/);assert.match(h,/&lt;script&gt;/);
 assert.doesNotMatch(h,/<img|<script>/);
});
test("Redesigned native page exposes KPIs and safe quick-action navigation",()=>{
 const {api}=fixture(),c=company(),h=api.nativeCompanyDeskHTMLV127(c);
 for(const label of ["Rating","Daily P/L","Staff","Payroll","Owed trains","PAY"])
  assert.match(h,new RegExp(label,"i"));
 for(const action of ["refresh","overview","queue","staff","wages","growth"])
  assert.match(h,new RegExp('type="button" data-tch-act="'+action+'"'));
 assert.match(api.staffBriefV128(c,"today"),/best stats fit/i);
});

test("Comparison table is sortable and includes pay, EFF, fit and training obligations",()=>{
 const {api}=fixture(),c=company();
 const html=api.staffComparisonV129(c);
 assert.match(html,/<table>/);assert.match(html,/Sort employees/);
 for(const col of ["Daily pay","Torn EFF","Best stats fit","Fit gain","Owed \/ ready"])
   assert.match(html,new RegExp(col,"i"));
 const rows=api.comparableStaffV129(c);
 assert.equal(rows[0].id,"11");
});
test("Director opportunities put cost breaches ahead of training and unsupported growth claims",()=>{
 const {api}=fixture(),c=company();
 c.profile.income.daily=0;c.lossLimit=0;
 const moves=api.directorOpportunitiesV129(c);
 assert.match(moves[0].title,/loss/i);
 assert.match(moves[0].detail,/daily operating improvement/);
 assert.equal(moves[0].target,"growth-accounts");
 assert.ok(moves.some(x=>x.target==="training-queue"));
});
test("Thin employee markup never renders a large card or a full-width detail button",()=>{
 const {api}=fixture(),r=api.staffIntelligenceV128(company()).byId["11"],html=api.staffInsightHTMLV128(r,false);
 assert.match(html,/tch-staff-insight-grid/);
 assert.doesNotMatch(html,/Recommended pay <i>/);
 assert.doesNotMatch(html,/View employee</);
 assert.match(html,/class="tch-intel-open"/);
});

test("Director desk prioritises stale data and incomplete or breached accounts before paid trains",()=>{
 const {api}=fixture(),c=company();
 assert.match(api.companyDeskV134(c).next.title,/Train Sample Alpha next/);
 c.profile.income.daily=0;c.lossLimit=0;
 assert.equal(api.companyDeskV134(c).next.target,"growth-accounts");
 c.profile.income.daily=null;
 assert.match(api.companyDeskV134(c).next.title,/missing operating costs/);
 c.lastRefresh=new Date(Date.now()-3600000).toISOString();
 assert.equal(api.companyDeskV134(c).next.target,"refresh");
 assert.match(api.staffInsightHTMLV128(api.staffIntelligenceV128(c).byId["11"],false),/Refresh to verify/);
});
test("Phone staff desk exposes owed debt and readiness without requiring the wide comparison table",()=>{
 const {api}=fixture(),c=company(),html=api.staffDeskV134(c);
 assert.match(html,/Sample Alpha/);assert.match(html,/Sample Beta/);
 assert.match(html,/3 owed/);assert.match(html,/2 ready/);
 assert.match(html,/data-act="staff-filter"/);assert.match(html,/Current fit/);
 assert.doesNotMatch(html,/<table/);
 assert.match(api.nativeCompanyDeskHTMLV127(c),/Next paid trains/);
});
