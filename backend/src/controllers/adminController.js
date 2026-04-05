const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getAllUsers = async (req, res) => {
    try {
        const sql = `SELECT id, nev, felhasznalonev AS username, email, jogosultsag AS role, regisztracio_datum, COALESCE(avatar, 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png') AS avatar FROM felhasznalok ORDER BY regisztracio_datum DESC`;
        const [users] = await db.query(sql); res.json(users);
    } catch (error) { res.status(500).json({ message: 'Szerver hiba.' }); }
};

exports.deleteUser = async (req, res) => {
    const id = req.params.id;
    try {
        await db.query('DELETE FROM ertekelesek WHERE felhasznalo_id = ?', [id]); 
        await db.query('DELETE FROM kedvencek WHERE felhasznalo_id = ?', [id]); 
        await db.query('DELETE FROM sajat_lista_elemek WHERE lista_id IN (SELECT id FROM sajat_listak WHERE felhasznalo_id = ?)', [id]); 
        await db.query('DELETE FROM sajat_listak WHERE felhasznalo_id = ?', [id]); 
        await db.query('DELETE FROM felhasznalok WHERE id = ?', [id]);
        res.json({ message: 'Felhasználó sikeresen törölve.' });
    } catch (error) { res.status(500).json({ message: 'Hiba a törléskor.' }); }
};

exports.updateUser = async (req, res) => {
    const id = req.params.id; const { email, password, role } = req.body;
    try {
        const [existing] = await db.query('SELECT id FROM felhasznalok WHERE email = ? AND id != ?', [email, id]);
        if (existing.length > 0) return res.status(400).json({ message: "Ez az email cím már foglalt!" });
        let sql, params;
        if (password && password.trim() !== "") {
            const salt = await bcrypt.genSalt(10); const hashedPassword = await bcrypt.hash(password, salt);
            sql = 'UPDATE felhasznalok SET email = ?, jogosultsag = ?, jelszo_hash = ? WHERE id = ?'; params = [email, role, hashedPassword, id];
        } else {
            sql = 'UPDATE felhasznalok SET email = ?, jogosultsag = ? WHERE id = ?'; params = [email, role, id];
        }
        await db.query(sql, params); res.json({ message: "Sikeres frissítés!", user: { id, email, role } });
    } catch (error) { res.status(500).json({ message: 'Hiba a frissítéskor.' }); }
};

exports.getReportedReviews = async (req, res) => {
    try {
        const sql = `
            SELECT 
                r.id, r.szoveg as comment, r.pontszam as rating, r.letrehozva as created_at, 
                r.jelentes_oka as report_reason, 
                u.felhasznalonev as username, 
                m.cim as media_title,
                reporter_user.felhasznalonev AS reporter_username
            FROM ertekelesek r 
            JOIN felhasznalok u ON r.felhasznalo_id = u.id 
            JOIN media m ON r.media_id = m.id 
            LEFT JOIN felhasznalok reporter_user ON r.jelento_id = reporter_user.id
            WHERE r.jelentve = 1 
            ORDER BY r.letrehozva DESC
        `;
        const [reviews] = await db.query(sql); res.json(reviews);
    } catch (error) { res.status(500).json({ message: 'Szerver hiba.' }); }
};

exports.dismissReport = async (req, res) => {
    try {
        await db.query('UPDATE ertekelesek SET jelentve = 0, jelentes_oka = NULL WHERE id = ?', [req.params.id]);
        res.json({ message: 'Jelentés elutasítva.' });
    } catch (error) { res.status(500).json({ message: 'Szerver hiba.' }); }
};

