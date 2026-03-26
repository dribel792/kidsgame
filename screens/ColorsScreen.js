import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Animated, Dimensions } from 'react-native';
import { speak } from '../utils/speak';

const { width } = Dimensions.get('window');
const IS_TABLET = width > 700;

const COLOR_Q = [
  { question: 'Zeige mir Rot!',    correct: '#E63946', options: ['#E63946','#00B4D8','#52B788'], labels: ['Rot','Blau','Grün'],        level: 1 },
  { question: 'Zeige mir Blau!',   correct: '#00B4D8', options: ['#FF6B9D','#00B4D8','#F4A261'], labels: ['Rosa','Blau','Orange'],      level: 1 },
  { question: 'Zeige mir Grün!',   correct: '#52B788', options: ['#845EC2','#E63946','#52B788'], labels: ['Lila','Rot','Grün'],         level: 1 },
  { question: 'Zeige mir Gelb!',   correct: '#FFD60A', options: ['#FFD60A','#00B4D8','#E63946'], labels: ['Gelb','Blau','Rot'],         level: 2 },
  { question: 'Zeige mir Lila!',   correct: '#845EC2', options: ['#52B788','#845EC2','#F4A261'], labels: ['Grün','Lila','Orange'],      level: 2 },
  { question: 'Zeige mir Orange!', correct: '#F4A261', options: ['#F4A261','#845EC2','#E63946'], labels: ['Orange','Lila','Rot'],       level: 2 },
  { question: 'Zeige mir Rosa!',   correct: '#FF6B9D', options: ['#00B4D8','#FF6B9D','#52B788'], labels: ['Blau','Rosa','Grün'],        level: 2 },
  { question: 'Zeige mir Türkis!', correct: '#06D6A0', options: ['#06D6A0','#00B4D8','#52B788'], labels: ['Türkis','Blau','Grün'],      level: 3 },
  { question: 'Zeige mir Braun!',  correct: '#8B5E3C', options: ['#8B5E3C','#E63946','#F4A261'], labels: ['Braun','Rot','Orange'],      level: 3 },
];
const CAT_Q = [
  { question: 'Was ist eine Farbe?',   options: ['Blau','Hund','Apfel'],    correct: 'Blau',    level: 1 },
  { question: 'Was ist eine Farbe?',   options: ['Auto','Grün','Banane'],   correct: 'Grün',    level: 1 },
  { question: 'Was ist ein Tier?',     options: ['Rot','Tisch','Katze'],    correct: 'Katze',   level: 1 },
  { question: 'Was ist Obst?',         options: ['Stuhl','Apfel','Blau'],   correct: 'Apfel',   level: 2 },
  { question: 'Was ist ein Fahrzeug?', options: ['Auto','Grün','Hund'],     correct: 'Auto',    level: 2 },
  { question: 'Was ist ein Tier?',     options: ['Blume','Elefant','Rot'],  correct: 'Elefant', level: 2 },
  { question: 'Was ist Obst?',         options: ['Banane','Auto','Lila'],   correct: 'Banane',  level: 2 },
  { question: 'Was ist Kleidung?',     options: ['Jacke','Apfel','Blau'],   correct: 'Jacke',   level: 3 },
  { question: 'Was ist ein Werkzeug?', options: ['Hammer','Hund','Banane'], correct: 'Hammer',  level: 3 },
  { question: 'Was ist ein Möbelstück?',options: ['Tisch','Fisch','Lila'],  correct: 'Tisch',   level: 4 },
  { question: 'Was ist ein Instrument?',options: ['Gitarre','Auto','Rot'],  correct: 'Gitarre', level: 4 },
];

const ROUNDS  = { 1: 5, 2: 8, 3: 10, 4: 12 };
const MAX_LVL = { 1: 1, 2: 2, 3: 3, 4: 4 };

function buildQ(maxLevel) {
  const colors = COLOR_Q.filter(q => q.level <= maxLevel);
  const cats   = CAT_Q.filter(q => q.level <= maxLevel);
  if (Math.random() < 0.55 && colors.length > 0) {
    const q = colors[Math.floor(Math.random() * colors.length)];
    return { type: 'color', ...q };
  }
  const q = cats[Math.floor(Math.random() * cats.length)];
  return { type: 'cat', ...q };
}

