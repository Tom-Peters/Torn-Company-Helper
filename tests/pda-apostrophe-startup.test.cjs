"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const raw=fs.readFileSync(path.join(__dirname,"..","Torn-Company-Helper.user.js"),"utf8");
const normalized=raw.replace(/[\u2018\u2019]/g,"'");
test("Torn PDA apostrophe-normalised whole source remains valid JavaScript",()=>{
 assert.doesNotThrow(()=>new vm.Script(normalized));
 assert.equal(/[\u2018\u2019]/.test(raw),false);
});
test("Normalised script boots a visible company-page launcher and opens dashboard",()=>{
 const elements=new Map();
 const node=()=>({id:"",style:{},dataset:{},innerHTML:"",hidden:false,offsetWidth:140,offsetHeight:44,
  listeners:{},appendChild(){},addEventListener(event,fn){this.listeners[event]=fn;},
  setAttribute(){},setPointerCapture(){},getBoundingClientRect(){return {left:5,top:5,width:140,height:44};}});
 const document={getElementById(id){return elements.get(id)||null;},createElement:node,
 documentElement:{appendChild(el){elements.set(el.id,el);}},body:{appendChild(el){elements.set(el.id,el);}}};
 const window={location:{pathname:"/companies.php"},innerWidth:390,innerHeight:800,addEventListener(){}};
 window.self=window;window.top=window;
 vm.runInNewContext(normalized,{document,window,URL,URLSearchParams,JSON,Math,Number,Set,Map,Date,Blob,console,
  PDA_storage:{get:async()=>null,set:async()=>true},PDA_httpGet(){throw Error("Unexpected startup GET");}},{timeout:2000});
 const open=elements.get("tch-open"),root=elements.get("tch-root");
 assert.ok(open);assert.ok(root);
 assert.equal(open.hidden,false);
 assert.equal(typeof open.listeners.click,"function");
 open.listeners.click({preventDefault(){}});
 assert.equal(root.hidden,false);
 assert.match(root.innerHTML,/COMPANY HELPER/);
 assert.doesNotMatch(root.innerHTML,/Dashboard could not render/);
});
