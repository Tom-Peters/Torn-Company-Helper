"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const script=fs.readFileSync(path.join(__dirname,"..","Torn-Company-Helper.user.js"),"utf8");
const marker='  const style=document.createElement("style");';
function fixture(){
  const node=()=>({style:{},dataset:{},hidden:false,addEventListener(){},appendChild(){},
    offsetWidth:140,offsetHeight:44,setPointerCapture(){},getBoundingClientRect(){return {left:4,top:4,width:140,height:44};}});
  const document={getElementById(){return null;},createElement:node,documentElement:{appendChild(){}},body:{appendChild(){}}};
  const window={location:{pathname:"/companies.php"},innerWidth:390,innerHeight:840,addEventListener(){}};
  window.top=window;window.self=window;
  let calls=0;
  const code=script.replace(marker,
    '  globalThis.__v1={trainPlanV3,stockAdviceV3,riskRadarV3,balancedAssignmentV3,radarPanelV3,stockV3,balancedPanelV3,applicantPanelV3,trainPacePanelV3,todayV2,staffV2,trainingV2};\n'+marker);
  const context={document,window,URL,URLSearchParams,Date,Math,JSON,Number,Set,Map,Blob,console,
    PDA_storage:{get:async()=>null},PDA_httpGet(){calls++;throw Error("Unexpected API call")}};
  vm.runInNewContext(code,context,{timeout:1500});
  return {app:context.__v1,calls:()=>calls};
}
function example(){
  return {profile:{id:7,name:"Example Fitness",rating:3,trains:19, funds:500,
    type:{id:7,name:"Fitness Center"},income:{daily:1000,weekly:7000},
    employees:{capacity:14,hired:2},advertisement_budget:200,
    popularity:90,efficiency:95,environment:96},
    staff:[
      {id:11,name:"Alpha",days_in_company:9,position:{name:"Receptionist"},wage:100,
        stats:{manual_labor:100000,endurance:25000,intelligence:500},effectiveness:{total:65}},
      {id:22,name:"Beta",days_in_company:9,position:{name:"Fitness Instructor"},wage:100,
        stats:{manual_labor:200,endurance:20000,intelligence:20000},effectiveness:{total:40}}
    ],roles:[
      {name:"Receptionist",requirements:{endurance:10000,intelligence:5000}},
      {name:"Fitness Instructor",requirements:{manual_labor:46500,endurance:23250}}
    ],stock:[{id:1,name:"Protein",in_stock:15,on_order:5,sold_amount:10,cost:100,
      price:1000,rrp:900}],snapshots:[],archived:[],payments:[
      {id:"p1",playerId:11,trains:3,ts:100,confirmed:true}
    ],training:[],logs:[],news:[],whatIf:{},lossLimit:500000,
    applications:[{player:{id:33,name:"Applicant",stats:{manual_labor:50000,endurance:50000,intelligence:50000}},status:"Pending"}]};
}
test("Train planner warns about next-close overflow and prioritises paid queue",()=>{
  const {app,calls}=fixture(),c=example(),plan=app.trainPlanV3(c);
  assert.equal(plan.available,19);
  assert.equal(plan.base,3);
  assert.equal(plan.overflow,2);
  assert.equal(plan.allocate,3);
  assert.equal(plan.queue[0].name,"Alpha");
  assert.equal(calls(),0);
});
test("Stock guide uses quantity, on-order stock, and target days without invented prices",()=>{
  const {app}=fixture(),c=example();
  // A stock-carrying fixture is separate from the stockless Fitness Center.
  c.profile.type={id:6,name:"Stocked Business"};
  let [stock]=app.stockAdviceV3(c);
  assert.equal(stock.days,1.5);
  assert.equal(stock.qty,10);
  assert.equal(stock.cost,1000);
  c.stockDays=5;
  [stock]=app.stockAdviceV3(c);
  assert.equal(stock.qty,30);
  c.snapshots=[
    {observedAt:"2026-10-20T20:00:00Z",stock:[{id:1,sold_amount:6}]},
    {observedAt:"2026-10-21T20:00:00Z",stock:[{id:1,sold_amount:14}]}];
  [stock]=app.stockAdviceV3(c);
  assert.equal(stock.samples,2);
  assert.equal(stock.rate,10);
});
test("Balanced assignment globally improves fit while preserving role coverage and roster",()=>{
  const {app}=fixture(),c=example();
  const before=JSON.stringify(c.staff);
  const plan=app.balancedAssignmentV3(c);
  assert.equal(plan.changes.length,2);
  assert.ok(plan.delta>10);
  assert.equal(plan.changes[0].to,"Fitness Instructor");
  assert.equal(plan.changes[1].to,"Receptionist");
  assert.equal(JSON.stringify(c.staff),before);
});
test("Missing fit data produces no synthetic optimisation outcome",()=>{
  const {app}=fixture(),c=example();
  c.staff[0].stats=null;
  assert.equal(app.balancedAssignmentV3(c).changes.length,0);
});
test("Runway respects funds and excludes unreported stock costs",()=>{
  const {app}=fixture(),risk=app.riskRadarV3(example());
  assert.equal(risk.funds,500);
  assert.equal(risk.fixed,400);
  assert.equal(risk.runway,1.25);
  assert.ok(risk.alerts.some(x=>x.target==="growth-accounts"));
  assert.ok(risk.alerts.some(x=>x.target==="stock" )===false);
});
test("All reworked screens render without API requests or gameplay actions",()=>{
  const {app,calls}=fixture(),c=example();
  assert.match(app.todayV2(c),/Director radar/);
  assert.match(app.staffV2(c),/Staff comparison/);
  assert.match(app.staffV2(c),/Sort employees/);
  assert.match(app.trainingV2(c),/Train capacity & allocation/);
  assert.match(app.stockV3(c),/Service operations/);
  assert.ok(!app.stockAdviceV3(c).length,"Fitness Center must not report phantom products");
  assert.equal(calls(),0);
  assert.doesNotMatch(script,/PDA_http(?:Post|Put|Patch|Delete)\s*\(/);
});
test("Version remains in one userscript URL and private key placeholder remains intact",()=>{
  assert.match(script,/\/\/ @version\s+1\.33\.0/);
  assert.match(script,/https:\/\/raw\.githubusercontent\.com\/Tom-Peters\/Torn-Company-Helper\/main\/Torn-Company-Helper\.user\.js|@namespace\s+https:\/\/github\.com\/Tom-Peters\/Torn-Company-Helper/);
  assert.match(script,/const PDA_APP_KEY = "###PDA-APIKEY###";/);
});
