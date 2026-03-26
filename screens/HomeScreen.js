import React, { useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, Animated, Dimensions,
} from 'react-native';
import * as Speech from 'expo-speech';

const { width } = Dimensions.get('window');

const GAMES = [
  { name: 'Buchstaben', emoji: '🔤', color: '#FF6B9D', desc: 'Lerne das Alphabet!', screen: 'Letters' },
  { name: 'Memory',     emoji: '🃏', color: '#845EC2', desc: 'Finde die Paare!',    screen: 'Memory'  },
  { name: 'Zählen',     emoji: '🔢', color: '#00B4D8', desc: 'Zähl mit mir!',       screen: 'Counting'},
];

export default function HomeScreen({ navigation }) {
  const bounce = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: 1.05, duration: 700, useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 1,    duration: 700, useNativeDriver: true }),
      ])
    ).start();
    setTimeout(() => Speech.speak('Lass uns spielen und lernen!', { rate: 0.85, pitch: 1.2, language: 'de-DE' }), 400);
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.Text style={[styles.title, { transform: [{ scale: bounce }] }]}>
        🌟 Lernzeit! 🌟
      </Animated.Text>
      <Text style={styles.subtitle}>Wähle ein Spiel</Text>

      <View style={styles.grid}>
        {GAMES.map((g) => (
          <TouchableOpacity
            key={g.name}
            style={[styles.card, { backgroundColor: g.color }]}
            activeOpacity={0.75}
            onPress={() => {
              Speech.speak(g.desc, { rate: 0.85, pitch: 1.2, language: 'de-DE' });
              setTimeout(() => navigation.navigate(g.screen), 600);
            }}
          >
            <Text style={styles.cardEmoji}>{g.emoji}</Text>
            <Text style={styles.cardName}>{g.name}</Text>
            <Text style={styles.cardDesc}>{g.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#FFFDE7', alignItems: 'center' },
  title:     { fontSize: 42, fontWeight: '900', marginTop: 30, color: '#333' },
  subtitle:  { fontSize: 22, color: '#777', marginBottom: 30 },
  grid:      { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 20, paddingHorizontal: 20 },
  card: {
    width: width > 700 ? 220 : width * 0.42,
    paddingVertical: 30,
    borderRadius: 28,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  cardEmoji: { fontSize: 56 },
  cardName:  { fontSize: 26, fontWeight: '800', color: '#fff', marginTop: 8 },
  cardDesc:  { fontSize: 15, color: '#fff', opacity: 0.9, marginTop: 4, textAlign: 'center', paddingHorizontal: 10 },
});
