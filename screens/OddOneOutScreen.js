import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import { speak } from '../utils/speak';

const { width } = Dimensions.get('window');
const IS_TABLET = width > 700;

// Tagged by difficulty
const ALL_Q = [
  // L1 — very obvious
  { items: ['🐶','🐱','🐰','🍎'],       odd: '🍎',  level: 1 },
  { items: ['🍎','🍌','🍊','🚗'],       odd: '🚗',  level: 1 },
  { items: ['✈️','🚗','🐟','🚢'],       odd: '🐟',  level: 1 },
  { items: ['🌸','🌻','🌺','🍕'],       odd: '🍕',  level: 1 },
  // L2 — medium
  { items: ['🔴','🔵','🟡','🐶'],       odd: '🐶',  level: 2 },
  { items: ['📚','✏️','🐱','📏'],       odd: '🐱',  level: 2 },
  { items: ['🍕','🍔','🌮','⭐'],       odd: '⭐',  level: 2 },
  { items: ['🎸','🎹','🎺','🍌'],       odd: '🍌',  level: 2 },
  { items: ['🐘','🦒','🦁','🚕'],       odd: '🚕',  level: 2 },
  { items: ['⚽','🏀','🎾','🍔'],       odd: '🍔',  level: 2 },
  // L3 — harder
  { items: ['🌙','☀️','⭐','🐱'],       odd: '🐱',  level: 3 },
  { items: ['👕','👖','👗','🐶'],       odd: '🐶',  level: 3 },
  { items: ['🍇','🍓','🫐','🥕'],       odd: '🥕',  level: 3 },
  { items: ['🥁','🎻','🎹','🎨'],       odd: '🎨',  level: 3 },
  { items: ['🌊','🏖️','⛵','🗻'],       odd: '🗻',  level: 3 },
  // L4 — subtle
  { items: ['🐕','🐩','🦮','🐈'],       odd: '🐈',  level: 4 },
  { items: ['🍋','🍊','🍑','🫐'],       odd: '🫐',  level: 4 },
  { items: ['🌹','🌷','🌻','🍀'],       odd: '🍀',  level: 4 },
  { items: ['🧲','🔩','⚙️','🖊️'],      odd: '🖊️', level: 4 },
];

const POOLS  = { 1: ALL_Q.filter(q=>q.level===1), 2: ALL_Q.filter(q=>q.level<=2), 3: ALL_Q.filter(q=>q.level<=3), 4: ALL_Q };
const ROUNDS = { 1: 5, 2: 8, 3: 10, 4: 12 };
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

