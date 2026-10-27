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
 assert.match(t.root.innerHTML,/Your next decisions/);
 assert.match(t.root.innerHTML,/Daily P\/L/);
 assert.doesNotMatch(t.root.innerHTML,/Dashboard could not render/);
 assert.equal(t.requests.length,0);
});
test("Metric drilldown and returning to Today render through actual draw",()=>{
 const t=launchFixture();t.model.seed(sample());t.opener.listeners.click({preventDefault(){}});
 t.model.view("rating");assert.match(t.root.innerHTML,/Road to ten stars/);
 t.model.tab("overview");assert.match(t.root.innerHTML,/Your next decisions/);
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
 assert.match(script,/\/\/ @version\s+0\.9\.2/);
 assert.doesNotMatch(script,/PDA_http(?:Post|Put|Patch|Delete)\s*\(/);
});
