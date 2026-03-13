// Netlify Edge Function — dynamic OG meta tags dla botów komunikatorów
// Uruchamia się na Deno (edge), przechwytuje żądania botów do stron pytań
// i zwraca uproszczony HTML z właściwymi meta tagami zamiast generycznego index.html

const BOT_UA =
    /facebookexternalhit|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Slackbot|Discordbot|Applebot|Googlebot|bingbot|DuckDuckBot/i;

// Skrócone dane pytań — tylko to co potrzeba do OG
const QUESTIONS = {
    zwierzeta:             { text: 'Lepszy kompan',                     opts: ['pies', 'kot'] },
    pomidorowa:            { text: 'Pomidorowa lepsza',                  opts: ['z ryżem', 'z makaronem'] },
    gaming:                { text: 'Lepiej się gra na',                  opts: ['PC', 'PlayStation', 'Xbox', 'Nintendo', 'telefonie'] },
    pizza_ananas:          { text: 'Pizza z ananasem?',                  opts: ['tak, bardzo lubię', 'NIE %@*&#?!!!'] },
    dom_mieszkanie:        { text: 'Lepiej się mieszka w',               opts: ['dom', 'mieszkanie'] },
    ksiazka:               { text: 'Książka lepsza jako',                opts: ['papier', 'e-book', 'audiobook'] },
    kordeckiego:           { text: 'Co tu będzie?',                      opts: ['parking', 'żabka/biedronka', 'hotel', 'kebab'] },
    kawa:                  { text: 'Jak czarna kawa, to',                opts: ['owocowa', 'czekoladowa'] },
    mleko:                 { text: 'Mleko lepsze',                       opts: ['krowie', 'roślinne'] },
    majonez:               { text: 'Lepszy majonez',                     opts: ['Kielecki', 'Winiary', 'Hellmans'] },
    ipa:                   { text: 'IPA?',                               opts: ['za gorzkie', 'uwielbiam!!', 'wolę Harnasia'] },
    piwo:                  { text: 'Piwo lepsze',                        opts: ['jasne', 'ciemne'] },
    papier:                { text: 'Papier toaletowy wisi',              opts: ['DO ściany', 'OD ściany'] },
    kroki:                 { text: 'Ile kroków dziennie?',               opts: ['<6 000', '6–10 000', '10–15 000', '>15 000'] },
    spokój_emocje:         { text: 'Lepiej mieć',                        opts: ['spokój', 'emocje'] },
    wolnosc_bezpieczenstwo:{ text: 'Ważniejsze',                         opts: ['wolność', 'bezpieczeństwo'] },
    pieniadze_szczescie:   { text: 'Pieniądze dają szczęście?',          opts: ['tak', 'nie, ale pomagają', 'nie'] },
    ludzie_natura:         { text: 'Ludzie z natury są',                 opts: ['dobrzy', 'egoistyczni'] },
    byc_soba:              { text: 'Lepiej',                             opts: ['być sobą', 'dopasować się'] },
    wyprowadzka:           { text: 'Zostaniesz w Częstochowie?',         opts: ['tak', 'nie', 'już wyjechałem'] },
    perspektywy_mlodych:   { text: 'Młodzi mają tu perspektywy?',        opts: ['tak', 'nie', 'szukają gdzie indziej'] },
    komunikacja_miejska:   { text: 'Komunikacja miejska w Częstochowie', opts: ['działa OK', 'mogłoby być lepiej', 'tragedia'] },
    mieszkania_ceny:       { text: 'Ceny mieszkań tu są',                opts: ['za wysokie', 'w porządku', 'niskie? gdzie?!'] },
    singiel_zwiazek:       { text: 'Lepiej być',                         opts: ['singlem', 'w związku'] },
    milosc_niezaleznosc:   { text: 'Ważniejsza',                         opts: ['miłość', 'niezależność'] },
    przyjazn_ex:           { text: 'Da się przyjaźnić z ex?',            opts: ['tak', 'absolutnie nie', 'z niektórymi'] },
    stabilizacja_spontan:  { text: 'Wolisz',                             opts: ['stabilizację', 'spontaniczność'] },
    ai_przyszlosc:         { text: 'Sztuczna inteligencja',              opts: ['pomoże ludziom', 'zaszkodzi', 'nie obchodzi mnie to'] },
    swiat_kierunek:        { text: 'Świat idzie',                        opts: ['w dobrą stronę', 'w złą stronę'] },
    technologia_ludzie:    { text: 'Technologia nas',                    opts: ['zbliża', 'oddala'] },
    nocny_poranny:         { text: 'Jesteś',                             opts: ['nocnym markiem', 'rannym ptakiem'] },
    miasto_natura:         { text: 'Lepiej',                             opts: ['miasto', 'natura'] },
    social_media:          { text: 'Social media',                       opts: ['pomagają', 'szkodzą'] },
    studia_sens:           { text: 'Studia mają dziś sens?',             opts: ['tak', 'nie', 'zależy od kierunku'] },
    praca_pasja:           { text: 'Praca powinna być pasją?',           opts: ['tak', 'nieważne byle płacili', 'idealnie gdyby tak było'] },
    szkola_zycie:          { text: 'Szkoła przygotowuje do życia?',      opts: ['tak', 'nie', 'trochę'] },
    cofnij_czas:           { text: 'Gdybyś mógł cofnąć czas',           opts: ['zmieniłbym coś', 'nic bym nie zmienił'] },
    symulacja:             { text: 'Żyjemy w symulacji?',                opts: ['tak', 'nie', 'nie chcę wiedzieć'] },
    sami_wszechswiat:      { text: 'Jesteśmy sami we wszechświecie?',    opts: ['tak', 'nie', 'boję się odpowiedzi'] },
    wiedziec_kiedy:        { text: 'Wolałbyś wiedzieć kiedy umrzesz?',   opts: ['tak', 'nie'] },
    los_istnieje:          { text: 'Los istnieje?',                      opts: ['tak', 'nie, sami kształtujemy życie'] },
    piec_lat_temu:         { text: 'Jesteś tam, gdzie chciałeś być 5 lat temu?', opts: ['tak', 'nie', 'lepiej niż myślałem'] },
    bogaty_szczesliwy:     { text: 'Wolisz być',                         opts: ['bogaty i smutny', 'biedny i szczęśliwy'] },
    nikt_nie_wie:          { text: 'Gdyby nikt się nie dowiedział',       opts: ['zrobiłbym coś inaczej', 'i tak bym nic nie zmienił'] },
    smierc_sens:           { text: 'Śmierć nadaje życiu sens?',          opts: ['tak', 'nie'] },
    wolna_wola:            { text: 'Wolna wola istnieje?',               opts: ['tak', 'nie', 'nie wiem i to mnie przeraża'] },
    zycie_sens:            { text: 'Życie ma sens?',                     opts: ['tak', 'nie, ale to OK', 'sam go sobie nadaję'] },
    samotnosc_dzis:        { text: 'Ludzie są dziś bardziej samotni?',   opts: ['tak', 'nie'] },
};

