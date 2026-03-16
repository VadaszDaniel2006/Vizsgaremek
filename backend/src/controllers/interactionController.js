const db = require('../config/db');

async function updateAverageRating(mediaId) {
    try {
        const FALLBACK_RATING = 8.0; 
        const [baseData] = await db.query(`SELECT alap_rating FROM media WHERE id = ?`, [mediaId]);
        const baseRating = (baseData[0] && baseData[0].alap_rating) ? parseFloat(baseData[0].alap_rating) : FALLBACK_RATING;

        const [stats] = await db.query(`SELECT SUM(pontszam) as total_score, COUNT(*) as vote_count FROM ertekelesek WHERE media_id = ?`, [mediaId]);

        const userTotalScore = stats[0].total_score ? parseFloat(stats[0].total_score) : 0;
        const userVoteCount = stats[0].vote_count ? parseInt(stats[0].vote_count) : 0;

        const finalRating = (baseRating + userTotalScore) / (1 + userVoteCount);
        const roundedRating = finalRating.toFixed(1);

        await db.query(`UPDATE media SET rating = ? WHERE id = ?`, [roundedRating, mediaId]);
    } catch (err) { console.error("Hiba az átlag frissítésekor:", err); }
}

exports.addToFavorites = async (req, res) => {
    const { userId, filmId, sorozatId } = req.body;
    const mediaId = filmId || sorozatId;
    if (!userId || !mediaId) return res.status(400).json({ message: "Hiányzó adatok!" });
    try {
        const [existing] = await db.query('SELECT * FROM kedvencek WHERE felhasznalo_id = ? AND media_id = ?', [userId, mediaId]);
        if (existing.length > 0) return res.status(400).json({ message: "Már a kedvencek között van!" });
        await db.query('INSERT INTO kedvencek (felhasznalo_id, media_id, hozzaadva) VALUES (?, ?, NOW())', [userId, mediaId]);
        res.status(200).json({ message: "Hozzáadva a kedvencekhez!" });
    } catch (err) { console.error(err); res.status(500).json({ message: "Szerver hiba" }); }
};

exports.getFavorites = async (req, res) => {
    const { userId } = req.params;
    try {
        const query = `SELECT k.id, k.hozzaadva AS added_at, m.id as media_id, m.tipus, m.cim as title, m.poszter_url as poster, m.leiras, m.rating, m.megjelenes_ev_start as start_year, m.megjelenes_ev_end as end_year FROM kedvencek k JOIN media m ON k.media_id = m.id WHERE k.felhasznalo_id = ? ORDER BY k.hozzaadva DESC`;
        const [results] = await db.query(query, [userId]);
        const formattedResults = results.map(item => {
            const formattedItem = { id: item.id, added_at: item.added_at };
            if (item.tipus === 'film') {
                formattedItem.film_id = item.media_id; formattedItem.film_cim = item.title; formattedItem.film_poster = item.poster; formattedItem.film_leiras = item.leiras; formattedItem.film_rating = item.rating; formattedItem.film_ev = item.start_year;
            } else {
                formattedItem.sorozat_id = item.media_id; formattedItem.sorozat_cim = item.title; formattedItem.sorozat_poster = item.poster; formattedItem.sorozat_leiras = item.leiras; formattedItem.sorozat_rating = item.rating; formattedItem.sorozat_ev = item.start_year;
            }
            return formattedItem;
        });
        for (const item of formattedResults) {
            const currentMediaId = item.film_id || item.sorozat_id;
            try { const [platforms] = await db.query(`SELECT p.id, p.nev, p.logo_url, p.weboldal_url FROM media_platformok mp JOIN platformok p ON mp.platform_id = p.id WHERE mp.media_id = ?`, [currentMediaId]); item.platformok = platforms || []; } catch (pErr) { item.platformok = []; }
        }
        res.status(200).json(formattedResults);
    } catch (err) { console.error(err); res.status(500).json({ message: "Szerver hiba." }); }
};

exports.removeFromFavorites = async (req, res) => {
    const { userId, itemId, filmId, sorozatId } = req.body;
    const mediaId = filmId || sorozatId;
    try {
        let sql = 'DELETE FROM kedvencek WHERE felhasznalo_id = ?'; const params = [userId];
        if (itemId) { sql += ' AND id = ?'; params.push(itemId); } else if (mediaId) { sql += ' AND media_id = ?'; params.push(mediaId); } else { return res.status(400).json({ message: "Hiányzó azonosító!" }); }
        await db.query(sql, params);
        res.status(200).json({ message: "Törölve." });
    } catch (err) { console.error(err); res.status(500).json({ message: "Hiba törléskor." }); }
};

