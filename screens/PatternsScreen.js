import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Animated, Dimensions } from 'react-native';
import { speak } from '../utils/speak';

const { width } = Dimensions.get('window');
const IS_TABLET = width > 700;

// Level 1 — simple AB (2-element alternating)
const L1 = [
  { seq: ['🔴','🔵','🔴','🔵'],       next: '🔴', wrongs: ['🔵','🟡']         },
  { seq: ['🟡','🟢','🟡','🟢'],       next: '🟡', wrongs: ['🔵','🔴']         },
  { seq: ['⭐','🌙','⭐','🌙'],        next: '⭐', wrongs: ['☀️','🌙']         },
  { seq: ['🐶','🐱','🐶','🐱'],       next: '🐶', wrongs: ['🐟','🐰']         },
  { seq: ['🍎','🍌','🍎','🍌'],       next: '🍎', wrongs: ['🍊','🍇']         },
];
// Level 2 — adds longer + 3-element patterns
const L2 = [
  ...L1,
  { seq: ['🔴','🔴','🔵','🔴','🔴'], next: '🔵', wrongs: ['🔴','🟡']         },
  { seq: ['🐶','🐶','🐱','🐶','🐶'], next: '🐱', wrongs: ['🐶','🐟']         },
  { seq: ['⭐','⭐','💎','⭐','⭐'],  next: '💎', wrongs: ['⭐','🌟']         },
  { seq: ['🌸','🌻','🌺','🌸','🌻'], next: '🌺', wrongs: ['🌸','🌼']         },
  { seq: ['🔷','🔶','🔷','🔶'],      next: '🔷', wrongs: ['🟦','🔴']         },
];
// Level 3 — complex + 4 choices
const L3 = [
  ...L2,
  { seq: ['🔴','🔵','🟡','🔴','🔵'], next: '🟡', wrongs: ['🔴','🔵','🟢']   },
  { seq: ['🐶','🐱','🐟','🐶','🐱'], next: '🐟', wrongs: ['🐶','🐱','🐰']   },
  { seq: ['1️⃣','2️⃣','3️⃣','1️⃣','2️⃣'],  next: '3️⃣', wrongs: ['1️⃣','2️⃣','4️⃣']  },
];
// Level 4 — all + ambiguous
const L4 = [
  ...L3,
  { seq: ['🌙','☀️','🌟','🌙','☀️'],  next: '🌟', wrongs: ['🌙','☀️','💫']   },
  { seq: ['🟥','🟦','🟩','🟥','🟦'],  next: '🟩', wrongs: ['🟥','🟦','🟨']   },
  { seq: ['🎵','🎶','🎵','🎵','🎶'],  next: '🎵', wrongs: ['🎶','🎵','🎸']   },
];

const POOLS = { 1: L1, 2: L2, 3: L3, 4: L4 };
const ROUNDS = { 1: 5, 2: 8, 3: 10, 4: 12 };
const WRONG_COUNT = { 1: 2, 2: 2, 3: 3, 4: 3 };

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }
function buildQ(pool, wc) {
  const p = pool[Math.floor(Math.random() * pool.length)];
  const choices = [p.next, ...shuffle(p.wrongs).slice(0, wc)].sort(() => Math.random() - 0.5);
  return { ...p, choices };
}

