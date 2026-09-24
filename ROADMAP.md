# ROADMAP — Lernzeit (Next 20 Games + 20 Features)

_Stand 2026-09-24. Reaktion auf: „Spiele zu einfach (wo ist die Sonne), Tochter ist 4,5 — wir reden über komplexere Dinge."_

## Grundproblem & Prinzip

Die aktuellen MVP-Spiele sind **Wiedererkennen** (tippe das richtige Bild) = Kleinkind-Niveau.
Echtes Training für 4,5 J. mit Arbeitsgedächtnis-/Sprachförderung braucht **Manipulation & Belastung**:
- Nicht „merke dir 3 Bilder" → sondern **rückwärts** wiedergeben, **aktualisieren**, **mehrere Schritte** halten.
- Nicht „tippe die Sonne" → sondern **Laute verschmelzen**, **Reime**, **Minimalpaare unterscheiden**, **Sätze bauen**.
- **Schwierigkeit ist kontinuierlich & adaptiv**, nicht 4 feste Stufen. Die Engine kalibriert pro Fähigkeit auf ~75–85 % Erfolg (Lernzone).

---

## Die 20 Spiele (nach Baubarkeit × Nutzen)

### 🧠 Arbeitsgedächtnis & Aufmerksamkeit
1. **Rückwärts-Merken** — 3–6 Wörter/Zahlen hören, in *umgekehrter* Reihenfolge wiedergeben. (Manipulation = echtes WM.) Skaliert über Länge.
2. **Was fehlt / Was ist neu?** — 4–8 Objekte, eins verschwindet/ändert sich → finden. Visuelles WM.
3. **Folge der Anweisung** — „Tipp erst den Hund, dann das *rote* Auto, dann die Blume." 1→4 Schritte. WM + rezeptive Sprache (Token-Test-Prinzip).
4. **Tablett merken (Kim-Spiel)** — Tablett einprägen, verdeckt, danach nachlegen/benennen.
5. **Tier davor (1-/2-back)** — Bilderstrom, „war das gleiche wie davor?" WM-Updating.
6. **Rhythmus nachklopfen** — Klopfmuster hören, nachtippen. Auditive Sequenzierung + WM.

### 👂 Phonologie & auditive Verarbeitung (ihr Kernthema)
7. **Laute verschmelzen (Lautsynthese)** — /m/–/au/–/s/ → „Maus". Vorläufer des Lesens, direkt auditiv. **Hoher Wert.**
8. **Reim-Paare** — „Reimt sich Haus auf Maus?" Reimbewusstsein.
9. **Silben klatschen** — „Ba-na-ne" = 3. Segmentierung.
10. **Anlaut/Auslaut/Inlaut-Detektiv** — Lautposition (Ausbau des jetzigen Spiels, + Mitte).
11. **Laut wegnehmen** — „Maus" ohne /m/ = „aus". Fortgeschrittene Lautmanipulation.
12. **Minimalpaare unterscheiden** — Tasse/Kasse, Nagel/Nadel. Trifft die Audiva-Schwäche exakt.
13. **Wort im Geräusch (Figur-Grund)** — Zielwort über leisem Hintergrund erkennen. Auditive Verarbeitung.

### 🗣️ Semantik, Ausdruck & Grammatik
14. **Oberbegriffe/Kategorien** — Apfel + Banane → Obst; „was passt nicht dazu?" (nach Kategorie, nicht Form).
15. **Gegenteile** — groß/klein, heiß/kalt, auf/zu.
16. **Satz bauen** — durcheinandergewürfelte Wörter ordnen; Plural & Verbformen. Grammatik.
17. **Erzähl das Bild** — Kind beschreibt ein Bild frei, AI bewertet Inhalt/Länge. (Braucht STT + AI-Scoring.) Ausdruck.
18. **Schnell benennen (Wortfindung)** — „Nenne so viele Tiere wie du kannst in 20 s." Wortabruf-Flüssigkeit.
19. **Geschichte hören → Fragen** — 3-Satz-Geschichte, dann „Wer? Was zuerst?" WM + Sprachverständnis.

### 🔢 Zahlen & Logik
20. **Mengen-Blitz + Mehr/Weniger + Plus/Minus mit Objekten** — Subitizing (Menge ohne Zählen bis 5), Vergleich, erstes Rechnen. Numerik.

---

## Die 20 Features (Plattform, nach Priorität)

**Sofort-Hebel (lösen die aktuellen Beschwerden):**
1. **Adaptive-Difficulty-Engine** — kontinuierliche Schwierigkeit pro Fähigkeit, hält 75–85 % Erfolg. Löst „zu einfach".
2. **Echte neuronale Stimme** — TTS-Clips vorgeneriert (fester Wortschatz) → menschlich, offline, iPad-tauglich.
3. **Cloud-STT (Whisper)** — Mikro funktioniert auch auf iPad; echte Sprachbewertung. Braucht API-Key.
4. **Fehler-/Muster-Erkennung** — erkennt *wo* das Kind hängt (z. B. bestimmte Laute) und meldet es.
5. **AI-Sprachbewertung** — bewertet Aussprache/Antwort-Qualität (0–1), nicht nur richtig/falsch.

**Der Moat:**
6. **Stufe-3 Real-World-Aufgaben** — Kind bittet Eltern um etwas / handelt im Alltag, AI hört zu & bewertet Outcome.

**Produkt/Bindung:**
7. **Adaptive Wiederholung (Spaced Repetition)** — schwache Items im optimalen Abstand zurückbringen.
8. **Freispiel-Welt / Reise-Karte** — Level, Sammelobjekte, Avatar (Ausbau der Unlock-Mechanik).
9. **Story-World / roter Faden** — narrative Klammer statt zusammenhangloser Minispiele.
10. **Session-Limits & gesunde Dosierung** — Eltern setzen Zeitkappe.

**Eltern & Klinik:**
11. **Volle Eltern-Anamnese** — Fragebogen, der Inhalte & Startlevel steuert.
12. **Baseline-Screening** — Startniveau pro Fähigkeit beim ersten Mal messen.
13. **Tiefes Eltern-Dashboard** — Trends pro Fähigkeit über Zeit.
14. **Wochen-Report (PDF/E-Mail)** — „Diese Woche: +12 % bei Anlauten."
15. **Therapeuten-/Logopäden-Modus** — Fortschritt teilen, Übungen zuweisen.
16. **Mehrere Kinder-Profile.**

**Fundament:**
17. **Datenschutz-/Einwilligungs-Flow (GDPR-K)** — bevor irgendein Audio das Gerät verlässt. Nicht optional.
18. **Offline-Audio-Packs** — läuft ohne Internet.
19. **Barrierefreiheit** — große Ziele, farbsichere Palette, Hinweise/Hilfen, Linkshänder.
20. **Native App (Expo → TestFlight)** — echtes iPad-Icon, on-device-Tempo, App Store.

---

## Empfohlene Reihenfolge (was ich zuerst bauen würde)

1. **Adaptive-Engine + 5–6 der „schweren" Spiele** (Rückwärts-Merken, Laute verschmelzen, Folge-der-Anweisung, Minimalpaare, Reime, Was-fehlt) → beseitigt sofort das „zu einfach".
2. **API-Key holen → echte Stimme + iPad-Mikro** (Feature 2+3) → das interaktive Element wird real.
3. **Fehler-Muster-Erkennung + AI-Sprachbewertung** (4+5) → aus Spielerei wird gezieltes Training.
4. **Stufe-3 Real-World** (6) → der eigentliche Moat.
5. Danach Eltern-Analytics, Story-World, native App.
