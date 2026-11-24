"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const script=fs.readFileSync(path.join(__dirname,"..","Torn-Company-Helper.user.js"),"utf8");
const marker='  const style=document.createElement("style");';
assert.ok(script.includes(marker));
const inject=script.replace(marker,"  globalThis.__modelTraining={trainingHistoryGroups,matchTrainingNews,reconcileTraining,findMoneyTypes,cleanNews,parseIncomingLog,priceTrains,aggregates,repairImportDuplicates,uniqueTrainingEvents,repairAllSavedCompanyDuplicates,normaliseNewsResponse};\n"+marker);
const el=()=>({style:{},dataset:{},addEventListener(){},appendChild(){},hidden:false,offsetWidth:150,offsetHeight:45,getBoundingClientRect(){return {left:5,top:5,width:150,height:45};},setPointerCapture(){}});
const document={getElementById(){return null;},createElement:el,documentElement:{appendChild(){}},body:{appendChild(){}}};
const window={location:{pathname:"/companies.php"},innerWidth:400,innerHeight:850,addEventListener(){}};window.top=window;window.self=window;
const sandbox={window,document,PDA_storage:{get:async()=>null},PDA_httpGet(){throw Error("No API call expected");},URL,URLSearchParams,JSON,Date,Math,Number,Set,Map,console};
vm.runInNewContext(inject,sandbox,{timeout:1000});
const model=sandbox.__modelTraining;
const people=[{id:123,name:"SampleAlice"},{id:456,name:"SampleBob"}];
const company=()=>({staff:people,archived:[],news:[],training:[],payments:[]});
test("Training news recognises the recipient after 'trained'",()=>{
 const result=model.matchTrainingNews({text:'Director has trained <a href="profiles.php?XID=123">SampleAlice</a>'},company());
 assert.equal(result.playerId,123);
});
test("Training news recognises recipient before 'was trained'",()=>{
 assert.equal(model.matchTrainingNews({text:"SampleBob was trained by the director"},company()).playerId,456);
});
test("Ambiguous two-person training news stays unmatched",()=>{
 assert.equal(model.matchTrainingNews({text:"SampleAlice and SampleBob trained together"},company()).status,"review");
});
test("A named trainer with unknown recipient must not be credited",()=>{
 assert.equal(model.matchTrainingNews({text:"SampleAlice trained somebody new"},company()).status,"review");
});
test("Unknown recipient stays unmatched",()=>{
 assert.equal(model.matchTrainingNews({text:"The director trained another employee"},company()).status,"review");
});
test("Repeated import never duplicates matched trains",()=>{
 const c=company();c.news=[{id:"abc",text:"SampleAlice was trained",timestamp:123456}];
 assert.equal(model.reconcileTraining(c).matched,1);
 assert.equal(model.reconcileTraining(c).matched,0);
 assert.equal(c.training.length,1);
 assert.equal(c.training[0].sourceId,"news:abc");
});
test("Existing manually matched event is preserved",()=>{
 const c=company();c.news=[{id:"abc",text:"SampleBob was trained",timestamp:100}];
 c.training=[{id:"existing",sourceId:"news:abc",playerId:456,units:1}];
 assert.equal(model.reconcileTraining(c).matched,0);
 assert.equal(c.training.length,1);
});
test("Money log types are suggested rather than hard-coded",()=>{
 const choices=model.findMoneyTypes({logtypes:[
  {id:11,title:"Money received"},{id:12,title:"Company money received"},
  {id:13,title:"Money sent"},{id:14,title:"Bank money received"}]});
 assert.equal(Array.from(choices,x=>x.id).join(","),"11");
});
test("Remote script metadata remains valid",()=>{
 assert.ok(script.startsWith("// ==UserScript=="));
 assert.match(script,/\/\/ @author\s+IamEEKY/);
 assert.match(script,/\/\/ @version\s+1\.36\.1/);
});

