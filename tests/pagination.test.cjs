"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const source=fs.readFileSync(path.join(__dirname,"..","Torn-Company-Helper.user.js"),"utf8");
const marker='  const style=document.createElement("style");';
assert.ok(source.includes(marker));
function createHarness(responses) {
  const withKey=source.replace('const PDA_APP_KEY = "###PDA-APIKEY###";','const PDA_APP_KEY = "'+"A".repeat(16)+'";');
  const inject=withKey.replace(marker,'  globalThis.__paging={importNextParams,importPageDecision,importNews,importLogs,seed(c){companyId=String(c.profile.id);data.byCompany[companyId]=c;},current};\n'+marker);
  const calls=[];
  const make=()=>({style:{},dataset:{},hidden:false,appendChild(){},addEventListener(){},setPointerCapture(){},
    getBoundingClientRect(){return {left:5,top:5,width:140,height:44};},offsetWidth:140,offsetHeight:44});
  const doc={getElementById(){return null},createElement:make,documentElement:{appendChild(){}},body:{appendChild(){}}};
  const win={location:{pathname:"/companies.php"},innerWidth:400,innerHeight:800,addEventListener(){}};win.top=win;win.self=win;
  const sandbox={window:win,document:doc,URL,URLSearchParams,Date,Math,Number,JSON,Set,Map,console,
    PDA_storage:{get:async()=>null,set:async()=>{}},
    PDA_httpGet:async url=>{calls.push(url);if(!responses.length)throw Error("Unexpected API call: "+url);
      return {status:200,responseText:JSON.stringify(responses.shift())};}};
  vm.runInNewContext(inject,sandbox,{timeout:1200});
  return {paging:sandbox.__paging,calls};
}
function company() {
 return {profile:{id:7,name:"Test Fitness",rating:3},staff:[],archived:[],training:[],payments:[],news:[],logs:[],
  snapshots:[],stock:[],roles:[],lossLimit:500000,incomingTypesVerified:true,logTypes:"5850"};
}
const item=(prefix,n,ts)=>({id:prefix+n,timestamp:ts,text:"An unrecognised company training event",
  details:{title:"Money received"},data:{sender_id:9999,money:250000},params:{}});
