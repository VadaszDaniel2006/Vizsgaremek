const interactionController = require('../../src/controllers/interactionController');
const db = require('../../src/config/db');

jest.mock('../../src/config/db');

describe('Interaction Controller', () => {

    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('addToFavorites', () => {
        it('400-as hibát dob, ha hiányoznak az adatok', async () => {
            const req = { body: {} }; // Üres body
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            await interactionController.addToFavorites(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('400-as hibát dob, ha már a kedvencek között van', async () => {
            // A SELECT query találatot ad vissza
            db.query.mockResolvedValueOnce([[{ id: 1 }]]);

            const req = { body: { userId: 1, filmId: 10 } };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            await interactionController.addToFavorites(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Már a kedvencek között van!" });
        });

        it('Sikeresen hozzáadja a kedvencekhez (200)', async () => {
            // A SELECT query üres tömböt ad vissza (nincs még a kedvencek közt)
            db.query.mockResolvedValueOnce([[]]);
            // Az INSERT query lefut
            db.query.mockResolvedValueOnce([{}]);

            const req = { body: { userId: 1, filmId: 10 } };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            await interactionController.addToFavorites(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: "Hozzáadva a kedvencekhez!" });
        });
    });

    describe('addReview', () => {
        it('401-es hibát dob, ha nincs bejelentkezve (nincs userId)', async () => {
            const req = { body: { filmId: 10, rating: 8, comment: "Jó film" } };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            await interactionController.addReview(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
        });

        it('400-as hibát dob, ha nincs pontszám vagy komment', async () => {
            const req = { body: { userId: 1, filmId: 10 } };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            await interactionController.addReview(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Pontszám kötelező!" });
        });
    });
});