test("Two imports from one Torn news source count once, even before cleanup",()=>{
 const c=company();
 c.training=[
  {id:"news:auto:987",sourceId:"news:987",playerId:123,units:1,ts:11},
  {id:"oldcopy",sourceId:"company-news:987",playerId:123,units:1,ts:11},
  {id:"anothercopy",sourceId:"news:987",playerId:123,units:1,ts:11}
 ];
 const before=model.aggregates(c).balance["123"].delivered;
 assert.equal(before,1);
 assert.equal(model.repairImportDuplicates(c),2);
 const after=model.aggregates(c).balance["123"].delivered;
 assert.equal(after,1);
 assert.equal(c.training.filter(x=>x.voided).length,2);
});
test("Re-running automatic import after cleanup does not credit anything else",()=>{
 const c=company();
 c.news=[{id:"987",text:"SampleAlice was trained",timestamp:11}];
 c.training=[{id:"news:auto:987",sourceId:"news:987",playerId:123,units:1,ts:11}];
 assert.equal(model.reconcileTraining(c).matched,0);
 assert.equal(model.aggregates(c).balance["123"].delivered,1);
});
test("Incoming payment matches only an explicit staff sender and amount",()=>{
 const result=model.parseIncomingLog({
  details:{title:"Money received"},data:{sender_id:123,money:1000000},params:{}
 },company());
 assert.equal(result.status,"matched");
 assert.equal(result.playerId,123);
 assert.equal(result.trains,5);
});
test("A user_id field alone must never be assumed to be the sender",()=>{
 const result=model.parseIncomingLog({
  details:{title:"Money received"},data:{user_id:123,money:250000},params:{}
 },company());
 assert.equal(result.status,"review");
});
test("Unrelated payments and partial amounts require review",()=>{
 const c=company();
 const other=model.parseIncomingLog({details:{title:"Money received"},data:{from_id:888,money:250000}},c);
 const partial=model.parseIncomingLog({details:{title:"Money received"},data:{from_id:123,money:150000}},c);
 assert.equal(other.status,"review");
 assert.equal(partial.status,"review");
 assert.equal(partial.amount,150000);
});
test("Company launcher only matches company URL and has touch drag handlers",()=>{
 assert.match(script,/\/\/ @match\s+https:\/\/www\.torn\.com\/\*/);
 assert.match(script,/if \(!isCompanyPage\(\)\)/);
 assert.match(script,/touch-action:none/);
 assert.match(script,/pointerdown/);
 assert.match(script,/pointermove/);
});

