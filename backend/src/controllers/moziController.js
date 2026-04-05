const db = require('../config/db');

const getOsszesMozi = async (req, res) => {
    try {
        const [mozik] = await db.query('SELECT * FROM mozik');
        res.status(200).json(mozik);
    } catch (error) {
        console.error("Hiba a mozik lekérdezésekor:", error);
        res.status(500).json({ message: "Szerverhiba történt a mozik betöltésekor." });
    }
};


const getMozikForMedia = async (req, res) => {
    const mediaId = req.params.id;
    try {
        const [mozik] = await db.query(`
            SELECT m.id, m.nev, m.varos, m.url, mm.idopontok 
            FROM mozik m
            JOIN media_mozik mm ON m.id = mm.mozi_id
            WHERE mm.media_id = ?
        `, [mediaId]);

        const egyediMozikMap = new Map();
        mozik.forEach(mozi => {
            if (!egyediMozikMap.has(mozi.id)) egyediMozikMap.set(mozi.id, mozi);
        });
        const egyediMozik = Array.from(egyediMozikMap.values());

        const bpTime = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Budapest' }));
        const jelenlegiPerc = bpTime.getHours() * 60 + bpTime.getMinutes();

  
        const szurtMozik = egyediMozik.map(mozi => {
            if (!mozi.idopontok) return null;

            let idokSzoveg = mozi.idopontok;
            let datumResz = "";
            

            if (idokSzoveg.includes('|')) {
                const parts = idokSzoveg.split('|');
                datumResz = parts[0] + '|';
                idokSzoveg = parts[1];
            }

            const idopontTomb = idokSzoveg.split(',').map(i => i.trim());
            const jovoBeliIdopontok = idopontTomb.filter(ido => {
                const [ora, perc] = ido.split(':').map(Number);
                if (isNaN(ora) || isNaN(perc)) return false;
                
                let moziPerc = (ora * 60) + perc;

                if (ora === 0 || ora === 1) moziPerc += 24 * 60;
                
                return moziPerc >= jelenlegiPerc; 
            });

            if (jovoBeliIdopontok.length > 0) {
                mozi.idopontok = datumResz + jovoBeliIdopontok.join(', ');
                return mozi;
            } else {
  
                return null;
            }
        }).filter(mozi => mozi !== null);

        res.status(200).json(szurtMozik);
    } catch (error) {
        res.status(500).json({ message: "Hiba a mozik betöltésekor." });
    }
};


const getPlatformokForMedia = async (req, res) => {
    const mediaId = req.params.id;
    try {
        const [platformok] = await db.query(`
            SELECT p.id, p.nev, p.logo_url, IFNULL(p.weboldal_url, '#') AS url 
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