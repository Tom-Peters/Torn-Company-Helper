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
 const extra='  globalThis.__staffV128={staffIntelligenceV128,staffInsightHTMLV128,nativeStaffRosterV128,'+
  'syncNativeStaffRowsV128,nativeCompanyDeskHTMLV127,staffBriefV128,setCompany(c){companyId=String(c.profile.id);data.byCompany[companyId]=c;}};\n'+marker;
 const sandbox={window,document,location:window.location,Date,Math,Number,Set,Map,JSON,URL,URLSearchParams,Blob,console,
  PDA_storage:{get:async()=>null,set:async()=>true}};
 vm.runInNewContext(source.replace(marker,extra),sandbox,{timeout:1800});
 return {api:sandbox.__staffV128,rows,staffRow};
}
test("HR direct value drives one pay target; support uses EFF peers, not invented income",()=>{
 const {api}=fixture(),m=api.staffIntelligenceV128(company());
 assert.equal(m.byId["11"].payTarget,300000);
 assert.equal(m.byId["11"].wage,200000);
 assert.match(m.byId["11"].source,/HR value/);
 assert.ok(m.byId["12"].payTarget>0);
 assert.match(m.byId["12"].source,/Peer wage/);
 assert.equal(m.byId["12"].best.name,"Cleaner");
 assert.equal(m.byId["11"].best.name,"Receptionist");
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
 assert.match(api.nativeCompanyDeskHTMLV127(c),/Saved data/);
});
test("Native employee rows match only known numeric data-user IDs, never guessed names",()=>{
 const {api,rows,staffRow}=fixture(),c=company(),a=staffRow(11),x=staffRow(999),b=staffRow(12);
 rows.push(a,x,b);api.setCompany(c);api.syncNativeStaffRowsV128(c);
 assert.ok(a._child);assert.equal(x._child,null);assert.ok(b._child);
 assert.match(a._child.innerHTML,/Recommended pay/);
 assert.match(a._child.innerHTML,/Trains owed/);
 assert.match(a._child.innerHTML,/Best stats fit/);
 assert.match(a._child.innerHTML,/data-tch-act="employee"/);
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
 for(const label of ["Rating","Daily P/L","Staff","Payroll","Owed trains","Recommended pay"])
  assert.match(h,new RegExp(label,"i"));
 for(const action of ["refresh","overview","queue","staff","wages","growth"])
  assert.match(h,new RegExp('type="button" data-tch-act="'+action+'"'));
 assert.match(api.staffBriefV128(c,"today"),/best stats fit/i);
});
