const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); 

// Regisztráció
router.post('/register', authController.register);

// Bejelentkezés
router.post('/login', authController.login);

// --- ÚJ: Elfelejtett jelszó ---
router.post('/forgot-password', authController.forgotPassword);

// Profil frissítése (Védett útvonal!)
router.put('/update-profile', protect, authController.updateProfile);
router.get('/me', protect, authController.getMe);

module.exports = router;