exports.deleteReportedReview = async (req, res) => {
    const { id } = req.params;
    try {
        const [review] = await db.query('SELECT media_id FROM ertekelesek WHERE id = ?', [id]);
        if (review.length === 0) return res.status(404).json({ message: "A komment nem található." });
        const mediaId = review[0].media_id;

        await db.query('DELETE FROM ertekelesek WHERE id = ?', [id]);

        const FALLBACK_RATING = 8.0;
        const [baseData] = await db.query(`SELECT alap_rating FROM media WHERE id = ?`, [mediaId]);
        const baseRating = (baseData[0] && baseData[0].alap_rating) ? parseFloat(baseData[0].alap_rating) : FALLBACK_RATING;
        const [stats] = await db.query(`SELECT SUM(pontszam) as total_score, COUNT(*) as vote_count FROM ertekelesek WHERE media_id = ?`, [mediaId]);
        const userTotalScore = stats[0].total_score ? parseFloat(stats[0].total_score) : 0;
        const userVoteCount = stats[0].vote_count ? parseInt(stats[0].vote_count) : 0;
        const finalRating = (baseRating + userTotalScore) / (1 + userVoteCount);
        
        await db.query(`UPDATE media SET rating = ? WHERE id = ?`, [finalRating.toFixed(1), mediaId]);
        res.json({ message: 'Komment véglegesen törölve.' });
    } catch (error) { res.status(500).json({ message: 'Szerver hiba a törlés során.' }); }
};

exports.getAllMozik = async (req, res) => {
    try {
        const [mozik] = await db.query('SELECT id, nev, varos FROM mozik ORDER BY varos, nev');
        res.json(mozik);
    } catch (error) {
        console.error("Hiba a mozik lekérésekor:", error);
        res.status(500).json({ message: 'Szerver hiba.' });
    }
};

exports.getAllCategories = async (req, res) => {
    try {
        const [kategoriak] = await db.query('SELECT id, nev FROM kategoriak ORDER BY nev ASC');
        res.json(kategoriak);
    } catch (error) {
        console.error("Hiba a kategóriák lekérésekor:", error);
        res.status(500).json({ message: 'Szerver hiba.' });
    }
};

exports.getAllMedia = async (req, res) => {
    try {
        const sql = `
            SELECT m.*, r.nev AS rendezo_nev, r.nemzetiseg AS nemzetiseg_nev, k.nev AS kategoria_nev,
                   (SELECT platform_id FROM media_platformok WHERE media_id = m.id LIMIT 1) AS platform_id,
                   (SELECT GROUP_CONCAT(mozi_id) FROM media_mozik WHERE media_id = m.id) AS mozi_ids_raw
            FROM media m 
            LEFT JOIN rendezok r ON m.rendezo_id = r.id 
            LEFT JOIN kategoriak k ON m.kategoria_id = k.id
            ORDER BY m.id DESC
        `;
        const [media] = await db.query(sql);

        const mappedMedia = media.map(m => {
            let mozi_ids = [];
            if (m.mozi_ids_raw) {
                mozi_ids = m.mozi_ids_raw.split(',').map(Number);
            }
            delete m.mozi_ids_raw;
            return { ...m, mozi_ids };
        });

        res.json(mappedMedia);
    } catch (error) { 
        console.error("Hiba a media lekérésekor:", error);
        res.status(500).json({ message: 'Szerver hiba.' }); 
    }
};

exports.deleteMedia = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM ertekelesek WHERE media_id = ?', [id]); 
        await db.query('DELETE FROM kedvencek WHERE media_id = ?', [id]); 
        await db.query('DELETE FROM sajat_lista_elemek WHERE media_id = ?', [id]); 
        await db.query('DELETE FROM media_platformok WHERE media_id = ?', [id]); 
        await db.query('DELETE FROM media_mozik WHERE media_id = ?', [id]); 
     
        await db.query('DELETE FROM media WHERE id = ?', [id]);
        res.json({ message: 'Tartalom sikeresen törölve.' });
    } catch (error) { 
        console.error("Hiba a tartalom törlésekor:", error);
        res.status(500).json({ message: 'Hiba a tartalom törlésekor.' }); 
    }
};

