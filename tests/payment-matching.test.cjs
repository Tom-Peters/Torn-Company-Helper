"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const script=fs.readFileSync(path.join(__dirname,"..","Torn-Company-Helper.user.js"),"utf8");
const marker='  const style=document.createElement("style");';
const inject=script.replace(marker,"  globalThis.__paymentModel={parseIncomingLog,priceTrains,incomingTitle,findMoneyTypes,repairImportDuplicates,applyMatchedPayments,aggregates,isCompanyPage};\n"+marker);
const mkEl=()=>({style:{},dataset:{},offsetWidth:150,offsetHeight:45,hidden:false,appendChild(){},addEventListener(){},setPointerCapture(){},getBoundingClientRect(){return {left:5,top:5,width:150,height:45};}});
const document={getElementById(){return null;},createElement:mkEl,documentElement:{appendChild(){}},body:{appendChild(){}}};
const window={location:{pathname:"/companies.php"},innerWidth:410,innerHeight:860,addEventListener(){}};window.self=window;window.top=window;
const context={window,document,PDA_storage:{get:async()=>null},PDA_httpGet(){throw Error("Background API call");},URLSearchParams,Date,Set,Map,Number,Math,JSON,console};
vm.runInNewContext(inject,context,{timeout:1000});
const m=context.__paymentModel;
const staff=[{id:11,name:"ExampleOne"},{id:12,name:"ExampleTwo"}];
const company=()=>({staff,archived:[],payments:[],training:[],news:[],logs:[],lossLimit:500000});
const log=(title,data,id="log1")=>({id,timestamp:1600000000,details:{title},data,params:{}});
test("Company button scope uses company URL only",()=>{
 assert.match(script,/\/\/ @match\s+https:\/\/www\.torn\.com\/companies\.php\*/);
 assert.equal(m.isCompanyPage(),true);
 window.location.pathname="/index.php";
 assert.equal(m.isCompanyPage(),false);
 window.location.pathname="/companies.php";
});
test("Payment price bundles and single trains",()=>{
 assert.equal(m.priceTrains(1000000),5);
 assert.equal(m.priceTrains(1500000),7);
 assert.equal(m.priceTrains(250000),1);
 assert.equal(m.priceTrains(150000),null);
});
test("Money received from a known employee matches automatically",()=>{
 const guess=m.parseIncomingLog(log("Money received",{sender:11,money:1000000}),company());
 assert.equal(guess.status,"matched");assert.equal(guess.playerId,11);assert.equal(guess.trains,5);
});
test("Money sent never becomes a training purchase",()=>{
 assert.equal(m.parseIncomingLog(log("Money sent",{sender:11,money:1000000}),company()).status,"review");
});
test("Money received from somebody outside the company is not credited",()=>{
 assert.equal(m.parseIncomingLog(log("Money received",{sender:999999,money:250000}),company()).status,"review");
});
test("Uncertain or partial payments require manual review",()=>{
 assert.equal(m.parseIncomingLog(log("Money received",{sender:11,money:150000}),company()).status,"review");
 assert.equal(m.parseIncomingLog(log("Money received",{money:1000000}),company()).status,"review");
 assert.equal(m.parseIncomingLog(log("Money received",{sender:11,money:1000000,amount:250000}),company()).status,"review");
});
test("Matching a sender and amount does not confirm payment purpose",()=>{
 const c=company();
 c.logs=[{id:"log1",timestamp:1600000000,suggestion:m.parseIncomingLog(log("Money received",{sender:11,money:1000000}),c)}];
 assert.equal(m.applyMatchedPayments(c).suggested,1);
 assert.equal(m.applyMatchedPayments(c).suggested,1);
 assert.equal(c.payments.length,0);
 assert.equal(Object.keys(m.aggregates(c).balance).length,0);
 assert.equal(c.logs[0].matchStatus,"review");
});
test("Repeated training source IDs are voided while keeping the audit trail",()=>{
 const c=company();
 c.training=[{id:"a",playerId:11,units:1,sourceId:"news:abc"},
             {id:"b",playerId:11,units:1,sourceId:"news:abc"}];
 c.news=[{id:"abc",timestamp:1},{id:"abc",timestamp:1}];
 assert.equal(m.repairImportDuplicates(c),1);
 assert.equal(c.training.filter(t=>!t.voided).length,1);
 assert.equal(c.training.length,2);
 assert.equal(c.news.length,1);
 assert.equal(m.repairImportDuplicates(c),0);
});
test("Incoming payment log discovery excludes outgoing logs",()=>{
 const list=m.findMoneyTypes({logtypes:[{id:1,title:"Money received"},{id:2,title:"Money sent"},{id:3,title:"Company money received"}]});
 assert.equal(Array.from(list,t=>t.id).join(","),"1");
});
