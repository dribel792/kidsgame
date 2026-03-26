import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Animated, Dimensions } from 'react-native';
import { speak } from '../utils/speak';

const { width } = Dimensions.get('window');
const IS_TABLET = width > 700;
const TOTAL = 10;

// Color questions: show colored circles, ask "Zeige mir Blau!"
const COLOR_Q = [
  { question: 'Zeige mir Rot!',    correct: '#E63946', options: ['#E63946','#00B4D8','#52B788'], labels: ['Rot','Blau','Grün']   },
  { question: 'Zeige mir Blau!',   correct: '#00B4D8', options: ['#FF6B9D','#00B4D8','#F4A261'], labels: ['Rosa','Blau','Orange'] },
  { question: 'Zeige mir Grün!',   correct: '#52B788', options: ['#845EC2','#E63946','#52B788'], labels: ['Lila','Rot','Grün']   },
  { question: 'Zeige mir Gelb!',   correct: '#FFD60A', options: ['#FFD60A','#00B4D8','#E63946'], labels: ['Gelb','Blau','Rot']   },
  { question: 'Zeige mir Lila!',   correct: '#845EC2', options: ['#52B788','#845EC2','#F4A261'], labels: ['Grün','Lila','Orange'] },
  { question: 'Zeige mir Orange!', correct: '#F4A261', options: ['#F4A261','#845EC2','#E63946'], labels: ['Orange','Lila','Rot'] },
  { question: 'Zeige mir Rosa!',   correct: '#FF6B9D', options: ['#00B4D8','#FF6B9D','#52B788'], labels: ['Blau','Rosa','Grün'] },
];

// Category questions: what group does this belong to?
const CAT_Q = [
  { question: 'Was ist eine Farbe?',   options: ['Blau','Hund','Apfel'],   correct: 'Blau'    },
  { question: 'Was ist eine Farbe?',   options: ['Auto','Grün','Banane'],  correct: 'Grün'    },
  { question: 'Was ist ein Tier?',     options: ['Rot','Tisch','Katze'],   correct: 'Katze'   },
  { question: 'Was ist Obst?',         options: ['Stuhl','Apfel','Blau'],  correct: 'Apfel'   },
  { question: 'Was ist ein Fahrzeug?', options: ['Auto','Grün','Hund'],    correct: 'Auto'    },
  { question: 'Was ist ein Tier?',     options: ['Blume','Elefant','Rot'], correct: 'Elefant' },
  { question: 'Was ist Obst?',         options: ['Banane','Auto','Lila'],  correct: 'Banane'  },
];

function buildQ() {
  if (Math.random() < 0.6) {
    const q = COLOR_Q[Math.floor(Math.random() * COLOR_Q.length)];
    return { type: 'color', ...q };
  } else {
    const q = CAT_Q[Math.floor(Math.random() * CAT_Q.length)];
    return { type: 'cat', ...q };
  }
}

