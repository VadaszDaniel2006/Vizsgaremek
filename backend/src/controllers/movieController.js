const db = require('../config/db');

exports.getAllMovies = async (req, res) => {
    try {
        const query = `
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
            WHERE m.tipus = 'film'
            GROUP BY m.id
            ORDER BY m.megjelenes_ev_start DESC
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
            const elsoPlatform = platform_lista.length > 0 ? platform_lista[0] : {}; 

            // Hogy a frontend kód ne törjön el, visszaadjuk 'megjelenes_ev' néven a start évet
            const megjelenes_ev = movie.megjelenes_ev_start;

            return { 
                ...movie,
                megjelenes_ev, 
                platform_lista, 
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
            const elsoPlatform = platform_lista.length > 0 ? platform_lista[0] : {}; 

            // Hogy a frontend kód ne törjön el, visszaadjuk 'megjelenes_ev' néven a start évet
            const megjelenes_ev = movie.megjelenes_ev_start;

            return { 
                ...movie,
                megjelenes_ev, 
                platform_lista, 
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