test("Company-news pagination normalises object and array replies without duplicate IDs",()=>{
 const input={"one":{id:"one",timestamp:5,text:"A"},"two":{id:"two",timestamp:4,text:"B"}};
 const list=Array.from(model.normaliseNewsResponse(input));
 assert.equal(list.length,2);
 const repeated=Array.from(model.normaliseNewsResponse([{id:"one",timestamp:5},{id:"one",timestamp:5}]));
 assert.equal(repeated.length,1);
});
test("Historical double-credit repair scans all company accounts",()=>{
 const c=company();c.training=[
   {playerId:123,sourceId:"news:1",units:1},
   {playerId:123,sourceId:"company-news:1",units:1}
 ];
 const d=company();d.training=[
   {playerId:456,sourceId:"news:2",units:1},
   {playerId:456,sourceId:"news:2",units:1}
 ];
 assert.equal(model.repairAllSavedCompanyDuplicates({a:c,b:d}),2);
 assert.equal(model.aggregates(c).balance["123"].delivered,1);
 assert.equal(model.aggregates(d).balance["456"].delivered,1);
});
test("Training history has explicit older-page and recent-rescan controls",()=>{
 assert.match(script,/data-act="import-news"/);
 assert.match(script,/data-act="rescan-news"/);
 assert.match(script,/if\(!newest\) \{/);
 assert.match(script,/c.newsCursor!=null/);
 assert.match(script,/c.newsNext/);
});
test("Company launcher hides on route change without page reload",()=>{
 assert.match(script,/routeObserver\.observe\(document\.body/);
 assert.match(script,/if\(observedPath!==window\.location\.pathname\)/);
});

test("Historical role-and-name notices for departed employees stay out of review even without an archive entry",()=>{
 const c=company();c.profile={employees:{hired:2}};
 c.news=[
  {id:"former",text:"Fitness Instructor FormerFixture has been trained by the director and gained 12.5 endurance."},
  {id:"ambiguous",text:"SampleAlice and SampleBob trained together"},
  {id:"actor",text:"FormerFixture trained somebody new"},
  {id:"uncertain",text:"An employee has been trained by the director"}
 ];
 const groups=model.trainingHistoryGroups(c);
 assert.deepEqual(Array.from(groups.former,r=>r.news.id),["former"]);
 assert.deepEqual(Array.from(groups.current,r=>r.news.id),["ambiguous","actor","uncertain"]);
 assert.equal(model.reconcileTraining(c).review,3);
 assert.equal(c.news.length,4);
 assert.equal(c.training.length,0);
 c.profile.employees.hired=3;
 assert.equal(model.trainingHistoryGroups(c).former.length,0);
});

test("A current recipient or shared alias cannot be hidden as former staff",()=>{
 const c=company();c.profile={employees:{hired:2}};
 c.staff=[{...people[0],aliases:["OldName","SharedAlias"]},people[1]];
 c.archived=[{id:888,name:"FormerFixture",aliases:["SharedAlias"]}];
 c.news=[
   {id:"alias",text:"Fitness Instructor OldName has been trained by the director"},
   {id:"ambiguous",text:"Fitness Instructor SharedAlias has been trained by the director"},
   {id:"former-count",text:"FormerFixture was trained 31 times"},
   {id:"active-count",text:"SampleAlice was trained 31 times"}
 ];
 assert.deepEqual(Array.from(model.trainingHistoryGroups(c).former,r=>r.news.id),["former-count"]);
 assert.equal(model.reconcileTraining(c).matched,1);
 assert.equal(c.training[0].playerId,123);
 assert.deepEqual(Array.from(model.trainingHistoryGroups(c).current,r=>r.news.id),["ambiguous","active-count"]);
});

test("Previously unseen recipient on a later roster reconciles once and keeps their purchase",()=>{
 const c=company();c.profile={employees:{hired:2}};
 c.news=[{id:"old-news",timestamp:10,text:"Fitness Instructor ReturningFixture has been trained by the director."}];
 c.payments=[{id:"saved-payment",ts:1,playerId:789,confirmed:true,trains:5}];
 assert.equal(model.reconcileTraining(c).review,0);
 assert.equal(model.aggregates(c).balance[789].owed,5);
 c.staff=[...c.staff,{id:789,name:"ReturningFixture"}];c.profile.employees.hired=3;
 assert.equal(model.trainingHistoryGroups(c).former.length,0);
 assert.equal(model.reconcileTraining(c).matched,1);
 assert.equal(model.reconcileTraining(c).matched,0);
 assert.equal(model.aggregates(c).balance[789].owed,4);
 assert.equal(model.trainingHistoryGroups(c).current.length,0);
});

test("Recipient profile IDs distinguish former and current staff when display names have changed",()=>{
 const c=company();c.profile={employees:{hired:2}};
 c.news=[
   {id:"renamed",text:'Fitness Instructor <a href="/profiles.php?XID=123">DifferentName</a> has been trained by the director.'},
   {id:"past",text:'The director trained <a href="/profiles.php?XID=999">SampleAlice</a>.'},
   {id:"trainer",text:'<a href="/profiles.php?XID=999">FormerWorker</a> trained <a href="/profiles.php?XID=456">EarlierName</a>.'}
 ];
 assert.deepEqual(Array.from(model.trainingHistoryGroups(c).former,r=>r.news.id),["past"]);
 assert.equal(model.reconcileTraining(c).matched,2);
 assert.deepEqual(Array.from(c.training,t=>t.playerId),[123,456]);
});
