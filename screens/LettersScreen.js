import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, Animated, Dimensions,
} from 'react-native';
import * as Speech from 'expo-speech';

const { width } = Dimensions.get('window');
const IS_TABLET = width > 700;

// Each entry: letter, correct item, two distractors (different first letters)
const QUESTIONS = [
  { letter: 'A', correct: { emoji: '🍎', word: 'Apple'    }, wrongs: [{ emoji: '🐱', word: 'Cat'      }, { emoji: '🌙', word: 'Moon'      }] },
  { letter: 'B', correct: { emoji: '🍌', word: 'Banana'   }, wrongs: [{ emoji: '🐶', word: 'Dog'      }, { emoji: '🍎', word: 'Apple'     }] },
  { letter: 'C', correct: { emoji: '🐱', word: 'Cat'      }, wrongs: [{ emoji: '🍌', word: 'Banana'   }, { emoji: '🌟', word: 'Star'      }] },
  { letter: 'D', correct: { emoji: '🐶', word: 'Dog'      }, wrongs: [{ emoji: '🍎', word: 'Apple'    }, { emoji: '🐱', word: 'Cat'       }] },
  { letter: 'E', correct: { emoji: '🐘', word: 'Elephant' }, wrongs: [{ emoji: '🐟', word: 'Fish'     }, { emoji: '🍌', word: 'Banana'    }] },
  { letter: 'F', correct: { emoji: '🐟', word: 'Fish'     }, wrongs: [{ emoji: '🐶', word: 'Dog'      }, { emoji: '🌙', word: 'Moon'      }] },
  { letter: 'G', correct: { emoji: '🦒', word: 'Giraffe'  }, wrongs: [{ emoji: '🐱', word: 'Cat'      }, { emoji: '🍎', word: 'Apple'     }] },
  { letter: 'H', correct: { emoji: '🐴', word: 'Horse'    }, wrongs: [{ emoji: '🦁', word: 'Lion'     }, { emoji: '🐘', word: 'Elephant'  }] },
  { letter: 'I', correct: { emoji: '🍦', word: 'Ice Cream'}, wrongs: [{ emoji: '🍌', word: 'Banana'   }, { emoji: '🐶', word: 'Dog'       }] },
  { letter: 'J', correct: { emoji: '🃏', word: 'Joker'    }, wrongs: [{ emoji: '🐟', word: 'Fish'     }, { emoji: '🍎', word: 'Apple'     }] },
];

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function LettersScreen({ navigation }) {
  const [qIndex, setQIndex]     = useState(0);
  const [choices, setChoices]   = useState([]);
  const [status, setStatus]     = useState('playing'); // playing | correct | wrong | done
  const [score, setScore]       = useState(0);
  const scaleAnim  = useRef(new Animated.Value(1)).current;
  const shakeAnim  = useRef(new Animated.Value(0)).current;
  const celebAnim  = useRef(new Animated.Value(0)).current;

  const q = QUESTIONS[qIndex % QUESTIONS.length];

  useEffect(() => {
    const mixed = shuffle([q.correct, ...q.wrongs]);
    setChoices(mixed);
    setStatus('playing');
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
    setTimeout(() => {
      Speech.speak(`Find the letter ${q.letter}! ${q.letter} is for ${q.correct.word}`, {
        rate: 0.82, pitch: 1.25,
      });
    }, 300);
  }, [qIndex]);

  function handlePick(item) {
    if (status !== 'playing') return;
    if (item.word === q.correct.word) {
      setStatus('correct');
      setScore(s => s + 1);
      Animated.sequence([
        Animated.spring(celebAnim, { toValue: 1, useNativeDriver: true }),
        Animated.delay(200),
        Animated.spring(celebAnim, { toValue: 0, useNativeDriver: true }),
      ]).start();
      Speech.speak('Amazing! That\'s right! 🎉', { rate: 0.85, pitch: 1.3 });
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
      Speech.speak('Try again! You can do it!', { rate: 0.85, pitch: 1.1 });
      setTimeout(() => setStatus('playing'), 1200);
    }
  }

  if (status === 'done') {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.celebTitle}>🎉 Woohoo! 🎉</Text>
        <Text style={styles.celebScore}>You got {score} out of {QUESTIONS.length}!</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>🏠 Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: '#FF6B9D', marginTop: 12 }]}
          onPress={() => { setQIndex(0); setScore(0); setStatus('playing'); }}>
          <Text style={styles.backBtnText}>🔄 Play Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Back button */}
      <TouchableOpacity style={styles.topBack} onPress={() => navigation.goBack()}>
        <Text style={styles.topBackText}>← Back</Text>
      </TouchableOpacity>

      {/* Score */}
      <Text style={styles.scoreText}>⭐ {score}</Text>

      {/* Big Letter */}
      <Animated.View style={[styles.letterBox, {
        transform: [{ translateX: shakeAnim }, { scale: scaleAnim }],
        backgroundColor: status === 'correct' ? '#B5EAD7' : status === 'wrong' ? '#FFD5D5' : '#FFF9C4',
      }]}>
        <Text style={styles.bigLetter}>{q.letter}</Text>
        <Text style={styles.letterHint}>Find something that starts with {q.letter}!</Text>
      </Animated.View>

      {/* Speaker button */}
      <TouchableOpacity onPress={() =>
        Speech.speak(`${q.letter} is for ${q.correct.word}`, { rate: 0.82, pitch: 1.25 })}
        style={styles.speakBtn}>
        <Text style={styles.speakBtnText}>🔊 Say it again</Text>
      </TouchableOpacity>

      {/* Choices */}
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

      {/* Progress */}
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
