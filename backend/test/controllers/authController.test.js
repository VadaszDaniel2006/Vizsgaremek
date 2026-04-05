const authController = require('../../src/controllers/authController');

const db = require('../../src/config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

jest.mock('../../src/config/db');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('Auth Controller', () => {

    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('register', () => {
        
        it('Sikeres regisztráció (201-es státuszkód)', async () => {

            const req = {
                body: { name: 'Teszt Elek', email: 'teszt@elek.hu', password: 'jelszo', username: 'tesztuser' }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            db.query.mockResolvedValueOnce([[]]); 

            db.query.mockResolvedValueOnce([{ insertId: 1 }]); 

            bcrypt.genSalt.mockResolvedValue('randomSalt');
            bcrypt.hash.mockResolvedValue('hashedPassword123');

            await authController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ message: 'Sikeres regisztráció!' });

            expect(db.query).toHaveBeenNthCalledWith(
                2, 
                expect.stringContaining('INSERT INTO felhasznalok'),
                expect.arrayContaining(['Teszt Elek', 'teszt@elek.hu', 'hashedPassword123', 'tesztuser'])
            );
        });

        it('400-as hibát dob, ha hiányzik adat a regisztrációkor', async () => {
            const req = {
                body: { name: 'Teszt Elek', email: 'teszt@elek.hu' } // Direkt hiányzik a password és username
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await authController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Minden mező kitöltése kötelező!' });
            expect(db.query).not.toHaveBeenCalled(); // DB lekérdezésig el se juthat
        });

        it('400-as hibát dob, ha az email már foglalt', async () => {
            const req = {
                body: { name: 'Teszt', email: 'foglalt@email.hu', password: 'pw', username: 'user1' }
            };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            db.query.mockResolvedValueOnce([[{ email: 'foglalt@email.hu', felhasznalonev: 'masvalaki' }]]);

            await authController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Ez az email cím már foglalt!' });
        });
    });

    describe('login', () => {

        it('Sikeres bejelentkezés token generálással (200-as státuszkód)', async () => {
            const req = {
                body: { email: 'user@test.hu', password: 'helyesjelszo' }
            };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            const mockUser = { id: 1, nev: 'Béla', email: 'user@test.hu', jelszo_hash: 'hash123', felhasznalonev: 'bela01', jogosultsag: 'user' };

            db.query.mockResolvedValueOnce([[mockUser]]); 

            db.query.mockResolvedValueOnce([[]]); 

            bcrypt.compare.mockResolvedValue(true);

            jwt.sign.mockReturnValue('teszt_jwt_token_123');

            await authController.login(req, res);

            expect(jwt.sign).toHaveBeenCalled(); 
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    token: 'teszt_jwt_token_123',
                    user: expect.objectContaining({ email: 'user@test.hu', username: 'bela01' })
                })
            );
        });

        it('400-as hibát dob helytelen jelszó esetén', async () => {
            const req = {
                body: { email: 'user@test.hu', password: 'rosszjelszo' }
            };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            const mockUser = { id: 1, email: 'user@test.hu', jelszo_hash: 'hash123' };
            db.query.mockResolvedValueOnce([[mockUser]]);

            bcrypt.compare.mockResolvedValue(false);

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Hibás email vagy jelszó!' });
        });

        it('400-as hibát dob, ha nem létezik a felhasználó', async () => {
            const req = {
                body: { email: 'nincs_ilyen_user@test.hu', password: 'pw' }
            };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            db.query.mockResolvedValueOnce([[]]);

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Hibás email vagy jelszó!' });
        });
    });
});