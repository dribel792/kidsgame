import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Animated, Dimensions } from 'react-native';
import { speak } from '../utils/speak';

const { width } = Dimensions.get('window');
const IS_TABLET = width > 700;
const TOTAL = 8;

// Visual objects for counting
const OBJECTS = ['🍎','🌟','🐶','🍪','🌸','🎈','🐟','🦋'];

function buildQ() {
  const a = Math.floor(Math.random() * 4) + 1; // 1–4
  const b = Math.floor(Math.random() * 4) + 1; // 1–4
  const correct = a + b;
  const pool = Array.from({ length: 9 }, (_, i) => i + 1).filter(n => n !== correct);
  const wrongs = pool.sort(() => Math.random() - 0.5).slice(0, 2);
  const choices = [correct, ...wrongs].sort(() => Math.random() - 0.5);
  const obj = OBJECTS[Math.floor(Math.random() * OBJECTS.length)];
  return { a, b, correct, choices, obj };
}

export default function MathScreen({ navigation }) {
  const [q, setQ]           = useState(buildQ);
  const [round, setRound]   = useState(0);
  const [score, setScore]   = useState(0);
  const [status, setStatus] = useState('playing');
  const [picked, setPicked] = useState(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => { askQuestion(q); }, []);

  function askQuestion(newQ) {
    setTimeout(() => speak(`Wie viel sind ${newQ.a} plus ${newQ.b}?`, { rate: 0.82, pitch: 1.15 }), 300);
  }

  function next() {
    const newQ = buildQ();
    setQ(newQ);
    setStatus('playing');
    setPicked(null);
    askQuestion(newQ);
  }

  function handlePick(num) {
    if (status !== 'playing') return;
    setPicked(num);
    if (num === q.correct) {
      setStatus('correct');
      setScore(s => s + 1);
      speak(`Richtig! ${q.a} plus ${q.b} ist ${q.correct}!`, { rate: 0.82, pitch: 1.2 });
      setTimeout(() => {
        if (round + 1 >= TOTAL) setStatus('done');
        else { setRound(r => r + 1); next(); }
      }, 1800);
    } else {
      setStatus('wrong');
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 12,  duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -12, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8,   duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
      ]).start();
      speak('Noch einmal versuchen!', { rate: 0.82, pitch: 1.1 });
      setTimeout(() => { setStatus('playing'); setPicked(null); }, 1200);
    }
  }

  if (status === 'done') return (
    <SafeAreaView style={s.safe}>
      <Text style={s.celebTitle}>🎉 Super! 🎉</Text>
      <Text style={s.celebSub}>{score} von {TOTAL} richtig!</Text>
      <TouchableOpacity style={s.bigBtn} onPress={() => navigation.goBack()}><Text style={s.bigBtnTxt}>🏠 Startseite</Text></TouchableOpacity>
      <TouchableOpacity style={[s.bigBtn, { backgroundColor: '#FF6B9D', marginTop: 14 }]}
        onPress={() => { setRound(0); setScore(0); setQ(buildQ()); setStatus('playing'); next(); }}>
        <Text style={s.bigBtnTxt}>🔄 Nochmal</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={s.safe}>
      <TouchableOpacity style={s.back} onPress={() => navigation.goBack()}><Text style={s.backTxt}>← Zurück</Text></TouchableOpacity>
      <Text style={s.score}>⭐ {score}  Runde {round + 1}/{TOTAL}</Text>

      <Animated.View style={[s.box, { transform: [{ translateX: shakeAnim }],
        backgroundColor: status === 'correct' ? '#B5EAD7' : status === 'wrong' ? '#FFD5D5' : '#fff' }]}>
        {/* Row A */}
        <View style={s.objRow}>
          {Array.from({ length: q.a }).map((_, i) => <Text key={i} style={s.obj}>{q.obj}</Text>)}
        </View>
        <Text style={s.plus}>+</Text>
        {/* Row B */}
        <View style={s.objRow}>
          {Array.from({ length: q.b }).map((_, i) => <Text key={i} style={s.obj}>{q.obj}</Text>)}
        </View>
        <Text style={s.equals}>= ?</Text>
      </Animated.View>

      <TouchableOpacity onPress={() => speak(`Wie viel sind ${q.a} plus ${q.b}?`, { rate: 0.82, pitch: 1.15 })} style={s.speakBtn}>
        <Text style={s.speakTxt}>🔊 Nochmal hören</Text>
      </TouchableOpacity>

      <View style={s.choices}>
        {q.choices.map(num => (
          <TouchableOpacity key={num}
            style={[s.numBtn,
              picked === num && status === 'correct' && s.correct,
              picked === num && status === 'wrong'   && s.wrong]}
            onPress={() => handlePick(num)} activeOpacity={0.75}>
            <Text style={s.numTxt}>{num}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: '#FFF0F8', alignItems: 'center' },
  back:       { alignSelf: 'flex-start', margin: 16, padding: 8 },
  backTxt:    { fontSize: 20, color: '#888', fontWeight: '600' },
  score:      { fontSize: 18, color: '#777', marginBottom: 8 },
  box:        { width: IS_TABLET ? 500 : width - 40, borderRadius: 28, padding: 24, alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  objRow:     { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginVertical: 4 },
  obj:        { fontSize: IS_TABLET ? 52 : 44 },
  plus:       { fontSize: IS_TABLET ? 48 : 38, fontWeight: '900', color: '#FF6B9D', marginVertical: 4 },
  equals:     { fontSize: IS_TABLET ? 48 : 38, fontWeight: '900', color: '#333', marginTop: 4 },
  speakBtn:   { marginTop: 14, backgroundColor: '#E8F4FD', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 20 },
  speakTxt:   { fontSize: 17, color: '#0077B6', fontWeight: '700' },
  choices:    { flexDirection: 'row', gap: 20, marginTop: 28 },
  numBtn:     { width: IS_TABLET ? 110 : 88, height: IS_TABLET ? 110 : 88, borderRadius: IS_TABLET ? 55 : 44, backgroundColor: '#FF6B9D', alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  correct:    { backgroundColor: '#52B788' },
  wrong:      { backgroundColor: '#E63946' },
  numTxt:     { fontSize: IS_TABLET ? 50 : 40, fontWeight: '900', color: '#fff' },
  celebTitle: { fontSize: 52, fontWeight: '900', marginTop: 80, color: '#333' },
  celebSub:   { fontSize: 26, color: '#555', marginTop: 12 },
  bigBtn:     { marginTop: 32, backgroundColor: '#00B4D8', paddingVertical: 16, paddingHorizontal: 44, borderRadius: 24 },
  bigBtnTxt:  { fontSize: 22, color: '#fff', fontWeight: '800' },
});
