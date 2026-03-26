import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Animated, Dimensions } from 'react-native';
import { speak } from '../utils/speak';

const { width } = Dimensions.get('window');
const IS_TABLET = width > 700;
const TOTAL = 10;

const QUESTIONS = [
  { q: 'Was sagt die Katze?',              correct: 'Miau',   wrongs: ['Wau',    'Muh'   ], emoji: '🐱' },
  { q: 'Was sagt der Hund?',              correct: 'Wau',    wrongs: ['Miau',   'Quak'  ], emoji: '🐶' },
  { q: 'Was sagt die Kuh?',               correct: 'Muh',    wrongs: ['Miau',   'Wau'   ], emoji: '🐄' },
  { q: 'Was sagt der Frosch?',            correct: 'Quak',   wrongs: ['Miau',   'Muh'   ], emoji: '🐸' },
  { q: 'Wie viele Beine hat ein Hund?',   correct: '4',      wrongs: ['2',      '6'     ], emoji: '🐶' },
  { q: 'Wie viele Beine hat ein Vogel?',  correct: '2',      wrongs: ['4',      '6'     ], emoji: '🐦' },
  { q: 'Welche Farbe hat eine Banane?',   correct: 'Gelb',   wrongs: ['Rot',    'Blau'  ], emoji: '🍌' },
  { q: 'Welche Farbe hat ein Apfel?',     correct: 'Rot',    wrongs: ['Blau',   'Gelb'  ], emoji: '🍎' },
  { q: 'Was gibt uns die Sonne?',         correct: 'Licht',  wrongs: ['Wasser', 'Essen' ], emoji: '☀️' },
  { q: 'Was fällt vom Himmel wenn es regnet?', correct: 'Regen', wrongs: ['Schnee','Sand'], emoji: '🌧️' },
  { q: 'Wo lebt ein Fisch?',              correct: 'Im Wasser', wrongs: ['In der Luft','Auf dem Baum'], emoji: '🐟' },
  { q: 'Was essen Kaninchen am liebsten?',correct: 'Karotten', wrongs: ['Pizza','Eis'], emoji: '🐰' },
  { q: 'Welcher Vogel kann nicht fliegen?', correct: 'Pinguin', wrongs: ['Adler','Taube'], emoji: '🐧' },
  { q: 'Was hat ein Baum?',               correct: 'Blätter', wrongs: ['Flossen','Räder'], emoji: '🌳' },
  { q: 'Wie heißt der König der Tiere?',  correct: 'Löwe', wrongs: ['Hund','Elefant'], emoji: '🦁' },
  { q: 'Was macht die Biene?',            correct: 'Honig', wrongs: ['Milch','Butter'], emoji: '🐝' },
  { q: 'Womit schreibt man?',             correct: 'Stift', wrongs: ['Löffel','Gabel'], emoji: '✏️' },
  { q: 'Was ist rund und rollt?',         correct: 'Ball', wrongs: ['Buch','Tisch'], emoji: '⚽' },
];

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

