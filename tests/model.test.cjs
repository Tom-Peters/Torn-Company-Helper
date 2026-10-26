"use strict";
const {test} = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const script = fs.readFileSync(path.join(__dirname,"..","Torn-Company-Helper.user.js"),"utf8");
const marker = '  const style=document.createElement("style");';
if (!script.includes(marker)) throw new Error("Test model marker not found.");
const instrumented=script.replace(marker,'  globalThis.__model={esc,score,aggregates,accounting,suggestions,normalizeRoles};\n'+marker);

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
  for(const expression of [/PDA_httpPost\s*\(/,/PDA_httpPut\s*\(/,/PDA_httpPatch\s*\(/,/PDA_httpDelete\s*\(/,/GM_xmlhttpRequest\s*\(/,/setInterval\s*\(/])
    assert.doesNotMatch(script,expression);
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
