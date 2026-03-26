import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Animated, Dimensions } from 'react-native';
import { speak } from '../utils/speak';

const { width } = Dimensions.get('window');
const IS_TABLET = width > 700;

const ITEMS = [
  { emoji: '🍎', name: 'Äpfel' }, { emoji: '⭐', name: 'Sterne' },
  { emoji: '🐶', name: 'Hunde' }, { emoji: '🌸', name: 'Blumen' },
  { emoji: '🦋', name: 'Schmetterlinge' }, { emoji: '🍪', name: 'Kekse' },
  { emoji: '🐟', name: 'Fische' }, { emoji: '🎈', name: 'Luftballons' },
];
const GERMAN = ['eins','zwei','drei','vier','fünf','sechs','sieben','acht','neun','zehn'];

// L1: count 1-3, 3 choices, 5 rounds
// L2: count 1-5, 3 choices, 8 rounds
// L3: count 1-8, 3 choices, 10 rounds
// L4: count 1-10, 4 choices, 12 rounds
const CFG = {
  1: { max: 3,  choices: 3, rounds: 5  },
  2: { max: 5,  choices: 3, rounds: 8  },
  3: { max: 8,  choices: 3, rounds: 10 },
  4: { max: 10, choices: 4, rounds: 12 },
};

function buildQ(cfg) {
  const count = Math.floor(Math.random() * cfg.max) + 1;
  const item  = ITEMS[Math.floor(Math.random() * ITEMS.length)];
  const pool  = Array.from({ length: cfg.max }, (_, i) => i + 1).filter(n => n !== count);
  const wrongs = pool.sort(() => Math.random() - 0.5).slice(0, cfg.choices - 1);
  const choices = [count, ...wrongs].sort(() => Math.random() - 0.5);
  return { count, item, choices };
}

