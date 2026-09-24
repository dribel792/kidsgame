/* games.js — alle Lernspiele. Global window.Games.
   Jedes Spiel rendert in UI.area() und ruft UI.endRound(skill, correct, itemKey, nextFn). */
(function(){
const {shuffle,sample,speak,speakSounds,ability,diff}=window.Core;
const C=window.C, Core=window.Core;
const A=()=>window.UI.area();
const end=(...a)=>window.UI.endRound(...a);
const G={}; window.Games=G;

const optTile=(txt,big)=>{ const d=document.createElement('div'); d.className='opt'; if(big) d.style.fontSize='clamp(28px,7vw,48px)'; d.textContent=txt; return d; };
const wordsByCat=cat=>C.WORDS.filter(w=>w.cat===cat);

/* ---------- 1. Merk die Reihe (forward span) ---------- */
G.memory=()=>{
  const len=Math.max(2,Math.min(2+diff('memory',{per:2}),6));
  const pool=sample(C.WORDS.filter(w=>w.cat==='Tiere'||w.cat==='Obst'),Math.max(4,len+1));
  const seq=sample(pool,len);
  A().innerHTML=`<div class="prompt">Merk dir die Reihe! 👀</div><div class="options" id="o"></div><div class="mic-status" id="m">Schau gut hin…</div>`;
  const box=document.getElementById('o'),nodes={};
  pool.forEach(p=>{const d=optTile(p.e);box.appendChild(d);nodes[p.w]=d;});
  let i=0; speak('Merk dir die Reihe.');
  (function play(){ if(i>=seq.length){setTimeout(input,400);return;}
    const n=nodes[seq[i].w]; n.classList.add('lit'); speak(seq[i].w);
    setTimeout(()=>{n.classList.remove('lit');i++;setTimeout(play,300);},800);})();
  function input(){ document.getElementById('m').textContent='Jetzt du! Tippe die Reihe.'; speak('Jetzt du.');
    let pos=0,bad=false;
    Object.entries(nodes).forEach(([w,n])=>n.onclick=()=>{ if(bad)return;
      if(w===seq[pos].w){ n.classList.add('right');speak(w);pos++; if(pos>=seq.length) setTimeout(()=>end('memory',true,'span'+len,G.memory),400); }
      else{ bad=true;n.classList.add('wrong');speak('Fast!');end('memory',false,'span'+len,G.memory);} });
  }
};

/* ---------- 2. Rückwärts-Merken ---------- */
G.memback=()=>{
  const len=Math.max(2,Math.min(2+Math.floor(ability('memory')/3),5));
  const pool=sample(C.WORDS,Math.max(4,len+2)), seq=sample(pool,len);
  A().innerHTML=`<div class="prompt">🔁 Merk dir die Reihe — dann RÜCKWÄRTS!</div><div class="options" id="o"></div><div class="mic-status" id="m"></div>`;
  const box=document.getElementById('o'),nodes={};
  pool.forEach(p=>{const d=optTile(p.e);box.appendChild(d);nodes[p.w]=d;});
  let i=0; speak('Merk dir die Reihe. Dann rückwärts.');
  (function play(){ if(i>=seq.length){setTimeout(input,400);return;}
    const n=nodes[seq[i].w];n.classList.add('lit');speak(seq[i].w);
    setTimeout(()=>{n.classList.remove('lit');i++;setTimeout(play,300);},800);})();
  function input(){ const rev=seq.slice().reverse(); document.getElementById('m').textContent='Jetzt rückwärts! Letztes zuerst.'; speak('Jetzt rückwärts. Das letzte zuerst.');
    let pos=0,bad=false;
    Object.entries(nodes).forEach(([w,n])=>n.onclick=()=>{ if(bad)return;
      if(w===rev[pos].w){n.classList.add('right');speak(w);pos++; if(pos>=rev.length) setTimeout(()=>end('memory',true,'back'+len,G.memback),400);}
      else{bad=true;n.classList.add('wrong');speak('Fast!');end('memory',false,'back'+len,G.memback);} });
  }
};

/* ---------- 3. Was fehlt? ---------- */
G.missing=()=>{
  const n=Math.max(3,Math.min(3+diff('memory',{per:2}),7));
  const items=sample(C.WORDS,n);
  A().innerHTML=`<div class="prompt">Merk dir die Bilder! 👀</div><div class="options" id="o"></div><div class="mic-status" id="m">Gleich verschwindet eins…</div>`;
  const box=document.getElementById('o'); items.forEach(it=>box.appendChild(optTile(it.e)));
  speak('Merk dir die Bilder.');
  setTimeout(()=>{
    const gone=items[(Math.random()*items.length)|0];
    box.innerHTML=''; items.forEach(it=>{const d=optTile(it.w===gone.w?'❓':it.e); if(it.w===gone.w)d.classList.add('lit'); box.appendChild(d);});
    document.getElementById('m').textContent='Was fehlt? Tippe es unten.';
    const row=document.createElement('div'); row.className='options'; A().appendChild(row);
    shuffle(items).forEach(it=>{ const d=optTile(it.e); row.appendChild(d);
      d.onclick=()=>{ if(it.w===gone.w){d.classList.add('right');speak('Richtig! '+gone.w+' hat gefehlt.');end('memory',true,'miss',G.missing);}
        else{d.classList.add('wrong');speak('Schau nochmal.');end('memory',false,'miss',G.missing);} };
    });
    speak('Was fehlt?');
  },1200+n*250);
};

/* ---------- 4. Folge der Anweisung (multi-step) ---------- */
G.instruct=()=>{
  const steps=Math.max(1,Math.min(1+Math.floor(ability('memory')/2),4));
  const items=sample(C.WORDS,Math.max(4,steps+2));
  const order=sample(items,steps);
  A().innerHTML=`<div class="prompt">👂 Hör gut zu und tippe der Reihe nach!</div>
    <button class="btn blue" id="rep">🔊 Nochmal hören</button><div class="options" id="o"></div><div class="mic-status" id="m"></div>`;
  const box=document.getElementById('o'),nodes={};
  items.forEach(it=>{const d=optTile(it.e);box.appendChild(d);nodes[it.w]=d;});
  const say='Tippe: '+order.map((it,i)=>(i===0?'zuerst ':i===order.length-1&&order.length>1?'und dann ':'dann ')+'den '+it.w).join(', ');
  const play=()=>speak(say,{rate:0.9}); document.getElementById('rep').onclick=play; setTimeout(play,400);
  let pos=0,bad=false;
  Object.entries(nodes).forEach(([w,nd])=>nd.onclick=()=>{ if(bad)return;
    if(w===order[pos].w){nd.classList.add('right');speak(w);pos++; if(pos>=order.length)setTimeout(()=>end('memory',true,'inst'+steps,G.instruct),400);}
    else{bad=true;nd.classList.add('wrong');speak('Hör nochmal.');end('memory',false,'inst'+steps,G.instruct);} });
};

/* ---------- 5. Tablett merken (Kim) ---------- */
G.tray=()=>{
  const n=Math.max(3,Math.min(3+diff('memory',{per:2.5}),6));
  const seen=sample(C.WORDS,n);
  A().innerHTML=`<div class="prompt">🪄 Merk dir das Tablett!</div><div class="options" id="o"></div><div class="mic-status" id="m"></div>`;
  const box=document.getElementById('o'); seen.forEach(it=>box.appendChild(optTile(it.e))); speak('Merk dir alles auf dem Tablett.');
  setTimeout(()=>{
    document.getElementById('m').textContent='Welche waren dabei? Tippe sie an, dann „Fertig".';
    box.innerHTML=''; const others=sample(C.WORDS.filter(w=>!seen.find(s=>s.w===w.w)),n);
    const all=shuffle([...seen,...others]); const picked=new Set();
    all.forEach(it=>{ const d=optTile(it.e); box.appendChild(d);
      d.onclick=()=>{ if(picked.has(it.w)){picked.delete(it.w);d.classList.remove('right');} else {picked.add(it.w);d.classList.add('right');} };
    });
    const b=document.createElement('button'); b.className='btn green big'; b.textContent='Fertig ✓'; A().appendChild(b);
    b.onclick=()=>{ const ok=seen.every(s=>picked.has(s.w))&&picked.size===seen.length;
      speak(ok?'Super, alle richtig!':'Fast! Schau nochmal.'); end('memory',ok,'tray',G.tray); };
    speak('Welche Bilder waren dabei?');
  },1200+n*300);
};

/* ---------- 6. Gleich oder anders? (1-back lite) ---------- */
G.nback=()=>{
  const pool=sample(C.WORDS.filter(w=>w.cat==='Tiere'),4);
  const same=Math.random()<0.5;
  const a=pool[0], b=same?a:pool[1];
  A().innerHTML=`<div class="prompt">Merk dir das Bild…</div><div class="bigemoji" id="big">${a.e}</div><div class="mic-status" id="m"></div>`;
  speak('Merk dir das.');
  setTimeout(()=>{ document.getElementById('big').textContent='❓';
    setTimeout(()=>{ document.getElementById('big').textContent=b.e;
      document.getElementById('m').textContent='Gleich oder anders?';
      const row=document.createElement('div'); row.className='row'; A().appendChild(row);
      const mk=(t,val,cls)=>{const btn=document.createElement('button');btn.className='btn '+cls;btn.textContent=t;btn.onclick=()=>{
        const ok=(val===same); speak(ok?'Richtig!':'Schau nochmal.'); end('memory',ok,'nback',G.nback);};return btn;};
      row.appendChild(mk('✅ Gleich',true,'green')); row.appendChild(mk('❌ Anders',false,'orange'));
      speak('War das gleich oder anders?');
    },700);
  },1000);
};

/* ---------- 7. Rhythmus nachklopfen ---------- */
G.rhythm=()=>{
  const k=Math.max(2,Math.min(2+diff('memory',{per:2}),6));
  A().innerHTML=`<div class="prompt">🥁 Hör zu und klopfe genau so oft!</div><div class="mic-status" id="m">Hör gut hin…</div>`;
  let i=0; speak('Hör zu.');
  (function beat(){ if(i>=k){ setTimeout(tap,500); return; } speak('klopf',{rate:1,pitch:1}); i++; setTimeout(beat,600); })();
  function tap(){ document.getElementById('m').textContent='Jetzt du! Klopfe die Trommel.';
    let c=0; const drum=document.createElement('div'); drum.className='bigemoji'; drum.style.cursor='pointer'; drum.textContent='🥁'; A().appendChild(drum);
    const cnt=document.createElement('div'); cnt.className='prompt'; cnt.textContent='0'; A().appendChild(cnt);
    drum.onclick=()=>{ c++; cnt.textContent=c; drum.style.transform='scale(0.9)'; setTimeout(()=>drum.style.transform='',80); speak('klopf'); };
    const b=document.createElement('button'); b.className='btn green big'; b.textContent='Fertig ✓'; A().appendChild(b);
    b.onclick=()=>{ const ok=c===k; speak(ok?'Genau richtig!':'Es waren '+k+'.'); end('memory',ok,'rhythm'+k,G.rhythm); };
    speak('Jetzt du.');
  }
};

/* ---------- 8. Laute verschmelzen (Lautsynthese) ---------- */
G.blend=()=>{
  const item=Core.pickWithWeak('phonics',C.BLEND,x=>x.w);
  const n=Math.max(2,Math.min(2+diff('phonics',{per:3}),4));
  const opts=shuffle([item,...sample(C.BLEND.filter(x=>x.w!==item.w),n-1)]);
  A().innerHTML=`<div class="prompt">🔤 Welches Wort ist das?</div>
    <button class="btn green" id="rep">🔊 Laute nochmal</button><div class="options" id="o"></div>`;
  const box=document.getElementById('o');
  opts.forEach(o=>{ const d=optTile(o.e); box.appendChild(d);
    d.onclick=()=>{ if(o.w===item.w){d.classList.add('right');speak('Richtig! '+item.w);end('phonics',true,item.w,G.blend);}
      else{d.classList.add('wrong');speak('Hör nochmal.');end('phonics',false,item.w,G.blend);} } });
  const play=()=>speakSounds(item.snd,650); document.getElementById('rep').onclick=play; setTimeout(play,500);
};

/* ---------- 9. Reim-Paare ---------- */
const RHYME=[['Haus','Maus'],['Kuh','Schuh'],['Hose','Rose'],['Bein','Wein'],['Tisch','Fisch'],['Ball','Fall'],['Baum','Traum'],['Hut','gut'],['Katze','Tatze'],['Sonne','Tonne'],['Maus','Laus'],['Nase','Hase']];
const NORHY=['Auto','Blume','Apfel','Vogel','Wasser','Banane','Fenster','Löffel'];
G.rhyme=()=>{
  const yes=Math.random()<0.5; let a,b;
  if(yes){ const p=RHYME[(Math.random()*RHYME.length)|0]; a=p[0];b=p[1]; }
  else { a=RHYME[(Math.random()*RHYME.length)|0][0]; b=NORHY[(Math.random()*NORHY.length)|0]; }
  A().innerHTML=`<div class="prompt">Reimt sich das?</div>
    <div class="prompt" style="font-size:clamp(24px,6vw,40px)">„${a}" — „${b}"</div>
    <button class="btn blue" id="rep">🔊 Nochmal</button><div class="row" id="o"></div>`;
  const play=()=>speak(a+' … '+b,{rate:0.8}); document.getElementById('rep').onclick=play; setTimeout(play,400);
  const box=document.getElementById('o');
  const mk=(t,val,cls)=>{const btn=document.createElement('button');btn.className='btn '+cls;btn.textContent=t;btn.onclick=()=>{
    const ok=(val===yes);speak(ok?'Richtig!':(yes?'Doch, das reimt sich!':'Nein, das reimt sich nicht.'));end('phonics',ok,'rhyme',G.rhyme);};return btn;};
  box.appendChild(mk('✅ Reimt sich',true,'green')); box.appendChild(mk('❌ Reimt nicht',false,'orange'));
};

/* ---------- 10. Silben klatschen ---------- */
G.syll=()=>{
  const maxS=diff('phonics')>=4?3:2;
  const item=Core.pickWithWeak('phonics',C.WORDS.filter(w=>w.s<=Math.max(2,maxS+1)),x=>x.w);
  A().innerHTML=`<div class="bigemoji">${item.e}</div><div class="prompt">👏 Wie viele Silben hat „${item.w}"?</div>
    <button class="btn green" id="rep">🔊 Klatsch-Hilfe</button><div class="row" id="o"></div>`;
  const play=()=>{ const parts=item.w; speak(item.w,{rate:0.6}); }; document.getElementById('rep').onclick=play; setTimeout(()=>speak('Wie viele Silben hat '+item.w+'?',{rate:0.8}),400);
  const box=document.getElementById('o');
  [1,2,3,4].forEach(nn=>{ const b=document.createElement('button'); b.className='btn blue'; b.style.minWidth='72px'; b.textContent=nn; box.appendChild(b);
    b.onclick=()=>{ const ok=nn===item.s; speak(ok?'Richtig! '+item.s+' Silben.':item.w+' hat '+item.s+' Silben.'); end('phonics',ok,'syll',G.syll); }; });
};

/* ---------- 11. Anlaut/Auslaut-Detektiv ---------- */
G.phonics=()=>{
  const aus=ability('phonics')>=4 && Math.random()<0.4;
  const item=Core.pickWithWeak('phonics',C.WORDS,x=>x.w);
  const correct=(aus?item.w.slice(-1):item.w[0]).toUpperCase();
  const pool='ABDEFGHKLMNOPRSTUWZ'.split('').filter(x=>x!==correct);
  const n=Math.max(2,Math.min(2+diff('phonics',{per:3}),4));
  const opts=shuffle([correct,...sample(pool,n-1)]);
  const frage=aus?`Womit hört „${item.w}" auf?`:`Womit fängt „${item.w}" an?`;
  A().innerHTML=`<div class="bigemoji">${item.e}</div><div class="prompt">${frage}</div>
    <button class="btn green" id="rep">🔊 Nochmal</button><div class="options" id="o"></div>`;
  document.getElementById('rep').onclick=()=>speak(item.w,{rate:0.65}); setTimeout(()=>speak('Hör genau hin. '+item.w+'. '+frage,{rate:0.72}),400);
  const box=document.getElementById('o');
  opts.forEach(L=>{ const d=optTile(L); d.style.fontWeight='900'; box.appendChild(d);
    d.onclick=()=>{ if(L===correct){d.classList.add('right');speak('Richtig!');end('phonics',true,'anl'+correct,G.phonics);}
      else{d.classList.add('wrong');speak('Hör nochmal. '+item.w,{rate:0.65});end('phonics',false,'anl'+correct,G.phonics);} } });
};

/* ---------- 12. Laut wegnehmen ---------- */
const DELETE=[['Maus','M','aus'],['Hut','H','ut'],['Ball','B','all'],['Rose','R','ose'],['Wald','W','ald'],['Tanne','T','anne'],['Sonne','S','onne'],['Reis','R','eis']];
G.delete=()=>{
  const [w,rem,rest]=DELETE[(Math.random()*DELETE.length)|0];
  const distr=shuffle(DELETE.filter(d=>d[2]!==rest)).slice(0,2).map(d=>d[2]);
  const opts=shuffle([rest,...distr]);
  A().innerHTML=`<div class="prompt">🧙 Zauber-Laute!</div>
    <div class="prompt" style="font-size:clamp(22px,5vw,34px)">Sag „${w}" — aber ohne „${rem}". Was bleibt?</div>
    <button class="btn green" id="rep">🔊 Nochmal</button><div class="row" id="o"></div>`;
  document.getElementById('rep').onclick=()=>speak(w+' … ohne '+rem,{rate:0.7}); setTimeout(()=>speak(w+'. Ohne '+rem+'. Was bleibt übrig?',{rate:0.75}),400);
  const box=document.getElementById('o');
  opts.forEach(o=>{ const b=document.createElement('button'); b.className='btn blue'; b.textContent=o; box.appendChild(b);
    b.onclick=()=>{ const ok=o===rest; speak(ok?'Richtig! '+rest:'Es bleibt '+rest+'.'); end('phonics',ok,'del'+rem,G.delete); }; });
};

/* ---------- 13. Minimalpaare unterscheiden ---------- */
G.minpair=()=>{
  const pair=C.MIN_PAIRS[(Math.random()*C.MIN_PAIRS.length)|0];
  const said=pair[(Math.random()*2)|0];
  A().innerHTML=`<div class="prompt">👂 Welches Wort hörst du?</div>
    <button class="btn blue big" id="rep">🔊 Hören</button><div class="row" id="o"></div>`;
  const play=()=>speak(said,{rate:0.75}); document.getElementById('rep').onclick=play; setTimeout(play,500);
  const box=document.getElementById('o');
  shuffle(pair.slice()).forEach(w=>{ const b=document.createElement('button'); b.className='btn purple'; b.textContent=w; box.appendChild(b);
    b.onclick=()=>{ const ok=w===said; speak(ok?'Richtig! '+said:'Ich habe '+said+' gesagt.'); end('auditory',ok,'mp'+pair.join(),G.minpair); }; });
};

/* ---------- 14. Wort im Geräusch (figure-ground) ---------- */
G.figure=()=>{
  const n=Math.max(2,Math.min(2+diff('auditory',{per:3}),4));
  const opts=sample(C.WORDS,n); const target=opts[(Math.random()*opts.length)|0];
  const fillers=['ähm','pass auf','und','schau','fertig'];
  A().innerHTML=`<div class="prompt">🎧 Finde das Wort im Gewusel!</div>
    <button class="btn blue" id="rep">🔊 Nochmal</button><div class="options" id="o"></div>`;
  const play=()=>{ const f1=fillers[(Math.random()*fillers.length)|0],f2=fillers[(Math.random()*fillers.length)|0];
    speak(f1,{rate:1.3,pitch:0.9}); setTimeout(()=>speak(target.w,{rate:0.8}),500); setTimeout(()=>speak(f2,{rate:1.3,pitch:0.9}),1100); };
  document.getElementById('rep').onclick=play; setTimeout(play,500);
  const box=document.getElementById('o');
  opts.forEach(o=>{ const d=optTile(o.e); box.appendChild(d);
    d.onclick=()=>{ const ok=o.w===target.w; d.classList.add(ok?'right':'wrong'); speak(ok?'Richtig! '+target.w:'Es war '+target.w); end('auditory',ok,'fig',G.figure); } });
};

/* ---------- 15. Kategorien / Oberbegriffe (odd one out) ---------- */
G.category=()=>{
  const cats=shuffle(C.CATEGORIES).filter(c=>wordsByCat(c).length>=3);
  const main=cats[0], other=cats[1];
  const group=sample(wordsByCat(main),3), odd=sample(wordsByCat(other),1)[0];
  const opts=shuffle([...group,odd]);
  A().innerHTML=`<div class="prompt">🔍 Was passt nicht dazu?</div><div class="options" id="o"></div>
    <div class="mic-status">3 gehören zusammen — eins nicht.</div>`;
  const box=document.getElementById('o');
  opts.forEach(o=>{ const d=optTile(o.e); box.appendChild(d);
    d.onclick=()=>{ const ok=o.w===odd.w; d.classList.add(ok?'right':'wrong');
      speak(ok?'Richtig! '+odd.w+' ist kein '+main.replace(/e$/,'').toLowerCase():'Schau nochmal.'); end('language',ok,'cat'+main,G.category); } });
  setTimeout(()=>speak('Was passt nicht dazu?'),400);
};

/* ---------- 16. Gegenteile ---------- */
G.opposite=()=>{
  const pair=C.OPPOSITES[(Math.random()*C.OPPOSITES.length)|0];
  const [a,b]=Math.random()<0.5?pair:[pair[1],pair[0]];
  const distr=shuffle(C.OPPOSITES.flat().filter(w=>w!==a&&w!==b)).slice(0,2);
  const opts=shuffle([b,...distr]);
  A().innerHTML=`<div class="prompt">↔️ Was ist das Gegenteil von…</div>
    <div class="prompt" style="font-size:clamp(30px,8vw,52px)">„${a}"?</div><div class="row" id="o"></div>`;
  setTimeout(()=>speak('Was ist das Gegenteil von '+a+'?'),400);
  const box=document.getElementById('o');
  opts.forEach(o=>{ const btn=document.createElement('button'); btn.className='btn purple'; btn.textContent=o; box.appendChild(btn);
    btn.onclick=()=>{ const ok=o===b; speak(ok?'Richtig! '+a+' und '+b:'Das Gegenteil ist '+b); end('language',ok,'opp'+a,G.opposite); }; });
};

/* ---------- 17. Satz bauen ---------- */
const SENTENCES=[['Der','Hund','läuft','schnell'],['Die','Katze','trinkt','Milch'],['Das','Kind','isst','einen','Apfel'],['Der','Bär','schläft','im','Wald'],['Die','Sonne','ist','gelb']];
G.sentence=()=>{
  const s=SENTENCES[(Math.random()*SENTENCES.length)|0];
  const scr=shuffle(s.map((w,i)=>({w,i})));
  A().innerHTML=`<div class="prompt">🧩 Baue den Satz — tippe die Wörter der Reihe nach!</div>
    <div class="prompt" id="built" style="min-height:40px;color:var(--green)"></div><div class="row" id="o"></div>`;
  setTimeout(()=>speak('Baue einen richtigen Satz.'),400);
  const box=document.getElementById('o'),built=document.getElementById('built'); let pos=0,bad=false;
  scr.forEach(t=>{ const btn=document.createElement('button'); btn.className='btn blue'; btn.textContent=t.w; box.appendChild(btn);
    btn.onclick=()=>{ if(bad||btn.disabled)return;
      if(t.i===pos){ btn.disabled=true; btn.style.opacity=.4; built.textContent+=(pos?' ':'')+t.w; speak(t.w); pos++;
        if(pos>=s.length){ speak('Super! '+s.join(' ')); setTimeout(()=>end('language',true,'sent',G.sentence),500);} }
      else { bad=true; btn.classList.add('wrong'); speak('Hm, welches Wort kommt zuerst?'); setTimeout(()=>end('language',false,'sent',G.sentence),700);} }; });
};

/* ---------- 18. Erzähl das Bild (mic + fallback) ---------- */
G.describe=()=>{
  const item=sample(C.WORDS,1)[0];
  A().innerHTML=`<div class="bigemoji">${item.e}</div><div class="prompt">Erzähl mir: Was siehst du?</div>
    <button class="btn pink big" id="mic">🎤 Erzählen</button><div class="mic-status" id="m"></div>
    <div class="row" id="fb" style="display:none"></div>`;
  setTimeout(()=>speak('Was siehst du? Erzähl es mir!'),400);
  const m=document.getElementById('m'),fb=document.getElementById('fb');
  const showFb=()=>{ fb.style.display='flex'; fb.innerHTML='';
    const y=document.createElement('button');y.className='btn green';y.textContent='✅ Gut erzählt';y.onclick=()=>{speak('Toll erzählt!');end('language',true,'descr',G.describe);};
    const nB=document.createElement('button');nB.className='btn orange';nB.textContent='🔁 Nochmal';nB.onclick=G.describe; fb.append(y,nB); };
  document.getElementById('mic').onclick=()=>{ if(!Core.micAvailable){ m.textContent='(Kein Mikro — Eltern bewerten)'; showFb(); return; }
    m.textContent='Ich höre zu… 👂'; m.classList.add('listening');
    Core.listenOnce({timeout:8000,onResult:alts=>{ m.classList.remove('listening');
      const words=Core.norm(alts[0]||'').split(' ').filter(Boolean);
      const ok=words.length>=2 || Core.heard(alts,item.w);
      m.textContent=ok?('Schön: „'+(alts[0]||'')+'" ✅'):'Erzähl mir noch ein bisschen mehr 🙂';
      speak(ok?'Toll erzählt!':'Erzähl mir noch mehr.'); ok?end('language',true,'descr',G.describe):showFb();
    },onError:()=>{ m.classList.remove('listening'); m.textContent='Nicht verstanden — nochmal? 🎤'; showFb(); }}); };
};

/* ---------- 19. Schnell benennen (Wortfindung, timed) ---------- */
G.naming=()=>{
  const cat=shuffle(C.CATEGORIES).find(c=>wordsByCat(c).length>=4)||'Tiere';
  A().innerHTML=`<div class="prompt">⏱️ Nenne so viele ${cat} wie du kannst!</div>
    <button class="btn pink big" id="mic">🎤 Los!</button><div class="prompt" id="cnt">0</div><div class="mic-status" id="m"></div>
    <div class="row" id="fb" style="display:none"></div>`;
  setTimeout(()=>speak('Nenne so viele '+cat+' wie du kannst!'),400);
  const m=document.getElementById('m'),cntEl=document.getElementById('cnt'),fb=document.getElementById('fb');
  const valid=wordsByCat(cat).map(w=>Core.norm(w.w));
  const finish=c=>{ const ok=c>=2; speak(ok?('Super! '+c+' Stück!'):'Übe weiter!'); end('language',ok,'name'+cat,G.naming); };
  const manualFb=()=>{ fb.style.display='flex'; fb.innerHTML=''; [2,3,4,5].forEach(k=>{const b=document.createElement('button');b.className='btn green';b.style.minWidth='60px';b.textContent=k+'+';b.onclick=()=>finish(k);fb.appendChild(b);}); };
  document.getElementById('mic').onclick=()=>{ if(!Core.micAvailable){ m.textContent='(Kein Mikro — wie viele hat sie genannt?)'; manualFb(); return; }
    m.textContent='Ich zähle mit… 👂'; m.classList.add('listening');
    Core.listenOnce({timeout:9000,onResult:alts=>{ m.classList.remove('listening');
      const said=Core.norm(alts.join(' ')); const hits=valid.filter(v=>said.includes(v)).length;
      cntEl.textContent=hits; finish(hits);
    },onError:()=>{ m.classList.remove('listening'); m.textContent='Sag sie nochmal 🎤'; manualFb(); }}); };
};

/* ---------- 20. Geschichte hören → Fragen ---------- */
G.story=()=>{
  const st=C.STORIES[(Math.random()*C.STORIES.length)|0];
  A().innerHTML=`<div class="prompt">📖 Hör gut zu…</div><div class="mic-status" id="m" style="max-width:520px">${st.text.join(' ')}</div>
    <button class="btn blue" id="rep">🔊 Nochmal hören</button><div id="qwrap"></div>`;
  const play=()=>speak(st.text.join(' '),{rate:0.85}); document.getElementById('rep').onclick=play; setTimeout(play,400);
  let qi=0;
  const ask=()=>{ const q=st.q[qi]; const wrap=document.getElementById('qwrap');
    wrap.innerHTML=`<div class="prompt" style="margin-top:14px">${q.q}</div><div class="row" id="o"></div>`;
    setTimeout(()=>speak(q.q),300);
    const box=document.getElementById('o');
    shuffle(q.opts.slice()).forEach(o=>{ const b=document.createElement('button'); b.className='btn purple'; b.textContent=o; box.appendChild(b);
      b.onclick=()=>{ const ok=o===q.a; speak(ok?'Richtig!':'Die Antwort war '+q.a);
        end('memory',ok,'story',qi+1<st.q.length?ask:G.story); qi++; }; }); };
  // Fragen erst nach dem Vorlesen
  setTimeout(ask, st.text.join(' ').length*55+800);
};

/* ---------- 21. Zahlen: Mengen / Mehr-Weniger / Plus ---------- */
G.math=()=>{
  const lvl=diff('math'); const item=sample(C.WORDS,1)[0];
  if(lvl<=2){ // Menge erkennen
    const max=lvl<=1?4:6, count=1+((Math.random()*max)|0);
    A().innerHTML=`<div class="prompt">Wie viele? 🔢</div><div style="font-size:clamp(34px,9vw,60px)">${item.e.repeat(count)}</div><div class="row" id="o"></div>`;
    const box=document.getElementById('o'); shuffle(Array.from({length:max},(_,i)=>i+1)).forEach(nn=>{const b=document.createElement('button');b.className='btn blue';b.style.minWidth='60px';b.textContent=nn;box.appendChild(b);
      b.onclick=()=>{const ok=nn===count;speak(ok?'Richtig! '+count:'Zähl nochmal.');end('math',ok,'menge',G.math);};});
    let k=0;setTimeout(function t(){if(k<count){k++;speak(String(k),{rate:0.9});setTimeout(t,650);}},500);
  } else if(lvl<=4){ // Mehr / Weniger
    let a=1+((Math.random()*6)|0), b=1+((Math.random()*6)|0); while(a===b)b=1+((Math.random()*6)|0);
    A().innerHTML=`<div class="prompt">Wo sind MEHR? 👀</div><div class="row" id="o"></div>`;
    const box=document.getElementById('o');
    [[a,'green'],[b,'orange']].forEach(([c,cl])=>{const d=document.createElement('div');d.className='opt';d.style.width='auto';d.style.padding='16px';d.style.fontSize='clamp(24px,6vw,40px)';d.textContent=item.e.repeat(c);box.appendChild(d);
      d.onclick=()=>{const ok=c===Math.max(a,b);speak(ok?'Richtig!':'Da sind weniger.');end('math',ok,'mehr',G.math);};});
    setTimeout(()=>speak('Wo sind mehr?'),400);
  } else { // Plus
    const a=1+((Math.random()*4)|0), b=1+((Math.random()*4)|0), sum=a+b;
    A().innerHTML=`<div class="prompt">Rechne! ➕</div><div style="font-size:clamp(24px,6vw,42px)">${item.e.repeat(a)} + ${item.e.repeat(b)} = ?</div><div class="row" id="o"></div>`;
    const box=document.getElementById('o'); const opts=new Set([sum]); while(opts.size<3)opts.add(Math.max(1,sum+(((Math.random()*5)|0)-2)));
    shuffle([...opts]).forEach(nn=>{const btn=document.createElement('button');btn.className='btn blue';btn.style.minWidth='60px';btn.textContent=nn;box.appendChild(btn);
      btn.onclick=()=>{const ok=nn===sum;speak(ok?'Richtig! '+sum:'Zähl alle zusammen.');end('math',ok,'plus',G.math);};});
    setTimeout(()=>speak(a+' plus '+b+'?'),400);
  }
};

/* ---------- Einfache Aufwärmspiele (aus MVP) ---------- */
G.listen=()=>{
  const n=Math.max(2,Math.min(2+diff('auditory',{per:3}),4));
  const opts=sample(C.WORDS,n), target=opts[(Math.random()*opts.length)|0];
  A().innerHTML=`<div class="prompt">👂 Hör zu und finde!</div><button class="btn blue" id="rep">🔊 Nochmal</button><div class="options" id="o"></div>`;
  document.getElementById('rep').onclick=()=>speak(target.w); setTimeout(()=>speak('Wo ist '+target.w+'?'),400);
  const box=document.getElementById('o'); opts.forEach(o=>{const d=optTile(o.e);box.appendChild(d);
    d.onclick=()=>{const ok=o.w===target.w;d.classList.add(ok?'right':'wrong');speak(ok?'Richtig! '+target.w:'Das ist '+o.w);end('auditory',ok,'ls',G.listen);};});
};
G.repeat=()=>{ const item=sample(C.WORDS,1)[0]; micWord({emoji:item.e,text:'Sprich nach: „'+item.w+'"',say:item.w,target:item.w,skill:'language',key:'rep',next:G.repeat}); };
G.name=()=>{ const item=sample(C.WORDS,1)[0]; micWord({emoji:item.e,text:'Was ist das? Sag es laut!',say:'Was ist das?',target:item.w,skill:'language',key:'name',next:G.name}); };
function micWord({emoji,text,say,target,skill,key,next}){
  A().innerHTML=`<div class="bigemoji">${emoji}</div><div class="prompt">${text}</div>
    <button class="btn pink big" id="mic">🎤 Sprechen</button><div class="mic-status" id="m"></div><div class="row" id="fb" style="display:none"></div>`;
  setTimeout(()=>speak(say),400); const m=document.getElementById('m'),fb=document.getElementById('fb');
  const showFb=(okCb)=>{ fb.style.display='flex'; fb.innerHTML='';
    const y=document.createElement('button');y.className='btn green';y.textContent='✅ Geschafft';y.onclick=okCb||(()=>{speak('Toll!');end(skill,true,key,next);});
    const nB=document.createElement('button');nB.className='btn orange';nB.textContent='🔁 Nochmal';nB.onclick=next; fb.append(y,nB); };
  document.getElementById('mic').onclick=()=>{ if(!Core.micAvailable){m.textContent='(Kein Mikro — Eltern tippen)';showFb();return;}
    m.textContent='Ich höre zu… 👂'; m.classList.add('listening');
    Core.listenOnce({onResult:alts=>{ m.classList.remove('listening');
      if(Core.heard(alts,target)){m.textContent='Super: '+target+' ✅';speak('Super! '+target);end(skill,true,key,next);}
      else{m.textContent='Ich hörte „'+(alts[0]||'…')+'". Nochmal?';speak('Fast! Sag nochmal '+target);showFb();}
    },onError:e=>{ m.classList.remove('listening'); if(e==='not-allowed'||e==='service-not-allowed'){m.textContent='Mikro-Erlaubnis fehlt 👇';showFb();} else {m.textContent='Nochmal? 🎤';showFb();} }}); };
}

/* ---------- 22. Stufe 3: Real-World-Aufgabe ---------- */
G.real=()=>{
  const t=C.REAL_TASKS[(Math.random()*C.REAL_TASKS.length)|0];
  A().innerHTML=`<div class="bigemoji">${t.icon}</div><div class="prompt" style="max-width:520px">${t.task}</div>
    <button class="btn pink big" id="mic">🎤 Ich hab's gesagt</button><div class="mic-status" id="m"></div><div class="row" id="fb" style="display:none"></div>`;
  setTimeout(()=>speak('Deine Aufgabe: '+t.task),500);
  const m=document.getElementById('m'),fb=document.getElementById('fb');
  const showFb=()=>{ fb.style.display='flex'; fb.innerHTML='';
    const y=document.createElement('button');y.className='btn green';y.textContent='✅ Hat geklappt';y.onclick=()=>{speak('Super gemacht!');end('language',true,'real',G.real);};
    const nB=document.createElement('button');nB.className='btn orange';nB.textContent='🔁 Nochmal';nB.onclick=G.real; fb.append(y,nB); };
  document.getElementById('mic').onclick=()=>{ if(!Core.micAvailable){m.textContent='(Eltern: hat es geklappt?)';showFb();return;}
    m.textContent='Ich höre zu… 👂'; m.classList.add('listening');
    Core.listenOnce({timeout:9000,onResult:alts=>{ m.classList.remove('listening');
      const ok=Core.heardAny(alts,t.listen); m.textContent=ok?'Toll gemacht! ✅':'Ich hab dich gehört — hat es geklappt?';
      speak(ok?'Toll gemacht!':'Hat es geklappt?'); ok?end('language',true,'real',G.real):showFb();
    },onError:()=>{ m.classList.remove('listening'); m.textContent='Eltern: hat es geklappt?'; showFb(); }}); };
};

})();
