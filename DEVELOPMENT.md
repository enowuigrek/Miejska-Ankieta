# Miejska Ankieta - Development Documentation

## 🎯 Cel projektu
Interaktywny system ankiet miejskich dla mieszkańców **Częstochowy** (z potencjalną ekspansją na **Warszawę**) oparty na kodach QR, z anonimowym zbieraniem odpowiedzi, bazą ciekawych faktów i integracją z mediami społecznościowymi.

**Status:** For fun + portfolio project z potencjałem na community engagement

## ✅ AKTUALNY STAN

### 🎉 **SYSTEM W PRODUKCJI:**
- **Live survey platform:** http://miejska-ankieta.czest.pl ✅ **DZIAŁAJĄCY SYSTEM**
- **QR code deployment:** Fizyczne naklejki rozmieszczone w Częstochowie ✅
- **Anonymous data collection:** Anonimowe odpowiedzi zapisywane w Firebase ✅
- **Social media presence:** Instagram, Facebook, Twitter aktywne ✅
- **Fun facts system:** 29 ciekawych faktów po każdej ankiecie ✅
- **Multi-question support:** 15+ różnorodnych pytań ✅
- **Mobile optimization:** Zoptymalizowane pod skanowanie QR kodów ✅

### 🔧 **TECHNICZNE PODSTAWY:**
- **Setup techniczny:** Create React App + SCSS + Firebase ✅
- **Hosting:** Netlify z własną subdomeną ✅
- **Deployment:** CI/CD pipeline działający ✅
- **System ankiet:** Pełna funkcjonalność survey platform ✅
- **Integracja z bazą danych:** Firebase Firestore ✅
- **Responsywny design:** Mobile-first approach ✅
- **Day/night theme:** Time-based UI switching ✅
- **Social media integration:** Linki do wszystkich platform ✅

### **🔧 Tech stack:**
```json
{
  "frontend": "React 18 + Vite ✅ COMPLETED",
  "styling": "SCSS/Sass", 
  "database": "Firebase Firestore",
  "icons": "FontAwesome",
  "routing": "React Router DOM",
  "language": "JavaScript/JSX"
}
```

## 🏗️ **AKTUALNA STRUKTURA PROJEKTU**

```
src/
├── components/
│   ├── Fact.jsx (wyświetlanie ciekawych faktów)
│   ├── Home.jsx (strona główna z instrukcjami)
│   ├── Question.jsx (interfejs pytań ankiety - 150+ linii - DO REFAKTORYZACJI)
│   ├── PageNotFound.jsx (strona błędu 404)
│   └── SocialMediaPage.jsx (finalna strona z social media)
├── assets/
│   └── images/
│       ├── logo_red.svg (główne logo marki)
│       └── favicon.ico (ikona strony)
├── data/
│   ├── questionsData.js (baza pytań ankietowych)
│   └── factsData.js (baza 29 ciekawych faktów)
├── styles/ (SCSS dla każdego komponentu)
│   ├── App.scss
│   ├── Fact.scss
│   ├── Home.scss
│   ├── Question.scss
│   ├── PageNotFound.scss
│   └── SocialMediaPage.scss
├── firebase.js (konfiguracja Firebase - WYMAGA ZABEZPIECZENIA)
└── App.js (główny router aplikacji)
```

## 🎯 **Current Features**

### 1. **QR Survey System** ⭐
- **Physical QR deployment** - naklejki w różnych lokalizacjach Częstochowy
- **Dynamic question routing** - każde pytanie ma unikalny URL
- **Anonymous responses** - brak zbierania danych osobowych
- **Real-time storage** - odpowiedzi zapisywane w Firebase Firestore
- **Mobile-first design** - zoptymalizowane pod smartfony

### 2. **Baza pytań** ⭐
**Przykłady pytań w systemie:**
- "Koty czy psy?" (`zwierzeta`)
- "Pizza z ananasem" (`pizza_ananas`)
- "Pomidorowa" - z ryżem czy makaronem (`pomidorowa`)
- "Gram na" - PC/PlayStation/Xbox/telefonie (`gaming`)
- "Książka" - papier/e-book/audiobook (`ksiazka`)
- "Majonez" - Kielecki/Winiary/Helmans (`majonez`)
- "IPA" - za gorzkie/uwielbiam/drogie (`ipa`)

