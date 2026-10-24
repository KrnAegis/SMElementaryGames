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

 const t=a=>page.locator(`[data-trivia="${a}"]`).first().click();
 const trivia=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('bibleTrivia.game.v1')));
 await page.goto(`http://127.0.0.1:${server.address().port}/`);
 assert.equal(await page.locator('.game-card').count(),2);
 for(const [width,height] of [[1920,1080],[1366,768],[768,1024],[390,844]]){await page.setViewportSize({width,height});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 await page.setViewportSize({width:1440,height:1000});
 // Save a real Emoji game, then verify Trivia never changes its progress.
 await click('setup');await page.uncheck('[name="double"]');await page.locator('#setup-form button[type="submit"]').click();await click('reveal');await click('correct');const emojiBefore=await stored();assert.equal(emojiBefore.teams[0].score,100);await click('home');
 await click('trivia-new');assert.equal(await page.locator('#trivia-team-count option').count(),4);await page.selectOption('#trivia-team-count','1');assert.equal(await page.locator('.team-edit').count(),1);await page.fill('[name="team0"]','Joyful Readers');await page.selectOption('#trivia-team-count','4');assert.equal(await page.locator('.team-edit').count(),4);assert.equal(await page.inputValue('[name="team0"]'),'Joyful Readers');await page.selectOption('[name="limit"]','10');await page.locator('#trivia-setup-form button[type="submit"]').click();
 const choose=async d=>page.locator(`[data-trivia="draw"][data-difficulty="${d}"]`).click();
 assert.equal(await page.locator('[data-trivia="draw"]').count(),3);await choose('easy');assert.equal(await page.locator('.trivia-answer').count(),0);assert.equal((await trivia()).rounds[0].question.difficulty,'easy');assert.equal(await page.locator('[data-trivia="draw"]').count(),0);
 await t('reveal');await page.selectOption('#trivia-award-team','0');await t('correct');assert.equal((await trivia()).teams[0].score,100);assert(await page.locator('[data-trivia="correct"]').isDisabled());assert.equal(await page.locator('[data-trivia="draw"]').count(),3);
 await choose('hard');await t('reveal');await page.selectOption('#trivia-award-team','1');await t('correct');assert.equal((await trivia()).teams[1].score,300);await t('undo');assert.equal((await trivia()).teams[1].score,0);await page.selectOption('#trivia-award-team','2');await t('correct');assert.equal((await trivia()).teams[2].score,300);
 await choose('medium');await t('reveal');await t('incorrect');assert.equal((await trivia()).rounds[2].status,'incorrect');await t('undo');await page.selectOption('#trivia-award-team','1');await t('correct');assert.equal((await trivia()).teams[1].score,200);
 await page.reload();await click('trivia-continue');assert.equal((await trivia()).rounds.length,3);assert.equal(await page.locator('[data-trivia="draw"]').count(),3);assert.deepEqual((await trivia()).teams.map(t=>t.score),[100,200,300,0]);
 await page.locator('[data-trivia="adjust"][data-team="0"]').click();await page.fill('[name="delta"]','-25');await page.locator('#trivia-adjust-form button[type="submit"]').click();assert.equal((await trivia()).teams[0].score,75);await t('undo');assert.equal((await trivia()).teams[0].score,100);
 await t('previous');assert.equal((await trivia()).index,1);await t('latest');assert.equal((await trivia()).index,2);
 await choose('easy');await t('skip');assert.equal((await trivia()).rounds[3].status,'skipped');assert.equal(await page.locator('[data-trivia="draw"]').count(),3);
 // A cancelled end/new game preserves all progress.
 await t('end');await t('close');assert.equal((await trivia()).complete,false);await page.locator('#brand').click();assert.equal(await page.locator('.game-card').count(),2);assert.deepEqual((await stored()).teams,emojiBefore.teams);assert.equal((await stored()).index,emojiBefore.index);await click('trivia-new');await page.locator('#trivia-setup-form button[type="submit"]').click();await t('close');assert.equal((await trivia()).rounds.length,4);await t('home');await click('trivia-continue');
 // Show a tablet/projector-friendly question and check no horizontal overflow.
 await choose('hard');await page.screenshot({path:path.join(root,'trivia-preview.png'),fullPage:true});for(const [width,height] of [[1920,1080],[1366,768],[1024,768],[768,1024],[390,844]]){await page.setViewportSize({width,height});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Trivia overflows at ${width}`);}
 await t('reveal');for(const [width,height] of [[1366,768],[768,1024],[390,844]]){await page.setViewportSize({width,height});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Trivia answer overflows at ${width}`);}
 await t('skip');while((await trivia()).rounds.length<10){await choose(['easy','medium','hard'][(await trivia()).rounds.length%3]);await t('skip');}
 assert.equal(new Set((await trivia()).rounds.map(r=>r.question.id)).size,10);assert.equal(await page.locator('[data-trivia="draw"]').count(),0);await t('results');assert(await page.locator('.winner').innerText().then(s=>s.includes('Team Green')));
 await t('replay');assert((await trivia()).teams.every(t=>t.score===0));await choose('easy');await t('skip');await t('end');await t('confirm-end');assert((await page.locator('.winner').innerText()).includes('share the win'));
 await t('home');await click('continue');assert.equal((await stored()).teams[0].score,100);await click('home');
 // Still a portable, single-file game hub.
 await page.context().setOffline(true);await click('trivia-new');await page.locator('#trivia-setup-form button[type="submit"]').click();await choose('medium');assert(await page.locator('.trivia-question').isVisible());await t('help');assert(await page.locator('dialog').isVisible());await t('close');await page.context().setOffline(false);
 assert.equal(await page.locator('script[src],link[rel="stylesheet"]').count(),0);assert.deepEqual(errors,[]);
 console.log('PASS: hub navigation, Emoji save compatibility, 1–4 trivia teams, Easy/Hard/Medium changes, 100/200/300 scores, locking, Undo, incorrect, skip, adjustments, refresh, cancellation, results, ties, replay, responsive layout, offline play; no JavaScript errors.');
 }finally{if(browser)await browser.close();server.close();}
})().catch(err=>{console.error(err);process.exitCode=1;});
