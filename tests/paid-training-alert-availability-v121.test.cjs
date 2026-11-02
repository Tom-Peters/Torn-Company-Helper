"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const source=fs.readFileSync(path.join(__dirname,"../Torn-Company-Helper.user.js"),"utf8");
const marker='  const style=document.createElement("style");';
function api(){
 const element=()=>({style:{},dataset:{},hidden:false,addEventListener(){},appendChild(){},offsetWidth:120,offsetHeight:50,getBoundingClientRect(){return {left:5,top:5,width:120,height:50};},setPointerCapture(){}});
 const document={getElementById(){return null;},createElement:element,documentElement:{appendChild(){}},body:{appendChild(){}}};
 const window={location:{pathname:"/companies.php"},innerWidth:400,innerHeight:800,addEventListener(){}};window.top=window;window.self=window;
 const code=source.replace(marker,'  globalThis.__training={trainPlanV3,launcherAlertsV11,companyHubActions,companyActionList,directorBriefV110};\n'+marker);
 const context={window,document,URL,URLSearchParams,Date,Math,JSON,Number,Set,Map,Blob,console,PDA_storage:{get:async()=>null}};
 vm.runInNewContext(code,context,{timeout:1800});return context.__training;
}
function company(trains){
 return {profile:{id:7,type:{id:7,name:"Fitness Center"},name:"Example",rating:3,trains,income:{daily:150000},advertisement_budget:10000},
 staff:[{id:5,name:"Employee",wage:10000,days_in_company:8,position:{name:"Employee"},stats:{endurance:1000}}],
 stock:[],roles:[],snapshots:[],payments:[{id:"paid1",playerId:5,trains:5,ts:100,confirmed:true}],training:[],news:[],logs:[],archived:[],lossLimit:500000,lastRefresh:new Date().toISOString()};
}
test("No available trains means no paid-training alert, action or director task",()=>{
 const a=api(),c=company(0),p=a.trainPlanV3(c);
 assert.equal(p.allocate,0);
 assert.ok(!a.launcherAlertsV11(c).items.some(x=>x.id.startsWith("training-")));
 assert.ok(!a.companyHubActions(c).some(x=>/training-owed|training-overflow|training-capacity|decision-training-queue/.test(x.id)));
 assert.ok(!a.companyActionList(c).some(x=>x.target==="training-queue"));
 assert.ok(!a.directorBriefV110(c).items.some(x=>x.target==="training-queue"));
});
test("Available trains trigger a paid-training alert for only the assignable quantity",()=>{
 const a=api(),c=company(2),p=a.trainPlanV3(c);
 assert.equal(p.allocate,2);
 assert.match(a.launcherAlertsV11(c).items.find(x=>x.id==="training-owed").text,/2 paid train/);
 assert.ok(a.companyHubActions(c).some(x=>x.id==="decision-training-queue"));
});
test("A full bank with no paid commitments is not an outstanding paid-training alert",()=>{
 const a=api(),c=company(19);c.payments=[];
 assert.equal(a.trainPlanV3(c).allocate,0);
 const ids=a.launcherAlertsV11(c).items.map(x=>x.id);
 assert.ok(!ids.includes("training-owed"),"No paid training obligation exists");
 assert.ok(ids.includes("training-overflow"),"Bank-capacity alert remains independent of paid training");
});
