// Beimportáljuk a kontrollert, amit tesztelni akarunk
const authController = require('../../src/controllers/authController');

// Beimportáljuk a külső függőségeket
const db = require('../../src/config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mockoljuk a külső modulokat
jest.mock('../../src/config/db');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('Auth Controller', () => {
    
    // Elnémítjuk a console.error és console.warn hívásokat a tesztek alatt
    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // --- REGISZTRÁCIÓ TESZTEK ---
    describe('register', () => {
        
        it('Sikeres regisztráció (201-es státuszkód)', async () => {
            // Előkészület
            const req = {
                body: { name: 'Teszt Elek', email: 'teszt@elek.hu', password: 'jelszo', username: 'tesztuser' }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            // Szimuláljuk, hogy az email és felhasználónév MŰKÖDIK (üres tömbbel tér vissza a DB)
            db.query.mockResolvedValueOnce([[]]); 
            // Szimuláljuk a sikeres adatbázis beillesztést
            db.query.mockResolvedValueOnce([{ insertId: 1 }]); 
            
            // Szimuláljuk a jelszó titkosítást
            bcrypt.genSalt.mockResolvedValue('randomSalt');
            bcrypt.hash.mockResolvedValue('hashedPassword123');

            // Végrehajtás
            await authController.register(req, res);

            // Ellenőrzés
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ message: 'Sikeres regisztráció!' });
            // Ellenőrizzük, hogy a jelszó titkosítva lett-e elmentve
            expect(db.query).toHaveBeenNthCalledWith(
                2, // A 2. db.query hívás az INSERT
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

            // Szimuláljuk, hogy a DB-ben TÉNYLEG van ilyen email
            db.query.mockResolvedValueOnce([[{ email: 'foglalt@email.hu', felhasznalonev: 'masvalaki' }]]);

            await authController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Ez az email cím már foglalt!' });
        });
    });

    // --- BEJELENTKEZÉS TESZTEK ---
    describe('login', () => {

        it('Sikeres bejelentkezés token generálással (200-as státuszkód)', async () => {
            const req = {
                body: { email: 'user@test.hu', password: 'helyesjelszo' }
            };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            const mockUser = { id: 1, nev: 'Béla', email: 'user@test.hu', jelszo_hash: 'hash123', felhasznalonev: 'bela01', jogosultsag: 'user' };
            
            // Adatbázis visszaadja a felhasználót
            db.query.mockResolvedValueOnce([[mockUser]]); 
            // Nincsenek kedvenc kategóriák (hogy egyszerű legyen a teszt)
            db.query.mockResolvedValueOnce([[]]); 

            // A jelszó egyezik
            bcrypt.compare.mockResolvedValue(true);
            // A JWT token generálódik
            jwt.sign.mockReturnValue('teszt_jwt_token_123');

            await authController.login(req, res);

            expect(jwt.sign).toHaveBeenCalled(); // Ellenőrizzük, hogy kért-e tokent
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
            
            // Szimuláljuk a bcrypt hibát: a jelszó NEM egyezik
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

            // A DB üres tömböt ad vissza az email keresésre
            db.query.mockResolvedValueOnce([[]]);

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Hibás email vagy jelszó!' });
        });
    });
});