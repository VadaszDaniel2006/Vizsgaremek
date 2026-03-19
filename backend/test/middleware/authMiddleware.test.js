const { protect, admin } = require('../../src/middleware/authMiddleware');
const jwt = require('jsonwebtoken');

// A jsonwebtoken modult mockoljuk, hogy ne kelljen igazi tokeneket generálnunk
jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {

    let req, res, next;

    // Minden teszt előtt lenullázzuk a req, res, és next objektumokat
    beforeEach(() => {
        req = {
            headers: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn(); // A next() meghívását fogjuk figyelni
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // --- PROTECT MIDDLEWARE TESZTEK ---
    describe('protect middleware', () => {

        it('401-es hibát dob, ha nincs token a fejlécben', () => {
            protect(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'Nincs token, nem vagy jogosult!' });
            expect(next).not.toHaveBeenCalled(); // Nem engedheti tovább a kérést!
        });

        it('401-es hibát dob, ha a token érvénytelen (hibát dob a jwt.verify)', () => {
            req.headers.authorization = 'Bearer ROSSZ_TOKEN';
            
            // Szimuláljuk, hogy a jwt.verify hibára fut
            jwt.verify.mockImplementation(() => { throw new Error('Invalid token'); });

            protect(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'Érvénytelen token!' });
            expect(next).not.toHaveBeenCalled();
        });

        it('Sikeresen továbbengedi a kérést és beállítja a req.user-t, ha jó a token', () => {
            req.headers.authorization = 'Bearer JOTOKEN123';
            const mockDecodedUser = { id: 1, role: 'user' };
            
            // Szimuláljuk, hogy a jwt.verify sikeres, és visszaadja a dekódolt adatokat
            jwt.verify.mockReturnValue(mockDecodedUser);

            protect(req, res, next);

            expect(jwt.verify).toHaveBeenCalledWith('JOTOKEN123', expect.any(String));
            expect(req.user).toEqual(mockDecodedUser); // Ellenőrizzük, hogy a user bekerült-e a requestbe
            expect(next).toHaveBeenCalledTimes(1);     // Sikeresen továbbment a kérés
        });
    });

    // --- ADMIN MIDDLEWARE TESZTEK ---
    describe('admin middleware', () => {

        it('403-as hibát dob, ha a felhasználó nem admin (vagy nincs bejelentkezve)', () => {
            // Szimuláljuk, hogy egy sima user érkezik
            req.user = { id: 1, role: 'user' };

            admin(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: 'Hozzáférés megtagadva! Csak adminisztrátoroknak.' });
            expect(next).not.toHaveBeenCalled();
        });

        it('Sikeresen továbbengedi a kérést, ha a felhasználó admin', () => {
            // Szimuláljuk, hogy egy admin érkezik
            req.user = { id: 2, role: 'admin' };

            admin(req, res, next);

            expect(next).toHaveBeenCalledTimes(1); // Az admin továbbmehet
            expect(res.status).not.toHaveBeenCalled(); 
        });
    });
});