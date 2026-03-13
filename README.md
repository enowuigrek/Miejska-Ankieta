<p align="center">
  <img src="https://img.shields.io/badge/LIVE-miejska--ankieta.czest.pl-brightgreen" />
  <img src="https://img.shields.io/badge/domain-jakmyslisz.com-blue" />
  <img src="https://img.shields.io/badge/React-18-blue" />
  <img src="https://img.shields.io/badge/Vite-7.0-purple" />
  <img src="https://img.shields.io/badge/Firebase-yellow" />
  <img src="https://img.shields.io/badge/Sass-pink" />
  <img src="https://img.shields.io/badge/Hosted-Netlify-teal" />
</p>

# jakmyślisz?

**A street art survey project — QR code stickers placed around the city, anonymous voting, live results.**

jakmyślisz is a social experiment running in Częstochowa, Poland. Stickers with questions and QR codes appear in public spaces — residents scan, vote anonymously, and instantly see what others think.

The goal is to spark reflection, conversation, and curiosity about everyday topics — directly on the street.

---

## 🚀 Status & Demo

**Status:** Live
**Live URL:** https://miejska-ankieta.czest.pl/ *(moving to jakmyslisz.com)*

> The full experience requires scanning a physical QR sticker in the city.
> Questions are also accessible directly via URL.

### Example questions

- https://miejska-ankieta.czest.pl/kawa
- https://miejska-ankieta.czest.pl/pomidorowa

---

## ✨ Features

- Anonymous voting via QR codes
- Location tracking per scan (`?loc=rynek`)
- Duplicate vote prevention (localStorage)
- Bar chart results shown after voting
- Random fun fact after each vote
- Automatic night mode (10 PM – 6 AM)
- Admin panel with live stats and scan→vote conversion rate
- Mobile-first, no registration required

---

## 🛠 Tech Stack

- React 18 + Vite
- Firebase Firestore
- SCSS
- React Router DOM
- Netlify (auto-deploy from GitHub)

---

## 📁 Project Structure

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

## 👤 Author

Łukasz Nowak
GitHub: https://github.com/enowuigrek

---

## 📄 License

MIT
