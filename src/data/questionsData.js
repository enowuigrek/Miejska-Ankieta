// Dane źródłowe — jednorazowe seedowanie Firestore.
// Do odczytu w aplikacji używaj DataContext (useData()).
export const SEED_QUESTIONS = {
    zwierzeta: {
        questionText: 'Lepszy kompan',
        options: [
            { id: 'pies', label: 'pies' },
            { id: 'kot', label: 'kot' },
        ],
    },
    pomidorowa: {
        questionText: 'Pomidorowa lepsza',
        options: [
            { id: 'z ryżem', label: 'z ryżem' },
            { id: 'z makaronem', label: 'z makaronem' },
        ],
    },

    gaming: {
        questionText: 'Lepiej się gra na',
        options: [
            { id: 'PC', label: 'PC' },
            { id: 'PlayStation', label: 'PlayStation' },
            { id: 'Xbox', label: 'Xbox' },
            { id: 'Nintendo', label: 'Nintendo' },
            { id: 'telefonie', label: 'telefonie' },
            { id: 'nie gram', label: 'nie gram' },

        ],
    },

    pizza_ananas: {
        questionText: 'Pizza z ananasem?',
        options: [
            { id: 'tak, bardzo lubię', label: 'tak, bardzo lubię' },
            { id: 'NIE %@*&#?!!!', label: 'NIE %@*&#?!!!' },
        ],
    },

    dom_mieszkanie: {
        questionText: 'Lepiej się mieszka w',
        options: [
            { id: 'dom', label: 'dom' },
            { id: 'mieszkanie', label: 'mieszkanie' },
        ],
    },

    ksiazka: {
        questionText: 'Książka lepsza jako',
        options: [
            { id: 'papier', label: 'papier' },
            { id: 'e-book', label: 'e-book' },
            { id: 'audiobook', label: 'audiobook' },
        ],
    },

    kordeckiego: {
        questionText: 'Co tu będzie?',
        options: [
            { id: 'parking', label: 'parking' },
            {
                id: 'żabka, biedronka czy inny lidl',
                label: 'żabka, biedronka czy inny lidl',
            },
            { id: 'hotel', label: 'hotel' },
            { id: 'kebab', label: 'kebab' },
        ],
    },

    kawa: {
        questionText: 'Jak czarna kawa, to',
        options: [
            { id: 'owocowa, z kwasowością', label: 'owocowa, z kwasowością' },
            { id: 'czekoladowa, z goryczką', label: 'czekoladowa, z goryczką' },
        ],
    },

    najlepsza_kawa: {
        questionText: 'Najlepsza kawa w Częstochowie?',
        allowText: true,
        options: [
            { id: 'Strzykawa', label: 'Strzykawa' },
            { id: 'Fusy', label: 'Fusy' },
            { id: 'Sacre', label: 'Sacre' },
            { id: 'inne', label: '+ dodaj', type: 'text' },
        ],
    },

    mleko: {
        questionText: 'Mleko lepsze',
        options: [
            { id: 'krowie', label: 'krowie' },
            { id: 'roślinne', label: 'roślinne' },
        ],
    },

    majonez: {
        questionText: 'Lepszy majonez',
        options: [
            { id: 'Kielecki', label: 'Kielecki' },
            { id: 'Winiary', label: 'Winiary' },
            { id: 'Helmans', label: 'Helmans - i czemu on nigdy nie walczy?' },
        ],
    },

    ipa: {
        questionText: 'IPA?',
        options: [
            { id: 'za gorzkie', label: 'za gorzkie' },
            { id: 'uwielbiam!!', label: 'uwielbiam!!' },
            {
                id: 'drogie te krafty, wolę Harnasia',
                label: 'drogie te krafty, wolę Harnasia',
            },
        ],
    },

    piwo: {
        questionText: 'Piwo lepsze',
        options: [
            { id: 'jasne', label: 'jasne' },
            { id: 'ciemne', label: 'ciemne' },
        ],
    },

    papier: {
        questionText: 'Papier toaletowy wisi',
        options: [
            { id: 'do ściany', label: 'DO ściany' },
            { id: 'od ściany', label: 'OD ściany' },
        ],
    },

    kroki: {
        questionText: 'Ile kroków dziennie?',
        options: [
            { id: 'mniej niż 6 000', label: 'mniej niż 6 000' },
            { id: 'między 6 000 a 10 000', label: 'między 6 000 a 10 000' },
            { id: 'między 10 000 a 15 000', label: 'między 10 000 a 15 000' },
            { id: 'więcej niż 15 000', label: 'więcej niż 15 000' },
        ],
    },

    // --- FILOZOFICZNE ---

    spokój_emocje: {
        questionText: 'Lepiej mieć',
        options: [
            { id: 'spokój', label: 'spokój' },
            { id: 'emocje', label: 'emocje' },
        ],
    },

    wolnosc_bezpieczenstwo: {
        questionText: 'Ważniejsze',
        options: [
            { id: 'wolność', label: 'wolność' },
            { id: 'bezpieczeństwo', label: 'bezpieczeństwo' },
        ],
    },

    pieniadze_szczescie: {
        questionText: 'Pieniądze dają szczęście?',
        options: [
            { id: 'tak', label: 'tak' },
            { id: 'pomagają', label: 'nie, ale bardzo pomagają' },
            { id: 'nie', label: 'nie' },
        ],
    },

    ludzie_natura: {
        questionText: 'Ludzie z natury są',
        options: [
            { id: 'dobrzy', label: 'dobrzy' },
            { id: 'egoistyczni', label: 'egoistyczni' },
        ],
    },

    byc_soba: {
        questionText: 'Lepiej',
        options: [
            { id: 'być sobą', label: 'być sobą' },
            { id: 'dopasować się', label: 'dopasować się' },
        ],
    },

    // --- MIASTO ---

    wyprowadzka: {
        questionText: 'Zostaniesz w Częstochowie?',
        options: [
            { id: 'tak', label: 'tak, tu jest OK' },
            { id: 'nie', label: 'nie, planuję wyjechać' },
            { id: 'juz wyjechałem', label: 'już wyjechałem/am' },
        ],
    },

    perspektywy_mlodych: {
        questionText: 'Młodzi mają tu perspektywy?',
        options: [
            { id: 'tak', label: 'tak' },
            { id: 'nie', label: 'nie' },
            { id: 'szukają gdzie indziej', label: 'szukają gdzie indziej' },
        ],
    },

    komunikacja_miejska: {
        questionText: 'Komunikacja miejska w Częstochowie',
        options: [
            { id: 'działa OK', label: 'działa OK' },
            { id: 'mogłoby być lepiej', label: 'mogłoby być lepiej' },
            { id: 'tragedia', label: 'tragedia' },
        ],
    },

    mieszkania_ceny: {
        questionText: 'Ceny mieszkań tu są',
        options: [
            { id: 'za wysokie', label: 'za wysokie' },
            { id: 'w porządku', label: 'w porządku' },
            { id: 'niskie? gdzie?!', label: 'niskie? gdzie?!' },
        ],
    },

    // --- RELACJE ---

    singiel_zwiazek: {
        questionText: 'Lepiej być',
        options: [
            { id: 'singlem', label: 'singlem' },
            { id: 'w związku', label: 'w związku' },
        ],
    },

    milosc_niezaleznosc: {
        questionText: 'Ważniejsza',
        options: [
            { id: 'miłość', label: 'miłość' },
            { id: 'niezależność', label: 'niezależność' },
        ],
    },

    przyjazn_ex: {
        questionText: 'Da się przyjaźnić z ex?',
        options: [
            { id: 'tak', label: 'tak' },
            { id: 'nie', label: 'absolutnie nie' },
            { id: 'z niektórymi', label: 'z niektórymi' },
        ],
    },

    stabilizacja_spontan: {
        questionText: 'Wolisz',
        options: [
            { id: 'stabilizację', label: 'stabilizację' },
            { id: 'spontaniczność', label: 'spontaniczność' },
        ],
    },

    // --- TECHNOLOGIA / PRZYSZŁOŚĆ ---

    ai_przyszlosc: {
        questionText: 'Sztuczna inteligencja',
        options: [
            { id: 'pomoże ludziom', label: 'pomoże ludziom' },
            { id: 'zaszkodzi', label: 'zaszkodzi' },
            { id: 'nie obchodzi mnie to', label: 'nie obchodzi mnie to' },
        ],
    },

    swiat_kierunek: {
        questionText: 'Świat idzie',
        options: [
            { id: 'w dobrą stronę', label: 'w dobrą stronę' },
            { id: 'w złą stronę', label: 'w złą stronę' },
        ],
    },

    technologia_ludzie: {
        questionText: 'Technologia nas',
        options: [
            { id: 'zbliża', label: 'zbliża' },
            { id: 'oddala', label: 'oddala' },
        ],
    },

    // --- LIFESTYLE ---

    nocny_poranny: {
        questionText: 'Jesteś',
        options: [
            { id: 'nocnym markiem', label: 'nocnym markiem' },
            { id: 'rannym ptakiem', label: 'rannym ptakiem' },
        ],
    },

    miasto_natura: {
        questionText: 'Lepiej',
        options: [
            { id: 'miasto', label: 'miasto' },
            { id: 'natura', label: 'natura' },
        ],
    },

    // --- SPOŁECZNE ---

    social_media: {
        questionText: 'Social media',
        options: [
            { id: 'pomagają', label: 'pomagają' },
            { id: 'szkodzą', label: 'szkodzą' },
        ],
    },

    studia_sens: {
        questionText: 'Studia mają dziś sens?',
        options: [
            { id: 'tak', label: 'tak' },
            { id: 'nie', label: 'nie' },
            { id: 'zależy od kierunku', label: 'zależy od kierunku' },
        ],
    },

    praca_pasja: {
        questionText: 'Praca powinna być pasją?',
        options: [
            { id: 'tak', label: 'tak' },
            { id: 'nieważne byle płacili', label: 'nieważne, byle płacili' },
            { id: 'idealnie gdyby tak było', label: 'idealnie gdyby tak było' },
        ],
    },

    szkola_zycie: {
        questionText: 'Szkoła przygotowuje do życia?',
        options: [
            { id: 'tak', label: 'tak' },
            { id: 'nie', label: 'nie' },
            { id: 'trochę', label: 'trochę' },
        ],
    },

    // --- MOCNE / EGZYSTENCJALNE ---

    cofnij_czas: {
        questionText: 'Gdybyś mógł cofnąć czas',
        options: [
            { id: 'zmieniłbym coś', label: 'zmieniłbym coś' },
            { id: 'nic bym nie zmienił', label: 'nic bym nie zmienił' },
        ],
    },

    symulacja: {
        questionText: 'Żyjemy w symulacji?',
        options: [
            { id: 'tak', label: 'tak' },
            { id: 'nie', label: 'nie' },
            { id: 'nie chcę wiedzieć', label: 'nie chcę wiedzieć' },
        ],
    },

    sami_wszechswiat: {
        questionText: 'Jesteśmy sami we wszechświecie?',
        options: [
            { id: 'tak', label: 'tak' },
            { id: 'nie', label: 'nie' },
            { id: 'boję się odpowiedzi', label: 'boję się odpowiedzi' },
        ],
    },

    wiedziec_kiedy: {
        questionText: 'Wolałbyś wiedzieć kiedy umrzesz?',
        options: [
            { id: 'tak', label: 'tak' },
            { id: 'nie', label: 'nie' },
        ],
    },

    los_istnieje: {
        questionText: 'Los istnieje?',
        options: [
            { id: 'tak', label: 'tak' },
            { id: 'nie', label: 'nie, sami kształtujemy życie' },
        ],
    },

    piec_lat_temu: {
        questionText: 'Jesteś tam, gdzie chciałeś być 5 lat temu?',
        options: [
            { id: 'tak', label: 'tak' },
            { id: 'nie', label: 'nie' },
            { id: 'lepiej niż myślałem', label: 'lepiej niż myślałem' },
        ],
    },

    bogaty_szczesliwy: {
        questionText: 'Wolisz być',
        options: [
            { id: 'bogaty i smutny', label: 'bogaty i smutny' },
            { id: 'biedny i szczęśliwy', label: 'biedny i szczęśliwy' },
        ],
    },

    nikt_nie_wie: {
        questionText: 'Gdyby nikt się nie dowiedział',
        options: [
            { id: 'zrobiłbym coś inaczej', label: 'zrobiłbym coś inaczej' },
            { id: 'nic bym nie zmienił', label: 'i tak bym nic nie zmienił' },
        ],
    },

    smierc_sens: {
        questionText: 'Śmierć nadaje życiu sens?',
        options: [
            { id: 'tak', label: 'tak' },
            { id: 'nie', label: 'nie' },
        ],
    },

    wolna_wola: {
        questionText: 'Wolna wola istnieje?',
        options: [
            { id: 'tak', label: 'tak' },
            { id: 'nie', label: 'nie, decyzje wynikają z doświadczeń' },
            { id: 'nie wiem', label: 'nie wiem i to mnie przeraża' },
        ],
    },

    zycie_sens: {
        questionText: 'Życie ma sens?',
        options: [
            { id: 'tak', label: 'tak' },
            { id: 'nie ale to OK', label: 'nie, ale to OK' },
            { id: 'sam go sobie nadaję', label: 'sam go sobie nadaję' },
        ],
    },

    samotnosc_dzis: {
        questionText: 'Ludzie są dziś bardziej samotni?',
        options: [
            { id: 'tak', label: 'tak' },
            { id: 'nie', label: 'nie' },
        ],
    },
};

// Alias dla wstecznej kompatybilności
export const QUESTIONS_DATA = SEED_QUESTIONS;
