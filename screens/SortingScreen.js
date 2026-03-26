import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Animated, Dimensions } from 'react-native';
import { speak } from '../utils/speak';

const { width } = Dimensions.get('window');
const IS_TABLET = width > 700;

const ALL_ITEMS = [
  { emoji: '🍎', label: 'Apfel',      cat: 'Obst'      },
  { emoji: '🍌', label: 'Banane',     cat: 'Obst'      },
  { emoji: '🍊', label: 'Orange',     cat: 'Obst'      },
  { emoji: '🍇', label: 'Trauben',    cat: 'Obst'      },
  { emoji: '🍓', label: 'Erdbeere',   cat: 'Obst'      },
  { emoji: '🐶', label: 'Hund',       cat: 'Tier'      },
  { emoji: '🐱', label: 'Katze',      cat: 'Tier'      },
  { emoji: '🐟', label: 'Fisch',      cat: 'Tier'      },
  { emoji: '🐰', label: 'Hase',       cat: 'Tier'      },
  { emoji: '🦁', label: 'Löwe',       cat: 'Tier'      },
  { emoji: '🚗', label: 'Auto',       cat: 'Fahrzeug'  },
  { emoji: '✈️', label: 'Flugzeug',   cat: 'Fahrzeug'  },
  { emoji: '🚢', label: 'Schiff',     cat: 'Fahrzeug'  },
  { emoji: '🚲', label: 'Fahrrad',    cat: 'Fahrzeug'  },
  { emoji: '🚂', label: 'Zug',        cat: 'Fahrzeug'  },
  { emoji: '👕', label: 'T-Shirt',    cat: 'Kleidung'  },
  { emoji: '👖', label: 'Hose',       cat: 'Kleidung'  },
  { emoji: '👗', label: 'Kleid',      cat: 'Kleidung'  },
  { emoji: '👟', label: 'Schuh',      cat: 'Kleidung'  },
  { emoji: '🧢', label: 'Mütze',      cat: 'Kleidung'  },
  { emoji: '🎲', label: 'Würfel',     cat: 'Spielzeug' },
  { emoji: '🎈', label: 'Luftballon', cat: 'Spielzeug' },
  { emoji: '🧸', label: 'Teddybär',   cat: 'Spielzeug' },
  { emoji: '⚽',  label: 'Ball',       cat: 'Spielzeug' },
  { emoji: '🪀',  label: 'Jojo',       cat: 'Spielzeug' },
];

const CFG = {
  1: { cats: ['Obst','Tier'],                                           rounds: 8  },
  2: { cats: ['Obst','Tier','Fahrzeug'],                                rounds: 10 },
  3: { cats: ['Obst','Tier','Fahrzeug','Kleidung'],                     rounds: 12 },
  4: { cats: ['Obst','Tier','Fahrzeug','Kleidung','Spielzeug'],         rounds: 15 },
};
const CAT_EMOJI = { Obst:'🍓', Tier:'🦁', Fahrzeug:'🚀', Kleidung:'👗', Spielzeug:'🎈' };
const CAT_COLOR = { Obst:'#52B788', Tier:'#FF6B9D', Fahrzeug:'#00B4D8', Kleidung:'#845EC2', Spielzeug:'#F4A261' };

