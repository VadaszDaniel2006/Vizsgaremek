const axios = require('axios');
const cheerio = require('cheerio');
const db = require('../config/db'); 

// Mai dátum formázása az API-hoz (YYYY-MM-DD)
const getTodayDate = () => {
    return new Date().toISOString().split('T')[0]; 
};

// Mai dátum formázása a megjelenítéshez (pl. "Ma (03.12.)")
const getDisplayDate = () => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `Ma (${month}.${day}.)`;
};

// Cím normalizálása
const normalizeText = (text) => {
    if (!text) return "";
    let clean = text.toLowerCase()
        .replace(/&/g, ' és ')
        .replace(/[^a-záéíóöőúüű0-9]+/g, ' ')
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
const scrapeUniversalBlock = async (url) => {
    try {
        const response = await axios.get(url, { 
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36' },
            timeout: 15000 
        });
        const $ = cheerio.load(response.data);
        const result = {};
        const displayDate = getDisplayDate();

        $('div, article, section, li, .movie-item, .program-item').each((i, el) => {
            const blockText = $(el).text().replace(/\s+/g, ' ').trim();
            
            if (blockText.length < 30 || blockText.length > 800) return;

            const cleanBlockText = normalizeText(blockText);
            
            // JAVÍTÁS: Csak a 09:00 - 23:59 közötti formátumokat keressük!
            // Így a "3:22" trailer hossz, vagy "2:15" filmhossz automatikusan elbukik.
            const timeRegex = /\b(?:1[0-9]|2[0-3]|0?[9])[:.][0-5][0-9]\b/g;
            let times = blockText.match(timeRegex);

            if (times && times.length > 0) {
                // Egy extra biztonsági ellenőrzés (hogy a 9 alatti órákat tényleg eldobjuk)
                const validTimes = [...new Set(times.map(t => t.replace('.', ':')))]
                    .filter(t => {
                        const hour = parseInt(t.split(':')[0], 10);
                        return hour >= 9 && hour <= 23; // CSAK 9 és 23 óra között!
                    })
                    .sort();

                if (validTimes.length > 0) {
                    result[cleanBlockText] = `${displayDate}|${validTimes.join(', ')}`;
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

        const [movies] = await db.query(`SELECT id, cim FROM media WHERE tipus = "film" AND megjelenes_ev_start >= 2024`);
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
                    method = "API";
                } else {
                    scrapedData = await scrapeUniversalBlock(mozi.url);
                    method = "Blokk-Scraper";
                }

                for (let movie of movies) {
                    const cleanMovieTitle = normalizeText(movie.cim);
                    if (!cleanMovieTitle || cleanMovieTitle.length < 3) continue;

                    if (method === "API") {
                        const matchedKey = Object.keys(scrapedData).find(key => 
                            key === cleanMovieTitle || (cleanMovieTitle.length > 5 && key.includes(cleanMovieTitle))
                        );
                        if (matchedKey) {
                            try {
                                await db.query('INSERT IGNORE INTO media_mozik (media_id, mozi_id, idopontok) VALUES (?, ?, ?)', [movie.id, mozi.id, scrapedData[matchedKey]]);
                                console.log(`✅ ${mozi.nev}: "${movie.cim}" - ${scrapedData[matchedKey]}`);
                            } catch (err) {}
                        }
                    } else {
                        const matchedBlockText = Object.keys(scrapedData).find(blockText => 
                            blockText.includes(cleanMovieTitle)
                        );

                        if (matchedBlockText) {
                            try {
                                await db.query('INSERT IGNORE INTO media_mozik (media_id, mozi_id, idopontok) VALUES (?, ?, ?)', [movie.id, mozi.id, scrapedData[matchedBlockText]]);
                                console.log(`✅ ${mozi.nev}: "${movie.cim}" - ${scrapedData[matchedBlockText]}`);
                            } catch (err) {}
                        }
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
