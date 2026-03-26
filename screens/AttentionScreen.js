import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Animated, Dimensions } from 'react-native';
import { speak } from '../utils/speak';

const { width } = Dimensions.get('window');
const IS_TABLET = width > 700;

// L1: 4 cells (2×2), very different odd one
// L2: 9 cells (3×3)
// L3: 16 cells (4×4)
// L4: 20 cells (4×5) with visually similar pairs
const CFG = {
  1: { cells: 4,  cols: 2, rounds: 5,  similarSets: false },
  2: { cells: 9,  cols: 3, rounds: 8,  similarSets: false },
  3: { cells: 16, cols: 4, rounds: 10, similarSets: false },
  4: { cells: 20, cols: 4, rounds: 12, similarSets: true  },
};

// Normal sets: very different odd one
const NORMAL_SETS = [
  { normal: '🐶', odd: '🐱' }, { normal: '⭐', odd: '🌙' },
  { normal: '🍎', odd: '🍊' }, { normal: '🔵', odd: '🔴' },
  { normal: '🌸', odd: '🌻' }, { normal: '🚗', odd: '✈️' },
  { normal: '🐟', odd: '🐸' }, { normal: '🍪', odd: '🎂' },
  { normal: '🐱', odd: '🐰' }, { normal: '🟡', odd: '🟢' },
];
// Similar sets: harder to spot (L4)
const SIMILAR_SETS = [
  { normal: '🐕', odd: '🦮' }, { normal: '🌹', odd: '🌷' },
  { normal: '🍋', odd: '🍊' }, { normal: '🏠', odd: '🏡' },
  { normal: '😊', odd: '😄' }, { normal: '⭐', odd: '🌟' },
  { normal: '🐈', odd: '🐱' }, { normal: '🍇', odd: '🫐' },
];

function buildRound(cfg) {
  const sets = cfg.similarSets
    ? [...NORMAL_SETS, ...SIMILAR_SETS]
    : NORMAL_SETS;
  const set    = sets[Math.floor(Math.random() * sets.length)];
  const oddPos = Math.floor(Math.random() * cfg.cells);
  const cells  = Array.from({ length: cfg.cells }, (_, i) => ({
    id: i, emoji: i === oddPos ? set.odd : set.normal, isOdd: i === oddPos,
  }));
  return { cells, oddPos };
}

export default function AttentionScreen({ route, navigation }) {
  const difficulty = route.params?.difficulty ?? 2;
  const cfg        = CFG[difficulty];
  const [round, setRound]     = useState(() => buildRound(cfg));
  const [roundNum, setRoundNum] = useState(0);
  const [score, setScore]     = useState(0);
  const [status, setStatus]   = useState('playing');
  const [picked, setPicked]   = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => { load(); }, [roundNum]);

  function load() {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
    setTimeout(() => speak('Finde das andere! Was ist anders?', { rate: 0.82, pitch: 1.15 }), 300);
  }

  function next() {
    setRound(buildRound(cfg)); setStatus('playing'); setPicked(null);
    setRoundNum(r => r + 1);
  }

  function handleTap(cell) {
    if (status !== 'playing') return;
    setPicked(cell.id);
    if (cell.isOdd) {
      setStatus('correct'); setScore(s => s + 1);
      speak('Sehr gut! Du hast es gefunden!', { rate: 0.82, pitch: 1.2 });
      setTimeout(() => {
        if (roundNum + 1 >= cfg.rounds) setStatus('done');
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
      <Text style={s.celebSub}>{score} von {cfg.rounds} richtig!</Text>
      <TouchableOpacity style={s.bigBtn} onPress={() => navigation.navigate('Home')}><Text style={s.bigBtnTxt}>🏠 Startseite</Text></TouchableOpacity>
      <TouchableOpacity style={[s.bigBtn, { backgroundColor: '#FF6B9D', marginTop: 14 }]}
        onPress={() => { setRoundNum(0); setScore(0); setRound(buildRound(cfg)); setStatus('playing'); setPicked(null); }}>
        <Text style={s.bigBtnTxt}>🔄 Nochmal</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  const totalW   = IS_TABLET ? 560 : width - 32;
  const CELL     = Math.floor((totalW - (cfg.cols - 1) * 8) / cfg.cols);

  return (
    <SafeAreaView style={s.safe}>
      <TouchableOpacity style={s.back} onPress={() => navigation.goBack()}><Text style={s.backTxt}>← Zurück</Text></TouchableOpacity>
      <Text style={s.score}>⭐ {score}  Runde {roundNum + 1}/{cfg.rounds}</Text>
      <Text style={s.title}>Was ist anders? 👁️</Text>
      <Text style={s.hint}>Tippe auf das Bild das nicht passt!</Text>
      <Animated.View style={[s.grid, { opacity: fadeAnim, width: totalW }]}>
        {round.cells.map(cell => {
          const isCorrect = picked === cell.id && status === 'correct';
          const isWrong   = picked === cell.id && status === 'wrong';
          const reveal    = status === 'correct' && cell.isOdd;
          return (
            <TouchableOpacity key={cell.id}
              style={[s.cell, { width: CELL, height: CELL },
                isCorrect && s.cellCorrect, isWrong && s.cellWrong, reveal && s.cellReveal]}
              onPress={() => handleTap(cell)} activeOpacity={0.75}>
              <Text style={{ fontSize: CELL * 0.50 }}>{cell.emoji}</Text>
              {reveal && <Text style={s.check}>✓</Text>}
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
  safe:       { flex: 1, backgroundColor: '#E8F8FF', alignItems: 'center' },
  back:       { alignSelf: 'flex-start', margin: 16, padding: 8 },
  backTxt:    { fontSize: 20, color: '#888', fontWeight: '600' },
  score:      { fontSize: 18, color: '#777' },
  title:      { fontSize: IS_TABLET ? 28 : 22, fontWeight: '900', color: '#333', marginTop: 6 },
  hint:       { fontSize: 15, color: '#888', marginBottom: 10, textAlign: 'center', paddingHorizontal: 24 },
  grid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  cell:       { borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
  cellCorrect:{ backgroundColor: '#B5EAD7', borderWidth: 2, borderColor: '#52B788' },
  cellWrong:  { backgroundColor: '#FFD5D5' },
  cellReveal: { backgroundColor: '#B5EAD7', borderWidth: 2, borderColor: '#52B788' },
  check:      { position: 'absolute', top: 4, right: 8, fontSize: 16, color: '#52B788', fontWeight: '900' },
  speakBtn:   { marginTop: 14, backgroundColor: '#E8F4FD', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 20 },
  speakTxt:   { fontSize: 17, color: '#0077B6', fontWeight: '700' },
  celebTitle: { fontSize: 52, fontWeight: '900', marginTop: 80, color: '#333' },
  celebSub:   { fontSize: 26, color: '#555', marginTop: 12 },
  bigBtn:     { marginTop: 32, backgroundColor: '#00B4D8', paddingVertical: 16, paddingHorizontal: 44, borderRadius: 24 },
  bigBtnTxt:  { fontSize: 22, color: '#fff', fontWeight: '800' },
});
