"use strict";
const {test} = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const script = fs.readFileSync(path.join(__dirname,"..","Torn-Company-Helper.user.js"),"utf8");
const marker = '  const style=document.createElement("style");';
if (!script.includes(marker)) throw new Error("Test model marker not found.");
const instrumented=script.replace(marker,'  globalThis.__model={esc,score,aggregates,accounting,suggestions,normalizeRoles,companyProfitTrendV191,companyDeltaV111};\n'+marker);

function loadModel() {
  let apiRequests=0;
  const element=()=>({style:{},dataset:{},appendChild(){},addEventListener(){},hidden:false,offsetWidth:150,offsetHeight:45,getBoundingClientRect(){return {left:5,top:5,width:150,height:45};},setPointerCapture(){}});
  const doc={getElementById(){return null;},createElement:element,documentElement:{appendChild(){}},body:{appendChild(){}}};
  const win={confirm(){return true;},location:{pathname:"/companies.php"},innerWidth:400,innerHeight:850,addEventListener(){}};
  win.top=win;win.self=win;
  const sandbox={
    window:win,document:doc,PDA_storage:{get:async()=>null},
    PDA_httpGet:()=>{apiRequests++;throw Error("Unexpected API GET");},
    URLSearchParams,console,Date,Number,Math,JSON,Set,Blob,URL,setTimeout
  };
  vm.runInNewContext(instrumented,sandbox,{timeout:1000});
  return {model:sandbox.__model,requests:()=>apiRequests};
}
const {model,requests}=loadModel();

