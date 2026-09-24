# Konzept — Lern-App für Arbeitsgedächtnis & Sprache (Arbeitstitel: „Lernzeit")

_Fokus-Version. Entstanden aus der Diskussion am 2026-09-24. Ersetzt die frühere „alles auf einmal"-Idee._

## 1. Fokus (bewusst eng)

**Primär:** Arbeitsgedächtnis + Sprachentwicklung — für Kinder wie Max' Tochter (4 Jahre, Sprachentwicklungsstörung, schwaches Arbeitsgedächtnis, Hinweis auf Schwäche in der auditiven Verarbeitung / Audiva-Test).

**Sekundär (leichte Dosis, altersgerecht für 4 J.):** erste Elemente von Lesen (Laut↔Buchstabe), Schreiben (später), Rechnen (Zählen 1–5). Lesen/Laute stützen bewusst das **auditive** Element.

**Nicht MVP:** Bestenlisten, große Gamification-Ökonomie, Ultraschall-Vision, generische „Grundschule-für-alle"-Inhalte. Kommt später oder gar nicht.

## 2. Der Wedge (warum das neu ist)

Der verteidigbare Kern ist **nicht** der Lerninhalt (den machen ANTON, Khan Kids etc. schon), sondern das **interaktive AI-Element**: Die App **hört zu** und **bewertet den Outcome** — nicht nur Tippen, sondern Sprechen und schließlich echte Handlungen mit Menschen um das Kind herum.

## 3. Interaktionsstufen (Produkt-Roadmap = eskalierende Interaktion)

| Stufe | Interaktion | Was die AI tut | Status |
|-------|-------------|----------------|--------|
| **1 — Tippen** | Kind tippt auf Bildschirm | TTS-Anweisung + Bewertung richtig/falsch | ✅ MVP |
| **2 — Sprechen** | Kind spricht ins Mikrofon | Spracherkennung (DE) hört zu, bewertet Aussprache/Antwort | ✅ MVP (Web) |
| **3 — Real-World** | Kind bittet Eltern um etwas / führt Aufgabe im echten Leben aus | AI hört das Gespräch, bewertet ob Aufgabe erfüllt | 🔜 Konzept |
| **4 — Multimodal** | Gestik, Schreibtests, Zeichnen | Kamera/Touch-Erkennung | später |

**Max' Auftrag heute:** die ersten Stufen (1 + erster Teil von 2) als lauffähige einfache App.

## 4. Spiele im MVP (auf Fokus zugeschnitten)

**Arbeitsgedächtnis**
- **Merk-die-Reihe** — Tiere leuchten nacheinander mit Ton auf, Kind tippt sie in gleicher Reihenfolge nach. Länge passt sich adaptiv an (Corsi-/Sequenz-Prinzip). Kern-Gedächtnistrainer.

**Auditive Verarbeitung / Sprache (Stufe 1, hören→tippen)**
- **Hör genau hin** — Wort wird gesprochen, Kind tippt das passende Bild aus 2–3. Trifft direkt die auditive Verarbeitungsschwäche.

**Sprachentwicklung (Stufe 2, Mikrofon)**
- **Sprich nach** — App sagt ein Wort, Kind spricht es nach, Spracherkennung bewertet (Fuzzy-Match).
- **Was ist das?** — Bild erscheint, Kind benennt es laut, Mikrofon prüft. Trainiert expressive Sprache.

**Leichte Beigabe (Lesen/Rechnen)**
- **Welcher Laut?** — Laut wird gesprochen (/m/), Kind tippt den Buchstaben. Laut↔Buchstabe, stützt Lesen + Hören.
- **Zähl mit** — 1–5 zählen, Objekte antippen.

Jedes Spiel: kurze gesprochene Erklärung + Demo, große Tipp-Ziele, Ton bei jeder Interaktion, sanftes Feedback bei Fehlern, kurze Sessions.

## 5. Komponenten (Architektur)

1. **Eltern-Onboarding** — Kurz-Fragebogen: Name, Alter, Fokus-Fähigkeit(en). (Später: volle Anamnese.)
2. **Screening/Baseline** — erste Messung pro Fähigkeit (im MVP implizit über Startlevel).
3. **Adaptive Content Engine** — wählt Level nach Leistung (Streak → schwerer, Fehler → leichter).
4. **AI-Interaktions-Layer** — TTS (Ausgabe) + Spracherkennung (Eingabe). Später: Outcome-Bewertung echter Handlungen.
5. **Gamification-Layer** — Sterne/Belohnung pro Session (schlicht, kein Suchtdesign).
6. **Eltern-Dashboard** — Fortschritt & Genauigkeit pro Fähigkeit, Session-Verlauf.
7. **Privacy-Layer** — ⚠️ existenziell. Kinder-Audio = GDPR-K/COPPA. MVP: Verarbeitung lokal im Browser (Web Speech), **keine** Audio-Speicherung, keine Cloud. Muss so bleiben, bis eine saubere Einwilligungs-/Datenarchitektur steht.

## 6. Regulatorik (früh mitdenken)

- **Nicht** als Diagnose/Therapie framen → sonst Medizinprodukt (EU MDR). MVP-Sprache: „Übung" & „Hinweis/Indikator", nie „Diagnose".
- Klinischer Weg (mit Logopäd:innen) ist möglich — aber bewusste Entscheidung, kein Dazwischen.
- Kein „highly addictive"-Framing nach außen. Nach außen: gesund, elternkontrolliert.

## 7. MVP-Scope (was heute gebaut wird)

Eine **eigenständige Web-App** (`web-mvp/index.html`), sofort in Chrome (iPad/Laptop) lauffähig:
- Eltern-Onboarding (Name + Fokus)
- Stufe 1: Merk-die-Reihe, Hör genau hin, Welcher Laut?, Zähl mit
- Stufe 2: Sprich nach, Was ist das? (Web Speech Recognition, DE; graceful fallback wenn Mikro/Erkennung fehlt)
- Adaptive Level + Session-Log (localStorage) + Eltern-Zusammenfassung

Warum Web zuerst: Das AI-Zuhören läuft **heute** ohne native Builds/API-Keys. Die Expo-App (13 Screens, Tippen-only) bleibt die spätere App-Store-Hülle; diese Logik wird dort eingezogen, sobald der Loop validiert ist.

## 8. Nächste Schritte nach MVP

1. Mit der Tochter testen — funktioniert der Sprech-Loop? Findet sie's gut?
2. Stufe 3 prototypen (Real-World-Aufgabe + Outcome-Bewertung) — der eigentliche Moat.
3. Volle Anamnese + Baseline-Screening.
4. Datenschutz-/Einwilligungsarchitektur, bevor irgendein Audio die Maschine verlässt.
