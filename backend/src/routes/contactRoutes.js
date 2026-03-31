const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// Itt a varázslat: "kicsomagoljuk" a protect és admin függvényeket
const { protect, admin } = require('../middleware/authMiddleware');

// Bárki küldhet üzenetet a weboldalról (ide nem kell védelem)
router.post('/', contactController.sendMessage);

// Csak az admin olvashatja és kezelheti őket (kell a 'protect' és az 'admin' is!)
router.get('/messages', protect, admin, contactController.getMessages);
router.put('/messages/:id/read', protect, admin, contactController.markAsRead);
router.delete('/messages/:id', protect, admin, contactController.deleteMessage);

module.exports = router;