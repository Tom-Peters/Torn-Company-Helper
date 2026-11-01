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
  const code=source.replace(marker,'  globalThis.__service={stockModeV117,stockAdviceV3,stockV3,serviceOperationsV117,launcherAlertsV11,reconcileStocklessCompanyV119,companyHubActions,directorBriefV110,riskRadarV3};\n'+marker);
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
test("Real stocked companies preserve product modelling",()=>{
  const {api}=model(),c=company("Other Business");
  c.stock=[{id:4,name:"Example Product",in_stock:15,on_order:5,sold_amount:10,cost:30,price:100,rrp:110}];
  assert.equal(api.stockModeV117(c),"products");
  assert.equal(api.stockAdviceV3(c)[0].qty,10);
  assert.match(api.stockV3(c),/Stock & replenishment/);
});
test("Automatic profile refresh never demands company-stock data for a recognized stockless Fitness Center",()=>{
  assert.match(source,/const liveMode=stockModeV117/);
  assert.match(source,/if\(liveMode==='service'\|\|liveMode==='no-products'\)/);
  assert.match(source,/else\{[\s\S]*?st=await read\("company\/stock"\)/);
  assert.doesNotMatch(source,/PDA_http(?:Post|Put|Patch|Delete)\s*\(/);
});

test("A persisted phantom stock line never produces Fitness Center alerts or recommendations",()=>{
  const {api}=model(),c=company();
  c.stock=[{id:99,name:"Obsolete Product",in_stock:0,on_order:0,sold_amount:10,cost:30,price:100,rrp:110}];
  c.stockModeV117="products";c.stockFetchError="Previous API access denied";
  c.snapshots=[{observedAt:"2026-10-29T12:00:00.000Z",stock:[{id:99,sold_amount:10}]}];
  assert.equal(api.stockModeV117(c),"service","company type must beat stale stored product");
  assert.equal(api.stockAdviceV3(c).length,0,"old stock snapshots must not generate a shortage");
  assert.ok(!api.launcherAlertsV11(c).items.some(x=>x.id==="stock-shortage"));
  assert.ok(!api.companyHubActions(c).some(x=>/stock/i.test(x.id)||/stock shortage/i.test(x.title)));
  assert.ok(!api.directorBriefV110(c).items.some(x=>/stock shortage/i.test(x.title)));
  assert.ok(!api.riskRadarV3(c).alerts.some(x=>/stock/i.test(x.title)));
  assert.match(api.stockV3(c),/Service operations/);
  assert.equal(api.reconcileStocklessCompanyV119(c),true,"obsolete stock is migrated automatically");
  assert.equal(c.stock.length,0);assert.equal(c.stockFetchError,null);
  assert.equal(c.stockModeV117,"service");
  assert.equal(c.snapshots.length,1,"do not discard financial or historical records");
  assert.equal(api.reconcileStocklessCompanyV119(c),false,"migration is idempotent");
});
test("A confirmed no-product company ignores stale cached rows, but a failed GET does not imply it",()=>{
  const {api}=model(),c=company("Different Business");
  c.stockModeV117="no-products";
  c.stock=[{id:100,name:"Ghost",in_stock:0,on_order:0,sold_amount:30,price:150,cost:25}];
  assert.equal(api.stockModeV117(c),"no-products");
  assert.equal(api.stockAdviceV3(c).length,0);
  assert.equal(api.reconcileStocklessCompanyV119(c),true);
  assert.equal(c.stock.length,0);
  const unknown=company("Different Business");
  unknown.stockFetchError="API denied";
  assert.equal(api.stockModeV117(unknown),"unknown");
  assert.equal(api.reconcileStocklessCompanyV119(unknown),false);
});
test("Fresh Fitness Center profile overrides a stale old company type before stock API access",()=>{
  const {api}=model(),c=company("Shop");
  c.stock=[{id:22,name:"Saved stock",in_stock:2}];
  const fresh=company("Fitness Center").profile;
  assert.equal(api.stockModeV117({...c,profile:fresh}),"service");
  assert.equal(api.reconcileStocklessCompanyV119(c,fresh),true);
  assert.equal(c.stock.length,0);
});
