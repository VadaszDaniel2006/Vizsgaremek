const db = require('../config/db');

exports.getAllSeries = async (req, res) => {
    try {
        const query = `
            SELECT 
                s.*, 
                k.nev AS kategoria, 
                r.nev AS rendezo,
                -- Összefűzzük a platformokat egy listává
                GROUP_CONCAT(
                    DISTINCT CONCAT_WS('|||', p.nev, IFNULL(p.logo_url, ''), IFNULL(p.weboldal_url, '')) 
                    SEPARATOR ';;;'
                ) AS platform_raw
            FROM sorozatok s
            LEFT JOIN kategoriak k ON s.kategoria_id = k.id
            LEFT JOIN rendezok r ON s.rendezo_id = r.id
            -- Az új média_platformok táblát használjuk!
            LEFT JOIN media_platformok mp ON s.id = mp.sorozat_id
            LEFT JOIN platformok p ON mp.platform_id = p.id
            GROUP BY s.id
            ORDER BY s.megjelenes_ev_start DESC
        `;

        const [rows] = await db.query(query);

        const series = rows.map(serie => {
            let platform_lista = [];
            
            if (serie.platform_raw) {
                const entries = serie.platform_raw.split(';;;');
                platform_lista = entries.map(entry => {
                    const [nev, logo, url] = entry.split('|||');
                    return { nev, logo, url };
                });
            }

            // Kiszűrjük a technikai mezőt
            delete serie.platform_raw;

            // --- KOMPATIBILITÁSI RÉTEGEK ---
            
            // 1. Évszám formázás: A frontend 'megjelenes_ev' mezőt vár (pl: "2016-2026")
            const ev_szoveg = serie.megjelenes_ev_end 
                ? `${serie.megjelenes_ev_start}-${serie.megjelenes_ev_end}` 
                : `${serie.megjelenes_ev_start}-`;

            // 2. Első platform adatai a ModalManager.js logó megjelenítéséhez
            const elsoPlatform = platform_lista.length > 0 ? platform_lista[0] : {}; 

            return { 
                ...serie, 
                megjelenes_ev: ev_szoveg, // Visszaadjuk a kombinált stringet
                platform_lista, 
                platform_nev: elsoPlatform.nev || null,
                platform_logo: elsoPlatform.logo || null,
                platform_link: elsoPlatform.url || '#'
            };
        });
        
        res.status(200).json({ data: series });

    } catch (error) {
        console.error("Hiba a sorozatok lekérésekor:", error);
        res.status(500).json({ message: "Szerver hiba történt az adatok lekérésekor." });
    }
};
exports.getTop50Series = async (req, res) => {
    try {
        const query = `
            SELECT 
                s.*,
                k.nev AS kategoria,
                r.nev AS rendezo,
                GROUP_CONCAT(
                    DISTINCT CONCAT_WS('|||', p.nev, IFNULL(p.logo_url, ''), IFNULL(p.weboldal_url, '')) 
                    SEPARATOR ';;;'
                ) AS platform_raw
            FROM sorozatok s
            LEFT JOIN kategoriak k ON s.kategoria_id = k.id
            LEFT JOIN rendezok r ON s.rendezo_id = r.id
            LEFT JOIN media_platformok mp ON s.id = mp.sorozat_id
            LEFT JOIN platformok p ON mp.platform_id = p.id
            GROUP BY s.id
            ORDER BY s.rating DESC
            LIMIT 50
        `;

        const [rows] = await db.query(query);

        const series = rows.map(item => {
            let platform_lista = [];
            if (item.platform_raw) {
                const entries = item.platform_raw.split(';;;');
                platform_lista = entries.map(entry => {
                    const [nev, logo, url] = entry.split('|||');
                    return { nev, logo, url };
                });
            }
            delete item.platform_raw;
            const elsoPlatform = platform_lista.length > 0 ? platform_lista[0] : {}; 

            return { 
                ...item, 
                platform_lista, 
                platform_nev: elsoPlatform.nev || null,
                platform_logo: elsoPlatform.logo || null,
                platform_link: elsoPlatform.url || '#'
            };
        });
        
        res.status(200).json({ data: series });
    } catch (error) {
        console.error("Hiba a Top 50 sorozat lekérésekor:", error);
        res.status(500).json({ message: "Szerver hiba a Top 50 lekérésekor." });
    }
};