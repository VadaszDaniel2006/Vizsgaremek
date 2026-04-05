const axios = require('axios');
const db = require('../config/db'); 

const getBudapestDateObj = () => new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Budapest' }));

const getTodayDate = () => {
    const tzDate = getBudapestDateObj();
    const y = tzDate.getFullYear();
    const m = String(tzDate.getMonth() + 1).padStart(2, '0');
    const d = String(tzDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const getDisplayDate = () => {
    const dateStr = getTodayDate();
    const parts = dateStr.split('-');
    return `Ma (${parts[1]}.${parts[2]}.)`;
};

const isFutureTime = (timeStr) => {
    const tzDate = getBudapestDateObj();
    const currentTotalMins = tzDate.getHours() * 60 + tzDate.getMinutes();
    
    let [h, m] = timeStr.toLowerCase().replace('.', ':').split(':');
    let hInt = parseInt(h, 10);
    let mInt = parseInt(m, 10);
    
    let movieTotalMins = (hInt < 4 ? hInt + 24 : hInt) * 60 + mInt;
    return movieTotalMins >= (currentTotalMins - 15);
};

const normalizeTitle = (text) => {
    if (!text) return "";
    let clean = text.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/&/g, ' es ')
        .replace(/[-–:/|]/g, ' ') 
        .replace(/[^a-z0-9\s]+/g, '') 
        .replace(/\s+/g, ' ')
        .trim();
    clean = clean.replace(/^(a|az|the)\s+/, '');
    clean = clean.replace(/^project\s+/, ''); 
    return clean;
};

const fetchCinemaCityIds = async () => {
    try {
        const url = `https://www.cinemacity.hu/hu/data-api-service/v1/quickbook/10102/cinemas/with-event/until/${getTodayDate()}`;
        const res = await axios.get(url, { timeout: 15000 });
        const map = {};
        if (res.data?.body?.cinemas) {
            res.data.body.cinemas.forEach(c => { map[normalizeTitle(c.displayName)] = c.id; });
        }
        return map;
    } catch (e) { return null; }
};

const getCinemaCityInternalId = (url, moziName, ccMap) => {
    const match = url.match(/\/(\d{4})/);
    if (match) return match[1];
    if (ccMap) {
        const cleanName = normalizeTitle(moziName.replace(/cinema city/i, '').trim());
        for (let key in ccMap) { if (key.includes(cleanName) || cleanName.includes(key)) return ccMap[key]; }
    }
    const dictionary = {
        'allee': '1133', 'westend': '1131', 'arena': '1132', 'mammut': '1144', 
        'campona': '1126', 'debrecen': '1127', 'szeged': '1134', 'pecs': '1130', 
        'gyor': '1128', 'miskolc': '1129', 'alba': '1124', 'nyiregyhaza': '1142', 
        'sopron': '1139', 'savaria': '1138', 'balaton': '1136', 'szolnok': '1137', 
        'zala': '1135', 'dunaplaza': '1141'
    };
    for (const key in dictionary) { if (url.toLowerCase().includes(key)) return dictionary[key]; }
    return null;
};

const scrapeCinemaCity = async (mozi, ccMap) => {
    const internalId = getCinemaCityInternalId(mozi.url, mozi.nev, ccMap);
    if (!internalId) return {};

    const date = getTodayDate();
    const apiUrl = `https://www.cinemacity.hu/hu/data-api-service/v1/quickbook/10102/film-events/in-cinema/${internalId}/at-date/${date}`;

    try {
        const response = await axios.get(apiUrl, { timeout: 15000 });
        const films = response.data?.body?.films || [];
        const events = response.data?.body?.events || [];
        
        let rawTimes = {};
        films.forEach(film => {
            const cleanTitle = normalizeTitle(film.name);
            const filmEvents = events.filter(e => e.filmId === film.id);
            const timeStrings = filmEvents
                .map(e => e.eventDateTime.split('T')[1].substring(0, 5))
                .filter(t => isFutureTime(t));
            
            if (timeStrings.length > 0) {
                if (!rawTimes[cleanTitle]) rawTimes[cleanTitle] = [];
                rawTimes[cleanTitle].push(...timeStrings); 
            }
        });
        return rawTimes;
    } catch (error) { return {}; }
};

const processCinemaData = async (mozi, movies, ccMap) => {
    if (!mozi.url.toLowerCase().includes('cinemacity')) {
        return null; 
    }

    const rawTimes = await scrapeCinemaCity(mozi, ccMap);
    if (!rawTimes || Object.keys(rawTimes).length === 0) return null;

    let finalFormattedData = [];
    const displayDate = getDisplayDate();

    for (let movie of movies) {
        const cleanTargetTitle = normalizeTitle(movie.cim);
        
        let matchedTimes = [];
        for (const [scrapedTitle, times] of Object.entries(rawTimes)) {
            const cst = normalizeTitle(scrapedTitle);
            if (cst === cleanTargetTitle || cst.includes(cleanTargetTitle) || cleanTargetTitle.includes(cst)) {
                matchedTimes.push(...times);
            }
        }

        if (matchedTimes.length > 0) {
            let dailyTimes = [];
            let lastMinutes = -1;
            const uniqueTimesSet = [...new Set(matchedTimes)].sort();
            
            for (let t of uniqueTimesSet) {
                if (!isFutureTime(t)) continue;
                let [h, m] = t.replace('.', ':').split(':');
                if (!m) m = '00';
                let formattedTime = `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
                let hour = parseInt(h, 10);
                let minutes = parseInt(m, 10);

                if ((hour >= 9 && hour <= 23) || hour === 0 || hour === 1) {
                    let currentMinutes = (hour < 4 ? hour + 24 : hour) * 60 + minutes;
                    if (lastMinutes !== -1 && currentMinutes <= lastMinutes + 15) continue; 
                    dailyTimes.push(formattedTime);
                    lastMinutes = currentMinutes;
                }
            }

            if (dailyTimes.length > 0) {
                if (dailyTimes.length > 8) dailyTimes = dailyTimes.slice(0, 8);
                const finalData = `${displayDate}|${dailyTimes.join(', ')}`;
                finalFormattedData.push({ movieId: movie.id, finalData });
            }
        }
    }
    return finalFormattedData;
};

const runCinemaScraper = async () => {
    console.log('🚀 Robot: STABIL CINEMA CITY API ADATGYŰJTÉS elindítva...');
    const startTime = Date.now();

    try {
        await db.query('DELETE FROM media_mozik');
        console.log('🧹 Robot: Régi moziműsor törölve. Keresés folyamatban...');

        const [movies] = await db.query(`SELECT id, cim FROM media WHERE tipus = "film" AND megjelenes_ev_start >= 2026`);
        const [cinemas] = await db.query('SELECT id, nev, url FROM mozik');

        console.log('🌍 Cinema City ID-k lekérése...');
        const ccMap = await fetchCinemaCityIds();

        let processedCount = 0;
        const ccCinemas = cinemas.filter(c => c.url && c.url.toLowerCase().includes('cinemacity'));

        for (const mozi of ccCinemas) {
            try {
                const results = await processCinemaData(mozi, movies, ccMap);
                if (results && results.length > 0) {
                    for (const res of results) {
                        try {
                            await db.query('INSERT IGNORE INTO media_mozik (media_id, mozi_id, idopontok) VALUES (?, ?, ?)', [res.movieId, mozi.id, res.finalData]);
                            const movieName = movies.find(m => m.id === res.movieId)?.cim;
                            console.log(`✅ ${mozi.nev}: "${movieName}" - ${res.finalData}`);
                        } catch (err) {}
                    }
                } else {
                    console.log(`➖ ${mozi.nev}: Nincs mai találat.`);
                }
            } catch (err) {
                console.error(`⚠️ Hiba a(z) ${mozi.nev} mozi feldolgozásakor.`);
            }
            
            processedCount++;
            console.log(`⏳ Folyamat: ${processedCount}/${ccCinemas.length} mozi ellenőrizve...`);
        }

        const endTime = Date.now();
        console.log(`🏆 Robot: Adatgyűjtés BEFEJEZVE! Időtartam: ${((endTime - startTime) / 1000).toFixed(2)} mp.`);
    } catch (error) {
        console.error('❌ Robot kritikus hiba:', error);
    }
};

module.exports = runCinemaScraper;