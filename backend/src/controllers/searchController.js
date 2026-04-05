const db = require('../config/db');

exports.globalSearch = async (req, res) => {
    const searchTerm = req.query.q; 

    if (!searchTerm || searchTerm.trim() === '') {
        return res.status(200).json([]); 
    }

    const searchQuery = `%${searchTerm}%`;

    try {
        const query = `
            SELECT DISTINCT
                m.id, 
                m.cim, 
                m.poszter_url, 
                m.megjelenes_ev_start AS ev, 
                m.tipus 
            FROM media m
            -- Kapcsolatok a táblákkal
            LEFT JOIN kategoriak k ON m.kategoria_id = k.id
            LEFT JOIN rendezok r ON m.rendezo_id = r.id
            LEFT JOIN media_orszagok mo ON m.id = mo.media_id
            LEFT JOIN nemzetisegek n ON mo.nemzetiseg_id = n.id
            WHERE 
                m.cim LIKE ?           -- Keresés a címben
                OR m.leiras LIKE ?     -- Keresés a leírásban
                OR k.nev LIKE ?        -- Keresés a kategóriában
                OR r.nev LIKE ?        -- Keresés a rendező nevében
                OR r.nemzetiseg LIKE ? -- Keresés a RENDEZŐ NEMZETISÉGÉBEN (pl. "Brit")
                OR n.nev LIKE ?        -- Keresés az külön ország táblában
            ORDER BY m.cim ASC
            LIMIT 20;
        `;

        
        const [results] = await db.query(query, [
            searchQuery, 
            searchQuery, 
            searchQuery, 
            searchQuery,
            searchQuery,
            searchQuery
        ]);

        res.status(200).json(results);
    } catch (err) {
        console.error("Keresési hiba:", err);
        res.status(500).json({ message: "Hiba történt a keresés során." });
    }
};