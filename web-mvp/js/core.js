/* core.js — State, Profile, adaptive Engine, TTS/STT. Global window.Core */
(function(){
const LS = 'lernzeit_v2';
const Core = {};

// ---------- Storage & Profile ----------
function blankProfile(name, focus){
  return {
    name, focus: focus||['memory','speech'],
    abilities:{ memory:2, phonics:2, auditory:2, language:2, math:2 }, // adaptiv, ~1..12
    stars:0, lastUnlockedCount:0,
    sessions:[],           // {skill,correct,t}
    misses:{},             // key -> count  (Fehler-Muster)
    weak:{},               // skill -> [itemKeys]  (Spaced Repetition)
    settings:{ limitMin:15 }
  };
}
let store = load();
function load(){
  try{ const d=JSON.parse(localStorage.getItem(LS)); if(d&&d.profiles) return d; }catch(e){}
  // Migration von v1 falls vorhanden
  let mig=null;
  try{ mig=JSON.parse(localStorage.getItem('lernzeit_v1')); }catch(e){}
  const p=blankProfile(mig&&mig.name||'Kind', mig&&mig.focus);
  if(mig){ p.stars=mig.stars||0; p.sessions=mig.sessions||[]; }
  return { profiles:{[p.name]:p}, current:p.name };
}
function save(){ localStorage.setItem(LS, JSON.stringify(store)); }
Core.save=save;
Core.P = ()=> store.profiles[store.current];
Core.allProfiles = ()=> Object.keys(store.profiles);
Core.switchProfile = n=>{ if(store.profiles[n]){ store.current=n; save(); } };
Core.addProfile = (name,focus)=>{ name=name||'Kind'; store.profiles[name]=blankProfile(name,focus); store.current=name; save(); };
Core.hasProfile = ()=> Core.allProfiles().length>0 && Core.P() && Core.P().name;
Core.resetAll = ()=>{ localStorage.removeItem(LS); localStorage.removeItem('lernzeit_v1'); store=load(); };

// ---------- Session-Timer (Limit) ----------
let sessionStart = Date.now();
Core.resetSessionTimer = ()=>{ sessionStart=Date.now(); };
Core.sessionOver = ()=>{
  const lim=(Core.P().settings.limitMin||15)*60000;
  return (Date.now()-sessionStart) > lim;
};

// ---------- Adaptive Engine ----------
// Staircase: richtig -> +0.25, falsch -> -0.75  => Ziel ~75% Erfolg (Lernzone)
Core.ability = skill => (Core.P().abilities[skill] ?? 2);
Core.recordResult = (skill, correct, itemKey)=>{
  const P=Core.P();
  const a=P.abilities;
  a[skill] = Math.max(1, Math.min(12, (a[skill]??2) + (correct? 0.25 : -0.75)));
  P.sessions.push({skill, correct, t:Date.now()});
  if(P.sessions.length>800) P.sessions=P.sessions.slice(-800);
  if(correct) P.stars++;
  // Fehler-Muster + Spaced Repetition
  if(itemKey){
    if(!correct){
      P.misses[itemKey]=(P.misses[itemKey]||0)+1;
      P.weak[skill]=P.weak[skill]||[];
      if(!P.weak[skill].includes(itemKey)) P.weak[skill].push(itemKey);
      if(P.weak[skill].length>12) P.weak[skill].shift();
    } else if(P.weak[skill]){
      // richtig beantwortet -> aus schwacher Liste entfernen
      P.weak[skill]=P.weak[skill].filter(k=>k!==itemKey);
    }
  }
  save();
};
// Schwierigkeitsstufe (1..N) aus Ability ableiten
Core.diff = (skill, {min=1,max=8,per=1.5}={})=>{
  return Math.max(min, Math.min(max, Math.round(1 + (Core.ability(skill)-1)/per)));
};

// Spaced Repetition: manchmal ein schwaches Item bevorzugt zurückgeben
Core.pickWithWeak = (skill, pool, keyOf)=>{
  const P=Core.P(); const weak=(P.weak[skill]||[]);
  if(weak.length && Math.random()<0.4){
    const k=weak[(Math.random()*weak.length)|0];
    const hit=pool.find(x=>keyOf(x)===k);
    if(hit) return hit;
  }
  return pool[(Math.random()*pool.length)|0];
};

// ---------- Unlock / Freispielen ----------
Core.unlockedCount = games => { const s=Core.P().stars||0; return games.filter(g=>s>=g.unlock).length; };

// ---------- Utils ----------
Core.shuffle = a=>{ a=a.slice(); for(let i=a.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;[a[i],a[j]]=[a[j],a[i]];} return a; };
Core.sample = (arr,n)=> Core.shuffle(arr).slice(0,n);
Core.norm = s => (s||'').toLowerCase().replace(/[^a-zäöüß ]/g,'').trim();

// ---------- TTS ----------
let bestVoice=null, voicesReady=false;
function pickVoice(vs){
  const p=[v=>v.lang==='de-DE'&&/google/i.test(v.name),
           v=>v.lang==='de-DE'&&/microsoft/i.test(v.name),
           v=>v.lang==='de-DE'&&!v.localService, v=>v.lang==='de-DE', v=>v.lang.startsWith('de')];
  for(const t of p){ const m=vs.find(t); if(m) return m; } return null;
}
function ensureVoices(){ if(voicesReady) return; const vs=speechSynthesis.getVoices(); if(vs.length){ bestVoice=pickVoice(vs); voicesReady=true; } }
if('speechSynthesis' in window) speechSynthesis.onvoiceschanged=()=>{ voicesReady=false; ensureVoices(); };
Core.speak = (text,{rate=0.85,pitch=1.15,cb}={})=>{
  if(!('speechSynthesis' in window)){ cb&&cb(); return; }
  speechSynthesis.cancel(); ensureVoices();
  const u=new SpeechSynthesisUtterance(text); u.lang='de-DE'; u.rate=rate; u.pitch=pitch;
  if(bestVoice) u.voice=bestVoice; if(cb) u.onend=cb;
  speechSynthesis.speak(u);
};
Core.ensureVoices=ensureVoices;
// Lautfolge einzeln sprechen (für Synthese-Spiel)
Core.speakSounds = (sounds, gap=650, done)=>{
  let i=0; (function step(){ if(i>=sounds.length){ done&&done(); return; }
    Core.speak(sounds[i], {rate:0.7}); i++; setTimeout(step, gap); })();
};

// ---------- STT (Spracherkennung) ----------
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
Core.micAvailable = !!SR;
Core.listenOnce = ({onResult,onError,timeout=6000})=>{
  if(!SR){ onError&&onError('no-mic'); return; }
  const rec=new SR(); rec.lang='de-DE'; rec.interimResults=false; rec.maxAlternatives=3;
  let done=false,timer=null;
  rec.onresult=e=>{ if(done)return; done=true; clearTimeout(timer);
    const alts=[]; for(let i=0;i<e.results[0].length;i++) alts.push(e.results[0][i].transcript); onResult(alts); };
  rec.onerror=e=>{ if(done)return; done=true; clearTimeout(timer); onError&&onError(e.error); };
  rec.onend=()=>{ if(done)return; done=true; onError&&onError('no-speech'); };
  try{ rec.start(); }catch(e){ onError&&onError('start-fail'); return; }
  timer=setTimeout(()=>{ try{rec.stop();}catch(e){} }, timeout);
};
function lev(a,b){ const m=a.length,n=b.length; if(!m)return n; if(!n)return m;
  const d=Array.from({length:m+1},(_,i)=>[i,...Array(n).fill(0)]);
  for(let j=0;j<=n;j++) d[0][j]=j;
  for(let i=1;i<=m;i++)for(let j=1;j<=n;j++) d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
  return d[m][n]; }
Core.heard = (alts,target)=>{ const t=Core.norm(target).replace(/ /g,'');
  return alts.some(a=>{ const n=Core.norm(a).replace(/ /g,''); return n.includes(t)||t.includes(n)||lev(n,t)<=1; }); };
Core.heardAny = (alts,words)=>{ const hay=alts.map(a=>Core.norm(a)).join(' ');
  return words.some(w=>hay.includes(Core.norm(w))); };

window.Core = Core;
})();
