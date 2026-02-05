# Checklist Weryfikacji Po Refaktoryzacji

## 🔍 Sprawdź Przed Uruchomieniem

### 1. Instalacja Zależności
```bash
npm install
```

### 2. Zmienne Środowiskowe
- [ ] Sprawdź czy `.env.local` istnieje
- [ ] Upewnij się, że wszystkie Firebase credentials są poprawne:
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_STORAGE_BUCKET`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - `VITE_FIREBASE_APP_ID`
  - `VITE_FIREBASE_MEASUREMENT_ID`

### 3. Build Test
```bash
npm run build
```
Powinno się zbudować bez błędów.

### 4. Dev Server
```bash
npm run dev
```

## ✅ Testy Manualne

### Strona Główna (/)
- [ ] Logo wyświetla się poprawnie
- [ ] Ikony social media są klikalne
- [ ] Tryb nocny działa (zmień godzinę systemową na 22:00+)
- [ ] Linki prowadzą do właściwych social media

### Pytanie (/:questionId)
- [ ] Pytanie się wyświetla
- [ ] Można wybrać odpowiedź (checkbox z ikoną check)
- [ ] Przycisk "Odpowiedz" działa
- [ ] Po kliknięciu przechodzi do /fact
- [ ] Odpowiedź zapisuje się w Firebase

### Ciekawostka (/fact)
- [ ] Losowa ciekawostka się wyświetla
- [ ] Ta sama ciekawostka zostaje po odświeżeniu (sessionStorage)
- [ ] Przycisk strzałki prowadzi do /social_media

### Social Media Page (/social_media)
- [ ] Powitanie odpowiednie dla dnia tygodnia
- [ ] Ikony social media działają
- [ ] Styling jest poprawny

### Admin Panel (/admin)
- [ ] Dashboard się ładuje
- [ ] Statystyki się wyświetlają poprawnie
- [ ] Przycisk "Odśwież" działa
- [ ] Filtrowanie pytań działa
- [ ] Karty pytań z odpowiedziami wyświetlają się
- [ ] Progress bary pokazują prawidłowe wartości

### 404 Page
- [ ] Wpisz niepoprawny URL - powinien przekierować do /404
- [ ] Strona 404 wyświetla się poprawnie

## 🐛 Sprawdź Console

### Powinno NIE być:
- ❌ PropTypes warnings
- ❌ React warnings o key props
- ❌ Firebase errors (jeśli env jest poprawnie skonfigurowane)

### Może być:
- ✅ "Document written with ID: ..." - to OK, to znaczy że zapis działa

## 📊 Sprawdź Firebase Console

1. Wejdź do Firebase Console
2. Przejdź do Firestore Database
3. Sprawdź kolekcję "answers"
4. Po wysłaniu odpowiedzi w aplikacji, powinien pojawić się nowy dokument

## 🎨 Sprawdź Style

### Tryb Dzienny (6:00 - 21:59)
- [ ] Logo jest szare
- [ ] Tło jasne
- [ ] Tekst ciemny

### Tryb Nocny (22:00 - 5:59)
- [ ] Logo jest białe
- [ ] Tło ciemne
- [ ] Tekst jasny

## 📁 Sprawdź Nowe Pliki

### Powinny Istnieć:
- [ ] `src/components/SocialMediaIcons.jsx`
- [ ] `src/components/SocialMediaIcons.scss`
- [ ] `src/components/admin/StatCard.jsx`
- [ ] `src/components/admin/StatCard.scss`
- [ ] `src/components/admin/QuestionCard.jsx`
- [ ] `src/components/admin/QuestionCard.scss`
- [ ] `src/constants/socialMedia.js`
- [ ] `src/utils/greetings.js`
- [ ] `src/utils/statsCalculator.js`
- [ ] `src/hooks/useNightMode.js`
- [ ] `REFACTORING_NOTES.md`
- [ ] `QUICK_REFERENCE.md`
- [ ] `CHECKLIST.md`

### Powinny BYĆ USUNIĘTE:
- [ ] ~~`src/App.js`~~ (używamy App.jsx)
- [ ] ~~`src/index.js`~~ (używamy main.jsx)

## 🔧 Jeśli Coś Nie Działa

### Import Errors
Sprawdź czy ścieżki importów są poprawne:
```jsx
// Powinno być:
import SocialMediaIcons from './SocialMediaIcons';
// A nie:
import SocialMediaIcons from '../SocialMediaIcons';
```

### PropTypes Warnings
Upewnij się że każdy komponent ma PropTypes:
```jsx
ComponentName.propTypes = {
    isNight: PropTypes.bool.isRequired
};
```

### Firebase Errors
1. Sprawdź `.env.local`
2. Sprawdź Firebase Console czy projekt jest aktywny
3. Sprawdź Firebase Rules

### Build Errors
```bash
# Wyczyść cache
rm -rf node_modules
rm package-lock.json
npm install

# Spróbuj ponownie
npm run build
```

## ✨ Po Weryfikacji

Jeśli wszystko działa:
1. ✅ Commit changes
2. ✅ Push do repo
3. ✅ Deploy na Netlify/Vercel

---

**Checklist Version**: 1.0
**Created**: 2025-12-02

## 📝 Notatki

Miejsce na Twoje notatki podczas testowania:

```
[Data testowania]:

[Problemy znalezione]:

[Poprawki wykonane]:

```
