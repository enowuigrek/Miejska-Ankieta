// Netlify Function — proxy do Google Places Autocomplete API
// Klucz API zostaje server-side, nie trafia do przeglądarki

const CZESTOCHOWA_LAT = 50.8118;
const CZESTOCHOWA_LNG = 19.1203;
const RADIUS_M        = 15000; // 15 km od centrum

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
        return { statusCode: 500, body: JSON.stringify({ error: 'Brak GOOGLE_MAPS_API_KEY' }) };
    }

    let input;
    try {
        ({ input } = JSON.parse(event.body));
    } catch {
        return { statusCode: 400, body: JSON.stringify({ error: 'Nieprawidłowy JSON' }) };
    }

    if (!input || input.trim().length < 2) {
        return {
            statusCode: 200,
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ suggestions: [] }),
        };
    }

    try {
        const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
        url.searchParams.set('input', input.trim());
        url.searchParams.set('location', `${CZESTOCHOWA_LAT},${CZESTOCHOWA_LNG}`);
        url.searchParams.set('radius', RADIUS_M);
        url.searchParams.set('types', 'establishment');
        url.searchParams.set('language', 'pl');
        url.searchParams.set('strictbounds', 'true');
        url.searchParams.set('key', apiKey);

        const res  = await fetch(url.toString());
        const data = await res.json();

        const suggestions = (data.predictions || []).slice(0, 5).map(p => ({
            name:    p.structured_formatting?.main_text    || p.description,
            address: p.structured_formatting?.secondary_text || '',
            placeId: p.place_id || null,
        }));

        return {
            statusCode: 200,
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ suggestions }),
        };
    } catch (err) {
        console.error('Google Places error:', err);
        return {
            statusCode: 200,
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ suggestions: [] }),
        };
    }
};
