import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Animated, Dimensions } from 'react-native';
import { speak } from '../utils/speak';

const { width } = Dimensions.get('window');
const IS_TABLET = width > 700;

const ALL_PAIRS = [
  { id: 'hund',     emoji: '🐶', label: 'Hund'     },
  { id: 'katze',    emoji: '🐱', label: 'Katze'    },
  { id: 'fisch',    emoji: '🐟', label: 'Fisch'    },
  { id: 'hase',     emoji: '🐰', label: 'Hase'     },
  { id: 'elefant',  emoji: '🐘', label: 'Elefant'  },
  { id: 'giraffe',  emoji: '🦒', label: 'Giraffe'  },
  { id: 'loewe',    emoji: '🦁', label: 'Löwe'     },
  { id: 'bär',      emoji: '🐻', label: 'Bär'      },
  { id: 'pinguin',  emoji: '🐧', label: 'Pinguin'  },
  { id: 'affe',     emoji: '🐒', label: 'Affe'     },
];

// Difficulty: how many pairs to use
const CFG = { 1: 4, 2: 6, 3: 8, 4: 10 };

function buildDeck(numPairs) {
  const pairs = ALL_PAIRS.slice(0, numPairs);
  return [...pairs, ...pairs]
    .map((p, i) => ({ ...p, uid: i }))
    .sort(() => Math.random() - 0.5);
}

function cardSize(numPairs) {
  if (IS_TABLET) return 120;
  // Fit cards based on pair count
  if (numPairs <= 4)  return Math.min((width - 60) / 4, 100);
  if (numPairs <= 6)  return Math.min((width - 70) / 4, 88);
  if (numPairs <= 8)  return Math.min((width - 80) / 4, 80);
  return Math.min((width - 80) / 4, 74);
}