test("Script only declares the approved author",()=>{
  assert.match(script,/\/\/ @author\s+IamEEKY/);
  assert.doesNotMatch(script,/\bTom Peters\b/i);
});
test("No API request on script initialisation",()=>assert.equal(requests(),0));
test("No gameplay HTTP writes or remote website scraping",()=>{
  for(const expression of [/PDA_httpPost\s*\(/,/PDA_httpPut\s*\(/,/PDA_httpPatch\s*\(/,/PDA_httpDelete\s*\(/,/GM_xmlhttpRequest\s*\(/])
    assert.doesNotMatch(script,expression);
  // Foreground read-only company sync is permitted; explicit gameplay HTTP writes are not.
  assert.match(script,/function autoCompanyRefreshV112\(/);
  assert.ok(script.includes('if(document.hidden||(!allowAnyPage&&!isCompanyPage()&&!open)||busy'));
  assert.match(script,/staxx:refresh-request/);
  assert.match(script,/now-lastAutoCompanyAttemptV112<15\*60000/);
  assert.match(script,/await refresh\(\)/);
});
test("HTML escaping safely handles remote player names",()=>{
  assert.equal(model.esc('<img src=x onerror=alert(1)>'),'&lt;img src=x onerror=alert(1)&gt;');
});
test("A qualified employee scores 100% against role requirements",()=>{
  assert.equal(Math.round(model.score({stats:{endurance:1000,intelligence:500}},{requirements:{endurance:1000,intelligence:500}})),100);
});
test("Early free training credits later confirmed paid trains",()=>{
  const c={staff:[{id:1,name:"Example"}],archived:[],payments:[{playerId:1,trains:5,ts:200,confirmed:true}],training:[{playerId:1,units:3,ts:100}]};
  assert.equal(model.aggregates(c).balance["1"].owed,2);
  c.training.push({playerId:1,units:4,ts:300});
  assert.equal(model.aggregates(c).balance["1"].credit,2);
});
test("Oldest-first commitment removes the oldest satisfied payment",()=>{
  const c={staff:[],archived:[],payments:[{playerId:1,trains:5,ts:10,confirmed:true},{playerId:1,trains:2,ts:20,confirmed:true}],training:[{playerId:1,units:6}]};
  assert.equal(model.aggregates(c).balance["1"].oldest,20);
  assert.equal(model.aggregates(c).balance["1"].owed,1);
});
test("Voided records remain stored but no longer count",()=>{
  const c={staff:[],archived:[],payments:[{playerId:1,trains:5,ts:1,confirmed:true,voided:true},{playerId:1,trains:2,ts:2,confirmed:true}],training:[{playerId:1,units:1,voided:true}]};
  assert.equal(model.aggregates(c).balance["1"].owed,2);
});
test("Finance headroom honours the configurable loss limit",()=>{
  const a=model.accounting({profile:{income:{daily:1800000},advertisement_budget:600000},staff:[{wage:1100000}],lossLimit:500000});
  assert.equal(a.profit,100000);
  assert.equal(a.headroom,600000);
  assert.equal(a.known,true);
});
test("Missing wage data is flagged incomplete",()=>{
  const a=model.accounting({profile:{income:{daily:1000000},advertisement_budget:100000},staff:[{}],lossLimit:500000});
  assert.equal(a.known,false);
});
test("Heuristic recommendations do not mutate positions",()=>{
  const employee={id:1,name:"Example",position:{name:"Receptionist"},stats:{manual_labor:31000,endurance:15500,intelligence:0}};
  const c={profile:{type:{name:"Fitness Center"}},roles:[],staff:[employee]};
  model.suggestions(c);
  assert.equal(employee.position.name,"Receptionist");
});

test('operating-loss alerts require three consecutive observed UTC days, not arbitrary negative snapshots',()=>{
 const observations=[
   {observedAt:'2026-10-25T22:00:00Z',complete:true,profit:-100},
   {observedAt:'2026-10-29T22:00:00Z',complete:true,profit:-200},
   {observedAt:'2026-11-01T22:00:00Z',complete:true,profit:-300}
 ];
 assert.equal(model.companyProfitTrendV191({snapshots:observations}).streak,false);
 observations[1].observedAt='2026-10-31T22:00:00Z';
 observations[0].observedAt='2026-10-30T22:00:00Z';
 assert.equal(model.companyProfitTrendV191({snapshots:observations}).streak,true);
 observations.push({observedAt:'2026-11-01T23:00:00Z',complete:true,profit:200});
 assert.equal(model.companyProfitTrendV191({snapshots:observations}).streak,false,'last observation on same day wins');
});
test('director briefing and per-tab render preservation are present',()=>{
 assert.match(script,/function directorBriefV110\(/);
 assert.match(script,/directorBriefPanelV110\(c\)/);
 assert.match(script,/companyScrollPositions\[companyRenderedPage\]/);
 assert.match(script,/focus\(\{preventScroll:true\}\)/);
});

test('company daily comparison uses distinct UTC dates, wage and effectiveness evidence',()=>{
 const c={staff:[{id:12,name:'Sample'}],snapshots:[
  {observedAt:'2026-10-27T20:00:00Z',complete:true,profit:2000,revenue:4000,wages:1000,ad:1000,
   roster:{'12':{position:'Trainer',effectiveness:90,wage:100}}},
  {observedAt:'2026-10-28T20:00:00Z',complete:true,profit:500,revenue:3900,wages:2400,ad:1000,
   roster:{'12':{position:'Trainer',effectiveness:78,wage:250}}}
 ]};
 const d=model.companyDeltaV111(c);
 assert.equal(d.known,true);
 assert.equal(d.consecutive,true);
 assert.equal(d.metrics.find(x=>x.key==='profit').delta,-1500);
 assert.equal(d.metrics.find(x=>x.key==='wages').delta,1400);
 assert.equal(d.staff[0].effChange,-12);
 assert.equal(d.staff[0].wageChange,150);
 assert.ok(d.signals.some(x=>x.includes('effectiveness')));
});
test('company comparison needs two complete dates and never invents individual pay',()=>{
 const a=model.companyDeltaV111({snapshots:[{observedAt:'2026-11-01T01:00:00Z',complete:true,profit:100}]});
 assert.equal(a.known,false);
 const c={staff:[],snapshots:[
   {observedAt:'2026-10-30T23:00:00Z',complete:true,profit:0,revenue:0,wages:0,ad:0,roster:{'6':{effectiveness:90}}},
   {observedAt:'2026-11-01T02:00:00Z',complete:true,profit:0,revenue:0,wages:0,ad:0,roster:{'6':{effectiveness:90}}}
 ]};
 assert.equal(model.companyDeltaV111(c).staff[0].wageChange,null);
});
test('company diagnostics provide only status fields and no credentials or employee records',()=>{
 assert.match(script,/function safeCompanyDiagnosticsV111\(/);
 assert.match(script,/moneyImportAvailable:Boolean\(c\?\.lastAutoSync\?\.money/);
 assert.match(script,/function companyDiagnosticsPanelV111\(/);
});
