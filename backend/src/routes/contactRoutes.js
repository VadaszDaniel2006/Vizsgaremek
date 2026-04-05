const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');


const { protect, admin } = require('../middleware/authMiddleware');


router.post('/', contactController.sendMessage);


router.get('/messages', protect, admin, contactController.getMessages);
router.put('/messages/:id/read', protect, admin, contactController.markAsRead);
router.delete('/messages/:id', protect, admin, contactController.deleteMessage);

module.exports = router;