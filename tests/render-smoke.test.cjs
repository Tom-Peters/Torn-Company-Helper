"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const script=fs.readFileSync(path.join(__dirname,"..","Torn-Company-Helper.user.js"),"utf8");
const marker='  const style=document.createElement("style");';
assert.ok(script.includes(marker));
function launchFixture(){
 const elements=new Map(),saved=[],requests=[],errors=[];
 const make=()=>({
   id:"",style:{},dataset:{},hidden:false,innerHTML:"",textContent:"",offsetWidth:140,offsetHeight:44,
   listeners:{},appendChild(){},addEventListener(type,fn){this.listeners[type]=fn;},
   setPointerCapture(){},getBoundingClientRect(){return {left:5,top:5,width:140,height:44};}
 });
 const document={
   getElementById(id){return elements.get(id)||null;},
   createElement:make,documentElement:{appendChild(node){elements.set(node.id,node);}},
   body:{appendChild(node){elements.set(node.id,node);}}
 };
 const window={location:{pathname:"/companies.php"},innerWidth:390,innerHeight:800,addEventListener(){}};
 window.top=window;window.self=window;
 const instrumented=script.replace(marker,
   '  globalThis.__renderSmoke={seed(c){companyId=String(c.profile.id);data.byCompany[companyId]=c;},view(id){detailView=id;draw();},tab(id){tab=id;detailView="";draw();},draw};\n'+marker);
 const sandbox={window,document,URL,URLSearchParams,Date,Math,JSON,Number,Set,Map,
   console:{...console,error(...args){errors.push(args);}},
   PDA_httpGet(url){requests.push(url);throw Error("A page render must never call the Torn API");},
   PDA_storage:{get:async()=>null,set:async(_key,value)=>saved.push(value)}
 };
 vm.runInNewContext(instrumented,sandbox,{timeout:1500});
 const opener=elements.get("tch-open"),root=elements.get("tch-root");
 assert.ok(opener);assert.ok(root);
 return {opener,root,model:sandbox.__renderSmoke,requests,saved,errors};
}
function sample(){
 return {profile:{id:10,name:"Example Fitness",rating:3,trains:4,
   employees:{capacity:15,hired:1},income:{daily:1000000},advertisement_budget:200000},
   staff:[{id:11,name:"ExampleEmployee",wage:300000,days_in_company:4,
    position:{name:"Receptionist"},stats:{manual_labor:20000,intelligence:30000,endurance:35000},effectiveness:{total:70}}],
   archived:[],training:[],payments:[],logs:[],news:[],stock:[],roles:[],snapshots:[],
   lossLimit:500000,whatIf:{},lastRefresh:"2026-10-27T05:00:00.000Z"};
}
test("Opening the actual launcher renders Today without a saved company",()=>{
 const t=launchFixture();
 t.opener.listeners.click({preventDefault(){}});
 assert.equal(t.root.hidden,false);
 assert.match(t.root.innerHTML,/GET STARTED/);
 assert.match(t.root.innerHTML,/Connect & refresh/);
 assert.match(t.root.innerHTML,/tch-bottom/);
 assert.doesNotMatch(t.root.innerHTML,/Dashboard could not render/);
 assert.equal(t.requests.length,0);
});
test("Opening an existing company renders metrics, decisions, and navigation",()=>{
 const t=launchFixture();t.model.seed(sample());
 t.opener.listeners.click({preventDefault(){}});
 assert.match(t.root.innerHTML,/Example Fitness/);
 assert.match(t.root.innerHTML,/DO THIS NEXT/);
 assert.match(t.root.innerHTML,/Estimated P\/L/i);
 assert.doesNotMatch(t.root.innerHTML,/Dashboard could not render/);
 assert.equal(t.requests.length,0);
});
test("Metric drilldown and returning to Today render through actual draw",()=>{
 const t=launchFixture();t.model.seed(sample());t.opener.listeners.click({preventDefault(){}});
 t.model.view("rating");assert.match(t.root.innerHTML,/Road to ten stars/);
 t.model.tab("overview");assert.match(t.root.innerHTML,/DO THIS NEXT/);
 assert.equal(t.requests.length,0);
});
test("Malformed stored data shows a recovery panel, never a blank screen",()=>{
 const t=launchFixture();t.model.seed({profile:{id:10,name:"Malformed snapshot",rating:3},staff:null});
 t.opener.listeners.click({preventDefault(){}});
 assert.match(t.root.innerHTML,/Dashboard could not render/);
 assert.match(t.root.innerHTML,/Close dashboard/);
 assert.match(t.root.innerHTML,/Open Settings/);
 assert.equal(t.saved.length,0);
 assert.equal(t.requests.length,0);
});
test("Recovery UI can close and leave the launcher available",async()=>{
 const t=launchFixture();t.model.seed({profile:{id:10,name:"Malformed snapshot",rating:3},staff:null});
 t.opener.listeners.click({preventDefault(){}});
 await t.root.listeners.click({target:{closest(){return {dataset:{act:"close"}};}}});
 assert.equal(t.root.hidden,true);
 assert.equal(t.opener.hidden,false);
});
test("Non-navigation metric markup has a matching button closure",()=>{
 assert.match(script,/data-act="metric-detail"[\s\S]{0,160}\+inner\+'<\/button>'/);
 assert.match(script,/\/\/ @version\s+1\.36\.0/);
 assert.doesNotMatch(script,/PDA_http(?:Post|Put|Patch|Delete)\s*\(/);
});
test("Records distinguishes replaced credits and exposes older recoverable payments",async()=>{
 const t=launchFixture(), c=sample(), ts=1600000000;
 const original={id:"old",sourceId:"log:one",source:"log-auto",playerId:11,trains:1,amount:250000,ts,voided:true,
   voidReason:"Superseded by explicitly confirmed training purchase"};
 c.payments=[original,{...original,id:"confirmed",source:"log-confirmed",confirmed:true,voided:false},
   {...original,id:"recover",sourceId:"log:two",source:"log-confirmed",voidReason:"Voided by director"}];
 c.training=Array.from({length:70},(_,i)=>({id:"train"+i,playerId:11,units:1,ts:ts+1+i}));
 t.model.seed(c);t.opener.listeners.click({preventDefault(){}});
 t.model.tab("training");
 const click=dataset=>t.root.listeners.click({target:{closest:()=>({dataset})}});
 await click({act:"training-view",view:"records"});
 assert.match(t.root.innerHTML,/Show older records/);
 assert.doesNotMatch(t.root.innerHTML,/data-act="restore-payment"/);
 await click({act:"more-records"});
 assert.match(t.root.innerHTML,/Payment · REPLACED/);
 assert.match(t.root.innerHTML,/data-act="restore-payment" data-id="recover"/);
 assert.doesNotMatch(t.root.innerHTML,/data-act="restore-payment" data-id="old"/);
});

test("Payments defaults to actionable receipts, with former staff and other senders accessible on demand",async()=>{
 const t=launchFixture(), c=sample(), ts=1600000000;
 c.archived=[{id:12,name:"Previous employee"}];
 c.logs=[["current",11],["former",12],["other",13],["unknown",null]].map(([id,senderId])=>({
  id,timestamp:ts,suggestion:{status:"review",senderId,amount:125000}
 }));
 c.payments=[{id:"credited",source:"log-package-auto",sourceId:"log:package",amount:250000,trains:1,playerId:11,ts,assumed:true,confirmed:true}];
 t.model.seed(c);t.opener.listeners.click({preventDefault(){}});
 const click=dataset=>t.root.listeners.click({target:{closest:()=>({dataset})}});
 await click({act:"goto",target:"training-payments"});
 assert.match(t.root.innerHTML,/To review \(2\)/);
 assert.match(t.root.innerHTML,/Former staff \(1\)/);
 assert.match(t.root.innerHTML,/data-act="approve-log" data-id="unknown"/);
 assert.doesNotMatch(t.root.innerHTML,/data-act="approve-log" data-id="former"/);
 await click({act:"payment-review-group",view:"former"});
 assert.match(t.root.innerHTML,/data-act="approve-log" data-id="former"/);
 assert.doesNotMatch(t.root.innerHTML,/data-act="approve-log" data-id="current"/);
 await click({act:"payment-review-group",view:"other"});
 assert.match(t.root.innerHTML,/Sender #13/);
 await click({act:"goto",target:"training-payments"});
 assert.match(t.root.innerHTML,/data-act="approve-log" data-id="current"/);
 await click({act:"training-view",view:"records"});
 assert.match(t.root.innerHTML,/Payment · AUTO-CREDITED/);
 await click({act:"confirm-credited-payment",id:"credited"});
 assert.match(t.root.innerHTML,/Payment · CONFIRMED/);
 assert.doesNotMatch(t.root.innerHTML,/data-act="confirm-credited-payment"/);
});

test("Existing auto-credited receipts link to that employee's pricing and show the exact correction",async()=>{
 const t=launchFixture(), c=sample(), ts=1600000000;
 c.trainRates={"11":{single:250000,bundle:1000000,units:6}};
 c.payments=[{id:"older",source:"log-package-auto",sourceId:"log:old",ts,playerId:11,amount:1000000,trains:5,assumed:true,confirmed:true}];
 t.model.seed(c);t.opener.listeners.click({preventDefault(){}});
 const click=dataset=>t.root.listeners.click({target:{closest:()=>({dataset})}});
 t.model.tab("training");await click({act:"training-view",view:"records"});
 assert.match(t.root.innerHTML,/data-act="employee-rate" data-id="11"/);
 await click({act:"employee-rate",id:"11"});
 assert.match(t.root.innerHTML,/ExampleEmployee has a personal rate/);
 assert.match(t.root.innerHTML,/5 recorded/);
 assert.match(t.root.innerHTML,/Apply 6 trains/);
 await click({act:"reprice-payment",id:"older",units:"6"});
 assert.doesNotMatch(t.root.innerHTML,/Apply 6 trains/);
 await click({act:"training-view",view:"records"});
 assert.match(t.root.innerHTML,/Train rate correction from 5 trains/);
});
