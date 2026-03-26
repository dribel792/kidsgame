import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Animated, Dimensions } from 'react-native';
import { speak } from '../utils/speak';

const { width } = Dimensions.get('window');
const IS_TABLET = width > 700;

const ALL_Q = [
  // L1 — name basic shapes
  { type:'name', shape:'⬤', q:'Welche Form ist das?',          correct:'Kreis',    wrongs:['Dreieck','Quadrat'],              level:1 },
  { type:'name', shape:'▲', q:'Welche Form ist das?',          correct:'Dreieck',  wrongs:['Kreis','Rechteck'],               level:1 },
  { type:'name', shape:'⬛', q:'Welche Form ist das?',         correct:'Quadrat',  wrongs:['Dreieck','Kreis'],                level:1 },
  // L2 — corners + find-by-property
  { type:'name', shape:'⬭', q:'Welche Form ist das?',          correct:'Oval',     wrongs:['Quadrat','Dreieck'],              level:2 },
  { type:'corners', shape:'▲', q:'Wie viele Ecken hat das Dreieck?', correct:'3', wrongs:['4','2'],                           level:2 },
  { type:'corners', shape:'⬛', q:'Wie viele Ecken hat das Quadrat?', correct:'4', wrongs:['3','5'],                           level:2 },
  { type:'find', q:'Welche Form hat keine Ecken?',             correct:'Kreis',    options:['Dreieck','Kreis','Quadrat'],     level:2 },
  // L3 — harder properties
  { type:'find', q:'Welche Form hat 4 gleiche Seiten?',        correct:'Quadrat',  options:['Oval','Dreieck','Quadrat'],      level:3 },
  { type:'find', q:'Welche Form ist wie ein Ei?',              correct:'Oval',     options:['Dreieck','Oval','Quadrat'],      level:3 },
  { type:'corners', shape:'⬛', q:'Wie viele Seiten hat ein Quadrat?', correct:'4', wrongs:['3','6'],                         level:3 },
  { type:'find', q:'Welche Form hat 3 Ecken?',                 correct:'Dreieck',  options:['Oval','Kreis','Dreieck'],        level:3 },
  // L4 — 3D + advanced
  { type:'find', q:'Welche Form sieht wie eine Kugel aus?',    correct:'Kreis',    options:['Quadrat','Kreis','Dreieck'],     level:4 },
  { type:'find', q:'Welche Form hat die meisten Ecken?',       correct:'Quadrat',  options:['Dreieck','Oval','Quadrat'],      level:4 },
  { type:'corners', shape:'⬭', q:'Wie viele Ecken hat ein Oval?', correct:'0',    wrongs:['2','4'],                          level:4 },
  { type:'find', q:'Welches ist KEINE gerade Linie?',          correct:'Kreis',    options:['Quadrat','Dreieck','Kreis'],     level:4 },
];

const POOLS  = { 1: ALL_Q.filter(q=>q.level===1), 2: ALL_Q.filter(q=>q.level<=2), 3: ALL_Q.filter(q=>q.level<=3), 4: ALL_Q };
const ROUNDS = { 1: 5, 2: 8, 3: 10, 4: 12 };
const SHAPE_DISPLAY = { Kreis:'⬤', Dreieck:'▲', Quadrat:'⬛', Oval:'⬭' };

function buildQ(pool) {
  const q = pool[Math.floor(Math.random() * pool.length)];
  let opts;
  if (q.type === 'find') opts = q.options;
  else opts = [q.correct, ...q.wrongs].sort(() => Math.random() - 0.5);
  return { ...q, opts };
}

