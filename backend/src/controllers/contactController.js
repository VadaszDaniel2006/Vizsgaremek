const db = require('../config/db');

exports.sendMessage = async (req, res) => {
    const { nev, email, tema, uzenet } = req.body;
    
    if (!nev || !email || !tema || !uzenet) {
        return res.status(400).json({ message: 'Minden mező kitöltése kötelező!' });
    }

    try {
       
        const [userCheck] = await db.query(
            'SELECT id FROM felhasznalok WHERE email = ? AND (felhasznalonev = ? OR nev = ?)',
            [email, nev, nev]
        );

        if (userCheck.length === 0) {
            return res.status(404).json({ 
                message: 'Csak regisztrált fiókkal küldhető üzenet! A megadott név vagy e-mail cím nem egyezik a rendszerünkben lévőkkel.' 
            });
        }

        const valodiFelhasznaloId = userCheck[0].id;

        const [result] = await db.query(
            'INSERT INTO kapcsolat_uzenetek (felhasznalo_id, nev, email, tema, uzenet) VALUES (?, ?, ?, ?, ?)',
            [valodiFelhasznaloId, nev, email, tema, uzenet]
        );
        
        res.status(201).json({ message: 'Üzenet sikeresen elküldve!', id: result.insertId });
    } catch (error) {
        console.error('Hiba az üzenet mentésekor:', error);
        res.status(500).json({ message: 'Szerverhiba történt az üzenet küldésekor.' });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT k.*, f.felhasznalonev 
            FROM kapcsolat_uzenetek k
            LEFT JOIN felhasznalok f ON k.felhasznalo_id = f.id
            ORDER BY k.datum DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Hiba az üzenetek lekérésekor:', error);
        res.status(500).json({ message: 'Szerverhiba.' });
    }
};

exports.markAsRead = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('UPDATE kapcsolat_uzenetek SET olvasva = 1 WHERE id = ?', [id]);
        res.json({ message: 'Olvasottnak jelölve.' });
    } catch (error) {
        res.status(500).json({ message: 'Szerverhiba.' });
    }
};

exports.deleteMessage = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM kapcsolat_uzenetek WHERE id = ?', [id]);
        res.json({ message: 'Üzenet törölve.' });
    } catch (error) {
        res.status(500).json({ message: 'Szerverhiba.' });
    }
};