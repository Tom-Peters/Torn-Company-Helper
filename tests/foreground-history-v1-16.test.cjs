"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const source=fs.readFileSync(path.join(__dirname,"../Torn-Company-Helper.user.js"),"utf8");
const a=source.indexOf("async function autoHistoryBackfillV116(c){"),b=source.indexOf("let lastAutoCompanyAttemptV112=",a);
assert.ok(a>=0&&b>a,"Auto-import helper exists");
const code=source.slice(a,b);
test("read-only company historical sync imports one bounded page with an official cursor",async()=>{
 const calls=[],c={profile:{id:1},logTypes:"1000",newsNext:{to:"42"},logNext:{to:"40"}};
 const scope={
  read:async(path,params)=>{calls.push({path,params});return{news:[{id:"n1",timestamp:33,text:"Trained employee"}]};},
  normaliseNewsResponse:x=>x,importPageDecision:()=>({next:{to:"33"},warning:null}),
  mergeTrainingNewsV13:x=>{x.news=(x.news||[]).concat([{id:"n1"}]);},
  mergeIncomingLogsV13:()=>{throw Error("Should not import second page");}
 };
 const sync=vm.runInNewContext(code+";autoHistoryBackfillV116",scope);
 await sync(c);
 assert.equal(calls.length,1);assert.equal(calls[0].path,"company/news");
 assert.equal(calls[0].params.to,"42");assert.equal(c.newsNext.to,"33");
 assert.equal(c.autoHistoryNextV116,"money");assert.ok(c.autoHistoryLastSuccessV116>0);
 await sync(c);assert.equal(calls.length,1,"check is throttled");
});
test("malformed official pagination halts automatic backfill without deleting cursor",async()=>{
 const c={profile:{id:1},newsNext:{to:"42"}};
 const sync=vm.runInNewContext(code+";autoHistoryBackfillV116",{
  read:async()=>({news:[{id:"n1",timestamp:33}]}),
  normaliseNewsResponse:x=>x,importPageDecision:()=>({next:null,warning:"Unrecognised official continuation"}),
  mergeTrainingNewsV13:()=>{throw Error("Unsafe merge");},mergeIncomingLogsV13:()=>{}
 });
 await sync(c);
 assert.equal(c.newsNext.to,"42");assert.match(c.newsHistoryWarning,/Unrecognised/);
});
test("all auto reads remain GET-only and scheduled only while visible",()=>{
 assert.match(source,/if\(document\.hidden\|\|busy\|\|typeof PDA_storage==="undefined"\)return/);
 assert.match(source,/setInterval\(function\(\)\{void autoCompanyRefreshV112\(true\);\},60000\)/);
 assert.doesNotMatch(source,/PDA_http(?:Post|Put|Patch|Delete)\s*\(/);
});