export default function OddOneOutScreen({ route, navigation }) {
  const difficulty = route.params?.difficulty ?? 2;
  const pool       = POOLS[difficulty];
  const totalRounds = ROUNDS[difficulty];
  const [order]    = useState(() => shuffle(pool.map((_, i) => i)));
  const [qIdx, setQIdx]     = useState(0);
  const [items, setItems]   = useState([]);
  const [score, setScore]   = useState(0);
  const [status, setStatus] = useState('playing');
  const [picked, setPicked] = useState(null);

  const q = pool[order[qIdx % pool.length]];

  useEffect(() => { loadQ(); }, [qIdx]);

  function loadQ() {
    const curr = pool[order[qIdx % pool.length]];
    setItems(shuffle([...curr.items]));
    setStatus('playing'); setPicked(null);
    setTimeout(() => speak('Was passt nicht dazu?', { rate: 0.82, pitch: 1.15 }), 300);
  }

  function handlePick(item) {
    if (status !== 'playing') return;
    setPicked(item);
    if (item === q.odd) {
      setStatus('correct'); setScore(s => s + 1);
      speak('Richtig! Das passt nicht dazu!', { rate: 0.82, pitch: 1.2 });
      setTimeout(() => {
        if (qIdx + 1 >= totalRounds) setStatus('done');
        else { setQIdx(i => i + 1); }
      }, 1800);
    } else {
      setStatus('wrong');
      speak('Schau nochmal! Was ist anders?', { rate: 0.82, pitch: 1.1 });
      setTimeout(() => { setStatus('playing'); setPicked(null); }, 1300);
    }
  }

  if (status === 'done') return (
    <SafeAreaView style={s.safe}>
      <Text style={s.celebTitle}>🎉 Gut gemacht! 🎉</Text>
      <Text style={s.celebSub}>{score} von {totalRounds} richtig!</Text>
      <TouchableOpacity style={s.bigBtn} onPress={() => navigation.navigate('Home')}><Text style={s.bigBtnTxt}>🏠 Startseite</Text></TouchableOpacity>
      <TouchableOpacity style={[s.bigBtn, { backgroundColor: '#FF6B9D', marginTop: 14 }]}
        onPress={() => { setQIdx(0); setScore(0); loadQ(); }}>
        <Text style={s.bigBtnTxt}>🔄 Nochmal</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  const CARD = IS_TABLET ? 150 : (width - 80) / 2;
  return (
    <SafeAreaView style={s.safe}>
      <TouchableOpacity style={s.back} onPress={() => navigation.goBack()}><Text style={s.backTxt}>← Zurück</Text></TouchableOpacity>
      <Text style={s.score}>⭐ {score}  Runde {qIdx + 1}/{totalRounds}</Text>
      <Text style={s.title}>Was passt nicht dazu? 🔍</Text>
      <Text style={s.hint}>Tippe auf das Bild das nicht dazu gehört!</Text>
      <View style={s.grid}>
        {items.map((item, i) => {
          const isOdd = item === q.odd;
          let bg = '#fff';
          if (picked === item && status === 'correct') bg = '#B5EAD7';
          if (picked === item && status === 'wrong')   bg = '#FFD5D5';
          if (status === 'correct' && isOdd)           bg = '#B5EAD7';
          return (
            <TouchableOpacity key={i} style={[s.card, { backgroundColor: bg, width: CARD, height: CARD }]}
              onPress={() => handlePick(item)} activeOpacity={0.75}>
              <Text style={s.cardTxt}>{item}</Text>
              {status === 'correct' && isOdd && <Text style={s.check}>✓</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
      <TouchableOpacity onPress={() => speak('Was passt nicht dazu?', { rate: 0.82, pitch: 1.15 })} style={s.speakBtn}>
        <Text style={s.speakTxt}>🔊 Nochmal hören</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#FFF8E1', alignItems: 'center' },
  back:      { alignSelf: 'flex-start', margin: 16, padding: 8 },
  backTxt:   { fontSize: 20, color: '#888', fontWeight: '600' },
  score:     { fontSize: 18, color: '#777' },
  title:     { fontSize: IS_TABLET ? 30 : 24, fontWeight: '900', color: '#333', marginTop: 8 },
  hint:      { fontSize: 16, color: '#888', marginTop: 4, marginBottom: 14, textAlign: 'center', paddingHorizontal: 20 },
  grid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 14, justifyContent: 'center', paddingHorizontal: 20 },
  card:      { borderRadius: 24, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  cardTxt:   { fontSize: IS_TABLET ? 72 : 56 },
  check:     { fontSize: 22, color: '#52B788', fontWeight: '900', position: 'absolute', top: 8, right: 12 },
  speakBtn:  { marginTop: 18, backgroundColor: '#E8F4FD', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 20 },
  speakTxt:  { fontSize: 17, color: '#0077B6', fontWeight: '700' },
  celebTitle:{ fontSize: 52, fontWeight: '900', marginTop: 80, color: '#333' },
  celebSub:  { fontSize: 26, color: '#555', marginTop: 12 },
  bigBtn:    { marginTop: 32, backgroundColor: '#00B4D8', paddingVertical: 16, paddingHorizontal: 44, borderRadius: 24 },
  bigBtnTxt: { fontSize: 22, color: '#fff', fontWeight: '800' },
});
