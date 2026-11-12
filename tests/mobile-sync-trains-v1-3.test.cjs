"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),
 fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const source=fs.readFileSync(path.join(__dirname,"..","Torn-Company-Helper.user.js"),"utf8");
const now=()=>Math.floor(Date.now()/1000);
function company(){
 return {profile:{id:7,name:"Test Fitness",type:{id:29,name:"Fitness Center"},rating:4,
  trains:17,efficiency:88,environment:98,popularity:83,
  income:{daily:250000,weekly:1500000},employees:{capacity:3,hired:3},advertisement_budget:50000},
  staff:[
   {id:11,name:"Alice",position:{name:"Fitness Instructor"},days_in_company:90,wage:100000,value:500000,
    effectiveness:{total:75,addiction:-12,inactivity:0},stats:{manual_labor:10000,intelligence:15000,endurance:20000}},
   {id:12,name:"Bob",position:{name:"Manager"},days_in_company:35,wage:250000,value:0,
    effectiveness:{total:100,addiction:0,inactivity:0},stats:{manual_labor:25000,intelligence:40000,endurance:55000}},
   {id:13,name:"Claire",position:{name:"Cleaner"},days_in_company:12,wage:110000,value:null,
    effectiveness:{total:85,addiction:0,inactivity:0},stats:{manual_labor:10000,intelligence:11000,endurance:30000}}],
  roles:[],stock:[],snapshots:[],archived:[],payments:[],training:[],news:[],logs:[],
  logTypes:"77",incomingTypesVerified:true,whatIf:{},lossLimit:500000,autoCreditSince:now()-60};
}
function fixture(responses){
 const elements=new Map(),calls=[];
 const node=()=>({id:"",style:{},dataset:{},hidden:false,innerHTML:"",listeners:{},
  appendChild(){},addEventListener(k,fn){this.listeners[k]=fn;},setAttribute(){},setPointerCapture(){},
  getBoundingClientRect(){return {left:8,top:8,width:140,height:44};},offsetWidth:140,offsetHeight:44});
 const document={getElementById(x){return elements.get(x)||null;},createElement:node,
  body:{appendChild(e){elements.set(e.id,e);}},documentElement:{appendChild(e){elements.set(e.id,e);}}};
 const window={location:{pathname:"/companies.php"},innerWidth:390,innerHeight:790,confirm(){return true;},addEventListener(){}};
 window.top=window;window.self=window;
 const hook='  const style=document.createElement("style");';
 const script=source.replace('const PDA_APP_KEY = "###PDA-APIKEY###";','const PDA_APP_KEY = "AAAAAAAAAAAAAAAA";')
  .replace(hook, '  globalThis.__v13={reconcileRosterV135,aggregates,matchTrainingNews,reconcileTraining,trainPlanV3,autoCreditPurchasesV13,exactPaidTrainingV13,backfillTrainingReceiptsV13,'+
    'mergeIncomingLogsV13,mergeTrainingNewsV13,supportWageModelV13,compactWagePanelV13,growthMovesV13,'+
    'homeV13,trainingDeskV127,nativeCompanyDeskHTMLV127,trainingSpotlightV127,rosterBenchV12,rivalRostersPanelV12,seed(c){companyId=String(c.profile.id);data.byCompany[companyId]=c;}};\n'+hook);
 const sandbox={window,document,URL,URLSearchParams,Date,Math,Number,JSON,Set,Map,Blob,console,
   PDA_storage:{get:async()=>null,set:async()=>true},
   PDA_httpGet:async(url)=>{calls.push(url);return {status:200,responseText:JSON.stringify(responses?responses(url):{})};}};
 vm.runInNewContext(script,sandbox,{timeout:1800});
 return {app:sandbox.__v13,calls,elements};
}
function log(id,player,amount,time=now()){
 return {id:String(id),timestamp:time,details:{title:"Money received"},
  data:{sender_id:player,amount:amount}};
}
test("New exact employee package transfers automatically increase local purchased train balance",()=>{
 const {app}=fixture(),c=company();app.seed(c);
 let first=app.mergeIncomingLogsV13(c,{log:[log(91,11,250000)]});
 assert.equal(first.credited,1);assert.equal(first.trains,1);
 assert.equal(c.payments.length,1);
 assert.equal(c.payments[0].source,"log-package-auto");
 assert.equal(c.payments[0].trains,1);
 assert.equal(c.payments[0].confirmed,true);
 assert.equal(c.payments[0].assumed,true);
 assert.equal(app.mergeIncomingLogsV13(c,{log:[log(91,11,250000)]}).credited,0);
 assert.equal(c.payments.length,1);
});
test("Multi-train $1m package credits five, but archived and nonstandard payers require review",()=>{
 const {app}=fixture(),c=company();app.seed(c);
 const n=app.mergeIncomingLogsV13(c,{log:[log(92,11,1000000),log(93,55,250000),log(94,12,500000),log(95,12,120000)]});
 assert.equal(n.credited,2); // $500k is a valid two-train package
 assert.equal(n.trains,7);
 assert.equal(c.payments.length,2);
 assert.equal(c.logs.find(x=>x.id==="93").matchStatus,"review");
 assert.equal(c.logs.find(x=>x.id==="95").matchStatus,"review");
});
test("Older receipts are not silently reclassified; explicit backfill skips preexisting matching manual payment",()=>{
 const {app}=fixture(),c=company();app.seed(c);
 const old=now()-90000;c.payments.push({id:"manual-1",playerId:11,amount:250000,trains:1,ts:old,confirmed:true});
 const incoming={log:[log(201,11,250000,old),log(202,12,1000000,old)]};
 const n=app.mergeIncomingLogsV13(c,incoming);
 assert.equal(n.credited,0);
 const back=app.backfillTrainingReceiptsV13(c);
 assert.equal(back.credited,1);
 assert.equal(back.skipped,1);
 assert.equal(c.payments.length,2);
 assert.equal(c.payments[1].source,"log-package-backfill");
});
test("Voiding an automatically credited receipt blocks its reappearance",()=>{
 const {app}=fixture(),c=company();app.seed(c);
 app.mergeIncomingLogsV13(c,{log:[log(301,11,250000)]});
 c.payments[0].voided=true;
 assert.equal(app.mergeIncomingLogsV13(c,{log:[log(301,11,250000)]}).credited,0);
 assert.equal(app.backfillTrainingReceiptsV13(c).credited,0);
 assert.equal(c.payments.length,1);
});
test("Training-news reconciliation is automatic and duplicate source IDs cannot double-debit",()=>{
 const {app}=fixture(),c=company();app.seed(c);
 const event={id:"n100",timestamp:now(),text:"Director trained Alice"};
 const first=app.mergeTrainingNewsV13(c,{news:[event]});
 assert.equal(first.added,1);assert.equal(first.matched,1);
 assert.equal(c.training.length,1);
 const second=app.mergeTrainingNewsV13(c,{news:[event]});
 assert.equal(second.added,0);assert.equal(second.matched,0);
 assert.equal(c.training.length,1);
});
test("No receipt is credited when the sender is ambiguous or the amount does not fit training prices",()=>{
 const {app}=fixture(),c=company();app.seed(c);
 const x=log(888,11,250000);x.data={amount:250000};
 const out=app.mergeIncomingLogsV13(c,{log:[x,log(889,11,300000)]});
 assert.equal(out.credited,0);assert.equal(c.payments.length,0);
});
test("Zero and missing support value show labelled numeric peer-wage proxy rather than fake sales contribution",()=>{
 const {app}=fixture(),c=company(),w=app.supportWageModelV13(c);
 assert.equal(w.length,3);
 assert.ok(w[1].estimate>0);
 assert.ok(w[2].estimate>0);
 assert.equal(w[1].value,0);
 assert.equal(w[2].value,null);
 const html=app.compactWagePanelV13(c);
 assert.match(html,/Support proxy/);
 assert.match(html,/Bob/);
 assert.match(html,/Claire/);
});
test("Priority star growth names weak employee and specific train overflow risk",()=>{
 const {app}=fixture(),c=company(),moves=app.growthMovesV13(c);
 assert.ok(moves.some(x=>/Alice/.test(x.detail)));
 assert.ok(moves.some(x=>/training|train/i.test(x.title)));
 assert.match(app.homeV13(c),/DO THIS NEXT/);
 assert.match(app.homeV13(c),/Payroll review/);
 assert.match(app.homeV13(c),/Next in the training queue/);
});
test("Competitor positions are normalised for own roster size, not blindly copied from large peers",()=>{
 const {app}=fixture(),c=company();
 c.rivalTeams={rows:[{name:"Similar",rating:5,weekly:1234567,total:10,counts:{"Manager":2,"Cleaner":1,"Fitness Instructor":7}}]};
 const m=app.rosterBenchV12(c);
 assert.equal(m.tier,5);
 const manager=m.counts.find(x=>x.role==="Manager");
 assert.ok(Math.abs(manager.expected-0.6)<.001);
 assert.match(app.rivalRostersPanelV12(c),/Peer staffing fit/);
});
test("Clicking floating launcher triggers API refresh and reads recent news and transfers",async()=>{
 const c=company(),arrivals=log(991,11,250000);
 const {calls,elements}=fixture(url=>{
  if(url.includes("company/profile"))return {profile:c.profile};
  if(url.includes("company/employees"))return {employees:c.staff};
  if(url.includes("company/stock"))return {stock:[]};
  if(url.includes("company/applications"))return {applications:[]};
  if(url.includes("company/news"))return {news:[]};
  if(url.includes("user/log"))return {log:[arrivals]};
  if(url.includes("torn/logtypes"))return {logtypes:[{id:77,title:"Money received"}]};
  return {companies:[]};
 });
 const opener=elements.get("tch-open");opener.listeners.click({preventDefault(){}});
 await new Promise(resolve=>setTimeout(resolve,60));
 assert.ok(calls.some(u=>u.includes("company/profile")));
 assert.ok(calls.some(u=>u.includes("company/employees")));
 assert.ok(calls.some(u=>u.includes("company/news")));
 assert.ok(calls.some(u=>u.includes("user/log")));
 assert.equal(elements.get("tch-root").hidden,false);
 assert.doesNotMatch(elements.get("tch-root").innerHTML,/Dashboard could not render/);
});
test("Compact mobile navigation has constrained height and five concise destinations",()=>{
 assert.match(source,/#tch-root \.tch-bottom button\{min-height:38px;height:38px/);
 assert.match(source,/function tabsV2/);
 assert.match(source,/\/\/ @version\s+1\.35\.0/);
 assert.doesNotMatch(source,/[\u2018\u2019]/);
 assert.doesNotMatch(source,/PDA_http(?:Post|Put|Patch|Delete)\s*\(/);
});

test("New receipt never double-credits a manually entered matching purchase",()=>{
 const {app}=fixture(),c=company();app.seed(c);
 c.payments.push({id:"manual-1",source:"manual",playerId:11,amount:250000,
   trains:1,ts:now(),confirmed:true});
 const out=app.mergeIncomingLogsV13(c,{log:[log(9001,11,250000)]});
 assert.equal(out.credited,0);
 assert.equal(c.payments.length,1);
 assert.match(c.logs[0].matchReason,/duplicate/i);
});
test("Torn news near a manually recorded train attaches to existing row and does not double-count",()=>{
 const {app}=fixture(),c=company();app.seed(c);
 c.training.push({id:"manual-training-1",source:"manual",playerId:11,units:1,ts:now(),confirmed:true});
 const out=app.mergeTrainingNewsV13(c,{news:[{id:"n-manual",timestamp:now(),text:"Director trained Alice"}]});
 assert.equal(out.matched,1);
 assert.equal(c.training.length,1);
 assert.equal(c.training[0].sourceId,"news:n-manual");
 assert.equal(c.news[0].matchStatus,"matched-manual");
});

test("Native company desk shows each recorded obligation without opening the helper",()=>{
 const {app}=fixture(),c=company();c.lastRefresh=new Date().toISOString();
 c.profile.trains=4;
 c.staff[1].days_in_company=1;
 c.payments=[
  {id:"p1",playerId:11,trains:5,confirmed:true,ts:now()-4000},
  {id:"p2",playerId:12,trains:2,confirmed:true,ts:now()-3000},
  {id:"p3",playerId:99,trains:3,confirmed:true,ts:now()-2000}
 ];
 c.training=[{id:"t1",playerId:11,units:2,ts:now()-1000}];
 c.logs=[{id:"unknown",matchStatus:"review"}];
 const d=app.trainingDeskV127(c);
 assert.equal(d.owed,8);assert.equal(d.ready,3);assert.equal(d.pending,1);
 assert.equal(d.rows.find(x=>x.id==="12").give,0);
 assert.match(d.rows.find(x=>x.id==="12").status,/72h/);
 assert.match(d.rows.find(x=>x.id==="99").status,/Former/);
 const html=app.nativeCompanyDeskHTMLV127(c);
 assert.match(html,/CompanyStaxx \/ Director/);
 assert.match(html,/data-tch-act="refresh"/);
 assert.match(html,/data-tch-act="employee"/);
 assert.match(html,/data-tch-act="payments"/);
 assert.match(html,/3<\/b> ready now/);
});
test("Stale data cannot claim a train is ready, but never hides owed balances",()=>{
 const {app}=fixture(),c=company();
 c.profile.trains=8;c.lastRefresh=new Date(Date.now()-2*86400000).toISOString();
 c.payments=[{id:"confirmed",playerId:11,trains:5,ts:now(),confirmed:true}];
 const d=app.trainingDeskV127(c);
 assert.equal(d.ready,0);assert.equal(d.owed,5);assert.equal(d.fresh,false);
 assert.match(app.nativeCompanyDeskHTMLV127(c),/refresh needed/);
});
test("Employee names are escaped on the live company-page training panel",()=>{
 const {app}=fixture(),c=company();
 c.lastRefresh=new Date().toISOString();
 c.staff[0].name='<img src=x onerror=alert(1)>';
 c.payments=[{id:"p1",playerId:11,trains:1,ts:now(),confirmed:true}];
 const html=app.nativeCompanyDeskHTMLV127(c);
 assert.match(html,/&lt;img/);
 assert.doesNotMatch(html,/<img/);
});

test("Departures archive without previousStaff and returning IDs regain balances without duplicate credits",()=>{
 const {app}=fixture(),c=company();
 const original=c.staff.map(p=>({...p}));
 c.payments=[{id:"paid",playerId:11,trains:5,amount:1000000,ts:100,confirmed:true}];
 c.training=[{id:"delivered",playerId:11,units:2,ts:200}];
 const out=app.reconcileRosterV135(c,{employees:{hired:2}},original.slice(1));
 assert.equal(out.departed,1);assert.equal(c.archived[0].id,11);
 assert.equal(app.aggregates(c).balance[11].owed,3);
 const back={...original[0],name:"Renamed Alice",days_in_company:1};
 const returned=app.reconcileRosterV135(c,{employees:{hired:3}},[back,...original.slice(1)]);
 assert.equal(returned.returned,1);assert.equal(c.archived.length,0);
 assert.equal(app.aggregates(c).balance[11].owed,3);assert.equal(c.payments.length,1);
 assert.equal(app.trainPlanV3(c).queue.some(p=>String(p.id)==="11"),false);
 c.staff[0].days_in_company=3;
 assert.equal(app.trainPlanV3(c).queue[0].give,3);
 assert.equal(app.matchTrainingNews({text:"Alice was trained 2 times"},c).playerId,11);
 app.reconcileRosterV135(c,{employees:{hired:3}},c.staff);
 assert.equal(c.archived.length,0);assert.equal(app.aggregates(c).balance[11].owed,3);
});
test("Invalid, duplicate and incomplete employee replies preserve membership and debts",()=>{
 const {app}=fixture(),c=company(),before=JSON.stringify(c);
 for(const response of [undefined,[],[c.staff[0]],[c.staff[0],c.staff[0],c.staff[2]]]){
   assert.throws(()=>app.reconcileRosterV135(c,c.profile,response));
   assert.equal(JSON.stringify(c),before);
 }
 app.reconcileRosterV135(c,{employees:{hired:0}},[]);
 assert.equal(c.staff.length,0);assert.equal(c.archived.length,3);
});
test("Profile identity handles rename and batch count repair without touching manually corrected trains",()=>{
 const {app}=fixture(),c=company();
 c.news=[{id:"batch",timestamp:now(),text:'<a href="/profiles.php?XID=12">Bob</a> trained <a href="/profiles.php?XID=11">Old Alice</a> 5 times'}];
 assert.equal(app.reconcileTraining(c).matched,1);
 assert.equal(c.training[0].playerId,11);assert.equal(c.training[0].units,5);
 c.training[0].units=1;
 assert.equal(app.reconcileTraining(c).corrected,1);assert.equal(c.training[0].units,5);
 assert.equal(app.reconcileTraining(c).corrected,0);
 c.training[0].source="manual";c.training[0].units=2;
 assert.equal(app.reconcileTraining(c).corrected,0);assert.equal(c.training[0].units,2);
 assert.equal(app.matchTrainingNews({text:"Alice was trained 30 times"},c).status,"review");
});
test("An existing unmatched recent transfer is retried after a returning employee is recognised",()=>{
 const {app}=fixture(),c=company(),person=c.staff.shift(),receipt=log(801,11,1000000);
 c.logs=[{id:"801",timestamp:receipt.timestamp,title:"Money received",suggestion:{status:"review"}}];
 c.archived=[person];
 assert.equal(app.mergeIncomingLogsV13(c,{log:[receipt]}).credited,0);
 app.reconcileRosterV135(c,{employees:{hired:3}},[person,...c.staff]);
 assert.equal(app.mergeIncomingLogsV13(c,{log:[receipt]}).credited,1);
 assert.equal(app.mergeIncomingLogsV13(c,{log:[receipt]}).credited,0);
 assert.equal(app.aggregates(c).balance[11].owed,5);
});
