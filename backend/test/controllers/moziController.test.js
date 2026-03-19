const moziController = require('../../src/controllers/moziController');
const db = require('../../src/config/db');

jest.mock('../../src/config/db');

describe('Mozi Controller', () => {
    
    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getOsszesMozi', () => {
        it('Sikeresen lekéri az összes mozit (200-as státusz)', async () => {
            const mockMozik = [{ id: 1, nev: 'Cinema City Aréna' }, { id: 2, nev: 'Corvin Mozi' }];
            db.query.mockResolvedValueOnce([mockMozik]);

            const req = {};
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            await moziController.getOsszesMozi(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockMozik);
        });

        it('500-as hibát dob, ha az adatbázis lekérdezés elszáll', async () => {
            db.query.mockRejectedValueOnce(new Error('DB hiba'));

            const req = {};
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            await moziController.getOsszesMozi(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Szerverhiba történt a mozik betöltésekor.' });
        });
    });

    describe('getPlatformokForMedia', () => {
        it('Sikeresen lekéri a platformokat egy adott médiához', async () => {
            const mockPlatformok = [{ id: 1, nev: 'Netflix', url: 'https://netflix.com' }];
            db.query.mockResolvedValueOnce([mockPlatformok]);

            const req = { params: { id: 10 } }; // pl. egy film ID-ja
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            await moziController.getPlatformokForMedia(req, res);

            expect(db.query).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockPlatformok);
        });

        it('500-as hibát dob platform lekérdezési hiba esetén', async () => {
            db.query.mockRejectedValueOnce(new Error('DB hiba'));

            const req = { params: { id: 10 } };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            await moziController.getPlatformokForMedia(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: "Hiba a platformok betöltésekor." });
        });
    });
});