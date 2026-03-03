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
            -- Kapcsolatok a magyarított táblákkal
            LEFT JOIN kategoriak k ON m.kategoria_id = k.id
            LEFT JOIN rendezok r ON m.rendezo_id = r.id
            LEFT JOIN media_orszagok mo ON m.id = mo.media_id
            LEFT JOIN nemzetisegek n ON mo.nemzetiseg_id = n.id
            WHERE 
                m.cim LIKE ?           -- Keresés a címben
                OR k.nev LIKE ?        -- Keresés a kategóriában (pl. "Sci-fi")
                OR r.nev LIKE ?        -- Keresés a rendező nevében
                OR n.nev LIKE ?        -- Keresés az ország nevében (pl. "Magyar")
            ORDER BY m.cim ASC
            LIMIT 20;
        `;

        // Itt figyelj: 4 kérdőjel = 4 paraméter a tömbben!
        const [results] = await db.query(query, [
            searchQuery, 
            searchQuery, 
            searchQuery, 
            searchQuery
        ]);

        res.status(200).json(results);
    } catch (err) {
        console.error("Keresési hiba:", err);
        // Ha "Illegal mix of collations" hibát látsz a konzolon, 
        // akkor a nemzetisegek táblát is magyarítani kell (utf8mb4_hungarian_ci)!
        res.status(500).json({ message: "Hiba történt a keresés során." });
    }
};

// --- ELŐZMÉNYEK MENTÉSE (JAVÍTOTT TÁBLANÉVVEL) ---
exports.saveSearchHistory = async (req, res) => {
    const { userId, searchTerm } = req.body;
    if (!userId || !searchTerm) return res.status(400).json({ message: "Hiányzó adatok!" });

    try {
        // Átírtuk a tábla és oszlopneveket a magyar verzióra:
        await db.query(
            'INSERT INTO keresesi_elozmenyek (felhasznalo_id, keresett_szoveg, kereses_ideje) VALUES (?, ?, NOW())', 
            [userId, searchTerm]
        );
        res.status(200).json({ message: "Előzmény elmentve!" });
    } catch (err) { 
        console.error("Előzmény mentési hiba:", err);
        res.status(500).json({ message: "Szerverhiba az előzmények mentésekor." }); 
    }
};