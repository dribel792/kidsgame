import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Animated, Dimensions } from 'react-native';
import { speak } from '../utils/speak';

const { width } = Dimensions.get('window');
const IS_TABLET = width > 700;

const ALL_QUESTIONS = [
  // Leicht (L1) — most common letters
  { letter: 'A', correct: 'Apfel',    wrongs: ['Katze',   'Mond',    'Hund'   ], level: 1 },
  { letter: 'B', correct: 'Bär',      wrongs: ['Hund',    'Apfel',   'Fisch'  ], level: 1 },
  { letter: 'E', correct: 'Elefant',  wrongs: ['Fisch',   'Banane',  'Hund'   ], level: 1 },
  { letter: 'H', correct: 'Hund',     wrongs: ['Löwe',    'Elefant', 'Bär'    ], level: 1 },
  { letter: 'K', correct: 'Katze',    wrongs: ['Fisch',   'Apfel',   'Bär'    ], level: 1 },
  // Mittel (L2) — more letters
  { letter: 'D', correct: 'Dino',     wrongs: ['Bär',     'Stern',   'Katze'  ], level: 2 },
  { letter: 'F', correct: 'Fisch',    wrongs: ['Hund',    'Mond',    'Apfel'  ], level: 2 },
  { letter: 'G', correct: 'Giraffe',  wrongs: ['Katze',   'Apfel',   'Bär'    ], level: 2 },
  { letter: 'I', correct: 'Igel',     wrongs: ['Banane',  'Hund',    'Fisch'  ], level: 2 },
  { letter: 'L', correct: 'Löwe',     wrongs: ['Bär',     'Giraffe', 'Igel'   ], level: 2 },
  // Schwer (L3) — harder letters
  { letter: 'M', correct: 'Maus',     wrongs: ['Bär',     'Fisch',   'Giraffe','Katze'], level: 3 },
  { letter: 'N', correct: 'Nase',     wrongs: ['Mund',    'Auge',    'Ohr',    'Hand' ], level: 3 },
  { letter: 'R', correct: 'Rose',     wrongs: ['Nase',    'Löwe',    'Bär',    'Igel' ], level: 3 },
  { letter: 'S', correct: 'Sonne',    wrongs: ['Mond',    'Stern',   'Wolke',  'Regen'], level: 3 },
  { letter: 'T', correct: 'Tiger',    wrongs: ['Löwe',    'Bär',     'Wolf',   'Igel' ], level: 3 },
  // Experte (L4) — uncommon letters + 4 choices
  { letter: 'V', correct: 'Vogel',    wrongs: ['Fisch',   'Igel',    'Tiger',  'Bär'  ], level: 4 },
  { letter: 'W', correct: 'Wolf',     wrongs: ['Vogel',   'Maus',    'Tiger',  'Bär'  ], level: 4 },
  { letter: 'Z', correct: 'Zebra',    wrongs: ['Tiger',   'Löwe',    'Wolf',   'Hund' ], level: 4 },
  { letter: 'P', correct: 'Pinguin',  wrongs: ['Papagei', 'Pelikan', 'Pferd',  'Panda'], level: 4 },
  { letter: 'O', correct: 'Otter',    wrongs: ['Obst',    'Ohr',     'Igel',   'Elefant'], level: 4 },
];

// Difficulty config
const CFG = {
  1: { pool: ALL_QUESTIONS.filter(q => q.level === 1),               wrongCount: 2, rounds: 5  },
  2: { pool: ALL_QUESTIONS.filter(q => q.level <= 2),                wrongCount: 2, rounds: 10 },
  3: { pool: ALL_QUESTIONS.filter(q => q.level <= 3),                wrongCount: 3, rounds: 12 },
  4: { pool: ALL_QUESTIONS,                                           wrongCount: 3, rounds: 15 },
};

const CARD_COLORS = ['#FF6B9D','#845EC2','#00B4D8','#F4A261','#52B788','#E63946'];
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

