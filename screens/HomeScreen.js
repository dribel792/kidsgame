import React, { useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Dimensions,
} from 'react-native';
import { speak } from '../utils/speak';

const { width } = Dimensions.get('window');
const IS_TABLET = width > 700;
const CARD_W    = IS_TABLET ? 200 : (width - 56) / 2;

const CATEGORIES = [
  {
    label: '🔢 Zahlen & Rechnen',
    color: '#FFF0F0',
    games: [
      { name: 'Zählen',     emoji: '🔢', color: '#00B4D8', desc: 'Zähl mit mir!',         screen: 'Counting' },
      { name: 'Rechnen',    emoji: '➕', color: '#FF6B9D', desc: 'Addieren lernen',        screen: 'Math'     },
    ],
  },
  {
    label: '🔤 Sprache',
    color: '#FFF9F0',
    games: [
      { name: 'Buchstaben', emoji: '🔤', color: '#F4A261', desc: 'Lerne das Alphabet!',   screen: 'Letters'  },
      { name: 'Wissen',     emoji: '🧠', color: '#E76F51', desc: 'Clever sein!',           screen: 'Trivia'   },
    ],
  },
  {
    label: '🧩 Denken & Logik',
    color: '#F3F0FF',
    games: [
      { name: 'Muster',     emoji: '🔄', color: '#845EC2', desc: 'Was kommt als Nächstes?',screen: 'Patterns' },
      { name: 'Was passt nicht?', emoji: '🔍', color: '#6A4C93', desc: 'Finde den Ausreißer', screen: 'OddOneOut' },
      { name: 'Sortieren',  emoji: '📦', color: '#4D9DE0', desc: 'Ordne die Dinge ein!',  screen: 'Sorting'  },
    ],
  },
  {
    label: '🎨 Farben & Formen',
    color: '#F0FFF4',
    games: [
      { name: 'Farben',     emoji: '🎨', color: '#52B788', desc: 'Welche Farbe ist das?', screen: 'Colors'   },
      { name: 'Formen',     emoji: '🔷', color: '#2D9CDB', desc: 'Kreise, Dreiecke…',     screen: 'Shapes'   },
    ],
  },
  {
    label: '👁️ Konzentration',
    color: '#F0FAFF',
    games: [
      { name: 'Memory',     emoji: '🃏', color: '#0077B6', desc: 'Finde die Paare!',      screen: 'Memory'   },
      { name: 'Aufmerksamkeit', emoji: '👁️', color: '#023E8A', desc: 'Was ist anders?',  screen: 'Attention'},
    ],
  },
];

export default function HomeScreen({ navigation }) {
  useEffect(() => {
    setTimeout(() => speak('Hallo! Was möchtest du heute lernen?', { rate: 0.82, pitch: 1.15 }), 500);
  }, []);

  return (
    <SafeAreaView style={st.safe}>
      <Text style={st.title}>🌟 Lernzeit!</Text>
      <Text style={st.subtitle}>Wähle ein Spiel</Text>
      <ScrollView style={st.scroll} contentContainerStyle={st.scrollContent} showsVerticalScrollIndicator={false}>
        {CATEGORIES.map(cat => (
          <View key={cat.label} style={[st.section, { backgroundColor: cat.color }]}>
            <Text style={st.catLabel}>{cat.label}</Text>
            <View style={st.gameRow}>
              {cat.games.map(g => (
                <TouchableOpacity
                  key={g.name}
                  style={[st.card, { backgroundColor: g.color, width: CARD_W }]}
                  activeOpacity={0.75}
                  onPress={() => {
                    speak(g.desc, { rate: 0.82, pitch: 1.15 });
                    setTimeout(() => navigation.navigate(g.screen), 500);
                  }}
                >
                  <Text style={st.cardEmoji}>{g.emoji}</Text>
                  <Text style={st.cardName}>{g.name}</Text>
                  <Text style={st.cardDesc}>{g.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: '#FFFDE7' },
  title:       { fontSize: IS_TABLET ? 46 : 36, fontWeight: '900', textAlign: 'center', marginTop: 20, color: '#333' },
  subtitle:    { fontSize: 18, color: '#777', textAlign: 'center', marginBottom: 10 },
  scroll:      { flex: 1 },
  scrollContent:{ paddingHorizontal: 16, paddingBottom: 20 },
  section:     { borderRadius: 20, padding: 14, marginBottom: 14 },
  catLabel:    { fontSize: IS_TABLET ? 20 : 17, fontWeight: '800', color: '#555', marginBottom: 10 },
  gameRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card:        { paddingVertical: IS_TABLET ? 24 : 18, borderRadius: 22, alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.13, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  cardEmoji:   { fontSize: IS_TABLET ? 44 : 36 },
  cardName:    { fontSize: IS_TABLET ? 20 : 16, fontWeight: '800', color: '#fff', marginTop: 6 },
  cardDesc:    { fontSize: IS_TABLET ? 13 : 11, color: '#fff', opacity: 0.9, marginTop: 2, textAlign: 'center', paddingHorizontal: 8 },
});