export default function ColorsScreen({ navigation }) {
  const [q, setQ]           = useState(buildQ);
  const [round, setRound]   = useState(0);
  const [score, setScore]   = useState(0);
  const [status, setStatus] = useState('playing');
  const [picked, setPicked] = useState(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => { ask(q); }, []);

  function ask(curr) {
    setTimeout(() => speak(curr.question, { rate: 0.82, pitch: 1.15 }), 300);
  }

  function next() {
    const newQ = buildQ();
    setQ(newQ);
    setStatus('playing');
    setPicked(null);
    ask(newQ);
  }

  function handlePickColor(color) {
    if (status !== 'playing') return;
    setPicked(color);
    if (color === q.correct) {
      setStatus('correct');
      setScore(s => s + 1);
      const label = q.labels[q.options.indexOf(color)];
      speak(`Richtig! Das ist ${label}!`, { rate: 0.82, pitch: 1.2 });
      setTimeout(() => {
        if (round + 1 >= TOTAL) setStatus('done');
        else { setRound(r => r + 1); next(); }
      }, 1600);
    } else {
      wrong();
    }
  }

  function handlePickCat(opt) {
    if (status !== 'playing') return;
    setPicked(opt);
    if (opt === q.correct) {
      setStatus('correct');
      setScore(s => s + 1);
      speak(`Richtig! ${q.correct}!`, { rate: 0.82, pitch: 1.2 });
      setTimeout(() => {
        if (round + 1 >= TOTAL) setStatus('done');
        else { setRound(r => r + 1); next(); }
      }, 1600);
    } else {
      wrong();
    }
  }

  function wrong() {
    setStatus('wrong');
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 14,  duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -14, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 55, useNativeDriver: true }),
    ]).start();
    speak('Noch einmal!', { rate: 0.82, pitch: 1.1 });
    setTimeout(() => { setStatus('playing'); setPicked(null); }, 1100);
  }

  if (status === 'done') return (
    <SafeAreaView style={s.safe}>
      <Text style={s.celebTitle}>🎉 Wunderbar! 🎉</Text>
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

      <TouchableOpacity onPress={() => ask(q)} style={s.questionBox}>
        <Text style={s.questionTxt}>{q.question}</Text>
        <Text style={s.tapHint}>🔊 nochmal hören</Text>
      </TouchableOpacity>

      <Animated.View style={[s.optionsRow, { transform: [{ translateX: shakeAnim }] }]}>
        {q.type === 'color' ? (
          q.options.map((color, i) => (
            <TouchableOpacity key={color}
              style={[s.colorBtn, { backgroundColor: color },
                picked === color && status === 'correct' && s.correctBorder,
                picked === color && status === 'wrong'   && s.wrongBorder]}
              onPress={() => handlePickColor(color)} activeOpacity={0.8}>
              {picked === color && status === 'correct' && <Text style={s.tick}>✓</Text>}
              <Text style={s.colorLabel}>{q.labels[i]}</Text>
            </TouchableOpacity>
          ))
        ) : (
          q.options.map(opt => (
            <TouchableOpacity key={opt}
              style={[s.wordBtn,
                picked === opt && status === 'correct' && { backgroundColor: '#52B788' },
                picked === opt && status === 'wrong'   && { backgroundColor: '#E63946' },
                picked !== opt && { backgroundColor: '#845EC2' }]}
              onPress={() => handlePickCat(opt)} activeOpacity={0.75}>
              <Text style={s.wordBtnTxt}>{opt}</Text>
            </TouchableOpacity>
          ))
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const BTN = IS_TABLET ? 160 : (width - 80) / 3;
const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: '#FFF0F8', alignItems: 'center' },
  back:         { alignSelf: 'flex-start', margin: 16, padding: 8 },
  backTxt:      { fontSize: 20, color: '#888', fontWeight: '600' },
  score:        { fontSize: 18, color: '#777' },
  questionBox:  { marginTop: 16, marginBottom: 24, alignItems: 'center' },
  questionTxt:  { fontSize: IS_TABLET ? 36 : 28, fontWeight: '900', color: '#333', textAlign: 'center' },
  tapHint:      { fontSize: 14, color: '#aaa', marginTop: 4 },
  optionsRow:   { flexDirection: 'row', gap: 16, paddingHorizontal: 20 },
  colorBtn:     { width: BTN, height: BTN, borderRadius: BTN / 2, alignItems: 'center', justifyContent: 'center', elevation: 5, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  correctBorder:{ borderWidth: 5, borderColor: '#fff' },
  wrongBorder:  { opacity: 0.5 },
  tick:         { fontSize: 28, color: '#fff', fontWeight: '900' },
  colorLabel:   { fontSize: IS_TABLET ? 16 : 13, fontWeight: '800', color: '#fff', marginTop: 4, textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  wordBtn:      { flex: 1, paddingVertical: IS_TABLET ? 28 : 22, borderRadius: 22, alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  wordBtnTxt:   { fontSize: IS_TABLET ? 24 : 19, fontWeight: '800', color: '#fff' },
  celebTitle:   { fontSize: 52, fontWeight: '900', marginTop: 80, color: '#333' },
  celebSub:     { fontSize: 26, color: '#555', marginTop: 12 },
  bigBtn:       { marginTop: 32, backgroundColor: '#00B4D8', paddingVertical: 16, paddingHorizontal: 44, borderRadius: 24 },
  bigBtnTxt:    { fontSize: 22, color: '#fff', fontWeight: '800' },
});