exports.addMedia = async (req, res) => {
    const { tipus, cim, leiras, poszter_url, elozetes_url, megjelenes_ev_start, megjelenes_ev_end, evadok_szama, hossz_perc, kategoria_id, alap_rating, rendezo_nev, nemzetiseg_nev, platform_id, mozi_ids, premier_datum } = req.body;
    
    if (!cim || !leiras || !poszter_url || !megjelenes_ev_start) {
        return res.status(400).json({ message: "A kötelező mezőket ki kell tölteni!" });
    }
    
    try {
       let newId;
        if (tipus === 'film') {
            const [result] = await db.query("SELECT MAX(id) as maxId FROM media WHERE tipus = 'film' AND id < 1000");
            newId = (result[0].maxId || 0) + 1;
        } else {
            const [result] = await db.query("SELECT MAX(id) as maxId FROM media WHERE tipus = 'sorozat' AND id >= 1000");
            newId = (result[0].maxId || 1000) + 1; 
        }

        let finalRendezoId = null;
        if (rendezo_nev && rendezo_nev.trim() !== '') {
            const [existingDir] = await db.query('SELECT id FROM rendezok WHERE nev = ? LIMIT 1', [rendezo_nev.trim()]);
            if (existingDir.length > 0) {
                finalRendezoId = existingDir[0].id; 
                if (nemzetiseg_nev && nemzetiseg_nev.trim() !== '') {
                    await db.query('UPDATE rendezok SET nemzetiseg = ? WHERE id = ?', [nemzetiseg_nev.trim(), finalRendezoId]);
                }
            } else {
                const finalNemzetiseg = (nemzetiseg_nev && nemzetiseg_nev.trim() !== '') ? nemzetiseg_nev.trim() : null;
                const [newDir] = await db.query('INSERT INTO rendezok (nev, nemzetiseg) VALUES (?, ?)', [rendezo_nev.trim(), finalNemzetiseg]);
                finalRendezoId = newDir.insertId; 
            }
        }

        const finalRating = alap_rating ? parseFloat(alap_rating) : 8.0;
        const finalEvStart = megjelenes_ev_start ? parseInt(megjelenes_ev_start) : null;
        const finalEvEnd = (tipus === 'sorozat' && megjelenes_ev_end && megjelenes_ev_end.trim() !== '') ? megjelenes_ev_end : null;
        const finalEvadok = (tipus === 'sorozat' && evadok_szama) ? parseInt(evadok_szama) : null;
        const finalHossz = (tipus === 'film' && hossz_perc) ? parseInt(hossz_perc) : null;
        const finalKategoria = (kategoria_id && kategoria_id.trim() !== '') ? kategoria_id : null;
        const finalPremier = premier_datum || null;

        const sql = `INSERT INTO media 
            (id, tipus, cim, leiras, poszter_url, elozetes_url, megjelenes_ev_start, megjelenes_ev_end, evadok_szama, hossz_perc, alap_rating, kategoria_id, rating, rendezo_id, premier_datum) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            
        const params = [ newId, tipus, cim, leiras, poszter_url, elozetes_url || null, finalEvStart, finalEvEnd, finalEvadok, finalHossz, finalRating, finalKategoria, finalRating, finalRendezoId, finalPremier ];
        
        await db.query(sql, params); 

        if (platform_id && platform_id !== '') {
            await db.query('INSERT INTO media_platformok (media_id, platform_id) VALUES (?, ?)', [newId, parseInt(platform_id)]);
        }

        if (mozi_ids && Array.isArray(mozi_ids) && mozi_ids.length > 0) {
            for (let moziId of mozi_ids) {
                await db.query('INSERT INTO media_mozik (media_id, mozi_id) VALUES (?, ?)', [newId, parseInt(moziId)]);
            }
        }

        res.status(201).json({ message: "Sikeresen feltöltve az adatbázisba!" });
    } catch (error) { 
        console.error("Hiba a feltöltésnél:", error);
        res.status(500).json({ message: "Szerver hiba a feltöltés során." }); 
    }
};

exports.updateMedia = async (req, res) => {
    const { id } = req.params;
    const { tipus, cim, leiras, poszter_url, elozetes_url, megjelenes_ev_start, megjelenes_ev_end, evadok_szama, hossz_perc, kategoria_id, alap_rating, rendezo_nev, nemzetiseg_nev, platform_id, mozi_ids, premier_datum } = req.body;
    
    if (!cim || !leiras || !poszter_url || !megjelenes_ev_start) {
        return res.status(400).json({ message: "A kötelező mezőket ki kell tölteni!" });
    }

    try {
        let finalRendezoId = null;
        if (rendezo_nev && rendezo_nev.trim() !== '') {
            const [existingDir] = await db.query('SELECT id FROM rendezok WHERE nev = ? LIMIT 1', [rendezo_nev.trim()]);
            if (existingDir.length > 0) {
                finalRendezoId = existingDir[0].id;
                if (nemzetiseg_nev && nemzetiseg_nev.trim() !== '') {
                    await db.query('UPDATE rendezok SET nemzetiseg = ? WHERE id = ?', [nemzetiseg_nev.trim(), finalRendezoId]);
                }
            } else {
                const finalNemzetiseg = (nemzetiseg_nev && nemzetiseg_nev.trim() !== '') ? nemzetiseg_nev.trim() : null;
                const [newDir] = await db.query('INSERT INTO rendezok (nev, nemzetiseg) VALUES (?, ?)', [rendezo_nev.trim(), finalNemzetiseg]);
                finalRendezoId = newDir.insertId;
            }
        }

        const finalRating = alap_rating ? parseFloat(alap_rating) : 8.0;
        const finalEvStart = megjelenes_ev_start ? parseInt(megjelenes_ev_start) : null;
        const finalEvEnd = (tipus === 'sorozat' && megjelenes_ev_end && megjelenes_ev_end.trim() !== '') ? megjelenes_ev_end : null;
        const finalEvadok = (tipus === 'sorozat' && evadok_szama) ? parseInt(evadok_szama) : null;
        const finalHossz = (tipus === 'film' && hossz_perc) ? parseInt(hossz_perc) : null;
        const finalKategoria = (kategoria_id && kategoria_id.trim() !== '') ? kategoria_id : null;
        const finalPremier = premier_datum || null;

        const sql = `UPDATE media SET 
            tipus = ?, cim = ?, leiras = ?, poszter_url = ?, elozetes_url = ?, 
            megjelenes_ev_start = ?, megjelenes_ev_end = ?, evadok_szama = ?, 
            hossz_perc = ?, kategoria_id = ?, alap_rating = ?, rendezo_id = ?, premier_datum = ?
            WHERE id = ?`;
            
        const params = [ tipus, cim, leiras, poszter_url, elozetes_url || null, finalEvStart, finalEvEnd, finalEvadok, finalHossz, finalKategoria, finalRating, finalRendezoId, finalPremier, id ];
        
        await db.query(sql, params); 

        await db.query('DELETE FROM media_platformok WHERE media_id = ?', [id]);
        if (platform_id && platform_id !== '') {
            await db.query('INSERT INTO media_platformok (media_id, platform_id) VALUES (?, ?)', [id, parseInt(platform_id)]);
        }

        await db.query('DELETE FROM media_mozik WHERE media_id = ?', [id]);
        if (mozi_ids && Array.isArray(mozi_ids) && mozi_ids.length > 0) {
            for (let moziId of mozi_ids) {
                await db.query('INSERT INTO media_mozik (media_id, mozi_id) VALUES (?, ?)', [id, parseInt(moziId)]);
            }
        }

        res.json({ message: "Sikeresen frissítve!" });
    } catch (error) { 
        console.error("Hiba a frissítésnél:", error);
        res.status(500).json({ message: "Szerver hiba a frissítés során." }); 
    }
};