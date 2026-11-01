"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),
 fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const source=fs.readFileSync(path.join(__dirname,"..","Torn-Company-Helper.user.js"),"utf8");
function fixture(payload){
 const elements=new Map(),calls=[];let key="AAAAAAAAAAAAAAAA";
 const node=()=>({id:"",style:{},dataset:{},hidden:false,innerHTML:"",listeners:{},
  appendChild(){},addEventListener(k,fn){this.listeners[k]=fn;},setAttribute(){},setPointerCapture(){},
  getBoundingClientRect(){return {left:10,top:10,width:150,height:44};},offsetWidth:150,offsetHeight:44});
 const document={getElementById(id){return elements.get(id)||null;},createElement:node,
  body:{appendChild(e){elements.set(e.id,e);}},documentElement:{appendChild(e){elements.set(e.id,e);}}};
 const window={location:{pathname:"/companies.php"},innerWidth:390,innerHeight:800,addEventListener(){}};
 window.top=window;window.self=window;
 const hook='  const style=document.createElement("style");';
 const script=source.replace('const PDA_APP_KEY = "###PDA-APIKEY###";','const PDA_APP_KEY = "'+key+'";')
  .replace(hook,'  globalThis.__v12={employeePenaltyV12,wageRiskModelV12,wageRiskPanelV12,candidateStatsV12,replacementsV12,'+
    'replacementPanelV12,positionCountsV12,rosterBenchV12,rivalRostersPanelV12,changeImpactV12,'+
    'markChangeV12,changeTrackingPanelV12,sundayReviewV12,sundayPanelV12,'+
    'scanRivalRostersV12,staffV2,growthV2,seed(c){companyId=String(c.profile.id);data.byCompany[companyId]=c;},changeView(k){growthView=k;}};\n'+hook);
 const sandbox={window,document,Date,JSON,Number,Math,Map,Set,URL,URLSearchParams,Blob,console,
  PDA_storage:{get:async()=>null,set:async()=>true},
  PDA_httpGet:async(url)=>{calls.push(url);return {status:200,responseText:JSON.stringify(payload?payload(url):{})};}};
 vm.runInNewContext(script,sandbox,{timeout:1800});
 return {app:sandbox.__v12,calls,elements};
}
function company(){
 const person=(id,name,role,stats,value,days=12)=>({id,name,position:{name:role},stats,
  effectiveness:{addiction:-6,inactivity:-4,settled_in:10,total:80},value,wage:90000,days_in_company:days});
 const stats=(manual_labor,intelligence,endurance)=>({manual_labor,intelligence,endurance});
 return {profile:{id:7,name:"Example Fitness",type:{id:29,name:"Fitness Center"},rating:4,
  efficiency:92,environment:97,popularity:94,trains:12,employees:{hired:3,capacity:15},
  income:{daily:500000,weekly:3000000},advertisement_budget:100000},
  staff:[
   person(1,"Original","Fitness Instructor",stats(3000,8000,10000),200000,180),
   person(2,"Cleaner","Cleaner",stats(10000,2000,30000),0),
   person(3,"Manager","Manager",stats(50000,20000,70000),null)],
  roles:[{name:"Fitness Instructor",requirements:{manual_labor:40000,endurance:20000}},
   {name:"Cleaner",requirements:{manual_labor:10000,endurance:20000}},
   {name:"Manager",requirements:{intelligence:50000,endurance:60000}}],
  applications:[{player:{id:9,name:"Candidate",stats:stats(100000,10000,80000)}}],
  snapshots:[],payments:[],training:[],news:[],logs:[],archived:[],whatIf:{},lossLimit:500000,
  peers:{rows:[{id:99,name:"TenStar",rating:10,weekly:40000000,
    income:{weekly:40000000},type:{id:29},employees:{hired:15,capacity:15}}],
    scanned:1,complete:false}};
}
test("Wage helper shows addiction and tenure without assigning zero-value support salary",()=>{
 const {app}=fixture(),c=company(),m=app.wageRiskModelV12(c);
 assert.equal(m.rows.length,3);
 assert.equal(m.rows[0].pen.addiction,-6);
 assert.ok(m.rows[0].notes.some(x=>/tenure/i.test(x)));
 assert.ok(m.rows[0].hi>m.rows[0].target);
 assert.equal(m.rows[1].lo,null);
 assert.equal(m.rows[2].lo,null);
 assert.match(app.wageRiskPanelV12(c),/Indirect contribution/);
 assert.match(app.wageRiskPanelV12(c),/Retention/);
});
test("Applicant replacement simulation compares one same role and does not target protected Manager or Cleaner",()=>{
 const {app}=fixture(),c=company();
 const result=app.replacementsV12(c);
 assert.equal(result.length,1);
 assert.equal(result[0].name,"Candidate");
 assert.equal(result[0].current,"Original");
 assert.equal(result[0].role,"Fitness Instructor");
 assert.match(app.replacementPanelV12(c),/Candidate/);
});
test("Missing applicant stat is never interpreted as zero and never creates replacement recommendation",()=>{
 const {app}=fixture(),c=company();
 c.applications[0].player.stats={manual_labor:10000};
 assert.equal(app.replacementsV12(c).length,0);
});
test("Public 10-star role layout read stores counts only, while preserving private staff records",async()=>{
 const c=company();
 const {app,calls}=fixture(()=>({employees:[
  {id:100,name:"Private One",position:{name:"Fitness Instructor"}},
  {id:101,name:"Private Two",position:{name:"Fitness Instructor"}},
  {id:102,name:"Private Three",position:{name:"Cleaner"}}]}));
 app.seed(c);assert.equal(calls.length,0);
 await app.scanRivalRostersV12();
 assert.equal(calls.length,1);
 assert.match(calls[0],/company\/99\/employees/);
 assert.equal(c.rivalTeams.rows[0].counts["Fitness Instructor"],2);
 assert.equal(c.rivalTeams.rows[0].counts["Cleaner"],1);
 assert.equal(JSON.stringify(c.rivalTeams).includes("Private One"),false);
 assert.match(app.rivalRostersPanelV12(c),/Peer staffing fit/);
});
test("Company change marker keeps a private baseline and compares only later observations",()=>{
 const {app}=fixture(),c=company();
 app.markChangeV12(c,"Positions changed");
 let observations=app.changeImpactV12(c);
 assert.equal(observations.length,1);
 assert.equal(observations[0].hasLater,false);
 assert.throws(()=>app.markChangeV12(c,"Not allowed"));
 c.profile.efficiency=96;
 c.profile.popularity=95;
 c.lastRefresh=new Date(Date.now()+10000).toISOString();
 observations=app.changeImpactV12(c);
 assert.equal(observations[0].changes.efficiency,4);
 assert.equal(observations[0].changes.popularity,1);
 assert.match(app.changeTrackingPanelV12(c),/not a causal attribution/);
});
test("Sunday rating delta needs two separate Sunday data points",()=>{
 const {app}=fixture(),c=company();
 c.snapshots=[
  {observedAt:"2026-10-18T21:00:00Z",rating:3,efficiency:85},
  {observedAt:"2026-10-25T20:00:00Z",rating:4,efficiency:93},
  {observedAt:"2026-10-27T20:00:00Z",rating:4,efficiency:95}];
 const review=app.sundayReviewV12(c);
 assert.equal(review.previous.rating,3);
 assert.equal(review.latest.rating,4);
 assert.ok(review.days>=2);
 assert.match(app.sundayPanelV12(c),/Sunday star review/);
 assert.match(app.sundayPanelV12(c),/\+1 ★/);
});
test("New UI sections appear only in existing Staff and Growth destinations",()=>{
 const {app,calls}=fixture(),c=company();
 assert.match(app.staffV2(c),/Hiring impact simulator/);
 app.changeView("review");
 assert.match(app.growthV2(c),/Before & after company changes/);
 assert.match(app.growthV2(c),/Sunday star review/);
 assert.equal(calls.length,0);
});
test("All remote company actions remain GET-only and no real keys are committed",()=>{
 assert.doesNotMatch(source,/PDA_http(?:Post|Put|Patch|Delete)\s*\(/);
 assert.match(source,/const PDA_APP_KEY = "###PDA-APIKEY###";/);
 assert.match(source,/\/\/ @author\s+IamEEKY/);
 assert.match(source,/\/\/ @version\s+1\.20\.0/);
});
