// Netlify Function — normalizacja tekstu wpisanego przez użytkownika
// Wywołuje Claude Haiku, żeby dopasować wpisaną kawiarnię do znanych opcji

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

    const prompt = `Użytkownik wpisał nazwę kawiarni: "${rawAnswer}"
Znane kawiarnie w Częstochowie: ${knownOptions.join(', ')}

Twoim zadaniem jest dopasowanie odpowiedzi użytkownika do jednej ze znanych kawiarni.
Zasady:
- Jeśli odpowiedź pasuje do jednej z kawiarni (nawet z literówkami, skrótem, opisem lokalizacji lub nieformalną nazwą) — zwróć DOKŁADNIE jej nazwę z listy.
- Jeśli odpowiedź to inna kawiarnia, której nie ma na liście — zwróć jej poprawną, oficjalną nazwę (np. "Czarna Magia", "Cafe Verde").
- Jeśli nie wiesz co to za miejsce — zwróć "inne".
Odpowiedz TYLKO nazwą, bez żadnych wyjaśnień ani dodatkowych słów.`;

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
                max_tokens: 50,
                messages: [{ role: 'user', content: prompt }],
            }),
        });

        const data = await response.json();
        const canonical = data.content?.[0]?.text?.trim() || rawAnswer;

        return {
            statusCode: 200,
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ canonical }),
        };
    } catch (err) {
        console.error('Claude API error:', err);
        // fallback: użyj surowego tekstu
        return {
            statusCode: 200,
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ canonical: rawAnswer }),
        };
    }
};
