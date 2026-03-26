import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, Animated, Dimensions,
} from 'react-native';
import * as Speech from 'expo-speech';

const { width } = Dimensions.get('window');
const IS_TABLET = width > 700;

// German letter-word pairs — chosen for clarity at age 4
// C/Q/X/Y/Z avoided (uncommon in German children's vocab)
const QUESTIONS = [
  { letter: 'A', correct: { emoji: '🍎', word: 'Apfel'     }, wrongs: [{ emoji: '🐱', word: 'Katze'    }, { emoji: '🌙', word: 'Mond'      }] },
  { letter: 'B', correct: { emoji: '🐻', word: 'Bär'       }, wrongs: [{ emoji: '🐶', word: 'Hund'     }, { emoji: '🍎', word: 'Apfel'     }] },
  { letter: 'D', correct: { emoji: '🦕', word: 'Dino'      }, wrongs: [{ emoji: '🐻', word: 'Bär'      }, { emoji: '⭐', word: 'Stern'     }] },
  { letter: 'E', correct: { emoji: '🐘', word: 'Elefant'   }, wrongs: [{ emoji: '🐟', word: 'Fisch'    }, { emoji: '🍌', word: 'Banane'    }] },
  { letter: 'F', correct: { emoji: '🐟', word: 'Fisch'     }, wrongs: [{ emoji: '🐶', word: 'Hund'     }, { emoji: '🌙', word: 'Mond'      }] },
  { letter: 'G', correct: { emoji: '🦒', word: 'Giraffe'   }, wrongs: [{ emoji: '🐱', word: 'Katze'    }, { emoji: '🍎', word: 'Apfel'     }] },
  { letter: 'H', correct: { emoji: '🐶', word: 'Hund'      }, wrongs: [{ emoji: '🦁', word: 'Löwe'     }, { emoji: '🐘', word: 'Elefant'   }] },
  { letter: 'I', correct: { emoji: '🦔', word: 'Igel'      }, wrongs: [{ emoji: '🍌', word: 'Banane'   }, { emoji: '🐶', word: 'Hund'      }] },
  { letter: 'K', correct: { emoji: '🐱', word: 'Katze'     }, wrongs: [{ emoji: '🐟', word: 'Fisch'    }, { emoji: '🍎', word: 'Apfel'     }] },
  { letter: 'L', correct: { emoji: '🦁', word: 'Löwe'      }, wrongs: [{ emoji: '🐻', word: 'Bär'      }, { emoji: '🦒', word: 'Giraffe'   }] },
];

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function LettersScreen({ navigation }) {
  const [qIndex, setQIndex]   = useState(0);
  const [choices, setChoices] = useState([]);
  const [status, setStatus]   = useState('playing');
  const [score, setScore]     = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const q = QUESTIONS[qIndex % QUESTIONS.length];

  useEffect(() => {
    const mixed = shuffle([q.correct, ...q.wrongs]);
    setChoices(mixed);
    setStatus('playing');
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
    setTimeout(() => {
      Speech.speak(
        `Finde den Buchstaben ${q.letter}! ${q.letter} wie ${q.correct.word}`,
        { rate: 0.82, pitch: 1.25, language: 'de-DE' }
      );
    }, 300);
  }, [qIndex]);

  function handlePick(item) {
    if (status !== 'playing') return;
    if (item.word === q.correct.word) {
      setStatus('correct');
      setScore(s => s + 1);
      Speech.speak('Super! Das ist richtig!', { rate: 0.85, pitch: 1.3, language: 'de-DE' });
      setTimeout(() => {
        if (qIndex + 1 >= QUESTIONS.length) setStatus('done');
        else setQIndex(i => i + 1);
      }, 1400);
    } else {
      setStatus('wrong');
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10,  duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8,   duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8,  duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
      ]).start();
      Speech.speak('Versuch es nochmal! Du schaffst das!', { rate: 0.85, pitch: 1.1, language: 'de-DE' });
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

      <Animated.View style={[styles.letterBox, {
        transform: [{ translateX: shakeAnim }, { scale: scaleAnim }],
        backgroundColor: status === 'correct' ? '#B5EAD7' : status === 'wrong' ? '#FFD5D5' : '#FFF9C4',
      }]}>
        <Text style={styles.bigLetter}>{q.letter}</Text>
        <Text style={styles.letterHint}>Was beginnt mit {q.letter}?</Text>
      </Animated.View>

      <TouchableOpacity
        onPress={() => Speech.speak(`${q.letter} wie ${q.correct.word}`, { rate: 0.82, pitch: 1.25, language: 'de-DE' })}
        style={styles.speakBtn}
      >
        <Text style={styles.speakBtnText}>🔊 Nochmal hören</Text>
      </TouchableOpacity>

      <View style={styles.choicesRow}>
        {choices.map((item) => {
          const isCorrect = item.word === q.correct.word && status === 'correct';
          return (
            <TouchableOpacity
              key={item.word}
              style={[styles.choiceCard, isCorrect && styles.choiceCorrect]}
              onPress={() => handlePick(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.choiceEmoji}>{item.emoji}</Text>
              <Text style={styles.choiceWord}>{item.word}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.progressRow}>
        {QUESTIONS.map((_, i) => (
          <View key={i} style={[styles.dot, i < qIndex && styles.dotDone, i === qIndex && styles.dotCurrent]} />
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: '#FFF9F0', alignItems: 'center' },
  topBack:        { alignSelf: 'flex-start', margin: 16, padding: 8 },
  topBackText:    { fontSize: 20, color: '#888', fontWeight: '600' },
  scoreText:      { fontSize: 26, fontWeight: '800', color: '#F4A261', alignSelf: 'flex-end', marginRight: 24 },
  letterBox: {
    marginTop: 8, width: IS_TABLET ? 300 : width * 0.7,
    paddingVertical: 24, borderRadius: 32, alignItems: 'center',
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
  },
  bigLetter:      { fontSize: IS_TABLET ? 120 : 90, fontWeight: '900', color: '#333' },
  letterHint:     { fontSize: 17, color: '#555', marginTop: 4 },
  speakBtn:       { marginTop: 10, backgroundColor: '#E8F4FD', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 20 },
  speakBtnText:   { fontSize: 18, color: '#0077B6', fontWeight: '700' },
  choicesRow:     { flexDirection: 'row', gap: 16, marginTop: 24, paddingHorizontal: 16 },
  choiceCard: {
    flex: 1, maxWidth: IS_TABLET ? 180 : 110, paddingVertical: 20, borderRadius: 24,
    alignItems: 'center', backgroundColor: '#fff',
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
  },
  choiceCorrect:  { backgroundColor: '#B5EAD7', borderWidth: 3, borderColor: '#52B788' },
  choiceEmoji:    { fontSize: IS_TABLET ? 64 : 50 },
  choiceWord:     { fontSize: 16, fontWeight: '700', color: '#444', marginTop: 6 },
  celebTitle:     { fontSize: 56, fontWeight: '900', marginTop: 60, color: '#333' },
  celebScore:     { fontSize: 28, color: '#555', marginTop: 12 },
  backBtn:        { marginTop: 32, backgroundColor: '#845EC2', paddingVertical: 16, paddingHorizontal: 40, borderRadius: 24 },
  backBtnText:    { fontSize: 22, color: '#fff', fontWeight: '800' },
  progressRow:    { flexDirection: 'row', gap: 8, marginTop: 24 },
  dot:            { width: 12, height: 12, borderRadius: 6, backgroundColor: '#ddd' },
  dotDone:        { backgroundColor: '#52B788' },
  dotCurrent:     { backgroundColor: '#FF6B9D', transform: [{ scale: 1.3 }] },
});
