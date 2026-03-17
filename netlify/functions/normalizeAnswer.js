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

    const prompt = `Jesteś asystentem projektu ankietowego "jakmyślisz" działającego w Częstochowie, Polska.
Użytkownik wpisał: "${rawAnswer}"
Znane lokale z listy: ${knownOptions.join(', ')}

Twoje zadanie:
1. Oceń czy odpowiedź to próba wpisania nazwy lokalu (kawiarni, restauracji, baru, itp.) — nawet z literówkami, po angielsku, niepełna nazwa lub opis.
2. Jeśli tak — zwróć oficjalną nazwę i ulicę. Użyj swojej wiedzy o lokalach w Częstochowie. Jeśli nie znasz adresu, pomiń pole address.
3. Odrzuć TYLKO oczywiste nonsensowne odpowiedzi: "u mamy", "w domu", przekleństwa, losowe litery, itp.

Zasady dopasowania do listy:
- Jeśli pasuje do pozycji z listy (literówka, skrót, opis) — użyj DOKŁADNIE nazwy z listy.
- Jeśli to inny lokal — podaj jego oficjalną nazwę.

Odpowiedz WYŁĄCZNIE w formacie JSON, bez żadnego dodatkowego tekstu:
{ "canonical": "Nazwa Lokalu", "address": "ul. Przykładowa 1" }
lub jeśli to oczywisty nonsens:
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
