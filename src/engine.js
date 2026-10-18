/* Pure game rules shared by the UI and automated checks. */
(function(root){
'use strict';
const defaults={difficulty:'mixed',count:'20',timer:30,shuffle:true,double:true,speed:false,final:true,sound:false,music:false,ticking:false};
const copy=o=>JSON.parse(JSON.stringify(o));
function shuffled(items,rng=Math.random){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function makeGame(library,teams,settings,rng=Math.random){
 const s={...defaults,...settings};let pool=library.filter(q=>q.enabled&&(s.difficulty==='mixed'||q.difficulty===s.difficulty)).map(copy);
 if(!pool.length)throw Error('Enable at least one question for this difficulty in the Question Library.');
 const n=s.count==='all'?pool.length:Math.min(Number(s.count),pool.length);
 if(s.difficulty==='mixed'){
  const buckets=['easy','medium','hard'].map(d=>s.shuffle?shuffled(pool.filter(q=>q.difficulty===d),rng):pool.filter(q=>q.difficulty===d));
  pool=[];for(let i=0;pool.length<n;i++){
   const phase=i/Math.max(1,n-1);let preference=i%3===0?0:phase<.32?0:phase<.67?1:2;
   // Reserve easy puzzles for later turns instead of using all of them at the start.
   if(preference===0&&i%3!==0&&buckets[0].length<=Math.ceil((n-i)/3))preference=1;
   const bucket=buckets[preference].length?buckets[preference]:(buckets[1].length?buckets[1]:buckets[2].length?buckets[2]:buckets[0]);pool.push(bucket.shift());
  }
 }else pool=(s.shuffle?shuffled(pool,rng):pool).slice(0,n);
 const finalIndex=s.final&&n>1?n-1:-1;const speedStart=s.speed&&n>=6?Math.max(0,n-(finalIndex>=0?1:0)-5):-1;
 const eligible=pool.map((_,i)=>i).filter(i=>i!==finalIndex&&!(speedStart>=0&&i>=speedStart&&i<speedStart+5));
 const doubleIndex=s.double&&eligible.length?eligible[Math.floor(rng()*eligible.length)]:-1;
 return {version:1,settings:s,teams:teams.map(t=>({...t,score:0})),questions:pool.map((q,i)=>({...q,mode:i===finalIndex?'final':speedStart>=0&&i>=speedStart&&i<speedStart+5?'speed':'normal',double:i===doubleIndex})),index:0,records:pool.map((q,i)=>({hints:0,revealed:false,settled:false,awarded:[],remaining:speedStart>=0&&i>=speedStart&&i<speedStart+5?Math.min(15,Number(s.timer)||15):Number(s.timer),paused:false,expired:false})),history:[],complete:false,createdAt:Date.now()};
}
function points(g){const r=g.records[g.index],q=g.questions[g.index];return [100,70,40][r.hints]*(q.double?2:1);}
function snapshot(g){g.history.push({teams:copy(g.teams),records:g.records.map(r=>({settled:r.settled,awarded:[...r.awarded]}))});if(g.history.length>100)g.history.shift();}
function award(g,team){const r=g.records[g.index],q=g.questions[g.index];if(!r.revealed||!g.teams[team]||r.settled||r.awarded.includes(team))return false;snapshot(g);g.teams[team].score+=points(g);r.awarded.push(team);if(q.mode!=='final')r.settled=true;return true;}
function incorrect(g){const r=g.records[g.index];if(r.settled||!r.revealed)return false;snapshot(g);r.settled=true;return true;}
function adjust(g,team,delta){if(!g.teams[team]||!Number.isSafeInteger(delta)||Math.abs(delta)>1000000)return false;const total=g.teams[team].score+delta;if(!Number.isSafeInteger(total))return false;snapshot(g);g.teams[team].score=total;return true;}
function resetScores(g){snapshot(g);g.teams.forEach(t=>t.score=0);}
function undo(g){const h=g.history.pop();if(!h)return false;g.teams=h.teams;g.records.forEach((r,i)=>{r.settled=h.records[i].settled;r.awarded=[...h.records[i].awarded];});return true;}
function rankings(g){return g.teams.map((t,i)=>({...t,index:i})).sort((a,b)=>b.score-a.score).map((t,i,a)=>({...t,rank:1+a.filter(o=>o.score>t.score).length}));}
function validateLibrary(data){
 if(!Array.isArray(data)||!data.length||data.length>500)throw Error('Import a JSON array containing 1–500 questions.');
 const seen=new Set();return data.map(q=>{
 if(!q||typeof q!=='object')throw Error('Each question must be an object.');
 const out={};for(const k of ['id','emojis','answer','difficulty','hint1','hint2','reference','explanation']){if(typeof q[k]!=='string'||!q[k].trim()||q[k].length>2000)throw Error('Every question needs valid text for '+k+'.');out[k]=q[k].trim();}
 if(!['easy','medium','hard'].includes(out.difficulty))throw Error('Difficulty must be easy, medium, or hard.');
 if(seen.has(out.id))throw Error('Duplicate question ID: '+out.id);seen.add(out.id);
 if(q.alternatives!==undefined&&(!Array.isArray(q.alternatives)||q.alternatives.some(x=>typeof x!=='string'||x.length>300)))throw Error('Alternative answers must be a list of short text strings.');
 return {...out,alternatives:q.alternatives||[],enabled:q.enabled!==false,custom:!/^([emh]\d{2})$/.test(out.id)||q.custom===true};
 });
}
const api={defaults,copy,shuffled,makeGame,points,award,incorrect,adjust,resetScores,undo,rankings,validateLibrary};
if(typeof module!=='undefined')module.exports=api;else root.GameEngine=api;
})(typeof window!=='undefined'?window:globalThis);
