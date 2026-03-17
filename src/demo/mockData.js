import { SEED_QUESTIONS } from '../data/questionsData';
import { SEED_FACTS }     from '../data/factsData';

// ── Pytania demo (6 pytań) ────────────────────────────────────────────────────
const DEMO_IDS = [
    'pomidorowa',
    'pizza_ananas',
    'symulacja',
    'ai_przyszlosc',
    'wyprowadzka',
    'piec_lat_temu',
];

export const DEMO_QUESTIONS = {};
DEMO_IDS.forEach((id, idx) => {
    DEMO_QUESTIONS[id] = {
        ...SEED_QUESTIONS[id],
        number:  idx + 1,
        active:  true,
        printed: idx < 4,
    };
});

// ── Ciekawostki demo ──────────────────────────────────────────────────────────
export const DEMO_FACTS = SEED_FACTS.slice(0, 10).map((text, idx) => ({
    id:     String(idx + 1).padStart(4, '0'),
    text,
    number: idx + 1,
    active: true,
}));

// ── Gotowe wyniki dla strony pytania ─────────────────────────────────────────
export const DEMO_RESULTS = {
    pomidorowa: [
        { label: 'z ryżem',     percent: 61 },
        { label: 'z makaronem', percent: 39 },
    ],
    pizza_ananas: [
        { label: 'tak, bardzo lubię', percent: 24 },
        { label: 'NIE %@*&#?!!!',     percent: 76 },
    ],
    symulacja: [
        { label: 'tak',               percent: 33 },
        { label: 'nie',               percent: 42 },
        { label: 'nie chcę wiedzieć', percent: 25 },
    ],
    ai_przyszlosc: [
        { label: 'pomoże ludziom',        percent: 48 },
        { label: 'zaszkodzi',             percent: 30 },
        { label: 'nie obchodzi mnie to',  percent: 22 },
    ],
    wyprowadzka: [
        { label: 'tak, tu jest OK',      percent: 37 },
        { label: 'nie, planuję wyjechać', percent: 46 },
        { label: 'już wyjechałem/am',    percent: 17 },
    ],
    piec_lat_temu: [
        { label: 'tak',                 percent: 28 },
        { label: 'nie',                 percent: 43 },
        { label: 'lepiej niż myślałem', percent: 29 },
    ],
};

// ── Generator wpisów (deterministyczny, bez Math.random) ─────────────────────
const LOCATIONS    = ['rynek', 'park', 'most', 'dworzec'];
const LOC_WEIGHTS  = [0.40, 0.30, 0.20, 0.10];

function pickLoc(seed) {
    const r = ((seed * 2654435761) >>> 0) / 0xFFFFFFFF; // hash int → [0,1)
    let cum = 0;
    for (let i = 0; i < LOCATIONS.length; i++) {
        cum += LOC_WEIGHTS[i];
        if (r < cum) return LOCATIONS[i];
    }
    return LOCATIONS[0];
}

function genTimestamp(daysAgo, seed) {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    const hour = 8 + (seed % 13);           // 8–20
    const min  = (seed * 7) % 60;
    d.setHours(hour, min, 0, 0);
    return d.toISOString();
}

function genEntries(questionId, options, dist, totalAnswers) {
    const answers = [];
    const scans   = [];
    const extra   = Math.floor(totalAnswers * 0.28); // skany bez odpowiedzi

    for (let i = 0; i < totalAnswers; i++) {
        const seed     = (i * 2654435761 + questionId.charCodeAt(0) * 40503) >>> 0;
        const daysAgo  = Math.floor(((seed * 0.618033988) % 1) * 30);
        const timestamp = genTimestamp(daysAgo, seed);
        const loc       = pickLoc(seed + i);

        scans.push({
            id:         `demo_scan_${questionId}_${i}`,
            questionId, timestamp, location: loc,
        });

        // wybór opcji wg rozkładu
        const r = (seed * 0.381966) % 1;
        let cum = 0, pickedOpt = options[0].id;
        for (let j = 0; j < options.length; j++) {
            cum += dist[j];
            if (r < cum) { pickedOpt = options[j].id; break; }
        }

        answers.push({
            id:         `demo_ans_${questionId}_${i}`,
            questionId, answer: pickedOpt, timestamp, location: loc,
        });
    }

    // dodatkowe skany bez głosu
    for (let i = 0; i < extra; i++) {
        const seed    = (i * 40503 + 9999 + questionId.charCodeAt(0)) >>> 0;
        const daysAgo = Math.floor(((seed * 0.7) % 1) * 30);
        scans.push({
            id:         `demo_scan_extra_${questionId}_${i}`,
            questionId, timestamp: genTimestamp(daysAgo, seed), location: pickLoc(seed),
        });
    }

    return { answers, scans };
}

// ── Konfiguracja rozkładów i liczby wpisów ────────────────────────────────────
const CONFIGS = [
    { id: 'pomidorowa',    dist: [0.61, 0.39],              count: 47 },
    { id: 'pizza_ananas',  dist: [0.24, 0.76],              count: 39 },
    { id: 'symulacja',     dist: [0.33, 0.42, 0.25],        count: 31 },
    { id: 'ai_przyszlosc', dist: [0.48, 0.30, 0.22],        count: 43 },
    { id: 'wyprowadzka',   dist: [0.37, 0.46, 0.17],        count: 35 },
    { id: 'piec_lat_temu', dist: [0.28, 0.43, 0.29],        count: 28 },
];

export const DEMO_ANSWERS = [];
export const DEMO_SCANS   = [];

CONFIGS.forEach(({ id, dist, count }) => {
    const q = DEMO_QUESTIONS[id];
    if (!q) return;
    const { answers, scans } = genEntries(id, q.options, dist, count);
    DEMO_ANSWERS.push(...answers);
    DEMO_SCANS.push(...scans);
});
