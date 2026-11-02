// ==UserScript==
// @name         Torn Company Helper
// @namespace    https://github.com/Tom-Peters/Torn-Company-Helper
// @version      1.25.2
// @description  Read-only Torn PDA director command centre: staff, trains, stock, finance and growth
// @author       IamEEKY
// @match        https://www.torn.com/*
// @match        https://torn.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==
/* StaxxHub v3.1 · shared Torn PDA launcher · IamEEKY · no external dependencies */
(function () {
  "use strict";
  if (typeof location === "undefined" || typeof document === "undefined" ||
      !document.documentElement || typeof document.createElement !== "function" ||
      !/^(www\.)?torn\.com$/i.test(location.hostname) || window.top !== window.self) return;
  function startHub() {
    if (document.getElementById("staxx-hub-root")) return;
    const root = document.createElement("div");
    root.id = "staxx-hub-root";
    root.innerHTML =
      '<button type="button" id="staxx-hub-toggle" aria-label="Open Staxx tools" aria-expanded="false"><b>S</b><span id="staxx-hub-count" hidden></span></button>' +
      '<div id="staxx-hub-veil" hidden></div>' +
      '<aside id="staxx-hub-drawer" aria-label="Staxx tools and notifications" hidden>' +
      '<header class="staxx-head"><div><strong>Staxx<span>Hub</span></strong><small>YOUR TORN COMMAND CENTRE</small></div><div class="staxx-head-actions"><button type="button" data-hub-find aria-label="Find tools, sections and actions" aria-expanded="false" title="Find tools and actions">⌕</button><button type="button" data-hub-close aria-label="Close sidebar">×</button></div></header>' +
      '<nav class="staxx-main-tabs" aria-label="StaxxHub sections"><button type="button" data-hub-view="today" aria-pressed="true">Today</button><button type="button" data-hub-view="dashboard" aria-pressed="false">Dashboard</button><button type="button" data-hub-view="activity" aria-pressed="false">Activity</button><button type="button" data-hub-view="tools" aria-pressed="false">Tools</button><button type="button" data-hub-view="alerts" aria-pressed="false">Alerts</button><button type="button" data-hub-view="more" aria-pressed="false">More</button></nav>' +
      '<section id="staxx-hub-find" aria-label="Find Staxx tools and actions" hidden><label for="staxx-hub-find-input">FIND TOOLS, ACTIONS &amp; ALERTS</label><input id="staxx-hub-find-input" type="search" maxlength="100" autocomplete="off" spellcheck="false" placeholder="e.g. trains, stocks, gym" aria-controls="staxx-hub-find-results"><p id="staxx-hub-find-status" role="status" aria-live="polite"></p><div id="staxx-hub-find-results" role="group" aria-label="Search results"></div></section>' +
      '<div class="staxx-scroll">' +
      '<section data-hub-section="today"><section id="staxx-hub-welcome" hidden></section><div class="staxx-label"><h3>BEST NEXT REVIEW</h3><span>From current tool evidence</span></div><section id="staxx-hub-best" aria-label="Best currently available review"></section><div class="staxx-label"><h3>OTHER NEXT STEPS</h3><span>Priority and estimated review time</span></div><div id="staxx-hub-task-filters" role="group" aria-label="Filter actions by urgency"></div><section id="staxx-hub-tasks" aria-label="Prioritised Torn actions"></section><div class="staxx-label"><h3>YOUR SHORTCUTS</h3><span>Learns from your taps</span></div><div id="staxx-hub-frequent"></div><div class="staxx-label"><h3>OPEN A TOOL</h3><span>One tap</span></div><div id="staxx-hub-quick-tools"></div><p class="staxx-trendnote">Recommendations are advisory. Confirm all gameplay actions yourself in Torn.</p></section>' +
      '<section data-hub-section="dashboard" hidden><div class="staxx-label"><h3>SUITE DASHBOARD</h3><span>All three helpers</span></div><section id="staxx-hub-dashboard"></section></section>' +
      '<section data-hub-section="activity" hidden><div class="staxx-label"><h3>RECENT ACTIVITY</h3><button type="button" data-activity-clear>Clear history</button></div><section id="staxx-hub-activity"></section></section>' +
      '<section data-hub-section="tools" hidden><div class="staxx-label"><h3>YOUR TOOLS</h3><button type="button" data-arrange aria-pressed="false">Reorder</button></div><div id="staxx-hub-tools"></div></section>' +
      '<section data-hub-section="alerts" hidden><div class="staxx-label"><h3>NOTIFICATIONS</h3><span id="staxx-hub-total"></span></div><div id="staxx-hub-alerts"></div></section>' +
      '<section data-hub-section="more" hidden><button class="staxx-overview-switch" type="button" data-overview>▦ &nbsp; Daily dashboard · all tools</button>' +
      '<section id="staxx-hub-overview" hidden></section><button class="staxx-overview-switch" type="button" data-diagnostics>⚙ &nbsp; Tool diagnostics</button><section id="staxx-hub-diagnostics" hidden></section>' +
      '<button class="staxx-context-control" type="button" data-usage-reset>Reset learned shortcuts</button><button class="staxx-context-control" type="button" data-hub-mode>Display: Simple</button><button class="staxx-context-control" type="button" data-hub-guide>Show getting-started guide</button>' +
      '<button class="staxx-context-control" type="button" data-context-toggle>On-page guidance: On</button><p class="staxx-foot">Alerts use last known data · Drag the S tab vertically to reposition · No gameplay actions are submitted automatically</p></section>' +
      '</div></aside>';
    const css = document.createElement("style");
    css.id = "staxx-hub-css";
    css.textContent = [
      '#staxx-hub-root{position:fixed!important;inset:0!important;z-index:2147483647!important;pointer-events:none!important;font:14px/1.45 system-ui,-apple-system,Segoe UI,sans-serif!important;color:#e7f2ff!important}',
      '#staxx-hub-root *{box-sizing:border-box}#staxx-hub-root [hidden]{display:none!important}#staxx-hub-root button{font:inherit;color:inherit;cursor:pointer}',
      '#staxx-hub-root button:focus-visible{outline:2px solid #73dfff;outline-offset:2px}',
      '#staxx-hub-toggle{position:fixed;left:5px;top:43%;width:43px;height:49px;pointer-events:auto;border:1px solid #69dfff99;border-radius:0 13px 13px 0;background:linear-gradient(150deg,#0b74ba,#082a4a);box-shadow:0 6px 24px #000b;align-items:center;justify-content:center;touch-action:none;user-select:none}',
      '#staxx-hub-toggle b{font-size:22px;font-weight:900;color:#baf1ff}#staxx-hub-count{position:absolute;top:-8px;right:-8px;padding:2px 5px;min-width:20px;border-radius:14px;background:#38cfa9;border:2px solid #08192d;color:#062821;font-size:11px;font-weight:900}',
      '#staxx-hub-toggle.staxx-urgent{border-color:#ff778d;background:linear-gradient(150deg,#a83b54,#4b1734)}#staxx-hub-toggle.staxx-urgent #staxx-hub-count{background:#ff6b83;color:#fff}',
      '#staxx-hub-toggle.staxx-warning{border-color:#ffd17e;background:linear-gradient(150deg,#9b5b19,#433322)}#staxx-hub-toggle.staxx-warning #staxx-hub-count{background:#ffd17e;color:#32220a}',
      '#staxx-hub-veil{position:fixed;inset:0;pointer-events:auto;background:#020a17ba}',
      '#staxx-hub-drawer{position:fixed;inset:0 auto 0 0;width:min(302px,calc(100vw - 36px));height:100vh;height:100dvh;pointer-events:auto;background:#08192d;border-right:1px solid #28506e;box-shadow:10px 0 45px #000b;display:flex;flex-direction:column;padding-top:env(safe-area-inset-top)}',
      '#staxx-hub-drawer .staxx-head{display:flex;align-items:center;justify-content:space-between;padding:15px 13px;background:linear-gradient(120deg,#0c3358,#0b203b);border-bottom:1px solid #28506e;flex-shrink:0}',
      '#staxx-hub-drawer .staxx-head strong{display:block;font-size:20px;font-weight:850;letter-spacing:-.4px}#staxx-hub-drawer .staxx-head strong span{color:#54d7fa}',
      '#staxx-hub-drawer .staxx-head small{font-size:9px;letter-spacing:1px;color:#8fabca}',
      '#staxx-hub-drawer [data-hub-close]{background:#1c3b59;border:0;border-radius:9px;width:34px;height:34px;font-size:24px}',
      '#staxx-hub-drawer .staxx-scroll{flex:1;overflow-y:auto;overscroll-behavior:contain;padding:12px 10px 26px}',
      '#staxx-hub-drawer h3{color:#8faec9;font-size:10px;letter-spacing:1.1px;margin:9px 4px 10px}',
      '#staxx-hub-drawer .staxx-overview-switch{width:100%;text-align:left;background:linear-gradient(120deg,#124a71,#0c2d4b);border:1px solid #4384ad;border-radius:10px;padding:11px;margin-bottom:10px;font-weight:750}',
      '#staxx-hub-drawer .staxx-overview-switch.selected{border-color:#71d9fd;background:#19527b}',
      '#staxx-hub-drawer .staxx-toolrow{display:flex;align-items:center;gap:4px;margin-bottom:8px}#staxx-hub-drawer .staxx-toolrow .staxx-tool{margin-bottom:0;flex:1;min-width:0}#staxx-hub-drawer .staxx-move{height:31px;width:27px;flex:0 0 27px;border-radius:7px;background:#1a4364;border:1px solid #416c8e;color:#ccecff;font-weight:900}#staxx-hub-drawer .staxx-move:disabled{opacity:.25}#staxx-hub-drawer .staxx-tool{display:flex;align-items:center;gap:8px;text-align:left;width:100%;background:#102844;border:1px solid #284b6b;border-radius:11px;padding:10px 8px;min-height:62px;margin-bottom:8px}',
      '#staxx-hub-drawer .staxx-icon{width:35px;height:35px;display:grid;place-items:center;border-radius:9px;background:linear-gradient(135deg,#0b79b9,#123c65);border:1px solid #4f9dc8;color:#cff6ff;font-weight:900;flex-shrink:0;font-size:12px}',
      '#staxx-hub-drawer .staxx-info{flex:1;min-width:0}#staxx-hub-drawer .staxx-info b{display:block;font-size:13px}#staxx-hub-drawer .staxx-info small{display:block;font-size:10px;color:#94b1c9;margin-top:3px;overflow-wrap:anywhere}',
      '#staxx-hub-drawer .staxx-pill{border-radius:14px;background:#1b486c;padding:2px 6px;font-size:11px;font-weight:800;color:#bdeaff}#staxx-hub-drawer .staxx-pill.on{background:#145f58;color:#89edca}',
      '#staxx-hub-drawer .staxx-label{display:flex;align-items:center;justify-content:space-between;margin-top:15px}#staxx-hub-drawer .staxx-label span{color:#a4c1d8;font-size:10px}#staxx-hub-drawer .staxx-label button{background:#173958;border:1px solid #365b79;border-radius:8px;padding:5px 9px;font-size:10px}#staxx-hub-drawer .staxx-label button[aria-pressed="true"]{background:#175f91;color:#fff}',
      '#staxx-hub-drawer .staxx-alert{background:#0e2945;border:1px solid #315977;border-radius:10px;padding:10px;margin-bottom:9px}',
      '#staxx-hub-drawer .staxx-alert.urgent{border-color:#e56785}#staxx-hub-drawer .staxx-alert.warning{border-color:#ae8450}',
      '#staxx-hub-drawer .staxx-alert-title{border:0;background:none;padding:0;text-align:left;width:100%;font-size:12px;font-weight:750;color:#81dbfa!important}',
      '#staxx-hub-drawer .staxx-alert.urgent .staxx-alert-title{color:#ff9bad!important}',
      '#staxx-hub-drawer .staxx-alert span{display:block;color:#daecf9;font-size:12px;margin:5px 0;overflow-wrap:anywhere}',
      '#staxx-hub-drawer .staxx-alert small{display:block;color:#91aec6;font-size:11px;margin:4px 0}',
      '#staxx-hub-drawer .staxx-alert-item{display:block;width:100%;margin:7px 0 3px;padding:9px 10px;background:#123c60;border:1px solid #427b9f;color:#e3f5ff;border-radius:8px;text-align:left;font-size:12px;font-weight:750;line-height:1.35;min-height:38px}#staxx-hub-drawer .staxx-alert-item:focus-visible{outline:2px solid #54d7fa}#staxx-hub-drawer .staxx-alert-description{padding:0 3px 3px}',
      '#staxx-hub-drawer .staxx-alert-actions{display:flex;gap:7px;margin-top:10px}',
      '#staxx-hub-drawer .staxx-snooze-menu{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px}#staxx-hub-drawer .staxx-snooze-menu button{background:#174463;border:1px solid #3e7593;border-radius:7px;padding:6px 8px;min-height:32px;font-size:11px}#staxx-hub-drawer .staxx-snooze-menu input{background:#071d32;border:1px solid #527b9b;border-radius:7px;color:#fff;min-width:56px;width:64px;padding:6px;font-size:12px}#staxx-hub-drawer .staxx-snooze-menu label{display:flex;align-items:center;gap:4px;color:#bfd9ec;font-size:11px}#staxx-hub-drawer .staxx-due{font-size:11px;color:#b8e4ff!important;font-weight:700}#staxx-hub-drawer .staxx-spark{display:flex;align-items:end;gap:3px;height:40px;margin:11px 0 4px}#staxx-hub-drawer .staxx-spark span{flex:1;min-width:0;max-width:30px;border-radius:3px 3px 0 0;background:linear-gradient(#50d5f8,#17649c)}#staxx-hub-drawer .staxx-spark span.missing{background:#1e3a52;height:3px!important}#staxx-hub-drawer .staxx-trendnote{font-size:10px!important;color:#9ab5cf!important}#staxx-hub-drawer .staxx-alert-actions button{background:#1c3e5b;border:1px solid #365978;border-radius:8px;padding:6px 9px;font-size:11px;flex:1;min-height:32px}',
      '#staxx-hub-drawer .staxx-empty{color:#9db7cd;background:#0c243e;border:1px dashed #305473;border-radius:10px;font-size:11px;padding:14px 10px}',
      '#staxx-hub-drawer .staxx-overview-card{background:#0d2945;border:1px solid #2d5574;border-radius:11px;padding:11px;margin-bottom:8px}',
      '#staxx-hub-drawer .staxx-overview-card b{color:#83dbfa;font-size:12px}#staxx-hub-drawer .staxx-overview-card p{margin:5px 0;color:#d4eafa;font-size:11px}',
      '#staxx-hub-drawer .staxx-overview-card dl{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:8px 0 0}',
      '#staxx-hub-drawer .staxx-overview-card dt{font-size:10px;color:#96b6cf}#staxx-hub-drawer .staxx-overview-card dd{font-size:13px;font-weight:750;margin:0;overflow-wrap:anywhere}',
      '#staxx-hub-drawer .staxx-task{width:100%;text-align:left;display:block;border:1px solid #315b79;border-radius:10px;background:#102b46;color:#eef8ff;padding:10px;margin-bottom:8px;line-height:1.45}#staxx-hub-drawer .staxx-task.urgent{border-color:#e56785}#staxx-hub-drawer .staxx-task.soon{border-color:#ae8450}#staxx-hub-drawer .staxx-task b{display:block;font-size:12px}#staxx-hub-drawer .staxx-task small{display:block;font-size:10px;color:#8fb7d2;margin-top:4px}#staxx-hub-drawer .staxx-task .staxx-step{display:inline-block;font-size:10px;font-weight:800;letter-spacing:.4px;color:#67dfff;margin-bottom:4px}#staxx-hub-drawer .staxx-task:focus-visible{outline:2px solid #67dfff}',
      '#staxx-hub-drawer .staxx-foot{font-size:10px;color:#6d90ab;margin-top:17px}#staxx-hub-drawer .staxx-diagnostic-actions{display:flex;gap:8px;margin-bottom:12px}#staxx-hub-drawer .staxx-diagnostic-actions button{flex:1;background:#17496d;border:1px solid #3e789f;border-radius:8px;padding:9px;font-size:11px}#staxx-hub-drawer #staxx-safe-report{width:100%;min-height:130px;white-space:pre;color:#cfeeff;background:#091f34;border:1px solid #5182a3;border-radius:8px;font-size:10px}'
    ].join("");
    css.textContent += '#staxx-hub-drawer .staxx-context-control{display:block;width:100%;background:#0b314e;color:#8bdffc;border:1px solid #315775;border-radius:9px;padding:8px;margin:7px 0 14px;text-align:left}' +
      '#staxx-page-tip{box-sizing:border-box;display:flex;flex-wrap:wrap;gap:7px;align-items:center;background:#0c2944;color:#e9f5ff;border:1px solid #345f7d;border-left:4px solid #54d7fa;border-radius:9px;padding:10px 12px;margin:10px 0;font:13px/1.4 system-ui,Arial,sans-serif;max-width:720px;min-width:0;overflow-wrap:anywhere}' +
      '@media (max-width:849px),(pointer:coarse){#staxx-page-tip{display:none!important}}' +
      '#staxx-page-tip strong{color:#84e0fb}#staxx-page-tip small{color:#a9cce5;flex-basis:100%}' +
      '#staxx-page-tip button{background:#0879bd;color:#fff;border:1px solid #69cef5;border-radius:8px;padding:7px 10px;font:inherit;font-weight:700;cursor:pointer}';
    css.textContent += [
      '#staxx-hub-drawer .staxx-main-tabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:4px;padding:9px 10px;background:#08192d;border-bottom:1px solid #284b6b;flex-shrink:0}',
      '#staxx-hub-drawer .staxx-main-tabs button{min-width:0;min-height:42px;background:#102b46;border:1px solid #315d7d;border-radius:9px;font-size:11px;font-weight:800;padding:5px 2px;color:#cce9f7}',
      '#staxx-hub-drawer .staxx-main-tabs button[aria-pressed="true"]{background:#0879bd;border-color:#54d7fa;color:#fff}',
      '#staxx-hub-drawer #staxx-hub-quick-tools{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin:4px 0 13px}',
      '#staxx-hub-drawer .staxx-quick-tool{display:flex;align-items:center;justify-content:center;flex-direction:column;gap:5px;min-height:64px;min-width:0;padding:8px 3px;background:#103756;border:1px solid #366d94;border-radius:10px;text-align:center;font-weight:800;font-size:11px;line-height:1.25;overflow-wrap:anywhere}',
      '#staxx-hub-drawer .staxx-quick-tool small{color:#8ddfff;font-size:10px;font-weight:700}',
      '#staxx-hub-drawer .staxx-quick-tool:disabled{opacity:.52;cursor:not-allowed}',
      '#staxx-hub-drawer .staxx-more-tasks{width:100%;margin:2px 0 8px;padding:9px;border:1px solid #376a8c;background:#0e3452;border-radius:9px;color:#9edfff;font-size:11px;font-weight:800}',
      '#staxx-hub-drawer [data-hub-section]>.staxx-label:first-child{margin-top:2px}'
    ].join("");
    css.textContent += '#staxx-hub-welcome{border:1px solid #367194;background:#103552;border-radius:11px;padding:11px;margin:0 0 12px}#staxx-hub-welcome strong{display:block;color:#9ce7ff;font-size:13px}#staxx-hub-welcome p{font-size:11px;line-height:1.45;color:#c4dfed;margin:7px 0}#staxx-hub-welcome button{background:#0879bd;border:1px solid #64c6ea;border-radius:8px;padding:8px 10px;min-height:36px;font-size:11px;font-weight:800;width:100%}';
    css.textContent += [
      '#staxx-hub-drawer .staxx-head-actions{display:flex;align-items:center;gap:7px}',
      '#staxx-hub-drawer [data-hub-find]{background:#125074;color:#d1f5ff;border:1px solid #4a99bd;border-radius:9px;min-width:38px;height:38px;font-size:24px;line-height:1}',
      '#staxx-hub-drawer [data-hub-find][aria-expanded="true"]{background:#0879bd;border-color:#80d9ff}',
      '#staxx-hub-drawer #staxx-hub-find{display:flex;flex:1;flex-direction:column;min-height:0;padding:12px 10px 18px;gap:8px;overflow:hidden}',
      '#staxx-hub-drawer #staxx-hub-find>label{font-size:10px;font-weight:850;letter-spacing:.8px;color:#9fcbe1}',
      '#staxx-hub-drawer #staxx-hub-find-input{width:100%;min-height:44px;background:#112e48;color:#f1fbff;border:1px solid #5e96b8;border-radius:10px;padding:10px 12px;font-size:14px;outline-offset:2px}',
      '#staxx-hub-drawer #staxx-hub-find-input:focus-visible{outline:2px solid #54d7fa}',
      '#staxx-hub-drawer #staxx-hub-find-status{font-size:11px;color:#a7c8dc;margin:2px 0 0}',
      '#staxx-hub-drawer #staxx-hub-find-results{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding-bottom:12px}',
      '#staxx-hub-drawer .staxx-find-item{width:100%;display:flex;flex-direction:column;gap:4px;text-align:left;min-height:48px;margin:0 0 7px;padding:10px 11px;color:#e8f7ff;border:1px solid #366180;background:#10314f;border-radius:10px}',
      '#staxx-hub-drawer .staxx-find-item b{font-size:12px;line-height:1.3}',
      '#staxx-hub-drawer .staxx-find-item small{font-size:10px;color:#a8c8de;line-height:1.4;overflow-wrap:anywhere}',
      '#staxx-hub-drawer .staxx-find-item.urgent{border-color:#ff778d}',
      '#staxx-hub-drawer .staxx-find-item:disabled{opacity:.52;cursor:not-allowed}',
      '#staxx-hub-drawer .staxx-find-item:focus-visible{outline:2px solid #54d7fa}'
    ].join('');
    css.textContent += [
      '#staxx-hub-drawer #staxx-hub-best{padding:10px;margin-bottom:8px;border:1px solid #397fa3;border-radius:11px;background:#103756}',
      '#staxx-hub-drawer #staxx-hub-best .staxx-task{margin:0}',
      '#staxx-hub-drawer #staxx-hub-best .staxx-empty{margin:2px 0;color:#b4cbdb}',
      '#staxx-hub-drawer .staxx-advice{font-size:11px;color:#a7cde5;margin:7px 0 0;line-height:1.4}',
      '#staxx-hub-drawer #staxx-hub-task-filters{display:flex;gap:4px;flex-wrap:wrap;margin:6px 0 10px}',
      '#staxx-hub-drawer #staxx-hub-task-filters button{flex:1 0 auto;min-height:34px;padding:6px;background:#132d48;border:1px solid #345b7a;border-radius:8px;font-size:10px;font-weight:700}',
      '#staxx-hub-drawer #staxx-hub-task-filters button[aria-pressed=true]{background:#0879bd;border-color:#54d7fa}',
      '#staxx-hub-drawer #staxx-hub-dashboard .staxx-overview-card{margin-bottom:11px}',
      '#staxx-hub-drawer #staxx-hub-dashboard dl{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}',
      '#staxx-hub-drawer #staxx-hub-dashboard dt{font-size:10px;color:#a9c4d7}',
      '#staxx-hub-drawer #staxx-hub-dashboard dd{font-size:13px;font-weight:800;margin:2px 0;overflow-wrap:anywhere}',
      '#staxx-hub-drawer #staxx-hub-frequent{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}',
      '#staxx-hub-drawer #staxx-hub-frequent button{padding:10px 8px;min-height:48px;background:#102d49;border:1px solid #386788;border-radius:9px;text-align:left;font-size:11px;font-weight:800}',
      '#staxx-hub-drawer #staxx-hub-frequent small{display:block;margin-top:3px;font-size:10px;color:#96c2d9}',
      '#staxx-hub-drawer #staxx-hub-activity .staxx-overview-card{margin-bottom:8px}',
      '#staxx-hub-drawer #staxx-hub-activity time{display:block;margin-top:3px;font-size:10px;color:#9ebdcf}',
      '#staxx-hub-drawer .staxx-review-minutes{color:#9ce6fa;font-size:10px;font-weight:750}',
      '#staxx-hub-drawer .staxx-category{color:#d8edfa;font-size:10px;font-weight:850}'
    ].join('');
    document.documentElement.append(css, root);

    const entries = [
      {id:"profit",label:"ProfitStaxx",icon:"PS",desc:"Markets · Stocks · Income"},
      {id:"company",label:"Company Helper",icon:"CO",desc:"Staff · Training · Growth"},
      {id:"happy",label:"Happy Jump",icon:"HJ",desc:"Gym · Schedule · Recovery"}
    ];
    const sectionsByTool={
      profit:[["daily","Today"],["alerts","Alerts"],["best","Best opportunities"],["scan","Item deals"],["travel","Travel"],["stocks","Stock market"],["capital","Capital"],["history","Price charts"],["income","Income"],["museum","Museum"],["portfolio","Trading ledger"],["settings","Settings"],["diagnostics","Diagnostics"]],
      company:[["overview","Today"],["alerts","Alerts"],["employees","Staff"],["training","Training"],["growth","Growth"],["stock","Stock or services"],["settings","Settings"],["diagnostics","Diagnostics"]],
      happy:[["today","Today"],["alerts","Alerts"],["compare","Compare methods"],["plan","Schedule"],["supplies","Supplies"],["gyms","Gyms"],["perks","Perks and books"],["progress","Progress"],["lab","Upgrades"],["settings","Settings"],["diagnostics","Diagnostics"]]
    };
    const active = Object.create(null), notices = Object.create(null), summaries = Object.create(null), controls = Object.create(null), actionSets=Object.create(null), healthReports=Object.create(null);
    const registeredAt=Object.create(null);
    let trends=Object.create(null), arrangeShown=false;
    const toggle=root.querySelector("#staxx-hub-toggle"),veil=root.querySelector("#staxx-hub-veil"),drawer=root.querySelector("#staxx-hub-drawer");
    const tools=root.querySelector("#staxx-hub-tools"),alerts=root.querySelector("#staxx-hub-alerts"),bubble=root.querySelector("#staxx-hub-count");
    const overview=root.querySelector("#staxx-hub-overview"),overviewButton=root.querySelector("[data-overview]"),taskList=root.querySelector("#staxx-hub-tasks"),diagnostics=root.querySelector("#staxx-hub-diagnostics"),diagnosticButton=root.querySelector("[data-diagnostics]");
    let expanded=false, panelOpen=false, overviewShown=false, diagnosticsShown=false, moving=null, suppressClickUntil=0;
    let hubView="today", expandedTaskList=false, findOpen=false, taskFilter='all';
    const activityKey='staxx-hub-activity-v1',usageKey='staxx-hub-usage-v1';
    const validTab=/^[a-z][a-z0-9-]{0,31}$/;
    let activity=[],usage=[];
    let uiMode=safeRead('staxx-hub-mode-v1','simple')==='advanced'?'advanced':'simple';
    const findPanel=root.querySelector('#staxx-hub-find'),findInput=root.querySelector('#staxx-hub-find-input');
    const findResults=root.querySelector('#staxx-hub-find-results'),findStatus=root.querySelector('#staxx-hub-find-status');
    function setFindOpen(value){
      findOpen=Boolean(value);
      if(findPanel)findPanel.hidden=!findOpen;
      const content=root.querySelector('.staxx-scroll');if(content)content.hidden=findOpen;
      const btn=root.querySelector('[data-hub-find]');if(btn)btn.setAttribute('aria-expanded',String(findOpen));
      if(findOpen){renderFind();findInput?.focus?.();}
      else if(findInput){findInput.value='';}
    }
    function publishMode(){document.dispatchEvent(new CustomEvent('staxx:mode',{detail:{mode:uiMode}}));}
    function switchHubView(view){
      if(!["today","dashboard","activity","tools","alerts","more"].includes(view))return;
      hubView=view;
      for(const btn of root.querySelectorAll?.("[data-hub-view]")||[])
        btn.setAttribute("aria-pressed",String(btn.dataset.hubView===view));
      for(const section of root.querySelectorAll?.("[data-hub-section]")||[])
        section.hidden=section.dataset.hubSection!==view;
      const scroll=root.querySelector(".staxx-scroll");
      if(scroll)scroll.scrollTop=0; // Never scroll due to an event-driven data refresh.
    }
    let lastDataRequestV26=0;
    function refreshConnectedV26(force=false){
      if(document.hidden||!entries.some(x=>active[x.id]))return false;
      const time=Date.now();
      if(!force&&time-lastDataRequestV26<120000)return false;
      lastDataRequestV26=time;
      document.dispatchEvent(new CustomEvent("staxx:refresh-request",{detail:{reason:force?"manual":"hub-open",force}}));
      return true;
    }
    const openPanels=new Set();
    const idOk = v=>typeof v==="string" && /^[a-z][a-z0-9-]{0,31}$/.test(v);
    function node(tag,cls,value) {const e=document.createElement(tag);if(cls)e.className=cls;if(value!==undefined)e.textContent=String(value);return e;}
    function safeRead(key, fallback) {try {const v=JSON.parse(localStorage.getItem(key)||"null");return v===null?fallback:v;}catch(_){return fallback;}}
    function saveLocal(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch(_){}}
    function remember(){
      try{sessionStorage.setItem("staxx-hub-state-v2",JSON.stringify({at:Date.now(),notices,summaries,actionSets}));}catch(_){}
    }
    try {
      const known=safeRead("staxx-hub-registry-v2",[]);
      if(Array.isArray(known))for(const e of known.slice(0,25)){
        if(idOk(e.id)&&!entries.some(x=>x.id===e.id))entries.push({id:e.id,label:String(e.label||e.id).slice(0,40),icon:String(e.icon||"S").slice(0,3),desc:String(e.desc||"Staxx tool").slice(0,70)});
      }
    }catch(_){}
    try {
      const old=JSON.parse(sessionStorage.getItem("staxx-hub-state-v2")||"null");
      if(old&&Date.now()-old.at<4*3600000){
        for(const id of Object.keys(old.notices||{}))if(idOk(id)){const n=old.notices[id];if(n&&Number(n.count)>=0)notices[id]=Object.assign({},n,{cached:true});}
        for(const id of Object.keys(old.summaries||{}))if(idOk(id)){const d=old.summaries[id];if(d&&typeof d==="object")summaries[id]=d;}
        for(const id of Object.keys(old.actionSets||{}))if(idOk(id)){const d=old.actionSets[id];if(d&&Array.isArray(d.items))actionSets[id]={items:d.items.slice(0,8),updated:d.updated,cached:true};}
      }
    }catch(_){}
    for(const e of entries)controls[e.id]=safeRead("staxx-hub-alert-control-"+e.id,{});
    const savedOrder=safeRead("staxx-hub-order-v3",[]);
    if(Array.isArray(savedOrder)){
      entries.sort((a,b)=>{
        const ai=savedOrder.indexOf(a.id),bi=savedOrder.indexOf(b.id);
        return (ai<0?1000:ai)-(bi<0?1000:bi);
      });
    }
    const savedTrends=safeRead("staxx-hub-trends-v3",{});
    if(savedTrends&&typeof savedTrends==="object"&&!Array.isArray(savedTrends))trends=savedTrends;
    const storedActivity=safeRead(activityKey,[]);
    if(Array.isArray(storedActivity))activity=storedActivity.filter(x=>x&&typeof x.id==='string'&&typeof x.title==='string'&&Number(x.at)>Date.now()-30*86400000&&Number(x.at)<=Date.now()+60000).slice(-120);
    const storedUsage=safeRead(usageKey,[]);
    if(Array.isArray(storedUsage))usage=storedUsage.filter(x=>x&&idOk(x.tool)&&(!x.section||validTab.test(x.section))&&Number(x.count)>0&&Number(x.last)>Date.now()-30*86400000).slice(-50);
    const pos=safeRead("staxx-hub-position-v2",0.43);
    function position(value) {
      const height=Math.max(160,window.innerHeight||600),buttonHeight=49;
      const top=Math.max(18,Math.min(height-buttonHeight-18,Math.round(height*Math.max(0,Math.min(1,Number(value)||0)))));
      toggle.style.top=top+"px";
      return top/height;
    }
    position(typeof pos==="number"?pos:0.43);
    function launcherVisibility(){
      const hide=expanded||panelOpen;
      toggle.hidden=hide;
      toggle.style.setProperty("display",hide?"none":"flex","important");
      toggle.style.setProperty("pointer-events",hide?"none":"auto","important");
      toggle.setAttribute("aria-expanded",String(expanded));
    }
    function setExpanded(value){
      if(value&&!expanded){expandedTaskList=false;switchHubView("today");renderTasks();}
      if(!value)setFindOpen(false);
      expanded=Boolean(value);veil.hidden=drawer.hidden=!expanded;launcherVisibility();renderContext();
    }
    function activeNotice(id){
      const n=notices[id];if(!n||!(n.count>0))return null;
      const control=controls[id]||{};
      if(control.dismissed===n.fingerprint || Number(control.snoozeUntil)>Date.now())return null;
      return n;
    }
    function recordUse(tool,section){
      const key=tool+'/'+(section||''),now=Date.now();
      const old=storedUse(key);
      usage=usage.filter(x=>x&&x.key!==key&&now-Number(x.last)<30*86400000);
      const record={key,tool,section:section||'',count:Math.min(99,(old?.count||0)+1),last:now};
      usage.push(record);usage=usage.slice(-50);saveLocal(usageKey,usage);renderFrequent();
    }
    function storedUse(key){return usage.find(x=>x.key===key);}
    function openTool(id,alertId,section){
      const routes=sectionsByTool[id]||entries.find(e=>e.id===id)?.sections||[];
      const validSection=routes.some(item=>item[0]===section)?section:null;
      if(entries.some(e=>e.id===id))recordUse(id,validSection);
      if(id==="company"&&!/^\/companies\.php$/i.test(location.pathname)){
        try{
          sessionStorage.setItem("staxx-open-company","1");
          sessionStorage.setItem("staxx-open-company-at",String(Date.now()));
          if(alertId)sessionStorage.setItem("staxx-open-company-alert",alertId);
          else sessionStorage.removeItem("staxx-open-company-alert");
          if(validSection&&!alertId)sessionStorage.setItem("staxx-open-company-section",validSection);
          else sessionStorage.removeItem("staxx-open-company-section");
        }catch(_){}
        location.assign(location.origin+"/companies.php");return;
      }
      if(!active[id]){
        alerts.replaceChildren(node("p","staxx-empty","This tool is not active on this page. Enable its script in Torn PDA and reload."));
        return;
      }
      panelOpen=true;setExpanded(false);launcherVisibility();
      document.dispatchEvent(new CustomEvent("staxx:closeall"));
      document.dispatchEvent(new CustomEvent("staxx:open",{detail:{id,alertId:alertId||null,section:alertId?null:validSection}}));
    }
    function timeUntil(ms) {
      if(!Number.isFinite(ms)||ms<=0)return "";
      const diff=ms-Date.now(),minutes=Math.max(1,Math.ceil(Math.abs(diff)/60000));
      const text=minutes<60?minutes+"m":minutes<1440?Math.ceil(minutes/60)+"h":Math.ceil(minutes/1440)+"d";
      return diff<=0?"Overdue "+text: "Due in "+text;
    }
    function trendValue(value) {
      const match=String(value??"").replace(/,/g,"").trim().match(/^[$£]?\s*(-?\d+(?:\.\d+)?)\s*([kmb])?/i);
      if(!match)return null;
      const multiplier={k:1000,m:1000000,b:1000000000}[String(match[2]||"").toLowerCase()]||1;
      const n=Number(match[1])*multiplier;
      return Number.isFinite(n)?n:null;
    }
    const trendMetric={profit:"Fresh deals",company:"Star rating",happy:"24h projected gains"};
    const trendTitle={profit:"Fresh deals",company:"Company stars",happy:"24h projected gains (forecast)"};
    function dayKey(time){const d=new Date(time);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
    function recordTrend(id,entry) {
      const own=entries.find(x=>x.id===id);const key=own?.trendMetric||trendMetric[id]||entry?.metrics?.find(x=>trendValue(x.value)!==null)?.label;
      if(!key||!entry||!Array.isArray(entry.metrics))return;
      const metric=entry.metrics.find(x=>x.label===key);
      const timestamp=Number(entry.updated)||Date.now(),value=metric?trendValue(metric.value):null;
      if(value===null||timestamp>Date.now()+60000||Date.now()-timestamp>86400000)return;
      const list=Array.isArray(trends[id])?trends[id]:[];
      const day=dayKey(timestamp);
      const next=list.filter(x=>x&&typeof x.day==="string"&&x.day!==day&&Date.now()-Number(x.timestamp)<8*86400000);
      next.push({day,value,timestamp});next.sort((a,b)=>a.timestamp-b.timestamp);
      trends[id]=next.slice(-8);saveLocal("staxx-hub-trends-v3",trends);
    }
    function trendCard(id){
      const list=Array.isArray(trends[id])?trends[id]:[];
      if(!trendMetric[id]&&!entries.find(x=>x.id===id)?.trendMetric&&!(summaries[id]?.metrics||[]).some(x=>trendValue(x.value)!==null))return null;
      const wrap=node("div","staxx-trend");
      const title=node("small","staxx-trendnote","7-day trend · "+(entries.find(x=>x.id===id)?.trendMetric||trendTitle[id]||"first numeric summary metric")+" · observed snapshots");wrap.append(title);
      const bar=node("div","staxx-spark");
      const values=[];
      for(let offset=6;offset>=0;offset--){
        const time=new Date();time.setHours(12,0,0,0);time.setDate(time.getDate()-offset);
        const date=dayKey(time.getTime()),point=list.find(x=>x.day===date);values.push(point?point.value:null);
      }
      const max=Math.max(1,...values.filter(x=>x!==null).map(x=>Math.max(0,x)));
      for(const [i,value] of values.entries()){
        const b=node("span",value===null?"missing":"");
        b.style.height=value===null?"3px":Math.max(4,Math.min(40,Math.round(Math.max(0,value)/max*40)))+"px";
        b.title=(i===6?"Today":"Day "+(i+1))+" · "+(value===null?"Not recorded":String(value));
        bar.append(b);
      }
      wrap.append(bar);
      const recorded=values.filter(v=>v!==null);
      wrap.append(node("p","staxx-trendnote",recorded.length>1?
        "Change: "+(recorded.at(-1)-recorded[0]>0?"+":"")+String(Math.round((recorded.at(-1)-recorded[0])*100)/100)+" · "+recorded.length+"/7 recorded days":
        recorded.length+"/7 recorded days · comparison appears after two days"));
      return wrap;
    }

    // V2.5: everything registered through the normal Staxx event protocol joins the dashboard.
    // Never promote old or cross-page cached observations to a verified urgent instruction.
    function freshnessMs(id){
      const entry=entries.find(x=>x.id===id);
      return Math.max(60000,Math.min(86400000,Number(entry?.freshnessMs)||({profit:600000,company:86400000,happy:900000}[id]||3600000)));
    }
    function taskRowsV25(){
      const rows=[];
      for(const e of entries){
        const set=actionSets[e.id],control=controls[e.id]||{};
        if(!set||!Array.isArray(set.items)||Number(control.snoozeUntil)>Date.now())continue;
        const old=Boolean(set.cached)||!Number.isFinite(Number(set.updated))||Date.now()-Number(set.updated)>freshnessMs(e.id);
        const hidden=control.dismissed===notices[e.id]?.fingerprint?new Set((notices[e.id]?.alerts||[]).map(x=>x.id)):null;
        for(const a of set.items)if(!hidden?.has(a.id))rows.push({...a,owner:e.id,tool:e.label,cached:old,updated:set.updated});
      }
      const rank={urgent:4,now:3,soon:2,review:1,optional:0};
      return rows.sort((a,b)=>Number(a.cached)-Number(b.cached)||
        (rank[b.status]??0)-(rank[a.status]??0)||
        (Number(a.dueAt)||Infinity)-(Number(b.dueAt)||Infinity)||
        (Number(b.priority)||0)-(Number(a.priority)||0));
    }
    function findCatalog(){
      const rows=[],hiddenAlertIds=new Set();
      for(const e of entries){
        const available=Boolean(active[e.id]);
        rows.push({kind:'tool',owner:e.id,title:e.label,detail:e.desc,available});
        const routes=sectionsByTool[e.id]||e.sections||[];
        for(const route of routes)rows.push({kind:'section',owner:e.id,section:route[0],title:route[1],detail:e.label+' · Section',available});
        const current=activeNotice(e.id),raw=notices[e.id];
        if(raw?.count>0&&!current)for(const item of raw.alerts||[])hiddenAlertIds.add(e.id+'/'+item.id);
        if(current){
          if(current.alerts?.length){
            for(const item of current.alerts.slice(0,24))
              rows.push({kind:'alert',owner:e.id,alertId:item.id,title:item.title,detail:e.label+' · '+item.detail+(current.cached?' · Last observed':''),available,cached:Boolean(current.cached)});
          }else rows.push({kind:'alert',owner:e.id,title:current.summary||'Review alerts',detail:e.label+(current.cached?' · Last observed':''),available,cached:Boolean(current.cached)});
        }
      }
      for(const task of taskRowsV25()){
        if(hiddenAlertIds.has(task.owner+'/'+task.id))continue;
        // A matching actionable alert is represented once, not twice.
        if(activeNotice(task.owner)?.alerts?.some(x=>x.id===task.id))continue;
        rows.push({kind:'action',owner:task.owner,alertId:task.id,title:task.title,
          detail:task.tool+' · '+task.detail+(task.cached?' · Last observed':''),available:Boolean(active[task.owner]),
          cached:Boolean(task.cached),status:task.status});
      }
      return rows;
    }
    function renderFind(){
      if(!findOpen||!findResults||!findInput)return;
      findResults.replaceChildren();
      const query=String(findInput.value||'').trim().toLocaleLowerCase().slice(0,100);
      const tokens=query.split(/\s+/).filter(Boolean);
      let results=findCatalog();
      if(tokens.length){
        results=results.filter(item=>{
          const hay=(item.title+' '+item.detail+' '+item.owner).toLocaleLowerCase();
          return tokens.every(word=>hay.includes(word)||(word.length>4&&word.endsWith('s')&&!word.endsWith('ss')&&hay.includes(word.slice(0,-1))));
        });
        results.sort((a,b)=>{
          const score=item=>(item.title.toLocaleLowerCase()===query?0:item.title.toLocaleLowerCase().startsWith(query)?1:2)*10+
            (item.kind==='action'?0:item.kind==='alert'?1:item.kind==='section'?2:3);
          return score(a)-score(b);
        });
      }else results=results.filter(x=>x.kind==='tool');
      if(findStatus)findStatus.textContent=tokens.length?results.length+' matching destination'+(results.length===1?'':'s')+' · Showing up to 12':'Select a tool or type to find a section, alert or recommendation';
      for(const item of results.slice(0,12)){
        const btn=node('button','staxx-find-item'+(item.status==='urgent'?' urgent':''));btn.type='button';
        if(item.kind==='section'){btn.dataset.hubSectionTool=item.owner;btn.dataset.hubSectionTab=item.section;}
        else if(item.alertId){btn.dataset.openAlertTool=item.owner;btn.dataset.openAlertId=item.alertId;}
        else btn.dataset.openStaxx=item.owner;
        if(!item.available&&item.owner!=='company'){btn.disabled=true;btn.title='Enable '+item.owner+' in TornPDA first';}
        const type=item.kind==='action'?'Action':item.kind==='alert'?'Alert':item.kind==='section'?'Section':'Tool';
        btn.append(node('b','',item.title),node('small','',type+' · '+item.detail+(btn.disabled?' · Script not active':'')));
        findResults.append(btn);
      }
      if(!results.length)findResults.append(node('p','staxx-empty','No matching active tool data. Try a shorter term or open a helper to refresh.'));
    }
    function diagnosticReportV25(){
      const time=Date.now();
      return {hub:"3.1",capturedAt:new Date(time).toISOString(),page:String(location.pathname||""),
        connectedCount:entries.filter(x=>active[x.id]).length,knownCount:entries.length,tools:entries.map(e=>{
          const sum=summaries[e.id],actions=actionSets[e.id],notice=notices[e.id],h=healthReports[e.id];
          const age=Number(sum?.updated),lastAction=Number(actions?.updated);
          return {id:e.id,label:e.label,connected:Boolean(active[e.id]),registeredSecondsAgo:
            registeredAt[e.id]?Math.max(0,Math.floor((time-registeredAt[e.id])/1000)):null,
            summaryAgeMinutes:age>0?Math.max(0,Math.floor((time-age)/60000)):null,
            actionAgeMinutes:lastAction>0?Math.max(0,Math.floor((time-lastAction)/60000)):null,
            actionCount:Array.isArray(actions?.items)?actions.items.length:0,
            alertCount:Number(notice?.count)||0,
            stale:!actions||Boolean(actions.cached)||time-lastAction>freshnessMs(e.id),
            health:h?{version:h.version,api:h.api,storage:h.storage,ui:h.ui,detail:h.detail,observedAt:h.observedAt}:null};
        })};
    }
    function showDiagnosticsV25(){
      if(!diagnostics)return;
      diagnostics.replaceChildren();
      if(!diagnosticsShown){diagnostics.hidden=true;diagnosticButton.classList.remove("selected");return;}
      diagnostics.hidden=false;diagnosticButton.classList.add("selected");
      diagnostics.append(node("p","staxx-trendnote","Local health indicators only. No API keys, financial records, employee names, battle stats or personal IDs are collected in this report."));
      const buttons=node("div","staxx-diagnostic-actions"),check=node("button","","Check installed tools"),copy=node("button","","Copy safe report");
      check.type=copy.type="button";check.dataset.checkDiagnostics="1";copy.dataset.copyDiagnostics="1";
      buttons.append(check,copy);diagnostics.append(buttons);
      for(const row of diagnosticReportV25().tools){
        const card=node("div","staxx-overview-card");
        card.append(node("b","",row.label+" · "+(row.connected?"connected":"not running on this page")),
          node("p","",row.health?.version?"Version "+row.health.version:"Version not reported"),
          node("p","",row.health?"API "+row.health.api+" · Storage "+row.health.storage+" · UI "+row.health.ui:
            "No recent health response; open this tool or check whether it is enabled in TornPDA."),
          node("p","",row.stale?"Last action data stale or unverified":"Last action data within declared freshness window"),
          node("p","",row.actionCount+" recommendations · "+row.alertCount+" alerts"));
        if(row.health?.detail)card.append(node("small","staxx-trendnote",row.health.detail));
        diagnostics.append(card);
      }
      const output=node("textarea");output.id="staxx-safe-report";output.readOnly=true;output.hidden=true;
      output.value=JSON.stringify(diagnosticReportV25(),null,2);diagnostics.append(output);
    }

    function showOverview(){
      overview.replaceChildren();
      overview.append(node("p","staxx-trendnote","All registered tools automatically appear here, including future Staxx scripts. Stale suggestions are labelled and sorted after current data."));
      const syncButton=node("button","staxx-overview-switch","↻ Check current data across connected tools");
      syncButton.type="button";syncButton.dataset.syncAll="1";overview.append(syncButton);
      for(const [i,item] of taskRowsV25().slice(0,5).entries()){
        const row=node("button","staxx-task "+(!item.cached&&item.status==="urgent"?"urgent":""));
        row.dataset.openAlertTool=item.owner;row.dataset.openAlertId=item.id;
        row.append(node("span","staxx-step",(i+1)+" · "+item.tool+(item.cached?" · CHECK FRESHNESS":"")),node("b","",item.title));
        if(item.detail)row.append(node("small","",item.detail));overview.append(row);
      }
      for(const e of entries){
        const s=summaries[e.id],card=node("article","staxx-overview-card");
        card.append(node("b","",e.label),node("p","",s?.headline || (active[e.id]?"No verified figures yet":"Open tool for the latest figures")));
        const d=node("dl");
        for(const m of (Array.isArray(s?.metrics)?s.metrics:[]).slice(0,4)){
          const group=node("div");group.append(node("dt","",m.label),node("dd","",m.value));d.append(group);
        }
        if(d.childElementCount)card.append(d);
        const trend=trendCard(e.id);if(trend)card.append(trend);
        const btn=node("button","staxx-overview-switch","Open "+e.label);btn.dataset.openStaxx=e.id;card.append(btn);
        overview.append(card);
      }
      overview.hidden=!overviewShown;
      overviewButton.classList.toggle("selected",overviewShown);
      overviewButton.setAttribute("aria-expanded",String(overviewShown));
    }

    // Contextual, non-invasive Torn page tip. It never fills fields or performs gameplay.
    function currentContext(){
      const path=String(location.pathname||"").toLowerCase();
      if(path==="/gym.php")return {id:"happy",name:"Gym"};
      if(path==="/companies.php")return {id:"company",name:"Company"};
      if(path==="/page.php"&&/\bsid=itemmarket\b/i.test(String(location.search||"")))return {id:"profit",name:"Item Market"};
      if(path==="/page.php"&&/\bsid=stocks\b/i.test(String(location.search||"")))return {id:"profit",name:"Stock Market"};
      return null;
    }
    function contextEnabled(){return safeRead("staxx-hub-context-v1",true)!==false;}
    function renderContext(){
      const old=document.getElementById("staxx-page-tip");
      const control=root.querySelector("[data-context-toggle]");
      if(control){control.textContent="On-page guidance: "+(contextEnabled()?"On":"Off");
        control.setAttribute("aria-pressed",String(contextEnabled()));}
      const ctx=currentContext();
      // TornPDA can display desktop-width pages within a narrow touch viewport.
      // Never insert guidance into a native heading on a touch device or small layout.
      const touch=typeof navigator!=="undefined"&&Number(navigator.maxTouchPoints)>0;
      const coarse=typeof window.matchMedia==="function"&&window.matchMedia("(pointer: coarse)").matches;
      const width=Math.min(Number(window.innerWidth)||9999,Number(document.documentElement.clientWidth)||9999);
      if(!ctx||!contextEnabled()||touch||coarse||width<850||!active[ctx.id]||openPanels.size||panelOpen||expanded){
        if(old)old.remove();return;
      }
      const anchor=document.querySelector?.("#gymroot h1, #mainContainer h1, .content-wrapper h1, h1");
      const safeParent=anchor?.parentElement;
      const parentWidth=typeof safeParent?.getBoundingClientRect==="function"?safeParent.getBoundingClientRect().width:0;
      if(!anchor||typeof anchor.insertAdjacentElement!=="function"||parentWidth<540||anchor.closest?.("#staxx-hub-root, [role=dialog], #hhj-compact-panel")){if(old)old.remove();return;}
      const set=actionSets[ctx.id],fresh=set&&!set.cached&&Date.now()-Number(set.updated)<(ctx.id==="company"?86400000:ctx.id==="happy"?900000:480000);
      const ranks={urgent:5,now:4,soon:3,review:2,optional:1};
      const items=fresh&&Array.isArray(set.items)?set.items.slice().sort((a,b)=>(ranks[b.status]||0)-(ranks[a.status]||0)||(b.priority||0)-(a.priority||0)):[];
      // Stale/missing data triggers automatic refresh inside each tool; never cover Torn
      // with a large "refresh" prompt or present cached recommendations as live.
      const first=items.find(x=>!/^((refresh|recheck|scan)(-|$))/i.test(String(x.id||"")));
      if(!first){if(old)old.remove();return;}
      const title=first.title;
      const detail=first.detail||"";
      // Reuse existing element to avoid mutating Torn's DOM during every heartbeat.
      const fingerprint=ctx.id+"|"+title+"|"+detail+"|"+String(first?.id||"");
      if(old&&old.dataset.fingerprint===fingerprint&&old.previousElementSibling===anchor)return;
      if(old)old.remove();
      const bar=node("div");bar.id="staxx-page-tip";bar.dataset.fingerprint=fingerprint;
      bar.setAttribute("role","region");bar.setAttribute("aria-label","Staxx contextual guidance");
      const heading=node("strong","",ctx.name+" · NEXT ACTION");
      const message=node("span","",title),sub=node("small","",detail);
      const button=node("button","","Review action ›");
      button.type="button";button.addEventListener("click",()=>openTool(ctx.id,first.id));
      bar.append(heading,message,button,sub);
      anchor.insertAdjacentElement("afterend",bar);
    }
    function renderWelcome(){
      const host=root.querySelector('#staxx-hub-welcome');if(!host)return;
      const done=safeRead('staxx-hub-onboarded-v1',false)===true;
      host.hidden=done;host.replaceChildren();if(done)return;
      host.append(node('strong','','Welcome to StaxxHub'),node('p','','1. Today shows your next verified action. 2. Tools opens each installed helper. 3. Alerts takes you to the exact issue.'));
      host.append(node('p','','Simple mode keeps the important tabs visible; Advanced restores every section. You can change this under More.'));
      const finish=node('button','','Got it · Start using Staxx');finish.type='button';finish.dataset.hubGuideDone='1';host.append(finish);
    }
    function categoryFor(item){return item.status==='urgent'||item.status==='now'?'now':item.status==='soon'?'soon':'optional';}
    function taskLabel(item){return item.cached?'LAST OBSERVED':categoryFor(item)==='now'?'DO NOW':categoryFor(item)==='soon'?'SOON':'OPTIONAL';}
    function effortLabel(item){return Number.isInteger(item.reviewMinutes)&&item.reviewMinutes>=1&&item.reviewMinutes<=60?'≈ '+item.reviewMinutes+' min review':'Review time not estimated';}
    function bestAction(){return taskRowsV25().find(x=>!x.cached&&Boolean(active[x.owner]))||null;}
    function renderBest(){
      const host=root.querySelector('#staxx-hub-best');if(!host)return;
      host.replaceChildren();
      const first=bestAction();
      if(!first){host.append(node('p','staxx-empty','No verified current recommendation. Open a tool or use Dashboard to request a fresh check.'));return;}
      const go=node('button','staxx-task '+(first.status==='urgent'?'urgent':''));
      go.type='button';go.dataset.openAlertTool=first.owner;go.dataset.openAlertId=first.id;
      go.append(node('span','staxx-step','BEST NEXT · '+first.tool+' · '+taskLabel(first)),node('b','',first.title));
      if(first.detail)go.append(node('small','',first.detail));
      go.append(node('small','staxx-review-minutes',effortLabel(first)));
      host.append(go);
      const why=first.status==='urgent'?'Urgent advisory reported by '+first.tool+'.':first.dueAt&&first.dueAt<=Date.now()?'Source reports this is due.':first.status==='now'?'The tool reports it is actionable now.':first.status==='soon'?'Upcoming step before optional reviews.':'Top-ranked currently reported review.';
      host.append(node('p','staxx-advice',why+' Ranked using source urgency, due time, and priority. Always verify the live Torn page before acting.'));
    }
    function renderFrequent(){
      const host=root.querySelector('#staxx-hub-frequent');if(!host)return;
      host.replaceChildren();
      const now=Date.now(),ranked=usage.filter(x=>x.count>=2&&now-Number(x.last)<=30*86400000&&active[x.tool])
        .sort((a,b)=>(b.count*10+Math.max(0,30-Math.floor((now-b.last)/86400000)))-(a.count*10+Math.max(0,30-Math.floor((now-a.last)/86400000))));
      for(const x of ranked.slice(0,4)){
        const e=entries.find(item=>item.id===x.tool);if(!e)continue;
        const route=(sectionsByTool[x.tool]||e.sections||[]).find(r=>r[0]===x.section);
        if(x.section&&!route)continue;
        const btn=node('button');btn.type='button';
        if(route){btn.dataset.hubSectionTool=x.tool;btn.dataset.hubSectionTab=x.section;}else btn.dataset.openStaxx=x.tool;
        btn.append(node('span','',route?route[1]:e.label),node('small','',e.label+' · '+x.count+' visits'));
        host.append(btn);
      }
      if(!host.children.length)host.append(node('p','staxx-empty','Shortcuts appear here after you open a tool or section twice.'));
    }
    function renderDashboard(){
      const host=root.querySelector('#staxx-hub-dashboard');if(!host)return;
      host.replaceChildren();
      const check=node('button','staxx-overview-switch','↻ Refresh connected tools');check.type='button';check.dataset.syncAll='1';host.append(check);
      host.append(node('p','staxx-trendnote','Last-reported figures from each helper. Forecasts and estimates are not completed Torn actions.'));
      for(const e of entries){
        const sum=summaries[e.id],card=node('article','staxx-overview-card');
        card.append(node('b','',e.label));
        card.append(node('p','',sum?.headline||(active[e.id]?'Awaiting data':'Enable script to see figures')));
        const date=Number(sum?.updated),known=Number.isFinite(date)&&date>0&&date<=Date.now()+60000;
        card.append(node('small','staxx-trendnote',known?'Reported '+new Date(date).toLocaleString('en-GB')+(Date.now()-date>freshnessMs(e.id)?' · Stale':''):'No timestamped data'));
        const dl=node('dl');
        for(const metric of (Array.isArray(sum?.metrics)?sum.metrics:[]).slice(0,4)){
          const group=node('div');group.append(node('dt','',metric.label),node('dd','',metric.value));dl.append(group);
        }
        if(dl.childElementCount)card.append(dl);
        const go=node('button','staxx-overview-switch','Open '+e.label);go.type='button';go.dataset.openStaxx=e.id;card.append(go);
        host.append(card);
      }
    }
    function renderActivity(){
      const host=root.querySelector('#staxx-hub-activity');if(!host)return;
      host.replaceChildren();
      host.append(node('p','staxx-trendnote','API logs are verified events; snapshots are observed changes; manual entries are labelled locally recorded. Nothing here confirms a suggested action was completed.'));
      let shown=0;
      for(const event of activity.slice(0,30)){
        const e=entries.find(x=>x.id===event.tool);
        if(!e)continue;
        const row=node('article','staxx-overview-card');
        const type=event.source==='api'?'Verified Torn log':event.source==='snapshot'?'Observed snapshot':'Locally recorded';
        row.append(node('b','',e.label+' · '+type),node('p','',event.title));
        if(event.detail)row.append(node('small','staxx-trendnote',event.detail));
        const when=node('time','',new Date(event.at).toLocaleString('en-GB'));row.append(when);
        const go=node('button','staxx-overview-switch','View '+e.label);go.type='button';
        if(event.section){go.dataset.hubSectionTool=event.tool;go.dataset.hubSectionTab=event.section;}else go.dataset.openStaxx=event.tool;
        row.append(go);host.append(row);shown++;
      }
      if(!shown)host.append(node('p','staxx-empty','No source-backed events recorded yet. Activity appears after a helper observes a confirmed log, snapshot change, or local record.'));
    }
    function renderTasks(){
      if(!taskList)return;
      taskList.replaceChildren();
      renderBest();renderFrequent();
      const filters=root.querySelector('#staxx-hub-task-filters');
      const all=taskRowsV25();
      if(filters){
        filters.replaceChildren();
        for(const [value,label] of [['all','All'],['now','Do now'],['soon','Soon'],['optional','Optional']]){
          const count=all.filter(x=>value==='all'||categoryFor(x)===value).length;
          const btn=node('button','',label+' · '+count);btn.type='button';btn.dataset.taskFilter=value;btn.setAttribute('aria-pressed',String(taskFilter===value));filters.append(btn);
        }
      }
      const rows=all.filter(x=>taskFilter==='all'||categoryFor(x)===taskFilter);
      for(const item of rows.slice(0,(expandedTaskList||uiMode==='advanced')?6:2)){
        const btn=node("button","staxx-task "+(!item.cached&&item.status==="urgent"?"urgent":!item.cached&&item.status==="soon"?"soon":""));
        btn.type="button";btn.dataset.openAlertTool=item.owner;btn.dataset.openAlertId=item.id;
        btn.append(node("span","staxx-step",taskLabel(item)+" · "+item.tool),
          node("b","",item.title));
        if(item.detail)btn.append(node("small","",item.detail));
        btn.append(node('small','staxx-review-minutes',effortLabel(item)));
        if(item.dueAt)btn.append(node("small","",timeUntil(item.dueAt)));
        if(item.cached)btn.append(node("small","","Verify current Torn data before acting"));
        taskList.append(btn);
      }
      if(!rows.length)taskList.append(node("p","staxx-empty","No verified next steps yet. Open a tool to refresh its data."));
      if(rows.length>2&&uiMode!=='advanced'){
        const more=node("button","staxx-more-tasks",expandedTaskList?"Show fewer actions":"Show "+Math.min(rows.length-2,4)+" more actions");
        more.type="button";more.dataset.toggleTasks="1";taskList.append(more);
      }
      if(rows.length>6&&(expandedTaskList||uiMode==='advanced'))taskList.append(node("p","staxx-foot",String(rows.length-6)+" further recommendations inside your tools"));
    }
    function render(){
      renderWelcome();
      const modeButton=root.querySelector('[data-hub-mode]');if(modeButton)modeButton.textContent='Display: '+(uiMode==='simple'?'Simple':'Advanced')+' · change';
      tools.replaceChildren();alerts.replaceChildren();
      const quick=root.querySelector("#staxx-hub-quick-tools");
      if(quick)quick.replaceChildren();
      let total=0,maxLevel=0,visible=0,muted=0;
      for(const [index,e] of entries.entries()){
        const n=activeNotice(e.id),count=n?Math.min(99,Number(n.count)||0):0;
        total+=count;visible+=Number(count>0);
        if(n)maxLevel=Math.max(maxLevel,n.level==="urgent"?2:n.level==="warning"?1:0);
        if(!n && notices[e.id]?.count>0)muted++;
        const btn=node("button","staxx-tool");btn.type="button";btn.dataset.openStaxx=e.id;
        const info=node("span","staxx-info");info.append(node("b","",e.label),node("small","",active[e.id]?e.desc:"Enable script to open"));
        btn.append(node("span","staxx-icon",e.icon),info,node("span","staxx-pill"+(count?" on":""),count||"›"));
        if(arrangeShown){
          const row=node("div","staxx-toolrow"),up=node("button","staxx-move","↑"),down=node("button","staxx-move","↓");
          up.type=down.type="button";up.dataset.moveId=down.dataset.moveId=e.id;up.dataset.moveDir="-1";down.dataset.moveDir="1";
          up.disabled=index===0;down.disabled=index===entries.length-1;
          up.title="Move "+e.label+" up";down.title="Move "+e.label+" down";
          row.append(btn,up,down);tools.append(row);
        }else tools.append(btn);
        if(quick&&index<3){
          const shortcut=node("button","staxx-quick-tool");
          shortcut.type="button";shortcut.dataset.openStaxx=e.id;
          shortcut.disabled=!active[e.id];
          shortcut.append(node("span","",e.label),node("small","",!active[e.id]?"Not active":count?count+" alerts":"Open"));
          quick.append(shortcut);
        }
      }
      toggle.classList.toggle("staxx-urgent",maxLevel===2);
      toggle.classList.toggle("staxx-warning",maxLevel===1);
      bubble.hidden=total===0;bubble.textContent=total>=100?"99+":String(total);
      toggle.setAttribute("aria-label",total?total+" Staxx notifications; open tools":"Open Staxx tools");
      root.querySelector("#staxx-hub-total").textContent=visible?visible+" tools":muted?muted+" muted":"All clear";
      const alertsTab=root.querySelector('[data-hub-view="alerts"]');
      if(alertsTab)alertsTab.textContent=total?"Alerts · "+(total>99?"99+":total):"Alerts";
      for(const e of entries){
        const n=activeNotice(e.id);if(!n)continue;
        const card=node("div","staxx-alert "+n.level);
        const title=node("button","staxx-alert-title",e.label+" · "+n.count+" alert"+(n.count===1?"":"s"));
        title.type="button";title.dataset.openStaxx=e.id;card.append(title);
        card.append(node("span","",n.summary||"Needs attention"));
        if(Array.isArray(n.alerts)&&n.alerts.length){
          for(const item of n.alerts.slice(0,8)){
            const go=node("button","staxx-alert-item",item.title);
            go.type="button";go.dataset.openAlertTool=e.id;go.dataset.openAlertId=item.id;
            go.title=item.detail||item.title;
            card.append(go);
            if(item.detail)card.append(node("small","staxx-alert-description",item.detail));
          }
          if(n.alerts.length>8)card.append(node("small","",String(n.alerts.length-8)+" more — open the tool's Alerts tab"));
        }else for(const item of n.items.slice(0,2))card.append(node("small","",item));
        if(n.cached)card.append(node("small","","Last observed on a previous page"));
        if(n.dueAt){const countdown=node("small","staxx-due",timeUntil(n.dueAt));card.append(countdown);}
        const buttons=node("div","staxx-alert-actions");
        const dismiss=node("button","","Dismiss"),snooze=node("button","","Snooze ▾");
        dismiss.type=snooze.type="button";dismiss.dataset.dismissStaxx=e.id;snooze.dataset.snoozeStaxx=e.id;
        buttons.append(dismiss,snooze);card.append(buttons);
        const menu=node("div","staxx-snooze-menu");menu.hidden=true;
        for(const [minutes,label] of [[15,"15m"],[60,"1h"],[240,"4h"],[1440,"24h"]]){
          const option=node("button","",label);option.type="button";option.dataset.snoozeId=e.id;option.dataset.snoozeMinutes=String(minutes);menu.append(option);
        }
        const custom=node("label","","Custom");const input=node("input");input.type="number";input.min="1";input.max="10080";input.value="120";input.title="Snooze duration in minutes";
        const units=node("span","","min");custom.append(input,units);
        const set=node("button","","Set");set.type="button";set.dataset.snoozeCustom=e.id;menu.append(custom,set);
        card.append(menu);alerts.append(card);
      }
      if(!visible)alerts.append(node("p","staxx-empty",muted?"Alerts dismissed or snoozed. New alerts will still appear.":"Nothing needs your attention right now."));
      renderTasks();
      renderDashboard();
      renderActivity();
      if(findOpen)renderFind();
      showOverview();
      showDiagnosticsV25();
      launcherVisibility();
      renderContext();
    }
    root.addEventListener("click",e=>{
      const b=e.target.closest("button");if(!b)return;
      if(b.dataset.hubView){setFindOpen(false);switchHubView(b.dataset.hubView);return;}
      if(b.dataset.taskFilter){taskFilter=b.dataset.taskFilter;expandedTaskList=false;renderTasks();return;}
      if(b.hasAttribute('data-usage-reset')){usage=[];saveLocal(usageKey,usage);renderFrequent();return;}
      if(b.hasAttribute('data-activity-clear')){activity=[];saveLocal(activityKey,activity);renderActivity();return;}
      if(b.hasAttribute('data-hub-find')){setFindOpen(!findOpen);return;}
      if(b.dataset.hubSectionTool){openTool(b.dataset.hubSectionTool,null,b.dataset.hubSectionTab);return;}
      if(b.dataset.hubGuideDone){saveLocal('staxx-hub-onboarded-v1',true);renderWelcome();return;}
      if(b.hasAttribute('data-hub-guide')){saveLocal('staxx-hub-onboarded-v1',false);switchHubView('today');renderWelcome();return;}
      if(b.hasAttribute('data-hub-mode')){uiMode=uiMode==='simple'?'advanced':'simple';saveLocal('staxx-hub-mode-v1',uiMode);expandedTaskList=false;publishMode();render();return;}
      if(b.dataset.toggleTasks){expandedTaskList=!expandedTaskList;renderTasks();return;}
      if(b.dataset.contextToggle!==undefined){saveLocal("staxx-hub-context-v1",!contextEnabled());renderContext();return;}
      if(b.dataset.dismissStaxx){const id=b.dataset.dismissStaxx,n=notices[id];if(n){controls[id]={...controls[id],dismissed:n.fingerprint,snoozeUntil:0};saveLocal("staxx-hub-alert-control-"+id,controls[id]);render();}return;}
      if(b.dataset.snoozeStaxx){const menu=b.parentNode?.nextSibling;if(menu)menu.hidden=!menu.hidden;return;}
      if(b.dataset.snoozeId || b.dataset.snoozeCustom){
        const id=b.dataset.snoozeId||b.dataset.snoozeCustom;
        const minutes=b.dataset.snoozeCustom?Number(b.parentNode?.querySelector("input")?.value):Number(b.dataset.snoozeMinutes);
        if(!Number.isInteger(minutes)||minutes<1||minutes>10080)return;
        controls[id]={...controls[id],snoozeUntil:Date.now()+minutes*60000};
        saveLocal("staxx-hub-alert-control-"+id,controls[id]);render();return;
      }
      if(b.dataset.moveId){
        const from=entries.findIndex(x=>x.id===b.dataset.moveId),to=from+Number(b.dataset.moveDir);
        if(from>=0&&to>=0&&to<entries.length){
          const [entry]=entries.splice(from,1);entries.splice(to,0,entry);
          saveLocal("staxx-hub-order-v3",entries.map(x=>x.id));render();
        }return;
      }
      if(b.hasAttribute("data-arrange")){
        arrangeShown=!arrangeShown;b.setAttribute("aria-pressed",String(arrangeShown));b.textContent=arrangeShown?"Done":"Reorder";render();return;
      }
      if(b.dataset.openAlertTool){openTool(b.dataset.openAlertTool,b.dataset.openAlertId);return;}
      if(b.dataset.openStaxx){openTool(b.dataset.openStaxx);return;}
      if(b.hasAttribute("data-overview")){overviewShown=!overviewShown;if(overviewShown){diagnosticsShown=false;refreshConnectedV26();}render();return;}
       if(b.dataset.syncAll){refreshConnectedV26(true);return;}
       if(b.hasAttribute("data-diagnostics")){diagnosticsShown=!diagnosticsShown;if(diagnosticsShown){overviewShown=false;
         document.dispatchEvent(new CustomEvent("staxx:diagnostics-request"));}render();return;}
       if(b.dataset.checkDiagnostics){document.dispatchEvent(new CustomEvent("staxx:ping"));
         document.dispatchEvent(new CustomEvent("staxx:diagnostics-request"));showDiagnosticsV25();return;}
       if(b.dataset.copyDiagnostics){const report=JSON.stringify(diagnosticReportV25(),null,2);
         const clipboard=window.navigator?.clipboard;
         if(clipboard?.writeText){clipboard.writeText(report).catch(()=>{const box=diagnostics.querySelector("#staxx-safe-report");if(box){box.hidden=false;box.value=report;}});}
         else{const box=diagnostics.querySelector("#staxx-safe-report");if(box){box.hidden=false;box.value=report;box.select?.();}}
         return;}
      if(b===toggle){if(Date.now()<suppressClickUntil)return;setExpanded(true);refreshConnectedV26();return;}
      if(b.hasAttribute("data-hub-close"))setExpanded(false);
    });
    veil.addEventListener("click",()=>setExpanded(false));
    findInput?.addEventListener?.('input',renderFind);
    findInput?.addEventListener?.('keydown',e=>{
      if(e.key==='Enter'){
        const first=findResults?.querySelector?.('button:not(:disabled)');
        if(first){e.preventDefault?.();first.click();}
      }
    });
    document.addEventListener('staxx:find',()=>{
      document.dispatchEvent(new CustomEvent('staxx:closeall'));
      openPanels.clear();panelOpen=false;
      setExpanded(true);setFindOpen(true);
    });
    document.addEventListener("keydown",e=>{
      if(e.key==='Escape'&&findOpen){e.preventDefault?.();setFindOpen(false);return;}
      if(e.key==='Escape'&&expanded){setExpanded(false);return;}
      if(expanded&&(e.ctrlKey||e.metaKey)&&String(e.key).toLowerCase()==='k'){
        e.preventDefault?.();setFindOpen(true);
      }
    });
    toggle.addEventListener("pointerdown",e=>{
      if(e.button!==undefined&&e.button!==0)return;
      moving={id:e.pointerId,startY:e.clientY,top:toggle.getBoundingClientRect().top,dragged:false};
      try{toggle.setPointerCapture?.(e.pointerId);}catch(_){}
    });
    toggle.addEventListener("pointermove",e=>{
      if(!moving||e.pointerId!==moving.id)return;
      if(Math.abs(e.clientY-moving.startY)>7)moving.dragged=true;
      if(moving.dragged){const height=Math.max(160,window.innerHeight||600);
        const y=Math.max(18,Math.min(height-67,moving.top+e.clientY-moving.startY));
        toggle.style.top=Math.round(y)+"px";}
    });
    function endMove(e){if(!moving||e.pointerId!==moving.id)return;
      if(moving.dragged){suppressClickUntil=Date.now()+350;saveLocal("staxx-hub-position-v2",position((parseFloat(toggle.style.top)||0)/Math.max(1,window.innerHeight)));
        // Prevent a post-drag synthetic click from reopening the drawer.
        e.preventDefault?.();}
      moving=null;
    }
    toggle.addEventListener("pointerup",endMove);toggle.addEventListener("pointercancel",endMove);
    window.addEventListener("resize",()=>position(safeRead("staxx-hub-position-v2",0.43)));
    document.addEventListener("staxx:panel",e=>{
      if(!e.detail||!idOk(e.detail.id))return;
      if(e.detail.open){openPanels.add(e.detail.id);panelOpen=true;setExpanded(false);}
      else{openPanels.delete(e.detail.id);panelOpen=openPanels.size>0;launcherVisibility();}
      renderContext();
    });
    document.addEventListener('staxx:mode',e=>{const m=e.detail?.mode;if((m==='simple'||m==='advanced')&&m!==uiMode){uiMode=m;saveLocal('staxx-hub-mode-v1',m);expandedTaskList=false;render();}});
    document.addEventListener('staxx:visit',e=>{
      const d=e.detail||{},id=d.id;
      if(!idOk(id)||!active[id])return;
      const entry=entries.find(x=>x.id===id),routes=sectionsByTool[id]||entry?.sections||[];
      if(!routes.some(route=>route[0]===d.section))return;
      const key=id+'/'+d.section,prior=storedUse(key);
      if(prior&&Date.now()-Number(prior.last)<10000)return;
      recordUse(id,d.section);
    });
    document.addEventListener("staxx:register",e=>{
      const d=e.detail||{},id=d.id;if(!idOk(id))return;
      let entry=entries.find(x=>x.id===id);
      if(!entry && entries.length<25){
        entry={id,label:String(d.label||id).slice(0,40),icon:String(d.icon||"S").slice(0,3),desc:String(d.desc||"Staxx tool").slice(0,70)};
        entries.push(entry);controls[id]=safeRead("staxx-hub-alert-control-"+id,{});
        saveLocal("staxx-hub-registry-v2",entries.slice(3));
      }
      if(entry){
        if(d.label)entry.label=String(d.label).slice(0,40);
        if(d.icon)entry.icon=String(d.icon).slice(0,3);
        if(d.desc)entry.desc=String(d.desc).slice(0,70);
        if(Array.isArray(d.sections))entry.sections=d.sections.slice(0,20)
          .filter(x=>x&&/^[a-z][a-z0-9-]{0,31}$/.test(String(x.id||'')))
          .map(x=>[String(x.id),String(x.label||x.id).slice(0,45)]);
        if(typeof d.trendMetric==='string')entry.trendMetric=d.trendMetric.slice(0,36);
        if(Number(d.freshnessMs)>=60000&&Number(d.freshnessMs)<=86400000)entry.freshnessMs=Number(d.freshnessMs);
        if(!registeredAt[id])registeredAt[id]=Date.now();
        active[id]=true;render();}
    });

    document.addEventListener("staxx:diagnostics",e=>{
      const d=e.detail||{},id=d.id;if(!idOk(id)||!entries.some(x=>x.id===id))return;
      const allow=(value,valid)=>valid.includes(value)?value:"unknown";
      healthReports[id]={version:String(d.version||"not-reported").slice(0,20),
        api:allow(d.api,["ready","stale","missing","error","unknown"]),
        storage:allow(d.storage,["ready","missing","error","unknown"]),
        ui:allow(d.ui,["ready","missing","error","unknown"]),
        detail:String(d.detail||"").replace(/[A-Za-z0-9]{20,}/g,"[redacted]").slice(0,110),
        observedAt:Date.now()};
      if(diagnosticsShown)showDiagnosticsV25();
    });
    document.addEventListener("staxx:notice",e=>{
      const d=e.detail||{},id=d.id;if(!idOk(id)||!entries.some(x=>x.id===id))return;
      const count=Math.min(99,Math.max(0,Math.floor(Number(d.count)||0)));
      const n={count,summary:String(d.summary||"").slice(0,180),
        items:Array.isArray(d.items)?d.items.slice(0,5).map(x=>String(x).slice(0,160)):[],
        level:["urgent","warning","info"].includes(d.level)?d.level:"info",cached:false};
      n.alerts=Array.isArray(d.alerts)?d.alerts.slice(0,30).filter(x=>x&&/^[a-z][a-z0-9-]{0,63}$/.test(String(x.id||""))).map(x=>({id:String(x.id),title:String(x.title||x.id).slice(0,100),detail:String(x.detail||"").slice(0,190)})):[];
      n.dueAt=Number.isFinite(Number(d.dueAt))&&Number(d.dueAt)>0?Number(d.dueAt):null;
      n.fingerprint=JSON.stringify([n.count,n.summary,n.items,n.alerts,n.level,n.dueAt]);
      if(JSON.stringify(notices[id])!==JSON.stringify(n)){notices[id]=n;remember();render();}
    });
    document.addEventListener("staxx:actions",e=>{
      const d=e.detail||{},id=d.id;if(!idOk(id)||!entries.some(x=>x.id===id))return;
      const items=Array.isArray(d.items)?d.items.slice(0,12).filter(a=>a&&/^[a-z][a-z0-9-]{0,63}$/.test(String(a.id||""))).map(a=>({
        id:String(a.id),title:String(a.title||"Review action").slice(0,100),detail:String(a.detail||"").slice(0,160),
        status:["urgent","now","soon","review","optional"].includes(a.status)?a.status:"review",
        priority:Math.max(0,Math.min(100,Number(a.priority)||0)),
        dueAt:Number.isFinite(Number(a.dueAt))&&Number(a.dueAt)>0?Number(a.dueAt):null,
        reviewMinutes:Number.isInteger(Number(a.reviewMinutes))&&Number(a.reviewMinutes)>=1&&Number(a.reviewMinutes)<=60?Number(a.reviewMinutes):null
      })):[];
      const next={items,updated:Number(d.updated)||Date.now(),cached:false};
      if(JSON.stringify(actionSets[id])!==JSON.stringify(next)){actionSets[id]=next;remember();render();}
    });
    document.addEventListener('staxx:activity',e=>{
      const d=e.detail||{},tool=d.id;
      if(!idOk(tool)||!entries.some(x=>x.id===tool)||!Array.isArray(d.events))return;
      let changed=false;
      const now=Date.now();
      for(const item of d.events.slice(0,30)){
        if(!item||typeof item.id!=='string'||!/^[a-z0-9][a-z0-9_.:-]{0,98}$/i.test(item.id))continue;
        if(!['api','snapshot','recorded'].includes(item.source))continue;
        const at=Number(item.at);
        if(!Number.isFinite(at)||at<=now-30*86400000||at>now+60000)continue;
        if(activity.some(x=>x.tool===tool&&x.id===item.id))continue;
        const routes=sectionsByTool[tool]||entries.find(x=>x.id===tool)?.sections||[];
        const section=routes.some(x=>x[0]===item.section)?item.section:null;
        activity.push({tool,id:item.id,at,source:item.source,
          title:String(item.title||'Observed update').slice(0,100),
          detail:String(item.detail||'').slice(0,180),section});
        changed=true;
      }
      if(changed){activity=activity.filter(x=>x.at>Date.now()-30*86400000)
        .sort((a,b)=>b.at-a.at).slice(0,120);saveLocal(activityKey,activity);renderActivity();}
    });
    document.addEventListener("staxx:summary",e=>{
      const d=e.detail||{},id=d.id;if(!idOk(id)||!entries.some(x=>x.id===id))return;
      const entry={headline:String(d.headline||"").slice(0,90),
        metrics:Array.isArray(d.metrics)?d.metrics.slice(0,4).map(x=>({label:String(x.label||"").slice(0,36),value:String(x.value??"—").slice(0,45)})):[],
        updated:Number(d.updated)||Date.now()};
      if(JSON.stringify(summaries[id])!==JSON.stringify(entry)){summaries[id]=entry;recordTrend(id,entry);remember();if(expanded&&overviewShown)showOverview();renderDashboard();}
    });
    window.setInterval(()=>{if(!document.hidden&&entries.some(e=>Number(controls[e.id]?.snoozeUntil)>0&&Number(controls[e.id]?.snoozeUntil)<=Date.now())){for(const e of entries){if(Number(controls[e.id]?.snoozeUntil)>0&&Number(controls[e.id]?.snoozeUntil)<=Date.now()){controls[e.id]={...controls[e.id],snoozeUntil:0};saveLocal("staxx-hub-alert-control-"+e.id,controls[e.id]);}}render();}else if(!document.hidden&&expanded&&entries.some(e=>activeNotice(e.id)?.dueAt)){render();}},60000);
    window.addEventListener?.("hashchange",renderContext);
    window.addEventListener?.("popstate",renderContext);
    window.addEventListener?.("resize",renderContext);
    window.setInterval?.(()=>{if(!document.hidden)renderContext();},15000);
    // Older v1 notifications cannot be trusted for dismiss-state comparisons.
    render();
    document.dispatchEvent(new CustomEvent("staxx:ping"));
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",startHub,{once:true});else startHub();
})();







(function () {
  "use strict";
  if (window.top !== window.self || document.getElementById("tch-open")) return;
  const STORE = "company-helper-v1";
  const isCompanyPage = function () {return /^\/companies\.php$/i.test(window.location.pathname);};
  // Keep the local company panel and read-only API available on every Torn page.
  // The standalone company launcher itself stays on companies.php; StaxxHub can
  // open the panel elsewhere without reloading or losing the current Torn page.
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
  let tab = "overview", detailView = "", open = false, busy = false, message = "", severity = "";
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
    if (!/^(company\/(profile|employees|stock|news|applications|[0-9]+\/(?:companies|employees))|torn\/[0-9]+\/companies|torn\/logtypes|user\/log)$/.test(path)) throw Error("Blocked API route.");
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
      // If the director manually recorded a train within 15 minutes of Torn news,
      // bind its existing ledger row to the source rather than counting a second train.
      const manual=(c.training||[]).find(function(t){
        return !t.voided && !canonicalTrainingSource(t) &&
          Number(t.playerId)===Number(result.playerId) &&
          Number(t.units)===Number(result.units) &&
          Number.isFinite(Number(t.ts)) &&
          Math.abs(Number(t.ts)-Number(n.timestamp))<=900;
      });
      if(manual){
        manual.sourceId="news:"+n.id;
        n.matchStatus="matched-manual";n.matchedPlayerId=result.playerId;matched++;return;
      }
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
  // Torn v2 supplies an official next-page URL for some paginated endpoints.
  // Extract ONLY approved parameters from the expected official API route.
  // A server-provided URL is never fetched directly and never trusted as a route.
  function importNextParams(response,path,expected) {
    const link=response && response._metadata && response._metadata.links && response._metadata.links.next;
    if(link==null || link==="") return {next:null,invalid:false};
    if(typeof link!=="string") return {next:null,invalid:true};
    try {
      const u=new URL(link,API+path);
      if(u.protocol!=="https:" || u.hostname!=="api.torn.com" || u.port || u.username || u.password ||
         u.pathname!=="/v2/"+path || u.hash) return {next:null,invalid:true};
      const allowed=path==="company/news"?["cat","limit","sort","from","to"]:["log","limit","sort","from","to","nanostamp"];
      const result={},entries=Array.from(u.searchParams.entries());
      if(!entries.length) return {next:null,invalid:true};
      for(const pair of entries) {
        const k=pair[0],v=pair[1];
        if(!allowed.includes(k) || Object.prototype.hasOwnProperty.call(result,k)) return {next:null,invalid:true};
        if(k==="limit" && (!/^\d{1,3}$/.test(v) || Number(v)<1 || Number(v)>100)) return {next:null,invalid:true};
        if(["from","to","nanostamp"].includes(k) && !/^\d+$/.test(v)) return {next:null,invalid:true};
        if(k==="sort" && !/^(ASC|DESC)$/i.test(v)) return {next:null,invalid:true};
        result[k]=v;
      }
      if(path==="company/news" && result.cat!=="training") return {next:null,invalid:true};
      if(path==="user/log" && result.log!==expected) return {next:null,invalid:true};
      return {next:result,invalid:false};
    }catch(_) {return {next:null,invalid:true};}
  }
  function importPageDecision(response,path,expected,list) {
    const cursor=importNextParams(response,path,expected);
    if(cursor.invalid) return {next:null,warning:"Torn supplied an unrecognised pagination link. History has NOT advanced; use a new import only after checking the API response."};
    if(cursor.next) return {next:cursor.next,warning:null};
    // Without an official continuation token, a full page could cut through
    // multiple records sharing the oldest second. Never silently skip them.
    if(list.length>=100) return {next:null,warning:"A full page arrived without a safe continuation cursor. Older records may share a timestamp; history has NOT advanced."};
    return {next:null,warning:null};
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
      if(n.matchReason && /Possible duplicate of a manually recorded purchase/.test(n.matchReason)) {n.matchStatus="review";review++;return;}
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
    if(stockModeV117(c)==="service")results.push({label:"Company model",state:"complete",note:"Service company: physical stock does not apply."});
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
    // Outstanding purchased trains are a ledger balance, not a task, until
    // the live company train bank can actually fulfil an eligible obligation.
    const paidTraining=trainPlanV3(c);
    const firstReady=paidTraining.queue.find(function(x){return x.give>0;});
    if(paidTraining.allocate>0&&firstReady){
      add("next","Paid training ready to give",
        firstReady.name+" is owed "+firstReady.owed+" train(s); "+firstReady.give+" can be given now (oldest eligible first). No train has been assigned automatically.",
        "High · confirmed ledger and reported train bank","training-queue");
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

  // v1 advisory engine. Never changes Torn gameplay state.
  function trainPlanV3(c) {
    const available=financialAmount(c.profile&&c.profile.trains),stars=financialAmount(c.profile&&c.profile.rating);
    const base=stars===null?null:Math.min(stars,10),risk=available===null||base===null?null:Math.max(0,available+base-20);
    const summary=aggregates(c).balance;
    const eligible=Object.keys(summary).map(function(k){
      const p=(c.staff||[]).find(function(x){return String(x.id)===k;});
      return p&&num(p.days_in_company)>=3&&summary[k].owed>0?
        {id:k,name:p.name,owed:summary[k].owed,oldest:summary[k].oldest||Infinity}:null;
    }).filter(Boolean).sort(function(a,b){return a.oldest-b.oldest;});
    let left=available===null?0:available;
    const queue=eligible.map(function(p){const give=Math.min(left,p.owed);left-=give;return Object.assign({},p,{give:give});});
    return {available:available,base:base,overflow:risk,queue:queue,allocate:queue.reduce(function(n,p){return n+p.give;},0)};
  }
  // The official company type and last *successful* empty-stock response
  // outrank old cached stock rows. Stock GET errors never imply stockless operation.
  function stockModeV117(c){
    const type=c?.profile?.type;
    const name=String(typeof type==='string'?type:type?.name||'').trim().replace(/\s+/g,' ').toLowerCase();
    // Service companies such as Fitness Centers must never inherit ghost stock
    // lines from older saved data or a previous API shape.
    if(name==='fitness center'||name==='fitness centre')return 'service';
    if(c?.stockModeV117==='no-products')return 'no-products';
    if(Array.isArray(c?.stock)&&c.stock.length)return 'products';
    return 'unknown';
  }
  function reconcileStocklessCompanyV119(c,profile){
    if(!c)return false;
    const mode=stockModeV117({profile:profile||c.profile,stock:c.stock,stockModeV117:c.stockModeV117});
    if(mode!=='service'&&mode!=='no-products')return false;
    const changed=!Array.isArray(c.stock)||c.stock.length>0||c.stockFetchError!=null||c.stockModeV117!==mode;
    if(changed){
      // Remove only cached inventory and obsolete stock-read errors. Preserve
      // staff, finances, training ledgers and historical snapshots intact.
      c.stock=[];
      c.stockFetchError=null;
      c.stockModeV117=mode;
    }
    return changed;
  }
  function serviceOperationsV117(c){
    const p=c.profile||{},a=accounting(c),members=financialAmount(p.customers?.daily),weekly=valueOfMetricV12(p.income,'weekly');
    return '<section class="tch-panel"><h2>Service operations · '+esc(p.type?.name||'Company')+'</h2>'+
      '<p>'+(stockModeV117(c)==='service'?'No physical stock to replenish.':'The latest official company stock response has no product lines; replenishment is not recommended.')+' Training capacity is a separate resource and remains fully tracked.</p>'+
      '<div class="tch-metrics">'+
      metricV2('Daily customers',members===null?'Unreported':members,'Torn daily customer metric','','growth-performance')+
      metricV2('Weekly income',weekly===null?'Unreported':money(weekly),'Reported gross income','','growth-accounts')+
      metricV2('Popularity',p.popularity==null?'Unknown':p.popularity+'%','Relative popularity','','growth-pricing')+
      metricV2('Estimated daily P/L',a.known?money(a.profit):'Incomplete','Income less wages and advertising','','growth-accounts')+'</div>'+
      '<div class="tch-actionrow"><button class="primary" data-act="goto" data-target="growth-pricing">Review pricing & ads</button>'+
      '<button data-act="goto" data-target="staff-sim">Optimise staff</button><button data-act="goto" data-target="training-queue">Training queue</button></div>'+
      '<p class="tch-hint">No customer or income numbers are invented when missing. Non-Fitness-Center companies with an empty official stock response show no reported product lines rather than an assumed permissions error.</p></section>';
  }
  function stockAdviceV3(c){
    if(['service','no-products'].includes(stockModeV117(c)))return [];
    const byDate={};
    (c.snapshots||[]).forEach(function(s){if(s&&s.observedAt&&Array.isArray(s.stock))byDate[String(s.observedAt).slice(0,10)]=s.stock;});
    const history=Object.keys(byDate).sort().slice(-7).map(function(k){return byDate[k];});
    const target=[2,3,5,7].includes(c.stockDays)?c.stockDays:3;
    return (c.stock||[]).map(function(p){
      const values=history.map(function(items){return items.find(function(x){return String(x.id)===String(p.id);});})
        .filter(function(x){return x&&financialAmount(x.sold_amount)!==null;}).map(function(x){return Number(x.sold_amount);});
      const today=financialAmount(p.sold_amount),hand=financialAmount(p.in_stock),incoming=financialAmount(p.on_order);
      const rate=values.length>=2?values.reduce(function(a,b){return a+b;},0)/values.length:today;
      const days=rate!==null&&rate>0&&hand!==null?hand/rate:null;
      const qty=rate!==null&&hand!==null&&incoming!==null?Math.max(0,Math.ceil(target*rate-hand-incoming)):null;
      const cost=financialAmount(p.cost);
      return {id:p.id,name:p.name,rate:rate,hand:hand,incoming:incoming,days:days,qty:qty,
        cost:qty!==null&&cost!==null?qty*cost:null,price:p.price,rrp:p.rrp,samples:values.length};
    }).sort(function(a,b){return (a.days===null?Infinity:a.days)-(b.days===null?Infinity:b.days);});
  }
  function riskRadarV3(c){
    const p=c.profile||{},a=accounting(c),trains=trainPlanV3(c),stock=stockAdviceV3(c);
    const funds=financialAmount(p.funds),fixed=a&&a.wages!==null&&a.ad!==null?a.wages+a.ad:null;
    const runway=funds!==null&&fixed!==null&&fixed>0?funds/fixed:null,alerts=[];
    function flag(title,detail,target){alerts.push({title:title,detail:detail,target:target});}
    if(trains.overflow>0)flag("Train storage overflow risk",
      "At least "+trains.overflow+" train(s) could be lost at next close. Trainer bonuses can raise this minimum.","training-queue");
    const critical=stock.filter(function(x){return x.days!==null&&x.days<1;});
    if(critical.length)flag("Stock under one day",critical.map(function(x){return x.name;}).slice(0,3).join(", ")+" needs a stock review.","stock");
    if(runway!==null&&runway<7)flag("Less than 7 days of fixed costs",
      "Funds cover "+runway.toFixed(1)+" days of wages and advertising; excludes other costs.","growth-accounts");
    for(const [field,name,target] of [["efficiency","Efficiency","staff"],["environment","Environment","staff-sim"],["popularity","Popularity","growth-pricing"]]){
      if(p[field]!=null&&Number(p[field])<95)flag(name+" below 95%","Torn currently reports "+p[field]+"%. Investigate before changing costs.",target);
    }
    if(!alerts.length)flag("No immediate exceptions","Continue checking daily results; this does not establish optimal performance.","growth-performance");
    return {alerts:alerts,stock:stock,trains:trains,funds:funds,fixed:fixed,runway:runway};
  }
  // Hungarian maximum-weight assignment preserves exact existing position counts.
  // Switch penalty favours stable staffing; score is requirement fit, not revenue.

  function roleGrowthWeightV11(c,name){
    // Revenue-role signal from Secretary-revealed direct value, not a causal model.
    // Global assignment always retains identical Manager/Marketer/HR/Cleaner slot counts.
    if(/manager|marketer|cleaner|human resources|hr officer|trainer/i.test(String(name)))return 1;
    const measured=(c.staff||[]).filter(function(p){
      return financialAmount(p.value)!==null&&financialAmount(p.value)>0;
    });
    if(measured.length<2)return 1;
    const max=Math.max.apply(null,measured.map(function(p){return Number(p.value);}));
    const matches=measured.filter(function(p){
      return String(p.position&&p.position.name||"").toLowerCase()===String(name).toLowerCase();
    });
    if(!matches.length||max<=0)return 1;
    const average=matches.reduce(function(t,p){return t+Number(p.value);},0)/matches.length;
    return Math.max(1,Math.min(1.3,1+0.3*average/max));
  }
  function balancedAssignmentV3(c){
    const staff=c.staff||[],roles=roleList(c),n=staff.length;
    if(n<2||n>50)return {changes:[],delta:0,reason:"Not enough comparable employees"};
    const slots=staff.map(function(p){return String(p.position&&p.position.name||"");});
    const roleMap={};roles.forEach(function(r){roleMap[r.name.toLowerCase()]=r;});
    if(staff.some(function(p){return !p.stats;})||slots.some(function(x){return !roleMap[x.toLowerCase()];}))
      return {changes:[],delta:0,reason:"Some working stats or position requirements are missing"};
    const scores=staff.map(function(p,i){return slots.map(function(name){
      const fit=score(p,roleMap[name.toLowerCase()]);
      return fit===null?-10000:fit*roleGrowthWeightV11(c,name)-(slots[i]===name?0:5);
    });});
    const u=Array(n+1).fill(0),v=Array(n+1).fill(0),match=Array(n+1).fill(0),way=Array(n+1).fill(0);
    for(let i=1;i<=n;i++){
      match[0]=i;let j0=0;
      const min=Array(n+1).fill(Infinity),seen=Array(n+1).fill(false);
      do{
        seen[j0]=true;let best=Infinity,next=0;
        for(let j=1;j<=n;j++)if(!seen[j]){
          const x=-scores[match[j0]-1][j-1]-u[match[j0]]-v[j];
          if(x<min[j]){min[j]=x;way[j]=j0;}
          if(min[j]<best){best=min[j];next=j;}
        }
        for(let j=0;j<=n;j++)if(seen[j]){u[match[j]]+=best;v[j]-=best;}else min[j]-=best;
        j0=next;
      }while(match[j0]!==0);
      do{const previous=way[j0];match[j0]=match[previous];j0=previous;}while(j0!==0);
    }
    const assigned=Array(n);
    for(let j=1;j<=n;j++)assigned[match[j]-1]=j-1;
    const changes=staff.map(function(p,i){
      return {id:p.id,name:p.name,from:slots[i],to:slots[assigned[i]],
        before:score(p,roleMap[slots[i].toLowerCase()]),after:score(p,roleMap[slots[assigned[i]].toLowerCase()])};
    }).filter(function(x){return x.from!==x.to;});
    const before=staff.reduce(function(total,p,i){return total+num(score(p,roleMap[slots[i].toLowerCase()]));},0);
    const after=staff.reduce(function(total,p,i){return total+num(score(p,roleMap[slots[assigned[i]].toLowerCase()]));},0);
    return {changes:changes,delta:(after-before)/n,reason:"Revenue-role weighted fit when HR values exist; 5-point switching penalty; position counts preserved. Not a revenue forecast"};
  }
  function radarPanelV3(c){
    const p=c.profile||{},model=riskRadarV3(c);
    return '<section class="tch-panel"><div class="tch-sectionhead"><h2>Director radar</h2><span class="tch-mini">Reports & risks</span></div>'+
      '<div class="tch-radar">'+[["Popularity","popularity"],["Efficiency","efficiency"],["Environment","environment"]].map(function(x){
        const v=p[x[1]];return '<div><small>'+x[0]+'</small><strong>'+esc(v==null?"Unknown":v+"%")+'</strong></div>';
      }).join("")+'</div>'+
      model.alerts.map(function(x){return '<button class="tch-insight" data-act="goto" data-target="'+esc(x.target)+'">'+
        '<strong>'+esc(x.title)+'</strong><small>'+esc(x.detail)+'</small><span>↗</span></button>';}).join("")+'</section>';
  }
  function balancedPanelV3(c){
    const plan=balancedAssignmentV3(c);
    return '<section class="tch-panel"><h2>Balanced team optimiser</h2>'+
      '<p>Star-growth weighted matching of employees to current position slots: HR-revealed revenue contributors get limited extra priority; critical role counts are preserved and switching is penalised.</p>'+
      '<div class="tch-comparison"><div><span>Average role-fit gain</span><strong>'+(plan.delta>=0?"+":"")+plan.delta.toFixed(1)+' pp</strong></div>'+
      '<div><span>Proposed role moves</span><strong>'+plan.changes.length+'</strong></div></div>'+
      plan.changes.map(function(x){return '<div class="tch-change"><strong>'+esc(x.name)+'</strong><span>'+esc(x.from)+' → '+esc(x.to)+'</span>'+
        '<b>'+fitText(x.before)+' → '+fitText(x.after)+'</b></div>';}).join("")+
      (plan.changes.length?'<button class="primary" data-act="apply-balanced">Try plan in simulator</button>':'<p>No useful swaps found with the available data.</p>')+
      '<p class="tch-hint">'+esc(plan.reason)+'. Role-fit is not Torn effectiveness or projected income. Changes are saved locally only.</p></section>';
  }
  function applicantPanelV3(c){
    const apps=Array.isArray(c.applications)?c.applications:[];
    return '<section class="tch-panel"><h2>Applications ('+apps.length+')</h2>'+
      '<p>Applicant stats and their best requirement-fit role, read only during manual refresh.</p>'+
      (c.applicationsError?'<p class="tch-hint">Applications unavailable for the current API key.</p>':'')+
      (apps.length?apps.map(function(a){
        const p=a.player||{},roles=roleList(c).map(function(role){return {name:role.name,fit:score(p,role)};})
          .filter(function(r){return r.fit!==null;}).sort(function(x,y){return y.fit-x.fit;});
        return '<div class="tch-record"><div><strong>'+esc(p.name||"Applicant")+'</strong>'+
          '<small>Best fit: '+(roles[0]?esc(roles[0].name)+" · "+fitText(roles[0].fit):"Unknown")+'</small></div></div>';
      }).join(""):'<p class="tch-hint">No applications available.</p>')+'</section>';
  }
  function trainPacePanelV3(c){
    const p=trainPlanV3(c);
    return '<section class="tch-panel"><h2>Train capacity & allocation</h2><div class="tch-metrics">'+
      metricV2("In storage",p.available===null?"Unknown":p.available,"Reported by Torn","","training-queue")+
      metricV2("Base trains / close",p.base===null?"Unknown":p.base,"Trainer bonuses excluded","","training-queue")+
      metricV2("Overflow risk",p.overflow===null?"Unknown":p.overflow,"Minimum loss if unused","","training-queue")+
      metricV2("Paid trains to give",p.allocate,"Oldest eligible first","","training-queue")+'</div>'+
      p.queue.map(function(x){return '<div class="tch-record"><div><strong>'+esc(x.name)+'</strong>'+
        '<small>Owed '+x.owed+'</small></div><b>'+(x.give>0?'Give up to '+x.give:p.available===null?'Availability unverified':'Waiting for trains')+'</b></div>';}).join("")+
      (p.queue.length&&p.allocate===0?'<p class="tch-hint">Paid trains are still owed, but none can be assigned from the currently reported bank. Alerts will appear when trains become available.</p>':'')+
      '<p class="tch-hint">72-hour hire eligibility, oldest confirmed debt first, 20-train storage cap. Actual trainer bonuses can increase overflow.</p></section>';
  }
  function stockV3(c){
    if(!c||!c.profile)return introV2();
    if(['service','no-products'].includes(stockModeV117(c)))return serviceOperationsV117(c);
    const health=riskRadarV3(c),products=health.stock,days=[2,3,5,7].includes(c.stockDays)?c.stockDays:3;
    return '<section class="tch-panel"><h2>Stock & replenishment</h2><p>Manual-refresh sales, price comparisons and simple stock cover. No Torn orders are placed.</p>'+
      '<div class="tch-actionrow">'+[2,3,5,7].map(function(n){return '<button data-act="stock-days" data-days="'+n+
        '" class="'+(days===n?"primary":"")+'">'+n+' days</button>';}).join("")+'</div>'+
      (c.stockFetchError?'<p class="notice warn">Stock read failed. The saved stock may be out of date.</p>':'')+
      '<div class="tch-metrics">'+metricV2("Products",products.length,"From latest read","","stock")+
      metricV2("Under 1 day",products.filter(function(x){return x.days!==null&&x.days<1;}).length,"Priority stock-outs","","stock")+
      metricV2("Order cost",products.every(function(x){return x.cost!==null;})?money(products.reduce(function(t,p){return t+p.cost;},0)):"Incomplete","Provisional cost of proposed units","","stock")+
      metricV2("Vault",health.funds===null?"Unknown":money(health.funds),"Company funds","","growth-accounts")+'</div></section>'+
      '<section class="tch-panel"><h2>Product priorities</h2>'+
      (products.length?products.map(function(p){
        const pct=p.rrp!=null&&num(p.rrp)>0?((num(p.price)/num(p.rrp)-1)*100).toFixed(1)+"% vs RRP":"Unknown RRP";
        return '<div class="tch-stockrow"><div class="tch-sectionhead"><strong>'+esc(p.name)+'</strong>'+
          '<span class="tch-mini">'+(p.days===null?"Unknown cover":p.days.toFixed(1)+" days cover")+'</span></div>'+
          '<p>On hand '+esc(p.hand===null?"?":p.hand)+' · On order '+esc(p.incoming===null?"?":p.incoming)+
          ' · Sold/day '+esc(p.rate===null?"?":p.rate.toFixed(1))+'</p>'+
          '<p>Price '+esc(money(p.price))+' · '+esc(pct)+' · '+(p.samples>=2?p.samples+" observed days":"provisional one-day rate")+'</p>'+
          '<strong>Order '+esc(p.qty===null?"Unknown":p.qty)+' units · '+esc(p.cost===null?"Unknown":money(p.cost))+'</strong></div>';
      }).join(""):'<p>'+(c.stockFetchError?'Stock request failed; saved data may be stale.':'No product lines reported in the latest stock response.')+'</p>')+
      '<p class="tch-hint">Suggestions subtract existing orders and assume recent sales repeat. No delivery, storage, demand or cash-flow guarantees.</p></section>';
  }
  function cashPanelV3(c){
    const h=riskRadarV3(c);
    return '<section class="tch-panel"><h2>Cash runway</h2><div class="tch-metrics">'+
      metricV2("Cash available",h.funds===null?"Unknown":money(h.funds),"Reported company funds","","growth-accounts")+
      metricV2("Fixed daily costs",h.fixed===null?"Unknown":money(h.fixed),"Wages and advertising","","growth-accounts")+
      metricV2("7-day reserve",h.fixed===null?"Unknown":money(h.fixed*7),"Before stock and other costs","","growth-accounts")+
      metricV2("Days covered",h.runway===null?"Unknown":h.runway.toFixed(1),"Vault / known fixed costs","","growth-accounts")+
      '</div><p class="tch-hint">A conservative fixed-cost check, not a profit or vault forecast.</p></section>';
  }

  // v1.1 star-first decisions use observed public company figures. No star-date prediction.
  function peerModelV11(c){
    const raw=c&&c.peers&&Array.isArray(c.peers.rows)?c.peers.rows:[];
    const own=c&&c.profile||{},seen=new Set();
    const rows=raw.filter(function(p){
      if(!p||!Number.isSafeInteger(Number(p.id))||seen.has(String(p.id)))return false;
      seen.add(String(p.id));
      return Number(p.id)!==Number(own.id)&&p.income&&financialAmount(p.income.weekly)!==null;
    }).map(function(p){return {id:Number(p.id),name:String(p.name||"Company"),rating:Number(p.rating)||0,
      weekly:financialAmount(p.income.weekly),customers:p.customers&&financialAmount(p.customers.weekly),
      hired:p.employees&&financialAmount(p.employees.hired),capacity:p.employees&&financialAmount(p.employees.capacity),
      age:financialAmount(p.days_old)};}).sort(function(a,b){return b.weekly-a.weekly;});
    const rating=Number(own.rating)||0,target=Math.min(10,rating+1);
    const neighbours=rows.filter(function(p){return p.rating===target;});
    const ownWeekly=financialAmount(own.income&&own.income.weekly);
    const median=function(a){if(!a.length)return null;const sorted=a.slice().sort(function(x,y){return x-y;});const mid=Math.floor(sorted.length/2);return sorted.length%2?sorted[mid]:(sorted[mid-1]+sorted[mid])/2;};
    const benchmark=median(neighbours.map(function(p){return p.weekly;}));
    const full=!!(c.peers&&c.peers.complete);
    const next=neighbours.length?neighbours[0]:null;
    const gap=benchmark!==null&&ownWeekly!==null?Math.max(0,benchmark-ownWeekly):null;
    return {rows:rows,target:target,neighbours:neighbours,benchmark:benchmark,
      gap:gap,next:next,ownWeekly:ownWeekly,total:c.peers&&c.peers.total,full:full,
      observedAt:c.peers&&c.peers.observedAt,scanned:c.peers&&c.peers.scanned};
  }
  function starGrowthV11(c){
    const p=c.profile||{},peers=peerModelV11(c),issues=[];
    function add(importance,title,note,link){issues.push({importance:importance,title:title,note:note,link:link});}
    if(p.efficiency!=null&&Number(p.efficiency)<100)
      add(0,"Improve daily efficiency","Currently "+p.efficiency+"%. Review role assignments, employee effectiveness, inactivity and addiction.","staff-sim");
    if(p.environment!=null&&Number(p.environment)<100)
      add(1,"Improve environment","Currently "+p.environment+"%. Check staff room, Cleaner/Manager effectiveness and inactivity.","staff");
    if(p.popularity!=null&&Number(p.popularity)<100)
      add(2,"Grow weekly customer income","Popularity "+p.popularity+"% (relative to your type's leader). Review membership price and ads through measured changes.","growth-pricing");
    if(peers.benchmark!==null&&peers.gap>0)
      add(3,"Close the next-star revenue gap","Median of "+peers.neighbours.length+" scanned "+peers.target+"★ peers: "+
        money(peers.benchmark)+"/week; your observed shortfall "+money(peers.gap)+"/week. This is not a promotion threshold.","growth-rivals");
    if(!peers.observedAt)
      add(3,"Scan "+String(p.type?.name||"company")+" rivals","Compare the same company type and the next star tier using Torn's public weekly income figures.","growth-rivals");
    const hired=financialAmount(p.employees&&p.employees.hired),capacity=financialAmount(p.employees&&p.employees.capacity);
    if(hired!==null&&capacity!==null&&hired<capacity)
      add(4,"Review "+(capacity-hired)+" available employee slot(s)","Recruit for genuine growth needs; leave supporting roles covered.","staff");
    if(!issues.length)add(5,"Track Sunday star results","No simple issue detected. Collect more comparable daily and weekly reports; ranking remains competitive.","growth-performance");
    return {issues:issues.sort(function(a,b){return a.importance-b.importance;}),peers:peers};
  }
  function starGrowthPanelV11(c){
    const growth=starGrowthV11(c),p=c.profile||{};
    return '<section class="tch-panel tch-starplan"><div class="tch-sectionhead"><h2>Star-growth priorities</h2><span class="tch-mini">Goal: 10 ★</span></div>'+
      '<p>Ranked for growth: efficiency, environment, popularity, then comparable weekly income. Wages are a retention/cost decision, not a star-up lever.</p>'+
      growth.issues.map(function(x,i){return '<button data-act="goto" data-target="'+esc(x.link)+'" class="tch-insight">'+
        '<strong>'+esc((i+1)+". "+x.title)+'</strong><small>'+esc(x.note)+'</small><span>↗</span></button>';}).join("")+
      '<p class="tch-hint">Torn evaluates company results around 18:00 TCT and changes stars on Sundays. This cannot predict a guaranteed promotion date.</p></section>';
  }
  function rivalsPanelV11(c){
    const m=peerModelV11(c),refresh=m.observedAt?new Date(m.observedAt).toLocaleString():"Never";
    const limit=5,leaders=m.rows.filter(function(x){return x.rating>=m.target;}).slice(0,limit);
    const same=m.rows.filter(function(x){return x.rating===Number(c.profile.rating)}).slice(0,limit);
    return '<section class="tch-panel"><div class="tch-sectionhead"><h2>Rivals · '+esc(c.profile.type&&c.profile.type.name||"Company")+'</h2>'+
      '<span class="tch-mini">'+m.rows.length+' rivals</span></div>'+
      '<p>Public weekly gross income comparisons, never wages or net profit. Every scan is manual and limited to five API pages.</p>'+
      '<button class="primary" data-act="scan-peers" '+(busy?'disabled':'')+'>Scan public competitors</button>'+
      '<p class="tch-hint">Last scan '+esc(refresh)+' · '+esc(m.full?"Complete API directory sample":"Partial directory sample")+
      ' · '+esc(m.scanned||0)+' fetched · '+(m.total===null||m.total===undefined?"Total unknown":esc(m.total)+" companies reported")+'</p>'+
      '<div class="tch-metrics">'+
        metricV2('Your weekly income',money(m.ownWeekly),'Torn-reported','','growth-rivals')+
        metricV2('Next-star peer median',m.benchmark===null?'Unknown':money(m.benchmark),m.neighbours.length+' observed '+m.target+'★ companies','','growth-rivals')+
        metricV2('Gap to peer median',m.gap===null?'Unknown':money(m.gap),'Not a promotion threshold','','growth-rivals')+
        metricV2('Observed next-star peers',m.neighbours.length,'Sample size, not a ranking','','growth-rivals')+
      '</div></section>'+
      '<section class="tch-panel"><h2>Leaders at or above '+m.target+'★</h2>'+
      (leaders.length?leaders.map(function(p){return rivalRowV11(p,m.ownWeekly);}).join(""):'<p class="tch-hint">No comparable rivals loaded. Tap Scan public competitors.</p>')+
      '<h2>Your star tier · examples</h2>'+
      (same.length?same.map(function(p){return rivalRowV11(p,m.ownWeekly);}).join(""):'<p>No same-star companies in the current sample.</p>')+
      '<p class="tch-hint">Income ratios are observational. A larger sample is needed before claiming any league position. Company data refreshes on Torn own schedule.</p></section>';
  }
  function rivalRowV11(p,own){
    const delta=own!==null&&own>0?((p.weekly/own-1)*100):null;
    return '<div class="tch-record"><div><strong>'+esc(p.rating)+'★ '+esc(p.name)+'</strong>'+
      '<small>'+esc(p.hired===null?'?':p.hired)+' staff · '+(delta===null?'Income comparison unknown':(delta>=0?'+':'')+delta.toFixed(1)+'% vs you')+
      '</small></div><b>'+esc(money(p.weekly))+'/wk</b></div>';
  }
  function wageModelV11(c){
    const share=[10,15,20,25,30,35,40,50].includes(c.wageShare)?c.wageShare:25;
    const staff=c.staff||[],rows=staff.map(function(p){
      const value=financialAmount(p.value),wage=financialAmount(p.wage),
        effectiveness=p.effectiveness&&Number.isFinite(Number(p.effectiveness.total))?Number(p.effectiveness.total):null;
      const ratio=value!==null&&value>0&&wage!==null?wage/value:null;
      const target=value!==null&&value>0?Math.min(25000000,Math.round(value*share/100/1000)*1000):null;
      const gap=target!==null&&wage!==null?target-wage:null;
      return {id:p.id,name:p.name,position:p.position&&p.position.name||'Unknown',value:value,wage:wage,
        effectiveness:effectiveness,ratio:ratio,target:target,gap:gap,indirect:value===0,
        salaryPerEff:effectiveness!==null&&effectiveness>0&&wage!==null?wage/effectiveness:null};
    });
    const known=rows.filter(function(x){return x.value!==null;});
    const direct=rows.filter(function(x){return x.value>0&&x.wage!==null;});
    const gross=direct.reduce(function(t,x){return t+x.value;},0),salaries=direct.reduce(function(t,x){return t+x.wage;},0);
    return {share:share,rows:rows,visible:known.length,direct:direct.length,gross:gross,salaries:salaries,
      sumTarget:direct.reduce(function(t,x){return t+x.target;},0)};
  }
  function wagesPanelV11(c){
    const w=wageModelV11(c);
    return '<section class="tch-panel"><h2>HR-informed wage helper</h2>'+
      '<p>Uses each employee Torn-reported <strong>Value</strong> (direct contribution, revealed by an effective Secretary/HR Officer) plus their wage and effectiveness. It does <strong>not</strong> treat supporting roles as worthless.</p>'+
      '<div class="tch-actionrow">'+[10,15,20,25,30,35,40,50].map(function(n){
        return '<button data-act="wage-share" data-share="'+n+'" class="'+(w.share===n?'primary':'')+'">'+n+'%</button>';}).join("")+'</div>'+
      '<p class="tch-hint">Scenario: target wage '+w.share+'% of reported direct value, rounded to nearest $1,000. This is a budget scenario, NOT a proven market salary. Adjust for retention, special duties and competition.</p>'+
      '<div class="tch-metrics">'+
      metricV2('Value revealed',w.visible+' / '+w.rows.length,'Secretary data availability','','staff-wages')+
      metricV2('Direct value',money(w.gross),w.direct+' measurable contributors','','staff-wages')+
      metricV2('Current direct wages',money(w.salaries),'Only measurable contributors','','staff-wages')+
      metricV2('Scenario direct wages',money(w.sumTarget),'Excludes indirect support roles','','staff-wages')+
      '</div>'+
      (w.visible===0?'<div class="notice warn">No HR-revealed values in the current API data. Assign an effective HR Officer/Secretary and refresh. Wage recommendations are deliberately withheld.</div>':'')+
      '</section><section class="tch-panel"><h2>Employee wage review</h2>'+
      w.rows.slice().sort(function(a,b){return (b.ratio===null?-1:b.ratio)-(a.ratio===null?-1:b.ratio);}).map(function(x){
        return '<article class="tch-wagerow"><div class="tch-sectionhead"><strong>'+esc(x.name)+'</strong><span class="tch-mini">'+
          esc(x.position)+'</span></div><div class="tch-wagegrid">'+
          '<span>HR value <b>'+esc(x.value===null?'Not revealed':money(x.value))+'</b></span>'+
          '<span>Current wage <b>'+esc(money(x.wage))+'</b></span>'+
          '<span>Wage / value <b>'+esc(x.ratio===null?'N/A':(x.ratio*100).toFixed(1)+'%')+'</b></span>'+
          '<span>Torn EFF <b>'+esc(x.effectiveness===null?'Unknown':x.effectiveness)+'</b></span></div>'+
          (x.target!==null?'<div class="tch-wage-target"><span>Budget scenario <b>'+esc(money(x.target))+'/day</b></span><span>'+
            esc(x.gap===null?'Unknown':((x.gap>=0?'+':'')+money(x.gap)))+' vs now</span></div>':
            '<p class="tch-hint">'+esc(x.indirect?'Indirect support role: value may be zero although the employee improves company income elsewhere. No wage target.':
              'Value unavailable: no salary target inferred.')+'</p>')+
        '</article>';
      }).join("")+
      '<p class="tch-hint">The secretary own effectiveness can affect the reliability of these values. Zero and null are distinct. A higher wage does not directly affect a company star-up.</p></section>';
  }
  function trainingWeekV11(c){
    const p=trainPlanV3(c),base=p.base,starting=p.available,now=Date.now();
    const eligibleNow=p.queue.filter(function(x){return x.give>0;});
    const committed=eligibleNow.reduce(function(t,x){return t+x.owed;},0);
    if(base===null||starting===null)return {days:[],base:null,reason:'No current train-stock data'};
    const rows=[],sumOwed=p.queue.reduce(function(t,x){return t+x.owed;},0);
    let balance=starting,remaining=sumOwed;
    for(let i=0;i<7;i++){
      // Daily award with no future manual actions is a cap-only forecast;
      // an alternate scenario spends oldest currently eligible obligations first.
      const take=Math.min(balance,remaining);
      balance-=take;remaining-=take;
      const lost=Math.max(0,balance+base-20);
      balance=Math.min(20,balance+base);
      rows.push({day:i+1,given:take,remaining:remaining,stored:balance,minimumLost:lost});
    }
    return {days:rows,base:base,starting:starting,committed:committed};
  }
  function weekPanelV11(c){
    const f=trainingWeekV11(c);
    if(!f.days.length)return '<section class="tch-panel"><h2>Seven-day training plan</h2><p>Refresh company trains to calculate a simple scenario.</p></section>';
    return '<section class="tch-panel"><h2>Seven-day training forecast</h2>'+
      '<p>Illustration if you use existing trains on <strong>currently eligible</strong> paid commitments each day, then generate the baseline '+f.base+'★ trains at each company close.</p>'+
      '<div class="tch-weekgrid"><span>Day</span><span>Give</span><span>Bank</span><span>Overflow</span>'+
      f.days.map(function(d){return '<span>'+d.day+'</span><b>'+d.given+'</b><b>'+d.stored+'</b><b class="'+(d.minimumLost?'bad':'')+'">'+d.minimumLost+'</b>';}).join("")+'</div>'+
      '<p class="tch-hint">Assumes no star changes, new purchases, new hires or other training; excludes trainer extra trains. It is not an automatic schedule or confirmed future event.</p></section>';
  }
  function launcherAlertsV11(c){
    if(!c||!c.profile)return {items:[],count:0};
    const items=[],p=trainPlanV3(c);
    // Only giveable, 72-hour-eligible paid commitments count as a training alert.
    // Purchased-but-waiting obligations stay in the ledger, without a badge.
    const ready=p.queue.filter(function(x){return x.give>0;});
    const shortage=stockAdviceV3(c).filter(x=>x.qty!==null&&x.qty>0&&x.days!==null&&x.days<1).slice(0,3);
    if(shortage.length)items.push({id:"stock-shortage",target:"stock",glyph:"!",text:shortage.length+" stock line(s) under one day of cover"});
    // Notify only when an eligible paid obligation can be fulfilled now.
    // Training bank capacity is independent of paid purchases; paid alerts still need allocatable trains.
    if(p.overflow>0)items.push({id:"training-overflow",target:"training-queue",glyph:"⚡",text:"Available trains may overflow at next close"});
    if(p.allocate>0&&ready.length)items.push({id:"training-owed",target:"training-queue",glyph:"◇",
      text:p.allocate+" paid train(s) ready for "+ready.length+" eligible employee(s)"});
    if(companyProfitTrendV191(c).streak)items.push({id:'cashflow-loss-streak',target:'growth-accounts',glyph:'!',text:'Operating losses on three observed days'});
    // Use only complete observations from consecutive UTC dates, not repeated reads on one day.
    const delta=companyDeltaV111(c);
    if(delta.known&&delta.consecutive){
      const profit=delta.metrics.find(x=>x.key==='profit'),efficiency=delta.metrics.find(x=>x.key==='efficiency');
      if(profit&&Number.isFinite(profit.delta)&&profit.delta<0){
        const prior=Number(profit.before)||0;
        if(-profit.delta>=Math.max(25000,Math.abs(prior)*0.10))
          items.push({id:'observed-profit-drop',target:'growth-accounts',glyph:'!',
            text:'Estimated daily operating result dropped '+money(-profit.delta)+' versus previous observed day'});
      }
      if(efficiency&&Number.isFinite(efficiency.delta)&&efficiency.delta<=-5)
        items.push({id:'observed-efficiency-drop',target:'staff',glyph:'!',
          text:'Reported efficiency fell '+Math.abs(efficiency.delta).toFixed(1)+' points versus previous observed day'});
    }
    const pending=pendingPaymentLogs(c).length;
    if(pending)items.push({id:"pending-payments",target:"training-payments",glyph:"!",text:pending+" money transfer(s) await approval"});
    const a=accounting(c);
    if(a&&a.known&&a.headroom<0)items.push({id:"loss-guardrail",target:"growth-accounts",glyph:"!",text:"Daily operating-loss guardrail exceeded"});
    if(c.lastRefresh&&Number.isFinite(Date.parse(c.lastRefresh))&&Date.now()-Date.parse(c.lastRefresh)>86400000)
      items.push({id:"stale-data",target:"refresh",glyph:"↻",text:"Saved company data over 24 hours old"});
    return {items:items,count:items.length};
  }
  function companyHubActions(c){
    if(!c||!c.profile)return [{id:'refresh-company',title:'Connect Company Helper and refresh',detail:'Open your company to load the current staffing and financial data.',status:'now',priority:80}];
    const actions=[],seen=new Set(),fresh=Number.isFinite(Date.parse(c.lastRefresh||''))&&Date.now()-Date.parse(c.lastRefresh)<24*3600000;
    function add(x){if(!seen.has(x.id)){seen.add(x.id);actions.push(x);}}
    const p=trainPlanV3(c);
    if(!fresh)add({id:'stale-data',title:'Refresh company before making changes',detail:'Saved figures are over 24 hours old or unverified.',status:'now',priority:95});
    for(const a of launcherAlertsV11(c).items){
      if(a.id==='stale-data')continue;
      add({id:a.id,title:a.text,detail:a.target==='training-queue'?'Open training queue to review eligible employees and capacity.':'Review current figures and make changes manually.',
        status:a.id==='loss-guardrail'||a.id==='training-overflow'?'urgent':'now',
        priority:a.id==='loss-guardrail'?100:a.id==='training-overflow'?95:a.id==='stock-shortage'?90:70});
    }
    const trend=companyProfitTrendV191(c);
    if(trend.streak)add({id:'cashflow-loss-streak',title:'Review three observed loss days',detail:'Separate company operating estimates from actual cash received; review payroll, pricing and advertising.',status:'soon',priority:88});
    const first=p.queue.find(x=>x.give>0);
    if(first&&fresh)add({id:'decision-training-queue',title:'Assign '+first.give+' of '+first.owed+' owed trains to '+first.name,
      detail:'Oldest eligible purchased commitment; apply the train in Torn, then reconcile it.',status:'now',priority:85});
    for(const a of companyActionList(c).slice(0,4)){
      if(a.target==='refresh'&&!fresh)continue;
      add({id:'decision-'+a.target,title:a.title,detail:a.why,status:a.level==='urgent'?'urgent':a.level==='next'?'soon':'review',priority:a.level==='urgent'?92:a.level==='next'?50:65});
    }
    return actions.slice(0,10);
  }
  function updateLauncherV11(){
    const c=companyId&&data.byCompany&&data.byCompany[companyId];
    let status={items:[],count:0};
    try{status=launcherAlertsV11(c);}catch(e){/* Alerts must never block the launcher. */}
    const n=status.count;
    try{document.dispatchEvent?.(new CustomEvent('staxx:actions',{detail:{id:'company',items:companyHubActions(c).map(a=>({
      ...a,reviewMinutes:/training|train|refresh/.test(a.id)?2:/wage|role|staff/.test(a.id)?4:3
    })),updated:c?.lastRefresh&&Number.isFinite(Date.parse(c.lastRefresh))?Date.parse(c.lastRefresh):Date.now()}}));}
    catch(err){console.warn('[Company Helper] Action summary unavailable:',String(err?.message||err));}
    opener.innerHTML='<span>Company Helper</span>'+(n?'<span class="tch-launcherbadge" aria-hidden="true">'+
      esc(status.items[0].glyph)+' '+Math.min(n,9)+(n>9?'+':'')+'</span>':'');
    opener.title=n?status.items.map(function(x){return x.text;}).join(' · '):'Company Helper · no saved alerts';
    opener.setAttribute&&opener.setAttribute('aria-label',opener.title);
    document.dispatchEvent?.(new CustomEvent('staxx:notice',{detail:{id:'company',count:status.count,level:status.items.some(x=>/guardrail exceeded|overflow/i.test(x.text))?'urgent':status.count?'warning':'info',summary:status.count+' company items needing attention',items:status.items.slice(0,4).map(x=>x.text),alerts:status.items.map(x=>({id:x.id,title:x.text,detail:x.target==="refresh"?"Refresh company data":"Open the matching company decision and review"}))}}));
    if(c&&c.profile){
      const at=Date.parse(c.lastRefresh||'');
      const rating=Number(c.profile.rating),id=String(companyId||'');
      if(Number.isFinite(at)&&at<=Date.now()+60000&&Date.now()-at<24*3600000&&Number.isInteger(rating)&&rating>=0&&rating<=10&&id){
        const key='staxx-company-stars-v31-'+id;
        try{
          const prev=JSON.parse(localStorage.getItem(key)||'null');
          if(!prev||prev.rating!==rating){
            document.dispatchEvent?.(new CustomEvent('staxx:activity',{detail:{id:'company',events:[{
              id:'rating-'+id.replace(/[^a-z0-9_-]/gi,'').slice(0,30)+'-'+rating+'-'+Math.floor(at/86400000),
              at,source:'snapshot',section:'growth',title:prev&&Number.isInteger(prev.rating)?'Company rating changed: '+prev.rating+' → '+rating+' stars':'Company rating observed: '+rating+' stars',
              detail:'Observed Torn company profile rating · not a forecast'
            }]}}));
            localStorage.setItem(key,JSON.stringify({rating,at}));
          }
        }catch(_){}
      }
      const a=accounting(c);
      document.dispatchEvent?.(new CustomEvent('staxx:summary',{detail:{id:'company',headline:String(c.profile.name||'Company')+' · '+String(c.profile.rating??'?')+' stars',metrics:[
        {label:'Star rating',value:String(c.profile.rating??'?')+' / 10'},
        {label:'Staff',value:String((c.staff||[]).length)},
        {label:'Daily P/L estimate',value:a&&a.known?money(a.profit):'Unverified'}
      ],updated:c.lastRefresh&&Number.isFinite(Date.parse(c.lastRefresh))?Date.parse(c.lastRefresh):Date.now()}}));}
  }

  function employeePenaltyV12(p) {
    const e=p&&p.effectiveness||{},n=Number(e.addiction),i=Number(e.inactivity),settled=Number(e.settled_in);
    return {addiction:Number.isFinite(n)?n:null,inactivity:Number.isFinite(i)?i:null,
      settled:Number.isFinite(settled)?settled:null,days:financialAmount(p.days_in_company)};
  }
  function wageRiskModelV12(c) {
    const base=wageModelV11(c),rows=base.rows.map(function(row){
      const p=(c.staff||[]).find(function(x){return String(x.id)===String(row.id);})||{};
      const pen=employeePenaltyV12(p),notes=[];
      if(pen.days!==null && pen.days>=90)notes.push("Long-tenure retention factor: review before reducing pay");
      if(pen.days!==null && pen.days<10)notes.push("Still settling in: effectiveness may rise");
      if(pen.addiction!==null && pen.addiction<=-5)notes.push("Addiction penalty "+pen.addiction+" EFF: discuss recovery before relying on value estimates");
      if(pen.inactivity!==null && pen.inactivity<=-5)notes.push("Inactivity penalty "+pen.inactivity+" EFF: check recent activity");
      if(row.value===0)notes.push("Indirect contribution: avoid wage cuts based on zero direct value");
      if(row.value===null)notes.push("HR value missing: cannot calculate a contribution-based pay band");
      const unit=row.value!==null&&row.value>0&&row.target!==null?row.target:null;
      const tenure=pen.days!==null&&pen.days>=90?1.1:1;
      const lo=unit===null?null:Math.max(0,Math.round(unit*.85/1000)*1000);
      const hi=unit===null?null:Math.min(25000000,Math.round(unit*1.15*tenure/1000)*1000);
      const label=lo===null||row.wage===null?"Insufficient value data":
        row.wage<lo?"Below planning band":row.wage>hi?"Above planning band":"Within planning band";
      return Object.assign({},row,{pen:pen,notes:notes,lo:lo,hi:hi,label:label});
    });
    return {rows:rows,share:base.share,atRisk:rows.filter(function(x){return x.pen.addiction!==null&&x.pen.addiction<=-5||x.pen.inactivity!==null&&x.pen.inactivity<=-5;}).length};
  }
  function wageRiskPanelV12(c) {
    const m=wageRiskModelV12(c);
    return '<section class="tch-panel"><h2>Retention, addiction & wage bands</h2>'+
      '<p>Indicative band: 85-115% of the selected value-share budget, with a 10% upper retention allowance after 90 days. This is a planning assumption, not an official Torn wage formula.</p>'+
      '<div class="tch-metrics">'+metricV2("Effectiveness concerns",m.atRisk,"Significant addiction / inactivity penalties","","staff-wages")+
      metricV2("Missing HR values",m.rows.filter(function(x){return x.value===null;}).length,"Salary band deliberately withheld","","staff-wages")+'</div>'+
      m.rows.map(function(x){return '<div class="tch-wage-risk"><div class="tch-sectionhead"><strong>'+esc(x.name)+'</strong>'+
        '<span class="tch-mini">'+esc(x.label)+'</span></div>'+
        '<p>Planning range: '+(x.lo===null?"Unavailable":money(x.lo)+" - "+money(x.hi))+
        ' / day · Tenure '+esc(x.pen.days===null?"Unknown":x.pen.days+" days")+'</p>'+
        (x.notes.length?'<small>'+x.notes.map(esc).join(" · ")+'</small>':"")+
        '</div>';}).join("")+
      '<p class="tch-hint">Retain special-role staffing even when its direct value is low. Never infer that wages increase star rating; all suggestions require judgement.</p></section>';
  }
  function candidateStatsV12(a) {
    const p=a&&a.player||{};
    const stats=p.stats||a.stats||{};
    const readNum=function(k){return financialAmount(stats[k]!==undefined?stats[k]:p[k]);};
    const man=readNum("manual_labor"),intel=readNum("intelligence"),end=readNum("endurance");
    if(man===null||intel===null||end===null)return null;
    return {manual_labor:man,intelligence:intel,endurance:end};
  }
  function replacementsV12(c){
    const roles=roleList(c),staff=c.staff||[],apps=c.applications||[];
    const protectedNames=/manager|marketer|cleaner|human resources|secretary|trainer/i;
    const output=[];
    apps.forEach(function(a){
      const stats=candidateStatsV12(a);
      if(!stats)return;
      const person=a.player||{}, candidate={stats:stats};
      staff.forEach(function(p){
        const name=p.position&&p.position.name||"",role=roleByName(roles,name);
        if(!role||protectedNames.test(name))return;
        const before=score(p,role),after=score(candidate,role);
        if(before===null||after===null)return;
        const points=(after-before)*roleGrowthWeightV11(c,name);
        if(points<12)return;
        output.push({applicantId:person.id,name:String(person.name||"Applicant"),employeeId:p.id,
          current:p.name,role:name,before:before,after:after,points:points,
          days:financialAmount(p.days_in_company)});
      });
    });
    return output.sort(function(a,b){return b.points-a.points;}).slice(0,8);
  }
  function replacementPanelV12(c){
    const rows=replacementsV12(c);
    return '<section class="tch-panel"><div class="tch-sectionhead"><h2>Hiring impact simulator</h2><span class="tch-mini">'+rows.length+' comparisons</span></div>'+
      '<p>Compares applicants with the employee occupying the same revenue-facing role. Shows potential working-stat fit improvement, not future revenue. Special roles are deliberately excluded from replacement suggestions.</p>'+
      (rows.length?rows.map(function(r){return '<div class="tch-wage-risk"><strong>'+esc(r.name)+' for '+esc(r.role)+'</strong>'+
        '<p>Compare with '+esc(r.current)+': '+fitText(r.before)+' → '+fitText(r.after)+
        ' · Weighted improvement +'+r.points.toFixed(1)+' pp</p>'+
        '<small>Read-only comparison. Consider loyalty, absence, paid training commitments and retention before making staffing decisions.</small></div>';}).join(""):
        '<p class="tch-hint">No candidate clears the conservative +12-point fit threshold, or applicant working stats are unavailable.</p>')+
      '</section>';
  }
  function positionCountsV12(items){
    const map={};
    (items||[]).forEach(function(p){
      const name=typeof p==="string"?p:String(p&&p.position&&(typeof p.position==="string"?p.position:p.position.name)||"");
      if(name)map[name]=(map[name]||0)+1;
    });return map;
  }

  function rosterBenchV12(c){
    const teams=c.rivalTeams&&Array.isArray(c.rivalTeams.rows)?c.rivalTeams.rows:[];
    const current=positionCountsV12(c.staff),usable=teams.filter(function(x){return x&&x.counts&&Object.keys(x.counts).length>0&&x.total>0;});
    const roles=new Set(Object.keys(current));usable.forEach(function(x){Object.keys(x.counts).forEach(function(k){roles.add(k);});});
    const counts=Array.from(roles).sort().map(function(role){
      const vals=usable.map(function(t){return 100*Number(t.counts[role]||0)/Number(t.total);}).sort(function(a,b){return a-b;});
      const median=vals.length?vals[Math.floor(vals.length/2)]:null;
      const target=median===null?null:median*(c.staff||[]).length/100;
      const own=current[role]||0;
      return {role:role,own:own,share:median,expected:target,
        delta:target===null?null:target-own};
    });
    return {teams:usable,counts:counts,scannedAt:c.rivalTeams&&c.rivalTeams.observedAt,
      tier:usable.length?usable[0].rating:null};
  }
  function rivalRostersPanelV12(c){
    const m=rosterBenchV12(c),needs=m.counts.filter(function(r){return r.delta!==null&&Math.abs(r.delta)>=0.8;})
      .sort(function(a,b){return Math.abs(b.delta)-Math.abs(a.delta);}).slice(0,4);
    return '<section class="tch-panel"><h2>Peer staffing fit</h2>'+
      '<p>Compare your staff size with the role mix of high-income '+(m.tier===null?'same/next-star':m.tier+'★')+
      ' companies. Role counts are normalised to your '+(c.staff||[]).length+' staff, rather than blindly copying a ten-star company.</p>'+
      '<button data-act="scan-rival-rosters" '+(busy?"disabled":"")+'>Compare similar-star staffing</button>'+
      (needs.length?'<h3>Position gaps to investigate</h3>'+needs.map(function(r){
        return '<div class="tch-dense-row"><div><strong>'+esc(r.role)+'</strong><small>You: '+r.own+
          ' · scaled peer benchmark '+r.expected.toFixed(1)+'</small></div><div><b>'+
          (r.delta>=0?'+':'')+r.delta.toFixed(1)+'</b><small>potential difference</small></div></div>';
      }).join(""):
      '<p class="tch-hint">No material staffing gap in the sampled companies, or no public layouts loaded.</p>')+
      (m.teams.length?'<p class="tch-hint">Based on '+m.teams.length+' public peer rosters. Median role shares, not proof of more stars. Keep Managers, Cleaners and other support roles covered.</p>':
        '<p class="tch-hint">Run the public rival scan first. This comparison needs readable public employee positions.</p>')+
      '<details class="tch-advanced"><summary>View peer role mix</summary>'+
      m.counts.map(function(r){return '<div class="tch-record"><div>'+esc(r.role)+'</div><b>'+
        r.own+' vs '+(r.expected===null?'?':r.expected.toFixed(1))+'</b></div>';}).join("")+
      '</details></section>';
  }
  function valueOfMetricV12(p,k){
    const x=p&&p[k];const n=Number(x);
    return x===null||x===undefined||!Number.isFinite(n)?null:n;
  }
  function statsAtV12(p){
    return {rating:valueOfMetricV12(p,"rating"),efficiency:valueOfMetricV12(p,"efficiency"),
      environment:valueOfMetricV12(p,"environment"),popularity:valueOfMetricV12(p,"popularity"),
      weekly:valueOfMetricV12(p.income,"weekly")};
  }
  function changeImpactV12(c){
    return (c.changeNotes||[]).slice(-8).reverse().map(function(evt){
      const latest=statsAtV12(c.profile||{}),changes={};
      Object.keys(latest).forEach(function(k){
        changes[k]=latest[k]!==null&&evt.baseline&&evt.baseline[k]!==null&&evt.baseline[k]!==undefined?
          latest[k]-evt.baseline[k]:null;
      });
      const days=Math.max(0,(Date.now()-Date.parse(evt.observedAt))/86400000);
      return {evt:evt,changes:changes,days:days,hasLater:Date.parse(c.lastRefresh||"")>Date.parse(evt.observedAt)};
    });
  }
  function markChangeV12(c,label){
    if(!c||!c.profile)throw Error("Refresh the company before recording a change.");
    if(!["Positions changed","Employee hired/left","Wages changed","Advertising or prices changed","Other change"].includes(label))
      throw Error("Unsupported change label.");
    c.changeNotes=c.changeNotes||[];
    c.changeNotes.push({id:id(),observedAt:new Date().toISOString(),label:label,baseline:statsAtV12(c.profile)});
    c.changeNotes=c.changeNotes.slice(-40);
  }
  function changeTrackingPanelV12(c){
    const changes=changeImpactV12(c);
    return '<section class="tch-panel"><h2>Before & after company changes</h2>'+
      '<p>Record an action after you make it manually in Torn. Future manual refreshes then compare company performance with this baseline.</p>'+
      '<div class="tch-actionrow"><select id="tch-change-kind">'+
      ["Positions changed","Employee hired/left","Wages changed","Advertising or prices changed","Other change"].map(function(k){return '<option>'+esc(k)+'</option>';}).join("")+
      '</select><button class="primary" data-act="mark-change">Mark change now</button></div>'+
      (changes.length?changes.map(function(x){return '<div class="tch-wage-risk"><strong>'+esc(x.evt.label)+
        '</strong><small>Recorded '+esc(new Date(x.evt.observedAt).toLocaleDateString())+' · '+x.days.toFixed(1)+' days ago</small>'+
        (x.hasLater?'<p>Efficiency '+deltaV12(x.changes.efficiency,' pp')+
          ' · Environment '+deltaV12(x.changes.environment,' pp')+
          ' · Popularity '+deltaV12(x.changes.popularity,' pp')+
          ' · Weekly income '+deltaV12(x.changes.weekly,' dollars')+'</p>':
          '<p>Refresh after the next company report to measure observed changes.</p>')+
        '<small>Other changes and weekly rollover may contribute; not a causal attribution.</small></div>';}).join(""):
        '<p class="tch-hint">No marked changes yet. All records stay private in Torn PDA storage.</p>')+'</section>';
  }
  function deltaV12(n,unit){
    if(n===null||!Number.isFinite(n))return "Unknown";
    return (n>=0?"+":"")+n.toLocaleString("en-US")+unit;
  }
  function sundayReviewV12(c){
    const snapshots=(c.snapshots||[]).filter(function(s){return s&&s.observedAt&&s.rating!==null&&s.rating!==undefined;});
    const byDay={};snapshots.forEach(function(s){byDay[String(s.observedAt).slice(0,10)]=s;});
    const dates=Object.keys(byDay).sort();
    const week=dates.slice(-7).map(function(d){return byDay[d];}),sundays=dates.filter(function(d){return new Date(d+"T12:00:00Z").getUTCDay()===0;});
    const current=sundays.length?byDay[sundays[sundays.length-1]]:null;
    const prior=sundays.length>=2?byDay[sundays[sundays.length-2]]:null;
    const average=function(rows,k){const vals=rows.map(function(x){return valueOfMetricV12(x,k);}).filter(function(x){return x!==null;});return vals.length?vals.reduce(function(a,b){return a+b;},0)/vals.length:null;};
    const peers=Array.isArray(c.peerHistory)?c.peerHistory:[],now=peers[peers.length-1],before=peers.length>=2?peers[peers.length-2]:null;
    return {latest:current,previous:prior,days:week.length,averageEfficiency:average(week,"efficiency"),
      averageEnvironment:average(week,"environment"),averagePopularity:average(week,"popularity"),
      peerGap:now&&now.gap!=null?now.gap:null,previousPeerGap:before&&before.gap!=null?before.gap:null,
      peerComparability:!!(now&&before&&now.target===before.target&&now.competitors===before.competitors)};
  }
  function sundayPanelV12(c){
    const s=sundayReviewV12(c),rating=Number(c.profile.rating);
    return '<section class="tch-panel"><h2>Sunday star review</h2><p>Compare actual star ratings and observed performance. This is a retrospective report, not a predicted promotion date.</p>'+
      '<div class="tch-metrics">'+metricV2("Current stars",rating+"/10","Torn reported","","growth-review")+
        metricV2("Change since saved Sunday",s.latest&&s.previous?deltaV12(s.latest.rating-s.previous.rating," ★"):"Not enough Sundays",
          "Two Sunday snapshots required","","growth-review")+
        metricV2("Observed days",s.days,"Latest seven distinct dates","","growth-review")+
        metricV2("Weekly peer gap change",s.peerComparability&&s.peerGap!==null&&s.previousPeerGap!==null?
          deltaV12(s.peerGap-s.previousPeerGap," dollars"):"Insufficient comparable scans","Manual rival snapshots","","growth-rivals")+'</div>'+
      '<div class="tch-radar">'+[["Avg efficiency",s.averageEfficiency],["Avg environment",s.averageEnvironment],["Avg popularity",s.averagePopularity]].map(function(x){
        return '<div><small>'+x[0]+'</small><strong>'+esc(x[1]===null?"Unknown":x[1].toFixed(1)+"%")+'</strong></div>';
      }).join("")+'</div>'+
      (sundaysNeedV12(c)?'<p class="tch-hint">Save manual observations on two different Sundays to show week-over-week star changes.</p>':"")+
      '<p class="tch-hint">Only recorded daily snapshots count. Income comparisons use Torn reported rolling weekly values, not fabricated weekly settlements.</p></section>';
  }
  function sundaysNeedV12(c){const days=new Set((c.snapshots||[]).filter(function(s){return s&&s.observedAt&&new Date(String(s.observedAt).slice(0,10)+"T12:00:00Z").getUTCDay()===0;}).map(function(s){return String(s.observedAt).slice(0,10);}));return days.size<2;}

  // v1.3: explicit, reversible local receipt classification. Never makes a Torn action.
  function exactPaidTrainingV13(c,log) {
    const g=log&&log.suggestion;
    if(!log || !g || g.status!=="matched" || !Number.isSafeInteger(Number(g.playerId)) ||
       !Number.isSafeInteger(Number(g.amount)) || Number(g.amount)<=0)return null;
    const staff=(c.staff||[]).find(function(p){return String(p.id)===String(g.playerId);});
    if(!staff || !Number.isSafeInteger(Number(g.trains)) || Number(g.trains)!==priceTrains(Number(g.amount)))return null;
    if(/refund|gift|donation|repay|loan|borrow/i.test(String(log.title||"")))return null;
    return {playerId:Number(g.playerId),amount:Number(g.amount),trains:Number(g.trains)};
  }
  function autoCreditPurchasesV13(c,onlyNew) {
    const result={credited:0,trains:0,review:0};
    if(c.autoPackageMode===false)return result;
    (c.logs||[]).forEach(function(n){
      if(!n || (onlyNew && !onlyNew.has(String(n.id))) || n.matchStatus==="ignored" || isApprovedLog(c,n.id))return;
      const source="log:"+String(n.id);
      if((c.payments||[]).some(function(p){return p.sourceId===source && (p.voided || isApprovedLogPayment(p));}))return;
      if(!Number.isFinite(Number(c.autoCreditSince)) || Number(n.timestamp)<Number(c.autoCreditSince))return;
      const match=exactPaidTrainingV13(c,n);
      if(!match){result.review++;return;}
      const manualOverlap=(c.payments||[]).some(function(p){
        return !p.voided && !p.sourceId && p.source!=="log-auto" &&
          Number(p.playerId)===match.playerId && Number(p.amount)===match.amount &&
          Math.abs(Number(p.ts)-Number(n.timestamp))<=86400;
      });
      if(manualOverlap){n.matchStatus="review";n.matchReason="Possible duplicate of a manually recorded purchase on the same day.";result.review++;return;}
      c.payments.push({id:"log:package:"+String(n.id),playerId:match.playerId,
        amount:match.amount,trains:match.trains,ts:Number(n.timestamp),
        source:"log-package-auto",sourceId:source,confirmed:true,assumed:true,
        note:"Automatically inferred from exact package-price receipt; can be voided."});
      n.matchStatus="credited-auto";n.matchReason="Exact-size employee transfer credited as a likely training purchase (reversible).";
      result.credited++;result.trains+=match.trains;
    });
    return result;
  }

  function backfillTrainingReceiptsV13(c) {
    let added=0,skipped=0;
    (c.logs||[]).forEach(function(n){
      if(!n || n.matchStatus==="ignored" || isApprovedLog(c,n.id))return;
      const m=exactPaidTrainingV13(c,n),source="log:"+String(n.id);
      if(!m)return;
      if((c.payments||[]).some(function(p){
        return p.sourceId===source || (!p.voided&&Number(p.playerId)===m.playerId&&Number(p.amount)===m.amount&&
          Math.abs(Number(p.ts)-Number(n.timestamp))<=86400);
      })){skipped++;return;}
      c.payments.push({id:"log:backfill:"+n.id,playerId:m.playerId,
        amount:m.amount,trains:m.trains,ts:Number(n.timestamp),source:"log-package-backfill",
        sourceId:source,confirmed:true,assumed:true,
        note:"User-requested historical classification of exact-size employee transfer; reversible."});
      n.matchStatus="credited-backfill";
      added++;
    });
    return {credited:added,skipped:skipped};
  }
  function mergeTrainingNewsV13(c,response) {
    const list=normaliseNewsResponse(response&&response.news),seen=new Set((c.news||[]).map(function(n){return String(n.id);})),newlySeen=[];
    let added=0;
    list.forEach(function(n){
      if(seen.has(String(n.id)))return;
      seen.add(String(n.id));
      c.news.push({id:String(n.id),timestamp:Number(n.timestamp),text:String(n.text||"").slice(0,700)});
      newlySeen.push(n);added++;
    });
    repairImportDuplicates(c);
    const result=reconcileTraining(c);
    if(added>0){
      const verified=newlySeen.filter(n=>(c.training||[]).some(t=>!t.voided&&canonicalTrainingSource(t)==='news:'+String(n.id)))
        .slice(0,8);
      if(verified.length)document.dispatchEvent?.(new CustomEvent('staxx:activity',{detail:{id:'company',
        events:verified.map(n=>({id:'training-news-'+String(n.id).replace(/[^a-z0-9_.:-]/gi,'').slice(0,65),
          at:Number(n.timestamp)*1000,source:'api',section:'training',
          title:'Company training confirmed by Torn news',
          detail:'Official training-news record matched to a non-voided training entry'}))}}));
    }
    c.newsSyncAt=new Date().toISOString();
    return {added:added,matched:result.matched,review:result.review};
  }
  async function syncRecentNewsV13(c){
    const result=await read("company/news",{cat:"training",limit:"100",sort:"DESC"});
    const items=normaliseNewsResponse(result.news);
    if(!c.autoNewsHistoryInitializedV116){
      c.autoNewsHistoryInitializedV116=true;
      if(items.length>=100&&!c.newsNext&&!c.newsHistoryWarning){
        const decision=importPageDecision(result,"company/news","training",items);
        if(decision.warning)c.newsHistoryWarning=decision.warning;
        else c.newsNext=decision.next;
      }
      if(items.length<100&&!c.newsNext)c.autoNewsHistoryDoneV116=true;
    }
    return mergeTrainingNewsV13(c,result);
  }
  function mergeIncomingLogsV13(c,response){
    const list=Array.isArray(response&&response.log)?response.log:Object.entries(response&&response.log||{}).map(function(pair){
      return Object.assign({id:pair[0]},pair[1]);
    });
    let added=0;
    const newlySeen=new Set();
    list.forEach(function(log){
      if(!log || log.id==null || !Number.isFinite(Number(log.timestamp)))return;
      const k=String(log.id),guess=parseIncomingLog(log,c);
      const existing=(c.logs||[]).find(function(x){return String(x.id)===k;});
      if(existing){
        if(!existing.suggestion || existing.suggestion.status==="review")existing.suggestion=guess;
        return;
      }
      newlySeen.add(k);added++;
      c.logs.push({id:k,timestamp:Number(log.timestamp),
        title:String(log.details&&log.details.title||log.title||"Incoming money").slice(0,160),
        suggestion:guess});
    });
    repairImportDuplicates(c);
    const credited=autoCreditPurchasesV13(c,newlySeen);
    const classified=applyMatchedPayments(c);
    c.moneySyncAt=new Date().toISOString();
    return {added:added,credited:credited.credited,trains:credited.trains,review:classified.review};
  }
  async function syncRecentMoneyV13(c){
    if(!c.incomingTypesVerified && !/^\d+(,\d+){0,9}$/.test(String(c.logTypes||""))){
      const raw=await read("torn/logtypes");
      const options=findMoneyTypes(raw).slice(0,10);
      if(!options.length)throw Error("No incoming money log types available");
      c.logTypes=options.map(function(x){return x.id;}).join(",");
      c.incomingTypesVerified=true;
    }
    if(!/^\d+(,\d+){0,9}$/.test(String(c.logTypes||"")))throw Error("Incoming-money log types not configured");
    const response=await read("user/log",{log:c.logTypes,limit:"100",sort:"DESC"});
    if(!c.autoMoneyHistoryInitializedV116){
      const list=Array.isArray(response.log)?response.log:Object.entries(response.log||{}).map(function(pair){return Object.assign({id:pair[0]},pair[1]);});
      c.autoMoneyHistoryInitializedV116=true;
      if(list.length>=100&&!c.logNext&&!c.logHistoryWarning){
        const decision=importPageDecision(response,"user/log",c.logTypes,list);
        if(decision.warning)c.logHistoryWarning=decision.warning;
        else c.logNext=decision.next;
      }
      if(list.length<100&&!c.logNext)c.autoMoneyHistoryDoneV116=true;
    }
    return mergeIncomingLogsV13(c,response);
  }
  function supportWageModelV13(c){
    const wages=(c.staff||[]).map(function(p){
      const wage=financialAmount(p.wage),eff=financialAmount(p.effectiveness&&p.effectiveness.total);
      return {p:p,wage:wage,eff:eff,role:String(p.position&&p.position.name||""),value:financialAmount(p.value)};
    });
    const ratios=wages.filter(function(x){return x.wage!==null && x.eff!==null&&x.eff>0;})
      .map(function(x){return x.wage/x.eff;}).sort(function(a,b){return a-b;});
    const median=function(vals){if(!vals.length)return null;const middle=Math.floor(vals.length/2);
      return vals.length%2?vals[middle]:(vals[middle-1]+vals[middle])/2;};
    const med=median(ratios);
    return wages.map(function(x){
      const same=wages.filter(function(y){return y.p.id!==x.p.id&&y.role===x.role&&y.wage!==null&&y.eff!==null&&y.eff>0;});
      const sameRate=median(same.map(function(y){return y.wage/y.eff;}).sort(function(a,b){return a-b;}));
      const baseline=sameRate===null?med:sameRate;
      const estimate=baseline!==null&&x.eff!==null&&x.eff>0?
        Math.min(25000000,Math.round((baseline*x.eff)/1000)*1000):null;
      const tenure=financialAmount(x.p.days_in_company);
      const p=x.p.effectiveness||{};
      const adjustment=[p.addiction,p.inactivity].map(function(v){return typeof v==="number"?v:0;});
      const min=estimate===null?null:Math.max(0,Math.round(estimate*(tenure>=90?0.9:0.85)/1000)*1000);
      const max=estimate===null?null:Math.min(25000000,Math.round(estimate*(tenure>=90?1.25:1.15)/1000)*1000);
      return Object.assign({},x,{estimate:estimate,min:min,max:max,peerCount:same.length,
        basis:sameRate!==null?"Same-role EFF rate":"Team median wage per EFF",
        penalty:adjustment[0]+adjustment[1],
        ratio:x.value!==null&&x.value>0&&x.wage!==null?x.wage/x.value:null});
    });
  }
  function compactWagePanelV13(c){
    const rows=supportWageModelV13(c),support=rows.filter(function(r){return r.value===null||r.value===0;});
    return '<section class="tch-panel"><h2>Pay decisions · every employee</h2>'+
      '<p>For direct-income roles, HR value remains available in the detailed wage breakdown. Support employees get an <strong>estimated pay band</strong> from comparable wage per effectiveness, not a fictional sales value.</p>'+
      '<div class="tch-dense-list">'+rows.map(function(x){
        const estimate=x.estimate===null?'Insufficient data':money(x.min)+' - '+money(x.max);
        const below=x.min!==null&&x.wage!==null&&x.wage<x.min;
        const above=x.max!==null&&x.wage!==null&&x.wage>x.max;
        return '<div class="tch-dense-row"><div><strong>'+esc(x.p.name)+'</strong>'+
          '<small>'+esc(x.role)+' · EFF '+esc(x.eff===null?'?':x.eff)+
          (x.penalty<0?' · Penalty '+x.penalty:'')+'</small></div>'+
          '<div><b>'+esc(money(x.wage))+'</b><small>'+esc(x.value===0||x.value===null?'Support proxy':"HR value "+money(x.value))+'</small></div>'+
          '<div class="tch-dense-detail"><span>'+esc(x.basis)+': '+esc(estimate)+'</span>'+
            (below?'<em>Below band</em>':above?'<em>Above band</em>':'')+'</div></div>';
      }).join("")+'</div>'+
      '<p class="tch-hint">'+support.length+' employees have zero or unavailable direct-value figures. Estimates use internal wage/EFF comparisons; loyalty, recruitment competition and position-specific benefits are not mathematically captured. No wages are changed automatically.</p></section>';
  }
  function growthMovesV13(c){
    if(!c||!c.profile)return [];
    const p=c.profile,rows=[],a=accounting(c),staff=(c.staff||[]);
    function push(rank,title,detail,target){rows.push({rank:rank,title:title,detail:detail,target:target});}
    const weak=staff.filter(function(x){return x&&x.effectiveness&&Number.isFinite(Number(x.effectiveness.total));})
      .sort(function(x,y){return Number(x.effectiveness.total)-Number(y.effectiveness.total);});
    if(p.efficiency!=null&&Number(p.efficiency)<100) {
      const worst=weak[0],effect=worst&&worst.effectiveness;
      push(1,"Fix efficiency: "+Number(p.efficiency)+"%",
        worst?"Review "+worst.name+" ("+effect.total+" EFF), "+(effect.addiction<0?"addiction "+effect.addiction:"role fit/inactivity")+
          ". Confirm the lowest performers before changing positions.":"Inspect lowest effectiveness first.","staff");
    }
    if(p.environment!=null&&Number(p.environment)<100)
      push(2,"Recover environment: "+Number(p.environment)+"%",
        "Check Cleaner coverage, effectiveness and activity before making other changes.","staff");
    const peer=peerModelV11(c);
    if(p.popularity!=null&&Number(p.popularity)<100)
      push(3,"Grow popularity: "+Number(p.popularity)+"%",
        "Compare advertising/membership settings against the next full daily report; test one change at a time.","growth-pricing");
    if(peer.neighbours.length>=3&&peer.gap!==null&&peer.gap>0)
      push(4,"Close observed weekly income gap",
        money(peer.gap)+"/week below "+peer.target+"-star peer median ("+peer.neighbours.length+" companies). This is not a star threshold.","growth-rivals");
    if(a.known&&a.headroom<0)push(0,"Protect daily loss allowance",
      "Estimated operating loss exceeds the configured cap by "+money(-a.headroom)+".","growth-accounts");
    const training=trainPlanV3(c);
    if(training.overflow>0)push(0,"Use company trains before capacity",
      "Possible overflow of "+training.overflow+" at the next company close. Review the oldest eligible paid obligations.","training-queue");
    if(!rows.length)push(5,"Track one controlled change","No urgent weakness found. Record one change then compare after daily close.","growth-review");
    return rows.sort(function(x,y){return x.rank-y.rank;}).slice(0,4);
  }
  function growthMovesPanelV13(c){
    const moves=growthMovesV13(c);
    return '<section class="tch-panel tch-focus"><div class="tch-sectionhead"><h2>Priority moves</h2><span class="tch-mini">Star growth</span></div>'+
      moves.map(function(r,i){return '<button data-act="goto" data-target="'+esc(r.target)+'" class="tch-focus-item">'+
        '<span class="tch-step">'+(i+1)+'</span><span><strong>'+esc(r.title)+'</strong><small>'+esc(r.detail)+'</small></span><b>›</b></button>';}).join("")+
      '</section>';
  }
  function companyAlertsPanel(c){
    if(!c||!c.profile)return introV2();
    const issues=launcherAlertsV11(c).items,decisions=companyActionList(c);
    let html='<section class="tch-panel"><h2>Alerts · '+issues.length+'</h2><p><b>WHAT TO DO:</b> Tap an alert to reach its relevant review or input screen. Nothing is submitted automatically.</p></section>';
    if(!issues.length)html+='<section class="tch-panel"><h3>All clear</h3><p>No urgent or warning issues currently reported.</p></section>';
    for(const x of issues)html+='<section class="tch-panel tch-alert-card" id="tch-alert-'+esc(x.id)+'" '+(x.id===companyAlertFocus?'style="outline:2px solid #54d7fa"':'')+'><h3>'+esc(x.text)+'</h3><p>'+esc(x.target==="refresh"?"Update your saved company data before acting.":"Review the related live figures, then make the change yourself.")+'</p>'+
      '<button class="primary" data-act="goto" data-target="'+esc(x.target)+'">'+(x.target==="refresh"?"Refresh now":"Review this alert ›")+'</button></section>';
    html+='<section class="tch-panel"><h2>Other recommended actions</h2>'+decisions.map(a=>'<div class="tch-alert-card" id="tch-alert-decision-'+esc(a.target)+'"><button type="button" class="tch-insight" data-act="goto" data-target="'+esc(a.target)+'"><strong>'+esc(a.title)+'</strong><small>'+esc(a.why)+'</small><small>'+esc(a.confidence)+'</small><span>Review ›</span></button></div>').join('')+'</section>';
    if(!c.lastRefresh)html+='<section class="tch-panel" id="tch-alert-refresh-company"><h3>Refresh company data</h3><button data-act="refresh">Load latest data</button></section>';
    return html;
  }

  // Cross-functional advisory models: no promises about hidden Torn star mechanics.
  function employeeDevelopmentV14(c){
    const roles=roleList(c),rows=[];
    for(const p of (c.staff||[])){
      const role=roles.find(r=>r.name===currentPosition(p));if(!role||!p.stats)continue;
      const requirements=Object.entries(role.requirements||{}).filter(x=>Number(x[1])>0);
      const short=requirements.map(([k,v])=>({key:k,need:Number(v),have:num(p.stats[k]),gap:Math.max(0,Number(v)-num(p.stats[k]))})).filter(x=>x.gap>0);
      if(!short.length)continue;
      const progress=employeeProgress(c,p.id),observations=(c.snapshots||[]).filter(x=>x?.roster?.[p.id]&&x.observedAt);
      const first=observations[0],last=observations[observations.length-1];
      const days=first&&last?Math.max(0,(Date.parse(last.observedAt)-Date.parse(first.observedAt))/86400000):0;
      const scenarios=short.map(x=>{
        const gained=progress.stats&&progress.stats[x.key];
        const daily=days>=3&&Number.isFinite(gained)&&gained>0?gained/days:null;
        return {...x,daily,days:daily===null?null:Math.ceil(x.gap/daily)};
      });
      const eta=scenarios.every(x=>x.days!==null)?Math.max(...scenarios.map(x=>x.days)):null;
      rows.push({person:p,role:role.name,missing:scenarios,eta,observedDays:days,samples:progress.count||0,
        gap:short.reduce((n,x)=>n+x.gap,0)});
    }
    return rows.sort((a,b)=>a.eta===null?1:b.eta===null?-1:a.eta-b.eta||b.gap-a.gap);
  }
  function developmentPanelV14(c){
    const rows=employeeDevelopmentV14(c);
    if(!rows.length)return '<section class="tch-panel"><h2>Employee development</h2><p>No current-role working-stat shortages can be established with saved role requirements.</p></section>';
    return '<section class="tch-panel"><h2>Employee development forecasts</h2>'+
      '<p>Measured shortfall against the assigned role. ETA is an extrapolation of observed working-stat change between saved company snapshots, <b>not</b> a train entitlement, guaranteed gain or predicted effectiveness.</p>'+
      rows.slice(0,8).map(x=>'<div class="tch-dense-row"><strong>'+esc(x.person.name)+'</strong> · '+esc(x.role)+
        '<div><small>'+x.missing.map(m=>esc(m.key.replace("_"," "))+' short '+Math.ceil(m.gap).toLocaleString()).join(' · ')+'</small></div>'+
        '<b>'+esc(x.eta===null?'ETA unknown':x.eta+' days at recorded pace')+'</b>'+
        '<small>'+x.samples+' snapshots · '+x.observedDays.toFixed(1)+' days observed</small>'+
        '<button data-act="employee-detail" data-id="'+esc(x.person.id)+'">Review employee and trains ›</button></div>').join('')+
      '<p class="tch-hint">Two snapshots on the same day are not enough for an ETA. Actual trains, passive gains and new assignments can change the result.</p></section>';
  }
  function wageScenarioPanelV14(c){
    const current=accounting(c),rows=supportWageModelV13(c),known=rows.every(x=>x.wage!==null);
    if(!current||!known)return '<section class="tch-panel"><h2>Wage budget scenarios</h2><p>Complete employee wages are needed for reliable wage-only comparisons.</p></section>';
    const scenarios=[{label:'Current wages',cost:current.wages},
      {label:'Raise all by 5%',cost:Math.round(current.wages*1.05)},
      {label:'Raise all by 10%',cost:Math.round(current.wages*1.1)}];
    const comparable=rows.filter(x=>x.peerCount>=2&&x.estimate!==null);
    if(comparable.length)scenarios.push({label:'Peer-median subset ('+comparable.length+' staff)',
      cost:current.wages+comparable.reduce((n,x)=>n+x.estimate-x.wage,0)});
    return '<section class="tch-panel"><h2>Wage impact simulator</h2>'+
      '<p>Hold revenue and advertising constant to isolate the <b>daily cash cost</b> of possible pay decisions. Pay itself does not improve Torn company stars.</p>'+
      scenarios.map(x=>'<div class="tch-change"><strong>'+esc(x.label)+'</strong><span>Daily wages '+esc(money(x.cost))+
        '</span><b>'+esc(current.known?'P/L '+money(current.revenue-current.ad-x.cost):'P/L unavailable')+'</b></div>').join('')+
      '<p class="tch-hint">The peer-median option adjusts only employees with two comparable same-role peers. It is not a recommended pay cut; retention, special-role contribution and competitiveness need manual review.</p>'+
      '<button data-act="goto" data-target="staff-wages">Review individual pay bands ›</button></section>';
  }
  function starMomentumPanelV14(c){
    const byDay=new Map();
    for(const s of (c.snapshots||[]))if(s?.observedAt&&s.rating!==null&&s.rating!==undefined&&Number.isFinite(Number(s.rating)))
      byDay.set(String(s.observedAt).slice(0,10),Number(s.rating));
    const points=[...byDay].sort((a,b)=>a[0].localeCompare(b[0]));
    const changes=[];
    for(let i=1;i<points.length;i++)if(points[i][1]>points[i-1][1])
      changes.push({date:points[i][0],gapDays:(Date.parse(points[i][0])-Date.parse(points[i-1][0]))/86400000,
        delta:points[i][1]-points[i-1][1]});
    const current=Number(c.profile.rating)||0;
    let observed='No recorded star-ups yet',eta='Unknown · save more Sunday snapshots';
    if(changes.length){observed=changes.length+' observed increase(s) across '+points.length+' dated snapshots';}
    const sundays=points.filter(x=>new Date(x[0]+'T12:00:00Z').getUTCDay()===0);
    const firstSunday=sundays[0],lastSunday=sundays[sundays.length-1];
    const totalGrowth=firstSunday&&lastSunday?lastSunday[1]-firstSunday[1]:0;
    const elapsedWeeks=firstSunday&&lastSunday?(Date.parse(lastSunday[0])-Date.parse(firstSunday[0]))/604800000:0;
    if(sundays.length>=4&&totalGrowth>=2&&elapsedWeeks>=3&&current<10)
      eta='~'+(elapsedWeeks/totalGrowth).toFixed(1)+' weeks at saved historical pace';
    // This conditional retrospective scenario cannot predict the hidden promotion formula.
    return '<section class="tch-panel"><h2>Next-star readiness</h2>'+
      '<div class="tch-metrics">'+metricV2("Reported rating",current+' / 10','Current Torn observation','','growth-review')+
      metricV2("Next star ETA",eta,'Historical pace only where enough Sunday increases exist','','growth-review')+
      metricV2("Promotion evidence",observed,'Your saved rating history','','growth-review')+'</div>'+
      '<p>Star ratings update weekly on Sunday. More popularity, revenue and effectiveness history helps identify improvement, but cannot establish an exact promotion date.</p>'+
      '<button data-act="goto" data-target="growth-review">Compare Sunday snapshots ›</button></section>';
  }

  // One observation per UTC day avoids treating repeated refreshes as separate closes.
  function companyProfitTrendV191(c){
    const byDay=new Map();
    for(const item of (c.snapshots||[])){
      if(!item||item.complete!==true||!Number.isFinite(Number(item.profit)))continue;
      const d=String(item.observedAt||'').slice(0,10);
      if(!/^\d{4}-\d{2}-\d{2}$/.test(d))continue;
      if(!byDay.has(d)||String(byDay.get(d).observedAt)<String(item.observedAt))byDay.set(d,item);
    }
    const recent=[...byDay.entries()].sort((a,b)=>a[0].localeCompare(b[0])).slice(-7)
      .map(([date,row])=>({date,profit:Number(row.profit),revenue:Number(row.revenue),wages:Number(row.wages),ad:Number(row.ad)}));
    const sum=recent.reduce((a,x)=>a+x.profit,0),average=recent.length?sum/recent.length:null;
    const last3=recent.slice(-3),streak=last3.length===3&&last3.every(x=>x.profit<0)&&
      last3.every((row,i)=>i===0||Date.parse(row.date+'T00:00:00Z')-Date.parse(last3[i-1].date+'T00:00:00Z')===86400000);
    return {recent,sum,average,streak};
  }
  function profitBridgePanelV191(c){
    const history=companyProfitTrendV191(c),a=accounting(c),known=a&&a.known;
    let html='<section class="tch-panel"><h2>Operating cashflow · income bridge</h2>'+
      '<p class="tch-hint">Recorded daily snapshots, not Torn bank transactions. Only one verified snapshot per UTC day is counted; repeated refreshes do not inflate the totals.</p>';
    html+='<div class="tch-homekpis">'+
      metricV2('Latest daily model',known?money(a.profit):'Unverified','Revenue less wages and advertising','','growth-accounts')+
      metricV2('Average observed day',history.average===null?'Insufficient history':money(history.average),history.recent.length+' unique days captured','','growth-accounts')+'</div>';
    if(history.streak)html+='<p class="bad">Three latest recorded days show operating losses. Check wages, price, advertising and customer demand before another investment.</p>';
    if(history.recent.length)html+='<details><summary>Show observed profit history</summary>'+
      history.recent.map(x=>'<div class="tch-roleline"><span>'+esc(x.date)+'</span><b class="'+(x.profit<0?'bad':'good')+'">'+esc(money(x.profit))+'</b></div>').join('')+
      '</details>';
    html+='<p class="tch-hint">ProfitStaxx can record actual director payouts as realised income. Do not count these modeled company operating results as cash received or duplicate employee wages.</p>'+
      '<button type="button" class="primary" data-act="profitstaxx">Open ProfitStaxx income tracker</button></section>';
    return html;
  }


  // Evidence-backed director briefing: actionable, ordered and never inferred from missing API values.

  function companyDeltaV111(c){
    const observations=new Map();
    for(const snapshot of c?.snapshots||[]){
      if(!snapshot?.observedAt||snapshot.complete!==true)continue;
      const day=String(snapshot.observedAt).slice(0,10);
      if(!/^\d{4}-\d{2}-\d{2}$/.test(day))continue;
      if(!observations.has(day)||snapshot.observedAt>observations.get(day).observedAt)observations.set(day,snapshot);
    }
    const dates=[...observations.keys()].sort(),latest=observations.get(dates.at(-1)),prior=observations.get(dates.at(-2));
    if(!latest||!prior)return {known:false,why:'Need two complete observations on separate UTC days. Multiple refreshes on one day are not two daily reports.'};
    const metrics=[['Revenue','revenue'],['Wages','wages'],['Advertising','ad'],['Operating P/L','profit'],
      ['Efficiency','efficiency'],['Popularity','popularity'],['Environment','environment'],['Star rating','rating']];
    const results=metrics.map(([label,key])=>{
      const a=prior[key],b=latest[key],valid=a!==null&&a!==undefined&&b!==null&&b!==undefined&&
        Number.isFinite(Number(a))&&Number.isFinite(Number(b));
      return {label,key,before:valid?Number(a):null,after:valid?Number(b):null,
        delta:valid?Number(b)-Number(a):null,percent:valid&&Number(a)!==0?100*(Number(b)-Number(a))/Math.abs(Number(a)):null};
    });
    const before=prior.roster||{},after=latest.roster||{},staff=[];
    for(const [id,next] of Object.entries(after)){
      const prev=before[id];if(!prev||!next)continue;
      const oldEff=prev.effectiveness,newEff=next.effectiveness;
      const hasEff=oldEff!==null&&oldEff!==undefined&&newEff!==null&&newEff!==undefined&&
        Number.isFinite(Number(oldEff))&&Number.isFinite(Number(newEff));
      const oldWage=prev.wage,newWage=next.wage;
      const hasWage=oldWage!==null&&oldWage!==undefined&&newWage!==null&&newWage!==undefined&&
        Number.isFinite(Number(oldWage))&&Number.isFinite(Number(newWage));
      if(!hasEff&&!hasWage&&prev.position===next.position)continue;
      staff.push({id,name:String((c.staff||[]).find(p=>String(p.id)===id)?.name||'Employee #'+id),
        role:next.position||'Unknown',oldRole:prev.position||'Unknown',
        effChange:hasEff?Number(newEff)-Number(oldEff):null,
        wageChange:hasWage?Number(newWage)-Number(oldWage):null});
    }
    const p=results.find(x=>x.key==='profit'),w=results.find(x=>x.key==='wages'),r=results.find(x=>x.key==='revenue');
    const signals=[];
    if(p?.delta!==null&&p?.delta<0)signals.push('Modelled operating P/L fell by '+money(-p.delta)+'.');
    if(w?.delta!==null&&w?.delta>0)signals.push('Observed total daily wages increased '+money(w.delta)+'.');
    if(r?.delta!==null&&r?.delta<0)signals.push('Reported daily revenue declined '+money(-r.delta)+'.');
    const weak=staff.filter(x=>x.effChange!==null&&x.effChange<=-5);
    if(weak.length)signals.push(weak.length+' employee(s) lost at least 5 effectiveness points.');
    if(!signals.length)signals.push('No major adverse movement detected in comparable recorded fields.');
    return {known:true,previousDay:dates.at(-2),latestDay:dates.at(-1),consecutive:
      Date.parse(dates.at(-1)+'T00:00:00Z')-Date.parse(dates.at(-2)+'T00:00:00Z')===86400000,
      metrics:results,staff:staff.sort((a,b)=>Math.abs(b.effChange||0)-Math.abs(a.effChange||0)),signals};
  }
  function companyDeltaPanelV111(c){
    const d=companyDeltaV111(c);
    if(!d.known)return '<section class="tch-panel"><h2>Daily company performance comparison</h2><p>'+esc(d.why)+'</p><button data-act="refresh">Refresh observations</button></section>';
    const signed=(n,unit)=>n===null?'Not recorded':(n>=0?'+':'')+(unit==='percent'?n.toFixed(1):money(n));
    let h='<section class="tch-panel"><h2>What changed since the previous recorded day?</h2>'+
      '<p class="tch-hint">Comparing '+esc(d.previousDay)+' with '+esc(d.latestDay)+'. '+(d.consecutive?'Consecutive UTC observations.':'There is a gap between recorded days, so changes are not necessarily one-day moves.')+' Correlation does not prove that a staff or budget change caused profit movement.</p>';
    for(const x of d.metrics){
      const isRate=['efficiency','popularity','environment','rating'].includes(x.key);
      h+='<div class="tch-roleline"><span>'+esc(x.label)+'<small>'+(
        x.before===null?' · previous unavailable':' · from '+(isRate?x.before.toFixed(1):money(x.before)))+
        '</small></span><strong class="'+(x.delta===null?'':x.key==='wages'||x.key==='ad'?(x.delta>0?'warn':'good'):
          x.delta<0?'bad':x.delta>0?'good':'')+'">'+
        esc(x.after===null?'Unverified':isRate?x.after.toFixed(1):money(x.after))+
        ' ('+esc(signed(x.delta,isRate?'percent':'money'))+(isRate?' pp':'')+')</strong></div>';
    }
    h+='<h3>Possible contributors to investigate</h3>'+d.signals.map(x=>'<p>• '+esc(x)+'</p>').join('')+
      '<details><summary>Employee effectiveness and recorded wage movements ('+d.staff.length+')</summary>';
    for(const x of d.staff.slice(0,25))h+='<div class="tch-roleline"><span>'+esc(x.name)+'<small>'+esc(x.oldRole)+' → '+esc(x.role)+'</small></span><b>'+
      (x.effChange===null?'EFF unverified':'EFF '+signed(x.effChange,'percent')+' pp')+
      (x.wageChange===null?'':' · wage '+signed(x.wageChange,'money'))+'</b></div>';
    h+='</details><p class="tch-hint">Individual pay comparisons require wage values in both daily snapshots; older records may not contain them. No payroll changes are applied automatically.</p>'+
      '<button class="primary" data-act="goto" data-target="staff-wages">Review wage efficiency</button> '+
      '<button data-act="goto" data-target="growth-review">Review growth history</button></section>';
    return h;
  }

  function directorBriefV110(c){
    if(!c||!c.profile)return {items:[],ageHours:null,ready:false};
    const parsed=Date.parse(c.lastRefresh||''),ageHours=Number.isFinite(parsed)?Math.max(0,(Date.now()-parsed)/3600000):null;
    const fresh=ageHours!==null&&ageHours<6,actions=[],seen=new Set();
    function add(level,title,why,target){
      if(seen.has(target+':'+title))return;
      seen.add(target+':'+title);actions.push({level,title,why,target});
    }
    if(!fresh)add(0,'Refresh the current company figures',
      ageHours===null?'No complete refresh observed.':Math.round(ageHours)+' hours since last refresh. Revalidate before making financial or employee changes.','refresh');
    const accounts=accounting(c);
    if(!accounts.known)add(0,'Complete the missing accounts figures',
      'Cannot verify the daily loss guardrail: '+(accounts.missing||[]).join(', '),'growth-accounts');
    else if(accounts.headroom<0)add(0,'Protect your daily loss limit',
      'Current operating model is '+money(-accounts.headroom)+' beyond your configured '+money(c.lossLimit)+' loss cap.','growth-accounts');
    const p=trainPlanV3(c);
    if(p.allocate>0&&p.overflow>0)add(1,'Assign trains before capacity is lost',
      p.overflow+' train(s) could be lost at the next company close; check the oldest eligible commitments first.','training-queue');
    const due=p.queue?.find(x=>x.give>0);
    if(due)add(2,'Give '+due.give+' train(s) to '+due.name,
      'Oldest eligible paid commitment · '+due.owed+' recorded as owed. Confirm the recipient and quantity in Torn.','training-queue');
    const payments=pendingPaymentLogs(c).length;
    if(payments)add(2,'Verify '+payments+' incoming transfer(s)',
      'Unapproved money receipts are not automatically treated as training purchases.','training-payments');
    const shortage=stockAdviceV3(c).filter(x=>x.qty!==null&&x.qty>0&&x.days!==null&&x.days<1);
    if(shortage.length)add(2,'Review '+shortage.length+' stock shortage(s)',
      'Reported stock cover is less than one day. Check real stock and supplier listings before ordering.','stock');
    if(companyProfitTrendV191(c).streak)add(2,'Review consecutive operating losses',
      'Three consecutive observed UTC days show negative operating estimates. Check costs against revenue.','growth-accounts');
    const weak=growthMovesV13(c).find(x=>x.rank>0&&x.rank<4);
    if(weak)add(3,weak.title,weak.detail,weak.target);
    if(!actions.length)add(4,'Review growth before changing settings',
      'No urgent issue is demonstrated in saved data. Capture a daily report and compare Sunday star progression.','growth-review');
    return {items:actions.sort((a,b)=>a.level-b.level).slice(0,7),ageHours,ready:fresh&&accounts.known};
  }
  function directorBriefPanelV110(c){
    const report=directorBriefV110(c);
    return '<section class="tch-panel"><div class="tch-sectionhead"><h2>Director briefing · what to do now</h2>'+
      '<span class="tch-mini">'+(report.ready?'Figures checked':'Verification needed')+'</span></div>'+
      '<p class="tch-hint">Ordered by operational urgency. Suggestions use saved company data; refresh before applying any action inside Torn. All decisions are manual.</p>'+
      report.items.map((r,i)=>'<button class="tch-insight" data-act="goto" data-target="'+esc(r.target)+'" type="button">'+
        '<strong>'+(i+1)+'. '+esc(r.title)+'</strong><small>'+esc(r.why)+'</small><span>Review ›</span></button>').join('')+
      '</section>';
  }


  // Local, interactive scenarios: revenue changes only, never actual wages or advertising.
  let companyStressPctV115=10;
  function companyStressLabV115(c){
    const a=accounting(c),limit=Number(c?.lossLimit);
    if(!a?.known||!Number.isFinite(limit)||limit<0)return '<section class="tch-panel"><h2>Growth Stress Lab</h2><p class="tch-hint">Refresh the complete income, wages, advertising and loss-limit figures before comparing company scenarios.</p><button data-act="refresh">Refresh company figures</button></section>';
    const shocked=a.profit-a.revenue*companyStressPctV115/100;
    const headroom=shocked+limit,buffer=Math.max(0,headroom)*0.75;
    const plus=a.profit+a.revenue*.05;
    let h='<section class="tch-panel"><div class="tch-sectionhead"><h2>Growth Stress Lab</h2><span class="tch-mini">What-if · no changes applied</span></div>'+
      '<p class="tch-hint">Test a revenue dip while holding staff wages and advertising constant. The game can behave differently; this is arithmetic from the latest company daily report, not a star-promotion predictor.</p>'+
      '<div class="tch-actionrow">'+[5,10,20].map(n=>'<button data-act="stress-shock" data-shock="'+n+'" class="'+(companyStressPctV115===n?'primary':'')+'">−'+n+'% revenue</button>').join('')+'</div>'+
      '<div class="tch-metrics">'+
      metricV2('Current daily P/L',money(a.profit),'Reported income less wages & ads','','growth-accounts')+
      metricV2('After −'+companyStressPctV115+'% revenue',money(shocked),'Hypothetical · same staff and ads','','growth-accounts')+
      metricV2('After +5% revenue',money(plus),'Hypothetical · same staff and ads','','growth-accounts')+
      metricV2('Shock-safe spending room',money(buffer),'75% of remaining loss-limit headroom','','growth-pricing')+'</div>'+
      '<p class="tch-hint">'+(headroom<0?'⚠ Revenue shock would exceed your saved daily operating-loss limit by '+esc(money(-headroom))+'. Review wage, staffing and advertising assumptions before spending.':
        'At this hypothetical income, the saved loss limit leaves '+esc(money(headroom))+' of headroom; the 25% haircut provides a modelling buffer, not a guaranteed safe budget.')+'</p>'+
      '<div class="tch-actionrow"><button data-act="goto" data-target="growth-pricing" class="primary">Review advertising ›</button>'+
      '<button data-act="goto" data-target="staff-wages">Review wages ›</button></div></section>';
    return h;
  }

  function homeV13(c){
    if(!c||!c.profile)return introV2();
    const a=accounting(c),train=trainPlanV3(c),star=Number(c.profile.rating)||0;
    const due=Object.values(aggregates(c).balance).reduce(function(n,b){return n+b.owed;},0);
    return directorBriefPanelV110(c)+companyStressLabV115(c)+'<section class="tch-homehead"><div><small>YOUR COMPANY</small><h2>'+esc(c.profile.name||"Company")+'</h2>'+
      '<span class="tch-mini">'+star+' ★ / 10</span></div><div class="tch-home-number">'+star+' ★</div></section>'+
      '<div class="tch-homekpis">'+
        metricV2("Efficiency",c.profile.efficiency==null?"?":c.profile.efficiency+"%","Daily report","","staff")+
        metricV2("Popularity",c.profile.popularity==null?"?":c.profile.popularity+"%","Daily report","","growth-pricing")+
        metricV2("Trains available",train.available===null?"?":train.available,"Paid owed "+due,"","training-queue")+
        metricV2("Estimated P/L",a.known?money(a.profit):"Unknown","Excludes unreported costs","","growth-accounts")+
      '</div>'+starMomentumPanelV14(c)+growthMovesPanelV13(c)+companyDeltaPanelV111(c)+profitBridgePanelV191(c)+
      '<div class="tch-quick"><button data-act="goto" data-target="training-queue">Training queue ›</button>'+
      '<button data-act="goto" data-target="staff-wages">Wage analysis ›</button>'+
      '<button data-act="goto" data-target="growth-review">Weekly review ›</button></div>'+
      '<p class="tch-hint">Comparisons are advisory, and every data refresh is read-only.</p>';
  }
  const style=document.createElement("style"); style.id="tch-css";
  style.textContent="#tch-open{position:fixed;right:16px;bottom:72px;z-index:2147483645;background:#1d8b81;color:white;border:0;border-radius:24px;padding:12px 17px;font-weight:800;box-shadow:0 5px 20px #000a}#tch-root{position:fixed;inset:0;z-index:2147483646;background:#0e141e;color:#eef5fa;overflow:auto;font:14px/1.45 system-ui,Arial,sans-serif;padding:env(safe-area-inset-top) 0 env(safe-area-inset-bottom)}#tch-root *{box-sizing:border-box}#tch-root header{position:sticky;top:0;background:#151f2d;border-bottom:1px solid #354257;padding:14px 16px;display:flex;justify-content:space-between;align-items:center;z-index:1}#tch-root main{padding:12px;max-width:1100px;margin:auto}#tch-root h2{font-size:17px;margin:15px 0 8px}#tch-root h3{font-size:15px;margin:4px 0 10px}#tch-root p{margin:8px 0;color:#b6c7d7}#tch-root .muted{font-size:12px;color:#a1b4c6}#tch-root .nav{display:flex;gap:6px;overflow-x:auto;padding:9px 12px;background:#141e2b}#tch-root button,#tch-root select,#tch-root input,#tch-root textarea{font:inherit}#tch-root button{background:#273a50;border:1px solid #45617a;color:#f2faff;border-radius:9px;padding:9px 11px;cursor:pointer}#tch-root button.primary,#tch-root .nav button.active{background:#13877e;border-color:#22aaa0}#tch-root button:disabled{opacity:.5}#tch-root .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}#tch-root .card{background:#192637;border:1px solid #30465a;border-radius:12px;padding:13px;margin-bottom:10px;min-width:0}#tch-root .value{font-size:22px;font-weight:800;word-break:break-word}#tch-root .good{color:#57dab3}#tch-root .bad{color:#ff8585}#tch-root .warn{color:#ffcf7c}#tch-root .tag{background:#243a4f;border-radius:5px;padding:2px 5px}#tch-root table{border-collapse:collapse;width:100%;min-width:510px}#tch-root th,#tch-root td{border-bottom:1px solid #334558;text-align:left;padding:10px 7px}#tch-root th{color:#a7bdcf;font-weight:600}#tch-root .scroll{overflow:auto}#tch-root input,#tch-root select,#tch-root textarea{background:#101b28;color:#fff;border:1px solid #4b6279;border-radius:7px;padding:10px;max-width:100%;min-width:0}#tch-root input[type=number]{width:130px}#tch-root label{display:block;margin:9px 0 5px}#tch-root .row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}#tch-root .pill{background:#34485d;padding:4px 8px;border-radius:20px}#tch-root .notice{padding:11px;border:1px solid #876f41;background:#393220;border-radius:9px;margin:10px 0}#tch-root .actions{display:flex;gap:7px;flex-wrap:wrap}#tch-root .bar{height:8px;background:#314559;border-radius:6px;overflow:hidden}#tch-root .bar b{display:block;height:100%;background:#1fc5ad}#tch-root .spacer{height:12px}@media(min-width:750px){#tch-root .grid{grid-template-columns:repeat(4,minmax(0,1fr))}#tch-root main{padding:20px}}";

  style.textContent += "#tch-root .tch-evidence{color:#7cead3;font-weight:750}#tch-root .tch-quality{display:flex;gap:8px;align-items:center;justify-content:space-between;padding:11px 1px;border-bottom:1px solid #4a6279}#tch-root .tch-quality>div{flex:1}#tch-root .tch-quality strong,#tch-root .tch-quality small{display:block}#tch-root .tch-quality small{font-size:11px;color:#c9d9e7}#tch-root .tch-metric{text-align:left;cursor:pointer;width:100%;font:inherit;color:inherit}#tch-root .tch-metric:focus-visible{outline:3px solid #64e5d5}#tch-root{color-scheme:dark;color:#f6f9fd;background:#101923;font-size:15px;line-height:1.55;-webkit-font-smoothing:antialiased}#tch-root .card{background:#25384c;border-color:#52708a;box-shadow:0 2px 10px #0003}#tch-root header,#tch-root .nav{background:#1c2b3d;border-color:#425d76}#tch-root h2,#tch-root h3,#tch-root strong{color:#fff}#tch-root p,#tch-root .muted,#tch-root .card .muted{color:#d1e2f1}#tch-root th{color:#e0edf7;background:#2b4055}#tch-root td{color:#f1f6fb;border-color:#58718a}#tch-root table tr:nth-child(even){background:#30465d}#tch-root button{color:#fff;background:#345673;border:1px solid #7592aa;font-weight:650;min-height:43px}#tch-root button.primary,#tch-root .nav button.active{background:#087e7b;border-color:#50d9c3}#tch-root .nav button{white-space:nowrap}#tch-root button:focus-visible,#tch-root input:focus-visible,#tch-root select:focus-visible{outline:3px solid #5ae5d1;outline-offset:2px}#tch-root input,#tch-root select,#tch-root textarea{background:#142536;border:1px solid #8aa3b8;color:#fff;min-height:44px}#tch-root input::placeholder,#tch-root textarea::placeholder{color:#c2d5e5;opacity:1}#tch-root .notice{background:#433b28;border:1px solid #b9a16b;color:#fff}#tch-root .warn{color:#ffe2a1}#tch-root .good{color:#84f5d4}#tch-root .bad{color:#ffb0b0}#tch-root .check{display:flex;align-items:center;gap:12px;border-top:1px solid #52708a;padding:10px 0}#tch-root .check input{min-height:18px;width:20px;height:20px;flex-shrink:0}#tch-root .card .card{background:#2f445a}#tch-root .row{gap:10px}#tch-root .row > input,#tch-root .row > select{flex:1 1 150px}#tch-root .scroll{border-radius:8px}#tch-root [hidden]{display:none!important}";
  style.textContent += "#tch-open{bottom:auto;right:auto;left:16px;top:calc(100dvh - 125px);touch-action:none;user-select:none;-webkit-user-select:none;cursor:grab}#tch-open:active{cursor:grabbing}";
  style.textContent += "\n#tch-open{background:#1268a5;box-shadow:0 6px 25px #051326bb}\n#tch-root{background:#0c1626;color:#edf7ff}\n#tch-root .tch-top,#tch-root .tch-bottom{background:#12243a;border-color:#385979}\n#tch-root .tch-hero{background:linear-gradient(130deg,#133f64,#192945 60%,#123754);border-color:#4383ae}\n#tch-root .tch-panel,#tch-root .tch-person,#tch-root .tch-metric{background:#1a2e46;border-color:#3b6182}\n#tch-root .tch-eyebrow,#tch-root .tch-kicker{color:#6cd8ff}\n#tch-root button.primary,#tch-root .tch-switch button.active{background:#1468ad;border-color:#67c7ff}\n#tch-root .tch-bottom{grid-template-columns:repeat(5,minmax(0,1fr))}\n#tch-root .tch-bottom button{font-size:10px;min-width:0;padding:3px 1px}\n#tch-root .tch-radar{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:11px 0}\n#tch-root .tch-radar div{background:#24415d;border:1px solid #42698c;border-radius:10px;padding:10px}\n#tch-root .tch-radar small,#tch-root .tch-radar strong{display:block}\n#tch-root .tch-radar small{font-size:10px;color:#c6d8e9}\n#tch-root .tch-radar strong{font-size:22px}\n#tch-root .tch-stockrow{background:#223950;border:1px solid #405f7c;border-radius:12px;padding:13px;margin:11px 0}\n#tch-root .tch-stockrow p{font-size:12px}\n#tch-root .tch-stockrow>strong{color:#83ddff}\n#tch-root .tch-clickable:focus-visible,#tch-root button:focus-visible{outline:3px solid #60cdff}\n#tch-root.theme-light .tch-stockrow,#tch-root.theme-light .tch-radar div{background:#e9f3fc;border-color:#abc5db;color:#162a40}\n#tch-root.theme-light .tch-stockrow>strong{color:#176696}\n";
  style.textContent += "\n#tch-open{display:flex;align-items:center;gap:8px;white-space:nowrap}\n#tch-open .tch-launcherbadge{display:inline-flex;align-items:center;gap:2px;background:#f04458;color:white;border-radius:999px;padding:2px 7px;border:2px solid #0d1b2e;min-width:28px;height:25px;justify-content:center;font-size:11px;font-weight:900}\n#tch-root .tch-starplan .tch-insight{width:100%;text-align:left}\n#tch-root .tch-wagerow{background:#213952;border:1px solid #41617f;border-radius:12px;padding:12px;margin:10px 0}\n#tch-root .tch-wagegrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:10px 0}\n#tch-root .tch-wagegrid span{font-size:11px;color:#b9d2e7;background:#273f59;padding:8px;border-radius:8px}\n#tch-root .tch-wagegrid b{display:block;font-size:16px;color:#f0faff}\n#tch-root .tch-wage-target{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;border-top:1px solid #496987;padding-top:10px;font-size:12px}\n#tch-root .tch-weekgrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;text-align:center;margin:12px 0}\n#tch-root .tch-weekgrid>*{background:#25415c;border-radius:6px;padding:8px 3px;min-width:0}\n#tch-root.theme-light .tch-wagerow{background:#e9f3fc;border-color:#abc5db;color:#142e47}\n#tch-root.theme-light .tch-wagegrid span{background:#dcebf7;color:#153a58}\n#tch-root.theme-light .tch-wagegrid b{color:#152a42}\n";
  style.textContent += "\n#tch-root .tch-wage-risk{border:1px solid #3b6684;background:#213a54;border-radius:12px;margin:10px 0;padding:12px;overflow-wrap:anywhere}\n#tch-root .tch-wage-risk>strong{font-size:14px}\n#tch-root .tch-wage-risk small{display:block;font-size:11px;color:#accfe8}\n#tch-root .tch-wage-risk p{margin:5px 0}\n#tch-root .tch-starplan .tch-insight{text-align:left}\n#tch-root .tch-weekgrid{overflow-x:auto;min-width:0}\n#tch-root.theme-light .tch-wage-risk{background:#e9f3fc;border-color:#9dbbd3;color:#16354e}\n#tch-root.theme-light .tch-wage-risk small{color:#375d78}\n";
  style.textContent += "\n#tch-root .tch-top{min-height:54px;padding:8px 10px}\n#tch-root .tch-headline strong{font-size:17px}\n#tch-root .tch-eyebrow{font-size:9px;line-height:1.1}\n#tch-root .tch-timestamp{font-size:10px}\n#tch-root .tch-iconbtn{min-width:34px;padding:5px;font-size:18px;border-radius:9px}\n#tch-root .tch-main{padding:9px 10px calc(66px + env(safe-area-inset-bottom));max-width:680px}\n#tch-root .tch-bottom{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));padding:3px 5px calc(3px + env(safe-area-inset-bottom));gap:3px;box-shadow:0 -3px 14px #030c1c77}\n#tch-root .tch-bottom button{min-height:38px;height:38px;display:flex;flex-direction:row;justify-content:center;align-items:center;gap:4px;padding:3px 1px;font-size:10px;border-radius:8px;line-height:1.1}\n#tch-root .tch-navicon{font-size:16px;height:auto;line-height:1}\n#tch-root .tch-bottom button.active{background:#1d5d87;border:1px solid #65caff}\n#tch-root .tch-panel{margin:8px 0;padding:12px;border-radius:12px}\n#tch-root h2{font-size:16px;margin:8px 0 5px}\n#tch-root .tch-section{margin:9px 0}\n#tch-root .tch-homehead{padding:13px 15px;background:linear-gradient(130deg,#173e66,#172b45);border:1px solid #3b85ae;border-radius:13px;display:flex;align-items:center;justify-content:space-between}\n#tch-root .tch-homehead h2{font-size:18px;margin:2px 0}\n#tch-root .tch-homehead small{font-size:10px;color:#9fd9f5}\n#tch-root .tch-home-number{font-size:22px;font-weight:900;color:#74d6ff}\n#tch-root .tch-homekpis{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin:8px 0}\n#tch-root .tch-homekpis .tch-metric{padding:10px;min-width:0;min-height:72px}\n#tch-root .tch-homekpis .tch-metric strong{font-size:20px}\n#tch-root .tch-focus-item{display:flex;width:100%;align-items:center;text-align:left;gap:10px;padding:10px 7px;border:0;border-bottom:1px solid #395570;background:transparent;color:inherit}\n#tch-root .tch-focus-item span:nth-child(2){flex:1;min-width:0}\n#tch-root .tch-focus-item strong,#tch-root .tch-focus-item small{display:block}\n#tch-root .tch-focus-item small{font-size:11px;font-weight:400;color:#b7d1e8;margin-top:3px}\n#tch-root .tch-step{display:grid;place-items:center;width:25px;height:25px;border-radius:7px;background:#185d89;color:white;font-weight:900}\n#tch-root .tch-quick{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin:8px 0}\n#tch-root .tch-quick button{padding:9px 4px;font-size:11px;border-radius:9px}\n#tch-root .tch-dense-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px 10px;border-bottom:1px solid #33536d;padding:11px 0}\n#tch-root .tch-dense-row small{display:block;color:#b8d3e9;font-size:11px}\n#tch-root .tch-dense-row>div:nth-child(2){text-align:right}\n#tch-root .tch-dense-detail{grid-column:1/-1;display:flex;justify-content:space-between;font-size:11px;color:#75d4fa;gap:8px}\n#tch-root .tch-dense-detail em{font-style:normal;color:#f6c36e}\n#tch-root .tch-advanced{margin:11px 0}\n#tch-root .tch-advanced summary{padding:12px;background:#24435d;border-radius:9px;cursor:pointer;font-weight:700}\n#tch-root.theme-light .tch-homehead{background:#e8f4fc;color:#14344c}\n#tch-root.theme-light .tch-focus-item small,#tch-root.theme-light .tch-dense-row small{color:#36556e}\n";
  style.textContent+="#tch-open{touch-action:none;-webkit-user-select:none;user-select:none;cursor:grab}#tch-open:active{cursor:grabbing}#tch-open[hidden],#tch-root[hidden]{display:none!important}";

  style.textContent += "#tch-root{font-family:system-ui,-apple-system,Arial,sans-serif;background:#101923;color:#f4f7fb}#tch-root .tch-main{padding:16px 13px 118px;max-width:760px;margin:0 auto}#tch-root .tch-top{height:auto;min-height:76px;padding:12px 15px;gap:8px}#tch-root .tch-headline{flex:1;min-width:0}#tch-root .tch-headline strong{display:block;font-size:20px;line-height:1.2}#tch-root .tch-eyebrow{letter-spacing:.09em;font-size:10px;color:#6af0d7;font-weight:700}#tch-root .tch-timestamp{font-size:11px;color:#c0d5e5;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}#tch-root .tch-iconbtn{min-width:40px;padding:7px;font-size:21px;border-radius:12px}#tch-root .tch-bottom{position:fixed;bottom:0;left:0;right:0;background:#152639;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));z-index:3;border-top:1px solid #4b6a85;padding:7px 5px calc(env(safe-area-inset-bottom) + 8px);box-shadow:0 -9px 25px #050c1599}#tch-root .tch-bottom button{border:0;display:flex;flex-direction:column;gap:2px;align-items:center;background:transparent;color:#c7d7e5;border-radius:10px;min-height:56px;padding:3px;font-size:11px}#tch-root .tch-bottom button.active{background:#284d57;color:#f0fffc}#tch-root .tch-navicon{font-size:23px;height:27px}#tch-root .tch-hero{background:linear-gradient(128deg,#153d4b,#1b314e 65%,#172a3e);border:1px solid #446f7d;border-radius:17px;padding:18px;margin-bottom:13px}#tch-root .tch-kicker{color:#72f1da;font-size:11px;font-weight:800;letter-spacing:.1em}#tch-root .tch-hero-line{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:8px 0 15px}#tch-root .tch-hero-line strong{font-size:22px;line-height:1.2}#tch-root .tch-rating{background:#16736f;border-radius:9px;padding:6px 10px;font-weight:800;white-space:nowrap}#tch-root .tch-progress{height:8px;background:#355368;border-radius:50px;overflow:hidden;margin:0 0 12px}#tch-root .tch-progress b{height:100%;display:block;background:#37dfc1}#tch-root .tch-hero small{color:#cbdce8}#tch-root .tch-metrics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:12px 0}#tch-root .tch-metric{background:#263b51;border:1px solid #496882;border-radius:13px;padding:14px;min-width:0;display:flex;flex-direction:column;gap:7px}#tch-root .tch-metric>strong{font-size:22px;letter-spacing:-.02em;overflow-wrap:anywhere}#tch-root .tch-metric>small{font-size:11px;color:#c5d7e6}#tch-root .tch-metric.tch-danger{border-color:#ff7979;background:#49353f}#tch-root .tch-metric.tch-positive{border-color:#468b86}#tch-root .tch-panel{background:#203247;border:1px solid #47627b;border-radius:14px;padding:15px;margin:12px 0}#tch-root .tch-panel h2,#tch-root .tch-section h2{font-size:18px;margin:0 0 8px}#tch-root .tch-section{margin:12px 2px 18px}#tch-root .tch-section p{margin:4px 0 12px}#tch-root .tch-sectionhead,#tch-root .tch-personhead{display:flex;align-items:center;justify-content:space-between;gap:9px}#tch-root .tch-mini{font-size:11px;letter-spacing:.02em;color:#c0dbe8;background:#325069;border-radius:7px;padding:5px 8px}#tch-root .tch-priority{display:flex;align-items:center;gap:12px;margin-top:9px;border:1px solid #536980;background:#2b4058;padding:12px;border-radius:11px}#tch-root .tch-priority>span{height:30px;min-width:30px;border-radius:9px;display:grid;place-items:center;background:#385e6a;color:#b5ffe6;font-weight:800}#tch-root .tch-priority.warning>span{background:#846735;color:#fff}#tch-root .tch-priority.danger>span{background:#9c4755;color:#fff}#tch-root .tch-priority>div{flex:1;min-width:0}#tch-root .tch-priority strong,#tch-root .tch-priority small{display:block}#tch-root .tch-priority small{font-size:11px;color:#cad9e7}#tch-root .tch-priority button{font-size:12px;min-height:36px}#tch-root .tch-actiongrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}#tch-root .tch-actiongrid button{text-align:left;min-height:72px;padding:11px;background:#304b64}#tch-root .tch-actiongrid button span{display:block;font-size:11px;color:#c1d6e6}#tch-root .tch-actionrow{display:flex;align-items:center;flex-wrap:wrap;gap:9px;margin:10px 0}#tch-root .tch-switch{display:flex;gap:5px;padding:4px;background:#1f334a;border:1px solid #405d75;border-radius:12px;overflow-x:auto;scrollbar-width:none}#tch-root .tch-switch button{flex:1;white-space:nowrap;min-height:38px;padding:8px;border:none;background:transparent;font-size:12px}#tch-root .tch-switch button.active{background:#0b8079;color:#fff}#tch-root .tch-person,#tch-root .tch-review{background:#263b50;border:1px solid #476983;border-radius:13px;padding:13px;margin:10px 0}#tch-root .tch-personhead{justify-content:flex-start}#tch-root .tch-personhead>div:nth-child(2){flex:1}#tch-root .tch-personhead strong,#tch-root .tch-personhead small{display:block}#tch-root .tch-personhead small{font-size:12px;color:#c6d8e8}#tch-root .tch-avatar{width:39px;height:39px;border-radius:12px;background:#116963;display:grid;place-items:center;font-weight:800;font-size:17px}#tch-root .tch-eff{background:#344b64;border-radius:8px;padding:6px;font-size:17px;font-weight:800}#tch-root .tch-eff small{font-size:9px;color:#d5e7f2}#tch-root .tch-recommend{display:flex;align-items:center;gap:9px;margin:12px 0;padding:8px;background:#1d3348;border-radius:9px;flex-wrap:wrap}#tch-root .tch-recommend span{font-size:11px;color:#d5e2ec}#tch-root .tch-recommend strong{font-size:14px}#tch-root .tch-recommend.highlight strong{color:#5ce8ce}#tch-root .tch-recommend small{color:#c6d9e6}#tch-root .tch-statstrip{display:flex;gap:7px;flex-wrap:wrap;margin:10px 0;color:#c5d7e5;font-size:11px}#tch-root .tch-statstrip span{padding:5px 7px;background:#304962;border-radius:7px}#tch-root .tch-statstrip b{color:#fff}#tch-root .tch-whatif{display:flex;align-items:center;justify-content:space-between;gap:12px}#tch-root .tch-whatif select{flex:1;max-width:220px}#tch-root .tch-hint{font-size:12px;color:#c4d7e6;margin:12px 0}#tch-root .tch-queueitem,#tch-root .tch-record{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:13px 1px;border-bottom:1px solid #456077}#tch-root .tch-queueitem>div:first-child,#tch-root .tch-record>div:first-child{flex:1}#tch-root .tch-queueitem strong,#tch-root .tch-queueitem small,#tch-root .tch-record strong,#tch-root .tch-record small{display:block}#tch-root .tch-queueitem small,#tch-root .tch-record small{font-size:11px;color:#cbd9e6}#tch-root .tch-queueitem b{font-size:22px;color:#8af1d8}#tch-root .tch-queueitem>div:last-child{text-align:right}#tch-root .tch-record>div:last-child{text-align:right}#tch-root .tch-record button{display:block;margin-left:auto;min-height:34px}#tch-root .tch-fieldrow{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}#tch-root .tch-fieldrow>select,#tch-root .tch-fieldrow>input,#tch-root .tch-fieldrow>label{flex:1 1 110px;min-width:0}#tch-root .tch-fieldrow>label input{display:block;width:100%;margin-top:5px}#tch-root .tch-empty{padding:20px;text-align:center;border-radius:9px;background:#2b445b;color:#d6e4ed}#tch-root .tch-minikpis{display:flex;gap:10px;margin:13px 0}#tch-root .tch-minikpis span{background:#37536b;padding:7px 11px;border-radius:7px}#tch-root .tch-highlight-number{font-size:30px;font-weight:800}#tch-root .tch-welcome{padding:24px}#tch-root .tch-welcome h2{font-size:24px}#tch-root.theme-light{background:#f3f6f9;color:#182d43;color-scheme:light}#tch-root.theme-light .tch-panel,#tch-root.theme-light .tch-person,#tch-root.theme-light .tch-review,#tch-root.theme-light .tch-metric{background:#fff;color:#1d3246;border-color:#cbd9e5}#tch-root.theme-light .tch-top,#tch-root.theme-light .tch-bottom{background:#e7eff6;color:#193449}#tch-root.theme-light .tch-bottom button{color:#354c5e}#tch-root.theme-light .tch-bottom button.active{background:#c9eae4;color:#095f58}#tch-root.theme-light .tch-section p,#tch-root.theme-light .tch-panel p,#tch-root.theme-light .muted,#tch-root.theme-light small,#tch-root.theme-light strong,#tch-root.theme-light h2,#tch-root.theme-light .tch-timestamp{color:#263f51}#tch-root.theme-light input,#tch-root.theme-light select,#tch-root.theme-light textarea{background:#fff;color:#12263a;border-color:#7995aa}#tch-root.theme-light .tch-switch{background:#e1ebf3}#tch-root.theme-light .tch-switch button{color:#233b4b}#tch-root.theme-light .tch-switch button.active{background:#167d78;color:#fff}#tch-root.theme-light .tch-priority,#tch-root.theme-light .tch-recommend,#tch-root.theme-light .tch-statstrip span,#tch-root.theme-light .tch-queueitem{background:#eef3f7;color:#193244}#tch-root.theme-light .tch-hero{background:linear-gradient(135deg,#e1f6ef,#dceaf7);color:#193449}#tch-root.theme-light .tch-hero-line strong,#tch-root.theme-light .tch-hero small{color:#163647}#tch-root.theme-light .tch-eyebrow,#tch-root.theme-light .tch-kicker{color:#046b60}#tch-root.theme-light .tch-avatar{background:#a5ded2;color:#13463d}";

  style.textContent += "#tch-root .tch-clickable{cursor:pointer;text-align:left;position:relative;transition:transform .12s,border-color .12s;min-height:110px}#tch-root .tch-clickable:active{transform:scale(.98)}#tch-root .tch-clickable:focus-visible,#tch-root .tch-person-button:focus-visible{outline:3px solid #78efda;outline-offset:3px}#tch-root .tch-tilearrow{position:absolute;top:9px;right:11px;color:#8ff5de;font-size:16px}#tch-root .tch-metric.tch-clickable{display:flex;align-items:stretch;flex-direction:column;gap:7px;padding:14px;background:#263b51;color:#f5fbfc;border:1px solid #496882;white-space:normal}#tch-root .tch-metric.tch-clickable:hover{border-color:#4cdbc1}#tch-root .tch-metric.tch-clickable strong{font-size:22px}#tch-root .tch-hero.tch-hero-button{width:100%;display:block;border:1px solid #446f7d;color:#fff;padding:18px}#tch-root .tch-person-button{display:block;text-align:left;width:100%;border:0;background:transparent;padding:0;min-height:0}#tch-root .tch-person-button .tch-personhead{width:100%}#tch-root .tch-fitpair,#tch-root .tch-comparison{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin:12px 0}#tch-root .tch-fitpair>div,#tch-root .tch-comparison>div{background:#1b3346;border:1px solid #3d6473;border-radius:10px;padding:11px;min-width:0}#tch-root .tch-fitpair small,#tch-root .tch-comparison span{display:block;font-size:11px;color:#bed6e4}#tch-root .tch-fitpair strong,#tch-root .tch-comparison strong{display:block;font-size:23px;color:#73eacb;overflow-wrap:anywhere}#tch-root .tch-linkhint{font-size:12px;color:#7cedd2;display:block;margin-top:6px}#tch-root .tch-simrow{display:flex;gap:12px;align-items:center;justify-content:space-between;border-bottom:1px solid #426279;padding:13px 0}#tch-root .tch-simrow>button{background:transparent;text-align:left;flex:1;min-width:0;border:0;padding:7px;font-size:13px}#tch-root .tch-simrow>div{flex:2;min-width:0}#tch-root .tch-simrow select{width:100%}#tch-root .tch-fitcaption{display:block;color:#cbdfe8;font-size:11px}#tch-root .tch-change{padding:11px 0;border-bottom:1px solid #45677b;display:flex;flex-wrap:wrap;gap:7px;align-items:center}#tch-root .tch-change strong{flex:1;min-width:100px}#tch-root .tch-change span{font-size:12px;color:#c5dce6}#tch-root .tch-change b{white-space:nowrap}#tch-root .tch-roleline{display:flex;justify-content:space-between;gap:8px;padding:11px 0;border-bottom:1px solid #44677e}#tch-root .tch-roleline span{color:#cfe0e9}#tch-root .tch-requirement{margin:12px 0}#tch-root .tch-requirement>div:first-child{display:flex;justify-content:space-between;gap:8px;font-size:12px}#tch-root .tch-requirement small{color:#c5dce8}#tch-root .tch-fitbar{height:9px;border-radius:20px;background:#365269;overflow:hidden;margin-top:6px}#tch-root .tch-fitbar b{display:block;height:100%;background:#55e9c9;border-radius:20px}#tch-root.theme-light .tch-metric.tch-clickable,#tch-root.theme-light .tch-fitpair>div,#tch-root.theme-light .tch-comparison>div{background:#fff;color:#183448;border-color:#b7cedb}#tch-root.theme-light .tch-person-button{color:#183448}#tch-root.theme-light .tch-fitpair strong,#tch-root.theme-light .tch-comparison strong{color:#056b64}#tch-root.theme-light .tch-fitpair small,#tch-root.theme-light .tch-comparison span{color:#33586f}#tch-root.theme-light .tch-hero.tch-hero-button{color:#173d43}#tch-root.theme-light .tch-roleline span,#tch-root.theme-light .tch-change span{color:#28485a}";
  style.textContent += "#tch-root .tch-insight{display:grid;grid-template-columns:1fr auto;gap:5px 12px;width:100%;text-align:left;border:1px solid #4d6b7d;border-radius:12px;background:#294254;color:#f6fafb;padding:14px;margin:8px 0}#tch-root .tch-insight strong,#tch-root .tch-insight small{grid-column:1}#tch-root .tch-insight small{color:#cce0e9;font-size:12px}#tch-root .tch-insight span{grid-column:2;grid-row:1/3;font-size:20px;color:#74efdc;align-self:center}#tch-root.theme-light .tch-insight{background:#f3f8fc;color:#153649}#tch-root.theme-light .tch-insight small{color:#35586b}";
  style.textContent+="#tch-root .tch-taprow{position:relative;width:100%;display:flex;align-items:center;justify-content:space-between;text-align:left;background:transparent;border:0;padding:13px 4px}#tch-root .tch-taprow .tch-tilearrow{position:static;margin-left:8px}#tch-root.theme-light .tch-taprow{background:transparent;color:#15394c}";
  style.textContent += "#tch-open{display:none!important}#tch-root:not(.theme-light){background:#08192d!important;color:#e7f2ff!important}#tch-root:not(.theme-light) header,#tch-root:not(.theme-light) .tch-top{background:linear-gradient(120deg,#0c3358,#0b203b)!important;border-color:#28506e!important}#tch-root:not(.theme-light) .tch-bottom,#tch-root:not(.theme-light) .nav{background:#0b223b!important;border-color:#284b6b!important}#tch-root:not(.theme-light) .card,#tch-root:not(.theme-light) .tch-panel,#tch-root:not(.theme-light) .tch-person,#tch-root:not(.theme-light) .tch-wagerow,#tch-root:not(.theme-light) .tch-wage-risk{background:#0d2945!important;border:1px solid #284b6b!important;border-radius:12px!important;box-shadow:none!important}#tch-root:not(.theme-light) .tch-hero{background:linear-gradient(130deg,#103d61,#0c2945)!important;border-color:#3f7ea6!important}#tch-root:not(.theme-light) .tch-metric,#tch-root:not(.theme-light) .tch-radar>div{background:#102844!important;border-color:#294661!important}#tch-root:not(.theme-light) .tch-eyebrow,#tch-root:not(.theme-light) .tch-kicker{color:#75ddff!important}#tch-root:not(.theme-light) button.primary,#tch-root:not(.theme-light) button.active{background:#1c5080!important;border-color:#67c7ff!important}#tch-root:not(.theme-light) button{border-radius:9px;border-color:#356181;color:#edf7ff}#tch-root:not(.theme-light) input,#tch-root:not(.theme-light) select,#tch-root:not(.theme-light) textarea{background:#061b31;border-color:#325c79;color:#fff}#tch-root:not(.theme-light) .tch-bottom{padding-bottom:calc(4px + env(safe-area-inset-bottom))!important}#tch-root:not(.theme-light) .tch-bottom button{font-size:10px!important;height:40px!important;min-height:40px!important}";
  style.textContent += "#tch-open{display:none!important}#tch-root[hidden]{display:none!important}#tch-root:not([hidden]){position:fixed!important;inset:0!important;display:flex!important;align-items:flex-end!important;justify-content:center!important;background:#020a17c7!important;z-index:2147483646!important;overflow:hidden!important;padding:0!important;color:#e7f2ff!important;font:14px/1.45 system-ui,-apple-system,Segoe UI,sans-serif!important}#tch-root .tch-staxx-panel{display:flex!important;flex-direction:column!important;flex:0 1 auto!important;width:min(650px,100vw)!important;height:min(93dvh,900px)!important;min-height:0!important;background:#08192d!important;border:1px solid #28506e!important;border-bottom:0!important;border-radius:19px 19px 0 0!important;overflow:hidden!important;box-shadow:0 0 45px #000c!important;position:relative!important}#tch-root .tch-staxx-panel *{box-sizing:border-box}#tch-root .tch-staxx-panel .tch-top{position:static!important;display:flex!important;flex-shrink:0!important;min-height:66px!important;padding:12px 15px!important;background:linear-gradient(120deg,#0c3358,#0b203b)!important;border:0!important;border-bottom:1px solid #28506e!important;box-shadow:none!important}#tch-root .tch-staxx-panel .tch-headline strong{font-size:18px!important;letter-spacing:-.2px!important;color:#f0faff!important}#tch-root .tch-staxx-panel .tch-eyebrow{color:#75ddff!important;font-size:10px!important}#tch-root .tch-staxx-panel .tch-timestamp{color:#8fb1cf!important;font-size:10px!important}#tch-root .tch-staxx-panel .tch-top button{min-height:34px!important;width:36px!important;padding:4px!important;background:#1c3b59!important;border:1px solid #365d78!important;color:#fff!important}#tch-root .tch-staxx-panel .tch-bottom{position:static!important;inset:auto!important;flex-shrink:0!important;order:0!important;width:100%!important;display:flex!important;grid-template-columns:none!important;gap:5px!important;overflow-x:auto!important;overflow-y:hidden!important;scrollbar-width:none!important;padding:7px 8px!important;background:#0b223b!important;border:0!important;border-bottom:1px solid #284b6b!important;box-shadow:none!important}#tch-root .tch-staxx-panel .tch-bottom button{height:42px!important;min-height:42px!important;min-width:60px!important;flex:1 0 60px!important;display:flex!important;flex-direction:row!important;gap:4px!important;padding:5px 6px!important;border:1px solid transparent!important;background:transparent!important;border-radius:8px!important;color:#97b5ce!important;font-size:11px!important;font-weight:650!important;line-height:1!important}#tch-root .tch-staxx-panel .tch-bottom button.active{background:#1c5080!important;border:1px solid #579ed4!important;color:#fff!important}#tch-root .tch-staxx-panel .tch-bottom .tch-navicon{font-size:14px!important;color:inherit!important}#tch-root .tch-staxx-panel .tch-main{position:static!important;flex:1 1 auto!important;order:1!important;min-height:0!important;min-width:0!important;max-width:none!important;width:100%!important;overflow-y:auto!important;overflow-x:hidden!important;overscroll-behavior:contain!important;padding:13px 13px 28px!important;margin:0!important;background:#08192d!important}#tch-root .tch-staxx-panel .tch-homehead,#tch-root .tch-staxx-panel .tch-hero{background:linear-gradient(130deg,#103d61,#0c2945)!important;border:1px solid #3f7ea6!important;border-radius:12px!important}#tch-root .tch-staxx-panel .card,#tch-root .tch-staxx-panel .tch-panel,#tch-root .tch-staxx-panel .tch-person,#tch-root .tch-staxx-panel .tch-wagerow,#tch-root .tch-staxx-panel .tch-wage-risk,#tch-root .tch-staxx-panel .tch-stockrow{background:#0d2945!important;border:1px solid #284b6b!important;border-radius:12px!important;box-shadow:none!important}#tch-root .tch-staxx-panel .tch-metric,#tch-root .tch-staxx-panel .tch-radar>div,#tch-root .tch-staxx-panel .tch-homekpis .tch-metric{background:#102844!important;border:1px solid #294661!important;border-radius:11px!important}#tch-root .tch-staxx-panel .tch-metric strong,#tch-root .tch-staxx-panel .tch-home-number{color:#f0f8ff!important}#tch-root .tch-staxx-panel .tch-mini,#tch-root .tch-staxx-panel .tch-kicker{color:#8fdbff!important}#tch-root .tch-staxx-panel .tch-main button.primary,#tch-root .tch-staxx-panel .tch-main button.active{background:#0879bd!important;border:1px solid #4db8ec!important;color:#fff!important}#tch-root .tch-staxx-panel .tch-main button{border-radius:9px!important}#tch-root .tch-staxx-panel .tch-main input,#tch-root .tch-staxx-panel .tch-main select,#tch-root .tch-staxx-panel .tch-main textarea{background:#061b31!important;border:1px solid #325c79!important;color:#fff!important;border-radius:8px!important}#tch-root .tch-staxx-panel p,#tch-root .tch-staxx-panel .muted,#tch-root .tch-staxx-panel .tch-hint{color:#aac3d9!important}#tch-root .tch-staxx-panel .good{color:#49e2ad!important}#tch-root .tch-staxx-panel .bad{color:#ff8c9b!important}#tch-root .tch-staxx-panel .tch-main .scroll{max-width:100%;overflow-x:auto!important}@media(min-width:800px){#tch-root:not([hidden]){align-items:center!important}#tch-root .tch-staxx-panel{height:min(85vh,880px)!important;border-radius:18px!important;border-bottom:1px solid #28506e!important}}@media(max-width:390px){#tch-root .tch-staxx-panel .tch-bottom button{font-size:10px!important;flex-basis:52px!important;min-width:52px!important;padding:5px 3px!important}#tch-root .tch-staxx-panel .tch-bottom .tch-navicon{font-size:12px!important}}";
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
      '<div class="card"><h3>Dedicated custom API key</h3><p>Key is used only for GET requests to api.torn.com through Torn PDA. It stays in memory for this session; it is never saved, exported, published, logged or sent elsewhere.</p><label>Custom API key</label><input id="tch-key" type="password" autocomplete="off" placeholder="'+(key?"Key loaded for this session":"Paste key")+'"><button data-act="use-key">Use key this session</button><p class="muted">Suggested API selections: company/profile, company/employees, company/news, torn/companies. company/stock is needed only for companies with product inventory; Fitness Centers do not require it. For payment-history import, grant only incoming-money user/log types; the script detects their IDs when importing. Treat such keys as highly sensitive.</p></div>'+
      '<div class="card"><h3>Payment imports</h3><p>There is no money-log filter to configure. Open Training and tap Import older payments or Rescan recent payments. The script detects the incoming-money types itself, matches identifiable employees and amounts, and asks you only about unclear records.</p><p class="muted">Your dedicated Torn API key must permit the relevant personal user/log types. Only manual taps cause API reads; no money is ever moved.</p><p class="muted">Detected incoming log types: '+esc(c?c.logTypes||"Not loaded yet":"Not loaded yet")+'</p></div>'+
      '<div class="card"><h3>Financial guardrail</h3><label>Maximum daily operating loss ($)</label><input id="tch-limit" type="number" min="0" step="50000" value="'+esc(c?c.lossLimit:500000)+'"><button data-act="save-limit">Save limit</button></div>'+
      '<div class="card"><h3>Local backups</h3><p>Export contains actual company and employee records. Keep the file private. It contains no API key.</p><button data-act="backup">Export JSON backup</button><label>Restore a backup (replaces all local company records)</label><textarea id="tch-restore" rows="3" placeholder="Paste a previously exported JSON backup here"></textarea><button data-act="restore">Restore backup</button></div>'+
      '<div class="card"><h3>Safety contract</h3><p>Read-only Torn API GET requests automatically refresh company intelligence on a foreground Torn page while the company helper is open or StaxxHub requests data, with 15-minute backoff. No gameplay interactions, money transfers, staff changes or background scraping. All scenario and ledger buttons change local records only.</p><p class="muted">Author: IamEEKY · Repository: Torn-Company-Helper</p></div>';
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

  let companyTabsExpanded=false;
  const simpleCompanyTabs=new Set(['overview','alerts','employees','training']);
  function tabsV2(){
    const tabs=[["overview","⌂","Today"],["alerts","!","Alerts"],["employees","♟","Staff"],["training","◇","Trains"],["growth","▥","Growth"],["stock","▣",["service","no-products"].includes(stockModeV117(current()))?"Services":"Stock"]];
    let simpleMode=true;try{simpleMode=JSON.parse(localStorage.getItem('staxx-hub-mode-v1')||'"simple"')!=='advanced';}catch(_){}
    const visibleTabs=(!simpleMode||companyTabsExpanded)?tabs:tabs.filter(x=>simpleCompanyTabs.has(x[0])||x[0]===tab);
    return '<nav class="tch-bottom" aria-label="Company Helper sections">'+visibleTabs.map(function(x){
      return '<button data-act="tab" data-tab="'+x[0]+'" class="'+(tab===x[0]?"active":"")+'"><span class="tch-navicon">'+x[1]+'</span><span>'+x[2]+'</span></button>';
    }).join("")+(simpleMode?'<button data-act="staxx-more-tabs" aria-expanded="'+companyTabsExpanded+'" aria-label="'+(companyTabsExpanded?'Show fewer sections':'Show all sections')+'"><span class="tch-navicon">⋯</span><span>'+(companyTabsExpanded?'Less':'More')+'</span></button>':'')+'</nav>';
  }
  function headV2(c) {
    const title=tab==="overview"?"Today":tab==="alerts"?"Alerts":tab==="employees"?"Staff":tab==="training"?"Training":tab==="growth"?"Growth":tab==="stock"?(["service","no-products"].includes(stockModeV117(c))?"Services":"Stock"):tab==="diagnostics"?"Diagnostics":"Settings";
    const date=c && c.lastRefresh?new Date(c.lastRefresh).toLocaleString():"Not synced";
    return '<header class="tch-top"><div class="tch-headline"><div class="tch-eyebrow">COMPANY HELPER · v1.25.2</div><strong>'+title+'</strong><div class="tch-timestamp">'+esc(date)+' · Read only</div></div>'+
      '<div class="actions"><button data-act="staxx-find" class="tch-iconbtn" aria-label="Find tools, sections and actions" title="Find in Staxx">⌕</button><button data-act="tab" data-tab="alerts" class="tch-iconbtn" aria-label="View alerts">! '+launcherAlertsV11(c).count+'</button><button data-act="refresh" class="tch-iconbtn" aria-label="Refresh data" '+(busy?"disabled":"")+'>↻</button>'+
      '<button data-act="tab" data-tab="settings" class="tch-iconbtn" aria-label="Settings">⚙</button><button data-act="close" class="tch-iconbtn" aria-label="Close dashboard">×</button></div></header>';
  }
  function metricV2(title,value,secondary,tone,target){
    const inner='<span class="muted">'+esc(title)+'</span><strong>'+esc(value)+'</strong>'+
      (secondary?'<small>'+esc(secondary)+'</small>':'')+(target?'<span class="tch-tilearrow" aria-hidden="true">↗</span>':"");
    if(target)return '<button type="button" data-act="goto" data-target="'+esc(target)+'" class="tch-metric tch-clickable '+(tone||"")+
      '" aria-label="'+esc(title)+': '+esc(value)+' — view details">'+inner+'</button>';
    return '<button type="button" data-act="metric-detail" data-target="'+esc(target||"growth") +'" class="tch-metric '+(tone||"")+'">'+inner+'</button>';
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
    return '<button type="button" data-act="goto" data-target="growth-performance" class="tch-hero tch-clickable tch-hero-button"><div class="tch-kicker">YOUR '+esc(String(c.profile.type?.name||"COMPANY").toUpperCase())+' · TAP FOR GROWTH DETAILS</div>'+
      '<div class="tch-hero-line"><strong>'+esc(c.profile.name||"Company")+'</strong><span class="tch-rating">'+esc(c.profile.rating)+' ★</span></div>'+
      '<div class="tch-progress"><b style="width:'+Math.min(100,Math.max(0,num(c.profile.rating)*10))+'%"></b></div>'+
      '<small>10-star ambition · Max daily operating loss '+esc(money(c.lossLimit))+'</small></button>'+
      '<div class="tch-metrics">'+
      metricV2("Estimated daily P/L",a.known?money(a.profit):"Incomplete",a.known?(lossBreach?"Loss limit breached":"Based on current costs"):"Missing expense data",lossBreach?"tch-danger":a.known?"tch-positive":"","growth-accounts")+
      metricV2("Outstanding trains",owed.toLocaleString(),due+" employee account(s)","","training-queue")+
      metricV2("Trains available",c.profile.trains==null?"—":c.profile.trains,"Company stockpile","","training-queue")+
      metricV2("Employees",c.staff.length+" / "+num(c.profile.employees&&c.profile.employees.capacity),"Current roster","","staff")+'</div>'+
      actionPanelV3(c)+radarPanelV3(c)+starGrowthPanelV11(c)+
      '<section class="tch-panel"><h2>Quick actions</h2><div class="tch-actiongrid">'+
      '<button data-act="tab" data-tab="training">Check training queue<span>Paid and outstanding</span></button>'+
      '<button data-act="tab" data-tab="employees">Optimise staff<span>Suggested roles</span></button>'+
      '<button data-act="tab" data-tab="growth">Company performance<span>Costs and membership</span></button>'+
      '<button data-act="tab" data-tab="stock">'+(["service","no-products"].includes(stockModeV117(c))?"Service performance<span>Members & revenue</span>":"Stock priorities<span>Runout and orders</span>")+"</button>"+
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
      {action:"staff-view",id:"simulator",name:"Team simulator",active:staffView==="simulator"},
      {action:"staff-view",id:"wages",name:"Wage helper",active:staffView==="wages"}
    ];
    if(staffView==="wages")return '<div class="tch-section"><h2>Wages & contribution</h2>'+buttonsV2("Staff view",options)+'</div>'+wageScenarioPanelV14(c)+compactWagePanelV13(c)+
      '<details class="tch-advanced"><summary>Detailed HR values, wage bands & scenarios</summary>'+wagesPanelV11(c)+wageRiskPanelV12(c)+'</details>';
    if(staffView==="simulator")return '<div class="tch-section"><h2>Staff optimiser</h2><p>Explore alternative staffing plans before making decisions.</p>'+buttonsV2("Staff view",options)+'</div>'+wageScenarioPanelV14(c)+scenarioV2(c);
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
      developmentPanelV14(c)+'<section class="tch-panel"><div class="tch-sectionhead"><h2>Current team</h2><span class="tch-mini">'+c.staff.length+' employees</span></div>'+
      '<div class="tch-comparison"><div><span>Average role fit</span><strong>'+fitText(sc.averageBefore)+'</strong></div>'+
      '<div><span>Team changes tested</span><strong>'+sc.changeCount+'</strong></div></div>'+
      (sc.count<c.staff.length?'<p class="tch-hint">Only '+sc.count+' staff have comparable role requirements and stats.</p>':"")+
      '<button data-act="staff-view" data-view="simulator">Open team simulator →</button></section>'+balancedPanelV3(c)+applicantPanelV3(c)+
      replacementPanelV12(c)+'<div class="tch-list">'+people.map(function(r){
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
        '<p>Paid purchases include directly confirmed receipts and labelled, inferred exact-price transfers. Ineligible employees are skipped until their first 72 hours pass. Training credits offset later purchases.</p>'+
        (due.length?due.map(function(e){
          const id=e[0],p=c.staff.find(function(x){return String(x.id)===id;}),locked=p&&num(p.days_in_company)<3;
          return '<button type="button" data-act="employee-detail" data-id="'+esc(id)+'" class="tch-queueitem tch-taprow"><div><strong>'+esc(people[id]||"#"+id)+'</strong><small>'+esc(e[1].oldest?day(e[1].oldest):"Historical opening balance")+(locked?" · Not yet eligible":"")+'</small></div><div><b>'+e[1].owed+'</b><small>owed</small></div><span class="tch-tilearrow">↗</span></button>';
        }).join(""):'<div class="tch-empty">Nobody has confirmed outstanding paid training.</div>')+
        '</section>'+trainPacePanelV3(c)+'<section class="tch-panel"><h2>Record a completed train</h2><p>Use this for a train not already imported from company history.</p>'+
        '<div class="tch-fieldrow"><select id="tch-train-person">'+opts+'</select><input aria-label="Number of trains" id="tch-train-units" type="number" min="1" max="20" value="1">'+
        '<button class="primary" data-act="add-training">Record</button></div></section>';
    } else if(trainingView==="payments"){
      body='<section class="tch-panel"><h2>Money receipts & purchased trains</h2>'+
         '<p>On opening, incoming logs are checked. New, exact-price transfers from identifiable employees are locally credited as likely training purchases. Review Records and void any mistaken credit. Other transfers still require approval.</p>'+
         '<div class="tch-actionrow"><button data-act="toggle-auto-package" class="'+(c.autoPackageMode!==false?"primary":"")+'">Auto-credit new packages: '+(c.autoPackageMode!==false?"ON":"OFF")+'</button>'+
         '<button data-act="backfill-packages">Review & credit old matches</button></div>'+
         (c.moneySyncError?'<p class="tch-hint">Recent money-log sync could not complete: '+esc(c.moneySyncError)+'</p>':'')+
         (c.newsSyncError?'<p class="tch-hint">Recent training-history sync could not complete: '+esc(c.newsSyncError)+'</p>':'')+
        (c.logHistoryWarning?'<p class="tch-hint">'+esc(c.logHistoryWarning)+'</p>':"")+
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
        (c.newsHistoryWarning?'<p class="tch-hint">'+esc(c.newsHistoryWarning)+'</p>':"")+
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
      const logs=c.payments.map(function(p){return {id:p.id,ts:p.ts,type:"Payment",person:p.playerId,units:p.trains,money:p.amount,voided:p.voided,inferred:p.assumed,unverified:p.source==="log-auto"&&!p.voided};})
        .concat(c.training.map(function(t){return {id:t.id,ts:t.ts,type:"Training",person:t.playerId,units:t.units,money:null,voided:t.voided};}))
        .sort(function(a,b){return b.ts-a.ts;});
      body='<section class="tch-panel"><h2>Audit records</h2><p>Automatic package classifications are inferred, not guaranteed. Void a mistaken credit here. Duplicate Torn IDs cannot increase balances twice.</p>'+
        '<button data-act="repair-duplicates">Check duplicate imports</button>'+
        logs.slice(0,70).map(function(e){
          return '<div class="tch-record"><div><strong>'+esc(e.type)+(e.voided?" · VOID":e.unverified?" · NOT VERIFIED":e.inferred?" · INFERRED":"")+'</strong><small>'+esc(people[e.person]||"#"+e.person)+' · '+esc(day(e.ts))+'</small></div>'+
            '<div><b>'+esc(e.type==="Payment"?money(e.money):e.units+" trains")+'</b>'+
            (!e.voided?'<button data-act="void-entry" data-id="'+esc(e.id)+'">Void</button>':"")+'</div></div>';
        }).join("")+'</section>';
    }
    return '<div class="tch-section"><h2>Training ledger</h2><p>Paid commitments, automatic history matching and account corrections.</p>'+switches+'</div>'+body+(trainingView==="queue"?weekPanelV11(c):'');
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
      '</div><p class="tch-hint">Changing advertising can also change sales. The ceiling assumes unchanged income and wages.</p></section>'+cashPanelV3(c);
  }

  function growthV2(c){
    if(!c||!c.profile)return introV2();
    const a=accounting(c);
    const switches=buttonsV2("Growth views",[
      {action:"growth-view",id:"performance",name:"Overview",active:growthView==="performance"},
      {action:"growth-view",id:"pricing",name:"Pricing & ads",active:growthView==="pricing"},
      {action:"growth-view",id:"accounts",name:"Accounts",active:growthView==="accounts"},
      {action:"growth-view",id:"rivals",name:"Rivals",active:growthView==="rivals"},
      {action:"growth-view",id:"review",name:"Sunday review",active:growthView==="review"}]);
    return '<div class="tch-section"><h2>10-star growth</h2><p>Revenue improvement within your daily loss limit of '+esc(money(c.lossLimit))+'. Estimates are labelled.</p>'+switches+'</div>'+
      (growthView==="performance"?starMomentumPanelV14(c)+growthMovesPanelV13(c)+companyStressLabV115(c)+'<div class="tch-metrics">'+
         metricV2("Current rating",c.profile.rating+" / 10","Competitive star progression","","growth-performance")+
         metricV2("Daily revenue",money(a.revenue),"Reported by Torn","","growth-accounts")+
         metricV2("Wages",money(a.wages),"Current daily staff wages","","growth-accounts")+
         metricV2("Advertising",money(a.ad),"Current daily spend","","growth-pricing")+'</div>'+
         '<section class="tch-panel"><h2>Profit and growth</h2><div class="tch-highlight-number">'+esc(a.known?money(a.profit):"Incomplete")+'</div><p>Estimated operating P/L after current wages and advertising, excluding unknown costs.</p>'+
         '<div class="tch-priority '+(!a.known?"warning":a.headroom<0?"danger":"ok")+'"><span>'+(!a.known?"?":a.headroom<0?"!":"✓")+'</span><div><strong>'+esc(a.known?money(a.headroom):"Unknown")+' headroom</strong><small>'+(!a.known?"Financial inputs are incomplete; loss policy cannot be assessed.":"Relative to permitted −"+esc(money(c.lossLimit))+" daily operating result")+'</small></div></div></section>'+growthAdvisorV2(c):
      growthView==="pricing"?growth(c):growthView==="rivals"?rivalsPanelV11(c)+rivalRostersPanelV12(c):
      growthView==="review"?sundayPanelV12(c)+changeTrackingPanelV12(c):finances(c));
  }

  function safeCompanyDiagnosticsV111(c){
    const t=Date.parse(c?.lastRefresh||''),age=Number.isFinite(t)?Math.max(0,Math.floor((Date.now()-t)/60000)):null;
    return {tool:'Company Helper',version:'1.12.0',capturedAt:new Date().toISOString(),
      pdaStorage:typeof PDA_storage!=='undefined',pdaHttp:typeof PDA_httpGet==='function',
      apiKeyPresent:Boolean(activeApiKey()),companyDataLoaded:Boolean(c?.profile),
      lastRefreshMinutes:age,staffRecords:Array.isArray(c?.staff)?c.staff.length:0,
      dailySnapshots:Array.isArray(c?.snapshots)?c.snapshots.length:0,
      moneyImportAvailable:Boolean(c?.lastAutoSync?.money&&!c?.moneySyncError),newsImportAvailable:Boolean(c?.lastAutoSync?.news&&!c?.newsSyncError),
      pendingPaymentReviews:c?pendingPaymentLogs(c).length:0,
      uiOpen:open,busy};
  }
  function companyDiagnosticsPanelV111(c){
    const d=safeCompanyDiagnosticsV111(c);
    let html='<section class="tch-panel"><h2>Diagnostics · read-only connection checks</h2>'+
      '<p class="tch-hint">This safe report contains statuses and counts only: no API key, company ID, employee names, pay amounts or private ledger entries.</p>'+
      '<div class="tch-actionrow"><button class="primary" data-act="diag-check">Check tools</button>'+
      '<button data-act="diag-copy">Copy safe diagnostics</button><button data-act="tab" data-tab="settings">Back to Settings</button></div>';
    for(const [k,v] of Object.entries(d))html+='<div class="tch-roleline"><span>'+esc(k.replace(/([A-Z])/g," $1"))+'</span><b>'+esc(v===null?'Not available':v)+'</b></div>';
    return html+'<p class="tch-hint">If requests fail, confirm the TornPDA script key and its company/profile, company/employees and optional log permissions. Payment import failures do not prove your company data is lost. Use Refresh only on the company page.</p></section>';
  }

  function settingsV2(c){
    const native=hasPdaKey(), connected=Boolean(activeApiKey());
    return '<div class="tch-section"><h2>Connection & preferences</h2><p>Keep the technical settings separate from everyday decisions.</p><button data-act="tab" data-tab="diagnostics" class="primary">Open Diagnostics</button></div>'+
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

  let staxxCompanyPanelState=null,companyAlertFocus='';
  const companyScrollPositions=Object.create(null);
  let companyRenderedPage='';
  function focusCompanyAlert(){if(!companyAlertFocus)return;const el=root.querySelector('#tch-alert-'+companyAlertFocus);if(el)el.scrollIntoView?.({block:'nearest'});companyAlertFocus='';}
  function draw() {
    updateLauncherV11();
    opener.hidden=open || !isCompanyPage();
    root.hidden=!open;
    const visible=Boolean(open);
    if(staxxCompanyPanelState!==visible){
      staxxCompanyPanelState=visible;
      document.dispatchEvent?.(new CustomEvent('staxx:panel',{detail:{id:'company',open:visible}}));
    }
    if(!open)return;
    const pageKey=detailView?'detail:'+detailView:tab;
    const oldMain=root.querySelector?.('.tch-main'),oldFocused=document.activeElement;
    if(companyRenderedPage)companyScrollPositions[companyRenderedPage]={root:root.scrollTop,main:oldMain?.scrollTop||0};
    let savedForm=null;
    if(oldFocused&&root.contains?.(oldFocused)&&/^(INPUT|TEXTAREA|SELECT)$/.test(oldFocused.tagName)){
      const form=oldFocused.closest('form,.tch-panel');
      const values=form?[...form.querySelectorAll('input,select,textarea')].map(x=>({id:x.id,name:x.name,value:x.value,checked:x.type==='checkbox'?x.checked:null})):[];
      savedForm={id:oldFocused.id,name:oldFocused.name,values,page:companyRenderedPage};
    }
    const detailsOpen=[...(root.querySelectorAll?.('details[open]')||[])].map((x,i)=>x.id||String(i));
    try {
      const c=current();
      let body="";
      if(detailView)body=detailsV2(c);
      else if(tab==="overview")body=homeV13(c);
      else if(tab==="alerts")body=companyAlertsPanel(c);
      else if(tab==="employees")body=staffV2(c);
      else if(tab==="training")body=trainingV2(c);
      else if(tab==="growth")body=growthV2(c);
      else if(tab==="stock")body=stockV3(c);
      else if(tab==="settings")body=settingsV2(c);
      else if(tab==="diagnostics")body=companyDiagnosticsPanelV111(c);
      root.className=data.themeMode==="light"?"theme-light":"";
      root.innerHTML='<div class="tch-staxx-panel" role="dialog" aria-label="Company Helper">'+headV2(c)+tabsV2()+'<main class="tch-main">'+
        (message?'<div class="notice '+esc(severity)+'">'+esc(message)+'</div>':"")+
        (busy?'<div class="notice">Reading Torn API after your request…</div>':"")+body+'</main></div>';
      companyRenderedPage=pageKey;
      const newMain=root.querySelector?.('.tch-main');
      const pos=companyScrollPositions[pageKey];
      root.scrollTop=pos?.root||0;
      if(newMain)newMain.scrollTop=pos?.main||0;
      if(savedForm?.page===pageKey){
        for(const row of savedForm.values){
          const field=[...(root.querySelectorAll?.('input,select,textarea')||[])].find(x=>row.id?x.id===row.id:x.name===row.name);
          if(field){field.value=row.value;if(row.checked!==null)field.checked=row.checked;}
        }
        const focus=[...(root.querySelectorAll?.('input,select,textarea')||[])].find(x=>savedForm.id?x.id===savedForm.id:x.name===savedForm.name);
        if(focus)focus.focus({preventScroll:true});
      }
      for(const [i,detail] of [...(root.querySelectorAll?.('details')||[])].entries())if(detailsOpen.includes(detail.id||String(i)))detail.open=true;
    } catch (error) {
      // Render a usable, non-destructive fallback instead of a blank screen.
      // Never clear or reset local storage in response to a rendering error.
      const reason=error && error.message?String(error.message):"Unknown rendering error";
      console.error("[Torn Company Helper] Dashboard render error:",reason);
      root.className=data.themeMode==="light"?"theme-light":"";
      root.innerHTML='<div class="tch-staxx-panel" role="dialog" aria-label="Company Helper"><header class="tch-top"><div class="tch-headline"><strong>Company Helper</strong><small>Display recovery</small></div>'+
        '<div class="actions"><button type="button" data-act="close" class="tch-iconbtn" aria-label="Close dashboard">×</button></div></header>'+
        '<main class="tch-main"><section class="tch-panel" role="alert"><h2>Dashboard could not render</h2>'+
        '<p>Your locally saved company records have not been cleared. This is a display issue.</p>'+
        '<p class="tch-hint">Error: '+esc(reason)+'</p><div class="tch-actionrow">'+
        '<button type="button" data-act="tab" data-tab="settings">Open Settings</button>'+
        '<button type="button" data-act="close">Close dashboard</button></div></section></main></div>';
    }
  }
  function notify(s,level) {message=s;severity=level || "";draw();}
  async function work(task) {
    if (busy) return;
    busy=true;message="";severity="";draw();
    try {await task();if(!message)message="Completed.";if(!severity)severity="good";}
    catch (e) {message=String(e && e.message || e);severity="bad";}
    finally {busy=false;draw();}
  }

  // An official Torn continuation token permits one extra historical page per normal refresh.
  // Older transfers get matching suggestions, never forced training allocations.
  async function autoHistoryBackfillV116(c){
    if(!c||!c.profile)return;
    const now=Date.now(),last=Number(c.autoHistoryLastAttemptV116)||0;
    if(last&&now-last<15*60000)return;
    const modes=c.autoHistoryNextV116==="money"?["money","news"]:["news","money"];
    for(const mode of modes){
      const isNews=mode==="news";
      const cursor=isNews?c.newsNext:c.logNext;
      const paused=isNews?c.newsHistoryWarning:c.logHistoryWarning;
      const done=isNews?c.autoNewsHistoryDoneV116:c.autoMoneyHistoryDoneV116;
      if(!cursor||paused||done)continue;
      const path=isNews?"company/news":"user/log";
      const filter=isNews?"training":String(c.logTypes||"");
      if(!isNews&&!/^\\d+(,\\d+){0,9}$/.test(filter))continue;
      const params=isNews?{cat:"training",limit:"100",sort:"DESC"}:{log:filter,limit:"100",sort:"DESC"};
      Object.assign(params,cursor);
      c.autoHistoryLastAttemptV116=now; // Persisted even on errors, preventing rapid retries after reload.
      c.autoHistoryNextV116=isNews?"money":"news";
      try{
        const response=await read(path,params);
        const list=isNews?normaliseNewsResponse(response.news):Array.isArray(response.log)?response.log:Object.entries(response.log||{}).map(function(pair){return Object.assign({id:pair[0]},pair[1]);});
        const decision=importPageDecision(response,path,filter,list);
        if(decision.warning){
          if(isNews)c.newsHistoryWarning=decision.warning;
          else c.logHistoryWarning=decision.warning;
          break;
        }
        if(isNews)mergeTrainingNewsV13(c,response);
        else mergeIncomingLogsV13(c,response);
        if(isNews){c.newsNext=decision.next;if(!decision.next)c.autoNewsHistoryDoneV116=true;}
        else {c.logNext=decision.next;if(!decision.next)c.autoMoneyHistoryDoneV116=true;}
        c.autoHistoryLastSuccessV116=now;
      }catch(error){
        c.autoHistoryLastErrorV116=String(error?.message||error).slice(0,180);
      }
      break; // One extra page maximum, not an uncontrolled API crawl.
    }
  }

  let lastAutoCompanyAttemptV112=0;
  async function autoCompanyRefreshV112(allowAnyPage=false){
    // A TornPDA tool may safely keep its read-only company data current from any visible Torn page.
    if(document.hidden||busy||typeof PDA_storage==="undefined")return;
    if(!activeApiKey())return; // Missing permissions remain visible in Settings; no blind retries.
    const last=Date.parse(current()?.lastRefresh||"");
    const now=Date.now();
    if(Number.isFinite(last)&&now-last<15*60000)return;
    if(now-lastAutoCompanyAttemptV112<15*60000)return; // Back off even on API failure.
    lastAutoCompanyAttemptV112=now;
    await refresh(); // Already syncs training news and incoming money with de-duplication.
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
      if(c.autoCreditSince===undefined)c.autoCreditSince=stamp(); // Never auto-reclassify old transfers.
      const e=await read("company/employees");
      let st=null;
      // The just-fetched company profile is authoritative even when the
      // saved profile or one obsolete stock row still describes another model.
      const liveMode=stockModeV117({...c,profile:p});
      if(liveMode==='service'||liveMode==='no-products'){
        reconcileStocklessCompanyV119(c,p);
      }else{
        try{
          st=await read("company/stock");
          if(!Array.isArray(st?.stock))throw Error("Stock response did not contain a valid stock list");
          c.stock=st.stock;c.stockModeV117=st.stock.length?'products':'no-products';
          c.stockFetchError=null;
        }catch(e){c.stockFetchError=String(e.message||e);}
      }
      try {const a=await read("company/applications");c.applications=assertArray(a.applications);c.applicationsError=null;}catch(e){c.applicationsError=String(e.message||e);}
      const staff=assertArray(e.employees);
      if (!staff.length && num(p.employees && p.employees.hired)>0) throw Error("Employee data unavailable; check director permissions.");
      c.staff=staff;
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
      c.snapshots.push({observedAt:c.lastRefresh,revenue:a.revenue,wages:a.wages,ad:a.ad,profit:a.profit,complete:a.known,rating:p.rating,
        efficiency:p.efficiency,environment:p.environment,popularity:p.popularity,
        weekly:valueOfMetricV12(p.income,"weekly"),customers:p.customers && p.customers.daily,price:c.stock[0] && c.stock[0].price,stock:(c.stock||[]).map(function(x){return {id:x.id,sold_amount:x.sold_amount,price:x.price};}),
        roster:Object.fromEntries(c.staff.map(function(e){return [String(e.id),{
          position:e.position&&e.position.name||null,effectiveness:e.effectiveness&&e.effectiveness.total!=null?Number(e.effectiveness.total):null,
          wage:typeof e.wage==='number'&&Number.isFinite(e.wage)?e.wage:null,
          stats:{manual_labor:e.stats&&e.stats.manual_labor,intelligence:e.stats&&e.stats.intelligence,endurance:e.stats&&e.stats.endurance}
        }];}))});
      if (c.snapshots.length>700) c.snapshots=c.snapshots.slice(-700);
      let newsResult=null,moneyResult=null;
      try {newsResult=await syncRecentNewsV13(c);c.newsSyncError=null;}
      catch(err){c.newsSyncError=String(err&&err.message||err);}
      try {moneyResult=await syncRecentMoneyV13(c);c.moneySyncError=null;}
      catch(err){c.moneySyncError=String(err&&err.message||err);}
      if(newsResult||moneyResult)await autoHistoryBackfillV116(c);
      c.lastAutoSync={news:newsResult,money:moneyResult,observedAt:c.lastRefresh};
      message="Company and roster updated."+(stockModeV117(c)==="service"?" No stock required for this service company.":"")+
        (newsResult?" Matched "+newsResult.matched+" new training entries.":" Training history unavailable.")+
        (moneyResult?" Auto-credited "+moneyResult.trains+" trains from "+moneyResult.credited+" new receipt(s).":" Payment logs unavailable.");
      severity=(!newsResult||!moneyResult)?"warn":"good";
      await persist();
    });
  }
  async function importNews(newest) {
    await work(async function () {
      const c=current();
      if (!c || !c.profile) throw Error("Refresh company profile first.");
      const params={cat:"training",limit:"100",sort:"DESC"};
      if(!newest) {
        if(c.newsNext) Object.assign(params,c.newsNext);
        else if(c.newsCursor!=null) params.to=String(c.newsCursor);
      }
      const response=await read("company/news",params);
      const list=normaliseNewsResponse(response.news);
      if (!list.length) {
        if(!newest){c.newsNext=null;c.newsHistoryWarning=null;await persist();}
        message="No further training news available.";return;
      }
      const page=newest?{next:null,warning:null}:importPageDecision(response,"company/news","training",list);
      let added=0,minTs=Infinity;
      list.forEach(function (n) {
        if (!n || !n.id || !Number.isFinite(Number(n.timestamp))) return;
        minTs=Math.min(minTs,num(n.timestamp));
        if (c.news.some(function (x) {return String(x.id)===String(n.id);})) return;
        c.news.push({id:String(n.id),timestamp:num(n.timestamp),text:String(n.text || "").slice(0,700)});
        added++;
      });
      if(!newest){
        if(added===0 && list.length>=100)c.newsHistoryWarning="This full training-news page contained no new IDs. The API continuation may be repeating; history has NOT advanced.";
        else if(page.warning){c.newsHistoryWarning=page.warning;}
        else {c.newsNext=page.next;c.newsHistoryWarning=null;if(!page.next && Number.isFinite(minTs))c.newsCursor=minTs-1;}
      }
      const fixed=repairImportDuplicates(c);
      const summary=reconcileTraining(c);
      await persist();
      message="Imported "+added+" new history entries, matched "+summary.matched+" training records; "+summary.review+" need review. "+fixed+" repeated historical entries repaired."+(c.newsHistoryWarning && !newest?" "+c.newsHistoryWarning:"");
      if(c.newsHistoryWarning && !newest)severity="bad";
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
        if(selected!==c.logTypes){c.logTypes=selected;c.logCursor=null;c.logNext=null;}
        c.incomingTypesVerified=true;
      }
      if(!/^\d+(,\d+){0,9}$/.test(c.logTypes))throw Error("Payment type settings are invalid.");
      const params={log:c.logTypes,limit:"100",sort:"DESC"};
      if(!newest) {
        if(c.logNext)Object.assign(params,c.logNext);
        else if(c.logCursor!=null)params.to=String(c.logCursor);
      }
      const response=await read("user/log",params);
      const list=Array.isArray(response.log)?response.log:Object.entries(response.log||{}).map(function(pair){
        return Object.assign({id:pair[0]},pair[1]);
      });
      if(!list.length){
        if(!newest){c.logNext=null;c.logHistoryWarning=null;await persist();}
        message="No further incoming transfers available.";return;
      }
      const page=newest?{next:null,warning:null}:importPageDecision(response,"user/log",c.logTypes,list);
      let added=0,updated=0,minTs=Infinity;
      const newIds=new Set();
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
        newIds.add(entryId);added++;
      });
      if(!newest){
        if(added===0 && list.length>=100)c.logHistoryWarning="This full money-log page contained no new IDs. The API continuation may be repeating; history has NOT advanced.";
        else if(page.warning){c.logHistoryWarning=page.warning;}
        else {c.logNext=page.next;c.logHistoryWarning=null;if(!page.next && Number.isFinite(minTs))c.logCursor=minTs-1;}
      }
      const duplicates=repairImportDuplicates(c);
      const credits=autoCreditPurchasesV13(c,newIds);
      const classified=applyMatchedPayments(c);
      await persist();
      message="Imported "+added+" incoming transfers; auto-credited "+credits.trains+" trains from "+credits.credited+" exact-price new receipt(s). "+classified.suggested+" have suggestions, "+
        classified.review+" require review. Updated "+updated+" older entries."+(c.logHistoryWarning && !newest?" "+c.logHistoryWarning:"");
      if(c.logHistoryWarning && !newest)severity="bad";
    });
  }


  async function scanRivalRostersV12(){
    return work(async function(){
      const c=current();
      if(!c||!c.profile)throw Error("Refresh company first.");
      const ownRating=Number(c.profile.rating)||0;
      const candidates=peerModelV11(c).rows.filter(function(x){return x.rating>=ownRating&&x.id!==Number(c.profile.id);});
      const next=candidates.filter(function(x){return x.rating===Math.min(10,ownRating+1);});
      const same=candidates.filter(function(x){return x.rating===ownRating;});
      const leaders=candidates.filter(function(x){return x.rating===10;});
      const peers=(next.length?next:same.length?same:leaders).sort(function(a,b){return b.weekly-a.weekly;}).slice(0,5);
      if(!peers.length)throw Error("Scan public rivals first. No same-star, next-star or ten-star company layouts found.");
      const rows=[],errors=[];
      for(const p of peers){
        try {
          const raw=await read("company/"+p.id+"/employees");
          const employees=Array.isArray(raw.employees)?raw.employees:
            raw.employees&&typeof raw.employees==="object"?Object.values(raw.employees):[];
          const counts=positionCountsV12(employees);
          if(!Object.keys(counts).length){errors.push("No public positions for "+p.name);continue;}
          rows.push({id:p.id,name:p.name,rating:p.rating,weekly:p.weekly,
            counts:counts,total:Object.values(counts).reduce(function(t,n){return t+n;},0)});
        }catch(e){errors.push("Could not read "+p.name);}
      }
      if(!rows.length)throw Error("Torn provided no usable public role layouts. Public employee permissions may differ.");
      c.rivalTeams={rows:rows,observedAt:new Date().toISOString(),failures:errors.length};
      await persist();
      message="Read "+rows.length+" comparable rival role layouts; "+errors.length+" unavailable. Counts only; no private employee data saved.";
    });
  }
  async function scanPeersV11(){
    return work(async function(){
      const c=current(),type=c&&c.profile&&Number(c.profile.type&&c.profile.type.id);
      if(!Number.isSafeInteger(type)||type<=0)throw Error("Refresh the company type before scanning competitors.");
      const rows=[],ids=new Set();let total=null,complete=false,pages=0;
      for(let offset=0;offset<500;offset+=100){
        const page=await read("company/"+type+"/companies",{limit:"100",offset:String(offset)});
        if(!Array.isArray(page.companies))throw Error("Torn returned no public company directory list.");
        const n=Number(page._metadata&&page._metadata.total);
        if(Number.isSafeInteger(n)&&n>=0)total=n;
        let added=0;
        page.companies.forEach(function(p){
          if(!p||!Number.isSafeInteger(Number(p.id))||Number(p.type&&p.type.id)!==type)return;
          if(ids.has(String(p.id)))return;
          ids.add(String(p.id));added++;
          rows.push({id:Number(p.id),name:String(p.name||"").slice(0,120),
            rating:p.rating,days_old:p.days_old,income:p.income,customers:p.customers,employees:p.employees});
        });
        pages++;
        if(page.companies.length<100 || (total!==null&&offset+page.companies.length>=total)){complete=true;break;}
        if(added===0)break; // Do not keep requesting a stuck page.
      }
      if(!pages)throw Error("No company directory pages loaded.");
      c.peers={rows:rows.slice(0,500),total:total,complete:complete,scanned:rows.length,
        observedAt:new Date().toISOString(),typeId:type};
      const report=peerModelV11(c);
      c.peerHistory=c.peerHistory||[];
      c.peerHistory.push({observedAt:c.peers.observedAt,target:report.target,gap:report.gap,competitors:report.neighbours.length,median:report.benchmark});
      c.peerHistory=c.peerHistory.slice(-35);
      await persist();
      message="Scanned "+rows.length+" public "+String(c.profile.type.name||"company")+" listings ("+
        (complete?"directory complete":"sample capped at 500")+
        "). Weekly income comparisons updated.";
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
    // Navigating away from the company page must not close a Hub-opened panel.
    if (show) {updateLauncherV11();positionLauncher();}
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
    open=true;message="";draw();
    // Only request live information on demand; never write to Torn.
    void autoCompanyRefreshV112(true);
  });
  document.addEventListener?.("staxx:open",function(e){if(e.detail&&e.detail.id==="company"){
    if(e.detail.alertId){tab="alerts";detailView="";companyAlertFocus=String(e.detail.alertId);}
    else if(["overview","alerts","employees","training","growth","stock","settings","diagnostics"].includes(e.detail.section)){
      tab=e.detail.section;detailView="";companyAlertFocus="";
    }
    if(!open)opener.click();else draw();focusCompanyAlert();
  }else if(open){open=false;draw();}});
  document.addEventListener?.("staxx:closeall",function(){if(open){open=false;draw();}});
  document.addEventListener?.("staxx:diagnostics-request",function(){
    const c=companyId&&data.byCompany?.[companyId],t=Date.parse(c?.lastRefresh||"");
    document.dispatchEvent?.(new CustomEvent("staxx:diagnostics",{detail:{id:"company",version:"1.25.2",
      api:!activeApiKey()?"missing":!Number.isFinite(t)||Date.now()-t>86400000?"stale":"ready",
      storage:typeof PDA_storage!=="undefined"?"ready":"missing",ui:root?"ready":"missing",
      detail:!c?"Company not loaded":busy?"Company refresh in progress":"Latest company snapshot "+(Number.isFinite(t)?"available":"missing")}}));
  });
  document.addEventListener?.("staxx:refresh-request",()=>{void autoCompanyRefreshV112(true);});
  document.addEventListener?.('staxx:mode',()=>{companyTabsExpanded=false;if(open)draw();});
  document.addEventListener?.("staxx:ping",()=>document.dispatchEvent?.(new CustomEvent("staxx:register",{detail:{id:"company",label:"Company Helper",icon:"CO",desc:"Daily performance · Staff · Growth",trendMetric:"Star rating",freshnessMs:86400000}})));
  document.dispatchEvent?.(new CustomEvent("staxx:register",{detail:{id:"company",label:"Company Helper",icon:"CO",desc:"Daily performance · Staff · Growth",trendMetric:"Star rating",freshnessMs:86400000}}));
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
    if(evt.target===root){open=false;draw();return;}
    const el=evt.target.closest("button[data-act]");if (!el) return;
    const act=el.dataset.act, c=current();
    if (act==="staxx-find") {open=false;draw();document.dispatchEvent(new CustomEvent('staxx:find'));return;}
    if (act==="close") {open=false;draw();return;}
    if (act==="diag-check"){document.dispatchEvent(new CustomEvent("staxx:ping"));document.dispatchEvent(new CustomEvent("staxx:diagnostics-request"));draw();return;}
    if (act==="diag-copy"){const text=JSON.stringify(safeCompanyDiagnosticsV111(c),null,2);
      const clipboard=window.navigator?.clipboard;if(clipboard?.writeText)clipboard.writeText(text).catch(()=>notify("Clipboard unavailable. Use StaxxHub diagnostics.","warn"));
      else notify("Clipboard unavailable. Use StaxxHub diagnostics.","warn");return;}
    if (act==="profitstaxx") {open=false;draw();document.dispatchEvent(new CustomEvent('staxx:open',{detail:{id:'profit'}}));return;}
    if (act==="staxx-more-tabs") {companyTabsExpanded=!companyTabsExpanded;draw();return;}
    if (act==="tab") {detailView="";tab=el.dataset.tab;message="";
      if(["overview","alerts","employees","training","growth","stock","settings","diagnostics"].includes(tab))
        document.dispatchEvent?.(new CustomEvent('staxx:visit',{detail:{id:'company',section:tab}}));
      draw();return;}
    if (act==="metric-detail"){detailView=el.dataset.target;draw();return;}
    if (act==="detail-back"){detailView="";draw();return;}
    if (act==="staff-view"){staffView=el.dataset.view;selectedEmployee=null;draw();return;}
    if (act==="training-view"){trainingView=el.dataset.view;draw();return;}
    if (act==="more-payments"){paymentViewLimit+=35;draw();return;}
    if (act==="growth-view"){growthView=el.dataset.view;draw();return;}
    if (act==="stress-shock"){const n=Number(el.dataset.shock);if([5,10,20].includes(n)){companyStressPctV115=n;draw();}return;}
    if (act==="scan-peers")return scanPeersV11();
    if (act==="backfill-packages"){
      if(!c)return notify("Refresh first.","bad");
      if(!window.confirm("Classify historic exact-price employee transfers as training purchases? Entries already in your payment ledger or manually voided are skipped. Review the audit Records afterwards."))return;
      const out=backfillTrainingReceiptsV13(c);
      await work(persist);
      notify("Backfilled "+out.credited+" older inferred purchase(s); skipped "+out.skipped+" potential duplicates. All are reversible in Records.","good");
      return;
    }
    if (act==="toggle-auto-package"){
      if(!c)return notify("Refresh company data first.","bad");
      c.autoPackageMode=c.autoPackageMode===false?true:false;
      if(c.autoCreditSince===undefined)c.autoCreditSince=stamp();
      return work(persist);
    }
    if (act==="scan-rival-rosters")return scanRivalRostersV12();
    if (act==="mark-change"){
      const select=root.querySelector("#tch-change-kind");
      if(!select)return notify("Choose a valid company change.","bad");
      try {markChangeV12(c,select.value);}catch(e){return notify(e.message,"bad");}
      return work(persist);
    }
    if (act==="wage-share"){const n=Number(el.dataset.share);if(!c||![10,15,20,25,30,35,40,50].includes(n))return;c.wageShare=n;return work(persist);}
    if (act==="stock-days"){const n=Number(el.dataset.days);if(!c||![2,3,5,7].includes(n))return;c.stockDays=n;return work(persist);}
    if (act==="apply-balanced"){if(!c)return;const plan=balancedAssignmentV3(c);c.whatIf={};plan.changes.forEach(function(x){c.whatIf[x.id]=x.to;});tab="employees";staffView="simulator";return work(persist);}
    if (act==="finance-focus"){if(["revenue","wages","ad","profit"].includes(el.dataset.field)){financeFocus=el.dataset.field;draw();}return;}
    if (act==="goto"){
      const target=el.dataset.target;
      const routes={"growth-performance":["growth","performance"],"growth-accounts":["growth","accounts"],
        "growth-pricing":["growth","pricing"],"training-queue":["training","queue"],
        "training-payments":["training","payments"],"training-history":["training","history"],"staff":["employees","roster"],"staff-sim":["employees","simulator"],"staff-wages":["employees","wages"],"growth-rivals":["growth","rivals"],"growth-review":["growth","review"],"stock":["stock",""]};
      if(target==="refresh"){refresh();return;}
      if(!Object.prototype.hasOwnProperty.call(routes,target))return;
      const route=routes[target];tab=route[0];if(tab==="growth")growthView=route[1];
      if(tab==="training")trainingView=route[1];if(tab==="employees")staffView=route[1];detailView="";
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
      if (selected!==c.logTypes){c.logTypes=selected;c.logCursor=null;c.logNext=null;c.logHistoryWarning=null;c.logs=[];}
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
      c.logTypes=typed;c.logCursor=null;c.logNext=null;c.logHistoryWarning=null;c.logs=[];
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
        Object.values(data.byCompany).forEach(function(c){
          if(c && Array.isArray(c.payments))migrateAutoPaymentClaims(c);
          reconcileStocklessCompanyV119(c);
        });
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
        let needsReview=0,clearedGhostStock=0;
        Object.values(data.byCompany).forEach(function(c){
          if(c && Array.isArray(c.payments))needsReview+=migrateAutoPaymentClaims(c);
          if(reconcileStocklessCompanyV119(c))clearedGhostStock++;
        });
        if(repaired||needsReview||clearedGhostStock){
          await persist();
          message=(repaired?"Repaired "+repaired+" duplicate imported training records. ":"")+
            (needsReview?needsReview+" previous auto-credited incoming transfers now require training-purpose review.":"")+
            (clearedGhostStock?" Cleared obsolete product stock from "+clearedGhostStock+" service/no-stock company record(s).":"");
        }
        positionLauncher();
      }
      updateLauncherV11();
      try{
        const pending=sessionStorage.getItem("staxx-open-company")==="1";
        const at=Number(sessionStorage.getItem("staxx-open-company-at")||0);
        const f=sessionStorage.getItem("staxx-open-company-alert");
        const section=sessionStorage.getItem("staxx-open-company-section");
        for(const key of ["staxx-open-company","staxx-open-company-at","staxx-open-company-alert","staxx-open-company-section"])sessionStorage.removeItem(key);
        const valid=!at||(at<=Date.now()&&Date.now()-at<=120000);
        if(pending&&valid){
          if(f){tab="alerts";companyAlertFocus=f;}
          else if(["overview","alerts","employees","training","growth","stock","settings","diagnostics"].includes(section)){tab=section;detailView="";companyAlertFocus="";}
          opener.click();focusCompanyAlert();
        }
      }catch(_){}
    } catch (_) { /* Do not silently overwrite damaged storage. */ }
  })();
  // Auto-read on the company page or an open helper; StaxxHub requests foreground updates from every Torn page.
  // Do not automate any training, wages, stock orders or director actions.
  if(typeof setInterval==="function")setInterval(function(){void autoCompanyRefreshV112(true);},60000);
  document.addEventListener?.("visibilitychange",function(){
    if(!document.hidden)void autoCompanyRefreshV112(true);
  });
  if(typeof setTimeout==="function")setTimeout(function(){void autoCompanyRefreshV112(true);},12000);
})();