export default function PatternsScreen({ route, navigation }) {
  const difficulty  = route.params?.difficulty ?? 2;
  const pool        = POOLS[difficulty];
  const totalRounds = ROUNDS[difficulty];
  const wrongCount  = WRONG_COUNT[difficulty];
  const [q, setQ]           = useState(() => buildQ(pool, wrongCount));
  const [round, setRound]   = useState(0);
  const [score, setScore]   = useState(0);
  const [status, setStatus] = useState('playing');
  const [picked, setPicked] = useState(null);
  const shakeAnim  = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => { ask(); }, []);

  function ask() {
    Animated.sequence([
      Animated.timing(bounceAnim, { toValue: 0.95, duration: 120, useNativeDriver: true }),
      Animated.spring(bounceAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
    setTimeout(() => speak('Was kommt als Nächstes?', { rate: 0.82, pitch: 1.15 }), 300);
  }

  function next() {
    const newQ = buildQ(pool, wrongCount);
    setQ(newQ); setStatus('playing'); setPicked(null); ask();
  }

  function handlePick(item) {
    if (status !== 'playing') return;
    setPicked(item);
    if (item === q.next) {
      setStatus('correct'); setScore(s => s + 1);
      speak('Ja! Das Muster stimmt!', { rate: 0.82, pitch: 1.2 });
      setTimeout(() => {
        if (round + 1 >= totalRounds) setStatus('done');
        else { setRound(r => r + 1); next(); }
      }, 1600);
    } else {
      setStatus('wrong');
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 12, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -12, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
      speak('Schau nochmal genau hin!', { rate: 0.82, pitch: 1.1 });
      setTimeout(() => { setStatus('playing'); setPicked(null); }, 1200);
    }
  }

  if (status === 'done') return (
    <SafeAreaView style={s.safe}>
      <Text style={s.celebTitle}>🎉 Klasse! 🎉</Text>
      <Text style={s.celebSub}>{score} von {totalRounds} richtig!</Text>
      <TouchableOpacity style={s.bigBtn} onPress={() => navigation.navigate('Home')}><Text style={s.bigBtnTxt}>🏠 Startseite</Text></TouchableOpacity>
      <TouchableOpacity style={[s.bigBtn, { backgroundColor: '#FF6B9D', marginTop: 14 }]}
        onPress={() => { setRound(0); setScore(0); next(); }}>
        <Text style={s.bigBtnTxt}>🔄 Nochmal</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={s.safe}>
      <TouchableOpacity style={s.back} onPress={() => navigation.goBack()}><Text style={s.backTxt}>← Zurück</Text></TouchableOpacity>
      <Text style={s.score}>⭐ {score}  Runde {round + 1}/{totalRounds}</Text>
      <Text style={s.title}>Was kommt als Nächstes? 🤔</Text>
      <Animated.View style={[s.seqBox, { transform: [{ translateX: shakeAnim }, { scale: bounceAnim }] }]}>
        <View style={s.seqRow}>
          {q.seq.map((item, i) => <Text key={i} style={s.seqItem}>{item}</Text>)}
          <Text style={s.qMark}>?</Text>
        </View>
      </Animated.View>
      <Text style={s.hint}>Welches kommt als Nächstes?</Text>
      <View style={s.choices}>
        {q.choices.map(item => (
          <TouchableOpacity key={item}
            style={[s.choiceBtn,
              picked === item && status === 'correct' && s.correct,
              picked === item && status === 'wrong'   && s.wrong]}
            onPress={() => handlePick(item)} activeOpacity={0.75}>
            <Text style={s.choiceTxt}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#F0FFF4', alignItems: 'center' },
  back:      { alignSelf: 'flex-start', margin: 16, padding: 8 },
  backTxt:   { fontSize: 20, color: '#888', fontWeight: '600' },
  score:     { fontSize: 18, color: '#777' },
  title:     { fontSize: IS_TABLET ? 28 : 22, fontWeight: '800', color: '#333', marginTop: 8, marginBottom: 14 },
  seqBox:    { backgroundColor: '#fff', borderRadius: 28, padding: 18, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, width: IS_TABLET ? 580 : width - 40 },
  seqRow:    { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 6 },
  seqItem:   { fontSize: IS_TABLET ? 54 : 42 },
  qMark:     { fontSize: IS_TABLET ? 58 : 46, fontWeight: '900', color: '#845EC2' },
  hint:      { fontSize: 18, color: '#777', marginTop: 12, marginBottom: 6 },
  choices:   { flexDirection: 'row', gap: 16, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' },
  choiceBtn: { width: IS_TABLET ? 110 : 88, height: IS_TABLET ? 110 : 88, borderRadius: IS_TABLET ? 55 : 44, backgroundColor: '#845EC2', alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  choiceTxt: { fontSize: IS_TABLET ? 48 : 38 },
  correct:   { backgroundColor: '#52B788' },
  wrong:     { backgroundColor: '#E63946' },
  celebTitle:{ fontSize: 52, fontWeight: '900', marginTop: 80, color: '#333' },
  celebSub:  { fontSize: 26, color: '#555', marginTop: 12 },
  bigBtn:    { marginTop: 32, backgroundColor: '#00B4D8', paddingVertical: 16, paddingHorizontal: 44, borderRadius: 24 },
  bigBtnTxt: { fontSize: 22, color: '#fff', fontWeight: '800' },
});
