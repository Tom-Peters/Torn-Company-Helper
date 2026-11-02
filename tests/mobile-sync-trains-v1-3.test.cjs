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
  .replace(hook, '  globalThis.__v13={autoCreditPurchasesV13,exactPaidTrainingV13,backfillTrainingReceiptsV13,'+
    'mergeIncomingLogsV13,mergeTrainingNewsV13,supportWageModelV13,compactWagePanelV13,growthMovesV13,'+
    'homeV13,rosterBenchV12,rivalRostersPanelV12,seed(c){companyId=String(c.profile.id);data.byCompany[companyId]=c;}};\n'+hook);
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
 assert.match(app.homeV13(c),/Priority moves/);
 assert.match(app.homeV13(c),/Wage analysis/);
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
 assert.match(source,/\/\/ @version\s+1\.24\.1/);
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
