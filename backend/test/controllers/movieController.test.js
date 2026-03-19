// Beimportáljuk a kontrollert, amit tesztelni akarunk (két szintet lépünk vissza a test/controllers-ből)
const movieController = require('../../src/controllers/movieController');

// Beimportáljuk az adatbázis kapcsolatot (két szintet lépünk vissza, majd be az src/config mappába)
const db = require('../../src/config/db');

// Megmondjuk a Jest-nek, hogy a 'db' modult helyettesítse egy hamis (mock) verzióval
jest.mock('../../src/config/db');

describe('Movie Controller - getAllMovies', () => {
    
    // Ezzel némítjuk el a console.error hibaüzeneteket a tesztek futása alatt, 
    // hogy szép tiszta maradjon a terminál kimenete.
    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    // Minden teszt után kitisztítjuk a mockokat, hogy ne zavarják egymást
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('Sikeresen le kell kérnie a filmeket (nincs bejelentkezve)', async () => {
        // 1. ELŐKÉSZÜLET (Arrange): Beállítjuk a kamu adatbázis választ
        const mockMoviesFromDB = [
            { id: 1, tipus: 'film', cim: 'Teszt Film', kategoria_id: 1, megjelenes_ev_start: 2023 }
        ];
        
        // Amikor a db.query lefut, ezt a tömböt adja vissza (ugyanolyan formában, ahogy a mysql2 teszi)
        db.query.mockResolvedValue([mockMoviesFromDB]);

        // Elkészítjük a kamu Request (req) és Response (res) objektumokat
        const req = { 
            query: { userId: null } // Szimuláljuk, hogy nincs bejelentkezve
        };
        const res = {
            status: jest.fn().mockReturnThis(), // A res.status(200) hívást rögzítjük
            json: jest.fn()                     // A res.json() hívást rögzítjük
        };

        // 2. VÉGREHAJTÁS (Act): Meghívjuk a függvényt
        await movieController.getAllMovies(req, res);

        // 3. ELLENŐRZÉS (Assert): Megnézzük, mi történt
        // Ellenőrizzük, hogy a db.query pontosan egyszer lett-e meghívva
        expect(db.query).toHaveBeenCalledTimes(1);
        
        // Ellenőrizzük, hogy 200-as státuszkóddal tért-e vissza
        expect(res.status).toHaveBeenCalledWith(200);
        
        // Ellenőrizzük, hogy a json() megkapta-e a feldolgozott adatokat
        expect(res.json).toHaveBeenCalledWith({
            data: expect.arrayContaining([
                expect.objectContaining({ cim: 'Teszt Film' })
            ])
        });
    });

    it('500-as hibát kell dobnia, ha az adatbázis lekérdezés elszáll', async () => {
        // 1. ELŐKÉSZÜLET: Most azt szimuláljuk, hogy a DB hibát dob
        db.query.mockRejectedValue(new Error('Adatbázis hiba szimulálva'));

        const req = { query: {} };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // 2. VÉGREHAJTÁS
        await movieController.getAllMovies(req, res);

        // 3. ELLENŐRZÉS
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Szerver hiba történt az adatok lekérésekor." });
    });
});