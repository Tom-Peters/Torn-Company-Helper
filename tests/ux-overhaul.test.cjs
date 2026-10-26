"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const source=fs.readFileSync(path.join(__dirname,"..","Torn-Company-Helper.user.js"),"utf8");
const expose='  const style=document.createElement("style");';
function app(raw) {
  const withBinding=raw.replace(expose, '  globalThis.__uiTest={todayV2,staffV2,trainingV2,growthV2,settingsV2,hasPdaKey,activeApiKey,scenarioModel,fitFor,roleList,employeeDetail,scenarioV2,employeeProgress,growthChecks,growthAdvisorV2,finances};\n'+expose);
  let requestCount=0;
  const node=()=>({style:{},dataset:{},hidden:false,addEventListener(){},appendChild(){},offsetWidth:140,offsetHeight:44,setPointerCapture(){},getBoundingClientRect(){return {left:3,top:4,width:140,height:44};}});
  const document={getElementById(){return null;},createElement:node,documentElement:{appendChild(){}},body:{appendChild(){}}};
  const window={location:{pathname:"/companies.php"},innerWidth:390,innerHeight:840,addEventListener(){}};window.top=window;window.self=window;
  const sandbox={document,window,PDA_storage:{get:async()=>null},PDA_httpGet(){requestCount++;throw Error("No API calls expected");},
    URLSearchParams,console,Date,Number,Math,JSON,Set,Map,Blob,URL,setTimeout};
  vm.runInNewContext(withBinding,sandbox,{timeout:1000});
  return {ui:sandbox.__uiTest,requests:()=>requestCount};
}
const data={
 profile:{id:7,name:"Example Fitness Center",rating:3,trains:5,employees:{capacity:14},
   income:{daily:1500000,weekly:9000000},advertisement_budget:600000},
 staff:[{id:111,name:"SampleEmployee",position:{name:"Receptionist"},wage:700000,
  stats:{manual_labor:32000,intelligence:48000,endurance:40000},effectiveness:{total:100},days_in_company:9}],
 archived:[],roles:[],payments:[{id:"manual1",playerId:111,amount:1000000,trains:5,confirmed:true,ts:100}],
 training:[{id:"given1",playerId:111,units:3,ts:200}],logs:[],news:[],
 snapshots:[],stock:[],whatIf:{},lossLimit:500000
};
test("Raw public script does not embed a real API key",()=>{
 assert.equal(source.includes('"###PDA-APIKEY###"'),true);
 assert.doesNotMatch(source,/Authorization:\s*["']ApiKey\s+[A-Za-z0-9]{16}/);
});
test("Torn PDA runtime substitution automatically supplies key without manual entry",()=>{
 const token="A".repeat(16);
 const v=app(source.replace('const PDA_APP_KEY = "###PDA-APIKEY###";','const PDA_APP_KEY = "'+token+'";'));
 assert.equal(v.ui.hasPdaKey(),true);
 assert.equal(v.ui.activeApiKey(),token);
 assert.equal(v.requests(),0);
});
test("Unsubstituted local source requires explicit setup and does not call Torn",()=>{
 const v=app(source);
 assert.equal(v.ui.hasPdaKey(),false);
 assert.equal(v.ui.activeApiKey(),"");
 assert.equal(v.requests(),0);
});
test("Mobile UI contains four action-first sections and compact status cards",()=>{
 const v=app(source);
 const today=v.ui.todayV2(data);
 assert.match(today,/Your next decisions/);
 assert.match(today,/Quick actions/);
 assert.match(today,/Outstanding trains/);
 assert.match(source,/data-tab="training"/);
 assert.match(source,/data-tab="employees"/);
 assert.match(source,/data-tab="growth"/);
 assert.match(source,/class="tch-bottom"/);
});
test("Staff roster and optimisation UI render without Torn writes",()=>{
 const v=app(source);
 const html=v.ui.staffV2(data);
 assert.match(html,/Staff optimiser/);
 assert.match(html,/SampleEmployee/);
 assert.match(html,/Current role fit/);
 assert.match(html,/data-act="employee-detail"/);
 assert.equal(v.requests(),0);
});
test("Training prioritises accounts and hides old manual records by default",()=>{
 const v=app(source);
 const html=v.ui.trainingV2(data);
 assert.match(html,/Oldest commitments first/);
 assert.match(html,/Record a completed train/);
 assert.match(html,/training-view/);
 assert.equal(v.requests(),0);
});
test("Settings reveals native PDA key state and offers a private override",()=>{
 const v=app(source);
 const html=v.ui.settingsV2(data);
 assert.match(html,/Torn PDA API/);
 assert.match(html,/Optional session-only key override/);
 assert.match(html,/Appearance/);
 assert.match(html,/Return to PDA key/);
});
test("Visual light mode and no gameplay HTTP methods",()=>{
 assert.match(source,/theme-light/);
 assert.doesNotMatch(source,/PDA_http(?:Post|Put|Patch|Delete)\s*\(/);
 assert.match(source,/\/\/ @author\s+IamEEKY/);
});

test("Every Today KPI tile navigates to a meaningful detail screen",()=>{
 const {ui}=app(source);
 const html=ui.todayV2(data);
 for(const target of ["growth-accounts","training-queue","staff"])assert.match(html,new RegExp('data-target="'+target+'"'));
 assert.match(html,/data-target="growth-performance"/);
});
test("Current-role fit is visible independently of Torn effectiveness",()=>{
 const {ui}=app(source);
 const c=JSON.parse(JSON.stringify(data));
 c.profile.type={id:1,name:"Fitness Center"};
 c.roles=[{name:"Receptionist",requirements:{endurance:40000,intelligence:30000}}];
 const html=ui.staffV2(c);
 assert.match(html,/Current role fit/);
 assert.match(html,/100\.0%/);
 assert.match(html,/Torn EFF/);
});
test("Team what-if returns explicit changed roles and score delta",()=>{
 const {ui}=app(source);
 const c=JSON.parse(JSON.stringify(data));
 c.profile.type={id:1,name:"Fitness Center"};
 c.roles=[{name:"Receptionist",requirements:{endurance:40000,intelligence:30000}},
          {name:"Cleaner",requirements:{manual_labor:100000,endurance:15000}},
          {name:"Manager",requirements:{intelligence:100000,endurance:100000}}];
 const current=ui.scenarioModel(c);
 assert.equal(current.changeCount,0);
 assert.equal(current.averageDelta,0);
 c.whatIf={111:"Cleaner"};
 const changed=ui.scenarioModel(c);
 assert.equal(changed.changeCount,1);
 assert.ok(changed.averageAfter<changed.averageBefore);
 assert.ok(changed.averageDelta<0);
 assert.equal(changed.changed[0].proposed,"Cleaner");
 assert.match(ui.scenarioV2(c),/Team simulation/);
 assert.match(ui.scenarioV2(c),/Restore actual positions/);
});
test("Employee detail includes requirement progress and personal training status",()=>{
 const {ui}=app(source);
 const c=JSON.parse(JSON.stringify(data));
 c.profile.type={id:1,name:"Fitness Center"};
 c.roles=[{name:"Receptionist",requirements:{endurance:40000,intelligence:30000}},{name:"Cleaner",requirements:{manual_labor:100000}}];
 const detail=ui.employeeDetail(c,111);
 assert.match(detail,/Current role fit/);
 assert.match(detail,/Confirmed trains owed/);
 assert.match(detail,/Requirements for Receptionist/);
 assert.match(detail,/Top matching roles/);
 assert.match(detail,/Intelligence/);
});

test("Growth diagnostics identify staffing gaps and link to explanations",()=>{
 const {ui}=app(source),c=JSON.parse(JSON.stringify(data));
 c.profile.type={id:1,name:"Fitness Center"};
 c.roles=[{name:"Manager",requirements:{endurance:60000,intelligence:30000}},
          {name:"Receptionist",requirements:{endurance:10000,intelligence:5000}}];
 c.profile.employees.capacity=3;
 const recommendations=ui.growthChecks(c);
 assert.ok(recommendations.some(x=>x.title.includes("vacant staff position")));
 assert.ok(recommendations.some(x=>x.title.includes("Special-role")));
 assert.match(ui.growthAdvisorV2(c),/data-target="staff-sim"/);
 assert.match(ui.growthAdvisorV2(c),/Advert ceiling/);
});
test("History progress uses real observed working stat deltas without inventing earlier data",()=>{
 const {ui}=app(source),c=JSON.parse(JSON.stringify(data));
 const noHistory=ui.employeeProgress(c,111);
 assert.equal(noHistory.count,0);
 c.snapshots=[
  {observedAt:"2026-10-20T20:00:00Z",roster:{"111":{stats:{manual_labor:1000,intelligence:2000,endurance:3000},effectiveness:72}}},
  {observedAt:"2026-10-26T20:00:00Z",roster:{"111":{stats:{manual_labor:1250,intelligence:2500,endurance:3200},effectiveness:81}}}
 ];
 const result=ui.employeeProgress(c,111);
 assert.equal(result.stats.manual_labor,250);
 assert.equal(result.stats.intelligence,500);
 assert.equal(result.stats.endurance,200);
 assert.equal(result.effectiveness,9);
 assert.match(ui.employeeDetail(c,111),/Working-stat progress/);
});
test("Conservative role advice leaves last special-role employee in place",()=>{
 const {ui}=app(source),c=JSON.parse(JSON.stringify(data));
 c.profile.type={id:1,name:"Fitness Center"};
 c.staff[0].position.name="Manager";
 c.roles=[{name:"Manager",requirements:{endurance:62000,intelligence:31000}},
          {name:"Receptionist",requirements:{endurance:10000,intelligence:5000}}];
 const sim=ui.scenarioModel(c);
 assert.equal(sim.proposed.Manager,1);
 assert.equal(sim.changeCount,0);
});

test("Clicking financial tiles exposes an explanatory breakdown rather than dead cards",()=>{
 const {ui}=app(source);
 const html=ui.finances(data);
 assert.match(html,/data-act="finance-focus"/);
 assert.match(html,/data-field="revenue"/);
 assert.match(html,/data-field="wages"/);
 assert.match(html,/data-field="ad"/);
 assert.match(html,/data-field="profit"/);
 assert.match(html,/Current recorded value/);
});
test("Training queue item is a real clickable employee detail link",()=>{
 const {ui}=app(source);
 const html=ui.trainingV2(data);
 assert.match(html,/class="tch-queueitem tch-taprow"/);
 assert.match(html,/data-act="employee-detail"/);
});
test("Drilldowns and team simulator do not introduce Torn gameplay actions",()=>{
 const {ui,requests}=app(source);
 ui.todayV2(data);ui.staffV2(data);ui.trainingV2(data);ui.growthV2(data);ui.finances(data);
 assert.equal(requests(),0);
 assert.doesNotMatch(source,/PDA_http(?:Post|Put|Patch|Delete)\s*\(/);
});
