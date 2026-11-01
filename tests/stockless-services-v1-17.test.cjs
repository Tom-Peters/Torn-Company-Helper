"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const source=fs.readFileSync(path.join(__dirname,"../Torn-Company-Helper.user.js"),"utf8");
const marker='  const style=document.createElement("style");';
assert.ok(source.includes(marker),"Company model injection point must remain available");
function model(){
  const element=()=>({style:{},dataset:{},hidden:false,addEventListener(){},appendChild(){},offsetWidth:120,offsetHeight:50,getBoundingClientRect(){return {left:5,top:5,width:120,height:50};},setPointerCapture(){}});
  const document={getElementById(){return null;},createElement:element,documentElement:{appendChild(){}},body:{appendChild(){}}};
  const window={location:{pathname:"/companies.php"},innerWidth:400,innerHeight:800,addEventListener(){}};
  window.top=window;window.self=window;
  let reads=0;
  const code=source.replace(marker,'  globalThis.__service={stockModeV117,stockAdviceV3,stockV3,serviceOperationsV117,launcherAlertsV11};\n'+marker);
  const context={window,document,URL,URLSearchParams,Date,Math,JSON,Number,Set,Map,Blob,console,
    PDA_storage:{get:async()=>null},PDA_httpGet:()=>{reads++;throw Error("Unexpected API read")}};
  vm.runInNewContext(code,context,{timeout:1800});
  return {api:context.__service,reads:()=>reads};
}
function company(name="Fitness Center"){
  return {profile:{id:7,type:{id:7,name},name:"Example Business",rating:3,trains:15,
    customers:{daily:42},income:{daily:150000,weekly:1050000},advertisement_budget:20000,popularity:93,
    efficiency:97,environment:99},
    staff:[{id:5,name:"Example Worker",wage:10000,days_in_company:6,position:{name:"Employee"},stats:{endurance:1000}}],
    stock:[],roles:[],snapshots:[],payments:[],training:[],news:[],logs:[],archived:[],lossLimit:500000};
}
test("Fitness Center is a service company: no restock predictions or stock-out warnings",()=>{
  const {api,reads}=model(),c=company();
  assert.equal(api.stockModeV117(c),"service");
  assert.equal(api.stockAdviceV3(c).length,0);
  const html=api.stockV3(c);
  assert.match(html,/Service operations/);
  assert.match(html,/Daily customers/);
  assert.match(html,/Weekly income/);
  assert.match(html,/Training queue/);
  assert.doesNotMatch(html,/Product priorities|Order \d+ units|Limited key may be required/);
  assert.ok(!api.launcherAlertsV11(c).items.some(x=>x.id==="stock-shortage"));
  assert.equal(reads(),0);
});
test("Any confirmed official empty stock list presents a service-style operation view",()=>{
  const {api}=model(),c=company("Other Business");
  c.stockModeV117="no-products";
  assert.equal(api.stockModeV117(c),"no-products");
  assert.match(api.stockV3(c),/latest official company stock response has no product lines/);
  assert.equal(api.stockAdviceV3(c).length,0);
});
test("A failed stock request is not proof of a stockless company",()=>{
  const {api}=model(),c=company("Other Business");
  c.stockFetchError="Access denied";
  assert.equal(api.stockModeV117(c),"unknown");
  assert.match(api.stockV3(c),/Stock read failed/);
  assert.doesNotMatch(api.stockV3(c),/Service operations/);
});
test("Actual product lines preserve stock modelling even in historical fixtures",()=>{
  const {api}=model(),c=company();
  c.stock=[{id:4,name:"Example Product",in_stock:15,on_order:5,sold_amount:10,cost:30,price:100,rrp:110}];
  assert.equal(api.stockModeV117(c),"products");
  assert.equal(api.stockAdviceV3(c)[0].qty,10);
  assert.match(api.stockV3(c),/Stock & replenishment/);
});
test("Automatic profile refresh never demands company-stock data for a recognized stockless Fitness Center",()=>{
  assert.match(source,/if\(stockModeV117\(c\)==='service'\)\{[\s\S]*?c\.stock=\[\];c\.stockFetchError=null/);
  assert.match(source,/else\{[\s\S]*?st=await read\("company\/stock"\)/);
  assert.doesNotMatch(source,/PDA_http(?:Post|Put|Patch|Delete)\s*\(/);
});