exports.addToMyList = async (req, res) => {
    const { userId, filmId, sorozatId } = req.body;
    const mediaId = filmId || sorozatId;
    if (!userId || !mediaId) return res.status(400).json({ message: "Nincs bejelentkezve, vagy hiányzó adat!" });
    try {
        let [lists] = await db.query('SELECT id FROM sajat_listak WHERE felhasznalo_id = ? LIMIT 1', [userId]);
        let listId;
        if (lists.length === 0) { const [newList] = await db.query('INSERT INTO sajat_listak (felhasznalo_id, cim, publikus, letrehozva) VALUES (?, "Saját listám", 0, NOW())', [userId]); listId = newList.insertId; } else { listId = lists[0].id; }
        const [existingItem] = await db.query('SELECT * FROM sajat_lista_elemek WHERE lista_id = ? AND media_id = ?', [listId, mediaId]);
        if (existingItem.length > 0) return res.status(400).json({ message: "Ez a tétel már a listádon van!" });
        await db.query('INSERT INTO sajat_lista_elemek (lista_id, media_id, hozzaadva) VALUES (?, ?, NOW())', [listId, mediaId]);
        res.status(200).json({ message: "Hozzáadva a saját listához!" });
    } catch (err) { console.error(err); res.status(500).json({ message: "Szerver hiba" }); }
};

exports.getMyList = async (req, res) => {
    const { userId } = req.params;
    try {
        const query = `SELECT cli.id, cli.hozzaadva AS added_at, m.id as media_id, m.tipus, m.cim as title, m.poszter_url as poster, m.leiras, m.rating, m.megjelenes_ev_start as start_year FROM sajat_lista_elemek cli JOIN sajat_listak cl ON cli.lista_id = cl.id JOIN media m ON cli.media_id = m.id WHERE cl.felhasznalo_id = ? ORDER BY cli.hozzaadva DESC`;
        const [results] = await db.query(query, [userId]);
        const formattedResults = results.map(item => {
            const formattedItem = { id: item.id, added_at: item.added_at };
            if (item.tipus === 'film') {
                formattedItem.film_id = item.media_id; formattedItem.film_cim = item.title; formattedItem.film_poster = item.poster; formattedItem.film_leiras = item.leiras; formattedItem.film_rating = item.rating; formattedItem.film_ev = item.start_year;
            } else {
                formattedItem.sorozat_id = item.media_id; formattedItem.sorozat_cim = item.title; formattedItem.sorozat_poster = item.poster; formattedItem.sorozat_leiras = item.leiras; formattedItem.sorozat_rating = item.rating; formattedItem.sorozat_ev = item.start_year;
            }
            return formattedItem;
        });
        res.status(200).json(formattedResults);
    } catch (err) { console.error(err); res.status(500).json({ message: "Szerver hiba" }); }
};

exports.removeFromMyList = async (req, res) => {
    const { userId, itemId, filmId, sorozatId } = req.body; 
    const mediaId = filmId || sorozatId;
    try {
        const [lists] = await db.query('SELECT id FROM sajat_listak WHERE felhasznalo_id = ? LIMIT 1', [userId]);
        if (lists.length === 0) return res.status(404).json({ message: "Nincs listád." });
        let sql = 'DELETE FROM sajat_lista_elemek WHERE lista_id = ?'; const params = [lists[0].id];
        if (itemId) { sql += ' AND id = ?'; params.push(itemId); } else if (mediaId) { sql += ' AND media_id = ?'; params.push(mediaId); } else { return res.status(400).json({ message: "Hiányzó azonosító!" }); }
        await db.query(sql, params);
        res.status(200).json({ message: "Törölve." });
    } catch (err) { console.error(err); res.status(500).json({ message: "Hiba törléskor." }); }
};

exports.getReviews = async (req, res) => {
    try {
        const [results] = await db.query(`SELECT r.id, r.szoveg as comment, r.pontszam as rating, r.letrehozva as created_at, u.felhasznalonev as username, u.avatar FROM ertekelesek r JOIN felhasznalok u ON r.felhasznalo_id = u.id WHERE r.media_id = ? ORDER BY r.letrehozva DESC`, [req.params.id]);
        res.status(200).json(results);
    } catch (err) { console.error(err); res.status(500).json({ message: "Szerver hiba." }); }
};

