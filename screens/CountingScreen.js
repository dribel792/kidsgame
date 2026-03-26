import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, Animated, Dimensions,
} from 'react-native';
import * as Speech from 'expo-speech';

const { width } = Dimensions.get('window');
const IS_TABLET = width > 700;

const ITEMS = [
  { emoji: '🍎', name: 'Äpfel'          },
  { emoji: '⭐', name: 'Sterne'         },
  { emoji: '🐶', name: 'Hunde'          },
  { emoji: '🌸', name: 'Blumen'         },
  { emoji: '🦋', name: 'Schmetterlinge' },
  { emoji: '🍪', name: 'Kekse'          },
  { emoji: '🐟', name: 'Fische'         },
  { emoji: '🎈', name: 'Luftballons'    },
];

// German numbers 1–5
const GERMAN_NUMBERS = ['eins', 'zwei', 'drei', 'vier', 'fünf'];

function buildQuestion() {
  const count  = Math.floor(Math.random() * 5) + 1;
  const item   = ITEMS[Math.floor(Math.random() * ITEMS.length)];
  const pool   = [1,2,3,4,5].filter(n => n !== count);
  const wrongs = pool.sort(() => Math.random() - 0.5).slice(0, 2);
  const choices = [count, ...wrongs].sort(() => Math.random() - 0.5);
  return { count, item, choices };
}

const TOTAL_ROUNDS = 8;

