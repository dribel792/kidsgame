/* ui.js — Screens, Spiel-Engine, Eltern-Dashboard. Global window.UI */
(function(){
const Core=window.Core, Games=window.Games;
const UI={}; window.UI=UI;
const $=id=>document.getElementById(id);
const show=id=>{ document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active')); $(id).classList.add('active'); };
UI.area=()=>$('gameArea');

// ---------- Spiel-Katalog ----------
const P='var(--purple)',B='var(--blue)',G='var(--green)',O='var(--orange)',K='var(--pink)';
const GAMES=[
  {id:'memory',  n:'Merk die Reihe',  e:'🧠',c:P,d:'Reihenfolge merken',   sk:'memory',  st:'Tippen',   u:0},
  {id:'listen',  n:'Hör genau hin',   e:'👂',c:B,d:'Hören & finden',       sk:'auditory',st:'Hören',    u:0},
  {id:'phonics', n:'Anlaut-Detektiv', e:'🕵️',c:G,d:'Wie fängt es an?',      sk:'phonics', st:'Hören',    u:2},
  {id:'math',    n:'Zahlen & Mengen', e:'🔢',c:B,d:'Zählen, mehr, plus',    sk:'math',    st:'Tippen',   u:3},
  {id:'repeat',  n:'Sprich nach',     e:'🗣️',c:K,d:'Nachsprechen',          sk:'language',st:'Sprechen', u:4},
  {id:'missing', n:'Was fehlt?',      e:'🔎',c:P,d:'Bild verschwindet',     sk:'memory',  st:'Tippen',   u:5},
  {id:'syll',    n:'Silben klatschen',e:'👏',c:O,d:'Ba-na-ne = 3',          sk:'phonics', st:'Hören',    u:6},
  {id:'category',n:'Was passt nicht?',e:'🧩',c:G,d:'Kategorien',            sk:'language',st:'Denken',   u:7},
  {id:'opposite',n:'Gegenteile',      e:'↔️',c:P,d:'groß ↔ klein',          sk:'language',st:'Denken',   u:8},
  {id:'minpair', n:'Ähnliche Wörter', e:'👂',c:B,d:'Tasse oder Kasse?',     sk:'auditory',st:'Hören',    u:9},
  {id:'instruct',n:'Folge der Anweisung',e:'📋',c:O,d:'Mehrere Schritte',   sk:'memory',  st:'Hören',    u:10},
  {id:'blend',   n:'Laute verschmelzen',e:'🔗',c:G,d:'m-au-s → Maus',       sk:'phonics', st:'Hören',    u:12},
  {id:'nback',   n:'Gleich oder anders?',e:'🔁',c:P,d:'Merken & vergleichen',sk:'memory', st:'Denken',   u:13},
  {id:'rhyme',   n:'Reime',           e:'🎵',c:K,d:'Haus – Maus?',          sk:'phonics', st:'Hören',    u:14},
  {id:'name',    n:'Was ist das?',    e:'💬',c:O,d:'Laut benennen',         sk:'language',st:'Sprechen', u:15},
  {id:'tray',    n:'Tablett merken',  e:'🪄',c:P,d:'Kim-Spiel',             sk:'memory',  st:'Tippen',   u:16},
  {id:'rhythm',  n:'Rhythmus klopfen',e:'🥁',c:B,d:'Nachklopfen',           sk:'memory',  st:'Hören',    u:18},
  {id:'delete',  n:'Laut wegnehmen',  e:'🧙',c:G,d:'Maus ohne m',           sk:'phonics', st:'Hören',    u:20},
  {id:'figure',  n:'Wort im Gewusel', e:'🎧',c:B,d:'Figur-Grund',           sk:'auditory',st:'Hören',    u:22},
  {id:'sentence',n:'Satz bauen',      e:'🧱',c:O,d:'Wörter ordnen',         sk:'language',st:'Denken',   u:24},
  {id:'memback', n:'Rückwärts merken',e:'🔄',c:P,d:'Reihe umdrehen',        sk:'memory',  st:'Denken',   u:26},
  {id:'story',   n:'Geschichte',      e:'📖',c:K,d:'Hören & Fragen',        sk:'memory',  st:'Hören',    u:28},
  {id:'naming',  n:'Schnell benennen',e:'⏱️',c:O,d:'Wortfindung',           sk:'language',st:'Sprechen', u:30},
  {id:'describe',n:'Erzähl das Bild', e:'🖼️',c:K,d:'Frei erzählen',         sk:'language',st:'Sprechen', u:32},
  {id:'real',    n:'Echte Aufgabe',   e:'🌟',c:K,d:'Stufe 3 · Real-World',  sk:'language',st:'Real-World',u:35},
];
UI.GAMES=GAMES;
const SKILL_LABEL={memory:'🧠 Gedächtnis',phonics:'🔤 Laute/Lesen',auditory:'👂 Hören',language:'🗣️ Sprache',math:'🔢 Rechnen'};

// ---------- Onboarding ----------
UI.initOnboard=()=>{
  document.querySelectorAll('#focusChips .chip').forEach(c=>c.onclick=()=>c.classList.toggle('on'));
};
UI.finishOnboard=()=>{
  const name=$('childName').value.trim()||'Kind';
  const focus=[...document.querySelectorAll('#focusChips .chip.on')].map(c=>c.dataset.f);
  Core.addProfile(name, focus.length?focus:['memory','speech']);
  UI.goHome();
};

// ---------- Home / Freispiel-Welt ----------
const starStr=()=>{ const s=Core.P().stars||0; return '⭐'.repeat(Math.min(s,12))+(s>12?' +'+(s-12):''); };
UI.refreshStars=()=>{ $('homeStars').textContent='⭐ '+(Core.P().stars||0); $('gameStars').textContent='⭐ '+(Core.P().stars||0); };
UI.goHome=()=>{
  Core.resetSessionTimer(); show('s-home');
  const P=Core.P(), s=P.stars||0;
  $('homeHi').textContent='Hallo, '+P.name+'!'; UI.refreshStars();
  const nowU=Core.unlockedCount(GAMES), prevU=P.lastUnlockedCount||0, msg=$('homeMsg');
  if(nowU>prevU){ const g=GAMES[nowU-1]; msg.textContent='🎉 Neu freigespielt: '+g.n+'!'; setTimeout(()=>Core.speak('Super! Neues Spiel: '+g.n+'!'),300); }
  else { const next=GAMES.find(g=>s<g.u); msg.textContent=next?('Nächstes Spiel bei ⭐ '+next.u+' — noch '+(next.u-s)):'Alle Spiele frei! 🏆'; }
  P.lastUnlockedCount=nowU; Core.save();
  const grid=$('gameGrid'); grid.innerHTML='';
  GAMES.forEach(g=>{
    const on=s>=g.u; const d=document.createElement('div'); d.className='card';
    if(on){ d.style.background=g.c;
      d.innerHTML=`<div class="emoji">${g.e}</div><div class="name">${g.n}</div><div class="desc">${g.d}</div><div class="stage-tag">${g.st}</div>`;
      d.onclick=()=>{ Core.speak(g.n); setTimeout(()=>UI.startGame(g.id),420); };
    } else { d.style.background='#c9ccd1';
      d.innerHTML=`<div class="emoji">🔒</div><div class="name">${g.n}</div><div class="desc">Noch ${g.u-s} ⭐</div><div class="stage-tag">🔑 bei ⭐ ${g.u}</div>`;
      d.onclick=()=>Core.speak('Sammle noch '+(g.u-s)+' Sterne, dann kannst du '+g.n+' spielen.');
    }
    grid.appendChild(d);
  });
};

// ---------- Spiel-Engine ----------
UI.G={total:0};
UI.startGame=id=>{ show('s-game'); UI.refreshStars(); UI.G={total:0, id}; const fn=Games[id]; if(fn) fn(); else UI.goHome(); };
UI.celebrate=cb=>{ const em=['🎉','⭐','👏','🌟','🥳']; UI.area().innerHTML=`<div class="bigemoji">${em[(Math.random()*em.length)|0]}</div><div class="prompt">Super gemacht!</div>`; Core.speak('Super gemacht!'); setTimeout(cb,1300); };
UI.endRound=(skill,correct,key,next)=>{
  Core.recordResult(skill,correct,key); UI.G.total++; UI.refreshStars();
  if(Core.sessionOver()){ setTimeout(()=>UI.pause(),correct?800:1200); return; }
  if(UI.G.total>=6){ UI.celebrate(UI.goHome); }
  else setTimeout(next, correct?850:1300);
};
UI.pause=()=>{ show('s-game'); UI.area().innerHTML=`<div class="bigemoji">😴</div><div class="prompt">Pause-Zeit! Gut gespielt.</div>
  <button class="btn green big" onclick="UI.goHome()">Zur Übersicht</button>`; Core.speak('Das war eine tolle Spielzeit. Jetzt machen wir eine Pause.'); };

// ---------- Eltern-Dashboard ----------
UI.openParent=()=>{
  show('s-parent'); const P=Core.P(), s=P.sessions||[];
  // Profil-Wechsler
  const profs=Core.allProfiles();
  let html=`<div class="prow"><b>Kind:</b> `;
  profs.forEach(n=>html+=`<button class="chip ${n===P.name?'on':''}" onclick="UI.switchP('${n}')">${n}</button> `);
  html+=`<button class="chip" onclick="UI.newChild()">＋ Neu</button></div>`;
  html+=`<div class="summary-row"><b>${P.name}</b><span>${starStr()}</span></div>`;
  html+=`<div class="summary-row"><span>Runden gesamt</span><b>${s.length}</b></div>`;
  // Fähigkeiten: Level (adaptiv) + Genauigkeit
  const by={}; s.forEach(r=>{by[r.skill]=by[r.skill]||{c:0,n:0};by[r.skill].n++;if(r.correct)by[r.skill].c++;});
  html+=`<h3 style="margin:14px 0 6px">Fähigkeiten</h3>`;
  Object.keys(SKILL_LABEL).forEach(k=>{
    const lvl=Math.round(P.abilities[k]||2), lvlPct=Math.round(100*(P.abilities[k]-1)/11);
    const acc=by[k]?Math.round(100*by[k].c/by[k].n):null;
    html+=`<div class="skill"><div class="prow"><span>${SKILL_LABEL[k]}</span><b>Level ${lvl}/12${acc!=null?' · '+acc+'%':''}</b></div>
      <div class="bar"><i style="width:${lvlPct}%"></i></div></div>`;
  });
  // Übungsschwerpunkt (niedrigste Genauigkeit)
  const weakest=Object.keys(by).filter(k=>by[k].n>=3).sort((a,b)=>by[a].c/by[a].n-by[b].c/by[b].n)[0];
  if(weakest) html+=`<p class="muted" style="margin-top:10px">💡 Übungsschwerpunkt: <b>${SKILL_LABEL[weakest]}</b> — hier lohnt sich mehr Übung.</p>`;
  // Fehler-Muster
  const misses=Object.entries(P.misses||{}).sort((a,b)=>b[1]-a[1]).slice(0,5);
  if(misses.length){ html+=`<h3 style="margin:14px 0 6px">Häufige Stolpersteine</h3><p class="muted">`+
    misses.map(([k,c])=>readableMiss(k)+' ('+c+'×)').join(' · ')+`</p>`; }
  // Session-Limit
  html+=`<h3 style="margin:14px 0 6px">Spielzeit pro Sitzung</h3>
    <div class="prow"><button class="chip" onclick="UI.limit(-5)">−5</button>
    <b id="limVal">${P.settings.limitMin} Min</b>
    <button class="chip" onclick="UI.limit(5)">+5</button></div>`;
  html+=`<p class="muted" style="margin-top:16px">Hinweis: Werte sind Übungs-Indikatoren, keine medizinische Diagnose. Audio wird nur lokal verarbeitet.</p>`;
  $('parentBody').innerHTML=html;
};
function readableMiss(k){
  if(k.startsWith('span'))return 'Reihe merken ('+k.slice(4)+')';
  if(k.startsWith('back'))return 'Rückwärts ('+k.slice(4)+')';
  if(k.startsWith('anl'))return 'Anlaut '+k.slice(3);
  if(k.startsWith('mp'))return 'Wortpaar '+k.slice(2);
  if(k.startsWith('inst'))return 'Anweisung ('+k.slice(4)+' Schritte)';
  if(k.startsWith('del'))return 'Laut '+k.slice(3)+' weg';
  const m={miss:'Was fehlt',tray:'Tablett',nback:'Gleich/anders',fig:'Wort im Gewusel',cat:'Kategorien',sent:'Satz bauen',story:'Geschichte',rhyme:'Reime',syll:'Silben',menge:'Menge',mehr:'Mehr/Weniger',plus:'Plus'};
  return m[k]||k;
}
UI.switchP=n=>{ Core.switchProfile(n); UI.openParent(); };
UI.newChild=()=>{ show('s-onboard'); document.getElementById('childName').value=''; };
UI.limit=d=>{ const P=Core.P(); P.settings.limitMin=Math.max(5,Math.min(60,(P.settings.limitMin||15)+d)); Core.save(); $('limVal').textContent=P.settings.limitMin+' Min'; };
UI.resetAll=()=>{ if(confirm('Wirklich alle Daten aller Kinder löschen?')){ Core.resetAll(); show('s-onboard'); } };

// ---------- Boot ----------
UI.boot=()=>{ Core.ensureVoices(); UI.initOnboard(); if(Core.hasProfile()) UI.goHome(); else show('s-onboard'); };
})();