export default function ColorsScreen({ route, navigation }) {
  const difficulty = route.params?.difficulty ?? 2;
  const maxLevel   = MAX_LVL[difficulty];
  const totalRounds = ROUNDS[difficulty];
  const [q, setQ]           = useState(() => buildQ(maxLevel));
  const [round, setRound]   = useState(0);
  const [score, setScore]   = useState(0);
  const [status, setStatus] = useState('playing');
  const [picked, setPicked] = useState(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => { ask(q); }, []);
  function ask(curr) { setTimeout(() => speak(curr.question, { rate: 0.82, pitch: 1.15 }), 300); }

  function next() { const nq = buildQ(maxLevel); setQ(nq); setStatus('playing'); setPicked(null); ask(nq); }

  function wrong() {
    setStatus('wrong');
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 14, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -14, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 55, useNativeDriver: true }),
    ]).start();
    speak('Noch einmal!', { rate: 0.82, pitch: 1.1 });
    setTimeout(() => { setStatus('playing'); setPicked(null); }, 1100);
  }

  function advance() {
    setTimeout(() => {
      if (round + 1 >= totalRounds) setStatus('done');
      else { setRound(r => r + 1); next(); }
    }, 1600);
  }

  function handlePickColor(color) {
    if (status !== 'playing') return;
    setPicked(color);
    if (color === q.correct) {
      setStatus('correct'); setScore(s => s + 1);
      const label = q.labels[q.options.indexOf(color)];
      speak(`Richtig! Das ist ${label}!`, { rate: 0.82, pitch: 1.2 });
      advance();
    } else { wrong(); }
  }

  function handlePickCat(opt) {
    if (status !== 'playing') return;
    setPicked(opt);
    if (opt === q.correct) {
      setStatus('correct'); setScore(s => s + 1);
      speak(`Richtig! ${q.correct}!`, { rate: 0.82, pitch: 1.2 });
      advance();
    } else { wrong(); }
  }

  if (status === 'done') return (
    <SafeAreaView style={s.safe}>
      <Text style={s.celebTitle}>🎉 Wunderbar! 🎉</Text>
      <Text style={s.celebSub}>{score} von {totalRounds} richtig!</Text>
      <TouchableOpacity style={s.bigBtn} onPress={() => navigation.navigate('Home')}><Text style={s.bigBtnTxt}>🏠 Startseite</Text></TouchableOpacity>
      <TouchableOpacity style={[s.bigBtn, { backgroundColor: '#FF6B9D', marginTop: 14 }]}
        onPress={() => { setRound(0); setScore(0); next(); }}>
        <Text style={s.bigBtnTxt}>🔄 Nochmal</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  const BTN = IS_TABLET ? 150 : (width - 80) / 3;
  return (
    <SafeAreaView style={s.safe}>
      <TouchableOpacity style={s.back} onPress={() => navigation.goBack()}><Text style={s.backTxt}>← Zurück</Text></TouchableOpacity>
      <Text style={s.score}>⭐ {score}  Runde {round + 1}/{totalRounds}</Text>
      <TouchableOpacity onPress={() => ask(q)} style={s.qBox}>
        <Text style={s.qTxt}>{q.question}</Text>
        <Text style={s.tapHint}>🔊 nochmal hören</Text>
      </TouchableOpacity>
      <Animated.View style={[s.optionsRow, { transform: [{ translateX: shakeAnim }] }]}>
        {q.type === 'color' ? (
          q.options.map((color, i) => (
            <TouchableOpacity key={color}
              style={[s.colorBtn, { backgroundColor: color, width: BTN, height: BTN, borderRadius: BTN / 2 },
                picked === color && status === 'correct' && s.correctBorder,
                picked === color && status === 'wrong'   && { opacity: 0.4 }]}
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
                (picked !== opt || status === 'playing') && { backgroundColor: '#845EC2' }]}
              onPress={() => handlePickCat(opt)} activeOpacity={0.75}>
              <Text style={s.wordBtnTxt}>{opt}</Text>
            </TouchableOpacity>
          ))
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: '#FFF0F8', alignItems: 'center' },
  back:        { alignSelf: 'flex-start', margin: 16, padding: 8 },
  backTxt:     { fontSize: 20, color: '#888', fontWeight: '600' },
  score:       { fontSize: 18, color: '#777' },
  qBox:        { marginTop: 14, marginBottom: 22, alignItems: 'center' },
  qTxt:        { fontSize: IS_TABLET ? 34 : 26, fontWeight: '900', color: '#333', textAlign: 'center' },
  tapHint:     { fontSize: 14, color: '#aaa', marginTop: 2 },
  optionsRow:  { flexDirection: 'row', gap: 14, paddingHorizontal: 16, flexWrap: 'wrap', justifyContent: 'center' },
  colorBtn:    { alignItems: 'center', justifyContent: 'center', elevation: 5, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  correctBorder:{ borderWidth: 5, borderColor: '#fff' },
  tick:        { fontSize: 28, color: '#fff', fontWeight: '900' },
  colorLabel:  { fontSize: 13, fontWeight: '800', color: '#fff', marginTop: 4, textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  wordBtn:     { paddingVertical: IS_TABLET ? 26 : 20, paddingHorizontal: 20, borderRadius: 22, alignItems: 'center', minWidth: IS_TABLET ? 160 : 100, elevation: 4, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  wordBtnTxt:  { fontSize: IS_TABLET ? 22 : 18, fontWeight: '800', color: '#fff' },
  celebTitle:  { fontSize: 52, fontWeight: '900', marginTop: 80, color: '#333' },
  celebSub:    { fontSize: 26, color: '#555', marginTop: 12 },
  bigBtn:      { marginTop: 32, backgroundColor: '#00B4D8', paddingVertical: 16, paddingHorizontal: 44, borderRadius: 24 },
  bigBtnTxt:   { fontSize: 22, color: '#fff', fontWeight: '800' },
});
