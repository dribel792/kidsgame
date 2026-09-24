/* content.js — Wort- & Aufgabenbank für Lernzeit.
   Reiner Datencontainer, global als window.C. */
(function(){
const C = {};

// Wörter: e=Emoji, w=Wort, s=Silben, cat=Kategorie, r=Reimschlüssel, snd=Lautfolge (für Synthese)
C.WORDS = [
  {e:'🐶',w:'Hund',s:1,cat:'Tiere',r:'und',snd:['h','u','nd']},
  {e:'🐱',w:'Katze',s:2,cat:'Tiere',r:'atze'},
  {e:'🐭',w:'Maus',s:1,cat:'Tiere',r:'aus',snd:['m','au','s']},
  {e:'🐰',w:'Hase',s:2,cat:'Tiere',r:'ase'},
  {e:'🐻',w:'Bär',s:1,cat:'Tiere',r:'är'},
  {e:'🐟',w:'Fisch',s:1,cat:'Tiere',r:'isch',snd:['f','i','sch']},
  {e:'🐸',w:'Frosch',s:1,cat:'Tiere',r:'osch'},
  {e:'🐮',w:'Kuh',s:1,cat:'Tiere',r:'uh',snd:['k','uh']},
  {e:'🐷',w:'Schwein',s:1,cat:'Tiere',r:'ein'},
  {e:'🦆',w:'Ente',s:2,cat:'Tiere',r:'ente'},
  {e:'🐴',w:'Pferd',s:1,cat:'Tiere',r:'erd'},
  {e:'🍎',w:'Apfel',s:2,cat:'Obst',r:'pfel'},
  {e:'🍌',w:'Banane',s:3,cat:'Obst',r:'ane'},
  {e:'🍐',w:'Birne',s:2,cat:'Obst',r:'irne'},
  {e:'🍒',w:'Kirsche',s:2,cat:'Obst',r:'irsche'},
  {e:'🍓',w:'Erdbeere',s:3,cat:'Obst',r:'eere'},
  {e:'🚗',w:'Auto',s:2,cat:'Fahrzeuge',r:'uto'},
  {e:'🚌',w:'Bus',s:1,cat:'Fahrzeuge',r:'us',snd:['b','u','s']},
  {e:'🚲',w:'Rad',s:1,cat:'Fahrzeuge',r:'ad',snd:['r','a','d']},
  {e:'🚂',w:'Zug',s:1,cat:'Fahrzeuge',r:'ug',snd:['z','u','g']},
  {e:'🚢',w:'Schiff',s:1,cat:'Fahrzeuge',r:'iff'},
  {e:'⚽',w:'Ball',s:1,cat:'Spielzeug',r:'all',snd:['b','a','ll']},
  {e:'🎈',w:'Ballon',s:2,cat:'Spielzeug',r:'on'},
  {e:'🧸',w:'Teddy',s:2,cat:'Spielzeug',r:'eddy'},
  {e:'🌞',w:'Sonne',s:2,cat:'Natur',r:'onne'},
  {e:'🌙',w:'Mond',s:1,cat:'Natur',r:'ond'},
  {e:'⭐',w:'Stern',s:1,cat:'Natur',r:'ern'},
  {e:'🌸',w:'Blume',s:2,cat:'Natur',r:'ume',snd:['b','l','u','me']},
  {e:'🌳',w:'Baum',s:1,cat:'Natur',r:'aum',snd:['b','au','m']},
  {e:'🌧️',w:'Regen',s:2,cat:'Natur',r:'egen'},
  {e:'🧦',w:'Socke',s:2,cat:'Kleidung',r:'ocke'},
  {e:'👟',w:'Schuh',s:1,cat:'Kleidung',r:'uh',snd:['sch','uh']},
  {e:'👒',w:'Hut',s:1,cat:'Kleidung',r:'ut',snd:['h','u','t']},
  {e:'🧢',w:'Mütze',s:2,cat:'Kleidung',r:'ütze'},
  {e:'🍰',w:'Kuchen',s:2,cat:'Essen',r:'uchen'},
  {e:'🧀',w:'Käse',s:2,cat:'Essen',r:'äse'},
  {e:'🥛',w:'Milch',s:1,cat:'Essen',r:'ilch'},
  {e:'🍪',w:'Keks',s:1,cat:'Essen',r:'eks'},
];

C.CATEGORIES = ['Tiere','Obst','Fahrzeuge','Spielzeug','Natur','Kleidung','Essen'];

// Wörter mit Lautfolge für Lautsynthese
C.BLEND = C.WORDS.filter(w=>w.snd);

// Minimalpaare (nur ein Laut Unterschied) — für auditive Diskrimination
C.MIN_PAIRS = [
  ['Tasse','Kasse'],['Nagel','Nadel'],['Maus','Haus'],['Tanne','Kanne'],
  ['Rose','Hose'],['Wein','Bein'],['Hose','Dose'],['Fisch','Tisch'],
  ['Reis','Eis'],['Kanne','Tanne'],['Bein','Wein'],['Dose','Rose'],
  ['Katze','Tatze'],['Wand','Hand'],['Loch','Koch'],['Maus','Laus'],
];

// Gegenteile
C.OPPOSITES = [
  ['groß','klein'],['heiß','kalt'],['auf','zu'],['hell','dunkel'],
  ['schnell','langsam'],['hoch','tief'],['nass','trocken'],['voll','leer'],
  ['alt','neu'],['laut','leise'],['oben','unten'],['dick','dünn'],
];

// Kurzgeschichten für Erzählgedächtnis: Sätze + Fragen (jede Frage: q, a=richtig, opts)
C.STORIES = [
  {
    text:['Der Hund läuft in den Garten.','Er findet einen roten Ball.','Dann spielt er mit der Katze.'],
    q:[
      {q:'Was findet der Hund?',a:'Ball',opts:['Ball','Knochen','Stock']},
      {q:'Mit wem spielt der Hund?',a:'Katze',opts:['Katze','Maus','Kind']},
      {q:'Welche Farbe hat der Ball?',a:'rot',opts:['rot','blau','grün']},
    ]
  },
  {
    text:['Mia geht zum Markt.','Sie kauft einen Apfel und eine Banane.','Zu Hause isst sie den Apfel.'],
    q:[
      {q:'Wohin geht Mia?',a:'Markt',opts:['Markt','Schule','Park']},
      {q:'Was isst Mia zu Hause?',a:'Apfel',opts:['Apfel','Banane','Kuchen']},
      {q:'Was kauft Mia zuerst? (2 Dinge)',a:'Apfel und Banane',opts:['Apfel und Banane','Milch und Keks','Brot und Käse']},
    ]
  },
  {
    text:['Der Bär wacht am Morgen auf.','Er hat Hunger und sucht Honig.','Am Fluss trifft er einen Fisch.'],
    q:[
      {q:'Was sucht der Bär?',a:'Honig',opts:['Honig','Beeren','Nüsse']},
      {q:'Wen trifft der Bär?',a:'Fisch',opts:['Fisch','Hase','Vogel']},
      {q:'Wo trifft der Bär den Fisch?',a:'am Fluss',opts:['am Fluss','im Wald','im Haus']},
    ]
  },
];

// Reale Aufgaben für Stufe 3 (Real-World) — Kind soll etwas im echten Leben tun
C.REAL_TASKS = [
  {icon:'🥤',task:'Bitte deine Mama oder deinen Papa höflich um ein Glas Wasser.',listen:['wasser','bitte']},
  {icon:'🧸',task:'Frag jemanden, ob er kurz mit dir spielt — sag „bitte".',listen:['spielen','bitte']},
  {icon:'🍎',task:'Bitte um einen Apfel und sag danach „danke".',listen:['apfel','danke']},
  {icon:'🤗',task:'Geh zu jemandem und sag einen netten Satz, z.B. „Ich hab dich lieb".',listen:['lieb','danke','schön']},
  {icon:'📚',task:'Frag: „Liest du mir eine Geschichte vor?"',listen:['geschichte','vor','lesen']},
];

window.C = C;
})();
