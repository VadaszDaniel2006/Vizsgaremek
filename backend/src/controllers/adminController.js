const db = require('../config/db');
const bcrypt = require('bcryptjs');

// --- 1. ÖSSZES FELHASZNÁLÓ LISTÁZÁSA (JAVÍTVA: AVATAR FALLBACK) ---
exports.getAllUsers = async (req, res) => {
    try {
        // COALESCE: Ha az avatar NULL, az alapértelmezett URL-t adja vissza
        const sql = `
            SELECT 
                id, 
                nev, 
                felhasznalonev AS username, 
                email, 
                jogosultsag AS role, 
                regisztracio_datum, 
                COALESCE(avatar, 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png') AS avatar 
            FROM felhasznalok 
            ORDER BY regisztracio_datum DESC
        `;
        const [users] = await db.query(sql);
        res.json(users);
    } catch (error) {
        console.error("Hiba a felhasználók lekérésekor:", error);
        res.status(500).json({ message: 'Szerver hiba az adatok lekérésekor.' });
    }
};

// --- 2. FELHASZNÁLÓ TÖRLÉSE ---
exports.deleteUser = async (req, res) => {
    const id = req.params.id;
    try {
        // Kapcsolódó adatok törlése az új táblanevekkel
        await db.query('DELETE FROM ertekelesek WHERE felhasznalo_id = ?', [id]);
        await db.query('DELETE FROM kedvencek WHERE felhasznalo_id = ?', [id]);
        
        await db.query('DELETE FROM sajat_lista_elemek WHERE lista_id IN (SELECT id FROM sajat_listak WHERE felhasznalo_id = ?)', [id]);
        await db.query('DELETE FROM sajat_listak WHERE felhasznalo_id = ?', [id]);

        await db.query('DELETE FROM felhasznalok WHERE id = ?', [id]);
        
        res.json({ message: 'Felhasználó sikeresen törölve.' });
    } catch (error) {
        console.error("Törlési hiba:", error);
        res.status(500).json({ message: 'Hiba a törléskor.' });
    }
};

// --- 3. FELHASZNÁLÓ SZERKESZTÉSE ---
exports.updateUser = async (req, res) => {
    const id = req.params.id;
    const { email, password, role } = req.body;

    try {
        const [existing] = await db.query('SELECT id FROM felhasznalok WHERE email = ? AND id != ?', [email, id]);
        
        if (existing.length > 0) {
            return res.status(400).json({ message: "Ez az email cím már foglalt!" });
        }

        let sql;
        let params;

        if (password && password.trim() !== "") {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            
            sql = 'UPDATE felhasznalok SET email = ?, jogosultsag = ?, jelszo_hash = ? WHERE id = ?';
            params = [email, role, hashedPassword, id];
        } else {
            sql = 'UPDATE felhasznalok SET email = ?, jogosultsag = ? WHERE id = ?';
            params = [email, role, id];
        }

        await db.query(sql, params);
        res.json({ message: "Sikeres frissítés!", user: { id, email, role } });

    } catch (error) {
        console.error("Frissítési hiba:", error);
        res.status(500).json({ message: 'Hiba a frissítéskor.' });
    }
};