import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Animated, Dimensions } from 'react-native';
import { speak } from '../utils/speak';

const { width } = Dimensions.get('window');
const IS_TABLET = width > 700;

const ALL_Q = [
  // L1 — very basic (animal sounds, colors)
  { q:'Was sagt die Katze?',           correct:'Miau',    wrongs:['Wau','Muh'],             emoji:'🐱', level:1 },
  { q:'Was sagt der Hund?',            correct:'Wau',     wrongs:['Miau','Quak'],            emoji:'🐶', level:1 },
  { q:'Was sagt die Kuh?',             correct:'Muh',     wrongs:['Miau','Wau'],             emoji:'🐄', level:1 },
  { q:'Welche Farbe hat eine Banane?', correct:'Gelb',    wrongs:['Rot','Blau'],             emoji:'🍌', level:1 },
  { q:'Welche Farbe hat ein Apfel?',   correct:'Rot',     wrongs:['Blau','Gelb'],            emoji:'🍎', level:1 },
  // L2 — basic facts
  { q:'Was sagt der Frosch?',          correct:'Quak',    wrongs:['Miau','Muh'],             emoji:'🐸', level:2 },
  { q:'Wie viele Beine hat ein Hund?', correct:'4',       wrongs:['2','6'],                  emoji:'🐶', level:2 },
  { q:'Wie viele Beine hat ein Vogel?',correct:'2',       wrongs:['4','6'],                  emoji:'🐦', level:2 },
  { q:'Was gibt uns die Sonne?',       correct:'Licht',   wrongs:['Wasser','Essen'],         emoji:'☀️', level:2 },
  { q:'Wo lebt ein Fisch?',            correct:'Im Wasser',wrongs:['In der Luft','Auf dem Baum'],emoji:'🐟',level:2},
  { q:'Was essen Kaninchen am liebsten?',correct:'Karotten',wrongs:['Pizza','Eis'],          emoji:'🐰', level:2 },
  { q:'Was macht die Biene?',          correct:'Honig',   wrongs:['Milch','Butter'],         emoji:'🐝', level:2 },
  // L3 — nature & world
  { q:'Welcher Vogel kann nicht fliegen?',correct:'Pinguin',wrongs:['Adler','Taube'],        emoji:'🐧', level:3 },
  { q:'Was hat ein Baum?',             correct:'Blätter', wrongs:['Flossen','Räder'],        emoji:'🌳', level:3 },
  { q:'Wie heißt der König der Tiere?',correct:'Löwe',    wrongs:['Hund','Elefant'],         emoji:'🦁', level:3 },
  { q:'Was ist rund und rollt?',       correct:'Ball',    wrongs:['Buch','Tisch'],           emoji:'⚽', level:3 },
  { q:'Was fällt vom Himmel wenn es regnet?',correct:'Regen',wrongs:['Schnee','Sand'],       emoji:'🌧️', level:3 },
  // L4 — harder
  { q:'Wie viele Beine hat eine Spinne?',correct:'8',     wrongs:['6','4'],                  emoji:'🕷️', level:4 },
  { q:'Was ist das größte Land der Welt?',correct:'Russland',wrongs:['Deutschland','China'], emoji:'🌍', level:4 },
  { q:'Wie viele Jahreszeiten gibt es?',correct:'4',      wrongs:['3','2'],                  emoji:'🍂', level:4 },
  { q:'Was schwimmt oben auf dem Wasser?',correct:'Holz', wrongs:['Stein','Sand'],           emoji:'🪵', level:4 },
  { q:'Welches Tier lebt am längsten?', correct:'Schildkröte',wrongs:['Hund','Elefant'],     emoji:'🐢', level:4 },
];

const POOLS  = { 1: ALL_Q.filter(q=>q.level===1), 2: ALL_Q.filter(q=>q.level<=2), 3: ALL_Q.filter(q=>q.level<=3), 4: ALL_Q };
const ROUNDS = { 1: 5, 2: 8, 3: 10, 4: 12 };
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

