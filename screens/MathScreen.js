import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Animated, Dimensions } from 'react-native';
import { speak } from '../utils/speak';

const { width } = Dimensions.get('window');
const IS_TABLET = width > 700;

// L1: addition only, max=4, 5 rounds
// L2: addition only, max=8, 8 rounds
// L3: addition + subtraction, max=10, 10 rounds
// L4: addition + subtraction, max=18, 12 rounds
const CFG = {
  1: { max: 2,  ops: ['+'], rounds: 5  },
  2: { max: 4,  ops: ['+'], rounds: 8  },
  3: { max: 5,  ops: ['+','-'], rounds: 10 },
  4: { max: 9,  ops: ['+','-'], rounds: 12 },
};

const OBJECTS = ['🍎','🌟','🐶','🍪','🌸','🎈','🐟','🦋'];

function buildQ(cfg) {
  const op = cfg.ops[Math.floor(Math.random() * cfg.ops.length)];
  let a, b, correct;
  if (op === '+') {
    a = Math.floor(Math.random() * cfg.max) + 1;
    b = Math.floor(Math.random() * cfg.max) + 1;
    correct = a + b;
  } else {
    // subtraction: ensure a >= b, result >= 1
    a = Math.floor(Math.random() * cfg.max) + 2;
    b = Math.floor(Math.random() * (a - 1)) + 1;
    correct = a - b;
  }
  const maxResult = cfg.max * 2;
  const pool = Array.from({ length: maxResult }, (_, i) => i + 1).filter(n => n !== correct);
  const wrongs = pool.sort(() => Math.random() - 0.5).slice(0, 2);
  const choices = [correct, ...wrongs].sort(() => Math.random() - 0.5);
  const obj = OBJECTS[Math.floor(Math.random() * OBJECTS.length)];
  return { a, b, op, correct, choices, obj };
}

