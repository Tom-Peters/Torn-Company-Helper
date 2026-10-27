// ==UserScript==
// @name         Torn Company Helper
// @namespace    https://github.com/Tom-Peters/Torn-Company-Helper
// @version      0.9.0
// @description  Read-only Torn PDA company dashboard: staff, trains, daily accounts and 10-star planning
// @author       IamEEKY
// @match        https://www.torn.com/companies.php*
// @match        https://torn.com/companies.php*
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function () {
  "use strict";
  if (window.top !== window.self || document.getElementById("tch-open")) return;
  const STORE = "company-helper-v1";
  const isCompanyPage = function () {return /^\/companies\.php$/i.test(window.location.pathname);};
  const API = "https://api.torn.com/v2/";
  const rolesFallback = [
    ["Personal Trainer",31000,15500,"manual_labor","endurance"],
    ["Swimming Instructor",46500,23250,"endurance","manual_labor"],
    ["Lifeguard",39000,19500,"endurance","manual_labor"],
    ["Cleaner",15500,7750,"manual_labor","endurance"],
    ["Manager",62000,31000,"endurance","intelligence"],
    ["Receptionist",10000,5000,"endurance","intelligence"],
    ["Marketer",62000,31000,"intelligence","endurance"],
    ["Human Resources",46500,23250,"endurance","intelligence"],
    ["Nutritionist",54500,27250,"intelligence","manual_labor"],
    ["Fitness Instructor",46500,23250,"manual_labor","endurance"]
  ].map(function (x) {
    return {name:x[0],requirements:{[x[3]]:x[1],[x[4]]:x[2]}};
  });
  let data = {schema:1, byCompany:{}, lastCompany:null};
  let companyId = null;
  let key = ""; // Optional session-only custom override; never persisted or exported.
  // Torn PDA replaces the exact marker in script source with its configured per-script
  // API key. No application key, personal key or placeholder is committed to GitHub.
  const PDA_APP_KEY = "###PDA-APIKEY###";
  function hasPdaKey() {return /^[A-Za-z0-9]{16,64}$/.test(PDA_APP_KEY);}
  function activeApiKey(){return key || (hasPdaKey()?PDA_APP_KEY:"");}
  let staffView="positions",trainingView="queue",growthView="performance",advancedSettings=false,selectedEmployee=null,financeFocus="profit",paymentViewLimit=35;
  let tab = "overview", open = false, busy = false, message = "", severity = "";
  let launcherDragged = false;
  const esc = function (value) {return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});};
  const money = function (v) {return v == null || !Number.isFinite(Number(v)) ? "Unknown" : "$" + Math.round(Number(v)).toLocaleString("en-US");};
  const num = function (v) {return Number.isFinite(Number(v)) ? Number(v) : 0;};
  const day = function (ts) {return ts ? new Date(Number(ts) * 1000).toISOString().slice(0,10) : "Unknown";};
  const stamp = function () {return Math.floor(Date.now()/1000);};
  const id = function () {return "local:" + Date.now() + ":" + Math.random().toString(36).slice(2,10);};
  const current = function () {
    if (!companyId) return null;
    if (!data.byCompany[companyId]) data.byCompany[companyId] = {profile:null,staff:[],stock:[],roles:[],snapshots:[],payments:[],training:[],news:[],logs:[],logTypes:"",archived:[],newsCursor:null,logCursor:null,whatIf:{},lossLimit:500000};
    return data.byCompany[companyId];
  };
  async function persist() {
    if (typeof PDA_storage === "undefined") throw Error("Torn PDA storage unavailable; changes were not saved.");
    data.lastCompany = companyId;
    await PDA_storage.set(STORE, data);
  }
  function assertArray(v) {return Array.isArray(v) ? v : [];}
  async function read(path, params) {
    const requestKey=activeApiKey();
    if (!requestKey) throw Error("No API key is available. Configure Torn PDA's app API key or enter a session-only custom key in Settings.");
    if (typeof PDA_httpGet !== "function") throw Error("PDA_httpGet is unavailable. Run this in Torn PDA.");
    // Never accept an arbitrary URL or a path returned by remote data.
    if (!/^(company\/(profile|employees|stock|news)|torn\/[0-9]+\/companies|torn\/logtypes|user\/log)$/.test(path)) throw Error("Blocked API route.");
    const q = new URLSearchParams(params || {});
    const response = await PDA_httpGet(API + path + (q.toString() ? "?" + q : ""), {Authorization:"ApiKey " + requestKey});
    if (!response || response.status !== 200) throw Error("Torn API request failed (HTTP " + (response && response.status) + ").");
    const json = JSON.parse(response.responseText);
    if (json.error) {
      const code=Number(json.error.code);
      if(path==="user/log" && code===16)
        throw Error("Payment import requires a custom API key with user/log permission, scoped to incoming player money. Torn rejected the current key.");
      throw Error("Torn API: " + String(json.error.error || json.error.code || "unknown error"));
    }
    return json;
  }
  function companyType(p) {return p && p.type && p.type.id;}
  function roleList(c) {
    if (c.roles.length) return c.roles;
    return companyType(c.profile) && /fitness center/i.test(String(c.profile.type.name || "")) ? rolesFallback : [];
  }
  function normalizeRoles(raw, typeId) {
    const bag = assertArray(raw.companies) .concat(Object.values(raw.companies && !Array.isArray(raw.companies) ? raw.companies : {}));
    const found = bag.find(function (v) {return Number(v && (v.id || v.type || v.company_type)) === Number(typeId);});
    const positions = assertArray(found && found.positions);
    return positions.map(function (p) {return {name:p.name,requirements:(p.working_stats && p.working_stats.required) || {}};}).filter(function (p) {return p.name;});
  }
  function score(person, role) {
    const requirements = Object.entries(role.requirements || {}).filter(function (x) {return num(x[1]) > 0;});
    if (!requirements.length || !person.stats) return null;
    const total = requirements.reduce(function (sum,x) {return sum + num(x[1]);}, 0);
    return requirements.reduce(function (sum,x) {return sum + Math.min(1,num(person.stats[x[0]])/num(x[1])) * num(x[1]);},0)/total*100;
  }
  function suggestions(c) {
    const roles=roleList(c),staff=assertArray(c.staff);
    if(!roles.length||!staff.length)return [];
    const protectedRoles=new Set(["Manager","Marketer","Cleaner","Human Resources"]);
    // A working-stat fit score alone cannot estimate company-wide revenue or
    // special position contributions. Preserve existing coverage and suggest only
    // clearly stronger matches within non-special roles.
    const candidates=roles.filter(function(r){return !protectedRoles.has(r.name);});
    const counts={};
    staff.forEach(function(p){const name=p.position&&p.position.name;if(name)counts[name]=(counts[name]||0)+1;});
    return staff.map(function(p){
      const actual=p.position&&p.position.name,role=roles.find(function(r){return r.name===actual;});
      const currentScore=role?score(p,role):null;
      const best=candidates.map(function(r){return {name:r.name,points:score(p,r)};})
        .filter(function(x){return x.points!==null&&x.name!==actual;})
        .sort(function(a,b){return b.points-a.points;})[0];
      const bestPoints=best?best.points:null;
      // Avoid recommending that the final person leave a current job based on fit alone.
      const avoidLastSlot=counts[actual]===1;
      const recommend=!protectedRoles.has(actual)&&!avoidLastSlot&&currentScore!==null&&bestPoints!==null&&bestPoints>=currentScore+15;
      return {person:p,actual:actual,proposed:recommend?best.name:actual,currentScore:currentScore,
        nextScore:recommend?bestPoints:currentScore,recommend:recommend};
    });
  }

  function cleanNews(source) {
    return String(source||"").replace(/<[^>]*>/g," ").replace(/&(?:nbsp|amp|quot|lt|gt);/gi,function(v){
      return {"&nbsp;":" ","&amp;":"&","&quot;":'"',"&lt;":"<","&gt;":">"}[v.toLowerCase()]||" ";
    }).replace(/\s+/g," ").trim();
  }
  function matchTrainingNews(news,c) {
    const raw=String(news.text||""), text=cleanNews(raw);
    if(!/\btrain(?:ed|ing)?\b/i.test(text)) return {status:"review",reason:"Training action not identified"};
    const candidates=[], seen={};
    (c.staff||[]).concat(c.archived||[]).forEach(function(p){
      if (!p || !p.id || !p.name || seen[p.id]) return;
      seen[p.id]=true;
      const escaped=String(p.name).replace(/[^a-zA-Z0-9_]/g,function(ch){return String.fromCharCode(92)+ch;});
      const re=new RegExp("(^|[^A-Za-z0-9_-])"+escaped+"(?=$|[^A-Za-z0-9_-])","i");
      if(re.test(text)) candidates.push(p);
    });
    let recipient=null;
    const targeted=candidates.filter(function(p){
      const escaped=String(p.name).replace(/[^a-zA-Z0-9_]/g,function(ch){return String.fromCharCode(92)+ch;});
      return new RegExp("\\btrained?\\s+(?:employee\\s+)?"+escaped+"(?=$|\\W)","i").test(text) ||
        new RegExp("(^|\\W)"+escaped+"\\s+(?:was\\s+trained|has\\s+been\\s+trained|received\\s+(?:a\\s+)?train)","i").test(text) ||
        new RegExp("\\b(?:training\\s+(?:for|to)|train\\s+given\\s+to)\\s+"+escaped+"(?=$|\\W)","i").test(text);
    });
    if(targeted.length===1) recipient=targeted[0];
    // A lone employee name without recipient language is not reliable enough to debit training.
    if(!recipient) return {status:"review",reason:candidates.length>1?"Multiple employees mentioned":"Employee not recognised"};
    const amount=text.match(/\btrained\s+(\d{1,2})\s+times\b/i) || text.match(/\b(\d{1,2})\s+training\s+sessions?\b/i);
    const units=amount?Number(amount[1]):1;
    if(units<1 || units>20) return {status:"review",reason:"Invalid training count"};
    return {status:"matched",playerId:Number(recipient.id),units:units,name:recipient.name};
  }
  function reconcileTraining(c) {
    let matched=0,review=0;
    c.news.forEach(function(n){
      if(c.training.some(function(t){return canonicalTrainingSource(t)==="news:"+n.id;}))return;
      const result=matchTrainingNews(n,c);
      if(result.status!=="matched"){n.matchStatus="review";n.matchReason=result.reason;review++;return;}
      c.training.push({id:"news:auto:"+n.id,playerId:result.playerId,units:result.units,ts:n.timestamp,
        sourceId:"news:"+n.id,source:"company-news-auto",confirmed:true});
      n.matchStatus="matched";n.matchedPlayerId=result.playerId;matched++;
    });
    return {matched:matched,review:review};
  }
  function findMoneyTypes(raw) {
    return assertArray(raw.logtypes).filter(function(t){
      return t && Number.isSafeInteger(Number(t.id)) && incomingTitle(t.title);
    }).map(function(t){return {id:Number(t.id),title:String(t.title)};}).slice(0,20);
  }

  function priceTrains(amount) {
    if(!Number.isSafeInteger(amount)||amount<=0)return null;
    const rem=amount%1000000;
    return rem%250000===0 ? Math.floor(amount/1000000)*5+rem/250000:null;
  }
  function incomingTitle(title) {
    const t=String(title||"").toLowerCase();
    return /\b(money|cash)\b/.test(t) && /\b(receive|received|incoming)\b/.test(t) &&
      !/\b(sent|outgoing|company|faction|bank|trade|vault|bazaar|market|mug)\b/.test(t);
  }
  function parseIncomingLog(log,c) {
    const title=String(log.details && log.details.title || log.title || "");
    if(!incomingTitle(title)) return {status:"review",reason:"This is not clearly an incoming personal transfer."};
    const raw=[log.data,log.params].filter(function(x){return x && typeof x==="object" && !Array.isArray(x);});
    const staff=(c.staff||[]).concat(c.archived||[]);
    const senders=new Set(),amounts=new Set();
    const fromKeys=["sender","sender_id","sender_user","sender_user_id","from","from_id","from_user","from_user_id",
      "other_user","other_user_id","source_user","source_user_id","player_from","player_from_id"];
    const moneyKeys=["money","amount","cash","money_received","amount_received","money_amount","money_sent"];
    const parseId=function(v){
      const raw=v && typeof v==="object"?(v.id || v.user_id || v.player_id):v;
      if (/^[1-9][0-9]*$/.test(String(raw)) && Number.isSafeInteger(Number(raw))) return Number(raw);
      if(typeof raw==="string") {
        const found=staff.filter(function(p){return String(p.name||"").toLowerCase()===raw.trim().toLowerCase();});
        if(found.length===1)return Number(found[0].id);
      }
      return null;
    };
    const parseAmount=function(v){
      const raw=typeof v==="string"?v.replace(/[$,\s]/g,""):v;
      if ((typeof raw==="number" && Number.isSafeInteger(raw)) ||
          (typeof raw==="string" && /^[0-9]+$/.test(raw))) {
        const n=Number(raw);
        return Number.isSafeInteger(n) && n>0 ? n : null;
      }
      return null;
    };
    raw.forEach(function(part){
      // Only fields that clearly describe the sender are trusted. "user_id"
      // by itself may be the director's own ID, and is never enough.
      fromKeys.forEach(function(k){
        if(!Object.prototype.hasOwnProperty.call(part,k))return;
        const candidate=parseId(part[k]);
        if(candidate!==null)senders.add(candidate);
      });
      moneyKeys.forEach(function(k){
        if(!Object.prototype.hasOwnProperty.call(part,k))return;
        const candidate=parseAmount(part[k]);
        if(candidate!==null)amounts.add(candidate);
      });
    });
    if(senders.size!==1)return {status:"review",reason:senders.size>1?"Conflicting sender IDs":"Torn did not identify the sender"};
    const sender=Array.from(senders)[0];
    if(!staff.some(function(p){return Number(p.id)===sender;}) )return {status:"review",reason:"Money came from a player outside the current/archived staff",senderId:sender};
    if(amounts.size!==1)return {status:"review",reason:amounts.size>1?"Different payment amounts reported":"Amount not present in log",senderId:sender};
    const amount=Array.from(amounts)[0],trains=priceTrains(amount);
    if(trains===null)return {status:"review",reason:"Partial or non-standard amount: choose the number of trains",senderId:sender,amount:amount};
    return {status:"matched",playerId:sender,amount:amount,trains:trains};
  }
  function canonicalTrainingSource(t) {
    if (t.sourceId) return String(t.sourceId).replace(/^company-news:/,"news:");
    if (/^news:auto:/.test(String(t.id||""))) return "news:"+String(t.id).slice(10);
    if (/^news:/.test(String(t.id||""))) return String(t.id);
    return null;
  }
  function uniqueTrainingEvents(c) {
    const seen=new Set();
    return (c.training||[]).filter(function(t){
      if(t.voided)return false;
      const source=canonicalTrainingSource(t);
      if(!source)return true;
      if(seen.has(source))return false;
      seen.add(source);return true;
    });
  }

  function isApprovedLogPayment(p){
    // Legacy auto-classified transfers are evidence of cash received, not proof
    // that the sender purchased training. Never count them without review.
    return Boolean(p && !p.voided && p.confirmed===true && p.source!=="log-auto");
  }
  function isApprovedLog(c,logId){
    return (c.payments||[]).some(function(p){
      return p.sourceId==="log:"+String(logId) && isApprovedLogPayment(p);
    });
  }
  function pendingPaymentLogs(c){
    return (c.logs||[]).filter(function(n){
      return n.matchStatus!=="ignored" && !isApprovedLog(c,n.id);
    });
  }
  function migrateAutoPaymentClaims(c){
    let flagged=0;
    (c.payments||[]).forEach(function(p){
      if(p && !p.voided && p.source==="log-auto" && p.confirmed!==false){
        p.confirmed=false;
        p.reviewRequired=true;
        p.reviewReason="Automatic sender/amount matching did not verify training purpose.";
        const logId=String(p.sourceId||"").replace(/^log:/,"");
        const existing=(c.logs||[]).find(function(n){return String(n.id)===logId;});
        if(existing && (!existing.suggestion || existing.suggestion.status!=="matched")) {
          existing.suggestion={status:"matched",playerId:p.playerId,senderId:p.playerId,amount:p.amount,trains:p.trains};
        }
        flagged++;
      }
    });
    (c.logs||[]).forEach(function(n){
      if(n.matchStatus!=="ignored" && !isApprovedLog(c,n.id)){
        n.matchStatus="review";
        const old=(c.payments||[]).some(function(p){
          return !p.voided && p.source==="log-auto" && p.sourceId==="log:"+n.id;
        });
        if(old)n.matchReason="Previously auto-credited; confirm whether this was actually a training purchase.";
      }
    });
    return flagged;
  }
  function uniquePaymentEvents(c){
    const seen=new Set();
    return (c.payments||[]).filter(function(p){
      if(!isApprovedLogPayment(p))return false;
      const source=p.sourceId?String(p.sourceId):null;
      if(!source)return true;
      if(seen.has(source))return false;
      seen.add(source);
      return true;
    });
  }
  function repairAllSavedCompanyDuplicates(records) {
    let fixed=0;
    Object.values(records||{}).forEach(function(c){
      if(c && Array.isArray(c.training))fixed+=repairImportDuplicates(c);
    });
    return fixed;
  }
  function normaliseNewsResponse(raw) {
    const records=Array.isArray(raw)?raw:Object.entries(raw||{}).map(function(pair){
      return Object.assign({id:pair[0]},pair[1]);
    });
    const used=new Set();
    return records.filter(function(n){
      if(!n || n.id===undefined || !Number.isFinite(Number(n.timestamp)))return false;
      const key=String(n.id);
      if(used.has(key))return false;
      used.add(key);return true;
    });
  }
  function repairImportDuplicates(c) {
    let repaired=0;const seen=new Set();
    (c.training||[]).forEach(function(t){
      if(t.voided)return;
      const source=canonicalTrainingSource(t);
      if(!source)return;
      if(seen.has(source)){t.voided=true;t.voidedAt=stamp();t.voidReason="Duplicate source ID";repaired++;}
      else seen.add(source);
    });
    ["news","logs"].forEach(function(field){
      const ids=new Set();
      c[field]=(c[field]||[]).filter(function(n){
        const key=String(n.id||"");
        if(!key||ids.has(key))return false;
        ids.add(key);return true;
      });
    });
    return repaired;
  }

  function applyMatchedPayments(c) {
    // Match sender/amount to a candidate automatically; human review determines
    // whether an actual purchase occurred. Prices alone are not payment purpose.
    let suggested=0,review=0;
    (c.logs||[]).forEach(function(n){
      if(n.matchStatus==="ignored" || isApprovedLog(c,n.id))return;
      const guess=n.suggestion||{status:"review",reason:"Re-import to identify the sender and amount."};
      n.matchStatus="review";
      if(guess.status==="matched") {
        n.matchReason="Sender and amount identified; training purpose unverified.";
        suggested++;
      } else {
        n.matchReason=guess.reason||"Please review this payment.";
        review++;
      }
    });
    return {suggested:suggested,review:review};
  }
  function aggregates(c) {
    const balance={}, people={};
    c.staff.concat(c.archived || []).forEach(function (p) {people[p.id]=p.name;});
    uniquePaymentEvents(c).forEach(function (p) {
      const x=balance[p.playerId] || (balance[p.playerId]={purchased:0,delivered:0,owed:0,credit:0,oldest:null});
      x.purchased+=num(p.trains);
      people[p.playerId]=people[p.playerId] || "Player #" + p.playerId;
    });
    uniqueTrainingEvents(c).forEach(function (t) {
      const x=balance[t.playerId] || (balance[t.playerId]={purchased:0,delivered:0,owed:0,credit:0,oldest:null});
      x.delivered+=num(t.units);
      people[t.playerId]=people[t.playerId] || "Player #" + t.playerId;
    });
    Object.keys(balance).forEach(function (k) {
      const b=balance[k];
      b.owed=Math.max(0,b.purchased-b.delivered);
      b.credit=Math.max(0,b.delivered-b.purchased);
      let remaining=b.delivered;
      uniquePaymentEvents(c).filter(function (p) {return String(p.playerId) === k;}).sort(function (a,b) {return a.ts-b.ts;}).forEach(function (p) {
        const unmet=Math.max(0,num(p.trains)-remaining);
        remaining=Math.max(0,remaining-num(p.trains));
        if (unmet && b.oldest === null) b.oldest=p.ts;
      });
    });
    return {balance:balance,people:people};
  }

  function financialAmount(value) {
    if(typeof value!=="number" && (typeof value!=="string" || !/^\d+(?:\.\d+)?$/.test(value.trim())))return null;
    const n=Number(value);
    return Number.isFinite(n) && n>=0 && Number.isSafeInteger(n)?n:null;
  }
  function accounting(c){
    if(!c || !c.profile)return null;
    const revenue=financialAmount(c.profile.income && c.profile.income.daily);
    const budget=financialAmount(c.profile.advertisement_budget);
    const wagesList=(c.staff||[]).map(function(p){return financialAmount(p.wage);});
    const hired=financialAmount(c.profile.employees && c.profile.employees.hired);
    const hasRoster=hired===null || hired===wagesList.length;
    const wages=hasRoster && wagesList.every(function(v){return v!==null})
      ?wagesList.reduce(function(a,b){return a+b;},0):null;
    const known=revenue!==null && budget!==null && wages!==null;
    const profit=known?revenue-wages-budget:null;
    const headroom=known?profit+num(c.lossLimit):null;
    const missing=[];
    if(revenue===null)missing.push("reported daily income");
    if(wages===null)missing.push(hasRoster?"employee wages":"complete employee roster");
    if(budget===null)missing.push("advertising budget");
    return {revenue:revenue,wages:wages,ad:budget,profit:profit,headroom:headroom,
      known:known,missing:missing,hasRevenue:revenue!==null,hasWages:wages!==null,
      hasBudget:budget!==null};
  }

  function companyDataQuality(c) {
    const a=accounting(c),results=[],now=Date.now();
    if(!a)return {status:"unavailable",results:[{label:"Company profile",state:"missing",note:"Refresh company data."}]};
    if(a.missing.length)results.push({label:"Financial inputs",state:"incomplete",note:"Missing: "+a.missing.join(", ")+". Estimated operating result is withheld."});
    else results.push({label:"Financial inputs",state:"complete",note:"Revenue, staff wages and advertising present. Other operating costs may still be excluded."});
    const refresh=Date.parse(c.lastRefresh||"");
    if(!Number.isFinite(refresh))results.push({label:"Data freshness",state:"incomplete",note:"No successful company refresh recorded."});
    else{
      const hours=Math.max(0,(now-refresh)/3600000);
      results.push({label:"Data freshness",state:hours>=24?"stale":"recent",note:hours<1?"Updated within the last hour.":"Last company refresh "+Math.floor(hours)+" hour(s) ago."});
    }
    const reviewed=(c.payments||[]).filter(function(p){return !p.voided&&p.source==="log-auto";}).length;
    if(reviewed)results.push({label:"Legacy money imports",state:"review",note:reviewed+" previously auto-classified payment(s) await confirmation of training purpose."});
    const unseen=pendingPaymentLogs(c).length;
    if(unseen)results.push({label:"Imported transfers",state:"review",note:unseen+" unconfirmed transfer(s); none are counted as purchased training."});
    const historical=(c.news||[]).filter(function(n){
      return !c.training.some(function(t){return !t.voided&&canonicalTrainingSource(t)==="news:"+n.id;});
    }).length;
    if(historical)results.push({label:"Training history",state:"review",note:historical+" imported news item(s) need recipient verification."});
    return {status:results.some(function(r){return r.state==="incomplete"||r.state==="review"||r.state==="stale";})?"review":"checked",results:results};
  }
  function companyActionList(c){
    if(!c||!c.profile)return [];
    const a=accounting(c),result=[];
    function add(level,title,why,confidence,target){result.push({level:level,title:title,why:why,confidence:confidence,target:target});}
    if(!a.known)add("urgent","Complete your financial inputs",
      "Missing "+a.missing.join(", ")+". Spending headroom and loss-limit checks are deliberately unavailable.","High · missing fields","growth-accounts");
    else if(a.headroom<0)add("urgent","Check operating losses",
      "Current reported revenue minus wages and advertising is "+money(-a.headroom)+" beyond your $"+num(c.lossLimit).toLocaleString("en-US")+" daily loss allowance.","High · current reported figures","growth-accounts");
    const pending=pendingPaymentLogs(c).length;
    if(pending)add("review","Confirm the purpose of "+pending+" money transfer"+(pending===1?"":"s"),
      "Sender and amount may be known, but this does not prove a training purchase. Purchases are not credited before approval.","High · unverified purchase purpose","training-payments");
    const news=(c.news||[]).filter(function(n){
      return !c.training.some(function(t){return !t.voided&&canonicalTrainingSource(t)==="news:"+n.id;});
    }).length;
    if(news)add("review","Reconcile "+news+" training history item"+(news===1?"":"s"),
      "Employee or training count needs confirmation before being included in the ledger.","High · unmatched source records","training-history");
    const staleHours=Number.isFinite(Date.parse(c.lastRefresh||""))?Math.max(0,(Date.now()-Date.parse(c.lastRefresh))/3600000):Infinity;
    if(staleHours>=24)add("review","Refresh before acting on staff or spending advice",
      "Your saved roster and financial figures are "+(Number.isFinite(staleHours)?Math.floor(staleHours)+" hours old":"not yet available")+". Decisions based on stale data may be misleading.","High · data freshness","refresh");
    const balances=aggregates(c).balance;
    const eligible=Object.keys(balances).filter(function(k){
      const p=c.staff.find(function(x){return String(x.id)===k;});
      return p && num(p.days_in_company)>=3 && balances[k].owed>0;
    }).sort(function(a,b){return (balances[a].oldest||Infinity)-(balances[b].oldest||Infinity);});
    if(eligible.length){
      const player=c.staff.find(function(p){return String(p.id)===eligible[0];});
      add("next","Next eligible training commitment",
        player.name+" is owed "+balances[eligible[0]].owed+" train(s). The oldest eligible obligation is prioritised; this is not a projected stat gain.",
        "High · confirmed ledger","training-queue");
    }
    if(a.known && a.headroom>=0 && staleHours<24){
      const allowance=Math.max(0,a.headroom);
      add("next","Spending headroom is "+money(allowance)+" at current income",
        "This is a cost-only ceiling, not permission to spend: changing advertising, wages or prices can change income. Compare several observed days before experimenting.",
        "Medium · current revenue assumption","growth-pricing");
    }
    const rank={urgent:0,review:1,next:2};
    return result.sort(function(x,y){return rank[x.level]-rank[y.level];}).slice(0,6);
  }
  function actionPanelV3(c) {
    const actions=companyActionList(c),quality=companyDataQuality(c);
    return '<section class="tch-panel"><div class="tch-sectionhead"><h2>Your next decisions</h2><span class="tch-mini">'+actions.length+' items</span></div>'+
      '<p>Ranked checks based on saved data. No automatic company changes and no unsupported profit forecasts.</p>'+
      (actions.length?actions.map(function(r){
        return '<button type="button" class="tch-insight" data-act="goto" data-target="'+esc(r.target)+'">'+
          '<strong>'+esc(r.title)+'</strong><small>'+esc(r.why)+'</small><small class="tch-evidence">'+esc(r.confidence)+'</small><span>↗</span></button>';
      }).join(""):'<div class="tch-empty">No priority exceptions detected. This does not establish that your current staffing or advertising is optimal.</div>')+
      '</section><section class="tch-panel"><div class="tch-sectionhead"><h2>Data confidence</h2><span class="tch-mini">'+esc(quality.status)+'</span></div>'+
      quality.results.map(function(r){
        return '<div class="tch-quality"><div><strong>'+esc(r.label)+'</strong><small>'+esc(r.note)+'</small></div>'+
        '<span class="tch-mini '+(r.state==="complete"||r.state==="recent"?"good":"warn")+'">'+esc(r.state)+'</span></div>';
      }).join("")+'</section>';
  }
  const style=document.createElement("style"); style.id="tch-css";
  style.textContent="#tch-open{position:fixed;right:16px;bottom:72px;z-index:2147483645;background:#1d8b81;color:white;border:0;border-radius:24px;padding:12px 17px;font-weight:800;box-shadow:0 5px 20px #000a}#tch-root{position:fixed;inset:0;z-index:2147483646;background:#0e141e;color:#eef5fa;overflow:auto;font:14px/1.45 system-ui,Arial,sans-serif;padding:env(safe-area-inset-top) 0 env(safe-area-inset-bottom)}#tch-root *{box-sizing:border-box}#tch-root header{position:sticky;top:0;background:#151f2d;border-bottom:1px solid #354257;padding:14px 16px;display:flex;justify-content:space-between;align-items:center;z-index:1}#tch-root main{padding:12px;max-width:1100px;margin:auto}#tch-root h2{font-size:17px;margin:15px 0 8px}#tch-root h3{font-size:15px;margin:4px 0 10px}#tch-root p{margin:8px 0;color:#b6c7d7}#tch-root .muted{font-size:12px;color:#a1b4c6}#tch-root .nav{display:flex;gap:6px;overflow-x:auto;padding:9px 12px;background:#141e2b}#tch-root button,#tch-root select,#tch-root input,#tch-root textarea{font:inherit}#tch-root button{background:#273a50;border:1px solid #45617a;color:#f2faff;border-radius:9px;padding:9px 11px;cursor:pointer}#tch-root button.primary,#tch-root .nav button.active{background:#13877e;border-color:#22aaa0}#tch-root button:disabled{opacity:.5}#tch-root .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}#tch-root .card{background:#192637;border:1px solid #30465a;border-radius:12px;padding:13px;margin-bottom:10px;min-width:0}#tch-root .value{font-size:22px;font-weight:800;word-break:break-word}#tch-root .good{color:#57dab3}#tch-root .bad{color:#ff8585}#tch-root .warn{color:#ffcf7c}#tch-root .tag{background:#243a4f;border-radius:5px;padding:2px 5px}#tch-root table{border-collapse:collapse;width:100%;min-width:510px}#tch-root th,#tch-root td{border-bottom:1px solid #334558;text-align:left;padding:10px 7px}#tch-root th{color:#a7bdcf;font-weight:600}#tch-root .scroll{overflow:auto}#tch-root input,#tch-root select,#tch-root textarea{background:#101b28;color:#fff;border:1px solid #4b6279;border-radius:7px;padding:10px;max-width:100%;min-width:0}#tch-root input[type=number]{width:130px}#tch-root label{display:block;margin:9px 0 5px}#tch-root .row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}#tch-root .pill{background:#34485d;padding:4px 8px;border-radius:20px}#tch-root .notice{padding:11px;border:1px solid #876f41;background:#393220;border-radius:9px;margin:10px 0}#tch-root .actions{display:flex;gap:7px;flex-wrap:wrap}#tch-root .bar{height:8px;background:#314559;border-radius:6px;overflow:hidden}#tch-root .bar b{display:block;height:100%;background:#1fc5ad}#tch-root .spacer{height:12px}@media(min-width:750px){#tch-root .grid{grid-template-columns:repeat(4,minmax(0,1fr))}#tch-root main{padding:20px}}";

  style.textContent += "#tch-root .tch-evidence{color:#7cead3;font-weight:750}#tch-root .tch-quality{display:flex;gap:8px;align-items:center;justify-content:space-between;padding:11px 1px;border-bottom:1px solid #4a6279}#tch-root .tch-quality>div{flex:1}#tch-root .tch-quality strong,#tch-root .tch-quality small{display:block}#tch-root .tch-quality small{font-size:11px;color:#c9d9e7}#tch-root .tch-metric{text-align:left;cursor:pointer;width:100%;font:inherit;color:inherit}#tch-root .tch-metric:focus-visible{outline:3px solid #64e5d5}#tch-root{color-scheme:dark;color:#f6f9fd;background:#101923;font-size:15px;line-height:1.55;-webkit-font-smoothing:antialiased}#tch-root .card{background:#25384c;border-color:#52708a;box-shadow:0 2px 10px #0003}#tch-root header,#tch-root .nav{background:#1c2b3d;border-color:#425d76}#tch-root h2,#tch-root h3,#tch-root strong{color:#fff}#tch-root p,#tch-root .muted,#tch-root .card .muted{color:#d1e2f1}#tch-root th{color:#e0edf7;background:#2b4055}#tch-root td{color:#f1f6fb;border-color:#58718a}#tch-root table tr:nth-child(even){background:#30465d}#tch-root button{color:#fff;background:#345673;border:1px solid #7592aa;font-weight:650;min-height:43px}#tch-root button.primary,#tch-root .nav button.active{background:#087e7b;border-color:#50d9c3}#tch-root .nav button{white-space:nowrap}#tch-root button:focus-visible,#tch-root input:focus-visible,#tch-root select:focus-visible{outline:3px solid #5ae5d1;outline-offset:2px}#tch-root input,#tch-root select,#tch-root textarea{background:#142536;border:1px solid #8aa3b8;color:#fff;min-height:44px}#tch-root input::placeholder,#tch-root textarea::placeholder{color:#c2d5e5;opacity:1}#tch-root .notice{background:#433b28;border:1px solid #b9a16b;color:#fff}#tch-root .warn{color:#ffe2a1}#tch-root .good{color:#84f5d4}#tch-root .bad{color:#ffb0b0}#tch-root .check{display:flex;align-items:center;gap:12px;border-top:1px solid #52708a;padding:10px 0}#tch-root .check input{min-height:18px;width:20px;height:20px;flex-shrink:0}#tch-root .card .card{background:#2f445a}#tch-root .row{gap:10px}#tch-root .row > input,#tch-root .row > select{flex:1 1 150px}#tch-root .scroll{border-radius:8px}#tch-root [hidden]{display:none!important}";
  style.textContent += "#tch-open{bottom:auto;right:auto;left:16px;top:calc(100dvh - 125px);touch-action:none;user-select:none;-webkit-user-select:none;cursor:grab}#tch-open:active{cursor:grabbing}";
  style.textContent+="#tch-open{touch-action:none;-webkit-user-select:none;user-select:none;cursor:grab}#tch-open:active{cursor:grabbing}#tch-open[hidden],#tch-root[hidden]{display:none!important}";

  style.textContent += "#tch-root{font-family:system-ui,-apple-system,Arial,sans-serif;background:#101923;color:#f4f7fb}#tch-root .tch-main{padding:16px 13px 118px;max-width:760px;margin:0 auto}#tch-root .tch-top{height:auto;min-height:76px;padding:12px 15px;gap:8px}#tch-root .tch-headline{flex:1;min-width:0}#tch-root .tch-headline strong{display:block;font-size:20px;line-height:1.2}#tch-root .tch-eyebrow{letter-spacing:.09em;font-size:10px;color:#6af0d7;font-weight:700}#tch-root .tch-timestamp{font-size:11px;color:#c0d5e5;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}#tch-root .tch-iconbtn{min-width:40px;padding:7px;font-size:21px;border-radius:12px}#tch-root .tch-bottom{position:fixed;bottom:0;left:0;right:0;background:#152639;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));z-index:3;border-top:1px solid #4b6a85;padding:7px 5px calc(env(safe-area-inset-bottom) + 8px);box-shadow:0 -9px 25px #050c1599}#tch-root .tch-bottom button{border:0;display:flex;flex-direction:column;gap:2px;align-items:center;background:transparent;color:#c7d7e5;border-radius:10px;min-height:56px;padding:3px;font-size:11px}#tch-root .tch-bottom button.active{background:#284d57;color:#f0fffc}#tch-root .tch-navicon{font-size:23px;height:27px}#tch-root .tch-hero{background:linear-gradient(128deg,#153d4b,#1b314e 65%,#172a3e);border:1px solid #446f7d;border-radius:17px;padding:18px;margin-bottom:13px}#tch-root .tch-kicker{color:#72f1da;font-size:11px;font-weight:800;letter-spacing:.1em}#tch-root .tch-hero-line{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:8px 0 15px}#tch-root .tch-hero-line strong{font-size:22px;line-height:1.2}#tch-root .tch-rating{background:#16736f;border-radius:9px;padding:6px 10px;font-weight:800;white-space:nowrap}#tch-root .tch-progress{height:8px;background:#355368;border-radius:50px;overflow:hidden;margin:0 0 12px}#tch-root .tch-progress b{height:100%;display:block;background:#37dfc1}#tch-root .tch-hero small{color:#cbdce8}#tch-root .tch-metrics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:12px 0}#tch-root .tch-metric{background:#263b51;border:1px solid #496882;border-radius:13px;padding:14px;min-width:0;display:flex;flex-direction:column;gap:7px}#tch-root .tch-metric>strong{font-size:22px;letter-spacing:-.02em;overflow-wrap:anywhere}#tch-root .tch-metric>small{font-size:11px;color:#c5d7e6}#tch-root .tch-metric.tch-danger{border-color:#ff7979;background:#49353f}#tch-root .tch-metric.tch-positive{border-color:#468b86}#tch-root .tch-panel{background:#203247;border:1px solid #47627b;border-radius:14px;padding:15px;margin:12px 0}#tch-root .tch-panel h2,#tch-root .tch-section h2{font-size:18px;margin:0 0 8px}#tch-root .tch-section{margin:12px 2px 18px}#tch-root .tch-section p{margin:4px 0 12px}#tch-root .tch-sectionhead,#tch-root .tch-personhead{display:flex;align-items:center;justify-content:space-between;gap:9px}#tch-root .tch-mini{font-size:11px;letter-spacing:.02em;color:#c0dbe8;background:#325069;border-radius:7px;padding:5px 8px}#tch-root .tch-priority{display:flex;align-items:center;gap:12px;margin-top:9px;border:1px solid #536980;background:#2b4058;padding:12px;border-radius:11px}#tch-root .tch-priority>span{height:30px;min-width:30px;border-radius:9px;display:grid;place-items:center;background:#385e6a;color:#b5ffe6;font-weight:800}#tch-root .tch-priority.warning>span{background:#846735;color:#fff}#tch-root .tch-priority.danger>span{background:#9c4755;color:#fff}#tch-root .tch-priority>div{flex:1;min-width:0}#tch-root .tch-priority strong,#tch-root .tch-priority small{display:block}#tch-root .tch-priority small{font-size:11px;color:#cad9e7}#tch-root .tch-priority button{font-size:12px;min-height:36px}#tch-root .tch-actiongrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}#tch-root .tch-actiongrid button{text-align:left;min-height:72px;padding:11px;background:#304b64}#tch-root .tch-actiongrid button span{display:block;font-size:11px;color:#c1d6e6}#tch-root .tch-actionrow{display:flex;align-items:center;flex-wrap:wrap;gap:9px;margin:10px 0}#tch-root .tch-switch{display:flex;gap:5px;padding:4px;background:#1f334a;border:1px solid #405d75;border-radius:12px;overflow-x:auto;scrollbar-width:none}#tch-root .tch-switch button{flex:1;white-space:nowrap;min-height:38px;padding:8px;border:none;background:transparent;font-size:12px}#tch-root .tch-switch button.active{background:#0b8079;color:#fff}#tch-root .tch-person,#tch-root .tch-review{background:#263b50;border:1px solid #476983;border-radius:13px;padding:13px;margin:10px 0}#tch-root .tch-personhead{justify-content:flex-start}#tch-root .tch-personhead>div:nth-child(2){flex:1}#tch-root .tch-personhead strong,#tch-root .tch-personhead small{display:block}#tch-root .tch-personhead small{font-size:12px;color:#c6d8e8}#tch-root .tch-avatar{width:39px;height:39px;border-radius:12px;background:#116963;display:grid;place-items:center;font-weight:800;font-size:17px}#tch-root .tch-eff{background:#344b64;border-radius:8px;padding:6px;font-size:17px;font-weight:800}#tch-root .tch-eff small{font-size:9px;color:#d5e7f2}#tch-root .tch-recommend{display:flex;align-items:center;gap:9px;margin:12px 0;padding:8px;background:#1d3348;border-radius:9px;flex-wrap:wrap}#tch-root .tch-recommend span{font-size:11px;color:#d5e2ec}#tch-root .tch-recommend strong{font-size:14px}#tch-root .tch-recommend.highlight strong{color:#5ce8ce}#tch-root .tch-recommend small{color:#c6d9e6}#tch-root .tch-statstrip{display:flex;gap:7px;flex-wrap:wrap;margin:10px 0;color:#c5d7e5;font-size:11px}#tch-root .tch-statstrip span{padding:5px 7px;background:#304962;border-radius:7px}#tch-root .tch-statstrip b{color:#fff}#tch-root .tch-whatif{display:flex;align-items:center;justify-content:space-between;gap:12px}#tch-root .tch-whatif select{flex:1;max-width:220px}#tch-root .tch-hint{font-size:12px;color:#c4d7e6;margin:12px 0}#tch-root .tch-queueitem,#tch-root .tch-record{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:13px 1px;border-bottom:1px solid #456077}#tch-root .tch-queueitem>div:first-child,#tch-root .tch-record>div:first-child{flex:1}#tch-root .tch-queueitem strong,#tch-root .tch-queueitem small,#tch-root .tch-record strong,#tch-root .tch-record small{display:block}#tch-root .tch-queueitem small,#tch-root .tch-record small{font-size:11px;color:#cbd9e6}#tch-root .tch-queueitem b{font-size:22px;color:#8af1d8}#tch-root .tch-queueitem>div:last-child{text-align:right}#tch-root .tch-record>div:last-child{text-align:right}#tch-root .tch-record button{display:block;margin-left:auto;min-height:34px}#tch-root .tch-fieldrow{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}#tch-root .tch-fieldrow>select,#tch-root .tch-fieldrow>input,#tch-root .tch-fieldrow>label{flex:1 1 110px;min-width:0}#tch-root .tch-fieldrow>label input{display:block;width:100%;margin-top:5px}#tch-root .tch-empty{padding:20px;text-align:center;border-radius:9px;background:#2b445b;color:#d6e4ed}#tch-root .tch-minikpis{display:flex;gap:10px;margin:13px 0}#tch-root .tch-minikpis span{background:#37536b;padding:7px 11px;border-radius:7px}#tch-root .tch-highlight-number{font-size:30px;font-weight:800}#tch-root .tch-welcome{padding:24px}#tch-root .tch-welcome h2{font-size:24px}#tch-root.theme-light{background:#f3f6f9;color:#182d43;color-scheme:light}#tch-root.theme-light .tch-panel,#tch-root.theme-light .tch-person,#tch-root.theme-light .tch-review,#tch-root.theme-light .tch-metric{background:#fff;color:#1d3246;border-color:#cbd9e5}#tch-root.theme-light .tch-top,#tch-root.theme-light .tch-bottom{background:#e7eff6;color:#193449}#tch-root.theme-light .tch-bottom button{color:#354c5e}#tch-root.theme-light .tch-bottom button.active{background:#c9eae4;color:#095f58}#tch-root.theme-light .tch-section p,#tch-root.theme-light .tch-panel p,#tch-root.theme-light .muted,#tch-root.theme-light small,#tch-root.theme-light strong,#tch-root.theme-light h2,#tch-root.theme-light .tch-timestamp{color:#263f51}#tch-root.theme-light input,#tch-root.theme-light select,#tch-root.theme-light textarea{background:#fff;color:#12263a;border-color:#7995aa}#tch-root.theme-light .tch-switch{background:#e1ebf3}#tch-root.theme-light .tch-switch button{color:#233b4b}#tch-root.theme-light .tch-switch button.active{background:#167d78;color:#fff}#tch-root.theme-light .tch-priority,#tch-root.theme-light .tch-recommend,#tch-root.theme-light .tch-statstrip span,#tch-root.theme-light .tch-queueitem{background:#eef3f7;color:#193244}#tch-root.theme-light .tch-hero{background:linear-gradient(135deg,#e1f6ef,#dceaf7);color:#193449}#tch-root.theme-light .tch-hero-line strong,#tch-root.theme-light .tch-hero small{color:#163647}#tch-root.theme-light .tch-eyebrow,#tch-root.theme-light .tch-kicker{color:#046b60}#tch-root.theme-light .tch-avatar{background:#a5ded2;color:#13463d}";

  style.textContent += "#tch-root .tch-clickable{cursor:pointer;text-align:left;position:relative;transition:transform .12s,border-color .12s;min-height:110px}#tch-root .tch-clickable:active{transform:scale(.98)}#tch-root .tch-clickable:focus-visible,#tch-root .tch-person-button:focus-visible{outline:3px solid #78efda;outline-offset:3px}#tch-root .tch-tilearrow{position:absolute;top:9px;right:11px;color:#8ff5de;font-size:16px}#tch-root .tch-metric.tch-clickable{display:flex;align-items:stretch;flex-direction:column;gap:7px;padding:14px;background:#263b51;color:#f5fbfc;border:1px solid #496882;white-space:normal}#tch-root .tch-metric.tch-clickable:hover{border-color:#4cdbc1}#tch-root .tch-metric.tch-clickable strong{font-size:22px}#tch-root .tch-hero.tch-hero-button{width:100%;display:block;border:1px solid #446f7d;color:#fff;padding:18px}#tch-root .tch-person-button{display:block;text-align:left;width:100%;border:0;background:transparent;padding:0;min-height:0}#tch-root .tch-person-button .tch-personhead{width:100%}#tch-root .tch-fitpair,#tch-root .tch-comparison{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin:12px 0}#tch-root .tch-fitpair>div,#tch-root .tch-comparison>div{background:#1b3346;border:1px solid #3d6473;border-radius:10px;padding:11px;min-width:0}#tch-root .tch-fitpair small,#tch-root .tch-comparison span{display:block;font-size:11px;color:#bed6e4}#tch-root .tch-fitpair strong,#tch-root .tch-comparison strong{display:block;font-size:23px;color:#73eacb;overflow-wrap:anywhere}#tch-root .tch-linkhint{font-size:12px;color:#7cedd2;display:block;margin-top:6px}#tch-root .tch-simrow{display:flex;gap:12px;align-items:center;justify-content:space-between;border-bottom:1px solid #426279;padding:13px 0}#tch-root .tch-simrow>button{background:transparent;text-align:left;flex:1;min-width:0;border:0;padding:7px;font-size:13px}#tch-root .tch-simrow>div{flex:2;min-width:0}#tch-root .tch-simrow select{width:100%}#tch-root .tch-fitcaption{display:block;color:#cbdfe8;font-size:11px}#tch-root .tch-change{padding:11px 0;border-bottom:1px solid #45677b;display:flex;flex-wrap:wrap;gap:7px;align-items:center}#tch-root .tch-change strong{flex:1;min-width:100px}#tch-root .tch-change span{font-size:12px;color:#c5dce6}#tch-root .tch-change b{white-space:nowrap}#tch-root .tch-roleline{display:flex;justify-content:space-between;gap:8px;padding:11px 0;border-bottom:1px solid #44677e}#tch-root .tch-roleline span{color:#cfe0e9}#tch-root .tch-requirement{margin:12px 0}#tch-root .tch-requirement>div:first-child{display:flex;justify-content:space-between;gap:8px;font-size:12px}#tch-root .tch-requirement small{color:#c5dce8}#tch-root .tch-fitbar{height:9px;border-radius:20px;background:#365269;overflow:hidden;margin-top:6px}#tch-root .tch-fitbar b{display:block;height:100%;background:#55e9c9;border-radius:20px}#tch-root.theme-light .tch-metric.tch-clickable,#tch-root.theme-light .tch-fitpair>div,#tch-root.theme-light .tch-comparison>div{background:#fff;color:#183448;border-color:#b7cedb}#tch-root.theme-light .tch-person-button{color:#183448}#tch-root.theme-light .tch-fitpair strong,#tch-root.theme-light .tch-comparison strong{color:#056b64}#tch-root.theme-light .tch-fitpair small,#tch-root.theme-light .tch-comparison span{color:#33586f}#tch-root.theme-light .tch-hero.tch-hero-button{color:#173d43}#tch-root.theme-light .tch-roleline span,#tch-root.theme-light .tch-change span{color:#28485a}";
  style.textContent += "#tch-root .tch-insight{display:grid;grid-template-columns:1fr auto;gap:5px 12px;width:100%;text-align:left;border:1px solid #4d6b7d;border-radius:12px;background:#294254;color:#f6fafb;padding:14px;margin:8px 0}#tch-root .tch-insight strong,#tch-root .tch-insight small{grid-column:1}#tch-root .tch-insight small{color:#cce0e9;font-size:12px}#tch-root .tch-insight span{grid-column:2;grid-row:1/3;font-size:20px;color:#74efdc;align-self:center}#tch-root.theme-light .tch-insight{background:#f3f8fc;color:#153649}#tch-root.theme-light .tch-insight small{color:#35586b}";
  style.textContent+="#tch-root .tch-taprow{position:relative;width:100%;display:flex;align-items:center;justify-content:space-between;text-align:left;background:transparent;border:0;padding:13px 4px}#tch-root .tch-taprow .tch-tilearrow{position:static;margin-left:8px}#tch-root.theme-light .tch-taprow{background:transparent;color:#15394c}";
  document.documentElement.appendChild(style);
  const opener=document.createElement("button"); opener.id="tch-open";opener.type="button";opener.textContent="Company Helper";document.body.appendChild(opener);
  const root=document.createElement("div");root.id="tch-root";root.hidden=true;document.body.appendChild(root);
  const cell=function(label,val,cls){
    const detail=/revenue|income/i.test(label)?"revenue":/wage/i.test(label)?"wages":/advertising/i.test(label)?"ad":"profit";
    return '<button type="button" data-act="finance-focus" data-field="'+detail+'" class="tch-metric tch-clickable '+(cls||"")+'">'+
      '<span class="muted">'+esc(label)+'</span><strong>'+esc(val)+'</strong><small>Tap to inspect calculation ↗</small></button>';
  };
  const empty=function (msg) {return '<div class="card"><p>'+esc(msg)+'</p></div>';};
  const label=function (s) {return '<h2>'+esc(s)+'</h2>';};
  function overview(c) {
    if (!c.profile) return empty("Open Settings, enter your dedicated API key, then tap Refresh. There are no background API calls.");
    const a=accounting(c), ledger=aggregates(c), owing=Object.values(ledger.balance).reduce(function (x,b) {return x+b.owed;},0);
    const risk=a.known && a.profit < -c.lossLimit;
    return label("Company overview")+'<div class="grid">'+
      cell("Rating",num(c.profile.rating)+" / 10 ★")+
      cell("Employees",c.staff.length+" / "+num(c.profile.employees && c.profile.employees.capacity))+
      cell("Available trains",c.profile.trains == null?"Unknown":c.profile.trains)+
      cell("Trains owed",owing)+
      cell("Daily revenue",money(a.revenue))+
      cell("Daily P/L estimate",a.known?money(a.profit):"Incomplete",a.known?(!a.known?"warn":a.profit<0?"bad":"good"):"warn")+
      cell("Daily loss limit",money(c.lossLimit))+
      cell("Headroom",a.known?money(a.headroom):"Unknown",risk?"bad":"good")+'</div>'+
      (risk?'<div class="notice bad">Estimated daily loss exceeds your limit by '+esc(money(-a.headroom))+'. Review costs manually.</div>':"")+
      '<div class="card"><h3>10-star growth policy</h3><div class="bar"><b style="width:'+Math.max(0,Math.min(100,num(c.profile.rating)*10))+'%"></b></div><p>Prioritise sustainable growth, with a maximum estimated operating loss of '+esc(money(c.lossLimit))+' per day. The rating bar is not a prediction of star promotion.</p><p class="muted">Figures are observations or transparent estimates, not automated Torn company changes.</p></div>'+
      '<div class="card"><h3>Last manual refresh</h3>'+esc(c.lastRefresh?new Date(c.lastRefresh).toLocaleString():"Never")+'</div>';
  }
  function employees(c) {
    if (!c.staff.length) return empty("Refresh to load employees.");
    return label("Employees")+'<div class="scroll card"><table><thead><tr><th>Player</th><th>Role</th><th>MAN</th><th>INT</th><th>END</th><th>Effectiveness</th><th>Wages / day</th></tr></thead><tbody>'+
      c.staff.map(function (p) {return '<tr><td>'+esc(p.name)+' <span class="muted">#'+esc(p.id)+'</span></td><td>'+esc(p.position && p.position.name)+'</td><td>'+num(p.stats && p.stats.manual_labor).toLocaleString()+'</td><td>'+num(p.stats && p.stats.intelligence).toLocaleString()+'</td><td>'+num(p.stats && p.stats.endurance).toLocaleString()+'</td><td>'+esc(p.effectiveness && p.effectiveness.total == null?"?":p.effectiveness.total)+'</td><td>'+esc(typeof p.wage==="number"?money(p.wage):"Unknown")+'</td></tr>';}).join("")+'</tbody></table></div><p class="muted">Departed employees are retained in local training records. All amounts remain on your device.</p>';
  }
  function optimiser(c) {
    if (!c.staff.length) return empty("Refresh employees first.");
    const roles=roleList(c), rec=suggestions(c);
    if (!roles.length) return empty("Position definitions unavailable for this company type. Refreshed definitions are needed.");
    return label("Staff role optimiser")+
      '<div class="notice">This is a working-stat suitability heuristic, not Torn\'s hidden company effectiveness or income formula. Manager, Marketer and Cleaner get one suggested slot each. Test changes in the scenario column; nothing changes in Torn.</div>'+
      '<div class="scroll card"><table><tr><th>Employee</th><th>Current</th><th>Suggested</th><th>Suitability</th><th>What-if role</th></tr>'+
      rec.map(function (r) {
        const roleChosen=c.whatIf[r.person.id] || r.actual, role=roles.find(function (x) {return x.name===roleChosen;});
        const sc=score(r.person,role);
        return '<tr><td>'+esc(r.person.name)+'</td><td>'+esc(r.actual)+'</td><td><span class="'+(r.recommend?"good":"muted")+'">'+esc(r.recommend?r.proposed:"Keep current")+'</span></td><td>'+esc(sc==null?"Unknown":sc.toFixed(1)+"%")+'</td><td><select data-change="sim" data-id="'+esc(r.person.id)+'">'+roles.map(function (x) {return '<option value="'+esc(x.name)+'" '+(x.name===roleChosen?"selected":"")+'>'+esc(x.name)+'</option>';}).join("")+'</select></td></tr>';
      }).join("")+'</table></div><div class="actions"><button data-act="reset-sim">Reset what-if selections</button></div>';
  }
  function training(c) {
    const a=aggregates(c), logRows=c.logs || [], reviewCount=logRows.filter(function(n){return !isApprovedLog(c,n.id) && n.matchStatus!=="ignored";}).length, rows=Object.entries(a.balance).sort(function (x,y) {
      const xp=c.staff.find(function(p){return String(p.id)===x[0];}),yp=c.staff.find(function(p){return String(p.id)===y[0];});
      const xi=xp && num(xp.days_in_company)<3, yi=yp && num(yp.days_in_company)<3;
      return Number(xi)-Number(yi) || (x[1].oldest || Infinity)-(y[1].oldest || Infinity);
    });
    const manualIds=new Set(c.training.filter(function(t){return !t.voided && t.source==="manual";}).map(function(t){return String(t.playerId);}));
    const importedIds=new Set(c.training.filter(function(t){return !t.voided && !!t.sourceId;}).map(function(t){return String(t.playerId);}));
    const overlaps=Array.from(manualIds).filter(function(id){return importedIds.has(id);});
    const options=c.staff.concat(c.archived||[]).map(function (p) {return '<option value="'+esc(p.id)+'">'+esc(p.name)+'</option>';}).join("");
    return label("Training accounts")+
      '<div class="notice">The script automatically matches training history and identifies money-transfer candidates. Imported money is credited only after you confirm its purpose. Anything uncertain stays in review; nothing changes in Torn.</div>'+      (reviewCount?'<div class="notice warn"><strong>'+reviewCount+' incoming payment(s) need checking.</strong> <button data-act="review-payments">Review payments</button></div>':'')+
      (overlaps.length?'<div class="notice warn"><strong>Check for possible old duplicates:</strong> '+esc(overlaps.map(function(id){return a.people[id]||"#"+id;}).join(", "))+'. These employees have both manually entered and historical training records. Review the audit trail to prevent double-counting; not all overlaps are duplicates.</div>':"")+
      '<div class="card"><h3>Record a payment</h3><div class="row"><select id="tch-pay-person">'+options+'</select><input id="tch-pay-amount" type="number" placeholder="Money received" min="0"><input id="tch-pay-units" type="number" placeholder="Trains" min="0" step="1"><button data-act="add-payment">Confirm payment locally</button></div><p class="muted">Guide: $250,000 = 1, $1,000,000 = 5. Enter the approved number manually, including partial-payment allocations.</p></div>'+
      '<div class="card"><h3>Record completed training</h3><div class="row"><select id="tch-train-person">'+options+'</select><input id="tch-train-units" type="number" min="1" step="1" value="1"><button data-act="add-training">Record training locally</button></div></div>'+
      '<div class="scroll card"><h3>Oldest-first queue</h3><table><tr><th>Player</th><th>Purchased</th><th>Given / credited</th><th>Owed</th><th>Credit</th><th>Priority</th></tr>'+
      rows.map(function (entry) {
        const p=c.staff.find(function (x) {return String(x.id)===entry[0];});
        const ineligible=p && num(p.days_in_company)<3;
        return '<tr><td>'+esc(a.people[entry[0]])+(ineligible?' <span class="warn">(temporarily ineligible)</span>':'')+'</td><td>'+entry[1].purchased+'</td><td>'+entry[1].delivered+'</td><td>'+entry[1].owed+'</td><td>'+entry[1].credit+'</td><td>'+esc(entry[1].oldest?day(entry[1].oldest):"Cleared")+'</td></tr>';
      }).join("")+'</table></div>'+
      '<div class="card" id="tch-payment-review"><h3>Payments received</h3><p>Tap Import. The script finds incoming payment categories, matches the sender to employees and calculates trains using your prices. Only ambiguous payments need review.</p><div class="actions"><button data-act="import-logs" '+(busy?"disabled":"")+'>Import older payments</button><button data-act="rescan-logs" '+(busy?"disabled":"")+'>Rescan recent payments</button></div>'+
      '<p class="muted">Only confirmed training purchases affect balances, once per Torn log ID. Matching sender and amount alone cannot prove purpose. Nothing is sent to Torn.</p>'+
      '<div class="row"><span class="pill good">'+c.logs.filter(function(n){return isApprovedLog(c,n.id);}).length+' matched</span><span class="pill warn">'+c.logs.filter(function(n){return !isApprovedLog(c,n.id) && n.matchStatus!=="ignored";}).length+' to review</span></div>'+
      logRows.slice().sort(function(x,y){return y.timestamp-x.timestamp;}).filter(function(n){
        return !isApprovedLog(c,n.id) && n.matchStatus!=="ignored";
      }).slice(0,40).map(function(n){
        const guess=n.suggestion||{},id=esc(n.id),selected=guess.senderId||guess.playerId||"";
        const targetOptions='<option value="">Choose employee</option>'+c.staff.concat(c.archived||[]).map(function(p){
          return '<option value="'+esc(p.id)+'" '+(String(selected)===String(p.id)?"selected":"")+'>'+esc(p.name)+'</option>';
        }).join("");
        return '<div class="card"><div class="row"><strong>'+esc(day(n.timestamp))+'</strong><span class="pill warn">Check payment</span></div>'+
          '<p>'+esc(n.title)+' · '+esc(guess.reason||n.matchReason||"Review sender and amount")+'</p><div class="row">'+
          '<label>Employee <select data-field="log-person" data-id="'+id+'">'+targetOptions+'</select></label>'+
          '<label>Received $ <input data-field="log-amount" data-id="'+id+'" type="number" min="1" value="'+esc(guess.amount||"")+'" placeholder="Amount"></label>'+
          '<label>Trains <input data-field="log-units" data-id="'+id+'" type="number" min="0" step="1" value="'+esc(guess.trains===undefined?"":guess.trains)+'" placeholder="Allocate"></label></div>'+
          '<div class="actions"><button data-act="approve-log" data-id="'+id+'" class="primary">Approve allocation</button><button data-act="ignore-log" data-id="'+id+'">Not a training payment</button></div></div>';
      }).join("")+'</div>'+
      '<div class="card"><h3>Prevent duplicate training</h3><p>Imported company-news records can only be counted once per original Torn news ID. Check your old local records for duplicates and retain an audit trail of anything corrected.</p><button data-act="repair-duplicates">Check and repair duplicate imports</button>'+
      '<p class="muted">Manual training entries cannot always be linked to older company news; if you added them separately, check the audit trail below and void the overlapping manual entry.</p></div>'+
      '<div class="card"><h3>Training history</h3><p class="muted">Recognised employees are automatically matched after a manual import. Review records where the recipient cannot be identified.</p><div class="actions"><button data-act="import-news" '+(busy?"disabled":"")+'>Import older training</button><button data-act="rescan-news">Check recent training</button><button data-act="match-news">Match existing history</button></div>'+
      c.news.slice().sort(function (x,y) {return y.timestamp-x.timestamp;}).slice(0,30).map(function (n) {
        const imported=c.training.find(function (t) {return !t.voided && t.sourceId==="news:"+n.id;});
        const guess=matchTrainingNews(n,c);
        return '<div class="card"><div class="row"><strong>'+esc(day(n.timestamp))+'</strong><span class="pill '+(imported?"good":"warn")+'">'+esc(imported?"Matched: "+(a.people[imported.playerId] || ("#"+imported.playerId)):"Needs review")+'</span></div><p>'+esc(cleanNews(n.text)).slice(0,500)+'</p>'+
        (imported?'<p class="muted">'+esc(imported.units)+' train(s) linked to this record</p>':
        '<div class="row"><select id="tch-news-person-'+esc(n.id)+'"><option value="">Choose employee</option>'+
        c.staff.concat(c.archived||[]).map(function(p){return '<option value="'+esc(p.id)+'" '+(String(guess.playerId||"")===String(p.id)?"selected":"")+'>'+esc(p.name)+'</option>';}).join("")+
        '</select><input type="number" data-news-units="'+esc(n.id)+'" min="1" max="20" value="'+esc(guess.units||1)+'" aria-label="Trains given"><button data-act="assign-news" data-id="'+esc(n.id)+'">Confirm this record</button></div>')+'</div>';
      }).join("")+'</div>'+
      '<div class="card"><h3>Audit trail</h3><div class="scroll"><table><tr><th>Date</th><th>Type</th><th>Employee</th><th>Amount</th><th>Trains</th><th>Correction</th></tr>'+
      c.payments.map(function (p) {return {id:p.id,ts:p.ts,type:"Payment",person:p.playerId,amount:p.amount,units:p.trains,voided:p.voided};}).concat(c.training.map(function (t) {return {id:t.id,ts:t.ts,type:"Training",person:t.playerId,amount:null,units:t.units,voided:t.voided};})).sort(function (x,y) {return y.ts-x.ts;}).slice(0,100).map(function (e) {return '<tr><td>'+day(e.ts)+'</td><td>'+e.type+(e.voided?' (VOID)':'')+'</td><td>'+esc(a.people[e.person] || e.person)+'</td><td>'+esc(e.amount == null?"—":money(e.amount))+'</td><td>'+esc(e.units)+'</td><td>'+(e.voided?'Retained':'<button data-act="void-entry" data-id="'+esc(e.id)+'">Void</button>')+'</td></tr>';}).join("")+'</table></div></div>';
  }
  function finances(c) {
    if (!c.profile) return empty("Refresh to view daily financial estimates.");
    const a=accounting(c);
    const latestByDate={};
    c.snapshots.forEach(function (s) {if(s.complete) latestByDate[s.observedAt.slice(0,10)]=s;});
    const points=Object.values(latestByDate).sort(function (x,y) {return x.observedAt.localeCompare(y.observedAt);}).slice(-30);
    const values=points.map(function (s) {return s.profit;});
    const lo=values.length?Math.min.apply(null,values):-1,hi=values.length?Math.max.apply(null,values):1,range=Math.max(1,hi-lo);
    const poly=points.map(function (p,i) {
      const x=points.length===1?50:i*100/(points.length-1);
      const y=90-(p.profit-lo)*80/range;
      return x.toFixed(2)+","+y.toFixed(2);
    }).join(" ");
    const graph=points.length>1?'<div class="card"><h3>Observed daily P/L trend ('+points.length+' days)</h3><svg style="width:100%;height:170px" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Estimated P/L trend"><polyline points="'+poly+'" fill="none" stroke="#43d4b4" stroke-width="2.2"/></svg><div class="row"><span class="muted">Lowest: '+esc(money(lo))+'</span><span class="muted">Highest: '+esc(money(hi))+'</span></div></div>':"";
    return label("Financial analytics")+'<div class="grid">'+cell("Reported daily revenue",money(a.revenue))+cell("Daily wages",money(a.wages))+cell("Daily advertising",money(a.ad))+cell("Operating P/L estimate",a.known?money(a.profit):"Incomplete",a.profit<0?"bad":"good")+'</div>'+
      '<section class="tch-panel"><h2>'+esc({revenue:"Daily revenue",wages:"Employee wages",ad:"Advertising budget",profit:"Estimated operating profit/loss"}[financeFocus])+'</h2>'+
      '<p>'+esc({revenue:"Reported membership sales, not including personal train payments.",wages:"Sum of the current employee salaries, which can change between company reports.",ad:"Current daily company advertising budget; customer response requires observation.",profit:"Current reported revenue minus current wages and advertising. Other operating expenses are excluded."}[financeFocus])+'</p>'+
      '<div class="tch-roleline"><span>Current recorded value</span><strong>'+esc(money(financeFocus==="revenue"?a.revenue:financeFocus==="wages"?a.wages:financeFocus==="ad"?a.ad:a.profit))+'</strong></div>'+
      '<div class="tch-roleline"><span>Loss-policy headroom</span><strong>'+esc(a.known?money(a.headroom):"Unknown")+'</strong></div></section>'+
      graph+'<div class="card"><h3>How this is calculated</h3><p>Reported daily revenue minus current employee wages and current advertising budget. Other historical or unreported costs are excluded; this is not a complete audited P/L.</p><p class="muted">Amounts are captured on manual refresh and tagged with observation time. A refresh is not proof the figures belong to that exact accounting day. Training payments to the director do not count as company income.</p></div>'+
      '<div class="card"><h3>Manual refresh history</h3><div class="scroll"><table><tr><th>Observed</th><th>Revenue</th><th>Wages</th><th>Advertising</th><th>Estimated P/L</th><th>Rating</th></tr>'+
      c.snapshots.slice().reverse().slice(0,90).map(function (s) {return '<tr><td>'+esc(s.observedAt.slice(0,16).replace("T"," "))+' UTC</td><td>'+money(s.revenue)+'</td><td>'+money(s.wages)+'</td><td>'+money(s.ad)+'</td><td>'+esc(s.complete?money(s.profit):"Incomplete")+'</td><td>'+esc(s.rating)+'</td></tr>';}).join("")+'</table></div></div>';
  }
  function growth(c) {
    if (!c.profile) return empty("Refresh for company growth figures.");
    const a=accounting(c), product=c.stock[0] || null;
    const days={};
    c.snapshots.forEach(function (s) {if(s.complete && s.price != null) days[s.observedAt.slice(0,10)]=s;});
    const grouped={};
    Object.values(days).forEach(function (s) {
      const k=s.price+"|"+s.ad;
      const g=grouped[k] || (grouped[k]={price:s.price,ad:s.ad,days:0,revenue:0,profit:0});
      g.days++;g.revenue+=s.revenue;g.profit+=s.profit;
    });
    const groups=Object.values(grouped).filter(function (g) {return g.days>=3;}).map(function (g) {return {price:g.price,ad:g.ad,days:g.days,revenue:g.revenue/g.days,profit:g.profit/g.days};}).sort(function (a,b) {return b.revenue-a.revenue;});
    const viable=groups.filter(function (g) {return g.profit>=-num(c.lossLimit);});
    const observedBest=viable[0];
    return label("10-star growth lab")+'<div class="grid">'+cell("Weekly gross income",money(c.profile.income && c.profile.income.weekly))+cell("Daily customers",c.profile.customers && c.profile.customers.daily)+cell("Popularity",c.profile.popularity == null?"Unknown":c.profile.popularity)+cell("Efficiency",c.profile.efficiency == null?"Unknown":c.profile.efficiency)+'</div>'+
      '<div class="card"><h3>Membership pricing</h3>'+(product?'<p>'+esc(product.name)+' · Price '+esc(money(product.price))+' · RRP '+esc(money(product.rrp))+' · Reported sales '+esc(product.sold_amount)+'</p>':"<p>Current membership product not available.</p>")+
      '<p class="muted">No guaranteed optimal price can be calculated from one observation. Track manually changed prices across comparable trading days before making recommendations.</p></div>'+
      '<div class="card"><h3>Observed price and advertising combinations</h3>'+
      (observedBest?'<p class="good">Highest observed average daily revenue within your loss limit: price '+esc(money(observedBest.price))+' and advertising '+esc(money(observedBest.ad))+' ('+observedBest.days+' distinct refresh days). This is a comparison, not a controlled causal recommendation.</p>':'<p>Insufficient repeated data to compare settings reliably. At least three different refresh days per price/advertising combination are required.</p>')+
      '<div class="scroll"><table><tr><th>Membership price</th><th>Advertising</th><th>Days sampled</th><th>Average daily revenue</th><th>Estimated P/L</th></tr>'+groups.slice(0,12).map(function(g){return '<tr><td>'+money(g.price)+'</td><td>'+money(g.ad)+'</td><td>'+g.days+'</td><td>'+money(g.revenue)+'</td><td>'+money(g.profit)+'</td></tr>';}).join("")+'</table></div><p class="muted">Observational data is affected by competitor activity, staffing changes and Torn reporting intervals. Never treat this as proof of the optimal price or advertising budget.</p></div>'+
      '<div class="card"><h3>Advertising budget simulator</h3><p>Current advertising: '+esc(money(a.ad))+' per day. Current loss-limit headroom: '+esc(a.known?money(a.headroom):"Unknown")+'.</p><label>Simulated advertising budget</label><input type="number" id="tch-sim-ad" min="0" value="'+esc(c.simAd==null?a.ad:c.simAd)+'"><button data-act="run-sim">Calculate fixed-revenue scenario</button>'+
      (a.known&&c.simResult?'<p class="'+(c.simResult.headroom<0?"bad":"good")+'">Assuming sales and wages do not change: '+esc(money(c.simResult.profit))+' estimated profit; '+esc(money(c.simResult.headroom))+' headroom.</p>':"")+
      '<p class="muted">Advertising may change revenue, so this is a cost sensitivity calculation, not a prediction of customer response. There are no automatic changes to Torn.</p></div>';
  }
  function settings(c) {
    return label("Settings & privacy")+
      '<div class="card"><h3>Dedicated custom API key</h3><p>Key is used only for GET requests to api.torn.com through Torn PDA. It stays in memory for this session; it is never saved, exported, published, logged or sent elsewhere.</p><label>Custom API key</label><input id="tch-key" type="password" autocomplete="off" placeholder="'+(key?"Key loaded for this session":"Paste key")+'"><button data-act="use-key">Use key this session</button><p class="muted">Suggested API selections: company/profile, company/employees, company/stock, company/news, torn/companies. For payment-history import, grant only incoming-money user/log types; the script detects their IDs when importing. Treat such keys as highly sensitive.</p></div>'+
      '<div class="card"><h3>Payment imports</h3><p>There is no money-log filter to configure. Open Training and tap Import older payments or Rescan recent payments. The script detects the incoming-money types itself, matches identifiable employees and amounts, and asks you only about unclear records.</p><p class="muted">Your dedicated Torn API key must permit the relevant personal user/log types. Only manual taps cause API reads; no money is ever moved.</p><p class="muted">Detected incoming log types: '+esc(c?c.logTypes||"Not loaded yet":"Not loaded yet")+'</p></div>'+
      '<div class="card"><h3>Financial guardrail</h3><label>Maximum daily operating loss ($)</label><input id="tch-limit" type="number" min="0" step="50000" value="'+esc(c?c.lossLimit:500000)+'"><button data-act="save-limit">Save limit</button></div>'+
      '<div class="card"><h3>Local backups</h3><p>Export contains actual company and employee records. Keep the file private. It contains no API key.</p><button data-act="backup">Export JSON backup</button><label>Restore a backup (replaces all local company records)</label><textarea id="tch-restore" rows="3" placeholder="Paste a previously exported JSON backup here"></textarea><button data-act="restore">Restore backup</button></div>'+
      '<div class="card"><h3>Safety contract</h3><p>Read-only Torn API GET requests on your tap only; no game interactions, auto-refresh timers, forms, money transfers, employee changes or background scraping. All scenario and ledger buttons change local records only.</p><p class="muted">Author: IamEEKY · Repository: Torn-Company-Helper</p></div>';
  }


  function currentPosition(p){return String(p&&p.position&&p.position.name||"Unknown");}
  function roleByName(roles,name){return (roles||[]).find(function(r){return String(r.name).toLowerCase()===String(name||"").toLowerCase();});}
  function fitFor(p,roles,name) {
    const role=roleByName(roles,name);
    return role?score(p,role):null;
  }
  function fitText(v){return v===null||v===undefined||!Number.isFinite(v)?"Unknown":v.toFixed(1)+"%";}
  function scenarioModel(c){
    const roles=roleList(c), staff=assertArray(c.staff), actual={}, proposed={}, rows=[];
    let before=0,after=0,comparable=0,changes=0;
    staff.forEach(function(p){
      const current=currentPosition(p), chosen=(c.whatIf||{})[p.id]||current;
      const actualFit=fitFor(p,roles,current), futureFit=fitFor(p,roles,chosen);
      actual[current]=(actual[current]||0)+1;
      proposed[chosen]=(proposed[chosen]||0)+1;
      if(current!==chosen)changes++;
      if(actualFit!==null&&futureFit!==null){before+=actualFit;after+=futureFit;comparable++;}
      rows.push({person:p,current:current,proposed:chosen,actualFit:actualFit,proposedFit:futureFit,
        delta:actualFit!==null&&futureFit!==null?futureFit-actualFit:null,changed:current!==chosen});
    });
    const considered=rows.filter(function(r){return r.changed;});
    const coverage=["Manager","Marketer","Cleaner"].filter(function(name){return roleByName(roles,name);}).map(function(name){
      return {name:name,actual:actual[name]||0,proposed:proposed[name]||0,missing:!(proposed[name]>0)};
    });
    return {roles:roles,rows:rows,actual:actual,proposed:proposed,changed:considered,changeCount:changes,
      count:comparable,averageBefore:comparable?before/comparable:null,averageAfter:comparable?after/comparable:null,
      averageDelta:comparable?(after-before)/comparable:null,coverage:coverage};
  }
  function roleRequirementDetails(p,role) {
    if(!role)return '<p class="tch-hint">Requirements for this role are unavailable, so no score is reported.</p>';
    const req=Object.entries(role.requirements||{}).filter(function(x){return Number(x[1])>0;});
    if(!req.length)return '<p class="tch-hint">Working-stat requirements are unavailable.</p>';
    const captions={manual_labor:"Manual labour",intelligence:"Intelligence",endurance:"Endurance"};
    return '<div class="tch-requirements">'+req.map(function(x){
      const have=num(p.stats&&p.stats[x[0]]),need=num(x[1]),ratio=need>0?Math.min(100,100*have/need):0;
      return '<div class="tch-requirement"><div><strong>'+esc(captions[x[0]]||x[0])+'</strong>'+
        '<small>'+Math.round(have).toLocaleString()+' / '+Math.round(need).toLocaleString()+'</small></div>'+
        '<div class="tch-fitbar"><b style="width:'+ratio.toFixed(1)+'%"></b></div></div>';
    }).join("")+'</div>';
  }

  function employeeProgress(c,playerId){
    const points=(c.snapshots||[]).filter(function(s){return s&&s.observedAt&&s.roster&&s.roster[playerId];})
      .sort(function(a,b){return String(a.observedAt).localeCompare(String(b.observedAt));});
    if(points.length<2)return {count:points.length};
    const first=points[0],last=points[points.length-1],f=first.roster[playerId],l=last.roster[playerId],result={count:points.length,
      from:String(first.observedAt).slice(0,10),to:String(last.observedAt).slice(0,10),stats:{},effectiveness:null};
    ["manual_labor","intelligence","endurance"].forEach(function(k){
      const start=f.stats&&f.stats[k],end=l.stats&&l.stats[k];
      result.stats[k]=Number.isFinite(Number(start))&&Number.isFinite(Number(end))?Number(end)-Number(start):null;
    });
    if(f.effectiveness!==null&&l.effectiveness!==null&&Number.isFinite(Number(f.effectiveness))&&Number.isFinite(Number(l.effectiveness)))
      result.effectiveness=Number(l.effectiveness)-Number(f.effectiveness);
    return result;
  }

  function employeeDetail(c,playerId){
    const p=c.staff.find(function(p){return String(p.id)===String(playerId);});
    if(!p)return '<section class="tch-panel"><h2>Employee unavailable</h2><button data-act="staff-view" data-view="roster">Back to staff</button></section>';
    const roles=roleList(c),current=currentPosition(p),actual=fitFor(p,roles,current);
    const selected=(c.whatIf||{})[p.id]||current,future=fitFor(p,roles,selected);
    const balance=aggregates(c).balance[p.id]||{purchased:0,delivered:0,owed:0,credit:0};
    const progress=employeeProgress(c,p.id);
    const ranked=roles.map(function(r){return {name:r.name,fit:fitFor(p,roles,r.name)};})
      .filter(function(r){return r.fit!==null;}).sort(function(a,b){return b.fit-a.fit;});
    const impact=actual!==null&&future!==null?future-actual:null;
    return '<div class="tch-section"><button data-act="staff-view" data-view="roster">← All staff</button>'+
      '<h2>'+esc(p.name)+'</h2><p>Working-stat match and personal training balance</p></div>'+
      '<div class="tch-metrics">'+
      metricV2("Current role fit",fitText(actual),current,"","staff")+
      metricV2("Selected role fit",fitText(future),selected,"","staff")+
      metricV2("Confirmed trains owed",balance.owed,"Training ledger","","training-queue")+
      metricV2("Torn effectiveness",p.effectiveness&&p.effectiveness.total==null?"Unknown":String(p.effectiveness&&p.effectiveness.total),"Reported by Torn","","staff")+'</div>'+
      '<section class="tch-panel"><h2>Compare positions</h2><p>These percentages show how well employee working stats meet role requirements (capped at 100%). They are not Torn effectiveness or income predictions.</p>'+
      '<label>Test a position<select data-change="sim" data-id="'+esc(p.id)+'">'+roles.map(function(r){return '<option value="'+esc(r.name)+'" '+(selected===r.name?"selected":"")+'>'+esc(r.name)+'</option>';}).join("")+'</select></label>'+
      '<div class="tch-comparison"><div><span>Current · '+esc(current)+'</span><strong>'+fitText(actual)+'</strong></div>'+
      '<div><span>Test · '+esc(selected)+'</span><strong>'+fitText(future)+'</strong></div></div>'+
      (impact!==null?'<p class="'+(impact>0?"good":impact<0?"bad":"")+'">Change in requirement fit: '+(impact>0?"+":"")+impact.toFixed(1)+' percentage points</p>':"")+
      '<h3>Requirements for '+esc(selected)+'</h3>'+roleRequirementDetails(p,roleByName(roles,selected))+
      '<h3>Top matching roles</h3>'+ranked.slice(0,6).map(function(r){return '<div class="tch-roleline"><span>'+esc(r.name)+'</span><strong>'+fitText(r.fit)+'</strong></div>';}).join("")+
      '</section>'+
      '<section class="tch-panel"><h2>Working-stat progress</h2>'+
      (progress.count>=2?'<p>Change over '+esc(progress.from)+' to '+esc(progress.to)+' ('+progress.count+' manual refresh observations).</p>'+
        '<div class="tch-metrics">'+["manual_labor","intelligence","endurance"].map(function(k){
          const d=progress.stats[k],title={manual_labor:"Manual labour",intelligence:"Intelligence",endurance:"Endurance"}[k];
          return metricV2(title,d===null?"Unknown":(d>=0?"+":"")+d.toLocaleString(),"Change in observed working stats");
        }).join("")+
        metricV2("Torn effectiveness change",progress.effectiveness===null?"Unknown":(progress.effectiveness>=0?"+":"")+progress.effectiveness,
          "Reported effectiveness, not role fit")+'</div>':
        '<p>Refresh this company on different days to build individual working-stat and effectiveness history.</p>')+
      '</section>';
  }
  function scenarioV2(c) {
    const model=scenarioModel(c),current=model.averageBefore,proposed=model.averageAfter,delta=model.averageDelta;
    return '<section class="tch-panel"><h2>Team simulation</h2>'+
      '<p>Test role assignments across the whole team. The comparison updates immediately as you change positions. Nothing is changed in Torn.</p>'+
      '<div class="tch-metrics">'+
      metricV2("Current team fit",fitText(current),model.count+" comparable staff","","staff-sim")+
      metricV2("Simulated team fit",fitText(proposed),model.changeCount+" positions changed","","staff-sim")+
      metricV2("Fit difference",delta===null?"Unknown":(delta>=0?"+":"")+delta.toFixed(1)+" pp","Average per comparable staff","","staff-sim")+
      metricV2("Staff changes",String(model.changeCount),"Local simulation only","","staff-sim")+'</div>'+
      (model.count<c.staff.length?'<div class="notice warn">Some roles lack requirements or working stats. '+(c.staff.length-model.count)+' employees are excluded from both averages.</div>':"")+
      '<div class="tch-actionrow"><button class="primary" data-act="try-suggested">Try suggested assignments</button>'+
      '<button data-act="reset-sim">Restore actual positions</button></div>'+
      '<h3>Changes by employee</h3>'+
      (model.changed.length?model.changed.map(function(r){return '<div class="tch-change"><strong>'+esc(r.person.name)+'</strong>'+
        '<span>'+esc(r.current)+' → '+esc(r.proposed)+'</span><b class="'+(r.delta!==null&&r.delta>0?"good":r.delta!==null&&r.delta<0?"bad":"")+'">'+
        (r.delta===null?"Unknown":(r.delta>=0?"+":"")+r.delta.toFixed(1)+" pp")+'</b></div>';}).join(""):
        '<div class="tch-empty">No changes yet. Select a new role below or try suggested assignments.</div>')+
      '<h3>Key role coverage</h3>'+model.coverage.map(function(x){return '<div class="tch-roleline"><span>'+esc(x.name)+'</span>'+
        '<strong class="'+(x.missing?"warn":"")+'">'+x.actual+' → '+x.proposed+(x.missing?" · unfilled":"")+'</strong></div>';}).join("")+
      '<p class="tch-hint">This is a requirement-fit and role-coverage comparison, not a validated Torn effectiveness, revenue or star-rating forecast. Manager/Marketer/Cleaner coverage is a prompt to review rather than a mandatory staffing rule.</p></section>'+
      '<section class="tch-panel"><h2>Edit simulated positions</h2>'+
      model.rows.map(function(r){return '<div class="tch-simrow"><button data-act="employee-detail" data-id="'+esc(r.person.id)+'">'+esc(r.person.name)+'</button>'+
        '<div><span class="tch-fitcaption">Now '+fitText(r.actualFit)+'</span><label><select data-change="sim" data-id="'+esc(r.person.id)+'">'+
        model.roles.map(function(role){return '<option value="'+esc(role.name)+'" '+(r.proposed===role.name?"selected":"")+'>'+esc(role.name)+'</option>';}).join("")+
        '</select></label><span class="tch-fitcaption">Test '+fitText(r.proposedFit)+'</span></div></div>';}).join("")+
      '</section>';
  }

  function tabsV2(){
    const tabs=[["overview","⌂","Today"],["employees","♟","Staff"],["training","◇","Trains"],["growth","▥","Growth"]];
    return '<nav class="tch-bottom" aria-label="Company Helper sections">'+tabs.map(function(x){
      return '<button data-act="tab" data-tab="'+x[0]+'" class="'+(tab===x[0]?"active":"")+'"><span class="tch-navicon">'+x[1]+'</span><span>'+x[2]+'</span></button>';
    }).join("")+'</nav>';
  }
  function headV2(c) {
    const title=tab==="overview"?"Today":tab==="employees"?"Staff":tab==="training"?"Training":tab==="growth"?"Growth":"Settings";
    const date=c && c.lastRefresh?new Date(c.lastRefresh).toLocaleString():"Not synced";
    return '<header class="tch-top"><div class="tch-headline"><div class="tch-eyebrow">COMPANY HELPER · v0.9.0</div><strong>'+title+'</strong><div class="tch-timestamp">'+esc(date)+' · Read only</div></div>'+
      '<div class="actions"><button data-act="refresh" class="tch-iconbtn" aria-label="Refresh data" '+(busy?"disabled":"")+'>↻</button>'+
      '<button data-act="tab" data-tab="settings" class="tch-iconbtn" aria-label="Settings">⚙</button><button data-act="close" class="tch-iconbtn" aria-label="Close dashboard">×</button></div></header>';
  }
  function metricV2(title,value,secondary,tone,target){
    const inner='<span class="muted">'+esc(title)+'</span><strong>'+esc(value)+'</strong>'+
      (secondary?'<small>'+esc(secondary)+'</small>':'')+(target?'<span class="tch-tilearrow" aria-hidden="true">↗</span>':"");
    if(target)return '<button type="button" data-act="goto" data-target="'+esc(target)+'" class="tch-metric tch-clickable '+(tone||"")+
      '" aria-label="'+esc(title)+': '+esc(value)+' — view details">'+inner+'</button>';
    return '<button type="button" data-act="metric-detail" data-target="'+esc(target||"growth") +'" class="tch-metric '+(tone||"")+'">'+inner+'</div>';
  }

  function introV2() {
    return '<section class="tch-panel tch-welcome"><span class="tch-kicker">GET STARTED</span><h2>Company management, without the clutter.</h2>'+
      '<p>Connect using the Torn PDA key you already have, then refresh your company when you choose. All decisions remain yours.</p>'+
      '<div class="tch-actionrow"><button class="primary" data-act="refresh">Connect & refresh</button><button data-act="tab" data-tab="settings">API options</button></div>'+
      '<small>API key: '+(hasPdaKey()?"Detected from Torn PDA":"Not detected in Torn PDA")+'. Your saved company and training records are not deleted.</small></section>';
  }
  function detailsV2(c){
    if(!c)return introV2();
    const a=accounting(c),balances=aggregates(c).balance;
    const views={
      profit:{title:"Daily operating result",description:"Revenue less current staff wages and advertising. Other costs are not included unless supplied by Torn.",rows:[["Revenue",money(a.revenue)],["Wages",money(a.wages)],["Advertising",money(a.ad)],["Estimated result",a.known?money(a.profit):"Incomplete"],["Loss headroom",a.known?money(a.headroom):"Unknown"]]},
      trains:{title:"Training obligations",description:"Confirmed paid commitments minus recorded training, including credits.",rows:[["Employees with balances",Object.keys(balances).length],["Trains outstanding",Object.values(balances).reduce(function(t,b){return t+b.owed;},0)]]},
      available:{title:"Available company trains",description:"Current stockpile reported by Torn. Visit Training to assign available trains manually.",rows:[["Available",c.profile.trains==null?"Unknown":c.profile.trains]]},
      employees:{title:"Staff coverage",description:"Staffing and suitability are advisory. The fit percentage measures working-stat requirement coverage, not actual Torn effectiveness.",rows:[["Employed",c.staff.length],["Capacity",num(c.profile.employees&&c.profile.employees.capacity)]]},
      rating:{title:"Road to ten stars",description:"Rating is competitive. Review performance, marketing, staffing and membership pricing before making changes.",rows:[["Current stars",c.profile.rating+" / 10"],["Daily revenue",money(a.revenue)]]},
      wages:{title:"Daily wages",description:"Total daily staff wages based on the latest manually refreshed employee roster.",rows:[["Wages",money(a.wages)]]},
      ads:{title:"Advertising budget",description:"The current daily budget. Compare changes against later revenue snapshots; this does not prove causation.",rows:[["Daily advertising",money(a.ad)]]},
      revenue:{title:"Daily revenue",description:"Company income reported by Torn at the last manual refresh.",rows:[["Daily revenue",money(a.revenue)]]}
    };
    const v=views[detailView]||views.rating;
    return '<section class="tch-panel"><button data-act="detail-back">← Back</button><h2>'+esc(v.title)+'</h2><p>'+esc(v.description)+'</p>'+
      v.rows.map(function(r){return '<div class="tch-queueitem"><strong>'+esc(r[0])+'</strong><b>'+esc(r[1])+'</b></div>';}).join("")+
      '<div class="tch-actionrow"><button data-act="tab" data-tab="growth">Growth analysis</button><button data-act="tab" data-tab="training">Training ledger</button><button data-act="tab" data-tab="employees">Staff analysis</button></div></section>';
  }
  function fitV2(c,p,roleName){
    const role=roleList(c).find(function(r){return r.name===roleName;});
    return role?score(p,role):null;
  }
  function fitLabelV2(n){return n===null?"Unknown":n.toFixed(1)+"%";}
  function todayV2(c) {
    if(!c || !c.profile)return introV2();
    const a=accounting(c), balances=aggregates(c).balance;
    const owed=Object.values(balances).reduce(function(t,b){return t+b.owed;},0);
    const due=Object.keys(balances).filter(function(k){return balances[k].owed>0;}).length;
    const lossBreach=a.known && a.profit < -num(c.lossLimit);
    const newsReview=c.news.filter(function(n){return !c.training.some(function(t){return canonicalTrainingSource(t)==="news:"+n.id;});}).length;
    const moneyReview=pendingPaymentLogs(c).length;
    return '<button type="button" data-act="goto" data-target="growth-performance" class="tch-hero tch-clickable tch-hero-button"><div class="tch-kicker">YOUR FITNESS CENTER · TAP FOR GROWTH DETAILS</div>'+
      '<div class="tch-hero-line"><strong>'+esc(c.profile.name||"Company")+'</strong><span class="tch-rating">'+esc(c.profile.rating)+' ★</span></div>'+
      '<div class="tch-progress"><b style="width:'+Math.min(100,Math.max(0,num(c.profile.rating)*10))+'%"></b></div>'+
      '<small>10-star ambition · Max daily operating loss '+esc(money(c.lossLimit))+'</small></button>'+
      '<div class="tch-metrics">'+
      metricV2("Estimated daily P/L",a.known?money(a.profit):"Incomplete",a.known?(lossBreach?"Loss limit breached":"Based on current costs"):"Missing expense data",lossBreach?"tch-danger":a.known?"tch-positive":"","growth-accounts")+
      metricV2("Outstanding trains",owed.toLocaleString(),due+" employee account(s)","","training-queue")+
      metricV2("Trains available",c.profile.trains==null?"—":c.profile.trains,"Company stockpile","","training-queue")+
      metricV2("Employees",c.staff.length+" / "+num(c.profile.employees&&c.profile.employees.capacity),"Current roster","","staff")+'</div>'+
      actionPanelV3(c)+
      '<section class="tch-panel"><h2>Quick actions</h2><div class="tch-actiongrid">'+
      '<button data-act="tab" data-tab="training">Check training queue<span>Paid and outstanding</span></button>'+
      '<button data-act="tab" data-tab="employees">Optimise staff<span>Suggested roles</span></button>'+
      '<button data-act="tab" data-tab="growth">Company performance<span>Costs and membership</span></button>'+
      '<button data-act="refresh" '+(busy?"disabled":"")+'>Refresh Torn data<span>Only when you tap</span></button>'+
      '</div></section>';
  }
  function buttonsV2(group,items){
    return '<div class="tch-switch" role="group" aria-label="'+esc(group)+'">'+items.map(function(x){
      return '<button data-act="'+x.action+'" data-view="'+x.id+'" class="'+(x.active?"active":"")+'">'+esc(x.name)+'</button>';
    }).join("")+'</div>';
  }
  function staffV2(c){
    if(!c||!c.staff||!c.staff.length)return introV2();
    if(staffView==="detail")return employeeDetail(c,selectedEmployee);
    const options=[
      {action:"staff-view",id:"positions",name:"Suggestions",active:staffView==="positions"},
      {action:"staff-view",id:"roster",name:"Roster",active:staffView==="roster"},
      {action:"staff-view",id:"simulator",name:"Team simulator",active:staffView==="simulator"}
    ];
    if(staffView==="simulator")return '<div class="tch-section"><h2>Staff optimiser</h2><p>Explore alternative staffing plans before making decisions.</p>'+buttonsV2("Staff view",options)+'</div>'+scenarioV2(c);
    const roles=roleList(c),sc=scenarioModel(c),suggested=suggestions(c);
    const suggestionById={};
    suggested.forEach(function(x){suggestionById[x.person.id]=x;});
    const people=sc.rows.slice().sort(function(a,b){
      if(staffView!=="positions")return String(a.person.name).localeCompare(String(b.person.name));
      const ar=suggestionById[a.person.id],br=suggestionById[b.person.id];
      return Number(Boolean(br&&br.recommend))-Number(Boolean(ar&&ar.recommend));
    });
    return '<div class="tch-section"><h2>Staff optimiser</h2><p>Current-role fit is calculated from working-stat requirements, independently of the effectiveness Torn reports.</p>'+
      buttonsV2("Staff view",options)+'</div>'+
      '<section class="tch-panel"><div class="tch-sectionhead"><h2>Current team</h2><span class="tch-mini">'+c.staff.length+' employees</span></div>'+
      '<div class="tch-comparison"><div><span>Average role fit</span><strong>'+fitText(sc.averageBefore)+'</strong></div>'+
      '<div><span>Team changes tested</span><strong>'+sc.changeCount+'</strong></div></div>'+
      (sc.count<c.staff.length?'<p class="tch-hint">Only '+sc.count+' staff have comparable role requirements and stats.</p>':"")+
      '<button data-act="staff-view" data-view="simulator">Open team simulator →</button></section>'+
      '<div class="tch-list">'+people.map(function(r){
        const p=r.person,stats=p.stats||{},effect=p.effectiveness||{},suggestion=suggestionById[p.id];
        const best=suggestion&&suggestion.recommend?suggestion.proposed:null;
        return '<article class="tch-person"><button class="tch-person-button" data-act="employee-detail" data-id="'+esc(p.id)+'">'+
          '<div class="tch-personhead"><div class="tch-avatar">'+esc(String(p.name||"?").slice(0,1).toUpperCase())+'</div>'+
          '<div><strong>'+esc(p.name)+'</strong><small>'+esc(r.current)+'</small></div><span class="tch-eff">'+
          (effect.total==null?"—":esc(effect.total))+' <small>Torn EFF</small></span></div>'+
          '<div class="tch-fitpair"><div><small>Current role fit</small><strong>'+fitText(r.actualFit)+'</strong></div>'+
          (best?'<div><small>Suggested: '+esc(best)+'</small><strong>'+fitText(fitFor(p,roles,best))+'</strong></div>':
          '<div><small>Suggested</small><strong>Keep current</strong></div>')+'</div>'+
          '<div class="tch-statstrip"><span>MAN <b>'+Math.round(num(stats.manual_labor)).toLocaleString()+'</b></span>'+
          '<span>INT <b>'+Math.round(num(stats.intelligence)).toLocaleString()+'</b></span>'+
          '<span>END <b>'+Math.round(num(stats.endurance)).toLocaleString()+'</b></span></div>'+
          '<span class="tch-linkhint">View role breakdown and compare positions →</span></button></article>';
      }).join("")+'</div>';
  }

  function trainingV2(c){
    if(!c||!c.profile)return introV2();
    const balances=aggregates(c),people=balances.people;
    const opts=c.staff.concat(c.archived||[]).map(function(p){return '<option value="'+esc(p.id)+'">'+esc(p.name)+'</option>';}).join("");
    const unique=uniqueTrainingEvents(c);
    const due=Object.entries(balances.balance).filter(function(e){return e[1].owed>0;}).sort(function(a,b){
      const pa=c.staff.find(function(p){return String(p.id)===a[0];}),pb=c.staff.find(function(p){return String(p.id)===b[0];});
      const ia=pa&&num(pa.days_in_company)<3,ib=pb&&num(pb.days_in_company)<3;
      return Number(ia)-Number(ib) || (a[1].oldest||Infinity)-(b[1].oldest||Infinity);
    });
    const pending=pendingPaymentLogs(c);
    const reviewNews=(c.news||[]).filter(function(n){return !c.training.some(function(t){return canonicalTrainingSource(t)==="news:"+n.id;});});
    const switches=buttonsV2("Training screens",[
      {action:"training-view",id:"queue",name:"Queue",active:trainingView==="queue"},
      {action:"training-view",id:"payments",name:"Payments"+(pending.length?" ("+pending.length+")":""),active:trainingView==="payments"},
      {action:"training-view",id:"history",name:"History"+(reviewNews.length?" ("+reviewNews.length+")":""),active:trainingView==="history"},
      {action:"training-view",id:"records",name:"Records",active:trainingView==="records"}
    ]);
    let body="";
    if(trainingView==="queue"){
      body='<section class="tch-panel"><div class="tch-sectionhead"><h2>Oldest commitments first</h2><span class="tch-mini">'+due.length+' waiting</span></div>'+
        '<p>Ineligible employees are temporarily skipped without losing their original priority. Training credits reduce future purchases.</p>'+
        (due.length?due.map(function(e){
          const id=e[0],p=c.staff.find(function(x){return String(x.id)===id;}),locked=p&&num(p.days_in_company)<3;
          return '<button type="button" data-act="employee-detail" data-id="'+esc(id)+'" class="tch-queueitem tch-taprow"><div><strong>'+esc(people[id]||"#"+id)+'</strong><small>'+esc(e[1].oldest?day(e[1].oldest):"Historical opening balance")+(locked?" · Not yet eligible":"")+'</small></div><div><b>'+e[1].owed+'</b><small>owed</small></div><span class="tch-tilearrow">↗</span></button>';
        }).join(""):'<div class="tch-empty">Nobody has confirmed outstanding paid training.</div>')+
        '</section><section class="tch-panel"><h2>Record a completed train</h2><p>Use this for a train not already imported from company history.</p>'+
        '<div class="tch-fieldrow"><select id="tch-train-person">'+opts+'</select><input aria-label="Number of trains" id="tch-train-units" type="number" min="1" max="20" value="1">'+
        '<button class="primary" data-act="add-training">Record</button></div></section>';
    } else if(trainingView==="payments"){
      body='<section class="tch-panel"><h2>Import money received</h2><p>Imports run only when you tap. Sender and amount are matched automatically where possible. Confirm which transfers were actually for training before any trains are credited.</p>'+
        '<div class="tch-actionrow"><button class="primary" data-act="rescan-logs">Check recent</button><button data-act="import-logs">Load older</button></div>'+
        '<p class="tch-hint">If Torn rejects money logs, set a custom API key for this script in Torn PDA with user/log permission. Your ordinary PDA key can still load company figures.</p></section>'+
        '<section class="tch-panel"><div class="tch-sectionhead"><h2>Needs review</h2><span class="tch-mini">'+pending.length+'</span></div>'+
        (pending.length?pending.slice().sort(function(a,b){return b.timestamp-a.timestamp;}).slice(0,paymentViewLimit).map(function(n){
          const g=n.suggestion||{},id=esc(n.id),sel=g.senderId||g.playerId||"";
          return '<article class="tch-review"><strong>'+esc(day(n.timestamp))+'</strong><p>'+esc(n.matchReason||g.reason||n.title||"Confirm the purpose of this transfer")+'</p>'+
            '<label>Employee<select data-field="log-person" data-id="'+id+'"><option value="">Select recipient</option>'+c.staff.concat(c.archived||[]).map(function(p){return '<option value="'+esc(p.id)+'" '+(String(sel)===String(p.id)?"selected":"")+'>'+esc(p.name)+'</option>';}).join("")+'</select></label>'+
            '<div class="tch-fieldrow"><label>Money received<input data-field="log-amount" data-id="'+id+'" type="number" min="1" value="'+esc(g.amount||"")+'"></label><label>Trains to credit<input data-field="log-units" data-id="'+id+'" type="number" min="0" value="'+esc(g.trains==null?"":g.trains)+'"></label></div>'+
            '<div class="tch-actionrow"><button class="primary" data-act="approve-log" data-id="'+id+'">Confirm training purchase</button><button data-act="ignore-log" data-id="'+id+'">Not training money</button></div></article>';
        }).join(""):'<div class="tch-empty">No pending transfer decisions. Only confirmed training purchases affect balances.</div>')+
        (pending.length>paymentViewLimit?'<button data-act="more-payments">Show next '+Math.min(35,pending.length-paymentViewLimit)+' transfers</button>':"")+'</section>'+
        '<section class="tch-panel"><h2>Add a manual payment</h2><div class="tch-fieldrow"><select id="tch-pay-person">'+opts+'</select>'+
        '<input id="tch-pay-amount" type="number" min="1" placeholder="$ received" aria-label="Amount received">'+
        '<input id="tch-pay-units" type="number" min="0" placeholder="Trains" aria-label="Trains purchased"></div>'+
        '<button data-act="add-payment">Save payment locally</button><p class="tch-hint">You choose how to allocate non-standard and partial payments.</p></section>';
    } else if(trainingView==="history"){
      body='<section class="tch-panel"><h2>Company training history</h2><p>Each Torn news ID can count only once. Matching happens locally after you initiate the import.</p>'+
        '<div class="tch-actionrow"><button class="primary" data-act="rescan-news">Check recent</button><button data-act="import-news">Load older</button><button data-act="match-news">Recheck matches</button></div>'+
        '<div class="tch-minikpis"><span>'+unique.filter(function(t){return !!t.sourceId;}).length+' matched</span><span>'+reviewNews.length+' to check</span></div></section>'+
        '<section class="tch-panel"><h2>Unmatched records</h2>'+
        (reviewNews.length?reviewNews.slice().sort(function(a,b){return b.timestamp-a.timestamp;}).slice(0,30).map(function(n){
          const g=matchTrainingNews(n,c);
          return '<article class="tch-review"><strong>'+esc(day(n.timestamp))+'</strong><p>'+esc(cleanNews(n.text)).slice(0,400)+'</p>'+
            '<div class="tch-fieldrow"><select id="tch-news-person-'+esc(n.id)+'"><option value="">Select employee</option>'+c.staff.concat(c.archived||[]).map(function(p){
              return '<option value="'+esc(p.id)+'" '+(String(g.playerId||"")===String(p.id)?"selected":"")+'>'+esc(p.name)+'</option>';
            }).join("")+'</select><input type="number" data-news-units="'+esc(n.id)+'" min="1" max="20" value="'+esc(g.units||1)+'" aria-label="Trains"></div>'+
            '<button class="primary" data-act="assign-news" data-id="'+esc(n.id)+'">Confirm locally</button></article>';
        }).join(""):'<div class="tch-empty">Every imported record with a recognised recipient has been matched.</div>')+
        '</section>';
    } else {
      const logs=c.payments.map(function(p){return {id:p.id,ts:p.ts,type:"Payment",person:p.playerId,units:p.trains,money:p.amount,voided:p.voided,unverified:p.source==="log-auto"&&!p.voided};})
        .concat(c.training.map(function(t){return {id:t.id,ts:t.ts,type:"Training",person:t.playerId,units:t.units,money:null,voided:t.voided};}))
        .sort(function(a,b){return b.ts-a.ts;});
      body='<section class="tch-panel"><h2>Audit records</h2><p>Previous corrections remain traceable. Re-imported Torn records cannot increase balances twice.</p>'+
        '<button data-act="repair-duplicates">Check duplicate imports</button>'+
        logs.slice(0,70).map(function(e){
          return '<div class="tch-record"><div><strong>'+esc(e.type)+(e.voided?" · VOID":e.unverified?" · NOT VERIFIED":"")+'</strong><small>'+esc(people[e.person]||"#"+e.person)+' · '+esc(day(e.ts))+'</small></div>'+
            '<div><b>'+esc(e.type==="Payment"?money(e.money):e.units+" trains")+'</b>'+
            (!e.voided?'<button data-act="void-entry" data-id="'+esc(e.id)+'">Void</button>':"")+'</div></div>';
        }).join("")+'</section>';
    }
    return '<div class="tch-section"><h2>Training ledger</h2><p>Paid commitments, automatic history matching and account corrections.</p>'+switches+'</div>'+body;
  }

  function recentObservations(c,days) {
    const byDay={};
    (c.snapshots||[]).filter(function(s){return s&&s.complete&&s.observedAt&&Number.isFinite(Number(s.revenue));})
      .forEach(function(s){byDay[String(s.observedAt).slice(0,10)]=s;});
    return Object.keys(byDay).sort().map(function(k){return byDay[k];}).slice(-(days||8));
  }
  function growthChecks(c){
    if(!c||!c.profile)return [];
    const result=[],profile=c.profile,a=accounting(c);
    if(a.known&&a.headroom<0)result.push({title:"Daily loss limit exceeded",note:"Operating estimate is "+money(-a.headroom)+" below your limit.",link:"growth-accounts"});
    const vacancies=Math.max(0,num(profile.employees&&profile.employees.capacity)-c.staff.length);
    if(vacancies>0)result.push({title:vacancies+" vacant staff position"+(vacancies===1?"":"s"),note:"Review whether hiring into under-covered roles could improve revenue.",link:"staff-sim"});
    const missing=scenarioModel(c).coverage.filter(function(x){return !x.actual;}).map(function(x){return x.name;});
    if(missing.length)result.push({title:"Special-role coverage to investigate",note:"No current "+missing.join(", ")+". The effect of these roles is company-wide, not captured by fit alone.",link:"staff-sim"});
    if(a.known&&a.revenue>0)result.push({title:"Advertising is "+(100*a.ad/a.revenue).toFixed(1)+"% of revenue",
      note:"This ratio is not an advertising ROI measurement. Compare price and ad experiments before changing them.",link:"growth-pricing"});
    const dates=recentObservations(c,8);
    if(dates.length>=3) {
      const old=dates.slice(0,-1),baseline=old.reduce(function(sum,x){return sum+x.revenue;},0)/old.length;
      const trend=baseline>0?(dates[dates.length-1].revenue-baseline)/baseline*100:null;
      if(trend!==null&&Math.abs(trend)>=5)result.push({title:"Observed revenue "+(trend<0?"down ":"up ")+Math.abs(trend).toFixed(1)+"%",
        note:"Latest refresh day vs "+old.length+" earlier observed days; observational, not a causal change.",link:"growth-accounts"});
    }
    return result;
  }
  function growthAdvisorV2(c){
    const a=accounting(c),checks=growthChecks(c),latest=recentObservations(c,7);
    const limit=a.known?Math.max(0,a.revenue-a.wages+num(c.lossLimit)):null;
    return '<section class="tch-panel"><h2>Growth checks</h2><p>Review these before making company changes. They are diagnostic, not guarantees of higher stars.</p>'+
      (checks.length?checks.map(function(x){return '<button class="tch-insight" data-act="goto" data-target="'+esc(x.link)+'">'+
        '<strong>'+esc(x.title)+'</strong><small>'+esc(x.note)+'</small><span>↗</span></button>';}).join(""):
        '<p class="tch-empty">No obvious issues found. More manually refreshed history can make these comparisons more useful.</p>')+
      '</section><section class="tch-panel"><h2>Operating limits</h2><div class="tch-metrics">'+
      metricV2("Observed days",latest.length+" / 7","Saved day-by-day observations","","growth-accounts")+
      metricV2("Weekly gross income",money(c.profile.income&&c.profile.income.weekly),"Torn-reported","","growth-accounts")+
      metricV2("Advert ceiling at current revenue",limit===null?"Unknown":money(limit),"Cost-only estimate within loss policy","","growth-pricing")+
      metricV2("Budget headroom",a.known?money(a.headroom):"Unknown","At today's reported revenue","","growth-accounts")+
      '</div><p class="tch-hint">Changing advertising can also change sales. The ceiling assumes unchanged income and wages.</p></section>';
  }

  function growthV2(c){
    if(!c||!c.profile)return introV2();
    const a=accounting(c);
    const switches=buttonsV2("Growth views",[
      {action:"growth-view",id:"performance",name:"Overview",active:growthView==="performance"},
      {action:"growth-view",id:"pricing",name:"Pricing & ads",active:growthView==="pricing"},
      {action:"growth-view",id:"accounts",name:"Accounts",active:growthView==="accounts"}]);
    return '<div class="tch-section"><h2>10-star growth</h2><p>Revenue improvement within your daily loss limit of '+esc(money(c.lossLimit))+'. Estimates are labelled.</p>'+switches+'</div>'+
      (growthView==="performance"?'<div class="tch-metrics">'+
         metricV2("Current rating",c.profile.rating+" / 10","Competitive star progression","","growth-performance")+
         metricV2("Daily revenue",money(a.revenue),"Reported by Torn","","growth-accounts")+
         metricV2("Wages",money(a.wages),"Current daily staff wages","","growth-accounts")+
         metricV2("Advertising",money(a.ad),"Current daily spend","","growth-pricing")+'</div>'+
         '<section class="tch-panel"><h2>Profit and growth</h2><div class="tch-highlight-number">'+esc(a.known?money(a.profit):"Incomplete")+'</div><p>Estimated operating P/L after current wages and advertising, excluding unknown costs.</p>'+
         '<div class="tch-priority '+(!a.known?"warning":a.headroom<0?"danger":"ok")+'"><span>'+(!a.known?"?":a.headroom<0?"!":"✓")+'</span><div><strong>'+esc(a.known?money(a.headroom):"Unknown")+' headroom</strong><small>'+(!a.known?"Financial inputs are incomplete; loss policy cannot be assessed.":"Relative to permitted −"+esc(money(c.lossLimit))+" daily operating result")+'</small></div></div></section>'+growthAdvisorV2(c):
      growthView==="pricing"?growth(c):finances(c));
  }
  function settingsV2(c){
    const native=hasPdaKey(), connected=Boolean(activeApiKey());
    return '<div class="tch-section"><h2>Connection & preferences</h2><p>Keep the technical settings separate from everyday decisions.</p></div>'+
      '<section class="tch-panel"><div class="tch-sectionhead"><h2>Torn PDA API</h2><span class="tch-mini '+(connected?"good":"warn")+'">'+(connected?"KEY AVAILABLE":"NOT CONNECTED")+'</span></div>'+
      '<p>'+(native?"Your Torn PDA API key is detected. No repeated key entry is needed.":"Torn PDA has not supplied an API key to this script. Configure the app key or enter one below.")+'</p>'+
      '<p class="tch-hint">To import personal payments, set a suitably restricted custom userscript API key in Torn PDA. Its app-wide key may lack user/log permissions. Keep personal money access limited.</p>'+
      '<label>Optional session-only key override<input id="tch-key" type="password" autocomplete="off" placeholder="'+(key?"Custom key active for this session":"Paste a custom key only if needed")+'"></label>'+
      '<div class="tch-actionrow"><button class="primary" data-act="use-key">Use key</button><button data-act="clear-key">Return to PDA key</button></div></section>'+
      '<section class="tch-panel"><h2>Appearance</h2><div class="tch-actionrow"><button data-act="set-theme" data-theme="dark" class="'+(data.themeMode!=="light"?"primary":"")+'">Dark</button>'+
      '<button data-act="set-theme" data-theme="light" class="'+(data.themeMode==="light"?"primary":"")+'">Light</button></div></section>'+
      '<section class="tch-panel"><h2>More settings</h2><p>Budget guardrail, private backup and restore, and advanced data controls.</p>'+
      '<button data-act="toggle-advanced">'+(advancedSettings?"Hide advanced settings":"Show advanced settings")+'</button></section>'+
      (advancedSettings?settings(c):"");
  }

  function draw() {
    opener.hidden=open || !isCompanyPage();
    root.hidden=!open || !isCompanyPage();
    if(!open)return;
    const c=current();
    let body="";
    if(detailView)body=detailsV2(c);
    else if(tab==="overview")body=todayV2(c);
    else if(tab==="employees")body=staffV2(c);
    else if(tab==="training")body=trainingV2(c);
    else if(tab==="growth")body=growthV2(c);
    else if(tab==="settings")body=settingsV2(c);
    root.className=data.themeMode==="light"?"theme-light":"";
    root.innerHTML=headV2(c)+'<main class="tch-main">'+
      (message?'<div class="notice '+esc(severity)+'">'+esc(message)+'</div>':"")+
      (busy?'<div class="notice">Reading Torn API after your request…</div>':"")+body+'</main>'+tabsV2();
  }
  function notify(s,level) {message=s;severity=level || "";draw();}
  async function work(task) {
    if (busy) return;
    busy=true;message="";draw();
    try {await task();if(!message)message="Completed.";severity="good";}
    catch (e) {message=String(e && e.message || e);severity="bad";}
    finally {busy=false;draw();}
  }
  async function refresh() {
    await work(async function () {
      const res=await read("company/profile");
      const p=res.profile;
      if (!p || !p.id) throw Error("API returned no company profile.");
      if (companyId && String(companyId)!==String(p.id)) message="Switched company: data is separated by ID.";
      companyId=String(p.id);
      const c=current();
      if(c && c.payments)migrateAutoPaymentClaims(c);
      const e=await read("company/employees");
      const st=await read("company/stock");
      const staff=assertArray(e.employees);
      if (!staff.length && num(p.employees && p.employees.hired)>0) throw Error("Employee data unavailable; check director permissions.");
      c.staff=staff;
      c.stock=assertArray(st.stock);
      c.profile=p;
      c.lastRefresh=new Date().toISOString();
      c.archived=c.archived || [];
      const activeIds=new Set(staff.map(function (x) {return String(x.id);}));
      c.previousStaff && c.previousStaff.forEach(function (old) {
        if (!activeIds.has(String(old.id)) && !c.archived.some(function (x) {return String(x.id)===String(old.id);})) c.archived.push({id:old.id,name:old.name});
      });
      c.previousStaff=staff.map(function (p) {return {id:p.id,name:p.name};});
      if (companyType(p)) {
        try {
          const r=await read("torn/"+companyType(p)+"/companies");
          const roles=normalizeRoles(r,companyType(p));
          if (roles.length) c.roles=roles;
        } catch (_) { /* Fallback only for known Fitness Center requirements. */ }
      }
      const a=accounting(c);
      c.snapshots.push({observedAt:c.lastRefresh,revenue:a.revenue,wages:a.wages,ad:a.ad,profit:a.profit,complete:a.known,rating:p.rating,customers:p.customers && p.customers.daily,price:c.stock[0] && c.stock[0].price,
        roster:Object.fromEntries(c.staff.map(function(e){return [String(e.id),{
          position:e.position&&e.position.name||null,effectiveness:e.effectiveness&&e.effectiveness.total!=null?Number(e.effectiveness.total):null,
          stats:{manual_labor:e.stats&&e.stats.manual_labor,intelligence:e.stats&&e.stats.intelligence,endurance:e.stats&&e.stats.endurance}
        }];}))});
      if (c.snapshots.length>700) c.snapshots=c.snapshots.slice(-700);
      await persist();
    });
  }
  async function importNews(newest) {
    await work(async function () {
      const c=current();
      if (!c || !c.profile) throw Error("Refresh company profile first.");
      const params={cat:"training",limit:"100",sort:"DESC"};
      if (c.newsCursor && !newest) params.to=String(c.newsCursor);
      const response=await read("company/news",params);
      const list=normaliseNewsResponse(response.news);
      if (!list.length) {message="No further training news available.";return;}
      let added=0,minTs=Infinity;
      list.forEach(function (n) {
        if (!n || !n.id || !Number.isFinite(Number(n.timestamp))) return;
        minTs=Math.min(minTs,num(n.timestamp));
        if (c.news.some(function (x) {return String(x.id)===String(n.id);})) return;
        c.news.push({id:String(n.id),timestamp:num(n.timestamp),text:String(n.text || "").slice(0,700)});
        added++;
      });
      if (Number.isFinite(minTs) && !newest) c.newsCursor=minTs-1;
      const fixed=repairImportDuplicates(c);
      const summary=reconcileTraining(c);
      await persist();
      message="Imported "+added+" new history entries, matched "+summary.matched+" training records; "+summary.review+" need review. "+fixed+" repeated historical entries repaired.";
    });
  }
  async function importLogs(newest) {
    await work(async function(){
      const c=current();
      if(!c||!c.profile)throw Error("Refresh company data first.");
      if(!c.incomingTypesVerified) {
        const response=await read("torn/logtypes");
        const types=findMoneyTypes(response);
        if(!types.length)throw Error("Torn returned no recognisable incoming-money log types for this API key.");
        const selected=types.slice(0,10).map(function(t){return t.id;}).join(",");
        if(selected!==c.logTypes){c.logTypes=selected;c.logCursor=null;}
        c.incomingTypesVerified=true;
      }
      if(!/^\d+(,\d+){0,9}$/.test(c.logTypes))throw Error("Payment type settings are invalid.");
      const params={log:c.logTypes,limit:"100"};
      if(c.logCursor && !newest) params.to=String(c.logCursor);
      const response=await read("user/log",params);
      const list=Array.isArray(response.log)?response.log:Object.entries(response.log||{}).map(function(pair){
        return Object.assign({id:pair[0]},pair[1]);
      });
      let added=0,updated=0,minTs=Infinity;
      list.forEach(function(log){
        if(!log || !log.id || !Number.isFinite(Number(log.timestamp)))return;
        const entryId=String(log.id),ts=Number(log.timestamp);
        minTs=Math.min(minTs,ts);
        const suggestion=parseIncomingLog(log,c);
        const existing=(c.logs||[]).find(function(n){return String(n.id)===entryId;});
        if(existing) {
          if(!existing.suggestion || existing.suggestion.status==="review"){
            existing.suggestion=suggestion;existing.title=String(log.details&&log.details.title||"Incoming money").slice(0,160);updated++;
          }
          return;
        }
        c.logs.push({id:entryId,timestamp:ts,title:String(log.details&&log.details.title||"Incoming money").slice(0,160),suggestion:suggestion});
        added++;
      });
      if(Number.isFinite(minTs))c.logCursor=minTs-1;
      const duplicates=repairImportDuplicates(c);
      const classified=applyMatchedPayments(c);
      await persist();
      message="Imported "+added+" incoming transfers; "+classified.suggested+" have a suggested employee and train count, "+
        classified.review+" need manual details. Confirm purchases in Training → Payments. Updated "+updated+" older entries.";
    });
  }
  function positionLauncher() {
    const rect=opener.getBoundingClientRect();
    const w=window.innerWidth, h=window.innerHeight;
    const safeX=Math.max(0,w-Math.max(rect.width,120)), safeY=Math.max(0,h-Math.max(rect.height,42));
    const pos=data.launcher && Number.isFinite(data.launcher.x) && Number.isFinite(data.launcher.y) ? data.launcher : {x:1,y:0.86};
    opener.style.left=Math.round(Math.max(0,Math.min(1,pos.x))*safeX)+"px";
    opener.style.top=Math.round(Math.max(0,Math.min(1,pos.y))*safeY)+"px";
  }
  function syncCompanyVisibility() {
    const show=isCompanyPage();
    opener.hidden=!show || open;
    if (!show && open) {open=false;root.hidden=true;}
    if (show) positionLauncher();
  }
  let drag=null;
  opener.addEventListener("pointerdown",function(e){
    if (!isCompanyPage()) return;
    const r=opener.getBoundingClientRect();
    drag={x:e.clientX,y:e.clientY,left:r.left,top:r.top,moved:false,pointer:e.pointerId};
    launcherDragged=false;
    if(opener.setPointerCapture) opener.setPointerCapture(e.pointerId);
  });
  opener.addEventListener("pointermove",function(e){
    if(!drag || drag.pointer!==e.pointerId) return;
    const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
    if(!drag.moved && Math.hypot(dx,dy)<8) return;
    drag.moved=true; launcherDragged=true;
    const x=Math.max(0,Math.min(window.innerWidth-opener.offsetWidth,drag.left+dx));
    const y=Math.max(0,Math.min(window.innerHeight-opener.offsetHeight,drag.top+dy));
    opener.style.left=Math.round(x)+"px";opener.style.top=Math.round(y)+"px";
  });
  opener.addEventListener("pointerup",function(e){
    if(!drag || drag.pointer!==e.pointerId) return;
    if(drag.moved) {
      const maxX=Math.max(1,window.innerWidth-opener.offsetWidth),maxY=Math.max(1,window.innerHeight-opener.offsetHeight);
      data.launcher={x:Math.max(0,Math.min(1,parseFloat(opener.style.left)/maxX)),y:Math.max(0,Math.min(1,parseFloat(opener.style.top)/maxY))};
      persist().catch(function(){notify("Could not save launcher position.","bad");});
    }
    drag=null;
  });
  opener.addEventListener("pointercancel",function(){drag=null;});
  opener.addEventListener("click",function(e) {
    if(launcherDragged){launcherDragged=false;e.preventDefault();return;}
    if(!isCompanyPage()) return;
    open=true;message="";draw();
  });
  window.addEventListener("resize",syncCompanyVisibility);
  window.addEventListener("popstate",syncCompanyVisibility);
  window.addEventListener("hashchange",syncCompanyVisibility);
  // Watch only route changes: Torn can navigate without popstate.
  let observedPath=window.location.pathname;
  if(typeof MutationObserver!=="undefined") {
    const routeObserver=new MutationObserver(function(){
      if(observedPath!==window.location.pathname){
        observedPath=window.location.pathname;
        syncCompanyVisibility();
      }
    });
    routeObserver.observe(document.body,{childList:true,subtree:true});
  }
  syncCompanyVisibility();

  root.addEventListener("click",async function (evt) {
    const el=evt.target.closest("button[data-act]");if (!el) return;
    const act=el.dataset.act, c=current();
    if (act==="close") {open=false;draw();return;}
    if (act==="tab") {detailView="";tab=el.dataset.tab;message="";draw();return;}
    if (act==="metric-detail"){detailView=el.dataset.target;draw();return;}
    if (act==="detail-back"){detailView="";draw();return;}
    if (act==="staff-view"){staffView=el.dataset.view;selectedEmployee=null;draw();return;}
    if (act==="training-view"){trainingView=el.dataset.view;draw();return;}
    if (act==="more-payments"){paymentViewLimit+=35;draw();return;}
    if (act==="growth-view"){growthView=el.dataset.view;draw();return;}
    if (act==="finance-focus"){if(["revenue","wages","ad","profit"].includes(el.dataset.field)){financeFocus=el.dataset.field;draw();}return;}
    if (act==="goto"){
      const target=el.dataset.target;
      const routes={"growth-performance":["growth","performance"],"growth-accounts":["growth","accounts"],
        "growth-pricing":["growth","pricing"],"training-queue":["training","queue"],
        "training-payments":["training","payments"],"training-history":["training","history"],"staff":["employees","roster"],"staff-sim":["employees","simulator"]};
      if(target==="refresh"){refresh();return;}
      if(!Object.prototype.hasOwnProperty.call(routes,target))return;
      const route=routes[target];tab=route[0];if(tab==="growth")growthView=route[1];
      if(tab==="training")trainingView=route[1];if(tab==="employees")staffView=route[1];
      draw();return;
    }
    if (act==="employee-detail"){selectedEmployee=el.dataset.id;staffView="detail";tab="employees";draw();return;}
    if (act==="try-suggested"){
      if(!c)return notify("Refresh staff first.","bad");
      const recommended=suggestions(c),proposed={};
      recommended.forEach(function(r){if(r.recommend&&r.proposed&&r.proposed!==r.actual)proposed[r.person.id]=r.proposed;});
      c.whatIf=proposed;return work(persist);
    }
    if (act==="toggle-advanced"){advancedSettings=!advancedSettings;draw();return;}
    if (act==="set-theme"){data.themeMode=el.dataset.theme;await work(persist);return;}
    if (act==="clear-key"){key="";notify(hasPdaKey()?"Using Torn PDA key.":"No API key supplied by PDA.","good");return;}
    if (act==="jump-review"){tab="training";trainingView="payments";draw();return;}
    if (act==="jump-history"){tab="training";trainingView="history";draw();return;}
    if (act==="refresh") return refresh();
    if (act==="import-news") return importNews(false);
    if (act==="rescan-news") return importNews(true);
    if (act==="match-news") {
      if (!c) return notify("Refresh first.","bad");
      const fixed=repairImportDuplicates(c);
      const result=reconcileTraining(c);
      await work(persist);
      return notify("Matched "+result.matched+" records; "+result.review+" need review; "+fixed+" exact duplicate source records repaired.");
    }
    if (act==="discover-logs") return work(async function(){
      if (!c) throw Error("Refresh your company first.");
      const response=await read("torn/logtypes");
      c.discoveredMoneyTypes=findMoneyTypes(response);
      await persist();
      message=c.discoveredMoneyTypes.length?"Found possible money-transfer types. Select incoming player payments only.":"No matching payment types discovered; check permissions.";
    });
    if (act==="save-discovered-logs") {
      if (!c) return notify("Refresh first.","bad");
      const ids=Array.from(root.querySelectorAll("[data-log-choice]:checked")).map(function(x){return x.dataset.logChoice;});
      if (ids.length>10) return notify("Select at most 10 log types.","bad");
      const selected=ids.join(",");
      if (selected!==c.logTypes){c.logTypes=selected;c.logCursor=null;c.logs=[];}
      return work(persist);
    }
    if (act==="import-logs") return importLogs(false);
    if (act==="rescan-logs") return importLogs(true);
    if (act==="review-payments") {
      const section=root.querySelector("#tch-payment-review");
      if(section && typeof section.scrollIntoView==="function")section.scrollIntoView({behavior:"smooth",block:"start"});
      return;
    }
    if (act==="repair-duplicates") {
      if(!c)return notify("Refresh company data first.","bad");
      const fixed=repairImportDuplicates(c);
      await work(persist);
      notify("Checked history. "+fixed+" definitely duplicated training records voided without deleting the audit trail.");
      return;
    }
    if (act==="void-entry") {
      const entry=c && c.payments.concat(c.training).find(function (x) {return x.id===el.dataset.id;});
      if (!entry || entry.voided) return notify("Entry is already void or unavailable.","bad");
      if (!window.confirm("Void this local record? The original entry remains in the audit trail.")) return;
      entry.voided=true;entry.voidedAt=stamp();return work(persist);
    }
    if (act==="save-logtypes") {
      if (!c) return notify("Refresh to identify the company first.","bad");
      const typed=(root.querySelector("#tch-logtypes").value || "").replace(/\s/g,"");
      if (typed && !/^\d+(,\d+){0,9}$/.test(typed)) return notify("Use up to 10 numeric Torn log type IDs, separated by commas.","bad");
      c.logTypes=typed;c.logCursor=null;c.logs=[];
      return work(persist);
    }
    if (act==="ignore-log") {
      const entry=c && c.logs.find(function(n){return String(n.id)===String(el.dataset.id);});
      if(!entry)return notify("Payment not found.","bad");
      entry.matchStatus="ignored";return work(persist);
    }
    if (act==="approve-log") {
      const item=(c.logs || []).find(function (n) {return n.id===el.dataset.id;});
      if (!item || isApprovedLog(c,item.id) || item.matchStatus==="ignored") return notify("Already approved, ignored or missing.","bad");
      const findField=function (field) {return Array.from(root.querySelectorAll("[data-field]")).find(function (e) {return e.dataset.id===item.id && e.dataset.field===field;});};
      const player=findField("log-person"),amountField=findField("log-amount"),unitsField=findField("log-units");
      const amount=Number(amountField && amountField.value),units=Number(unitsField && unitsField.value);
      if (!player || !player.value || !amountField.value || !unitsField.value || !Number.isSafeInteger(amount) || amount<=0 || !Number.isSafeInteger(units) || units<0) return notify("Select the employee and enter approved payment amount and train count.","bad");
      const previous=c.payments.find(function(p){return !p.voided && p.source==="log-auto" && p.sourceId==="log:"+item.id;});
      if(previous){previous.voided=true;previous.voidedAt=stamp();previous.voidReason="Superseded by explicitly confirmed training purchase";previous.confirmed=false;}
      c.payments.push({id:id(),playerId:Number(player.value),amount:amount,trains:units,ts:item.timestamp,source:"log-confirmed",sourceId:"log:"+item.id,confirmed:true,reviewedAt:stamp()});
      item.matchStatus="approved";
      return work(persist);
    }
    if (act==="use-key") {key=(root.querySelector("#tch-key").value || "").trim();notify(key?"API key loaded in memory for this session.":"No key provided.");return;}
    if (act==="save-limit") {
      if (!c) return notify("Refresh to identify your company first.","bad");
      const n=Number(root.querySelector("#tch-limit").value);
      if (!Number.isSafeInteger(n) || n<0) return notify("Enter a nonnegative whole number.","bad");
      c.lossLimit=n;return work(persist);
    }
    if (act==="reset-sim") {c.whatIf={};return work(persist);}
    if (act==="run-sim") {
      const n=Number(root.querySelector("#tch-sim-ad").value);
      if (!Number.isSafeInteger(n) || n<0) return notify("Enter a valid budget.","bad");
      const a=accounting(c);
      if(!a.known)return notify("Financial inputs are incomplete. Refresh or verify revenue, wages and advertising before simulating a budget.","bad");
      c.simAd=n;c.simResult={profit:a.revenue-a.wages-n,headroom:a.revenue-a.wages-n+c.lossLimit};draw();return;
    }
    if (act==="add-payment" || act==="add-training") {
      if (!c || !c.staff.length) return notify("Load employees first.","bad");
      const payment=act==="add-payment";
      const person=root.querySelector(payment?"#tch-pay-person":"#tch-train-person");
      const units=Number(root.querySelector(payment?"#tch-pay-units":"#tch-train-units").value);
      const amount=payment?Number(root.querySelector("#tch-pay-amount").value):null;
      if (!Number.isSafeInteger(units) || units<0 || (!payment && units===0) || (payment && (!Number.isSafeInteger(amount) || amount<=0))) return notify("Enter valid whole-number values.","bad");
      if (payment) c.payments.push({id:id(),playerId:Number(person.value),amount:amount,trains:units,ts:stamp(),confirmed:true,source:"manual"});
      else c.training.push({id:id(),playerId:Number(person.value),units:units,ts:stamp(),source:"manual"});
      return work(persist);
    }
    if (act==="assign-news") {
      const entry=c.news.find(function (n) {return n.id===el.dataset.id;});
      if (!entry || c.training.some(function (t) {return !t.voided && t.sourceId==="news:"+entry.id;})) return notify("Record already assigned or missing.","bad");
      const select=Array.from(root.querySelectorAll("select")).find(function (x) {return x.id==="tch-news-person-"+entry.id;});
      const unitsEl=Array.from(root.querySelectorAll("[data-news-units]")).find(function(x){return x.dataset.newsUnits===entry.id;});
      const units=Number(unitsEl && unitsEl.value);
      if (!select || !select.value || !Number.isInteger(units) || units<1 || units>20) return notify("Choose the employee and the number of trains.","bad");
      c.training.push({id:id(),playerId:Number(select.value),units:units,ts:entry.timestamp,sourceId:"news:"+entry.id,source:"import-confirmed"});
      return work(persist);
    }
    if (act==="backup") {
      const json=JSON.stringify(data,null,2);
      const blob=new Blob([json],{type:"application/json"});
      const url=URL.createObjectURL(blob);
      const link=document.createElement("a");link.href=url;link.download="torn-company-helper-backup.json";link.click();
      setTimeout(function () {URL.revokeObjectURL(url);},1500);
      return notify("Backup requested. Keep your exported company data private.");
    }
    if (act==="restore") {
      try {
        const raw=JSON.parse(root.querySelector("#tch-restore").value);
        if (!raw || raw.schema!==1 || !raw.byCompany || typeof raw.byCompany!=="object" || Array.isArray(raw.byCompany)) throw Error("Unsupported backup format.");
        if (!window.confirm("Replace all locally saved company records with this backup?")) return;
        data=raw;companyId=raw.lastCompany?String(raw.lastCompany):null;
        repairAllSavedCompanyDuplicates(data.byCompany);
        Object.values(data.byCompany).forEach(function(c){if(c && Array.isArray(c.payments))migrateAutoPaymentClaims(c);});
        await persist();notify("Backup restored; unverified incoming transfers require confirmation.");
      } catch (e) {notify("Restore failed: "+String(e.message),"bad");}
    }
  });
  root.addEventListener("change",async function (evt) {
    const el=evt.target;
    if (el.dataset.change==="sim") {
      const c=current();if (!c) return;
      c.whatIf[el.dataset.id]=el.value;
      await work(persist);
    }
  });
  (async function init() {
    try {
      if (typeof PDA_storage==="undefined") {opener.textContent="Company Helper (PDA only)";return;}
      const loaded=await PDA_storage.get(STORE,null);
      if (loaded && loaded.schema===1 && loaded.byCompany && typeof loaded.byCompany==="object") {
        data=loaded;companyId=loaded.lastCompany?String(loaded.lastCompany):null;
        const repaired=repairAllSavedCompanyDuplicates(data.byCompany);
        let needsReview=0;
        Object.values(data.byCompany).forEach(function(c){if(c && Array.isArray(c.payments))needsReview+=migrateAutoPaymentClaims(c);});
        if(repaired||needsReview){
          await persist();
          message=(repaired?"Repaired "+repaired+" duplicate imported training records. ":"")+
            (needsReview?needsReview+" previous auto-credited incoming transfers now require training-purpose review.":"");
        }
        positionLauncher();
      }
    } catch (_) { /* Do not read API or silently overwrite damaged storage. */ }
  })();
})();