const SKIP_PATHS = new Set(['admin', 'fact', 'social_media', '404', 'favicon.svg', 'robots.txt']);

export default async (request) => {
    const ua = request.headers.get('user-agent') || '';
    if (!BOT_UA.test(ua)) return; // nie bot — przepuść do SPA

    const url = new URL(request.url);
    const segments = url.pathname.split('/').filter(Boolean);

    if (segments.length !== 1) return;
    const questionId = segments[0];

    if (SKIP_PATHS.has(questionId)) return;

    const q = QUESTIONS[questionId];
    if (!q) return; // nieznane pytanie — przepuść

    const title = `${q.text} — jakmyślisz`;
    const description = q.opts.join(' / ');
    const pageUrl = url.href;
    const image = `${url.origin}/favicon.svg`;

    const html = `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8"/>
  <title>${title}</title>
  <meta property="og:type" content="website"/>
  <meta property="og:url" content="${pageUrl}"/>
  <meta property="og:title" content="${title}"/>
  <meta property="og:description" content="${description}"/>
  <meta property="og:image" content="${image}"/>
  <meta property="og:site_name" content="jakmyślisz"/>
  <meta name="twitter:card" content="summary"/>
  <meta name="twitter:title" content="${title}"/>
  <meta name="twitter:description" content="${description}"/>
</head>
<body></body>
</html>`;

    return new Response(html, {
        headers: { 'content-type': 'text/html;charset=utf-8' },
    });
};

export const config = { path: '/:questionId' };
