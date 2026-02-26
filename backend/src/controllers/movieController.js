const db = require('../config/db');

exports.getAllMovies = async (req, res) => {
    try {
        const query = `
            SELECT 
                f.*,
                k.nev AS kategoria,
                r.nev AS rendezo,
                GROUP_CONCAT(
                    DISTINCT CONCAT_WS('|||', p.nev, IFNULL(p.logo_url, ''), IFNULL(p.weboldal_url, '')) 
                    SEPARATOR ';;;'
                ) AS platform_raw
            FROM filmek f
            LEFT JOIN kategoriak k ON f.kategoria_id = k.id
            LEFT JOIN rendezok r ON f.rendezo_id = r.id
            LEFT JOIN media_platformok mp ON f.id = mp.film_id
            LEFT JOIN platformok p ON mp.platform_id = p.id
            GROUP BY f.id
            ORDER BY f.megjelenes_ev DESC
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

            return { 
                ...movie, 
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
                f.*,
                k.nev AS kategoria,
                r.nev AS rendezo,
                GROUP_CONCAT(
                    DISTINCT CONCAT_WS('|||', p.nev, IFNULL(p.logo_url, ''), IFNULL(p.weboldal_url, '')) 
                    SEPARATOR ';;;'
                ) AS platform_raw
            FROM filmek f
            LEFT JOIN kategoriak k ON f.kategoria_id = k.id
            LEFT JOIN rendezok r ON f.rendezo_id = r.id
            LEFT JOIN media_platformok mp ON f.id = mp.film_id
            LEFT JOIN platformok p ON mp.platform_id = p.id
            GROUP BY f.id
            ORDER BY f.rating DESC
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

            return { 
                ...movie, 
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