test("Official Torn next links are parsed as safe parameters, including nanostamp",()=>{
 const {paging}=createHarness([]);
 const good=paging.importNextParams({_metadata:{links:{next:"https://api.torn.com/v2/user/log?log=5850&limit=100&sort=DESC&to=100&nanostamp=123456"}}},"user/log","5850");
 assert.equal(good.invalid,false);
 assert.equal(good.next.nanostamp,"123456");
 assert.equal(good.next.log,"5850");
});
test("Pagination never follows a hostile host, foreign route or changed log filter",()=>{
 const {paging}=createHarness([]);
 for(const url of [
  "https://evil.example/v2/user/log?log=5850&to=1",
  "https://api.torn.com/v2/user/profile?log=5850&to=1",
  "https://api.torn.com/v2/user/log?log=7777&to=1",
  "https://api.torn.com/v2/user/log?log=5850&key=SECRET",
  "https://api.torn.com/v2/user/log?log=5850&to=1&to=2"
 ])assert.equal(paging.importNextParams({_metadata:{links:{next:url}}},"user/log","5850").invalid,true,url);
});
test("A full company-news page without a cursor cannot advance past tied seconds",async()=>{
 const batch=Array.from({length:100},(_,i)=>item("n",i,1000));
 const {paging,calls}=createHarness([{news:batch}]);
 const c=company();c.newsCursor=1500;paging.seed(c);
 await paging.importNews(false);
 assert.equal(c.news.length,100);
 assert.equal(c.newsCursor,1500);
 assert.match(c.newsHistoryWarning,/NOT advanced/);
 assert.match(c.newsHistoryWarning,/share a timestamp/);
 assert.match(calls[0],/to=1500/);
});
test("A proper company-news continuation imports second page at the same second",async()=>{
 const next="https://api.torn.com/v2/company/news?cat=training&limit=100&sort=DESC&to=1000";
 const {paging,calls}=createHarness([
   {news:Array.from({length:100},(_,i)=>item("n",i,1000)),_metadata:{links:{next}}},
   {news:[item("n",100,1000)]}
 ]);
 const c=company();paging.seed(c);
 await paging.importNews(false);
 assert.equal(c.newsNext.to,"1000");
 await paging.importNews(false);
 assert.equal(c.news.length,101);
 assert.equal(c.newsCursor,999);
 assert.equal(c.newsHistoryWarning,null);
 assert.match(calls[1],/to=1000/);
});
test("Recent log rescan never destroys the older-page cursor",async()=>{
 const {paging,calls}=createHarness([{log:[item("l",1,9000)]}]);
 const c=company();c.logCursor=2500;c.logNext={log:"5850",to:"2500",sort:"DESC"};paging.seed(c);
 await paging.importLogs(true);
 assert.equal(c.logCursor,2500);
 assert.equal(c.logNext.to,"2500");
 assert.equal(c.logs.length,1);
 assert.doesNotMatch(calls[0],/to=2500/);
 assert.equal(c.payments.length,0);
});
test("Nanostamp continuation retains all 101 incoming logs without crediting purchases",async()=>{
 const next="https://api.torn.com/v2/user/log?log=5850&limit=100&sort=DESC&to=5000&nanostamp=765432100";
 const {paging,calls}=createHarness([
  {log:Array.from({length:100},(_,i)=>item("l",i,5000)),_metadata:{links:{next}}},
  {log:[item("l",100,5000)]}
 ]);
 const c=company();paging.seed(c);
 await paging.importLogs(false);
 assert.equal(c.logs.length,100);
 assert.equal(c.logNext.nanostamp,"765432100");
 await paging.importLogs(false);
 assert.equal(c.logs.length,101);
 assert.equal(c.logCursor,4999);
 assert.equal(c.logHistoryWarning,null);
 assert.match(calls[1],/nanostamp=765432100/);
 assert.equal(c.payments.length,0);
});
test("An invalid continuation is reported and the previous cursor stays unchanged",async()=>{
 const {paging,calls}=createHarness([{log:Array.from({length:100},(_,i)=>item("l",i,1000)),
  _metadata:{links:{next:"https://wrong.example/v2/user/log?log=5850&to=1000"}}}]);
 const c=company();c.logCursor=2000;paging.seed(c);
 await paging.importLogs(false);
 assert.equal(c.logCursor,2000);
 assert.equal(c.logNext,undefined);
 assert.match(c.logHistoryWarning,/unrecognised pagination/);
 assert.equal(calls.length,1);
});
test("A repeatedly returned full page is flagged instead of claiming history progress",async()=>{
 const next="https://api.torn.com/v2/company/news?cat=training&limit=100&sort=DESC&to=1000";
 const same=Array.from({length:100},(_,i)=>item("n",i,1000));
 const {paging}=createHarness([{news:same,_metadata:{links:{next}}},{news:same,_metadata:{links:{next}}}]);
 const c=company();paging.seed(c);
 await paging.importNews(false);
 assert.equal(c.news.length,100);
 await paging.importNews(false);
 assert.equal(c.news.length,100);
 assert.equal(c.newsNext.to,"1000");
 assert.match(c.newsHistoryWarning,/no new IDs/);
});
test("A recent full-page rescan does not create a misleading older-history warning",async()=>{
 const {paging}=createHarness([{news:Array.from({length:100},(_,i)=>item("n",i,777))}]);
 const c=company();c.newsCursor=600;paging.seed(c);
 await paging.importNews(true);
 assert.equal(c.newsCursor,600);
 assert.equal(c.newsHistoryWarning,undefined);
});
test("Pagination is strictly manual and version is bumped",()=>{
 const {calls}=createHarness([]);
 assert.equal(calls.length,0);
 assert.match(source,/\/\/ @version\s+0\.9\.1/);
 assert.doesNotMatch(source,/PDA_http(?:Post|Put|Patch|Delete)\s*\(/);
});
