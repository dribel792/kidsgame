import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Animated, Dimensions } from 'react-native';
import { speak } from '../utils/speak';

const { width } = Dimensions.get('window');
const IS_TABLET = width > 700;
const TOTAL = 10;

// item → category
const ITEMS = [
  { emoji: '🍎', label: 'Apfel',       cat: 'Obst'      },
  { emoji: '🍌', label: 'Banane',      cat: 'Obst'      },
  { emoji: '🍊', label: 'Orange',      cat: 'Obst'      },
  { emoji: '🍇', label: 'Trauben',     cat: 'Obst'      },
  { emoji: '🐶', label: 'Hund',        cat: 'Tier'      },
  { emoji: '🐱', label: 'Katze',       cat: 'Tier'      },
  { emoji: '🐟', label: 'Fisch',       cat: 'Tier'      },
  { emoji: '🐰', label: 'Hase',        cat: 'Tier'      },
  { emoji: '🚗', label: 'Auto',        cat: 'Fahrzeug'  },
  { emoji: '✈️', label: 'Flugzeug',    cat: 'Fahrzeug'  },
  { emoji: '🚢', label: 'Schiff',      cat: 'Fahrzeug'  },
  { emoji: '🚲', label: 'Fahrrad',     cat: 'Fahrzeug'  },
];

const CATEGORIES = ['Obst', 'Tier', 'Fahrzeug'];
const CAT_EMOJI  = { Obst: '🍓', Tier: '🦁', Fahrzeug: '🚀' };
const CAT_COLOR  = { Obst: '#52B788', Tier: '#FF6B9D', Fahrzeug: '#00B4D8' };

function buildRound() {
  return ITEMS[Math.floor(Math.random() * ITEMS.length)];
}

export default function SortingScreen({ navigation }) {
  const [item, setItem]     = useState(buildRound);
  const [round, setRound]   = useState(0);
  const [score, setScore]   = useState(0);
  const [status, setStatus] = useState('playing');
  const [picked, setPicked] = useState(null);
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => { ask(item); }, []);

  function ask(it) {
    bounceAnim.setValue(0);
    Animated.spring(bounceAnim, { toValue: 1, useNativeDriver: true }).start();
    setTimeout(() => speak(`Wohin gehört ${it.label}?`, { rate: 0.82, pitch: 1.15 }), 300);
  }

  function next() {
    const it = buildRound();
    setItem(it);
    setStatus('playing');
    setPicked(null);
    ask(it);
  }

  function handlePick(cat) {
    if (status !== 'playing') return;
    setPicked(cat);
    if (cat === item.cat) {
      setStatus('correct');
      setScore(s => s + 1);
      speak(`Richtig! ${item.label} ist ein ${cat}.`, { rate: 0.82, pitch: 1.2 });
      setTimeout(() => {
        if (round + 1 >= TOTAL) setStatus('done');
        else { setRound(r => r + 1); next(); }
      }, 1800);
    } else {
      setStatus('wrong');
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 14,  duration: 55, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -14, duration: 55, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0,   duration: 55, useNativeDriver: true }),
      ]).start();
      speak('Das stimmt nicht. Versuch nochmal!', { rate: 0.82, pitch: 1.1 });
      setTimeout(() => { setStatus('playing'); setPicked(null); }, 1200);
    }
  }

  if (status === 'done') return (
    <SafeAreaView style={s.safe}>
      <Text style={s.celebTitle}>🎉 Super sortiert! 🎉</Text>
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
      <Text style={s.title}>Wohin gehört das? 📦</Text>

      {/* Big item card */}
      <Animated.View style={[s.itemCard, {
        transform: [{ scale: bounceAnim }, { translateX: shakeAnim }],
        backgroundColor: status === 'correct' ? '#B5EAD7' : status === 'wrong' ? '#FFD5D5' : '#fff',
      }]}>
        <Text style={s.itemEmoji}>{item.emoji}</Text>
        <Text style={s.itemLabel}>{item.label}</Text>
      </Animated.View>

      <TouchableOpacity onPress={() => speak(`Wohin gehört ${item.label}?`, { rate: 0.82, pitch: 1.15 })} style={s.speakBtn}>
        <Text style={s.speakTxt}>🔊 Nochmal hören</Text>
      </TouchableOpacity>

      {/* Category bins */}
      <View style={s.cats}>
        {CATEGORIES.map(cat => {
          const isCorrectPicked = picked === cat && status === 'correct';
          const isWrong         = picked === cat && status === 'wrong';
          return (
            <TouchableOpacity key={cat}
              style={[s.catBtn,
                { backgroundColor: CAT_COLOR[cat] },
                isCorrectPicked && s.catCorrect,
                isWrong         && s.catWrong]}
              onPress={() => handlePick(cat)} activeOpacity={0.75}>
              <Text style={s.catEmoji}>{CAT_EMOJI[cat]}</Text>
              <Text style={s.catLabel}>{cat}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: '#F0F8FF', alignItems: 'center' },
  back:       { alignSelf: 'flex-start', margin: 16, padding: 8 },
  backTxt:    { fontSize: 20, color: '#888', fontWeight: '600' },
  score:      { fontSize: 18, color: '#777' },
  title:      { fontSize: IS_TABLET ? 30 : 24, fontWeight: '900', color: '#333', marginVertical: 8 },
  itemCard:   { width: IS_TABLET ? 260 : 200, height: IS_TABLET ? 260 : 200, borderRadius: 32, alignItems: 'center', justifyContent: 'center', elevation: 6, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  itemEmoji:  { fontSize: IS_TABLET ? 100 : 80 },
  itemLabel:  { fontSize: IS_TABLET ? 28 : 22, fontWeight: '800', color: '#333', marginTop: 8 },
  speakBtn:   { marginTop: 14, backgroundColor: '#E8F4FD', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 20 },
  speakTxt:   { fontSize: 17, color: '#0077B6', fontWeight: '700' },
  cats:       { flexDirection: 'row', gap: 14, marginTop: 28, paddingHorizontal: 16 },
  catBtn:     { flex: 1, paddingVertical: IS_TABLET ? 26 : 20, borderRadius: 24, alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  catEmoji:   { fontSize: IS_TABLET ? 44 : 36 },
  catLabel:   { fontSize: IS_TABLET ? 20 : 16, fontWeight: '800', color: '#fff', marginTop: 6 },
  catCorrect: { borderWidth: 4, borderColor: '#fff', transform: [{ scale: 1.05 }] },
  catWrong:   { opacity: 0.5 },
  celebTitle: { fontSize: 52, fontWeight: '900', marginTop: 80, color: '#333' },
  celebSub:   { fontSize: 26, color: '#555', marginTop: 12 },
  bigBtn:     { marginTop: 32, backgroundColor: '#00B4D8', paddingVertical: 16, paddingHorizontal: 44, borderRadius: 24 },
  bigBtnTxt:  { fontSize: 22, color: '#fff', fontWeight: '800' },
});
