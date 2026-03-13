<p align="center">
  <img src="https://img.shields.io/badge/LIVE-jakmyslisz.com-brightgreen" />
  <img src="https://img.shields.io/badge/React-18-blue" />
  <img src="https://img.shields.io/badge/Vite-7.0-purple" />
  <img src="https://img.shields.io/badge/Firebase-yellow" />
  <img src="https://img.shields.io/badge/Sass-pink" />
  <img src="https://img.shields.io/badge/Hosted-Netlify-teal" />
</p>

# jakmyślisz?

**Streetartowy projekt ankietowy — naklejki z kodami QR rozklejane po mieście, anonimowe głosowanie, wyniki na żywo.**

jakmyślisz to eksperyment społeczny działający w Częstochowie. Naklejki z pytaniami i kodami QR pojawiają się w przestrzeni miejskiej — mieszkańcy skanują, odpowiadają anonimowo i od razu widzą co myślą inni.

Cel: wywoływać refleksję, rozmowę i ciekawość o codziennych sprawach — bezpośrednio na ulicy.

---

## 🚀 Status & Demo

**Status:** Live
**Demo:** https://miejska-ankieta.czest.pl/ *(docelowo: jakmyslisz.com)*

> Pełne doświadczenie wymaga zeskanowania fizycznej naklejki QR w mieście.
> Pytania dostępne są też bezpośrednio przez URL.

### Przykładowe pytania

- https://miejska-ankieta.czest.pl/kawa
- https://miejska-ankieta.czest.pl/pomidorowa

---

## ✨ Funkcje

- Anonimowe głosowanie przez kod QR
- Śledzenie skanów per lokalizacja (`?loc=rynek`)
- Blokada wielokrotnego głosowania (localStorage)
- Wyniki jako wykresy słupkowe po zagłosowaniu
- Losowa ciekawostka po każdym głosowaniu
- Automatyczny tryb nocny (22:00–06:00)
- Panel admina z live statystykami i konwersją skan→głos
- Mobile-first, zero rejestracji

---

## 🛠 Tech Stack

- React 18 + Vite
- Firebase Firestore
- SCSS
- React Router DOM
- Netlify (auto-deploy z GitHub)

---

## 📁 Struktura projektu

```bash
src/
  components/   # Question, Home, AdminPanel, ...
  data/         # questionsData.js, factsData.js
  App.jsx
  App.scss
public/
  favicon.svg
```

---

## 👤 Autor

Łukasz Nowak
GitHub: https://github.com/enowuigrek

---

## 📄 Licencja

MIT
