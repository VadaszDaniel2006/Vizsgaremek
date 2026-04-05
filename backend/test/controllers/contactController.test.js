const contactController = require('../../src/controllers/contactController');
const db = require('../../src/config/db');

jest.mock('../../src/config/db');

describe('Contact Controller', () => {

    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('sendMessage', () => {
        it('400-as hibát dob, ha hiányoznak a kötelező mezők', async () => {
            const req = { body: { nev: 'Teszt', email: 'teszt@test.com' } };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            await contactController.sendMessage(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Minden mező kitöltése kötelező!' });
        });

        it('404-es hibát dob, ha nem létezik a felhasználó (név vagy email nem egyezik)', async () => {
 
            db.query.mockResolvedValueOnce([[]]);

            const req = { 
                body: { nev: 'Kamu Nev', email: 'kamu@test.com', tema: 'Hiba', uzenet: 'Teszt üzenet' } 
            };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            await contactController.sendMessage(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ 
                message: 'Csak regisztrált fiókkal küldhető üzenet! A megadott név vagy e-mail cím nem egyezik a rendszerünkben lévőkkel.' 
            });
        });

        it('201-es kóddal sikeresen elmenti az üzenetet, ha a felhasználó létezik', async () => {

            db.query.mockResolvedValueOnce([[{ id: 5 }]]);

            db.query.mockResolvedValueOnce([{ insertId: 10 }]);

            const req = { 
                body: { nev: 'Valos Nev', email: 'valos@test.com', tema: 'Hiba', uzenet: 'Teszt üzenet' } 
            };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            await contactController.sendMessage(req, res);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ message: 'Üzenet sikeresen elküldve!', id: 10 });
        });

        it('500-as hibát dob adatbázis hiba esetén', async () => {

            db.query.mockRejectedValueOnce(new Error('DB hiba'));

            const req = { 
                body: { nev: 'Valos Nev', email: 'valos@test.com', tema: 'Hiba', uzenet: 'Teszt üzenet' } 
            };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            await contactController.sendMessage(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Szerverhiba történt az üzenet küldésekor.' });
        });
    });

    describe('getMessages', () => {
        it('Sikeresen visszaadja az üzenetek listáját', async () => {
            const mockMessages = [{ id: 1, uzenet: 'Teszt1' }, { id: 2, uzenet: 'Teszt2' }];
            db.query.mockResolvedValueOnce([mockMessages]);

            const req = {};
            const res = { json: jest.fn() };

            await contactController.getMessages(req, res);
            expect(res.json).toHaveBeenCalledWith(mockMessages);
        });

        it('500-as hibát dob adatbázis hiba esetén', async () => {
            db.query.mockRejectedValueOnce(new Error('DB hiba'));

            const req = {};
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            await contactController.getMessages(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Szerverhiba.' });
        });
    });

    describe('markAsRead', () => {
        it('Sikeresen olvasottnak jelöli az üzenetet', async () => {
            db.query.mockResolvedValueOnce([{}]);

            const req = { params: { id: 1 } };
            const res = { json: jest.fn() };

            await contactController.markAsRead(req, res);
            expect(db.query).toHaveBeenCalledWith('UPDATE kapcsolat_uzenetek SET olvasva = 1 WHERE id = ?', [1]);
            expect(res.json).toHaveBeenCalledWith({ message: 'Olvasottnak jelölve.' });
        });

        it('500-as hibát dob adatbázis hiba esetén', async () => {
            db.query.mockRejectedValueOnce(new Error('DB hiba'));

            const req = { params: { id: 1 } };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            await contactController.markAsRead(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('deleteMessage', () => {
        it('Sikeresen törli az üzenetet', async () => {
            db.query.mockResolvedValueOnce([{}]);

            const req = { params: { id: 1 } };
            const res = { json: jest.fn() };

            await contactController.deleteMessage(req, res);
            expect(db.query).toHaveBeenCalledWith('DELETE FROM kapcsolat_uzenetek WHERE id = ?', [1]);
            expect(res.json).toHaveBeenCalledWith({ message: 'Üzenet törölve.' });
        });

        it('500-as hibát dob adatbázis hiba esetén', async () => {
            db.query.mockRejectedValueOnce(new Error('DB hiba'));

            const req = { params: { id: 1 } };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            await contactController.deleteMessage(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});