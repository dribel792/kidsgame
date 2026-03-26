import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, Animated, Dimensions,
} from 'react-native';
import { speak } from '../utils/speak';

const { width } = Dimensions.get('window');
const IS_TABLET = width > 700;

const PAIRS = [
  { id: 'hund',     emoji: '🐶', label: 'Hund'     },
  { id: 'katze',    emoji: '🐱', label: 'Katze'    },
  { id: 'fisch',    emoji: '🐟', label: 'Fisch'    },
  { id: 'hase',     emoji: '🐰', label: 'Hase'     },
  { id: 'elefant',  emoji: '🐘', label: 'Elefant'  },
  { id: 'giraffe',  emoji: '🦒', label: 'Giraffe'  },
];

function buildDeck() {
  const doubled = [...PAIRS, ...PAIRS].map((p, i) => ({ ...p, uid: i }));
  return doubled.sort(() => Math.random() - 0.5);
}

const CARD_SIZE = IS_TABLET ? 130 : Math.min((width - 80) / 4, 88);

function Card({ item, isFlipped, isMatched, onPress }) {
  const flipAnim  = useRef(new Animated.Value(isFlipped ? 1 : 0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(flipAnim, {
      toValue: isFlipped || isMatched ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isFlipped, isMatched]);

  useEffect(() => {
    if (isMatched) {
      Animated.sequence([
        Animated.spring(scaleAnim, { toValue: 1.2, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1,   useNativeDriver: true }),
      ]).start();
    }
  }, [isMatched]);

  const frontRotate  = flipAnim.interpolate({ inputRange: [0,1], outputRange: ['180deg','360deg'] });
  const backRotate   = flipAnim.interpolate({ inputRange: [0,1], outputRange: ['0deg','180deg']   });
  const frontOpacity = flipAnim.interpolate({ inputRange: [0.5,1], outputRange: [0,1] });
  const backOpacity  = flipAnim.interpolate({ inputRange: [0,0.5], outputRange: [1,0] });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Animated.View style={[styles.cardWrap, { transform: [{ scale: scaleAnim }] }]}>
        <Animated.View style={[
          styles.cardFace, styles.cardBack,
          { opacity: backOpacity, transform: [{ rotateY: backRotate }] },
        ]}>
          <Text style={styles.cardBackText}>?</Text>
        </Animated.View>
        <Animated.View style={[
          styles.cardFace, styles.cardFront,
          isMatched && styles.cardMatched,
          { opacity: frontOpacity, transform: [{ rotateY: frontRotate }] },
        ]}>
          <Text style={styles.cardEmoji}>{item.emoji}</Text>
          <Text style={styles.cardLabel}>{item.label}</Text>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function MemoryScreen({ navigation }) {
  const [deck, setDeck]       = useState(buildDeck);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [locked, setLocked]   = useState(false);
  const [moves, setMoves]     = useState(0);
  const [done, setDone]       = useState(false);

  useEffect(() => {
    setTimeout(() => speak(
      'Finde die Paare! Tippe auf eine Karte!',
      { rate: 0.85, pitch: 1.2 }
    ), 400);
  }, []);

  useEffect(() => {
    if (matched.length === PAIRS.length) {
      setDone(true);
      speak('Du hast alle Paare gefunden! Fantastisch!', { rate: 0.85, pitch: 1.3 });
    }
  }, [matched]);

  const handleFlip = useCallback((uid) => {
    if (locked) return;
    const card = deck.find(c => c.uid === uid);
    if (!card) return;
    if (matched.includes(card.id)) return;
    if (flipped.includes(uid)) return;

    if (flipped.length === 0) {
      setFlipped([uid]);
      speak(card.label, { rate: 0.85, pitch: 1.2 });
    } else if (flipped.length === 1) {
      const firstCard = deck.find(c => c.uid === flipped[0]);
      setFlipped([flipped[0], uid]);
      setMoves(m => m + 1);
      setLocked(true);
      speak(card.label, { rate: 0.85, pitch: 1.2 });

      if (firstCard.id === card.id) {
        setTimeout(() => {
          setMatched(m => [...m, card.id]);
          setFlipped([]);
          setLocked(false);
          speak('Paar gefunden! Super gemacht!', { rate: 0.85, pitch: 1.3 });
        }, 700);
      } else {
        setTimeout(() => {
          setFlipped([]);
          setLocked(false);
        }, 1100);
      }
    }
  }, [locked, flipped, matched, deck]);

  function restart() {
    setDeck(buildDeck());
    setFlipped([]);
    setMatched([]);
    setLocked(false);
    setMoves(0);
    setDone(false);
  }

  if (done) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.celebTitle}>🎉 Geschafft! 🎉</Text>
        <Text style={styles.celebSub}>Du hast alles in {moves} Zügen gefunden!</Text>
        <TouchableOpacity style={styles.bigBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.bigBtnText}>🏠 Startseite</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.bigBtn, { backgroundColor: '#845EC2', marginTop: 14 }]} onPress={restart}>
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
        <Text style={styles.title}>🃏 Memory</Text>
        <Text style={styles.moves}>Züge: {moves} | Paare: {matched.length}/{PAIRS.length}</Text>
      </View>

      <View style={styles.grid}>
        {deck.map((card) => (
          <Card
            key={card.uid}
            item={card}
            isFlipped={flipped.includes(card.uid)}
            isMatched={matched.includes(card.id)}
            onPress={() => handleFlip(card.uid)}
          />
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: '#F3E8FF', alignItems: 'center' },
  topBack:     { alignSelf: 'flex-start', margin: 16, padding: 8 },
  topBackText: { fontSize: 20, color: '#888', fontWeight: '600' },
  header:      { alignItems: 'center', marginBottom: 16 },
  title:       { fontSize: 34, fontWeight: '900', color: '#333' },
  moves:       { fontSize: 18, color: '#777', marginTop: 4 },
  grid:        { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, paddingHorizontal: 16 },
  cardWrap:    { width: CARD_SIZE, height: CARD_SIZE + 20 },
  cardFace:    { position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  cardBack:    { backgroundColor: '#845EC2' },
  cardBackText:{ fontSize: CARD_SIZE * 0.45, color: '#fff', fontWeight: '900' },
  cardFront:   { backgroundColor: '#fff', elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  cardMatched: { backgroundColor: '#B5EAD7', borderWidth: 2, borderColor: '#52B788' },
  cardEmoji:   { fontSize: CARD_SIZE * 0.42 },
  cardLabel:   { fontSize: 13, fontWeight: '700', color: '#444', marginTop: 4 },
  celebTitle:  { fontSize: 52, fontWeight: '900', marginTop: 60, color: '#333' },
  celebSub:    { fontSize: 24, color: '#555', marginTop: 12, textAlign: 'center', paddingHorizontal: 30 },
  bigBtn:      { marginTop: 32, backgroundColor: '#00B4D8', paddingVertical: 16, paddingHorizontal: 40, borderRadius: 24 },
  bigBtnText:  { fontSize: 22, color: '#fff', fontWeight: '800' },
});
