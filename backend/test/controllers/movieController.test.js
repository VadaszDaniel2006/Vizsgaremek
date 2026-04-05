const movieController = require('../../src/controllers/movieController');

const db = require('../../src/config/db');

jest.mock('../../src/config/db');

describe('Movie Controller - getAllMovies', () => {
    

    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });


    afterEach(() => {
        jest.clearAllMocks();
    });

    it('Sikeresen le kell kérnie a filmeket (nincs bejelentkezve)', async () => {

        const mockMoviesFromDB = [
            { id: 1, tipus: 'film', cim: 'Teszt Film', kategoria_id: 1, megjelenes_ev_start: 2023 }
        ];

        db.query.mockResolvedValue([mockMoviesFromDB]);


        const req = { 
            query: { userId: null } 
        };
        const res = {
            status: jest.fn().mockReturnThis(), 
            json: jest.fn()                     
        };

        await movieController.getAllMovies(req, res);


        expect(db.query).toHaveBeenCalledTimes(1);
        
        expect(res.status).toHaveBeenCalledWith(200);
        
        expect(res.json).toHaveBeenCalledWith({
            data: expect.arrayContaining([
                expect.objectContaining({ cim: 'Teszt Film' })
            ])
        });
    });

    it('500-as hibát kell dobnia, ha az adatbázis lekérdezés elszáll', async () => {

        db.query.mockRejectedValue(new Error('Adatbázis hiba szimulálva'));

        const req = { query: {} };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await movieController.getAllMovies(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Szerver hiba történt az adatok lekérésekor." });
    });
});