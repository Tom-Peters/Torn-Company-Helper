"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const source=fs.readFileSync(path.join(__dirname,"..","Torn-Company-Helper.user.js"),"utf8");
const marker='  const style=document.createElement("style");';
const instrumented=source.replace(marker,'  globalThis.__integrity={financialAmount,accounting,parseIncomingLog,applyMatchedPayments,migrateAutoPaymentClaims,uniquePaymentEvents,pendingPaymentLogs,isApprovedLog,aggregates,companyDataQuality,companyActionList,actionPanelV3,trainingV2,todayV2};\n'+marker);
const mock=()=>({style:{},dataset:{},hidden:false,appendChild(){},addEventListener(){},setPointerCapture(){},getBoundingClientRect(){return {left:5,top:5,width:140,height:45};},offsetWidth:140,offsetHeight:45});
const document={getElementById(){return null;},createElement:mock,documentElement:{appendChild(){}},body:{appendChild(){}}};
const window={location:{pathname:"/companies.php"},innerWidth:400,innerHeight:800,addEventListener(){}};window.top=window;window.self=window;
const scope={window,document,PDA_storage:{get:async()=>null},PDA_httpGet(){throw Error("Unexpected live request")},URLSearchParams,console,Date,JSON,Math,Number,Set,Map};
vm.runInNewContext(instrumented,scope,{timeout:1500});
const m=scope.__integrity;
const moneyLog=(id,amount=1000000)=>({id,timestamp:1600000000,title:"Money received",suggestion:{status:"matched",playerId:11,senderId:11,amount,trains:amount===1000000?5:1}});
function company(){
 return {profile:{id:99,name:"Example Fitness",rating:3,employees:{hired:1,capacity:15},
   income:{daily:2000000},advertisement_budget:500000,trains:4},
   staff:[{id:11,name:"ExampleEmployee",wage:900000,days_in_company:10,position:{name:"Receptionist"},stats:{manual_labor:20000,intelligence:30000,endurance:40000}}],
   archived:[],payments:[],training:[],logs:[],news:[],stock:[],roles:[],snapshots:[],
   whatIf:{},lossLimit:500000,lastRefresh:new Date().toISOString()};
}
test("Receipt amount and sender are a candidate, not evidence of a purchase",()=>{
 const c=company();c.logs=[moneyLog("x")];
 const result=m.applyMatchedPayments(c);
 assert.equal(result.suggested,1);
 assert.equal(c.payments.length,0);
 assert.equal(c.logs[0].matchStatus,"review");
 assert.equal(m.pendingPaymentLogs(c).length,1);
 assert.equal(Object.keys(m.aggregates(c).balance).length,0);
});
test("Repeated classification of the same log does not create any purchases",()=>{
 const c=company();c.logs=[moneyLog("x")];
 m.applyMatchedPayments(c);m.applyMatchedPayments(c);
 assert.equal(c.payments.length,0);
 assert.equal(m.pendingPaymentLogs(c).length,1);
});
test("Explicitly confirmed log purchase counts once despite repeated entries",()=>{
 const c=company();c.logs=[moneyLog("x")];
 const payment={id:"approved",source:"log-confirmed",sourceId:"log:x",confirmed:true,playerId:11,trains:5,amount:1000000,ts:1600000000};
 c.payments=[payment,{...payment,id:"dup"}];
 assert.equal(m.isApprovedLog(c,"x"),true);
 assert.equal(m.pendingPaymentLogs(c).length,0);
 assert.equal(m.aggregates(c).balance["11"].purchased,5);
});
test("Legacy auto credited transfers do not affect balances even before migration",()=>{
 const c=company();c.logs=[moneyLog("x")];
 c.payments=[{id:"log:auto:x",source:"log-auto",sourceId:"log:x",confirmed:true,playerId:11,amount:1000000,trains:5}];
 assert.equal(Object.keys(m.aggregates(c).balance).length,0);
 assert.equal(m.isApprovedLog(c,"x"),false);
});
test("Migration retains legacy payment evidence but makes it reviewable",()=>{
 const c=company();c.logs=[{id:"x",timestamp:1600000000,title:"Money received"}];
 c.payments=[{id:"log:auto:x",source:"log-auto",sourceId:"log:x",confirmed:true,playerId:11,amount:1000000,trains:5}];
 assert.equal(m.migrateAutoPaymentClaims(c),1);
 assert.equal(c.payments.length,1);
 assert.equal(c.payments[0].confirmed,false);
 assert.equal(c.payments[0].reviewRequired,true);
 assert.equal(c.logs[0].suggestion.playerId,11);
 assert.equal(c.logs[0].matchStatus,"review");
 assert.equal(m.pendingPaymentLogs(c).length,1);
 assert.equal(m.migrateAutoPaymentClaims(c),0);
});
test("Ignored irrelevant receipts disappear from the review queue",()=>{
 const c=company();c.logs=[moneyLog("one"),moneyLog("two")];
 c.logs[1].matchStatus="ignored";
 assert.equal(m.pendingPaymentLogs(c).length,1);
});
test("A manual training purchase remains in the ledger",()=>{
 const c=company();c.payments=[{id:"manual",source:"manual",confirmed:true,playerId:11,amount:250000,trains:1,ts:1600000000}];
 assert.equal(m.aggregates(c).balance["11"].purchased,1);
});
test("Missing income cannot be interpreted as zero",()=>{
 const c=company();delete c.profile.income;
 const a=m.accounting(c);
 assert.equal(a.revenue,null);assert.equal(a.profit,null);assert.equal(a.headroom,null);
 assert.equal(a.known,false);assert.ok(a.missing.includes("reported daily income"));
});
test("Missing wages and partial roster are both incomplete",()=>{
 const c=company();delete c.staff[0].wage;
 assert.equal(m.accounting(c).known,false);
 assert.equal(m.accounting(c).wages,null);
 c.staff[0].wage=900000;c.profile.employees.hired=2;
 assert.equal(m.accounting(c).wages,null);
 assert.ok(m.accounting(c).missing.includes("complete employee roster"));
});
test("Missing advertising budget blocks profit and loss-limit recommendations",()=>{
 const c=company();delete c.profile.advertisement_budget;
 const a=m.accounting(c);
 assert.equal(a.ad,null);assert.equal(a.profit,null);assert.equal(a.known,false);
 assert.ok(m.companyActionList(c).some(x=>x.title.includes("financial inputs")));
 assert.ok(m.companyDataQuality(c).results.some(x=>x.label==="Financial inputs"&&x.state==="incomplete"));
});
test("Zero is a valid complete value, and numerical strings are supported",()=>{
 const c=company();c.profile.income.daily="0";c.profile.advertisement_budget=0;c.staff[0].wage=0;
 const a=m.accounting(c);
 assert.equal(a.known,true);assert.equal(a.revenue,0);assert.equal(a.wages,0);assert.equal(a.ad,0);assert.equal(a.profit,0);
});
test("Valid operating result honours 500k loss guardrail",()=>{
 const c=company();const a=m.accounting(c);
 assert.equal(a.known,true);assert.equal(a.profit,600000);assert.equal(a.headroom,1100000);
 c.profile.income.daily=100000;
 assert.ok(m.companyActionList(c).some(x=>x.title==="Check operating losses"));
});
test("Daily action list routes pending receipt reviews to a usable screen",()=>{
 const c=company();c.logs=[moneyLog("one")];
 const item=m.companyActionList(c).find(x=>x.target==="training-payments");
 assert.ok(item);assert.match(item.why,/does not prove a training purchase/);
 const ui=m.todayV2(c);
 assert.match(ui,/Your next decisions/);assert.match(ui,/Data confidence/);
 assert.match(ui,/training-payments/);
});
test("Stale company snapshot is explicitly flagged",()=>{
 const c=company();c.lastRefresh="2024-01-01T00:00:00.000Z";
 const checks=m.companyDataQuality(c);
 assert.ok(checks.results.some(x=>x.label==="Data freshness"&&x.state==="stale"));
 assert.ok(m.companyActionList(c).some(x=>x.target==="refresh"));
});
test("Payment review interface lets users confirm purpose explicitly",()=>{
 const c=company();c.logs=[moneyLog("x")];
 const ui=m.trainingV2(c); // queue tab selected; payment layout is a reachable section
 assert.match(ui,/Training ledger/);
 assert.match(source,/Confirm training purchase/);
 assert.match(source,/data-act="ignore-log"/);
 assert.match(source,/data-act="more-payments"/);
});
test("There are no new automatic reads or gameplay writes",()=>{
 assert.match(source,/\/\/ @version\s+0\.9\.1/);
 assert.doesNotMatch(source,/PDA_http(?:Post|Put|Patch|Delete)\s*\(/);
 assert.match(source,/\/\/ @author\s+IamEEKY/);
});
