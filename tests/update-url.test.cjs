'use strict';
const test=require('node:test'), assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'..','Torn-Company-Helper.user.js'),'utf8');
test('Company-TornStaxx has a versioned remote installer at the original URL',()=>{
 assert.ok(src.startsWith('// ==UserScript==\n'));
 assert.match(src,/^\/\/ @version\s+1\.28\.0$/m);
 assert.match(src,/^\/\/ @updateURL\s+https:\/\/raw\.githubusercontent\.com\/Tom-Peters\/Torn-Company-Helper\/main\/Torn-Company-Helper\.user\.js$/m);
 assert.match(src,/^\/\/ @downloadURL\s+https:\/\/raw\.githubusercontent\.com\/Tom-Peters\/Torn-Company-Helper\/main\/Torn-Company-Helper\.user\.js$/m);
 assert.match(src,/^\/\/ @author\s+IamEEKY$/m);
 assert.doesNotMatch(src,/[\u2018\u2019\u201c\u201d]/);
 new vm.Script(src,{filename:'Torn-Company-Helper.user.js'});
});