export default function ShapesScreen({ route, navigation }) {
  const difficulty  = route.params?.difficulty ?? 2;
  const pool        = POOLS[difficulty];
  const totalRounds = ROUNDS[difficulty];
  const [q, setQ]           = useState(() => buildQ(pool));
  const [round, setRound]   = useState(0);
  const [score, setScore]   = useState(0);
  const [status, setStatus] = useState('playing');
  const [picked, setPicked] = useState(null);
  const shakeAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim  = useRef(new Animated.Value(0.7)).current;

  useEffect(() => { load(q); }, []);

  function load(curr) {
    scaleAnim.setValue(0.7);
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
    setTimeout(() => speak(curr.q, { rate: 0.82, pitch: 1.15 }), 300);
  }

  function next() { const nq = buildQ(pool); setQ(nq); setStatus('playing'); setPicked(null); load(nq); }

  function handlePick(ans) {
    if (status !== 'playing') return;
    setPicked(ans);
    if (ans === q.correct) {
      setStatus('correct'); setScore(s => s + 1);
      speak(`Genau! ${q.correct}!`, { rate: 0.82, pitch: 1.2 });
      setTimeout(() => {
        if (round + 1 >= totalRounds) setStatus('done');
        else { setRound(r => r + 1); next(); }
      }, 1700);
    } else {
      setStatus('wrong');
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 12, duration: 55, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -12, duration: 55, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 55, useNativeDriver: true }),
      ]).start();
      speak('Schau nochmal!', { rate: 0.82, pitch: 1.1 });
      setTimeout(() => { setStatus('playing'); setPicked(null); }, 1100);
    }
  }

  if (status === 'done') return (
    <SafeAreaView style={s.safe}>
      <Text style={s.celebTitle}>🎉 Tolle Arbeit! 🎉</Text>
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
      <TouchableOpacity onPress={() => speak(q.q, { rate: 0.82, pitch: 1.15 })} style={s.qBox}>
        <Text style={s.qTxt}>{q.q}</Text>
        <Text style={s.tapHint}>🔊 nochmal hören</Text>
      </TouchableOpacity>
      {(q.type === 'name' || q.type === 'corners') && (
        <Animated.View style={[s.shapeBox, {
          transform: [{ scale: scaleAnim }],
          backgroundColor: status === 'correct' ? '#B5EAD7' : status === 'wrong' ? '#FFD5D5' : '#fff',
        }]}>
          <Text style={s.shapeTxt}>{q.shape}</Text>
        </Animated.View>
      )}
      <Animated.View style={[s.optRow, { transform: [{ translateX: shakeAnim }] }]}>
        {q.opts.map(opt => (
          <TouchableOpacity key={opt}
            style={[s.optBtn,
              picked === opt && status === 'correct' && { backgroundColor: '#52B788' },
              picked === opt && status === 'wrong'   && { backgroundColor: '#E63946' },
              !(picked === opt) && { backgroundColor: '#845EC2' }]}
            onPress={() => handlePick(opt)} activeOpacity={0.75}>
            {q.type === 'find' && SHAPE_DISPLAY[opt] && (
              <Text style={s.optShape}>{SHAPE_DISPLAY[opt]}</Text>
            )}
            <Text style={s.optTxt}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#F3E8FF', alignItems: 'center' },
  back:      { alignSelf: 'flex-start', margin: 16, padding: 8 },
  backTxt:   { fontSize: 20, color: '#888', fontWeight: '600' },
  score:     { fontSize: 18, color: '#777' },
  qBox:      { marginTop: 8, alignItems: 'center', paddingHorizontal: 20 },
  qTxt:      { fontSize: IS_TABLET ? 28 : 21, fontWeight: '900', color: '#333', textAlign: 'center' },
  tapHint:   { fontSize: 14, color: '#aaa', marginTop: 2 },
  shapeBox:  { marginTop: 14, width: IS_TABLET ? 180 : 140, height: IS_TABLET ? 180 : 140, borderRadius: 24, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  shapeTxt:  { fontSize: IS_TABLET ? 90 : 70, color: '#845EC2' },
  optRow:    { flexDirection: 'row', gap: 12, marginTop: 20, paddingHorizontal: 16, flexWrap: 'wrap', justifyContent: 'center' },
  optBtn:    { minWidth: IS_TABLET ? 140 : 100, paddingVertical: IS_TABLET ? 18 : 14, paddingHorizontal: 10, borderRadius: 22, alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  optShape:  { fontSize: IS_TABLET ? 36 : 28, color: '#fff' },
  optTxt:    { fontSize: IS_TABLET ? 20 : 16, fontWeight: '800', color: '#fff', marginTop: 4 },
  celebTitle:{ fontSize: 52, fontWeight: '900', marginTop: 80, color: '#333' },
  celebSub:  { fontSize: 26, color: '#555', marginTop: 12 },
  bigBtn:    { marginTop: 32, backgroundColor: '#00B4D8', paddingVertical: 16, paddingHorizontal: 44, borderRadius: 24 },
  bigBtnTxt: { fontSize: 22, color: '#fff', fontWeight: '800' },
});