export default function CountingScreen({ navigation }) {
  const [q, setQ]           = useState(buildQuestion);
  const [round, setRound]   = useState(0);
  const [score, setScore]   = useState(0);
  const [status, setStatus] = useState('playing');
  const [picked, setPicked] = useState(null);
  const scaleAnims          = useRef(
    Array.from({ length: 5 }, () => new Animated.Value(0))
  ).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => { loadQuestion(); }, []);

  function loadQuestion() {
    const newQ = buildQuestion();
    setQ(newQ);
    setStatus('playing');
    setPicked(null);

    scaleAnims.forEach(a => a.setValue(0));
    newQ.count && scaleAnims.slice(0, newQ.count).forEach((a, i) => {
      Animated.spring(a, { toValue: 1, delay: i * 120, useNativeDriver: true }).start();
    });

    setTimeout(() => {
      Speech.speak(
        `Wie viele ${newQ.item.name}? Zähl mit mir!`,
        { rate: 0.82, pitch: 1.25, language: 'de-DE' }
      );
      let i = 1;
      const interval = setInterval(() => {
        if (i > newQ.count) { clearInterval(interval); return; }
        Speech.speak(GERMAN_NUMBERS[i - 1], { rate: 0.9, pitch: 1.2, language: 'de-DE' });
        i++;
      }, 900);
    }, 400);
  }

  function handlePick(num) {
    if (status !== 'playing') return;
    setPicked(num);
    if (num === q.count) {
      setStatus('correct');
      setScore(s => s + 1);
      Speech.speak(
        `Ja! ${GERMAN_NUMBERS[num - 1]}! Wunderbar!`,
        { rate: 0.85, pitch: 1.3, language: 'de-DE' }
      );
      setTimeout(() => {
        if (round + 1 >= TOTAL_ROUNDS) setStatus('done');
        else { setRound(r => r + 1); loadQuestion(); }
      }, 1500);
    } else {
      setStatus('wrong');
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 14,  duration: 55, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -14, duration: 55, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10,  duration: 55, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 55, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0,   duration: 55, useNativeDriver: true }),
      ]).start();
      Speech.speak('Nicht ganz — versuch es nochmal!', { rate: 0.85, pitch: 1.1, language: 'de-DE' });
      setTimeout(() => { setStatus('playing'); setPicked(null); }, 1200);
    }
  }

  if (status === 'done') {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.celebTitle}>🎉 Geschafft! 🎉</Text>
        <Text style={styles.celebSub}>{score} von {TOTAL_ROUNDS} richtig!</Text>
        <TouchableOpacity style={styles.bigBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.bigBtnText}>🏠 Startseite</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.bigBtn, { backgroundColor: '#FF6B9D', marginTop: 14 }]}
          onPress={() => { setRound(0); setScore(0); loadQuestion(); setStatus('playing'); }}
        >
          <Text style={styles.bigBtnText}>🔄 Nochmal spielen</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <TouchableOpacity style={styles.topBack} onPress={() => navigation.goBack()}>
        <Text style={styles.topBackText}>← Zurück</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>🔢 Zählen</Text>
        <Text style={styles.scoreText}>⭐ {score}  |  Runde {round + 1}/{TOTAL_ROUNDS}</Text>
      </View>

      <TouchableOpacity onPress={() =>
        Speech.speak(`Wie viele ${q.item.name}?`, { rate: 0.82, pitch: 1.25, language: 'de-DE' })
      }>
        <Text style={styles.questionText}>Wie viele {q.item.name}?</Text>
        <Text style={styles.tapHint}>🔊 nochmal hören</Text>
      </TouchableOpacity>

      <Animated.View style={[styles.itemsBox, { transform: [{ translateX: shakeAnim }] }]}>
        <View style={styles.itemsRow}>
          {Array.from({ length: q.count }).map((_, i) => (
            <Animated.Text
              key={i}
              style={[styles.itemEmoji, { transform: [{ scale: scaleAnims[i] }] }]}
            >
              {q.item.emoji}
            </Animated.Text>
          ))}
        </View>
      </Animated.View>

      <View style={styles.choicesRow}>
        {q.choices.map((num) => {
          const isCorrectPicked = picked === num && status === 'correct';
          const isWrongPicked   = picked === num && status === 'wrong';
          return (
            <TouchableOpacity
              key={num}
              style={[
                styles.numBtn,
                isCorrectPicked && styles.numBtnCorrect,
                isWrongPicked   && styles.numBtnWrong,
              ]}
              onPress={() => handlePick(num)}
              activeOpacity={0.75}
            >
              <Text style={styles.numBtnText}>{num}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: '#E8F8FF', alignItems: 'center' },
  topBack:        { alignSelf: 'flex-start', margin: 16, padding: 8 },
  topBackText:    { fontSize: 20, color: '#888', fontWeight: '600' },
  header:         { alignItems: 'center', marginBottom: 8 },
  title:          { fontSize: 34, fontWeight: '900', color: '#333' },
  scoreText:      { fontSize: 18, color: '#777', marginTop: 2 },
  questionText:   { fontSize: IS_TABLET ? 32 : 26, fontWeight: '800', color: '#333', textAlign: 'center', marginTop: 8 },
  tapHint:        { fontSize: 14, color: '#aaa', textAlign: 'center', marginBottom: 8 },
  itemsBox: {
    minHeight: IS_TABLET ? 180 : 140,
    backgroundColor: '#fff',
    borderRadius: 28, paddingVertical: 20, paddingHorizontal: 24,
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
    marginHorizontal: 20, width: IS_TABLET ? 600 : width - 40,
    justifyContent: 'center',
  },
  itemsRow:       { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  itemEmoji:      { fontSize: IS_TABLET ? 70 : 56 },
  choicesRow:     { flexDirection: 'row', gap: IS_TABLET ? 24 : 16, marginTop: 32 },
  numBtn: {
    width: IS_TABLET ? 120 : 90, height: IS_TABLET ? 120 : 90,
    borderRadius: IS_TABLET ? 60 : 45,
    backgroundColor: '#00B4D8', alignItems: 'center', justifyContent: 'center',
    elevation: 5, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
  },
  numBtnCorrect:  { backgroundColor: '#52B788' },
  numBtnWrong:    { backgroundColor: '#E63946' },
  numBtnText:     { fontSize: IS_TABLET ? 52 : 42, fontWeight: '900', color: '#fff' },
  celebTitle:     { fontSize: 52, fontWeight: '900', marginTop: 60, color: '#333' },
  celebSub:       { fontSize: 26, color: '#555', marginTop: 12 },
  bigBtn:         { marginTop: 32, backgroundColor: '#00B4D8', paddingVertical: 16, paddingHorizontal: 40, borderRadius: 24 },
  bigBtnText:     { fontSize: 22, color: '#fff', fontWeight: '800' },
});
