import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Animated, Dimensions, ScrollView } from 'react-native';
import { speak } from '../utils/speak';

const { width } = Dimensions.get('window');
const IS_TABLET = width > 700;
const TOTAL = 8;
const GRID  = 9; // 3×3 grid

// Sets of similar items — one will be the odd one
const SETS = [
  { normal: '🐶', odd: '🐱' },
  { normal: '⭐', odd: '🌙' },
  { normal: '🍎', odd: '🍊' },
  { normal: '🔵', odd: '🔴' },
  { normal: '🌸', odd: '🌻' },
  { normal: '🚗', odd: '✈️' },
  { normal: '🐟', odd: '🐸' },
  { normal: '🍪', odd: '🎂' },
  { normal: '🐱', odd: '🐰' },
  { normal: '🟡', odd: '🟢' },
  { normal: '🐝', odd: '🦋' },
  { normal: '🧩', odd: '🎲' },
];

function buildRound() {
  const set = SETS[Math.floor(Math.random() * SETS.length)];
  const oddPos = Math.floor(Math.random() * GRID);
  const cells = Array.from({ length: GRID }, (_, i) => ({
    id: i,
    emoji: i === oddPos ? set.odd : set.normal,
    isOdd: i === oddPos,
  }));
  return { cells, oddPos, set };
}

export default function AttentionScreen({ navigation }) {
  const [round, setRound]   = useState(buildRound);
  const [roundNum, setRoundNum] = useState(0);
  const [score, setScore]   = useState(0);
  const [status, setStatus] = useState('playing');
  const [picked, setPicked] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => { load(); }, [roundNum]);

  function load() {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    setTimeout(() => speak('Finde das andere! Was ist anders?', { rate: 0.82, pitch: 1.15 }), 300);
  }

  function next() {
    setRound(buildRound());
    setStatus('playing');
    setPicked(null);
    setRoundNum(r => r + 1);
  }

  function handleTap(cell) {
    if (status !== 'playing') return;
    setPicked(cell.id);
    if (cell.isOdd) {
      setStatus('correct');
      setScore(s => s + 1);
      speak('Sehr gut! Du hast es gefunden!', { rate: 0.82, pitch: 1.2 });
      setTimeout(() => {
        if (roundNum + 1 >= TOTAL) setStatus('done');
        else next();
      }, 1600);
    } else {
      setStatus('wrong');
      speak('Schau nochmal! Etwas ist anders!', { rate: 0.82, pitch: 1.1 });
      setTimeout(() => { setStatus('playing'); setPicked(null); }, 1300);
    }
  }

  if (status === 'done') return (
    <SafeAreaView style={s.safe}>
      <Text style={s.celebTitle}>🎉 Super Augen! 🎉</Text>
      <Text style={s.celebSub}>{score} von {TOTAL} richtig!</Text>
      <TouchableOpacity style={s.bigBtn} onPress={() => navigation.goBack()}><Text style={s.bigBtnTxt}>🏠 Startseite</Text></TouchableOpacity>
      <TouchableOpacity style={[s.bigBtn, { backgroundColor: '#FF6B9D', marginTop: 14 }]}
        onPress={() => { setRoundNum(0); setScore(0); setRound(buildRound()); setStatus('playing'); setPicked(null); }}>
        <Text style={s.bigBtnTxt}>🔄 Nochmal</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  const CELL = IS_TABLET ? 140 : (width - 80) / 3;

  return (
    <SafeAreaView style={s.safe}>
      <TouchableOpacity style={s.back} onPress={() => navigation.goBack()}><Text style={s.backTxt}>← Zurück</Text></TouchableOpacity>
      <Text style={s.score}>⭐ {score}  Runde {roundNum + 1}/{TOTAL}</Text>
      <Text style={s.title}>Was ist anders? 👁️</Text>
      <Text style={s.hint}>Tippe auf das Bild das nicht passt!</Text>

      <Animated.View style={[s.grid, { opacity: fadeAnim }]}>
        {round.cells.map(cell => {
          const isPickedCorrect = picked === cell.id && status === 'correct';
          const isPickedWrong   = picked === cell.id && status === 'wrong';
          const showReveal      = status === 'correct' && cell.isOdd;
          return (
            <TouchableOpacity
              key={cell.id}
              style={[
                s.cell, { width: CELL, height: CELL },
                isPickedCorrect && s.cellCorrect,
                isPickedWrong   && s.cellWrong,
                showReveal      && s.cellReveal,
              ]}
              onPress={() => handleTap(cell)}
              activeOpacity={0.75}
            >
              <Text style={[s.cellTxt, { fontSize: CELL * 0.52 }]}>{cell.emoji}</Text>
              {showReveal && <Text style={s.checkmark}>✓</Text>}
            </TouchableOpacity>
          );
        })}
      </Animated.View>

      <TouchableOpacity onPress={() => speak('Finde das andere! Was ist anders?', { rate: 0.82, pitch: 1.15 })} style={s.speakBtn}>
        <Text style={s.speakTxt}>🔊 Nochmal hören</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: '#E8F8FF', alignItems: 'center' },
  back:        { alignSelf: 'flex-start', margin: 16, padding: 8 },
  backTxt:     { fontSize: 20, color: '#888', fontWeight: '600' },
  score:       { fontSize: 18, color: '#777' },
  title:       { fontSize: IS_TABLET ? 30 : 24, fontWeight: '900', color: '#333', marginTop: 8 },
  hint:        { fontSize: 16, color: '#888', marginBottom: 12, textAlign: 'center', paddingHorizontal: 24 },
  grid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', paddingHorizontal: 20 },
  cell:        { borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  cellCorrect: { backgroundColor: '#B5EAD7', borderWidth: 3, borderColor: '#52B788' },
  cellWrong:   { backgroundColor: '#FFD5D5' },
  cellReveal:  { backgroundColor: '#B5EAD7', borderWidth: 3, borderColor: '#52B788' },
  cellTxt:     {},
  checkmark:   { position: 'absolute', top: 6, right: 10, fontSize: 20, color: '#52B788', fontWeight: '900' },
  speakBtn:    { marginTop: 18, backgroundColor: '#E8F4FD', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 20 },
  speakTxt:    { fontSize: 17, color: '#0077B6', fontWeight: '700' },
  celebTitle:  { fontSize: 52, fontWeight: '900', marginTop: 80, color: '#333' },
  celebSub:    { fontSize: 26, color: '#555', marginTop: 12 },
  bigBtn:      { marginTop: 32, backgroundColor: '#00B4D8', paddingVertical: 16, paddingHorizontal: 44, borderRadius: 24 },
  bigBtnTxt:   { fontSize: 22, color: '#fff', fontWeight: '800' },
});