export default function CountingScreen({ route, navigation }) {
  const difficulty = route.params?.difficulty ?? 2;
  const cfg        = CFG[difficulty];
  const [q, setQ]           = useState(() => buildQ(cfg));
  const [round, setRound]   = useState(0);
  const [score, setScore]   = useState(0);
  const [status, setStatus] = useState('playing');
  const [picked, setPicked] = useState(null);
  const scaleAnims = useRef(Array.from({ length: 10 }, () => new Animated.Value(0))).current;
  const shakeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => { loadQ(); }, []);

  function loadQ() {
    const newQ = buildQ(cfg);
    setQ(newQ); setStatus('playing'); setPicked(null);
    scaleAnims.forEach(a => a.setValue(0));
    scaleAnims.slice(0, newQ.count).forEach((a, i) => {
      Animated.spring(a, { toValue: 1, delay: i * 100, useNativeDriver: true }).start();
    });
    setTimeout(() => {
      speak(`Wie viele ${newQ.item.name}? Zähl mit mir!`, { rate: 0.82, pitch: 1.25 });
      let i = 1;
      const t = setInterval(() => {
        if (i > newQ.count) { clearInterval(t); return; }
        speak(GERMAN[i - 1], { rate: 0.9, pitch: 1.2 }); i++;
      }, 900);
    }, 400);
  }

  function handlePick(num) {
    if (status !== 'playing') return;
    setPicked(num);
    if (num === q.count) {
      setStatus('correct'); setScore(s => s + 1);
      speak(`Ja! ${GERMAN[num - 1]}! Wunderbar!`, { rate: 0.85, pitch: 1.3 });
      setTimeout(() => {
        if (round + 1 >= cfg.rounds) setStatus('done');
        else { setRound(r => r + 1); loadQ(); }
      }, 1500);
    } else {
      setStatus('wrong');
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 14,  duration: 55, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -14, duration: 55, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0,   duration: 55, useNativeDriver: true }),
      ]).start();
      speak('Nicht ganz — versuch es nochmal!', { rate: 0.85, pitch: 1.1 });
      setTimeout(() => { setStatus('playing'); setPicked(null); }, 1200);
    }
  }

  if (status === 'done') return (
    <SafeAreaView style={s.safe}>
      <Text style={s.celebTitle}>🎉 Geschafft! 🎉</Text>
      <Text style={s.celebSub}>{score} von {cfg.rounds} richtig!</Text>
      <TouchableOpacity style={s.bigBtn} onPress={() => navigation.navigate('Home')}><Text style={s.bigBtnTxt}>🏠 Startseite</Text></TouchableOpacity>
      <TouchableOpacity style={[s.bigBtn, { backgroundColor: '#FF6B9D', marginTop: 14 }]}
        onPress={() => { setRound(0); setScore(0); loadQ(); setStatus('playing'); }}>
        <Text style={s.bigBtnTxt}>🔄 Nochmal</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={s.safe}>
      <TouchableOpacity style={s.back} onPress={() => navigation.goBack()}><Text style={s.backTxt}>← Zurück</Text></TouchableOpacity>
      <Text style={s.score}>⭐ {score}  Runde {round + 1}/{cfg.rounds}</Text>
      <TouchableOpacity onPress={() => speak(`Wie viele ${q.item.name}?`, { rate: 0.82, pitch: 1.25 })}>
        <Text style={s.qTxt}>Wie viele {q.item.name}?</Text>
        <Text style={s.tapHint}>🔊 nochmal hören</Text>
      </TouchableOpacity>
      <Animated.View style={[s.itemsBox, { transform: [{ translateX: shakeAnim }] }]}>
        <View style={s.itemsRow}>
          {Array.from({ length: q.count }).map((_, i) => (
            <Animated.Text key={i} style={[s.itemEmoji, { transform: [{ scale: scaleAnims[i] }] }]}>
              {q.item.emoji}
            </Animated.Text>
          ))}
        </View>
      </Animated.View>
      <View style={s.choicesRow}>
        {q.choices.map(num => (
          <TouchableOpacity key={num} activeOpacity={0.75}
            style={[s.numBtn,
              picked === num && status === 'correct' && { backgroundColor: '#52B788' },
              picked === num && status === 'wrong'   && { backgroundColor: '#E63946' }]}
            onPress={() => handlePick(num)}>
            <Text style={s.numTxt}>{num}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const BTN = IS_TABLET ? 110 : 82;
const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#E8F8FF', alignItems: 'center' },
  back:      { alignSelf: 'flex-start', margin: 16, padding: 8 },
  backTxt:   { fontSize: 20, color: '#888', fontWeight: '600' },
  score:     { fontSize: 18, color: '#777' },
  qTxt:      { fontSize: IS_TABLET ? 30 : 24, fontWeight: '800', color: '#333', textAlign: 'center', marginTop: 4 },
  tapHint:   { fontSize: 14, color: '#aaa', textAlign: 'center', marginBottom: 8 },
  itemsBox:  { minHeight: IS_TABLET ? 180 : 130, backgroundColor: '#fff', borderRadius: 28, paddingVertical: 16, paddingHorizontal: 20, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, marginHorizontal: 20, width: IS_TABLET ? 600 : width - 40, justifyContent: 'center' },
  itemsRow:  { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 },
  itemEmoji: { fontSize: IS_TABLET ? 60 : 46 },
  choicesRow:{ flexDirection: 'row', gap: 12, marginTop: 24, flexWrap: 'wrap', justifyContent: 'center' },
  numBtn:    { width: BTN, height: BTN, borderRadius: BTN / 2, backgroundColor: '#00B4D8', alignItems: 'center', justifyContent: 'center', elevation: 5, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  numTxt:    { fontSize: IS_TABLET ? 46 : 36, fontWeight: '900', color: '#fff' },
  celebTitle:{ fontSize: 52, fontWeight: '900', marginTop: 60, color: '#333' },
  celebSub:  { fontSize: 26, color: '#555', marginTop: 12 },
  bigBtn:    { marginTop: 32, backgroundColor: '#00B4D8', paddingVertical: 16, paddingHorizontal: 44, borderRadius: 24 },
  bigBtnTxt: { fontSize: 22, color: '#fff', fontWeight: '800' },
});
