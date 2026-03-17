// Netlify Function — normalizacja i moderacja tekstu wpisanego przez użytkownika
// Zwraca JSON: { canonical, address } lub { error: "not_a_place" }

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        return { statusCode: 500, body: JSON.stringify({ error: 'Brak ANTHROPIC_API_KEY' }) };
    }

    let rawAnswer, knownOptions;
    try {
        ({ rawAnswer, knownOptions } = JSON.parse(event.body));
    } catch {
        return { statusCode: 400, body: JSON.stringify({ error: 'Nieprawidłowy JSON' }) };
    }

    const prompt = `Użytkownik wpisał nazwę miejsca: "${rawAnswer}"
Znane miejsca z listy: ${knownOptions.join(', ')}

Zasady:
1. Jeśli pasuje do pozycji z listy (literówka, skrót, opis lokalizacji) — użyj DOKŁADNIE tej nazwy z listy.
2. Jeśli to inna nazwa (np. "Caffe del Corso", "Black Bear", "u Zosi") — znormalizuj do poprawnej pisowni z wielkimi literami.
3. Odrzuć TYLKO oczywisty nonsens: losowe litery (np. "asdfjkl"), przekleństwa, "u mamy", "w domu" itp.

NIE weryfikuj czy miejsce istnieje — to nie Twoja rola. Jeśli wygląda jak nazwa miejsca, zaakceptuj.

Odpowiedz WYŁĄCZNIE w formacie JSON:
{ "canonical": "Nazwa Miejsca" }
lub tylko dla oczywistego nonsensu:
{ "error": "not_a_place" }`;

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                model: 'claude-haiku-4-5-20251001',
                max_tokens: 100,
                messages: [{ role: 'user', content: prompt }],
            }),
        });

        const data = await response.json();
        const text = data.content?.[0]?.text?.trim() || '{}';

        let parsed;
        try {
            parsed = JSON.parse(text);
        } catch {
            // Claude nie zwrócił JSON — traktuj jako nierozpoznane
            parsed = { error: 'not_a_place' };
        }

        return {
            statusCode: 200,
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(parsed),
        };
    } catch (err) {
        console.error('Claude API error:', err);
        // fallback: nie blokuj użytkownika, zapisz surowy tekst
        return {
            statusCode: 200,
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ canonical: rawAnswer, address: null }),
        };
    }
};
