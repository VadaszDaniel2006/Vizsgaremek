const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); 


exports.register = async (req, res) => {
    const { name, email, password, username, favoriteCategories } = req.body;

    if (!name || !email || !password || !username) {
        return res.status(400).json({ message: 'Minden mező kitöltése kötelező!' });
    }

    try {
        const [existing] = await db.query('SELECT * FROM felhasznalok WHERE email = ? OR felhasznalonev = ?', [email, username]);
        
        if (existing.length > 0) {
            if (existing[0].email === email) return res.status(400).json({ message: 'Ez az email cím már foglalt!' });
            if (existing[0].felhasznalonev === username) return res.status(400).json({ message: 'Ez a felhasználónév már foglalt!' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const defaultAvatar = "https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png";

        const sql = `INSERT INTO felhasznalok (nev, email, jelszo_hash, felhasznalonev, jogosultsag, regisztracio_datum, avatar) VALUES (?, ?, ?, ?, 'user', NOW(), ?)`;
        const [result] = await db.query(sql, [name, email, hashedPassword, username, defaultAvatar]);
        const newUserId = result.insertId;

        try {
            await db.query('INSERT INTO sajat_listak (felhasznalo_id, cim, publikus, letrehozva) VALUES (?, ?, 0, NOW())', [newUserId, 'Saját listám']);
        } catch (e) { console.warn("Lista létrehozási hiba:", e.message); }

        if (favoriteCategories && Array.isArray(favoriteCategories) && favoriteCategories.length > 0) {
            const categoryValues = favoriteCategories.map(cat => [newUserId, cat]);
            await db.query('INSERT INTO kedvenc_kategoriak (felhasznalo_id, kategoria_id) VALUES ?', [categoryValues]);
        }

        res.status(201).json({ message: 'Sikeres regisztráció!' });

    } catch (error) {
        console.error("Regisztrációs hiba:", error);
        res.status(500).json({ message: 'Szerver hiba történt.' });
    }
};


exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ message: 'Email és jelszó kötelező!' });

    try {
        const [users] = await db.query('SELECT * FROM felhasznalok WHERE email = ?', [email]);
        if (users.length === 0) return res.status(400).json({ message: 'Hibás email vagy jelszó!' });

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.jelszo_hash);
        if (!isMatch) return res.status(400).json({ message: 'Hibás email vagy jelszó!' });

        let favoriteCategoriesList = [];
        try {
            const [categoriesDB] = await db.query('SELECT kategoria_id FROM kedvenc_kategoriak WHERE felhasznalo_id = ?', [user.id]);
            favoriteCategoriesList = categoriesDB.map(row => row.kategoria_id);
        } catch (e) { console.warn("Kategória betöltési hiba:", e.message); }

        const token = jwt.sign({ id: user.id, role: user.jogosultsag }, process.env.JWT_SECRET || 'titkoskulcs', { expiresIn: '2h' });

        res.json({
            token,
            user: {
                id: user.id,
                name: user.nev,
                username: user.felhasznalonev, 
                email: user.email,
                avatar: user.avatar || "https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png",
                role: user.jogosultsag, 
                favoriteCategories: favoriteCategoriesList
            }
        });

    } catch (error) {
        console.error("Login hiba:", error);
        res.status(500).json({ message: 'Szerver hiba történt.' });
    }
};


