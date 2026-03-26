import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Animated, Dimensions } from 'react-native';
import { speak } from '../utils/speak';

const { width } = Dimensions.get('window');
const IS_TABLET = width > 700;
const TOTAL = 8;

// Shapes rendered as unicode/emoji + name
// Questions: "Welche Form ist das?", "Wie viele Ecken hat ein Dreieck?",
//            "Welche Form hat einen runden Rand?", "Was ist größer?"
const SHAPE_QUESTIONS = [
  {
    type: 'name',
    shape: '⬤', question: 'Welche Form ist das?',
    correct: 'Kreis', wrongs: ['Dreieck','Quadrat'],
    hint: 'Rund, keine Ecken',
  },
  {
    type: 'name',
    shape: '▲', question: 'Welche Form ist das?',
    correct: 'Dreieck', wrongs: ['Kreis','Rechteck'],
    hint: 'Drei Ecken, drei Seiten',
  },
  {
    type: 'name',
    shape: '⬛', question: 'Welche Form ist das?',
    correct: 'Quadrat', wrongs: ['Dreieck','Kreis'],
    hint: 'Vier gleiche Seiten',
  },
  {
    type: 'name',
    shape: '⬭', question: 'Welche Form ist das?',
    correct: 'Oval', wrongs: ['Quadrat','Dreieck'],
    hint: 'Wie ein abgeflachter Kreis',
  },
  {
    type: 'corners',
    shape: '▲', question: 'Wie viele Ecken hat das Dreieck?',
    correct: '3', wrongs: ['4','2'],
  },
  {
    type: 'corners',
    shape: '⬛', question: 'Wie viele Ecken hat das Quadrat?',
    correct: '4', wrongs: ['3','5'],
  },
  {
    type: 'find',
    question: 'Welche Form hat keine Ecken?',
    options: ['Dreieck','Kreis','Quadrat'], correct: 'Kreis',
  },
  {
    type: 'find',
    question: 'Welche Form hat 4 gleiche Seiten?',
    options: ['Oval','Dreieck','Quadrat'], correct: 'Quadrat',
  },
  {
    type: 'find',
    question: 'Welche Form ist wie ein Ei?',
    options: ['Dreieck','Oval','Quadrat'], correct: 'Oval',
  },
  {
    type: 'find',
    question: 'Welche Form ist wie eine Pizzastück?',
    options: ['Dreieck','Kreis','Oval'], correct: 'Dreieck',
  },
];

const SHAPE_DISPLAY = { Kreis: '⬤', Dreieck: '▲', Quadrat: '⬛', Oval: '⬭', Rechteck: '▬' };

function buildQ() {
  return SHAPE_QUESTIONS[Math.floor(Math.random() * SHAPE_QUESTIONS.length)];
}

