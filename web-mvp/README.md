# Web-MVP — Lernzeit (Interaktionsstufen 1 + 2)

Sofort lauffähige Version. **Kein Build, keine Installation.**

## Öffnen
- **Am Laptop:** `index.html` in **Chrome** doppelklicken (oder öffnen).
- **Am iPad/Handy:** Datei auf ein kleines Web-Hosting legen ODER lokal servern:
  ```bash
  cd kidsgame/web-mvp
  python3 -m http.server 8080
  ```
  Dann am iPad im **Chrome/Safari** `http://<laptop-ip>:8080` öffnen (gleiches WLAN).

> **Mikrofon (Sprich nach / Was ist das?)** braucht **Chrome** und eine Erlaubnis-Freigabe.
> Über `http://` funktioniert das Mikro nur auf `localhost`; für iPad-Zugriff später via `https://` hosten.
> Ohne Mikro laufen die Sprech-Spiele mit Eltern-Tipp-Fallback (✅ Geschafft / 🔁 Nochmal) weiter.

## Was drin ist
- **Eltern-Onboarding** (Name + Fokus-Fähigkeiten) — einmalig, in `localStorage`.
- **Stufe 1 (Tippen):** Merk die Reihe (Arbeitsgedächtnis), Hör genau hin (auditive Verarbeitung), Welcher Laut? (Lesen), Zähl mit (Rechnen).
- **Stufe 2 (Sprechen):** Sprich nach, Was ist das? — Spracherkennung (DE), lokal, Fuzzy-Match.
- **Adaptive Level** (3 richtig in Folge → schwerer), **Sterne**, **Eltern-Dashboard** (Genauigkeit pro Fähigkeit).

## Datenschutz
Audio wird nur im Browser verarbeitet (Web Speech API). **Nichts wird gespeichert oder gesendet.** Fortschritt liegt lokal im `localStorage`.

Konzept & Roadmap: siehe `../CONCEPT.md`.
