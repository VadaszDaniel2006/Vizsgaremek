const db = require('../config/db');

exports.getAllSeries = async (req, res) => {
    const userId = req.query.userId;
    const isRandom = req.query.random === 'true';

    try {
        let query = "";
        let params = [];

        if (userId && userId !== 'undefined' && userId !== 'null' && userId !== '') {
            query = `
                SELECT 
                    m.*, 
                    k.nev AS kategoria, 
                    r.nev AS rendezo,
                    GROUP_CONCAT(
                        DISTINCT CONCAT_WS('|||', p.nev, IFNULL(p.logo_url, ''), IFNULL(p.weboldal_url, '#')) 
                        SEPARATOR ';;;'
                    ) AS platform_raw
                FROM media m
                LEFT JOIN kategoriak k ON m.kategoria_id = k.id
                LEFT JOIN rendezok r ON m.rendezo_id = r.id
                LEFT JOIN media_platformok mp ON m.id = mp.media_id
                LEFT JOIN platformok p ON mp.platform_id = p.id
                LEFT JOIN (
                    -- Megnézzük a sorozatoknál is a kedvenc kategóriákat
                    SELECT DISTINCT kategoria_id 
                    FROM kedvenc_kategoriak 
                    WHERE felhasznalo_id = ?
                ) AS user_prefs ON m.kategoria_id = user_prefs.kategoria_id
                WHERE m.tipus = 'sorozat'
                GROUP BY m.id, user_prefs.kategoria_id
                ${isRandom 
                    ? "ORDER BY (RAND() * CASE WHEN user_prefs.kategoria_id IS NOT NULL THEN 3.0 ELSE 1.0 END) DESC"
                    : "ORDER BY CASE WHEN user_prefs.kategoria_id IS NOT NULL THEN 1 ELSE 0 END DESC, m.rating DESC, m.id DESC"
                }
                LIMIT 50
            `;
            params.push(userId);
        } else {
            query = `
                SELECT 
                    m.*, 
                    k.nev AS kategoria, 
                    r.nev AS rendezo,
                    GROUP_CONCAT(
                        DISTINCT CONCAT_WS('|||', p.nev, IFNULL(p.logo_url, ''), IFNULL(p.weboldal_url, '')) 
                        SEPARATOR ';;;'
                    ) AS platform_raw
                FROM media m
                LEFT JOIN kategoriak k ON m.kategoria_id = k.id
                LEFT JOIN rendezok r ON m.rendezo_id = r.id
                LEFT JOIN media_platformok mp ON m.id = mp.media_id
                LEFT JOIN platformok p ON mp.platform_id = p.id
                WHERE m.tipus = 'sorozat'
                GROUP BY m.id
                ${isRandom 
                    ? "ORDER BY RAND()"
                    : "ORDER BY m.rating DESC, m.id DESC"
                }
                LIMIT 50
            `;
        }

        const [rows] = await db.query(query, params);

        const series = rows.map(serie => {
            let platform_lista = [];
            
            if (serie.platform_raw) {
                const entries = serie.platform_raw.split(';;;');
                platform_lista = entries.map(entry => {
                    const [nev, logo, url] = entry.split('|||');
                    return { nev, logo, url };
                });
            }

            delete serie.platform_raw;

            const ev_szoveg = serie.megjelenes_ev_end 
                ? `${serie.megjelenes_ev_start}-${serie.megjelenes_ev_end}` 
                : `${serie.megjelenes_ev_start}-`;

            const elsoPlatform = platform_lista.length > 0 ? platform_lista[0] : {}; 

            return { 
                ...serie, 
                megjelenes_ev: ev_szoveg, 
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
                m.*,
                k.nev AS kategoria,
                r.nev AS rendezo,
                GROUP_CONCAT(
                    DISTINCT CONCAT_WS('|||', p.nev, IFNULL(p.logo_url, ''), IFNULL(p.weboldal_url, '#')) 
                    SEPARATOR ';;;'
                ) AS platform_raw
            FROM media m
            LEFT JOIN kategoriak k ON m.kategoria_id = k.id
            LEFT JOIN rendezok r ON m.rendezo_id = r.id
            LEFT JOIN media_platformok mp ON m.id = mp.media_id
            LEFT JOIN platformok p ON mp.platform_id = p.id
            WHERE m.tipus = 'sorozat'
            GROUP BY m.id
            ORDER BY m.rating DESC
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

            const ev_szoveg = item.megjelenes_ev_end 
                ? `${item.megjelenes_ev_start}-${item.megjelenes_ev_end}` 
                : `${item.megjelenes_ev_start}-`;

            return { 
                ...item, 
                megjelenes_ev: ev_szoveg,
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