export default function LettersScreen({ route, navigation }) {
  const difficulty = route.params?.difficulty ?? 2;
  const cfg        = CFG[difficulty];
  const [pool]     = useState(() => shuffle(cfg.pool));
  const [qIndex, setQIndex]   = useState(0);
  const [choices, setChoices] = useState([]);
  const [status, setStatus]   = useState('playing');
  const [score, setScore]     = useState(0);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const q = pool[qIndex % pool.length];

  useEffect(() => {
    const wrongOptions = shuffle(q.wrongs).slice(0, cfg.wrongCount);
    setChoices(shuffle([q.correct, ...wrongOptions]));
    setStatus('playing');
    setTimeout(() => speak(`Welches Wort beginnt mit dem Buchstaben ${q.letter}?`, { rate: 0.82, pitch: 1.15 }), 300);
  }, [qIndex]);

  function handlePick(word) {
    if (status !== 'playing') return;
    if (word === q.correct) {
      setStatus('correct');
      setScore(s => s + 1);
      speak(`Super! ${q.correct} beginnt mit ${q.letter}!`, { rate: 0.82, pitch: 1.2 });
      setTimeout(() => {
        if (qIndex + 1 >= cfg.rounds) setStatus('done');
        else setQIndex(i => i + 1);
      }, 1800);
    } else {
      setStatus('wrong');
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 12,  duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -12, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
      ]).start();
      speak('Versuch es nochmal! Du schaffst das!', { rate: 0.82, pitch: 1.1 });
      setTimeout(() => setStatus('playing'), 1200);
    }
  }

  if (status === 'done') return (
    <SafeAreaView style={s.safe}>
      <Text style={s.celebTitle}>🎉 Toll gemacht! 🎉</Text>
      <Text style={s.celebScore}>{score} von {cfg.rounds} richtig!</Text>
      <TouchableOpacity style={s.backBtn} onPress={() => navigation.navigate('Home')}><Text style={s.backBtnTxt}>🏠 Startseite</Text></TouchableOpacity>
      <TouchableOpacity style={[s.backBtn, { backgroundColor: '#FF6B9D', marginTop: 12 }]}
        onPress={() => { setQIndex(0); setScore(0); setStatus('playing'); }}>
        <Text style={s.backBtnTxt}>🔄 Nochmal</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={s.safe}>
      <TouchableOpacity style={s.back} onPress={() => navigation.goBack()}><Text style={s.backTxt}>← Zurück</Text></TouchableOpacity>
      <Text style={s.score}>⭐ {score}  {qIndex + 1}/{cfg.rounds}</Text>

      <Animated.View style={[s.letterBox, {
        transform: [{ translateX: shakeAnim }],
        backgroundColor: status === 'correct' ? '#B5EAD7' : status === 'wrong' ? '#FFD5D5' : '#FFF9C4',
      }]}>
        <Text style={s.bigLetter}>{q.letter}</Text>
        <Text style={s.letterHint}>Welches Wort beginnt mit {q.letter}?</Text>
      </Animated.View>

      <TouchableOpacity onPress={() => speak(`Welches Wort beginnt mit ${q.letter}?`, { rate: 0.82, pitch: 1.15 })} style={s.speakBtn}>
        <Text style={s.speakTxt}>🔊 Nochmal hören</Text>
      </TouchableOpacity>

      <View style={s.choicesCol}>
        {choices.map((word, i) => {
          const isCorrect = word === q.correct && status === 'correct';
          const bg = isCorrect ? '#52B788' : CARD_COLORS[i % CARD_COLORS.length];
          return (
            <TouchableOpacity key={word} style={[s.wordBtn, { backgroundColor: bg }]}
              onPress={() => { speak(word, { rate: 0.82, pitch: 1.1 }); handlePick(word); }}
              activeOpacity={0.75}>
              <Text style={s.wordBtnTxt}>{word}</Text>
              {isCorrect && <Text style={s.tick}> ✓</Text>}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={s.progressRow}>
        {Array.from({ length: cfg.rounds }).map((_, i) => (
          <View key={i} style={[s.dot, i < qIndex && s.dotDone, i === qIndex && s.dotCurrent]} />
        ))}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: '#FFF9F0', alignItems: 'center' },
  back:         { alignSelf: 'flex-start', margin: 16, padding: 8 },
  backTxt:      { fontSize: 20, color: '#888', fontWeight: '600' },
  score:        { fontSize: 18, color: '#777' },
  letterBox:    { marginTop: 8, width: IS_TABLET ? 320 : width * 0.75, paddingVertical: 20, borderRadius: 32, alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  bigLetter:    { fontSize: IS_TABLET ? 120 : 90, fontWeight: '900', color: '#333' },
  letterHint:   { fontSize: 17, color: '#555', marginTop: 4, textAlign: 'center', paddingHorizontal: 12 },
  speakBtn:     { marginTop: 10, backgroundColor: '#E8F4FD', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 20 },
  speakTxt:     { fontSize: 18, color: '#0077B6', fontWeight: '700' },
  choicesCol:   { marginTop: 18, width: IS_TABLET ? 380 : width * 0.82, gap: 12 },
  wordBtn:      { width: '100%', paddingVertical: IS_TABLET ? 22 : 18, borderRadius: 22, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
  wordBtnTxt:   { fontSize: IS_TABLET ? 30 : 26, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  tick:         { fontSize: 24, color: '#fff', marginLeft: 10 },
  celebTitle:   { fontSize: 52, fontWeight: '900', marginTop: 60, color: '#333' },
  celebScore:   { fontSize: 28, color: '#555', marginTop: 12 },
  backBtn:      { marginTop: 32, backgroundColor: '#845EC2', paddingVertical: 16, paddingHorizontal: 40, borderRadius: 24 },
  backBtnTxt:   { fontSize: 22, color: '#fff', fontWeight: '800' },
  progressRow:  { flexDirection: 'row', gap: 6, marginTop: 16, flexWrap: 'wrap', justifyContent: 'center', paddingHorizontal: 20 },
  dot:          { width: 10, height: 10, borderRadius: 5, backgroundColor: '#ddd' },
  dotDone:      { backgroundColor: '#52B788' },
  dotCurrent:   { backgroundColor: '#FF6B9D', transform: [{ scale: 1.3 }] },
});
