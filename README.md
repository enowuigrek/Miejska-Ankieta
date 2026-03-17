<p align="center">
  <img src="https://img.shields.io/badge/LIVE-jakmyslisz.com-brightgreen" />
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
**Live URL:** https://jakmyslisz.com/

### 👉 [Live Demo — jakmyslisz.com/demo](https://jakmyslisz.com/demo)

The demo gives full access to the admin panel with realistic mock data — no login required.
From the demo you can also preview the full voting flow:

- **Admin panel:** https://jakmyslisz.com/demo
- **Example question (voting flow):** https://jakmyslisz.com/demo/pytanie/pomidorowa
- **Another one:** https://jakmyslisz.com/demo/pytanie/symulacja

> The real experience starts with scanning a physical QR sticker placed in the city.
> Demo data is example-only — nothing is saved.

---

<p align="center">
  <img src="public/photo_1.jpeg" alt="jakmyślisz stickers in the wild" width="420" />
  <br/>
  <em>Stickers on a bridge railing in Częstochowa</em>
</p>

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
