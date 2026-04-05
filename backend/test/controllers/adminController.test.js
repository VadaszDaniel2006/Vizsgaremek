const adminController = require('../../src/controllers/adminController');
const db = require('../../src/config/db');
const bcrypt = require('bcryptjs');

jest.mock('../../src/config/db');
jest.mock('bcryptjs');

describe('Admin Controller', () => {

    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllUsers', () => {
        it('Sikeresen lekéri a felhasználókat (200)', async () => {
            const mockUsers = [{ id: 1, username: 'admin', email: 'admin@test.hu' }];
            db.query.mockResolvedValueOnce([mockUsers]);

            const req = {};
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            await adminController.getAllUsers(req, res);

            expect(res.json).toHaveBeenCalledWith(mockUsers);
            expect(db.query).toHaveBeenCalledTimes(1);
        });
    });

    describe('deleteUser', () => {
        it('Sikeresen törli a felhasználót és minden adatát (200)', async () => {
  
            db.query.mockResolvedValue([{}]); 

            const req = { params: { id: 5 } };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            await adminController.deleteUser(req, res);

            expect(db.query).toHaveBeenCalledTimes(5); 
            expect(res.json).toHaveBeenCalledWith({ message: 'Felhasználó sikeresen törölve.' });
        });
    });

    describe('updateUser', () => {
        it('400-as hibát dob, ha az új email már foglalt', async () => {

            db.query.mockResolvedValueOnce([[{ id: 2 }]]); 

            const req = { 
                params: { id: 1 }, 
                body: { email: 'foglalt@test.hu', role: 'user' } 
            };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            await adminController.updateUser(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Ez az email cím már foglalt!" });
        });

        it('Sikeresen frissíti a felhasználót jelszó módosítás nélkül (200)', async () => {
            db.query.mockResolvedValueOnce([[]]); 
            db.query.mockResolvedValueOnce([{}]); 

            const req = { 
                params: { id: 1 }, 
                body: { email: 'uj@test.hu', role: 'admin', password: '' } 
            };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            await adminController.updateUser(req, res);

            expect(db.query).toHaveBeenCalledTimes(2);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: "Sikeres frissítés!" })
            );
        });
    });

    describe('getAllCategories', () => {
        it('Sikeresen lekéri az összes kategóriát (200)', async () => {
            const mockCats = [{ id: 1, nev: 'Akció' }, { id: 2, nev: 'Vígjáték' }];
            db.query.mockResolvedValueOnce([mockCats]);

            const req = {};
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            await adminController.getAllCategories(req, res);

            expect(res.json).toHaveBeenCalledWith(mockCats);
        });
    });

    describe('deleteMedia', () => {
        it('Sikeresen törli a filmet/sorozatot és minden kapcsolatát (200)', async () => {
            db.query.mockResolvedValue([{}]);

            const req = { params: { id: 100 } };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            await adminController.deleteMedia(req, res);

            expect(db.query).toHaveBeenCalledTimes(6); 
            expect(res.json).toHaveBeenCalledWith({ message: 'Tartalom sikeresen törölve.' });
        });
    });
});