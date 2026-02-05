# Szybki Przewodnik - Miejska Ankieta

## 🚀 Najważniejsze Zmiany Po Refaktoryzacji

### Nowe Komponenty
```jsx
// Social Media Icons - użyj zamiast kopiować kod
import SocialMediaIcons from './components/SocialMediaIcons';
<SocialMediaIcons isNight={isNight} variant="home" />

// Admin komponenty
import StatCard from './components/admin/StatCard';
import QuestionCard from './components/admin/QuestionCard';
```

### Nowe Utils
```javascript
// Powitania według dnia
import { getGreetingByDay } from './utils/greetings';
const greeting = getGreetingByDay();

// Generowanie statystyk
import { generateStats } from './utils/statsCalculator';
const stats = generateStats(answersData);
```

### Stałe
```javascript
// Linki social media
import { SOCIAL_MEDIA_LINKS } from './constants/socialMedia';
console.log(SOCIAL_MEDIA_LINKS.instagram);
```

### Custom Hooks
```javascript
// Night mode (jeszcze nie używany w App.jsx)
import { useNightMode } from './hooks/useNightMode';
const isNight = useNightMode();
```

## 📁 Gdzie Co Jest

### Komponenty
- `components/` - główne komponenty stron
- `components/admin/` - komponenty dla AdminPanel

### Logika
- `utils/` - funkcje pomocnicze
- `hooks/` - custom React hooks
- `constants/` - stałe i konfiguracja

### Dane
- `data/questionsData.js` - pytania ankiety
- `data/factsData.js` - ciekawostki

## ✅ Checklist Przed Dodaniem Nowego Komponentu

1. ✅ Dodaj PropTypes
2. ✅ Sprawdź czy nie duplikujesz kodu (może jest już util/komponent?)
3. ✅ Użyj stałych z `constants/` zamiast hardcodować
4. ✅ Wydziel logikę do `utils/` jeśli się powtarza
5. ✅ Dodaj aria-labels dla accessibility

## 🐛 Znane TODO

- [ ] Usunąć console.log z Question.jsx:48
- [ ] Dodać autentykację do AdminPanel
- [ ] Użyć useNightMode hook w App.jsx
- [ ] Dodać testy jednostkowe
- [ ] Poprawić keyboard navigation

## 📦 Komendy

```bash
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
npm run export       # Export data (custom script)
npm run stats        # Show stats (custom script)
```

## 🎨 Style Guide

- Używaj `PropTypes` dla wszystkich komponentów
- Nazwy komponentów: PascalCase
- Nazwy plików: PascalCase dla komponentów, camelCase dla utils
- Używaj arrow functions dla komponentów funkcyjnych
- Dodaj `aria-label` do interaktywnych elementów

---
**Quick Ref Version**: 1.0
**Last Updated**: 2025-12-02
