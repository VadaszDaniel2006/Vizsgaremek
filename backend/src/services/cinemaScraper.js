const axios = require('axios');
const cheerio = require('cheerio');
const db = require('../config/db'); 
const https = require('https');

// Golyóálló megoldás: Nem támaszkodunk a Docker nyelvi csomagjaira (amik hiányozhatnak),
// hanem fixen YYYY-MM-DD formátumot rakunk össze a pontos magyar időből!
const getTodayDate = () => {
    const tzDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Budapest' }));
    const y = tzDate.getFullYear();
    const m = String(tzDate.getMonth() + 1).padStart(2, '0');
    const d = String(tzDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const getDisplayDate = () => {
    const dateStr = getTodayDate();
    const parts = dateStr.split('-');
    const month = parts[1];
    const day = parts[2];
    return `Ma (${month}.${day}.)`;
};

// Cím normalizálása
const normalizeText = (text) => {
    if (!text) return "";
    let clean = text.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Ékezetek kigyomlálása a biztos találatért (á->a, é->e)
        .replace(/&/g, ' es ')
        .replace(/[^a-z0-9]+/g, ' ') // Csak alap betűk és számok maradhatnak
        .replace(/\s+/g, ' ')
        .trim();
    clean = clean.replace(/^(a|az)\s+/, '');
    return clean;
};

const getCinemaCityInternalId = (url) => {
    const match = url.match(/\/(\d{4})/);
    if (match) return match[1];
    const dictionary = {
        'allee': '1125', 'westend': '1131', 'arena': '1132', 'mammut': '1130', 
        'campona': '1126', 'debrecen': '1127', 'szeged': '1134', 'pecs': '1133', 
        'gyor': '1128', 'miskolc': '1129', 'alba': '1124', 'nyiregyhaza': '1142', 
        'sopron': '1139', 'savaria': '1138', 'balaton': '1136', 'szolnok': '1137', 
        'zala': '1135', 'dunaplaza': '1141'
    };
    for (const key in dictionary) { if (url.includes(key)) return dictionary[key]; }
    return null;
};

// 1. CINEMA CITY
const scrapeCinemaCity = async (url) => {
    const internalId = getCinemaCityInternalId(url);
    if (!internalId) return {};

    const date = getTodayDate();
    const displayDate = getDisplayDate();
    const apiUrl = `https://www.cinemacity.hu/hu/data-api-service/v1/quickbook/10102/film-events/in-cinema/${internalId}/at-date/${date}`;

    try {
        const response = await axios.get(apiUrl, { 
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 15000
        });
        const films = response.data?.body?.films || [];
        const events = response.data?.body?.events || [];
        
        let result = {};
        films.forEach(film => {
            const cleanTitle = normalizeText(film.name);
            const filmEvents = events.filter(e => e.filmId === film.id);
            const times = filmEvents.map(e => e.eventDateTime.split('T')[1].substring(0, 5));
            
            if (times.length > 0) {
                result[cleanTitle] = `${displayDate}|${[...new Set(times)].sort().join(', ')}`;
            }
        });
        return result;
    } catch (error) {
        return {};
    }
};

// 2. UNIVERZÁLIS "BLOKK" SCRAPER (Szigorú Időpont-Szűrővel)
const scrapeUniversalBlock = async (url, movies) => {
    try {
        const response = await axios.get(url, { 
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
            timeout: 15000,
            httpsAgent: new https.Agent({ rejectUnauthorized: false }) // SSL/Tanúsítvány hibák ignorálása a kis moziknál
        });
        const $ = cheerio.load(response.data);
        const result = {};
        const displayDate = getDisplayDate();

        // Kőkemény Regex: Dátumok (10.12.) és játékidők (120 perc) azonnali kiszűrése
        const timeRegex = /(?<!\d[\.\-])\b(?:[01]?[0-9]|2[0-3])[:.][0-5][0-9]\b(?!\.)(?!\s*perc|\s*p\b)/gi;

        movies.forEach(movie => {
            // Cím variációk generálása (Pl. "Reminders of Him - Emlékek róla" -> "Reminders of Him" és "Emlékek róla")
            let cimVariaciok = [movie.cim];
            
            const splitChars = ['-', '–', ':', '/', '|']; // Hosszú kötőjel (–) és egyéb elválasztók felismerése
            splitChars.forEach(char => {
                if (movie.cim.includes(char)) cimVariaciok.push(...movie.cim.split(char));
            });
            
            const cleanVariations = [...new Set(cimVariaciok.map(c => normalizeText(c)))].filter(c => c.length > 3);
            if (cleanVariations.length === 0) return;

            let foundTimes = [];

            // Keresés az oldalon olyan blokkokban, amik tartalmazzák a film címét
            $('div, article, section, li, td, tr, p, .movie-item, .program-item, .showtime').each((i, el) => {
                const blockText = $(el).text().replace(/\s+/g, ' ').trim();
                
                // Nagyobbra vesszük a limitet, mert egyes helyi mozik egyben öntik be a heti szöveget
                if (blockText.length < 5 || blockText.length > 1500) return;

                const cleanBlockText = normalizeText(blockText);
                
                // Ha BÁRMELYIK névváltozat (pl. csak a magyar címe) szerepel a helyi mozi oldalán:
                let isMatch = cleanVariations.some(variacio => cleanBlockText.includes(variacio));

                if (isMatch) {
                    let times = blockText.match(timeRegex);
                    if (times && times.length > 0) {
                        foundTimes.push(...times);
                    }
                }
            });

            if (foundTimes.length > 0) {
                const validTimes = [...new Set(foundTimes.map(t => {
                    let [h, m] = t.toLowerCase().replace('.', ':').split(':');
                    return `${h.padStart(2, '0')}:${m}`;
                }))]
                .filter(t => {
                    const hour = parseInt(t.split(':')[0], 10);
                    // Valid mozi időpontok: 9:00 - 23:59, plusz éjféli premierek (0-1 óra)
                    return (hour >= 9 && hour <= 23) || hour === 0 || hour === 1;
                })
                .sort();

                if (validTimes.length > 0) {
                    // A kimenetbe az eredeti, teljes normalizált címet tesszük, hogy a fő kód megtalálja
                    result[normalizeText(movie.cim)] = `${displayDate}|${validTimes.join(', ')}`;
                }
            }
        });

        return result;
    } catch (error) {
        return {}; 
    }
};

const chunkArray = (array, size) => {
    const chunked = [];
    for (let i = 0; i < array.length; i += size) {
        chunked.push(array.slice(i, i + size));
    }
    return chunked;
};

// --- FŐ LOGIKA ---
const runCinemaScraper = async () => {
    console.log('🤖 Robot: TÜRELMES, Időpont-Szűrős adatgyűjtés elindítva...');
    const startTime = Date.now();

    try {
        await db.query('DELETE FROM media_mozik');
        console.log('🧹 Robot: Régi moziműsor törölve. Keresés folyamatban...');

        // CSAK a 2026-os (és az utáni) filmek moziműsorát fogja lekérdezni és frissíteni!
        const [movies] = await db.query(`SELECT id, cim FROM media WHERE tipus = "film" AND megjelenes_ev_start >= 2026`);
        const [cinemas] = await db.query('SELECT id, nev, url FROM mozik');

        const moziChunks = chunkArray(cinemas, 5);
        let processedCount = 0;

        for (const chunk of moziChunks) {
            const chunkPromises = chunk.map(async (mozi) => {
                if (!mozi.url || mozi.url.length < 5) return;

                let scrapedData = {}; 
                let method = "";

                if (mozi.nev.includes('Cinema City')) {
                    scrapedData = await scrapeCinemaCity(mozi.url);
                } else {
                    // ÁTADJUK a filmeket is az univerzális scrapernek, hogy okosan tudjon keresni!
                    scrapedData = await scrapeUniversalBlock(mozi.url, movies);
                }

                for (let movie of movies) {
                    const cleanMovieTitle = normalizeText(movie.cim);
                    if (!cleanMovieTitle || cleanMovieTitle.length < 3) continue;

                    // Okosított egyezés vizsgálat mindkét (API és Blokk) scraperhez
                    const matchedKey = Object.keys(scrapedData).find(key => 
                        key === cleanMovieTitle || 
                        (cleanMovieTitle.length > 5 && key.includes(cleanMovieTitle)) ||
                        (key.length > 5 && cleanMovieTitle.includes(key))
                    );

                    if (matchedKey) {
                        try {
                            await db.query('INSERT IGNORE INTO media_mozik (media_id, mozi_id, idopontok) VALUES (?, ?, ?)', [movie.id, mozi.id, scrapedData[matchedKey]]);
                            console.log(`✅ ${mozi.nev}: "${movie.cim}" - ${scrapedData[matchedKey]}`);
                        } catch (err) {}
                    }
                }
            });

            await Promise.allSettled(chunkPromises);
            
            processedCount += chunk.length;
            console.log(`⏳ Folyamat: ${processedCount}/${cinemas.length} mozi ellenőrizve...`);

            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        const endTime = Date.now();
        console.log(`🏆 Robot: Türelmes adatgyűjtés BEFEJEZVE! Időtartam: ${((endTime - startTime) / 1000).toFixed(2)} mp.`);
    } catch (error) {
        console.error('❌ Robot kritikus hiba:', error);
    }
};

module.exports = runCinemaScraper;
