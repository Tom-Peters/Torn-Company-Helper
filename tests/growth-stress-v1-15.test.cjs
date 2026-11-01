"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const source=fs.readFileSync(path.join(__dirname,"../Torn-Company-Helper.user.js"),"utf8");
const a=source.indexOf("let companyStressPctV115=10;"),b=source.indexOf("function homeV13(",a);
assert.ok(a>0&&b>a,"Growth Stress Lab must be available before company overview");
const code=source.slice(a,b);
const money=n=>"$"+Math.round(n),esc=x=>String(x);
const accounting=()=>({known:true,revenue:2000000,profit:100000,wages:1000000,ad:900000});
const metricV2=(label,value)=>label+"="+value+";";
test("10% shock compares reported baseline with conservative spending room",()=>{
 const render=vm.runInNewContext(code+";companyStressLabV115",{accounting,money,esc,metricV2});
 const html=render({lossLimit:500000});
 assert.match(html,/After −10% revenue=\$-100000/);
 assert.match(html,/Shock-safe spending room=\$300000/);
 assert.match(html,/data-act="stress-shock"/);assert.match(html,/growth-pricing/);
});
test("missing verified accounts yields refresh, never hypothetical zeros",()=>{
 const render=vm.runInNewContext(code+";companyStressLabV115",{accounting:()=>({known:false}),money,esc,metricV2});
 const html=render({lossLimit:500000});
 assert.match(html,/Refresh the complete income/);assert.doesNotMatch(html,/Shock-safe spending room/);
});