export default function MathScreen({ route, navigation }) {
  const difficulty = route.params?.difficulty ?? 2;
  const cfg        = CFG[difficulty];
  const [q, setQ]           = useState(() => buildQ(cfg));
  const [round, setRound]   = useState(0);
  const [score, setScore]   = useState(0);
  const [status, setStatus] = useState('playing');
  const [picked, setPicked] = useState(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => { ask(q); }, []);

  function ask(newQ) {
    const opWord = newQ.op === '+' ? 'plus' : 'minus';
    setTimeout(() => speak(`Wie viel sind ${newQ.a} ${opWord} ${newQ.b}?`, { rate: 0.82, pitch: 1.15 }), 300);
  }

  function next() {
    const newQ = buildQ(cfg);
    setQ(newQ); setStatus('playing'); setPicked(null); ask(newQ);
  }

  function handlePick(num) {
    if (status !== 'playing') return;
    setPicked(num);
    const opWord = q.op === '+' ? 'plus' : 'minus';
    if (num === q.correct) {
      setStatus('correct'); setScore(s => s + 1);
      speak(`Richtig! ${q.a} ${opWord} ${q.b} ist ${q.correct}!`, { rate: 0.82, pitch: 1.2 });
      setTimeout(() => {
        if (round + 1 >= cfg.rounds) setStatus('done');
        else { setRound(r => r + 1); next(); }
      }, 1800);
    } else {
      setStatus('wrong');
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 12,  duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -12, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
      ]).start();
      speak('Noch einmal versuchen!', { rate: 0.82, pitch: 1.1 });
      setTimeout(() => { setStatus('playing'); setPicked(null); }, 1200);
    }
  }

  if (status === 'done') return (
    <SafeAreaView style={s.safe}>
      <Text style={s.celebTitle}>🎉 Super! 🎉</Text>
      <Text style={s.celebSub}>{score} von {cfg.rounds} richtig!</Text>
      <TouchableOpacity style={s.bigBtn} onPress={() => navigation.navigate('Home')}><Text style={s.bigBtnTxt}>🏠 Startseite</Text></TouchableOpacity>
      <TouchableOpacity style={[s.bigBtn, { backgroundColor: '#FF6B9D', marginTop: 14 }]}
        onPress={() => { setRound(0); setScore(0); setQ(buildQ(cfg)); setStatus('playing'); next(); }}>
        <Text style={s.bigBtnTxt}>🔄 Nochmal</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={s.safe}>
      <TouchableOpacity style={s.back} onPress={() => navigation.goBack()}><Text style={s.backTxt}>← Zurück</Text></TouchableOpacity>
      <Text style={s.score}>⭐ {score}  Runde {round + 1}/{cfg.rounds}</Text>

      <Animated.View style={[s.box, { transform: [{ translateX: shakeAnim }],
        backgroundColor: status === 'correct' ? '#B5EAD7' : status === 'wrong' ? '#FFD5D5' : '#fff' }]}>
        <View style={s.objRow}>
          {Array.from({ length: q.a }).map((_, i) => <Text key={i} style={s.obj}>{q.obj}</Text>)}
        </View>
        <Text style={s.opSign}>{q.op}</Text>
        {q.op === '+' ? (
          <View style={s.objRow}>
            {Array.from({ length: q.b }).map((_, i) => <Text key={i} style={s.obj}>{q.obj}</Text>)}
          </View>
        ) : (
          <View style={s.subRow}>
            {Array.from({ length: q.a }).map((_, i) => (
              <Text key={i} style={[s.obj, i >= q.b && s.objFaded]}>{q.obj}</Text>
            ))}
          </View>
        )}
        <Text style={s.equals}>= ?</Text>
      </Animated.View>

      <TouchableOpacity onPress={() => {
        const opWord = q.op === '+' ? 'plus' : 'minus';
        speak(`Wie viel sind ${q.a} ${opWord} ${q.b}?`, { rate: 0.82, pitch: 1.15 });
      }} style={s.speakBtn}>
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
  safe:      { flex: 1, backgroundColor: '#FFF0F8', alignItems: 'center' },
  back:      { alignSelf: 'flex-start', margin: 16, padding: 8 },
  backTxt:   { fontSize: 20, color: '#888', fontWeight: '600' },
  score:     { fontSize: 18, color: '#777', marginBottom: 8 },
  box:       { width: IS_TABLET ? 500 : width - 40, borderRadius: 28, padding: 20, alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  objRow:    { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 4, marginVertical: 4 },
  subRow:    { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 4, marginVertical: 4 },
  obj:       { fontSize: IS_TABLET ? 46 : 36 },
  objFaded:  { opacity: 0.25 },
  opSign:    { fontSize: IS_TABLET ? 52 : 40, fontWeight: '900', color: '#FF6B9D', marginVertical: 2 },
  equals:    { fontSize: IS_TABLET ? 48 : 36, fontWeight: '900', color: '#333', marginTop: 4 },
  speakBtn:  { marginTop: 12, backgroundColor: '#E8F4FD', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 20 },
  speakTxt:  { fontSize: 17, color: '#0077B6', fontWeight: '700' },
  choices:   { flexDirection: 'row', gap: 20, marginTop: 24 },
  numBtn:    { width: IS_TABLET ? 110 : 88, height: IS_TABLET ? 110 : 88, borderRadius: IS_TABLET ? 55 : 44, backgroundColor: '#FF6B9D', alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  correct:   { backgroundColor: '#52B788' },
  wrong:     { backgroundColor: '#E63946' },
  numTxt:    { fontSize: IS_TABLET ? 50 : 40, fontWeight: '900', color: '#fff' },
  celebTitle:{ fontSize: 52, fontWeight: '900', marginTop: 80, color: '#333' },
  celebSub:  { fontSize: 26, color: '#555', marginTop: 12 },
  bigBtn:    { marginTop: 32, backgroundColor: '#00B4D8', paddingVertical: 16, paddingHorizontal: 44, borderRadius: 24 },
  bigBtnTxt: { fontSize: 22, color: '#fff', fontWeight: '800' },
});