export default function TriviaScreen({ route, navigation }) {
  const difficulty  = route.params?.difficulty ?? 2;
  const pool        = POOLS[difficulty];
  const totalRounds = ROUNDS[difficulty];
  const [order]     = useState(() => shuffle(pool.map((_, i) => i)));
  const [idx, setIdx]       = useState(0);
  const [score, setScore]   = useState(0);
  const [status, setStatus] = useState('playing');
  const [choices, setChoices] = useState([]);
  const [picked, setPicked] = useState(null);
  const shakeAnim  = useRef(new Animated.Value(0)).current;
  const emojiScale = useRef(new Animated.Value(0.5)).current;

  const q = pool[order[idx % order.length]];

  useEffect(() => { load(); }, [idx]);

  function load() {
    const curr = pool[order[idx % order.length]];
    setChoices(shuffle([curr.correct, ...curr.wrongs]));
    setStatus('playing'); setPicked(null);
    emojiScale.setValue(0.5);
    Animated.spring(emojiScale, { toValue: 1, useNativeDriver: true }).start();
    setTimeout(() => speak(curr.q, { rate: 0.82, pitch: 1.15 }), 300);
  }

  function handlePick(ans) {
    if (status !== 'playing') return;
    setPicked(ans);
    if (ans === q.correct) {
      setStatus('correct'); setScore(s => s + 1);
      speak(`Richtig! ${q.correct}!`, { rate: 0.82, pitch: 1.2 });
      setTimeout(() => {
        if (idx + 1 >= totalRounds) setStatus('done');
        else setIdx(i => i + 1);
      }, 1800);
    } else {
      setStatus('wrong');
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 14, duration: 55, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -14, duration: 55, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 55, useNativeDriver: true }),
      ]).start();
      speak('Nicht ganz! Versuch nochmal!', { rate: 0.82, pitch: 1.1 });
      setTimeout(() => { setStatus('playing'); setPicked(null); }, 1200);
    }
  }

  if (status === 'done') return (
    <SafeAreaView style={s.safe}>
      <Text style={s.celebTitle}>🎉 Klasse! 🎉</Text>
      <Text style={s.celebSub}>{score} von {totalRounds} richtig!</Text>
      <TouchableOpacity style={s.bigBtn} onPress={() => navigation.navigate('Home')}><Text style={s.bigBtnTxt}>🏠 Startseite</Text></TouchableOpacity>
      <TouchableOpacity style={[s.bigBtn, { backgroundColor: '#FF6B9D', marginTop: 14 }]}
        onPress={() => { setIdx(0); setScore(0); }}>
        <Text style={s.bigBtnTxt}>🔄 Nochmal</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={s.safe}>
      <TouchableOpacity style={s.back} onPress={() => navigation.goBack()}><Text style={s.backTxt}>← Zurück</Text></TouchableOpacity>
      <Text style={s.score}>⭐ {score}  Frage {idx + 1}/{totalRounds}</Text>
      <Animated.Text style={[s.bigEmoji, { transform: [{ scale: emojiScale }] }]}>{q.emoji}</Animated.Text>
      <Animated.View style={[s.qBox, { transform: [{ translateX: shakeAnim }] }]}>
        <Text style={s.qTxt}>{q.q}</Text>
      </Animated.View>
      <TouchableOpacity onPress={() => speak(q.q, { rate: 0.82, pitch: 1.15 })} style={s.speakBtn}>
        <Text style={s.speakTxt}>🔊 Nochmal hören</Text>
      </TouchableOpacity>
      <View style={s.choicesCol}>
        {choices.map(ans => {
          const isC = ans === q.correct && status === 'correct';
          const isW = ans === picked    && status === 'wrong';
          return (
            <TouchableOpacity key={ans}
              style={[s.ansBtn,
                isC && { backgroundColor: '#52B788' },
                isW && { backgroundColor: '#E63946' },
                !isC && !isW && { backgroundColor: '#F4A261' }]}
              onPress={() => handlePick(ans)} activeOpacity={0.75}>
              <Text style={s.ansTxt}>{ans}</Text>
              {isC && <Text style={s.tick}> ✓</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#FFFDE7', alignItems: 'center' },
  back:      { alignSelf: 'flex-start', margin: 16, padding: 8 },
  backTxt:   { fontSize: 20, color: '#888', fontWeight: '600' },
  score:     { fontSize: 18, color: '#777' },
  bigEmoji:  { fontSize: IS_TABLET ? 100 : 80, marginTop: 6 },
  qBox:      { marginTop: 6, paddingHorizontal: 24, width: '100%' },
  qTxt:      { fontSize: IS_TABLET ? 28 : 21, fontWeight: '900', color: '#333', textAlign: 'center' },
  speakBtn:  { marginTop: 8, backgroundColor: '#E8F4FD', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 20 },
  speakTxt:  { fontSize: 17, color: '#0077B6', fontWeight: '700' },
  choicesCol:{ marginTop: 14, width: IS_TABLET ? 400 : width * 0.85, gap: 10 },
  ansBtn:    { width: '100%', paddingVertical: IS_TABLET ? 18 : 14, borderRadius: 22, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  ansTxt:    { fontSize: IS_TABLET ? 24 : 19, fontWeight: '800', color: '#fff' },
  tick:      { fontSize: 22, color: '#fff', fontWeight: '900' },
  celebTitle:{ fontSize: 52, fontWeight: '900', marginTop: 80, color: '#333' },
  celebSub:  { fontSize: 26, color: '#555', marginTop: 12 },
  bigBtn:    { marginTop: 32, backgroundColor: '#00B4D8', paddingVertical: 16, paddingHorizontal: 44, borderRadius: 24 },
  bigBtnTxt: { fontSize: 22, color: '#fff', fontWeight: '800' },
});
