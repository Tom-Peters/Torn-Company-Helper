"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const source=fs.readFileSync(path.join(__dirname,"../Torn-Company-Helper.user.js"),"utf8");
const marker='  const style=document.createElement("style");';
assert.ok(source.includes(marker),"Company Helper instrumentation point exists");
function fixture(){
  const emitted=[],elements={};
  const node=()=>({style:{},dataset:{},hidden:false,innerHTML:"",addEventListener(){},appendChild(){},setAttribute(){},
    offsetWidth:140,offsetHeight:44,setPointerCapture(){},getBoundingClientRect(){return {left:4,top:4,width:140,height:44};}});
  const document={getElementById(){return null;},createElement:node,documentElement:{appendChild(){}},body:{appendChild(el){if(el.id)elements[el.id]=el;}},
    dispatchEvent(e){emitted.push({type:e.type,detail:e.detail});},addEventListener(){}};
  const window={location:{pathname:"/companies.php"},innerWidth:390,innerHeight:840,addEventListener(){}};
  window.top=window;window.self=window;
  const code=source.replace(marker,
    '  globalThis.__paid={trainPlanV3,launcherAlertsV11,companyHubActions,companyActionList,companyAlertsPanel,trainPacePanelV3,updateLauncherV11,setCompany(c){companyId=String(c.profile.id);data.byCompany[companyId]=c;}};\n'+marker);
  const scope={document,window,CustomEvent:class{constructor(type,init){this.type=type;this.detail=init.detail;}},
    URL,URLSearchParams,Date,Math,JSON,Number,Set,Map,Blob,console,
    PDA_storage:{get:async()=>null},PDA_httpGet(){throw Error("Unexpected API request")}};
  vm.runInNewContext(code,scope,{timeout:1600});
  return {app:scope.__paid,emitted,elements};
}
function company(trains=0,owed=5,days=5){
  return {profile:{id:7,type:{id:29,name:"Fitness Center"},rating:3,trains,
      name:"Sample Company",income:{daily:100000,weekly:700000},advertisement_budget:2000,
      employees:{hired:1,capacity:14},popularity:100,efficiency:100,environment:100,funds:1000000},
    lastRefresh:new Date().toISOString(),staff:[{id:101,name:"Example Employee",days_in_company:days,wage:1000,
      position:{name:"Personal Trainer"},effectiveness:{total:100},stats:{manual_labor:50000,intelligence:50000,endurance:50000}}],
    roles:[],stock:[],snapshots:[],archived:[],news:[],logs:[],payments:owed?[{id:"payment-1",playerId:101,trains:owed,ts:100,confirmed:true,source:"manual"}]:[],
    training:[],applications:[],lossLimit:500000};
}
function paidAlerts(app,c){return app.launcherAlertsV11(c).items.filter(x=>x.id==="training-owed");}
function paidHubActions(app,c){return app.companyHubActions(c).filter(x=>x.id==="training-owed"||x.id==="decision-training-queue"||
  (x.id.startsWith("decision-")&&/paid training|training commitment/i.test(x.title)));}
