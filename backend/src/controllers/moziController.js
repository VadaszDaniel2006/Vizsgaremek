const db = require('../config/db');

// 1. Összes mozi lekérése
const getOsszesMozi = async (req, res) => {
    try {
        const [mozik] = await db.query('SELECT * FROM mozik');
        res.status(200).json(mozik);
    } catch (error) {
        console.error("Hiba a mozik lekérdezésekor:", error);
        res.status(500).json({ message: "Szerverhiba történt a mozik betöltésekor." });
    }
};

// 2. Egy film mozijainak lekérése (KIBŐVÍTVE AZ IDŐPONTOKKAL)
const getMozikForMedia = async (req, res) => {
    const mediaId = req.params.id;
    try {
        const [mozik] = await db.query(`
            SELECT m.id, m.nev, m.varos, m.url, mm.idopontok 
            FROM mozik m
            JOIN media_mozik mm ON m.id = mm.mozi_id
            WHERE mm.media_id = ?
        `, [mediaId]);
        res.status(200).json(mozik);
    } catch (error) {
        res.status(500).json({ message: "Hiba a mozik betöltésekor." });
    }
};

// 3. Egy film platformjainak lekérése
const getPlatformokForMedia = async (req, res) => {
    const mediaId = req.params.id;
    try {
        const [platformok] = await db.query(`
            SELECT p.id, p.nev, p.logo_url, mp.kozvetlen_link 
            FROM platformok p
            JOIN media_platformok mp ON p.id = mp.platform_id
            WHERE mp.media_id = ?
        `, [mediaId]);
        res.status(200).json(platformok);
    } catch (error) {
        res.status(500).json({ message: "Hiba a platformok betöltésekor." });
    }
};

module.exports = {
    getOsszesMozi,
    getMozikForMedia,
    getPlatformokForMedia
};