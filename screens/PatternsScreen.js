import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Animated, Dimensions } from 'react-native';
import { speak } from '../utils/speak';

const { width } = Dimensions.get('window');
const IS_TABLET = width > 700;
const TOTAL = 8;

// Pattern types: alternating AB, ABC, AABB
const PATTERNS = [
  { seq: ['🔴','🔵','🔴','🔵'], next: '🔴', wrongs: ['🔵','🟡'] },
  { seq: ['🟡','🟢','🟡','🟢'], next: '🟡', wrongs: ['🔵','🔴'] },
  { seq: ['⭐','🌙','⭐','🌙'], next: '⭐', wrongs: ['☀️','🌙'] },
  { seq: ['🐶','🐱','🐶','🐱'], next: '🐶', wrongs: ['🐟','🐰'] },
  { seq: ['🍎','🍌','🍎','🍌'], next: '🍎', wrongs: ['🍊','🍇'] },
  { seq: ['🔴','🔴','🔵','🔴','🔴'], next: '🔵', wrongs: ['🔴','🟡'] },
  { seq: ['🐶','🐶','🐱','🐶','🐶'], next: '🐱', wrongs: ['🐶','🐟'] },
  { seq: ['⭐','⭐','💎','⭐','⭐'], next: '💎', wrongs: ['⭐','🌟'] },
  { seq: ['🌸','🌻','🌺','🌸','🌻'], next: '🌺', wrongs: ['🌸','🌼'] },
  { seq: ['🔷','🔶','🔷','🔶'],      next: '🔷', wrongs: ['🟦','🔴'] },
  { seq: ['1️⃣','2️⃣','1️⃣','2️⃣'],   next: '1️⃣', wrongs: ['3️⃣','2️⃣'] },
  { seq: ['🌙','☀️','🌙','☀️'],      next: '🌙', wrongs: ['⭐','☀️'] },
];

function buildQ() {
  const p = PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
  const choices = [p.next, ...p.wrongs].sort(() => Math.random() - 0.5);
  return { ...p, choices };
}

export default function PatternsScreen({ navigation }) {
  const [q, setQ]           = useState(buildQ);
  const [round, setRound]   = useState(0);
  const [score, setScore]   = useState(0);
  const [status, setStatus] = useState('playing');
  const [picked, setPicked] = useState(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => { ask(q); }, []);

  function ask(newQ) {
    Animated.sequence([
      Animated.timing(bounceAnim, { toValue: 0.95, duration: 120, useNativeDriver: true }),
      Animated.spring(bounceAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
    setTimeout(() => speak('Was kommt als Nächstes?', { rate: 0.82, pitch: 1.15 }), 300);
  }

  function next() {
    const newQ = buildQ();
    setQ(newQ);
    setStatus('playing');
    setPicked(null);
    ask(newQ);
  }

  function handlePick(item) {
    if (status !== 'playing') return;
    setPicked(item);
    if (item === q.next) {
      setStatus('correct');
      setScore(s => s + 1);
      speak('Ja! Das Muster stimmt!', { rate: 0.82, pitch: 1.2 });
      setTimeout(() => {
        if (round + 1 >= TOTAL) setStatus('done');
        else { setRound(r => r + 1); next(); }
      }, 1600);
    } else {
      setStatus('wrong');
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 12,  duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -12, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
      ]).start();
      speak('Schau nochmal genau hin!', { rate: 0.82, pitch: 1.1 });
      setTimeout(() => { setStatus('playing'); setPicked(null); }, 1200);
    }
  }

  if (status === 'done') return (
    <SafeAreaView style={s.safe}>
      <Text style={s.celebTitle}>🎉 Klasse! 🎉</Text>
      <Text style={s.celebSub}>{score} von {TOTAL} richtig!</Text>
      <TouchableOpacity style={s.bigBtn} onPress={() => navigation.goBack()}><Text style={s.bigBtnTxt}>🏠 Startseite</Text></TouchableOpacity>
      <TouchableOpacity style={[s.bigBtn, { backgroundColor: '#FF6B9D', marginTop: 14 }]}
        onPress={() => { setRound(0); setScore(0); next(); }}>
        <Text style={s.bigBtnTxt}>🔄 Nochmal</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={s.safe}>
      <TouchableOpacity style={s.back} onPress={() => navigation.goBack()}><Text style={s.backTxt}>← Zurück</Text></TouchableOpacity>
      <Text style={s.score}>⭐ {score}  Runde {round + 1}/{TOTAL}</Text>
      <Text style={s.title}>Was kommt als Nächstes? 🤔</Text>

      <Animated.View style={[s.seqBox, { transform: [{ translateX: shakeAnim }, { scale: bounceAnim }] }]}>
        <View style={s.seqRow}>
          {q.seq.map((item, i) => (
            <Text key={i} style={s.seqItem}>{item}</Text>
          ))}
          <Text style={s.questionMark}>?</Text>
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
  safe:         { flex: 1, backgroundColor: '#F0FFF4', alignItems: 'center' },
  back:         { alignSelf: 'flex-start', margin: 16, padding: 8 },
  backTxt:      { fontSize: 20, color: '#888', fontWeight: '600' },
  score:        { fontSize: 18, color: '#777' },
  title:        { fontSize: IS_TABLET ? 28 : 22, fontWeight: '800', color: '#333', marginTop: 10, marginBottom: 16 },
  seqBox:       { backgroundColor: '#fff', borderRadius: 28, padding: 20, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, width: IS_TABLET ? 580 : width - 40 },
  seqRow:       { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 8 },
  seqItem:      { fontSize: IS_TABLET ? 58 : 46 },
  questionMark: { fontSize: IS_TABLET ? 62 : 50, fontWeight: '900', color: '#845EC2' },
  hint:         { fontSize: 18, color: '#777', marginTop: 14, marginBottom: 6 },
  choices:      { flexDirection: 'row', gap: 20, marginTop: 16 },
  choiceBtn:    { width: IS_TABLET ? 120 : 96, height: IS_TABLET ? 120 : 96, borderRadius: IS_TABLET ? 60 : 48, backgroundColor: '#845EC2', alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  choiceTxt:    { fontSize: IS_TABLET ? 52 : 42 },
  correct:      { backgroundColor: '#52B788' },
  wrong:        { backgroundColor: '#E63946' },
  celebTitle:   { fontSize: 52, fontWeight: '900', marginTop: 80, color: '#333' },
  celebSub:     { fontSize: 26, color: '#555', marginTop: 12 },
  bigBtn:       { marginTop: 32, backgroundColor: '#00B4D8', paddingVertical: 16, paddingHorizontal: 44, borderRadius: 24 },
  bigBtnTxt:    { fontSize: 22, color: '#fff', fontWeight: '800' },
});
