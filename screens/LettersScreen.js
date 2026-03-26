import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, Animated, Dimensions,
} from 'react-native';
import { speak } from '../utils/speak';

const { width } = Dimensions.get('window');
const IS_TABLET = width > 700;

// correct.word must start with letter. Distractors must NOT start with same letter.
const QUESTIONS = [
  { letter: 'A', correct: 'Apfel',    wrongs: ['Katze',    'Mond'    ] },
  { letter: 'B', correct: 'Bär',      wrongs: ['Hund',     'Apfel'   ] },
  { letter: 'D', correct: 'Dino',     wrongs: ['Bär',      'Stern'   ] },
  { letter: 'E', correct: 'Elefant',  wrongs: ['Fisch',    'Banane'  ] },
  { letter: 'F', correct: 'Fisch',    wrongs: ['Hund',     'Mond'    ] },
  { letter: 'G', correct: 'Giraffe',  wrongs: ['Katze',    'Apfel'   ] },
  { letter: 'H', correct: 'Hund',     wrongs: ['Löwe',     'Elefant' ] },
  { letter: 'I', correct: 'Igel',     wrongs: ['Banane',   'Hund'    ] },
  { letter: 'K', correct: 'Katze',    wrongs: ['Fisch',    'Apfel'   ] },
  { letter: 'L', correct: 'Löwe',     wrongs: ['Bär',      'Giraffe' ] },
];

