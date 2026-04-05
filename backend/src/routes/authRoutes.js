const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); 

router.post('/register', authController.register);

router.post('/login', authController.login);

router.post('/forgot-password', authController.forgotPassword);

router.put('/update-profile', protect, authController.updateProfile);
router.get('/me', protect, authController.getMe);

module.exports = router;