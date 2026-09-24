# Web-App — Lernzeit (25 Spiele, adaptiv)

Sofort lauffähig. **Kein Build, keine Installation.** Modulare Vanilla-JS-App.

## Live
- **Landing/Spielen:** https://dribel792.github.io/kidsgame/web-mvp/spielen.html
- **Direkt App:** https://dribel792.github.io/kidsgame/web-mvp/index.html

## Lokal öffnen
- **Laptop:** `index.html` in **Chrome** öffnen (Mikro nur über HTTPS oder localhost).
- **Server:** `python3 -m http.server 8080` → `http://localhost:8080/spielen.html`

> **Mikrofon** (Sprech-Spiele) braucht Chrome + HTTPS/localhost. iPad-Safari kann die Browser-Spracherkennung nicht → dort greift der Eltern-Tipp-Fallback (echtes iPad-Mikro kommt mit Cloud-STT, s. ROADMAP).

## Struktur
```
web-mvp/
├── index.html        Shell + Screens
├── styles.css
└── js/
    ├── content.js    Wortbank, Minimalpaare, Gegenteile, Geschichten, Real-World-Aufgaben
    ├── core.js       State, Profile, adaptive Engine, Spaced Repetition, Fehler-Tracking, TTS/STT, Session-Timer
    ├── games.js      alle 25 Spiele
    └── ui.js         Onboarding, Freispiel-Welt, Spiel-Engine, Eltern-Dashboard
```

## Was drin ist
- **25 Spiele** über 5 Fähigkeiten (Gedächtnis, Laute/Lesen, Hören, Sprache, Rechnen) — von einfach bis fordernd.
- **Adaptive Schwierigkeit** pro Fähigkeit (wächst automatisch mit, Ziel ~75 % Erfolg).
- **Freispielen**: Spiele schalten nach Sternen frei (Unlock-Welt).
- **Spaced Repetition** + **Fehler-Muster-Erkennung**.
- **Eltern-Dashboard**: Level & Genauigkeit pro Fähigkeit, Stolpersteine, Übungsschwerpunkt.
- **Mehrere Kinder-Profile**, **Session-Limit**, **Stufe-3-Real-World-Aufgaben**.

## Datenschutz
Audio nur lokal im Browser. Nichts gespeichert/gesendet. Fortschritt im `localStorage`.

Konzept: `../CONCEPT.md` · Roadmap & Build-Status: `../ROADMAP.md`.
