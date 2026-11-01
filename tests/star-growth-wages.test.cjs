"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const source=fs.readFileSync(path.join(__dirname,"..","Torn-Company-Helper.user.js"),"utf8");
function fixture(reply){
 const nodes=new Map(),calls=[];
 const node=()=>({id:"",style:{},dataset:{},hidden:false,innerHTML:"",
  addEventListener(){},appendChild(){},setPointerCapture(){},offsetWidth:144,offsetHeight:44,
  getBoundingClientRect(){return {left:10,top:12,width:144,height:44};},setAttribute(){}});
 const document={getElementById(id){return nodes.get(id)||null;},createElement:node,
  documentElement:{appendChild(e){nodes.set(e.id,e);}},body:{appendChild(e){nodes.set(e.id,e);}}};
 const window={location:{pathname:"/companies.php"},innerWidth:390,innerHeight:810,addEventListener(){}};
 window.top=window;window.self=window;
 const hook='  const style=document.createElement("style");';
 const script=source.replace('const PDA_APP_KEY = "###PDA-APIKEY###";', 'const PDA_APP_KEY = "AAAAAAAAAAAAAAAA";').replace(hook,'  globalThis.__v11={peerModelV11,starGrowthV11,starGrowthPanelV11,rivalsPanelV11,'+
   'wageModelV11,wagesPanelV11,trainingWeekV11,weekPanelV11,launcherAlertsV11,updateLauncherV11,'+
   'scanPeersV11,staffV2,trainingV2,growthV2,seed(c){companyId=String(c.profile.id);data.byCompany[companyId]=c;},draw};\n'+hook);
 const scope={window,document,URL,URLSearchParams,Date,Number,Math,JSON,Set,Map,Blob,console,
  PDA_storage:{get:async()=>null,set:async()=>true},
  PDA_httpGet:async (url,opts)=>{
    calls.push({url,opts});
    const payload=reply?reply(url):{};
    return {status:200,responseText:JSON.stringify(payload)};
  }};
 vm.runInNewContext(script,scope,{timeout:1600});
 return {app:scope.__v11,nodes,calls};
}
function example(){
 return {profile:{id:77,name:"Example Fitness",type:{id:29,name:"Fitness Center"},rating:3,
    trains:18,popularity:82,efficiency:94,environment:96,
    income:{daily:1400000,weekly:9500000},advertisement_budget:300000,
    employees:{capacity:14,hired:3}},
   staff:[
    {id:1,name:"Direct",position:{name:"Receptionist"},wage:90000,value:500000,
     days_in_company:10,stats:{manual_labor:10000,intelligence:20000,endurance:15000},
     effectiveness:{total:100}},
    {id:2,name:"Manager",position:{name:"Manager"},wage:200000,value:0,
     days_in_company:11,stats:{manual_labor:10000,intelligence:50000,endurance:75000},
     effectiveness:{total:100}},
    {id:3,name:"No HR data",position:{name:"Cleaner"},wage:100000,value:null,
     days_in_company:5,stats:{manual_labor:30000,intelligence:20000,endurance:15000},
     effectiveness:{total:100}}],
   stock:[],roles:[],snapshots:[],logs:[],news:[],archived:[],whatIf:{},lossLimit:500000,
   payments:[{playerId:1,trains:4,ts:100,confirmed:true,id:"p"}],training:[]};
}
test("HR value is used for wage scenarios, zero and null are not treated as direct revenue",()=>{
 const {app}=fixture(),c=example(),m=app.wageModelV11(c);
 assert.equal(m.visible,2);
 assert.equal(m.direct,1);
 assert.equal(m.rows[0].ratio,.18);
 assert.equal(m.rows[0].target,125000);
 assert.equal(m.rows[1].target,null);
 assert.equal(m.rows[2].value,null);
 c.wageShare=40;
 assert.equal(app.wageModelV11(c).rows[0].target,200000);
 assert.match(app.wagesPanelV11(c),/Indirect support role/);
 assert.match(app.wagesPanelV11(c),/Value unavailable/);
});
test("No Secretary data means no fabricated HR-based salary recommendation",()=>{
 const {app}=fixture(),c=example();
 c.staff.forEach(p=>{p.value=null;});
 assert.equal(app.wageModelV11(c).visible,0);
 assert.match(app.wagesPanelV11(c),/No HR-revealed values/);
});
test("Star growth recommendations use effect metrics, not employee wage as promotion driver",()=>{
 const {app}=fixture(),c=example();
 const m=app.starGrowthV11(c);
 assert.ok(m.issues.some(x=>x.title==="Improve daily efficiency"));
 assert.ok(m.issues.some(x=>x.title==="Grow weekly customer income"));
 assert.match(app.starGrowthPanelV11(c),/not a star-up lever/);
});
test("Next-tier competitor data is measured against a known sample, not called a promotion threshold",()=>{
 const {app}=fixture(),c=example();
 c.peers={scanned:3,complete:false,total:220,observedAt:"2026-10-31T18:00:00Z",
   rows:[{id:101,name:"Next A",rating:4,income:{weekly:12000000},type:{id:29}},
         {id:102,name:"Next B",rating:4,income:{weekly:16000000},type:{id:29}},
         {id:103,name:"Own tier",rating:3,income:{weekly:9000000},type:{id:29}}]};
 const peers=app.peerModelV11(c);
 assert.equal(peers.target,4);
 assert.equal(peers.benchmark,14000000);
 assert.equal(peers.gap,4500000);
 assert.equal(peers.full,false);
 assert.match(app.rivalsPanelV11(c),/Partial directory sample/);
 assert.match(app.rivalsPanelV11(c),/Not a promotion threshold/);
});
test("Seven-day plan uses current paid debt and flags possible overflow, without actions",()=>{
 const {app}=fixture(),c=example(),f=app.trainingWeekV11(c);
 assert.equal(f.days.length,7);
 assert.equal(f.days[0].given,4);
 assert.equal(f.days[0].stored,17);
 assert.equal(f.days[1].minimumLost,0);
 assert.ok(f.days[2].minimumLost>0);
 assert.match(app.weekPanelV11(c),/excludes trainer/);
});
test("Floating-button alerts are derived only from saved data and include overdue trains",()=>{
 const {app,nodes}=fixture(),c=example();app.seed(c);app.updateLauncherV11();
 const badge=nodes.get("tch-open").innerHTML;
 assert.match(badge,/tch-launcherbadge/);
 assert.match(badge,/Company Helper/);
 assert.ok(app.launcherAlertsV11(c).count>0);
 const empty=example();empty.profile.trains=0;empty.payments=[];empty.profile.income.daily=10000000;
 empty.profile.efficiency=100;empty.profile.popularity=100;empty.profile.environment=100;
 assert.equal(app.launcherAlertsV11(empty).count,0);
});
test("Public competitor scanner is explicitly user initiated, scoped to company type, and persisted",async()=>{
 const list=[
  {id:77,name:"Own",type:{id:29},rating:3,income:{weekly:9500000},employees:{hired:3,capacity:14}},
  {id:101,name:"Next",type:{id:29},rating:4,income:{weekly:12000000},employees:{hired:14,capacity:14}}
 ];
 const {app,calls}=fixture(()=>({_metadata:{total:2},companies:list}));
 const c=example();app.seed(c);
 assert.equal(calls.length,0);
 await app.scanPeersV11();
 assert.equal(calls.length,1);
 assert.match(calls[0].url,/company\/29\/companies\?limit=100&offset=0/);
 assert.equal(c.peers.complete,true);
 assert.equal(c.peers.scanned,2);
 assert.equal(app.peerModelV11(c).rows.length,1);
});
test("Reworked screens include wage, rivals, star priorities, and existing training history",()=>{
 const {app,calls}=fixture(),c=example();
 assert.match(app.staffV2(c),/Wage helper/);
 assert.match(app.trainingV2(c),/Training ledger/);
 assert.match(app.growthV2(c),/Rivals/);
 assert.equal(calls.length,0);
 assert.doesNotMatch(source,/PDA_http(?:Post|Put|Patch|Delete)\s*\(/);
 assert.match(source,/\/\/ @version\s+1\.5\.0/);
 assert.match(source,/const PDA_APP_KEY = "###PDA-APIKEY###";/);
});