### 3. **System ciekawych faktów** ⭐
- **29 ciekawych faktów** - edukacyjna zawartość po ankiecie
- **Losowy wybór** - różny fakt przy każdej odpowiedzi
- **Różnorodne tematy** - nauka, przyroda, technologia, ciekawostki
- **SessionStorage** - unikalne fakty w sesji

### 4. **Integracja social media** ⭐
- **Instagram:** @miejska_ankieta
- **Facebook:** miejska.ankieta
- **Twitter:** @miejska_ankieta
- **Udostępnianie wyników** - wyniki publikowane na social media
- **Budowanie społeczności** - budowanie społeczności wokół ankiet

## 📊 **Survey Flow & User Journey**

### **Proces ankietowania:**
1. **Discovery** - znalezienie naklejki QR w mieście
2. **Scan** - zeskanowanie kodu aparatem telefonu
3. **Navigate** - przekierowanie na konkretne pytanie (np. /pizza_ananas)
4. **Answer** - wybór jednej z opcji (radio buttons)
5. **Submit** - wysłanie anonimowej odpowiedzi do Firebase
6. **Fact** - wyświetlenie losowego ciekawego faktu
7. **Social** - zachęta do obserwowania social media dla wyników

### **Struktura danych (obecna):**
```javascript
// Firebase document structure:
{
  questionId: "pizza_ananas",
  answer: "tak, bardzo lubię",
  timestamp: "2025-07-31T10:30:00.000Z"
}
```

### **Struktura danych (planowana z integracją QRfy):**
```javascript
// Przyszła struktura z location tracking:
{
  questionId: "pizza_ananas",
  answer: "tak, bardzo lubię",
  location: "rynek", // NOWE - z integracji QRfy
  scanSource: "qrfy", // NOWE
  timestamp: "2025-07-31T10:30:00.000Z"
}
```

## 🛠️ Development setup

```bash
npm install
npm run dev           # ✅ VITE - http://localhost:3000 (szybki hot reload)
npm run build         # Production build
npm run export        # Export data from Firebase (node export.js)
npm run stats         # Generate statistics (node stats.js)
```

**Live Website:** http://miejska-ankieta.czest.pl ✅ **ACTIVE SURVEY PLATFORM**

---

## 🚀 **TODO - PLAN ROZWOJU - SZCZEGÓŁOWA ROADMAPA**

### **🎯 GŁÓWNE CELE:**
- **Modernizacja techniczna** - lepszy developer experience
- **Bezpieczeństwo** - zabezpieczenie Firebase config
- **Code quality** - podział na mniejsze komponenty
- **Fun factor** - zachowanie zabawy przy dodawaniu nowych funkcji
- **Portfolio value** - pokazanie umiejętności full-stack development

### **🎯 PROJECT PHILOSOPHY:**
- **For fun + portfolio** - główny cel to zabawa i nauka
- **Community engagement** - prawdziwa wartość dla mieszkańców
- **No pressure monetization** - ewentualne zarabianie w przyszłości
- **Multi-city potential** - Częstochowa + Warszawa expansion

---

## 🚀 **ETAP 1: FUNDAMENTY - MIGRACJA NA VITE ✅ ZAKOŃCZONY**

### **📋 Cel:** Migracja z Create React App na Vite
**Status:** ✅ **COMPLETED** - `npm run dev` działa, szybszy hot reload

#### **✅ Wykonane kroki:**
1. **Usunięto CRA dependencies** - react-scripts uninstalled
2. **Zainstalowano Vite** - vite + @vitejs/plugin-react
3. **Utworzono vite.config.js** - configuration with React plugin
4. **Zaktualizowano package.json** - scripts changed to `dev/build/preview`
5. **Przeniesiono index.html** - moved from public/ to root
6. **Poprawiono entry point** - src/index.js → src/main.jsx
7. **Naprawiono SVG imports** - ReactComponent → img src pattern
8. **Zaktualizowano env variables** - process.env → import.meta.env
9. **Zainstalowano SASS** - for SCSS support

