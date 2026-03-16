const db = require('../config/db');

exports.getAllMovies = async (req, res) => {
    const userId = req.query.userId;
    const isRandom = req.query.random === 'true'; // Megnézzük, kér-e keverést a frontend

    try {
        let query = "";
        let params = [];

        // HA BE VAN JELENTKEZVE: Okos ajánlórendszer
        if (userId && userId !== 'undefined' && userId !== 'null' && userId !== '') {
            query = `
                SELECT 
                    m.*,
                    m.premier_datum,
                    k.nev AS kategoria,
                    r.nev AS rendezo,
                    GROUP_CONCAT(
                        DISTINCT CONCAT_WS('|||', p.nev, IFNULL(p.logo_url, ''), IFNULL(p.weboldal_url, '#')) 
                        SEPARATOR ';;;'
                    ) AS platform_raw,
                    GROUP_CONCAT(
                        DISTINCT CONCAT_WS('|||', mo.nev, mo.varos, IFNULL(mo.url, '')) 
                        SEPARATOR ';;;'
                    ) AS mozi_raw
                FROM media m
                LEFT JOIN kategoriak k ON m.kategoria_id = k.id
                LEFT JOIN rendezok r ON m.rendezo_id = r.id
                LEFT JOIN media_platformok mp ON m.id = mp.media_id
                LEFT JOIN platformok p ON mp.platform_id = p.id
                LEFT JOIN media_mozik mm ON m.id = mm.media_id
                LEFT JOIN mozik mo ON mm.mozi_id = mo.id
                LEFT JOIN (
                    -- JAVÍTVA: kedvenc_kategoriak (többes szám nélkül)
                    SELECT DISTINCT kategoria_id 
                    FROM kedvenc_kategoriak 
                    WHERE felhasznalo_id = ?
                ) AS user_prefs ON m.kategoria_id = user_prefs.kategoria_id
                WHERE m.tipus = 'film'
                GROUP BY m.id, user_prefs.kategoria_id
                ${isRandom 
                    ? "ORDER BY (RAND() * CASE WHEN user_prefs.kategoria_id IS NOT NULL THEN 3.0 ELSE 1.0 END) DESC"
                    : "ORDER BY CASE WHEN user_prefs.kategoria_id IS NOT NULL THEN 1 ELSE 0 END DESC, m.rating DESC, m.id DESC"
                }
                LIMIT 50
            `;
            params.push(userId);
        } else {
            // HA NINCS BEJELENTKEZVE: Sima 17 random film
            query = `
                SELECT 
                    m.*,
                    m.premier_datum,
                    k.nev AS kategoria,
                    r.nev AS rendezo,
                    GROUP_CONCAT(
                        DISTINCT CONCAT_WS('|||', p.nev, IFNULL(p.logo_url, ''), IFNULL(p.weboldal_url, '')) 
                        SEPARATOR ';;;'
                    ) AS platform_raw,
                    GROUP_CONCAT(
                        DISTINCT CONCAT_WS('|||', mo.nev, mo.varos, IFNULL(mo.url, '')) 
                        SEPARATOR ';;;'
                    ) AS mozi_raw
                FROM media m
                LEFT JOIN kategoriak k ON m.kategoria_id = k.id
                LEFT JOIN rendezok r ON m.rendezo_id = r.id
                LEFT JOIN media_platformok mp ON m.id = mp.media_id
                LEFT JOIN platformok p ON mp.platform_id = p.id
                LEFT JOIN media_mozik mm ON m.id = mm.media_id
                LEFT JOIN mozik mo ON mm.mozi_id = mo.id
                WHERE m.tipus = 'film'
                GROUP BY m.id
                ${isRandom 
                    ? "ORDER BY RAND()"
                    : "ORDER BY m.rating DESC, m.id DESC"
                }
                LIMIT 50
            `;
        }

        const [rows] = await db.query(query, params);

        const movies = rows.map(movie => {
            let platform_lista = [];
            if (movie.platform_raw) {
                const entries = movie.platform_raw.split(';;;');
                platform_lista = entries.map(entry => {
                    const [nev, logo, url] = entry.split('|||');
                    return { nev, logo, url };
                });
            }
            delete movie.platform_raw;

            let mozi_lista = [];
            if (movie.mozi_raw) {
                const entries = movie.mozi_raw.split(';;;');
                mozi_lista = entries.map(entry => {
                    const [nev, varos, url] = entry.split('|||');
                    return { nev, varos, url };
                });
            }
            delete movie.mozi_raw;

            const elsoPlatform = platform_lista.length > 0 ? platform_lista[0] : {}; 
            const megjelenes_ev = movie.megjelenes_ev_start;

            return { 
                ...movie,
                megjelenes_ev, 
                platform_lista, 
                mozi_lista, 
                platform_nev: elsoPlatform.nev || null,
                platform_logo: elsoPlatform.logo || null,
                platform_link: elsoPlatform.url || '#'
            };
        });
        
        res.status(200).json({ data: movies });

    } catch (error) {
        console.error("Hiba a filmek lekérésekor:", error);
        res.status(500).json({ message: "Szerver hiba történt az adatok lekérésekor." });
    }
};

