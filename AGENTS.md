# Agents / AI context

Kontekst biznesowy: ~/Documents/nowy-kontekst/projekty/jakmyslisz.md
Właściciel: Łukasz Nowak (lukasznowak.dev)

## Stack

- **React 18** + **React Router 6** — frontend i panel admina
- **Vite 7** — bundler, dev server (`npm run dev`), build (`npm run build`)
- **Firebase 10** — backend: Firestore (pytania, odpowiedzi, fakty), onSnapshot real-time sync
- **Firebase Hosting** — deploy (reguły: `firestore.rules`)
- **Netlify** — alternatywny hosting (`netlify.toml`, katalog `netlify/`)
- **qrcode** — generowanie QR kodów (canvas-based PNG export)
- **html2canvas** — eksport Share Card do PNG
- **recharts** — wykresy w panelu admina
- **Sass** — style (`.scss` przy każdym komponencie)
- **FontAwesome 6** — ikony
- **Node 20.x** — środowisko uruchomieniowe

### Skrypty npm

| Skrypt | Opis |
|---|---|
| `npm run dev` | Serwer developerski (Vite) |
| `npm run build` | Build produkcyjny do `dist/` |
| `npm run preview` | Podgląd builda |
| `npm run export` | Eksport danych przez `export.js` |
| `npm run stats` | Generowanie statystyk przez `stats.js` |

## Konwencje

- **URL scheme:** `jakmyslisz.com/:questionId` (np. `jakmyslisz.com/park-iii`) — route w App.jsx to `/:questionId`, nie `/pytanie/[slug]`
- Komponenty: jeden plik `.jsx` + jeden `.scss` w `src/components/`
- Panel admina: `src/components/admin/` + `AdminPanel.jsx`
- Firebase config: `src/firebase.js`
- Dane statyczne (pytania): `src/data/`
- Hooki: `src/hooks/`, konteksty: `src/contexts/`, utile: `src/utils/`
- Stałe: `src/constants/`
- Demo (offline preview): `src/demo/`

## Filozofia projektu

Guerrilla urban survey — naklejki QR w Częstochowie, świadomie anty-platformowe.
- Brak growth hacków, reklam, social followingu
- Anonimowość użytkownika jako zasada
- Aesthetic: białe tło, czerwony `?`, minimalizm

## CONTENT.md — treści strony

Plik: `~/Documents/nowy-kontekst/content/jakmyslisz.md`

Zawiera gotowe teksty UI: Hero, Czym jest, Idea, Jak uczestniczyć, CTA.
Jest mostem między filozofią projektu a komponentami React.

**Zasady pracy z treściami:**
- Czytaj ten plik **przed każdą zmianą tekstów** w komponentach (`Home.jsx`, `Question.jsx`, `SocialMediaPage.jsx` itp.)
- Gdy Cowork zaktualizuje plik content — **synchronizuj z komponentami** (nie odwrotnie)
- Ton i słownictwo z sekcji `> Nota dla AI` obowiązuje wszędzie: brak języka "platforma", "engagement", "viral"
- CTA i URL-e trzymaj spójne z `URL scheme` z sekcji Konwencje powyżej

## DESIGN.md — system wizualny

Plik z tokenami designu i wytycznymi wizualnymi:
`~/Documents/nowy-kontekst/design/jakmyslisz.md`

Czytaj go **PRZED każdą zmianą** stylów, kolorów, typografii lub layoutu.
Gdy Cowork zaktualizuje ten plik i poprosi o synchronizację — przepisz zmiany
do odpowiednich plików SCSS w `src/` i `src/components/`.
Nowe komponenty buduj zgodnie z tokenami z tego pliku — nie dodawaj nowych wartości
bez jednoczesnej aktualizacji DESIGN.md.

**Kluczowe zasady (skrót — pełna lista w DESIGN.md):**
- Zero `border-radius` — absolutna zasada projektu
- Paleta: `rgb(243,242,242)` / `rgb(69,69,69)` / `#FF2323` — nic poza tym
- Hover zawsze przez `opacity: 0.85`, nie przez zmianę koloru
- Animacje wejścia: wyłącznie wzorzec `fadeUp` (`ease-out`, `translateY(10px)`)
- Pliki: jeden `.jsx` + jeden `.scss` per komponent, zero CSS-in-JS

## Log zmian (najnowsze na górze)

- `c44eb94` ui: remove hover from refresh btn, remove border from bell icon
- `506943a` feat: real-time admin sync, calendar week trends, notification cross-device sync
- `852c4f0` fix: hide orphaned stats for deleted questions
- `b3c5f4a` feat: show user-submitted answers in question edit form
- `0f8c52b` feat: real-time sync for questions and facts via onSnapshot
- `c5cd71f` fix: prevent answer splitting when editing allowText questions
- `86bbdce` fix: timezone bug + chart granularity by period
- `30f4819` fix: daily chart per-day bar chart + mobile filter wrap
- `b47bff7` feat: redesign share card and improve returning banner
- `530ea80` feat: move share button to fixed footer alongside social icons
- `196e96c` fix: increase scan-answer pairing timeout from 60s to 2min
- `60cf0a0` feat: replace full logo with solo red ? on question pages
- `492ede8` fix: returning banner style - dark text, left aligned
- `7652651` fix: move useMemo before conditional returns (Rules of Hooks)
- `c47bd99` fix: always show revisit KPI card even when count is 0