exports.updateProfile = async (req, res) => {
    const userId = req.user.id;
    const userRole = req.user.role; 
    const { name, username, avatar, favoriteCategories, currentPassword, newPassword } = req.body;

    try {
        let passwordSql = "";
        let queryParams = [name, username, avatar];

        if (currentPassword && newPassword) {
            const [users] = await db.query('SELECT jelszo_hash FROM felhasznalok WHERE id = ?', [userId]);
            if (users.length === 0) return res.status(404).json({ message: "Felhasználó nem található." });

            const isMatch = await bcrypt.compare(currentPassword, users[0].jelszo_hash);
            if (!isMatch) {
                return res.status(400).json({ message: "A megadott jelenlegi jelszó hibás!" });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            
            passwordSql = ", jelszo_hash = ?";
            queryParams.push(hashedPassword);
        }

        queryParams.push(userId);

        const sql = `UPDATE felhasznalok SET nev = ?, felhasznalonev = ?, avatar = ?${passwordSql} WHERE id = ?`;
        await db.query(sql, queryParams);

        if (favoriteCategories && Array.isArray(favoriteCategories)) {
            await db.query('DELETE FROM kedvenc_kategoriak WHERE felhasznalo_id = ?', [userId]);
            
            if (favoriteCategories.length > 0) {
                const categoryValues = favoriteCategories.map(cat => [userId, cat]);
                await db.query('INSERT INTO kedvenc_kategoriak (felhasznalo_id, kategoria_id) VALUES ?', [categoryValues]);
            }
        }

        res.status(200).json({
            message: "Profil sikeresen frissítve!",
            user: {
                id: userId,
                name: name,
                username: username,
                avatar: avatar || "https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png",
                role: userRole,
                favoriteCategories: favoriteCategories
            }
        });

    } catch (error) {
        console.error("🔴 MENTÉSI HIBA:", error);
        if (error.code === 'ER_DATA_TOO_LONG') {
             return res.status(500).json({ message: "A kép túl nagy az adatbázisnak!" });
        }
        res.status(500).json({ message: "Szerver hiba történt a mentés közben." });
    }
};

exports.getMe = async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, nev, felhasznalonev, email, avatar, jogosultsag FROM felhasznalok WHERE id = ?', [req.user.id]);
        
        if (users.length === 0) return res.status(404).json({ message: 'Felhasználó nem található' });

        const user = users[0];

        let favoriteCategoriesList = [];
        try {
            const [categoriesDB] = await db.query('SELECT kategoria_id FROM kedvenc_kategoriak WHERE felhasznalo_id = ?', [user.id]);
            favoriteCategoriesList = categoriesDB.map(row => row.kategoria_id);
        } catch (e) { console.warn("Kategória betöltési hiba:", e.message); }

        res.status(200).json({
            user: {
                id: user.id,
                name: user.nev,
                username: user.felhasznalonev, 
                email: user.email,
                avatar: user.avatar || "https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png",
                role: user.jogosultsag, 
                favoriteCategories: favoriteCategoriesList
            }
        });

    } catch (error) {
        console.error("Hiba a profil lekérésekor:", error);
        res.status(500).json({ message: 'Szerver hiba történt.' });
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Kérlek, add meg az email címed!' });
    }

    try {
        const [users] = await db.query('SELECT * FROM felhasznalok WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(404).json({ message: 'Nincs fiók regisztrálva ezzel az email címmel.' });
        }

        const user = users[0]; 

        const newPassword = Math.random().toString(36).slice(-8);
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await db.query('UPDATE felhasznalok SET jelszo_hash = ? WHERE id = ?', [hashedPassword, user.id]);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, 
                pass: process.env.EMAIL_PASS 
            }
        });

        const mailOptions = {
            from: `"Mozipont" <${process.env.EMAIL_USER}>`,
            to: email, 
            subject: 'Mozipont - Új jelszó',
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2>Kedves ${user.nev}!</h2>
                    <p>Kérésedre generáltunk egy új jelszót a fiókodhoz.</p>
                    <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; display: inline-block; margin: 10px 0;">
                        Az új jelszavad: <strong style="font-size: 18px; color: #3e50ff;">${newPassword}</strong>
                    </div>
                    <p>Ezzel a jelszóval már be tudsz jelentkezni az oldalra.</p>
                    <p style="color: #d9534f; font-weight: bold;">
                        Kérjük, amint beléptél, azonnal nyisd meg a "Profil szerkesztése" menüpontot, és változtasd meg ezt a jelszót egy sajátra!
                    </p>
                    <br>
                    <p>Üdvözlettel,<br>A Mozipont csapata</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Az új jelszót sikeresen elküldtük az email címedre!' });

    } catch (error) {
        console.error("Hiba az elfelejtett jelszó folyamatban:", error);
        res.status(500).json({ message: 'Szerver hiba történt az email küldésekor.' });
    }
};