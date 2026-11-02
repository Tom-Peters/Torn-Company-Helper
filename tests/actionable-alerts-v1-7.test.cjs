'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'..','Torn-Company-Helper.user.js'),'utf8');
test('company alerts have stable identifiers, review targets and visible entry points',()=>{
 for(const id of ['training-overflow','training-owed','pending-payments','loss-guardrail','stale-data'])assert.ok(source.includes('id:"'+id+'"'));
 assert.match(source,/function companyAlertsPanel\(c\)/);assert.match(source,/\["alerts","!","Alerts"\]/);
 assert.match(source,/data-tab=\\"alerts\\"|data-tab="alerts"/);
});
test('company navigation preserves individual alert on companies.php transition',()=>{
 assert.match(source,/staxx-open-company-alert/);assert.match(source,/if\(e\.detail\.alertId\)/);
 assert.match(source,/companyAlertFocus/);assert.match(source,/function focusCompanyAlert\(/);
});