exports.addReview = async (req, res) => {
    const { userId, filmId, sorozatId, comment, rating } = req.body;
    const mediaId = filmId || sorozatId;
    if (!userId) return res.status(401).json({ message: "Jelentkezz be!" });
    if (!rating) return res.status(400).json({ message: "Pontszám kötelező!" });
    if (!comment || comment.trim() === "") return res.status(400).json({ message: "Vélemény kötelező!" });
    try {
        const [existing] = await db.query('SELECT id FROM ertekelesek WHERE felhasznalo_id = ? AND media_id = ?', [userId, mediaId]);
        if (existing.length > 0) return res.status(400).json({ message: "Már értékelted!" });
        await db.query('INSERT INTO ertekelesek (felhasznalo_id, media_id, szoveg, pontszam, letrehozva) VALUES (?, ?, ?, ?, NOW())', [userId, mediaId, comment, rating]);
        await updateAverageRating(mediaId);
        res.status(200).json({ message: "Vélemény elküldve!" });
    } catch (err) { console.error(err); res.status(500).json({ message: "Szerver hiba." }); }
};

exports.deleteReview = async (req, res) => {
    const { userId, reviewId } = req.body;
    try {
        const [userRows] = await db.query('SELECT jogosultsag FROM felhasznalok WHERE id = ?', [userId]);
        const isAdmin = userRows.length > 0 && userRows[0].jogosultsag === 'admin';
        const [review] = await db.query('SELECT media_id, felhasznalo_id FROM ertekelesek WHERE id = ?', [reviewId]);
        if (review.length === 0) return res.status(404).json({ message: "A vélemény nem található." });
        if (review[0].felhasznalo_id !== userId && !isAdmin) return res.status(403).json({ message: "Nincs jogosultságod törölni ezt a véleményt!" });
        await db.query('DELETE FROM ertekelesek WHERE id = ?', [reviewId]);
        await updateAverageRating(review[0].media_id);
        res.status(200).json({ message: "Sikeresen törölve!" });
    } catch (err) { console.error(err); res.status(500).json({ message: "Szerver hiba." }); }
};

exports.checkStatus = async (req, res) => {
    const { userId, filmId, sorozatId } = req.body;
    const mediaId = filmId || sorozatId;
    if (!userId) return res.status(200).json({ reviewed: false, favorite: false, listed: false });
    try {
        const [review] = await db.query('SELECT id FROM ertekelesek WHERE felhasznalo_id = ? AND media_id = ?', [userId, mediaId]);
        const [favorite] = await db.query('SELECT id FROM kedvencek WHERE felhasznalo_id = ? AND media_id = ?', [userId, mediaId]);
        let listed = false;
        const [lists] = await db.query('SELECT id FROM sajat_listak WHERE felhasznalo_id = ? LIMIT 1', [userId]);
        if (lists.length > 0) {
            const [item] = await db.query('SELECT id FROM sajat_lista_elemek WHERE lista_id = ? AND media_id = ?', [lists[0].id, mediaId]);
            if (item.length > 0) listed = true;
        }
        res.status(200).json({ reviewed: review.length > 0, favorite: favorite.length > 0, listed: listed });
    } catch (err) { console.error(err); res.status(500).json({ message: "Szerver hiba" }); }
};

// --- BIZTONSÁGOS JELENTÉS BEKÜLDÉSE (FALLBACK-KEL) ---
exports.reportReview = async (req, res) => {
    const { reviewId } = req.params;
    const { reason, userId } = req.body; 
    try {
        // 1. Megpróbáljuk a módosított adatbázis szerint (indoklással) menteni
        await db.query('UPDATE ertekelesek SET jelentve = 1, jelentes_oka = ?, jelento_id = ? WHERE id = ?', [reason || 'Egyéb', userId || null, reviewId]);
        res.status(200).json({ message: "Köszönjük! A véleményt jelentetted az adminoknak." });
    } catch (err) { 
        console.error("Hiba az indoklás mentésénél (hiányzó Docker oszlop?):", err.message);
        
        // 2. Ha a Docker DB-ből hiányzik a 'jelentes_oka' oszlop, akkor is végrehajtjuk a jelentést!
        try {
            await db.query('UPDATE ertekelesek SET jelentve = 1 WHERE id = ?', [reviewId]);
            res.status(200).json({ message: "Vélemény sikeresen jelentve!" });
        } catch (fallbackErr) {
            console.error("Teljes SQL hiba a jelentésnél:", fallbackErr.message);
            res.status(500).json({ message: "Szerver hiba." }); 
        }
    }
};