export default function TriviaScreen({ navigation }) {
  const [order]   = useState(() => shuffle(Array.from({ length: QUESTIONS.length }, (_, i) => i)));
  const [idx, setIdx]       = useState(0);
  const [score, setScore]   = useState(0);
  const [status, setStatus] = useState('playing');
  const [choices, setChoices] = useState([]);
  const [picked, setPicked] = useState(null);
  const shakeAnim  = useRef(new Animated.Value(0)).current;
  const emojiScale = useRef(new Animated.Value(0.5)).current;

  const q = QUESTIONS[order[idx % order.length]];

  useEffect(() => { load(); }, [idx]);

  function load() {
    const curr = QUESTIONS[order[idx % order.length]];
    setChoices(shuffle([curr.correct, ...curr.wrongs]));
    setStatus('playing');
    setPicked(null);
    emojiScale.setValue(0.5);
    Animated.spring(emojiScale, { toValue: 1, useNativeDriver: true }).start();
    setTimeout(() => speak(curr.q, { rate: 0.82, pitch: 1.15 }), 300);
  }

  function handlePick(ans) {
    if (status !== 'playing') return;
    setPicked(ans);
    if (ans === q.correct) {
      setStatus('correct');
      setScore(s => s + 1);
      speak(`Richtig! ${q.correct}!`, { rate: 0.82, pitch: 1.2 });
      setTimeout(() => {
        if (idx + 1 >= TOTAL) setStatus('done');
        else setIdx(i => i + 1);
      }, 1800);
    } else {
      setStatus('wrong');
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 14,  duration: 55, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -14, duration: 55, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0,   duration: 55, useNativeDriver: true }),
      ]).start();
      speak('Nicht ganz! Versuch nochmal!', { rate: 0.82, pitch: 1.1 });
      setTimeout(() => { setStatus('playing'); setPicked(null); }, 1200);
    }
  }

  if (status === 'done') return (
    <SafeAreaView style={s.safe}>
      <Text style={s.celebTitle}>🎉 Klasse! 🎉</Text>
      <Text style={s.celebSub}>{score} von {TOTAL} richtig!</Text>
      <TouchableOpacity style={s.bigBtn} onPress={() => navigation.goBack()}><Text style={s.bigBtnTxt}>🏠 Startseite</Text></TouchableOpacity>
      <TouchableOpacity style={[s.bigBtn, { backgroundColor: '#FF6B9D', marginTop: 14 }]}
        onPress={() => { setIdx(0); setScore(0); }}>
        <Text style={s.bigBtnTxt}>🔄 Nochmal</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={s.safe}>
      <TouchableOpacity style={s.back} onPress={() => navigation.goBack()}><Text style={s.backTxt}>← Zurück</Text></TouchableOpacity>
      <Text style={s.score}>⭐ {score}  Frage {idx + 1}/{TOTAL}</Text>

      <Animated.Text style={[s.bigEmoji, { transform: [{ scale: emojiScale }] }]}>{q.emoji}</Animated.Text>

      <Animated.View style={[s.qBox, { transform: [{ translateX: shakeAnim }] }]}>
        <Text style={s.qTxt}>{q.q}</Text>
      </Animated.View>

      <TouchableOpacity onPress={() => speak(q.q, { rate: 0.82, pitch: 1.15 })} style={s.speakBtn}>
        <Text style={s.speakTxt}>🔊 Nochmal hören</Text>
      </TouchableOpacity>

      <View style={s.choicesCol}>
        {choices.map(ans => {
          const isC = ans === q.correct && status === 'correct';
          const isW = ans === picked    && status === 'wrong';
          return (
            <TouchableOpacity key={ans}
              style={[s.ansBtn,
                isC && { backgroundColor: '#52B788' },
                isW && { backgroundColor: '#E63946' },
                !isC && !isW && { backgroundColor: '#F4A261' }]}
              onPress={() => handlePick(ans)} activeOpacity={0.75}>
              <Text style={s.ansTxt}>{ans}</Text>
              {isC && <Text style={s.tick}> ✓</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: '#FFFDE7', alignItems: 'center' },
  back:       { alignSelf: 'flex-start', margin: 16, padding: 8 },
  backTxt:    { fontSize: 20, color: '#888', fontWeight: '600' },
  score:      { fontSize: 18, color: '#777' },
  bigEmoji:   { fontSize: IS_TABLET ? 110 : 88, marginTop: 8 },
  qBox:       { marginTop: 8, paddingHorizontal: 24, width: '100%' },
  qTxt:       { fontSize: IS_TABLET ? 30 : 22, fontWeight: '900', color: '#333', textAlign: 'center' },
  speakBtn:   { marginTop: 8, backgroundColor: '#E8F4FD', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 20 },
  speakTxt:   { fontSize: 17, color: '#0077B6', fontWeight: '700' },
  choicesCol: { marginTop: 16, width: IS_TABLET ? 400 : width * 0.85, gap: 12 },
  ansBtn:     { width: '100%', paddingVertical: IS_TABLET ? 20 : 16, borderRadius: 22, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  ansTxt:     { fontSize: IS_TABLET ? 26 : 21, fontWeight: '800', color: '#fff' },
  tick:       { fontSize: 22, color: '#fff', fontWeight: '900' },
  celebTitle: { fontSize: 52, fontWeight: '900', marginTop: 80, color: '#333' },
  celebSub:   { fontSize: 26, color: '#555', marginTop: 12 },
  bigBtn:     { marginTop: 32, backgroundColor: '#00B4D8', paddingVertical: 16, paddingHorizontal: 44, borderRadius: 24 },
  bigBtnTxt:  { fontSize: 22, color: '#fff', fontWeight: '800' },
});
