/**
 * speak(text, options)
 * On web: uses Web Speech API directly and picks the best German voice available
 * (Google Deutsch >> other Google >> any de-DE >> fallback).
 * On native: delegates to expo-speech which uses high-quality iOS voices.
 */
import { Platform } from 'react-native';
import * as Speech from 'expo-speech';

let _bestVoice = null;       // cached after first lookup
let _voicesLoaded = false;

function pickBestVoice(voices) {
  // Preference order for German voices on Chrome/Edge/Safari
  const prefs = [
    v => v.lang === 'de-DE' && v.name === 'Google Deutsch',
    v => v.lang === 'de-DE' && v.name.toLowerCase().includes('google'),
    v => v.lang === 'de-DE' && v.name.toLowerCase().includes('microsoft'),
    v => v.lang === 'de-DE' && !v.localService,   // cloud/online voices
    v => v.lang === 'de-DE',
    v => v.lang.startsWith('de'),
  ];
  for (const test of prefs) {
    const match = voices.find(test);
    if (match) return match;
  }
  return null;
}

function webSpeak(text, { rate = 0.82, pitch = 1.15 } = {}) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang  = 'de-DE';
  utter.rate  = rate;
  utter.pitch = pitch;

  const trySpeak = () => {
    if (!_voicesLoaded) {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        _bestVoice   = pickBestVoice(voices);
        _voicesLoaded = true;
      }
    }
    if (_bestVoice) utter.voice = _bestVoice;
    window.speechSynthesis.speak(utter);
  };

  if (!_voicesLoaded) {
    // Voices may not be ready yet on first call
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      _bestVoice   = pickBestVoice(voices);
      _voicesLoaded = true;
      trySpeak();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        _bestVoice   = pickBestVoice(window.speechSynthesis.getVoices());
        _voicesLoaded = true;
        trySpeak();
      };
    }
  } else {
    trySpeak();
  }
}

export function speak(text, options = {}) {
  if (Platform.OS === 'web') {
    webSpeak(text, options);
  } else {
    Speech.speak(text, {
      language: 'de-DE',
      rate:  options.rate  ?? 0.82,
      pitch: options.pitch ?? 1.15,
    });
  }
}

export function stopSpeech() {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
  } else {
    Speech.stop();
  }
}
