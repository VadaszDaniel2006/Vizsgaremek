const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware'); 

// Felhasználók kezelése
router.get('/users', adminController.getAllUsers);
router.delete('/users/:id', adminController.deleteUser);
router.put('/users/:id', adminController.updateUser);

// Kommentek kezelése
router.get('/reported-reviews', protect, adminController.getReportedReviews);
router.put('/reported-reviews/:id/dismiss', protect, adminController.dismissReport);
router.delete('/reported-reviews/:id', protect, adminController.deleteReportedReview); // <--- ÚJ TÖRLŐ VÉGPONT

// Tartalom (Filmek/Sorozatok) kezelése
router.post('/media', protect, adminController.addMedia);           
router.get('/media', protect, adminController.getAllMedia);         
router.put('/media/:id', protect, adminController.updateMedia);     
router.delete('/media/:id', protect, adminController.deleteMedia);  

router.get('/mozik', adminController.getAllMozik);

router.get('/categories', adminController.getAllCategories);

module.exports = router;