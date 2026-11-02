'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'..','Torn-Company-Helper.user.js'),'utf8');
test('Company Find closes the original panel and uses the shared launcher',()=>{
 assert.match(src,/data-act="staxx-find"/);
 assert.match(src,/new CustomEvent\('staxx:find'\)/);
 assert.match(src,/open=false;draw\(\);document\.dispatchEvent/);
 assert.match(src,/\/\/ @version\s+1\.25\.\d+/);
});
test('Company section handoff is short-lived, validated, and preserves alert priority',()=>{
 assert.match(src,/staxx-open-company-section/);
 assert.match(src,/staxx-open-company-at/);
 assert.match(src,/Date\.now\(\)-at<=120000/);
 assert.match(src,/if\(f\)\{tab="alerts";companyAlertFocus=f;\}/);
 assert.match(src,/\["overview","alerts","employees","training","growth","stock","settings","diagnostics"\]\.includes\(section\)/);
});
test('Company training and star growth logic remains read-only',()=>{
 assert.match(src,/companyAlertFocus/);
 assert.match(src,/staxx:actions/);
 assert.doesNotMatch(src,/PDA_http(?:Post|Put|Patch|Delete)\s*\(/);
});
