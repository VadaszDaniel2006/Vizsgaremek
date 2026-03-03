const db = require('../config/db');

exports.globalSearch = async (req, res) => {
    const searchTerm = req.query.q; 

    if (!searchTerm || searchTerm.trim() === '') {
        return res.status(200).json([]); 
    }

    const searchQuery = `%${searchTerm}%`;

    try {
        // Nincs több UNION! Egyetlen letisztult lekérdezés a media táblából.
        const query = `
            SELECT 
                m.id, 
                m.cim, 
                m.poszter_url, 
                m.megjelenes_ev_start AS ev, 
                m.tipus 
            FROM media m
            LEFT JOIN kategoriak k ON m.kategoria_id = k.id
            LEFT JOIN rendezok r ON m.rendezo_id = r.id
            LEFT JOIN media_orszagok mo ON mo.media_id = m.id
            LEFT JOIN nemzetisegek n ON mo.nemzetiseg_id = n.id
            WHERE m.cim LIKE ? 
               OR k.nev LIKE ? 
               OR r.nev LIKE ? 
               OR n.nev LIKE ? 
               OR r.nemzetiseg LIKE ?
            ORDER BY m.cim ASC
            LIMIT 20;
        `;

        // Most már csak 5 paraméter kell a 10 helyett!
        const [results] = await db.query(query, [
            searchQuery, searchQuery, searchQuery, searchQuery, searchQuery
        ]);

        res.status(200).json(results);
    } catch (err) {
        console.error("Keresési hiba:", err);
        res.status(500).json({ message: "Hiba történt a keresés során." });
    }
};

exports.saveSearchHistory = async (req, res) => {
    const { userId, searchTerm } = req.body;
    if (!userId || !searchTerm) return res.status(400).json({ message: "Hiányzó adatok!" });

    try {
        await db.query('INSERT INTO search_history (user_id, search_term, searched_at) VALUES (?, ?, NOW())', [userId, searchTerm]);
        res.status(200).json({ message: "Előzmény elmentve!" });
    } catch (err) { 
        console.error("Előzmény mentési hiba:", err);
        res.status(500).json({ message: "Szerverhiba." }); 
    }
};