exports.getTop50Movies = async (req, res) => {
    try {
        const query = `
            SELECT 
                m.*,
                m.premier_datum,
                k.nev AS kategoria,
                r.nev AS rendezo,
                GROUP_CONCAT(
                    DISTINCT CONCAT_WS('|||', p.nev, IFNULL(p.logo_url, ''), IFNULL(p.weboldal_url, '#')) 
                    SEPARATOR ';;;'
                ) AS platform_raw,
                GROUP_CONCAT(
                    DISTINCT CONCAT_WS('|||', mo.nev, mo.varos, IFNULL(mo.url, '')) 
                    SEPARATOR ';;;'
                ) AS mozi_raw
            FROM media m
            LEFT JOIN kategoriak k ON m.kategoria_id = k.id
            LEFT JOIN rendezok r ON m.rendezo_id = r.id
            LEFT JOIN media_platformok mp ON m.id = mp.media_id
            LEFT JOIN platformok p ON mp.platform_id = p.id
            LEFT JOIN media_mozik mm ON m.id = mm.media_id
            LEFT JOIN mozik mo ON mm.mozi_id = mo.id
            WHERE m.tipus = 'film'
            GROUP BY m.id
            ORDER BY m.rating DESC
            LIMIT 50
        `;

        const [rows] = await db.query(query);

        const movies = rows.map(movie => {
            let platform_lista = [];
            if (movie.platform_raw) {
                const entries = movie.platform_raw.split(';;;');
                platform_lista = entries.map(entry => {
                    const [nev, logo, url] = entry.split('|||');
                    return { nev, logo, url };
                });
            }
            delete movie.platform_raw;

            let mozi_lista = [];
            if (movie.mozi_raw) {
                const entries = movie.mozi_raw.split(';;;');
                mozi_lista = entries.map(entry => {
                    const [nev, varos, url] = entry.split('|||');
                    return { nev, varos, url };
                });
            }
            delete movie.mozi_raw;

            const elsoPlatform = platform_lista.length > 0 ? platform_lista[0] : {}; 
            const megjelenes_ev = movie.megjelenes_ev_start;

            return { 
                ...movie,
                megjelenes_ev, 
                platform_lista, 
                mozi_lista, 
                platform_nev: elsoPlatform.nev || null,
                platform_logo: elsoPlatform.logo || null,
                platform_link: elsoPlatform.url || '#'
            };
        });
        
        res.status(200).json({ data: movies });
    } catch (error) {
        console.error("Hiba a Top 50 film lekérésekor:", error);
        res.status(500).json({ message: "Szerver hiba a Top 50 lekérésekor." });
    }
};