import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, Animated, Dimensions,
} from 'react-native';
import { speak } from '../utils/speak';

const { width } = Dimensions.get('window');
const IS_TABLET = width > 700;

const LEVELS = [
  { level: 1, emoji: '🌱', name: 'Leicht',   sub: 'Für Anfänger',          color: '#52B788', star: '⭐' },
  { level: 2, emoji: '⭐', name: 'Mittel',   sub: 'Normales Spiel',        color: '#F4A261', star: '⭐⭐' },
  { level: 3, emoji: '🔥', name: 'Schwer',   sub: 'Mehr Herausforderung',  color: '#E76F51', star: '⭐⭐⭐' },
  { level: 4, emoji: '🏆', name: 'Experte',  sub: 'Volle Schwierigkeit',   color: '#E63946', star: '⭐⭐⭐⭐' },
];

export default function DifficultyScreen({ route, navigation }) {
  const { screen, gameName } = route.params;
  const anims = useRef(LEVELS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    LEVELS.forEach((_, i) => {
      Animated.spring(anims[i], {
        toValue: 1, delay: i * 120, useNativeDriver: true,
      }).start();
    });
    setTimeout(() => speak(`${gameName}. Wähle deinen Level!`, { rate: 0.82, pitch: 1.15 }), 300);
  }, []);

  function pickLevel(level) {
    speak(LEVELS[level - 1].name, { rate: 0.82, pitch: 1.2 });
    setTimeout(() => navigation.navigate(screen, { difficulty: level }), 400);
  }

  return (
    <SafeAreaView style={s.safe}>
      <TouchableOpacity style={s.back} onPress={() => navigation.goBack()}>
        <Text style={s.backTxt}>← Zurück</Text>
      </TouchableOpacity>

      <Text style={s.title}>🎮 {gameName}</Text>
      <Text style={s.subtitle}>Wähle deinen Level</Text>

      <View style={s.grid}>
        {LEVELS.map((lvl, i) => (
          <Animated.View key={lvl.level} style={{
            transform: [{ scale: anims[i] }],
            opacity: anims[i],
            width: IS_TABLET ? 260 : (width - 56) / 2,
          }}>
            <TouchableOpacity
              style={[s.card, { backgroundColor: lvl.color }]}
              onPress={() => pickLevel(lvl.level)}
              activeOpacity={0.75}
            >
              <Text style={s.cardEmoji}>{lvl.emoji}</Text>
              <Text style={s.cardName}>{lvl.name}</Text>
              <Text style={s.cardSub}>{lvl.sub}</Text>
              <Text style={s.cardStars}>{lvl.star}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#FFFDE7', alignItems: 'center' },
  back:      { alignSelf: 'flex-start', margin: 16, padding: 8 },
  backTxt:   { fontSize: 20, color: '#888', fontWeight: '600' },
  title:     { fontSize: IS_TABLET ? 40 : 32, fontWeight: '900', color: '#333', marginTop: 8 },
  subtitle:  { fontSize: 20, color: '#777', marginBottom: 24 },
  grid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center', paddingHorizontal: 16 },
  card:      { borderRadius: 26, paddingVertical: IS_TABLET ? 36 : 28, paddingHorizontal: 12, alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  cardEmoji: { fontSize: IS_TABLET ? 60 : 48 },
  cardName:  { fontSize: IS_TABLET ? 28 : 22, fontWeight: '900', color: '#fff', marginTop: 8 },
  cardSub:   { fontSize: IS_TABLET ? 15 : 13, color: '#fff', opacity: 0.9, marginTop: 4, textAlign: 'center' },
  cardStars: { fontSize: IS_TABLET ? 22 : 18, marginTop: 10 },
});