test("Outstanding paid trains with zero available remain in ledger but generate no actionable alerts",()=>{
  const {app,emitted,elements}=fixture(),c=company(0,5);
  assert.equal(app.trainPlanV3(c).allocate,0);
  assert.equal(paidAlerts(app,c).length,0);
  assert.equal(paidHubActions(app,c).length,0);
  assert.equal(app.companyActionList(c).some(x=>x.target==="training-queue"),false);
  assert.doesNotMatch(app.companyAlertsPanel(c),/training-owed|Paid training ready to give/);
  assert.match(app.trainPacePanelV3(c),/Owed 5/);
  assert.match(app.trainPacePanelV3(c),/Waiting for trains/);
  app.setCompany(c);app.updateLauncherV11();
  const notice=emitted.filter(x=>x.type==="staxx:notice").at(-1).detail;
  assert.ok(!notice.alerts.some(x=>x.id==="training-owed"),"StaxxHub badge must not count purchased trains without bank availability");
  const actionEvent=emitted.filter(x=>x.type==="staxx:actions").at(-1).detail;
  assert.ok(!actionEvent.items.some(x=>x.id==="training-owed"||x.id==="decision-training-queue"));
  assert.doesNotMatch(elements["tch-open"].innerHTML,/paid train/i);
});
test("As soon as an available train can fulfil confirmed eligible debt, notify with giveable quantity",()=>{
  const {app}=fixture(),c=company(2,5);
  const plan=app.trainPlanV3(c);
  assert.equal(plan.allocate,2);
  assert.equal(plan.queue[0].give,2);
  const alerts=paidAlerts(app,c);
  assert.equal(alerts.length,1);
  assert.match(alerts[0].text,/2 paid train\(s\) ready for 1 eligible employee\(s\)/);
  assert.ok(paidHubActions(app,c).some(x=>x.id==="training-owed"));
  assert.ok(paidHubActions(app,c).some(x=>x.id==="decision-training-queue"));
  assert.ok(app.companyActionList(c).some(x=>x.title==="Paid training ready to give"));
  assert.match(app.companyAlertsPanel(c),/2 paid train\(s\) ready/);
  assert.match(app.trainPacePanelV3(c),/Give up to 2/);
  c.profile.trains=0; // e.g. the director manually used available trains in Torn
  assert.equal(paidAlerts(app,c).length,0);
  assert.equal(paidHubActions(app,c).length,0);
  assert.match(app.trainPacePanelV3(c),/Owed 5/);
});
test("No train alert for unknown stock, unconfirmed purchases or employees not yet eligible",()=>{
  const {app}=fixture();
  const unknown=company(null,5);
  assert.equal(app.trainPlanV3(unknown).available,null);
  assert.equal(paidAlerts(app,unknown).length,0);
  assert.equal(paidHubActions(app,unknown).length,0);
  const tooNew=company(4,5,2);
  assert.equal(app.trainPlanV3(tooNew).allocate,0);
  assert.equal(paidAlerts(app,tooNew).length,0);
  const noPurchase=company(4,0);
  assert.equal(paidAlerts(app,noPurchase).length,0);
  const unconfirmed=company(4,0);
  unconfirmed.payments=[{id:"pending",playerId:101,trains:4,ts:110,confirmed:false,source:"manual"}];
  assert.equal(paidAlerts(app,unconfirmed).length,0);
  const departed=company(4,5);departed.staff=[];
  assert.equal(paidAlerts(app,departed).length,0);
});
test("Oldest-first allocation alerts only for immediately giveable confirmed paid trains",()=>{
  const {app}=fixture(),c=company(3,5);
  c.staff.push({id:202,name:"Second Employee",days_in_company:7,wage:1000,position:{name:"Personal Trainer"}});
  c.profile.employees.hired=2;
  c.payments.push({id:"payment-2",playerId:202,trains:4,ts:50,confirmed:true,source:"manual"});
  const plan=app.trainPlanV3(c);
  assert.equal(plan.allocate,3);
  assert.equal(plan.queue[0].name,"Second Employee");
  assert.equal(plan.queue[0].give,3);
  assert.equal(plan.queue[1].give,0);
  assert.match(paidAlerts(app,c)[0].text,/3 paid train\(s\) ready for 1 eligible employee\(s\)/);
});
test("Independent bank-overflow and payment-review alerts are preserved",()=>{
  const {app}=fixture(),c=company(19,0);
  const alertIds=app.launcherAlertsV11(c).items.map(x=>x.id);
  assert.ok(alertIds.includes("training-overflow")||alertIds.includes("training-capacity"));
  assert.ok(!alertIds.includes("training-owed"));
  c.logs=[{id:"unverified-1",matchStatus:"review"}];
  assert.ok(app.launcherAlertsV11(c).items.some(x=>x.id==="pending-payments"));
});