export default function ShapesScreen({ navigation }) {
  const [q, setQ]           = useState(buildQ);
  const [round, setRound]   = useState(0);
  const [score, setScore]   = useState(0);
  const [status, setStatus] = useState('playing');
  const [picked, setPicked] = useState(null);
  const shakeAnim  = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => { load(q); }, []);

  function load(curr) {
    rotateAnim.setValue(0);
    Animated.spring(rotateAnim, { toValue: 1, useNativeDriver: true }).start();
    setTimeout(() => speak(curr.question, { rate: 0.82, pitch: 1.15 }), 300);
  }

  function next() {
    const newQ = buildQ();
    setQ(newQ);
    setStatus('playing');
    setPicked(null);
    load(newQ);
  }

  function handlePick(ans) {
    if (status !== 'playing') return;
    setPicked(ans);
    if (ans === q.correct) {
      setStatus('correct');
      setScore(s => s + 1);
      speak(`Genau! ${q.correct}!`, { rate: 0.82, pitch: 1.2 });
      setTimeout(() => {
        if (round + 1 >= TOTAL) setStatus('done');
        else { setRound(r => r + 1); next(); }
      }, 1700);
    } else {
      setStatus('wrong');
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 12,  duration: 55, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -12, duration: 55, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0,   duration: 55, useNativeDriver: true }),
      ]).start();
      speak('Schau nochmal!', { rate: 0.82, pitch: 1.1 });
      setTimeout(() => { setStatus('playing'); setPicked(null); }, 1100);
    }
  }

  const scale = rotateAnim.interpolate({ inputRange: [0,1], outputRange: [0.6,1] });

  const getOptions = () => {
    if (q.type === 'name')    return [q.correct, ...q.wrongs].sort(() => Math.random() - 0.5);
    if (q.type === 'corners') return [q.correct, ...q.wrongs].sort(() => Math.random() - 0.5);
    return q.options;
  };

  if (status === 'done') return (
    <SafeAreaView style={s.safe}>
      <Text style={s.celebTitle}>🎉 Tolle Arbeit! 🎉</Text>
      <Text style={s.celebSub}>{score} von {TOTAL} richtig!</Text>
      <TouchableOpacity style={s.bigBtn} onPress={() => navigation.goBack()}><Text style={s.bigBtnTxt}>🏠 Startseite</Text></TouchableOpacity>
      <TouchableOpacity style={[s.bigBtn, { backgroundColor: '#FF6B9D', marginTop: 14 }]}
        onPress={() => { setRound(0); setScore(0); next(); }}>
        <Text style={s.bigBtnTxt}>🔄 Nochmal</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  const options = getOptions();

  return (
    <SafeAreaView style={s.safe}>
      <TouchableOpacity style={s.back} onPress={() => navigation.goBack()}><Text style={s.backTxt}>← Zurück</Text></TouchableOpacity>
      <Text style={s.score}>⭐ {score}  Runde {round + 1}/{TOTAL}</Text>

      <TouchableOpacity onPress={() => speak(q.question, { rate: 0.82, pitch: 1.15 })} style={s.qBox}>
        <Text style={s.qTxt}>{q.question}</Text>
        <Text style={s.tapHint}>🔊 nochmal hören</Text>
      </TouchableOpacity>

      {/* Shape display (only for name/corners types) */}
      {(q.type === 'name' || q.type === 'corners') && (
        <Animated.View style={[s.shapeBox, {
          transform: [{ scale }],
          backgroundColor: status === 'correct' ? '#B5EAD7' : status === 'wrong' ? '#FFD5D5' : '#fff',
        }]}>
          <Text style={s.shapeTxt}>{q.shape}</Text>
          {q.hint && <Text style={s.shapeHint}>{q.hint}</Text>}
        </Animated.View>
      )}

      {/* Answer options */}
      <Animated.View style={[s.optRow, { transform: [{ translateX: shakeAnim }] }]}>
        {options.map(opt => {
          const isCorrect = opt === q.correct && status === 'correct';
          const isWrong   = opt === picked && status === 'wrong';
          const showShape = q.type === 'find' && SHAPE_DISPLAY[opt];
          return (
            <TouchableOpacity key={opt}
              style={[s.optBtn,
                isCorrect && { backgroundColor: '#52B788' },
                isWrong   && { backgroundColor: '#E63946' },
                !isCorrect && !isWrong && { backgroundColor: '#845EC2' }]}
              onPress={() => handlePick(opt)} activeOpacity={0.75}>
              {showShape && <Text style={s.optShape}>{SHAPE_DISPLAY[opt]}</Text>}
              <Text style={s.optTxt}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </Animated.View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: '#F3E8FF', alignItems: 'center' },
  back:       { alignSelf: 'flex-start', margin: 16, padding: 8 },
  backTxt:    { fontSize: 20, color: '#888', fontWeight: '600' },
  score:      { fontSize: 18, color: '#777' },
  qBox:       { marginTop: 10, alignItems: 'center', paddingHorizontal: 20 },
  qTxt:       { fontSize: IS_TABLET ? 30 : 22, fontWeight: '900', color: '#333', textAlign: 'center' },
  tapHint:    { fontSize: 14, color: '#aaa', marginTop: 2 },
  shapeBox:   { marginTop: 16, width: IS_TABLET ? 200 : 160, height: IS_TABLET ? 200 : 160, borderRadius: 24, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  shapeTxt:   { fontSize: IS_TABLET ? 100 : 80, color: '#845EC2' },
  shapeHint:  { fontSize: 14, color: '#888', marginTop: 4 },
  optRow:     { flexDirection: 'row', gap: 14, marginTop: 24, paddingHorizontal: 16, flexWrap: 'wrap', justifyContent: 'center' },
  optBtn:     { minWidth: IS_TABLET ? 150 : 110, paddingVertical: IS_TABLET ? 20 : 16, paddingHorizontal: 12, borderRadius: 22, alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  optShape:   { fontSize: IS_TABLET ? 40 : 32, color: '#fff' },
  optTxt:     { fontSize: IS_TABLET ? 22 : 18, fontWeight: '800', color: '#fff', marginTop: 4 },
  celebTitle: { fontSize: 52, fontWeight: '900', marginTop: 80, color: '#333' },
  celebSub:   { fontSize: 26, color: '#555', marginTop: 12 },
  bigBtn:     { marginTop: 32, backgroundColor: '#00B4D8', paddingVertical: 16, paddingHorizontal: 44, borderRadius: 24 },
  bigBtnTxt:  { fontSize: 22, color: '#fff', fontWeight: '800' },
});