// Colour palette for the word buttons — rotates so each looks different
const CARD_COLORS = ['#FF6B9D', '#845EC2', '#00B4D8', '#F4A261', '#52B788', '#E63946'];

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function LettersScreen({ navigation }) {
  const [qIndex, setQIndex]   = useState(0);
  const [choices, setChoices] = useState([]);
  const [status, setStatus]   = useState('playing');
  const [score, setScore]     = useState(0);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const q = QUESTIONS[qIndex % QUESTIONS.length];

  useEffect(() => {
    const mixed = shuffle([q.correct, ...q.wrongs]);
    setChoices(mixed);
    setStatus('playing');
    // Just say the letter name — don't give away the answer word
    setTimeout(() => {
      speak(`Welches Wort beginnt mit dem Buchstaben ${q.letter}?`, { rate: 0.82, pitch: 1.15 });
    }, 300);
  }, [qIndex]);

  function handlePick(word) {
    if (status !== 'playing') return;
    if (word === q.correct) {
      setStatus('correct');
      setScore(s => s + 1);
      speak(`Super! ${q.correct} beginnt mit ${q.letter}!`, { rate: 0.82, pitch: 1.2 });
      setTimeout(() => {
        if (qIndex + 1 >= QUESTIONS.length) setStatus('done');
        else setQIndex(i => i + 1);
      }, 1800);
    } else {
      setStatus('wrong');
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 12,  duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -12, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8,   duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8,  duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
      ]).start();
      speak('Versuch es nochmal! Du schaffst das!', { rate: 0.82, pitch: 1.1 });
      setTimeout(() => setStatus('playing'), 1200);
    }
  }

  if (status === 'done') {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.celebTitle}>🎉 Toll gemacht! 🎉</Text>
        <Text style={styles.celebScore}>{score} von {QUESTIONS.length} richtig!</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>🏠 Startseite</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: '#FF6B9D', marginTop: 12 }]}
          onPress={() => { setQIndex(0); setScore(0); setStatus('playing'); }}
        >
          <Text style={styles.backBtnText}>🔄 Nochmal spielen</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <TouchableOpacity style={styles.topBack} onPress={() => navigation.goBack()}>
        <Text style={styles.topBackText}>← Zurück</Text>
      </TouchableOpacity>

      <Text style={styles.scoreText}>⭐ {score}</Text>

      {/* Big letter + question */}
      <Animated.View style={[styles.letterBox, {
        transform: [{ translateX: shakeAnim }],
        backgroundColor: status === 'correct' ? '#B5EAD7' : status === 'wrong' ? '#FFD5D5' : '#FFF9C4',
      }]}>
        <Text style={styles.bigLetter}>{q.letter}</Text>
        <Text style={styles.letterHint}>Welches Wort beginnt mit {q.letter}?</Text>
      </Animated.View>

      {/* Repeat button */}
      <TouchableOpacity
        onPress={() => speak(`Welches Wort beginnt mit dem Buchstaben ${q.letter}?`, { rate: 0.82, pitch: 1.15 })}
        style={styles.speakBtn}
      >
        <Text style={styles.speakBtnText}>🔊 Nochmal hören</Text>
      </TouchableOpacity>

      {/* Word choices — text only, no images */}
      <View style={styles.choicesCol}>
        {choices.map((word, i) => {
          const isCorrect = word === q.correct && status === 'correct';
          const bg = isCorrect ? '#52B788' : CARD_COLORS[i % CARD_COLORS.length];
          return (
            <TouchableOpacity
              key={word}
              style={[styles.wordBtn, { backgroundColor: bg }]}
              onPress={() => {
                speak(word, { rate: 0.82, pitch: 1.1 });
                handlePick(word);
              }}
              activeOpacity={0.75}
            >
              <Text style={styles.wordBtnText}>{word}</Text>
              {isCorrect && <Text style={styles.tick}>✓</Text>}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Progress dots */}
      <View style={styles.progressRow}>
        {QUESTIONS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < qIndex  && styles.dotDone,
              i === qIndex && styles.dotCurrent,
            ]}
          />
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: '#FFF9F0', alignItems: 'center' },
  topBack:      { alignSelf: 'flex-start', margin: 16, padding: 8 },
  topBackText:  { fontSize: 20, color: '#888', fontWeight: '600' },
  scoreText:    { fontSize: 26, fontWeight: '800', color: '#F4A261', alignSelf: 'flex-end', marginRight: 24 },
  letterBox: {
    marginTop: 8, width: IS_TABLET ? 320 : width * 0.75,
    paddingVertical: 20, borderRadius: 32, alignItems: 'center',
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
  },
  bigLetter:    { fontSize: IS_TABLET ? 120 : 90, fontWeight: '900', color: '#333' },
  letterHint:   { fontSize: 17, color: '#555', marginTop: 4, textAlign: 'center', paddingHorizontal: 12 },
  speakBtn:     { marginTop: 10, backgroundColor: '#E8F4FD', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 20 },
  speakBtnText: { fontSize: 18, color: '#0077B6', fontWeight: '700' },
  choicesCol:   { marginTop: 22, width: IS_TABLET ? 380 : width * 0.82, gap: 14 },
  wordBtn: {
    width: '100%', paddingVertical: IS_TABLET ? 22 : 18,
    borderRadius: 22, alignItems: 'center', flexDirection: 'row',
    justifyContent: 'center',
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 3 },
  },
  wordBtnText:  { fontSize: IS_TABLET ? 30 : 26, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  tick:         { fontSize: 24, color: '#fff', marginLeft: 10 },
  celebTitle:   { fontSize: 52, fontWeight: '900', marginTop: 60, color: '#333' },
  celebScore:   { fontSize: 28, color: '#555', marginTop: 12 },
  backBtn:      { marginTop: 32, backgroundColor: '#845EC2', paddingVertical: 16, paddingHorizontal: 40, borderRadius: 24 },
  backBtnText:  { fontSize: 22, color: '#fff', fontWeight: '800' },
  progressRow:  { flexDirection: 'row', gap: 8, marginTop: 20 },
  dot:          { width: 12, height: 12, borderRadius: 6, backgroundColor: '#ddd' },
  dotDone:      { backgroundColor: '#52B788' },
  dotCurrent:   { backgroundColor: '#FF6B9D', transform: [{ scale: 1.3 }] },
});
