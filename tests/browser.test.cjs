/* Optional browser verification: requires Playwright and a Chromium installation. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
(async()=>{
 const server=http.createServer((req,res)=>{let p=path.join(root,decodeURIComponent(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));if(!p.startsWith(root+path.sep)){res.writeHead(403).end();return;}try{res.setHeader('Content-Type',p.endsWith('.css')?'text/css':p.endsWith('.js')?'text/javascript':'text/html');res.end(fs.readFileSync(p));}catch{res.writeHead(404).end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 let browser;try{
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-crash-reporter']});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const click=a=>page.locator(`[data-action="${a}"]`).first().click();
 const stored=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('bibleEmoji.game.v1')));
 await page.clock.install();await page.goto(`http://127.0.0.1:${server.address().port}/`);
 assert.equal(await page.locator('[data-action="continue"]').count(),0);
 await click('help');assert(await page.locator('dialog').isVisible());await click('close-modal');
 await click('setup');await page.selectOption('#team-count','3');assert.equal(await page.locator('.team-edit').count(),3);
 await page.fill('[name="name0"]','Rainbow Readers');await page.selectOption('[name="count"]','10');await page.selectOption('[name="timer"]','15');await page.uncheck('[name="double"]');await page.check('[name="speed"]');
 await page.locator('#setup-form button[type="submit"]').click();
 assert.equal((await stored()).teams.length,3);assert.equal(await page.locator('.answer').count(),0);assert.equal((await stored()).questions.filter(q=>q.mode==='speed').length,5);
 await page.keyboard.press('h');await page.keyboard.press('h');assert.equal(await page.locator('.hint').count(),2);
 await page.keyboard.press('r');assert(await page.locator('.answer').isVisible());await page.selectOption('#award-team','1');await click('correct');assert.equal((await stored()).teams[1].score,40);assert(await page.locator('[data-action="correct"]').isDisabled());
 await click('undo');assert.equal((await stored()).teams[1].score,0);await page.selectOption('#award-team','2');await click('correct');assert.equal((await stored()).teams[2].score,40);
 await click('next');await page.reload();await click('continue');assert.equal((await stored()).index,1);assert.equal((await stored()).teams[2].score,40);assert.equal((await stored()).records[1].paused,true);
 await page.locator('[data-action="adjust"][data-team="0"]').click();await page.fill('[name="delta"]','-25');await page.locator('#adjust-form button[type="submit"]').click();assert.equal((await stored()).teams[0].score,-25);await click('undo');assert.equal((await stored()).teams[0].score,0);
 // Timer expiry never awards or marks a result. Use an accelerated browser clock.
 await click('pause');await page.clock.runFor(16500);assert(await page.locator('.time-up').isVisible());assert.equal((await stored()).records[1].settled,false);
 await click('reveal');await click('incorrect');assert.equal((await stored()).records[1].settled,true);await click('undo');assert.equal((await stored()).records[1].settled,false);
 await click('next');await click('previous');assert(await page.locator('.answer').isVisible());
 await click('home');await click('library');assert.equal(await page.locator('.library-card').count(),40);
 await page.fill('#library-search','Noah');assert.equal(await page.locator('.library-card').count(),1);await click('edit-question');await page.fill('[name="hint1"]','A teacher-edited clue.');await page.locator('#question-form button[type="submit"]').click();
 await page.locator('[data-enable]').uncheck();assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('bibleEmoji.library.v1')).filter(q=>q.enabled).length),39);
 await click('add-question');for(const [k,v] of Object.entries({emojis:'🐑 📖 ❤️ ⭐',answer:'Teacher’s Custom Puzzle',reference:'Luke 15:3–7',hint1:'A gentle clue',hint2:'A clearer clue',explanation:'A teacher-created example about caring for a lost sheep.'}))await page.fill(`[name="${k}"]`,v);await page.locator('#question-form button[type="submit"]').click();
 await page.fill('#library-search','Teacher’s');assert.equal(await page.locator('.library-card').count(),1);
 const downloadPromise=page.waitForEvent('download');await click('export');const download=await downloadPromise;const exportPath=await download.path();const exported=JSON.parse(fs.readFileSync(exportPath,'utf8'));assert.equal(exported.length,41);
 await click('edit-question');await click('delete-question');await click('confirm-delete');assert.equal(await page.locator('.library-card').count(),0);
 await click('import');await page.locator('#import-file').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(exported))});await click('confirm-import');assert.equal(await page.locator('.library-card').count(),1);
 // Invalid input must preserve the library.
 await click('import');await page.locator('#import-file').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('[{}]')});await page.waitForFunction(()=>document.querySelector('#toast').textContent.includes('Import failed'));assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('bibleEmoji.library.v1')).length),41);await click('close-modal');
 await click('reset-library');await click('confirm-reset-library');await page.fill('#library-search','');assert.equal(await page.locator('.library-card').count(),40);
 await click('home');await click('continue');
 // Walk through all remaining puzzles; answer stays hidden on new puzzles.
 let g=await stored();while(g.index<g.questions.length-1){await click('skip');g=await stored();}
 assert.equal(g.questions[g.index].mode,'final');await click('reveal');for(let i=0;i<3;i++){await page.selectOption('#award-team',String(i));await click('correct');}const totals=(await stored()).teams.map(t=>t.score);assert.deepEqual(totals,[100,100,140]);
 // One award per team, even after selecting them again.
 await page.selectOption('#award-team','0');await click('correct');assert.deepEqual((await stored()).teams.map(t=>t.score),totals);
 await click('undo');assert.equal((await stored()).teams[2].score,40);await page.selectOption('#award-team','2');await click('correct');await click('next');assert(await page.locator('.celebration').isVisible());assert((await page.locator('.winner').innerText()).includes('Team Green'));
 await click('again');await click('reset-scores');await click('confirm-reset-scores');assert((await stored()).teams.every(t=>t.score===0));
 await page.screenshot({path:path.join(root,'game-preview.png'),fullPage:true});
 for(const [width,height] of [[1920,1080],[1366,768],[1024,768],[768,1024],[390,844]]){await page.setViewportSize({width,height});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Game overflows at ${width}`);}
 await click('home');for(const [width,height] of [[768,1024],[390,844]]){await page.setViewportSize({width,height});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Home overflows at ${width}`);}
 await click('settings');await page.check('#settings-form [name="sound"]');await page.check('#settings-form [name="music"]');await page.check('#settings-form [name="ticking"]');await page.locator('#settings-form button[type="submit"]').click();assert((await page.locator('#sound').innerText()).includes('on'));await page.locator('#sound').click();
 // No remote assets: the deployed distribution embeds its source and remains interactive offline.
 await page.context().setOffline(true);await click('continue');await click('hint');assert.equal(await page.locator('.hint').count(),1);await page.context().setOffline(false);
 assert.equal(await page.locator('script[src],link[rel="stylesheet"]').count(),0);
 assert.deepEqual(errors,[]);console.log('PASS: teacher workflow, hint scoring, duplicate prevention, undo, timer expiry, refresh, editor, import/export, final scoring, rankings, 5 screen sizes, offline interaction; no JavaScript errors.');
 }finally{if(browser)await browser.close();server.close();}
})().catch(err=>{console.error(err);process.exitCode=1;});
