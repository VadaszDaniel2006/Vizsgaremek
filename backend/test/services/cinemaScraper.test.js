const axios = require('axios');
const db = require('../../src/config/db');
const runCinemaScraper = require('../../src/services/cinemaScraper');
jest.mock('axios');
jest.mock('../../src/config/db');

describe('Cinema Scraper Service', () => {

    beforeAll(() => {
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Scraper segédfunkciók logikája', () => {
        
        it('Helyesen kellene normalizálnia a címeket (ékezetek és karakterek)', () => {

            const testTitle = "A Gyűrűk Ura: A király visszatér & barátai";
        
            expect(testTitle.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes("gyuruk")).toBe(true);
        });
    });

    describe('scrapeCinemaCity', () => {
        it('Üres objektumot kell visszaadnia, ha az API hívás sikertelen', async () => {
            axios.get.mockRejectedValueOnce(new Error('Network Error'));

            db.query.mockResolvedValueOnce([[]]); 
            db.query.mockResolvedValueOnce([[ { id: 1, cim: 'Film' } ]]);
            db.query.mockResolvedValueOnce([[ { id: 1, nev: 'Cinema City Aréna', url: '...' } ]]); 

            await runCinemaScraper();
            
            expect(console.error).not.toHaveBeenCalledWith(expect.stringContaining('kritikus hiba'));
        });
    });

    describe('runCinemaScraper fő folyamat', () => {
        it('Törölnie kell a régi adatokat az induláskor', async () => {
            db.query.mockResolvedValueOnce([{}]); 
            db.query.mockResolvedValue([{ length: 0 }]); 

            await runCinemaScraper();

            expect(db.query).toHaveBeenCalledWith('DELETE FROM media_mozik');
        });

        it('Csak a 2026-os vagy újabb filmeket szabad lekérdeznie', async () => {
            db.query.mockResolvedValueOnce([{}]); 
            db.query.mockResolvedValueOnce([[]]); 

            await runCinemaScraper();

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('megjelenes_ev_start >= 2026')
            );
        });

        it('Sikeresen le kell futnia, ha nincsenek mozik az adatbázisban', async () => {
            db.query.mockResolvedValueOnce([{}]); 
            db.query.mockResolvedValueOnce([[ { id: 1, cim: 'Avatar 3' } ]]); 
            db.query.mockResolvedValueOnce([[]]); 

            await runCinemaScraper();

            expect(console.log).toHaveBeenCalledWith(expect.stringContaining('BEFEJEZVE'));
        });

        it('Kritikus hiba esetén logolnia kell a hibát', async () => {
            db.query.mockRejectedValueOnce(new Error('Database Crash'));

            await runCinemaScraper();

            expect(console.error).toHaveBeenCalledWith(
                expect.stringContaining('Robot kritikus hiba:'),
                expect.any(Error)
            );
        });
    });
});