**Rezultat:** ⚡ `npm run dev` working, ~3x faster hot reload than CRA

---

## 🔒 **ETAP 2: LOGO DAY/NIGHT MODE (AKTUALNY PRIORYTET)**

### **📋 Cel:** Logo widoczne w trybie nocnym
**Problem:** Czerwone logo (#FF2323) nie jest widoczne na ciemnym tle nocnym

#### **🔧 Rozwiązania do implementacji:**

**Opcja A: CSS Filter (QUICK FIX)**
```css
.app-logo.night {
  filter: brightness(0) invert(1); /* Zamienia na białe */
}
```

**Opcja B: Dwa osobne pliki SVG (RECOMMENDED)**
```
src/assets/images/
├── logo_red.svg (dzień)
└── logo_white.svg (noc)
```

**Opcja C: CSS Variables w SVG**
```css
.app-logo {
  --logo-color: #FF2323; /* dzień */
}
.app-logo.night {
  --logo-color: #FFFFFF; /* noc */
}
```

**Szacowany czas:** 30 minut  
**Rezultat:** Logo widoczne w obu trybach dzień/noc

---

## 🔒 **ETAP 3: BEZPIECZEŃSTWO FIREBASE (PRIORYTET 2)**

### **📋 Cel:** Zabezpieczenie konfiguracji Firebase
**Problem:** Klucze API są hardcoded w `src/firebase.js`

#### **🔧 Kroki zabezpieczania:**
1. **Environment variables** - aktualizuj `.env.local`:
   ```bash
   # Zmień prefix REACT_APP_ → VITE_
   # WAŻNE: Użyj SWOICH prawdziwych kluczy Firebase!
   VITE_FIREBASE_API_KEY=your_firebase_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com  
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

2. **Zaktualizuj firebase.js**:
   ```javascript
   const firebaseConfig = {
     apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
     authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
     projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
     storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
     messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
     appId: import.meta.env.VITE_FIREBASE_APP_ID,
     measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
   };
   ```

3. **Firestore Security Rules**:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /answers/{document} {
         allow write: if request.auth == null && 
           resource == null &&
           request.resource.data.keys().hasAll(['questionId', 'answer', 'timestamp']);
         allow read: if false; // Tylko admin może czytać
       }
     }
   }
   ```

**Szacowany czas:** 1-2 godziny  
**Rezultat:** Bezpieczna konfiguracja, brak wrażliwych danych w repo

---

## 🧩 **ETAP 3: COMPONENT REFACTORING (PRIORYTET 2)**

### **📋 Cel:** Podział Question.jsx (150+ linii) na mniejsze komponenty
**Powód:** Łatwiejsze utrzymanie, dodawanie nowych pytań, testowanie

#### **📁 Docelowa struktura:**
```
src/
├── components/
│   ├── common/
│   │   ├── SocialIcons/
│   │   │   ├── SocialIcons.jsx (reusable - używany w 2 miejscach)
│   │   │   └── SocialIcons.module.scss
│   │   ├── Button/
│   │   │   ├── Button.jsx (reusable button)
│   │   │   └── Button.module.scss
│   │   └── Layout/
│   │       ├── Layout.jsx (wrapper z logo)
│   │       └── Layout.module.scss
│   ├── Question/
│   │   ├── Question.jsx (główny kontener - ~50 linii)
│   │   ├── QuestionHeader.jsx (tytuł + dzień/noc styling)
│   │   ├── QuestionForm.jsx (form logic + validation)
│   │   ├── RadioOption.jsx (pojedyncza opcja z FontAwesome)
│   │   ├── LoadingSpinner.jsx (loading state)
│   │   └── ErrorMessage.jsx (error display)
│   ├── Fact/ (refactoring opcjonalny)
│   └── Home/ (refactoring opcjonalny)
├── hooks/
│   ├── useFirestore.js (Firebase operations + error handling)
│   ├── useTheme.js (day/night logic)
│   └── useLocalStorage.js (localStorage operations)
├── utils/
│   ├── constants.js (social media links, URLs)
│   ├── helpers.js (utility functions)
│   └── validators.js (form validation)
└── context/
    └── ThemeContext.js (global theme state)
```

#### **🔧 Key Components do utworzenia:**

1. **useFirestore Hook** (najważniejszy):
   ```javascript
   export const useFirestore = () => {
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState(null);
     
     const addAnswer = async (questionId, answer, location = 'unknown') => {
       setLoading(true);
       try {
         await addDoc(collection(db, "answers"), {
           questionId,
           answer,
           location, // dla przyszłej QRfy integration
           timestamp: new Date().toISOString()
         });
       } catch (err) {
         setError('Wystąpił błąd. Spróbuj ponownie.');
       } finally {
         setLoading(false);
       }
     };
     
     return { addAnswer, loading, error };
   };
   ```

2. **SocialIcons Component** (eliminuje duplikację):
   ```jsx
   const SocialIcons = ({ size = 'large', className = '' }) => {
     const socialLinks = {
       instagram: 'https://www.instagram.com/miejska_ankieta/',
       facebook: 'https://www.facebook.com/miejska.ankieta',
       twitter: 'https://twitter.com/miejska_ankieta'
     };
     // Render social icons with FontAwesome
   };
   ```

3. **RadioOption Component**:
   ```jsx
   const RadioOption = ({ option, isSelected, onChange, disabled }) => {
     return (
       <label className={`radio-container ${disabled ? 'disabled' : ''}`}>
         <input 
           type="radio" 
           checked={isSelected}
           onChange={() => onChange(option.id)}
           disabled={disabled}
         />
         <FontAwesomeIcon 
           icon={faCheck} 
           className={isSelected ? 'check-icon' : 'check-icon hidden'} 
         />
         <span>{option.label}</span>
       </label>
     );
   };
   ```

**Szacowany czas:** 3-4 dni  
**Rezultat:** Question.jsx: 150+ linii → 6 komponentów po 20-40 linii

---

## ⚡ **ETAP 4: UX IMPROVEMENTS (PRIORYTET 3)**

### **📋 Cel:** Lepszy user experience

#### **🔧 Usprawnienia:**

1. **Loading States & Error Handling**:
   ```jsx
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);
   
   // Button state
   <button disabled={loading || !selectedOption}>
     {loading ? 'Wysyłanie...' : 'Odpowiedz'}
   </button>
   
   // Error display
   {error && <ErrorMessage message={error} />}
   ```

2. **Form Validation**:
   ```javascript
   const validateAnswer = (selectedOption) => {
     if (!selectedOption) {
       setError('Wybierz jedną z opcji przed odpowiedzią.');
       return false;
     }
     return true;
   };
   ```

3. **Better Date Handling**:
   ```javascript
   timestamp: new Date().toISOString() // Zamiast .toLocaleString()
   ```

**Szacowany czas:** 1-2 dni  
**Rezultat:** Lepszy UX, proper error handling

---

## 🌆 **ETAP 5: FUTURE ENHANCEMENTS (OPCJONALNIE)**

### **🔧 QRfy.com Integration** (zapisane lokalnie w osobnym pliku)
- **Location tracking** - różne QR kody per lokalizacja
- **Analytics integration** - statystyki skanowań
- **Multi-city support** - Częstochowa vs Warszawa comparison

### **🎨 Design Improvements**
- **CSS Modules** migration
- **Design system** - spójne kolory i spacing
- **Animations** - smooth transitions między stronami

### **📊 Admin Dashboard** (jeśli będzie potrzebny)
- **Statistics view** - wykresy odpowiedzi
- **Question management** - dodawanie nowych pytań
- **Export functionality** - CSV/JSON export

---

## 💡 **HARMONOGRAM ROZWOJU**

### **Tydzień 1: Fundamenty (DO ROZPOCZĘCIA TERAZ)**
- **Dzień 1:** ✅ Dokumentacja + backup commit **GOTOWE**
- **Dzień 2:** Migracja na Vite (`npm run dev` working)
- **Dzień 3:** Firebase security (env variables)
- **Dzień 4:** Testing migracji + deployment
- **Dzień 5:** Code review + dokumentacja

### **Tydzień 2: Refactoring**
- **Dzień 1-2:** useFirestore + SocialIcons components
- **Dzień 3-4:** Question component breakdown
- **Dzień 5:** Testing + integration

### **Tydzień 3: Polish & Fun**
- **Dzień 1-2:** UX improvements (loading, errors)
- **Dzień 3:** More questions + content
- **Dzień 4:** Warsaw test deployment? 😄
- **Dzień 5:** Documentation + planning next features

---

## 📋 **QUICK START - NASTĘPNE KROKI**

### **🚀 Start Vite Migration (RIGHT NOW):**

```bash
# 1. Zatrzymaj serwer (Ctrl+C)
# 2. Usuń CRA
npm uninstall react-scripts

# 3. Zainstaluj Vite  
npm install --save-dev vite @vitejs/plugin-react --legacy-peer-deps

# 4. Zmień package.json scripts na:
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}

# 5. Test
npm run dev  # Should work on :3000
```

**Goal:** `npm run dev` working instead of `npm start`

---

## ⚠️ **KNOWN ISSUES & SOLUTIONS**

### **Vite Migration Issues:**
- **SCSS:** `npm install -D sass`
- **SVG imports:** May need `?react` suffix
- **FontAwesome:** Should work out of box
- **Environment variables:** `REACT_APP_` → `VITE_` + `import.meta.env`

### **Firebase Security:**
- Check `.env.local` is in `.gitignore` ✅
- Test Firebase connection after env change
- Update Firestore rules in Firebase Console

---

## 🎯 **SUCCESS METRICS**

### **Technical Goals:**
- ✅ `npm run dev` working (fast startup)
- ✅ Secure Firebase config (no hardcoded keys)
- ✅ Modular components (<50 lines each)
- ✅ Proper error handling & loading states

### **Fun Goals:**
- 🎉 More interesting questions added
- 🎉 Warsaw deployment tested
- 🎉 Community engagement maintained
- 🎉 Portfolio-worthy codebase

### **Learning Goals:**
- 📚 Vite build system experience
- 📚 React best practices (hooks, context)
- 📚 Firebase security implementation
- 📚 Component architecture design

---

## 📞 **Kontakt**
**Developer:** enowuigrek@gmail.com  
**GitHub:** github.com/enowuigrek/Miejska-Ankieta  
**Live Site:** http://miejska-ankieta.czest.pl  
**Location:** Częstochowa (+ Warszawa spacery) 🚶‍♂️

---

## 📈 **Status Update (Current Session)**

### ✅ **COMPLETED TODAY**
- **Documentation:** Comprehensive README.md + DEVELOPMENT.md ✅
- **Planning:** 3-week development roadmap ✅
- **Security:** .env.local setup with Firebase credentials ✅
- **Git:** Safe backup commit przed migracją ✅
- **Vision:** Clear project goals (fun + portfolio + community) ✅

### 🔄 **NEXT STEPS (Po powrocie z biegu)**
- **Vite Migration:** `npm uninstall react-scripts` → `npm run dev`
- **Firebase Security:** Environment variables implementation
- **Component Refactoring:** Break down Question.jsx

### 🎯 **PROJECT PHILOSOPHY**
**For fun + portfolio + community engagement**  
**No pressure on monetization**  
**Multi-city potential (Częstochowa + Warszawa)**  
**Focus on code quality and developer experience** ⚡

---

## 🏆 **CURRENT STATUS**

✅ **Live Community Platform** - http://miejska-ankieta.czest.pl  
✅ **Real User Engagement** - QR codes active in Częstochowa  
✅ **Modern Tech Stack** - React + Firebase backend  
✅ **Comprehensive Documentation** - Ready for development  
🔄 **Vite Migration Prepared** - Step-by-step instructions ready  
🚶‍♂️ **Multi-city Vision** - Częstochowa + Warsaw expansion  
🎉 **Fun Factor Maintained** - Project enjoyment is priority #1