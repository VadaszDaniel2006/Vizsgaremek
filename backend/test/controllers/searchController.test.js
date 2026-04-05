const searchController = require('../../src/controllers/searchController');
const db = require('../../src/config/db');

jest.mock('../../src/config/db');

describe('Search Controller', () => {

    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('globalSearch', () => {
        it('Üres tömböt ad vissza (200), ha nincs keresési kifejezés', async () => {
            const req = { query: { q: '' } };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            await searchController.globalSearch(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([]);
            expect(db.query).not.toHaveBeenCalled(); 
        });

        it('Sikeres keresés esetén visszaadja a találatokat (200)', async () => {
            const mockResults = [{ id: 1, cim: 'Mátrix', tipus: 'film' }];
            db.query.mockResolvedValueOnce([mockResults]);

            const req = { query: { q: 'mátrix' } };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            await searchController.globalSearch(req, res);

            expect(db.query).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockResults);
        });

        it('500-as hibát dob adatbázis hiba esetén', async () => {
            db.query.mockRejectedValueOnce(new Error('DB hiba'));

            const req = { query: { q: 'hiba' } };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            await searchController.globalSearch(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});