export default function SortingScreen({ route, navigation }) {
  const difficulty = route.params?.difficulty ?? 2;
  const cfg        = CFG[difficulty];
  const validItems = ALL_ITEMS.filter(it => cfg.cats.includes(it.cat));

  const [item, setItem]     = useState(() => validItems[Math.floor(Math.random() * validItems.length)]);
  const [round, setRound]   = useState(0);
  const [score, setScore]   = useState(0);
  const [status, setStatus] = useState('playing');
  const [picked, setPicked] = useState(null);
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => { ask(item); }, []);

  function ask(it) {
    bounceAnim.setValue(0);
    Animated.spring(bounceAnim, { toValue: 1, useNativeDriver: true }).start();
    setTimeout(() => speak(`Wohin gehört ${it.label}?`, { rate: 0.82, pitch: 1.15 }), 300);
  }

  function next() {
    const it = validItems[Math.floor(Math.random() * validItems.length)];
    setItem(it); setStatus('playing'); setPicked(null); ask(it);
  }

  function handlePick(cat) {
    if (status !== 'playing') return;
    setPicked(cat);
    if (cat === item.cat) {
      setStatus('correct'); setScore(s => s + 1);
      speak(`Richtig! ${item.label} gehört zu ${cat}.`, { rate: 0.82, pitch: 1.2 });
      setTimeout(() => {
        if (round + 1 >= cfg.rounds) setStatus('done');
        else { setRound(r => r + 1); next(); }
      }, 1800);
    } else {
      setStatus('wrong');
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 14, duration: 55, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -14, duration: 55, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 55, useNativeDriver: true }),
      ]).start();
      speak('Das stimmt nicht. Versuch nochmal!', { rate: 0.82, pitch: 1.1 });
      setTimeout(() => { setStatus('playing'); setPicked(null); }, 1200);
    }
  }

  if (status === 'done') return (
    <SafeAreaView style={s.safe}>
      <Text style={s.celebTitle}>🎉 Super sortiert! 🎉</Text>
      <Text style={s.celebSub}>{score} von {cfg.rounds} richtig!</Text>
      <TouchableOpacity style={s.bigBtn} onPress={() => navigation.navigate('Home')}><Text style={s.bigBtnTxt}>🏠 Startseite</Text></TouchableOpacity>
      <TouchableOpacity style={[s.bigBtn, { backgroundColor: '#FF6B9D', marginTop: 14 }]}
        onPress={() => { setRound(0); setScore(0); next(); }}>
        <Text style={s.bigBtnTxt}>🔄 Nochmal</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  const catBtnWidth = IS_TABLET ? 160 : Math.min((width - 60) / cfg.cats.length - 8, 110);

  return (
    <SafeAreaView style={s.safe}>
      <TouchableOpacity style={s.back} onPress={() => navigation.goBack()}><Text style={s.backTxt}>← Zurück</Text></TouchableOpacity>
      <Text style={s.score}>⭐ {score}  Runde {round + 1}/{cfg.rounds}</Text>
      <Text style={s.title}>Wohin gehört das? 📦</Text>
      <Animated.View style={[s.itemCard, {
        transform: [{ scale: bounceAnim }, { translateX: shakeAnim }],
        backgroundColor: status === 'correct' ? '#B5EAD7' : status === 'wrong' ? '#FFD5D5' : '#fff',
      }]}>
        <Text style={s.itemEmoji}>{item.emoji}</Text>
        <Text style={s.itemLabel}>{item.label}</Text>
      </Animated.View>
      <TouchableOpacity onPress={() => speak(`Wohin gehört ${item.label}?`, { rate: 0.82, pitch: 1.15 })} style={s.speakBtn}>
        <Text style={s.speakTxt}>🔊 Nochmal hören</Text>
      </TouchableOpacity>
      <View style={s.cats}>
        {cfg.cats.map(cat => (
          <TouchableOpacity key={cat}
            style={[s.catBtn, { backgroundColor: CAT_COLOR[cat], width: catBtnWidth },
              picked === cat && status === 'correct' && s.catCorrect,
              picked === cat && status === 'wrong'   && { opacity: 0.45 }]}
            onPress={() => handlePick(cat)} activeOpacity={0.75}>
            <Text style={s.catEmoji}>{CAT_EMOJI[cat]}</Text>
            <Text style={[s.catLabel, cfg.cats.length > 3 && { fontSize: 13 }]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#F0F8FF', alignItems: 'center' },
  back:      { alignSelf: 'flex-start', margin: 16, padding: 8 },
  backTxt:   { fontSize: 20, color: '#888', fontWeight: '600' },
  score:     { fontSize: 18, color: '#777' },
  title:     { fontSize: IS_TABLET ? 28 : 22, fontWeight: '900', color: '#333', marginVertical: 6 },
  itemCard:  { width: IS_TABLET ? 220 : 170, height: IS_TABLET ? 220 : 170, borderRadius: 32, alignItems: 'center', justifyContent: 'center', elevation: 6, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  itemEmoji: { fontSize: IS_TABLET ? 90 : 72 },
  itemLabel: { fontSize: IS_TABLET ? 26 : 20, fontWeight: '800', color: '#333', marginTop: 6 },
  speakBtn:  { marginTop: 12, backgroundColor: '#E8F4FD', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 20 },
  speakTxt:  { fontSize: 17, color: '#0077B6', fontWeight: '700' },
  cats:      { flexDirection: 'row', gap: 8, marginTop: 22, paddingHorizontal: 12, flexWrap: 'wrap', justifyContent: 'center' },
  catBtn:    { paddingVertical: IS_TABLET ? 22 : 16, borderRadius: 22, alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  catEmoji:  { fontSize: IS_TABLET ? 38 : 30 },
  catLabel:  { fontSize: IS_TABLET ? 17 : 14, fontWeight: '800', color: '#fff', marginTop: 4 },
  catCorrect:{ borderWidth: 3, borderColor: '#fff', transform: [{ scale: 1.05 }] },
  celebTitle:{ fontSize: 52, fontWeight: '900', marginTop: 80, color: '#333' },
  celebSub:  { fontSize: 26, color: '#555', marginTop: 12 },
  bigBtn:    { marginTop: 32, backgroundColor: '#00B4D8', paddingVertical: 16, paddingHorizontal: 44, borderRadius: 24 },
  bigBtnTxt: { fontSize: 22, color: '#fff', fontWeight: '800' },
});