function Card({ item, isFlipped, isMatched, onPress, size }) {
  const flipAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.timing(flipAnim, { toValue: isFlipped || isMatched ? 1 : 0, duration: 280, useNativeDriver: true }).start();
  }, [isFlipped, isMatched]);
  useEffect(() => {
    if (isMatched) {
      Animated.sequence([
        Animated.spring(scaleAnim, { toValue: 1.18, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
      ]).start();
    }
  }, [isMatched]);
  const frontRotate  = flipAnim.interpolate({ inputRange: [0,1], outputRange: ['180deg','360deg'] });
  const backRotate   = flipAnim.interpolate({ inputRange: [0,1], outputRange: ['0deg','180deg']   });
  const frontOpacity = flipAnim.interpolate({ inputRange: [0.5,1], outputRange: [0,1] });
  const backOpacity  = flipAnim.interpolate({ inputRange: [0,0.5], outputRange: [1,0] });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Animated.View style={[{ width: size, height: size + 16 }, { transform: [{ scale: scaleAnim }] }]}>
        <Animated.View style={[st.face, st.back, { opacity: backOpacity, transform: [{ rotateY: backRotate }] }]}>
          <Text style={{ fontSize: size * 0.42, color: '#fff', fontWeight: '900' }}>?</Text>
        </Animated.View>
        <Animated.View style={[st.face, st.front, isMatched && st.matched,
          { opacity: frontOpacity, transform: [{ rotateY: frontRotate }] }]}>
          <Text style={{ fontSize: size * 0.38 }}>{item.emoji}</Text>
          <Text style={st.cardLabel}>{item.label}</Text>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function MemoryScreen({ route, navigation }) {
  const difficulty  = route.params?.difficulty ?? 2;
  const numPairs    = CFG[difficulty];
  const CARD        = cardSize(numPairs);

  const [deck, setDeck]       = useState(() => buildDeck(numPairs));
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [locked, setLocked]   = useState(false);
  const [moves, setMoves]     = useState(0);
  const [done, setDone]       = useState(false);

  useEffect(() => {
    setTimeout(() => speak('Finde die Paare! Tippe auf eine Karte!', { rate: 0.85, pitch: 1.2 }), 400);
  }, []);

  useEffect(() => {
    if (matched.length === numPairs) {
      setDone(true);
      speak('Du hast alle Paare gefunden! Fantastisch!', { rate: 0.85, pitch: 1.3 });
    }
  }, [matched]);

  const handleFlip = useCallback((uid) => {
    if (locked) return;
    const card = deck.find(c => c.uid === uid);
    if (!card || matched.includes(card.id) || flipped.includes(uid)) return;

    if (flipped.length === 0) {
      setFlipped([uid]);
      speak(card.label, { rate: 0.85, pitch: 1.2 });
    } else if (flipped.length === 1) {
      const first = deck.find(c => c.uid === flipped[0]);
      setFlipped([flipped[0], uid]);
      setMoves(m => m + 1);
      setLocked(true);
      speak(card.label, { rate: 0.85, pitch: 1.2 });
      if (first.id === card.id) {
        setTimeout(() => {
          setMatched(m => [...m, card.id]);
          setFlipped([]);
          setLocked(false);
          speak('Paar gefunden! Super!', { rate: 0.85, pitch: 1.3 });
        }, 700);
      } else {
        setTimeout(() => { setFlipped([]); setLocked(false); }, 1100);
      }
    }
  }, [locked, flipped, matched, deck]);

  function restart() {
    setDeck(buildDeck(numPairs));
    setFlipped([]); setMatched([]); setLocked(false); setMoves(0); setDone(false);
  }

  if (done) return (
    <SafeAreaView style={st.safe}>
      <Text style={st.celebTitle}>🎉 Geschafft! 🎉</Text>
      <Text style={st.celebSub}>{numPairs} Paare in {moves} Zügen!</Text>
      <TouchableOpacity style={st.bigBtn} onPress={() => navigation.navigate('Home')}><Text style={st.bigBtnTxt}>🏠 Startseite</Text></TouchableOpacity>
      <TouchableOpacity style={[st.bigBtn, { backgroundColor: '#845EC2', marginTop: 14 }]} onPress={restart}><Text style={st.bigBtnTxt}>🔄 Nochmal</Text></TouchableOpacity>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={st.safe}>
      <TouchableOpacity style={st.back} onPress={() => navigation.goBack()}><Text style={st.backTxt}>← Zurück</Text></TouchableOpacity>
      <Text style={st.header}>🃏 Memory  —  Züge: {moves}  |  Paare: {matched.length}/{numPairs}</Text>
      <View style={st.grid}>
        {deck.map(card => (
          <Card key={card.uid} item={card} size={CARD}
            isFlipped={flipped.includes(card.uid)}
            isMatched={matched.includes(card.id)}
            onPress={() => handleFlip(card.uid)} />
        ))}
      </View>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: '#F3E8FF', alignItems: 'center' },
  back:       { alignSelf: 'flex-start', margin: 16, padding: 8 },
  backTxt:    { fontSize: 20, color: '#888', fontWeight: '600' },
  header:     { fontSize: 16, color: '#777', marginBottom: 12, textAlign: 'center' },
  grid:       { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, paddingHorizontal: 12 },
  face:       { position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  back:       { backgroundColor: '#845EC2' },
  front:      { backgroundColor: '#fff', elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
  matched:    { backgroundColor: '#B5EAD7', borderWidth: 2, borderColor: '#52B788' },
  cardLabel:  { fontSize: 11, fontWeight: '700', color: '#444', marginTop: 2 },
  celebTitle: { fontSize: 52, fontWeight: '900', marginTop: 60, color: '#333' },
  celebSub:   { fontSize: 24, color: '#555', marginTop: 12, textAlign: 'center', paddingHorizontal: 30 },
  bigBtn:     { marginTop: 32, backgroundColor: '#00B4D8', paddingVertical: 16, paddingHorizontal: 44, borderRadius: 24 },
  bigBtnTxt:  { fontSize: 22, color: '#fff', fontWeight: '800' },
});
