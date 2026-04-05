const seriesController = require('../../src/controllers/seriesController');
const db = require('../../src/config/db');

jest.mock('../../src/config/db');

describe('Series Controller', () => {

    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllSeries', () => {
        it('Sikeresen lekéri a sorozatokat és formázza a platformokat (bejelentkezés nélkül)', async () => {

            const mockRows = [{
                id: 1,
                tipus: 'sorozat',
                cim: 'Stranger Things',
                megjelenes_ev_start: 2016,
                megjelenes_ev_end: null, 
                platform_raw: 'Netflix|||netflix_logo.png|||https://netflix.com' 
            }];
            db.query.mockResolvedValueOnce([mockRows]);

            const req = { query: {} }; 
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            await seriesController.getAllSeries(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                data: expect.arrayContaining([
                    expect.objectContaining({
                        cim: 'Stranger Things',
                        megjelenes_ev: '2016-', 
                        platform_nev: 'Netflix', 
                        platform_link: 'https://netflix.com'
                    })
                ])
            });
        });

        it('500-as hibát dob getAllSeries adatbázis hiba esetén', async () => {
            db.query.mockRejectedValueOnce(new Error('DB hiba'));

            const req = { query: {} };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            await seriesController.getAllSeries(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Szerver hiba történt az adatok lekérésekor.' });
        });
    });

    describe('getTop50Series', () => {
        it('Sikeresen lekéri a Top 50 sorozatot', async () => {
            const mockRows = [{
                id: 2,
                cim: 'Breaking Bad',
                rating: 9.5,
                megjelenes_ev_start: 2008,
                megjelenes_ev_end: 2013, 
                platform_raw: null 
            }];
            db.query.mockResolvedValueOnce([mockRows]);

            const req = {};
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            await seriesController.getTop50Series(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                data: expect.arrayContaining([
                    expect.objectContaining({
                        cim: 'Breaking Bad',
                        megjelenes_ev: '2008-2013',
                        platform_nev: null 
                    })
                ])
            });
        });

        it('500-as hibát dob getTop50Series adatbázis hiba esetén', async () => {
            db.query.mockRejectedValueOnce(new Error('DB hiba'));

            const req = {};
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            await seriesController.getTop50Series(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Szerver hiba a Top 50 lekérésekor.' });
        });
    });
});