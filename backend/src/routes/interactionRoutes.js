const express = require('express');
const router = express.Router();
const interactionController = require('../controllers/interactionController');

// ==========================================
// --- KEDVENCEK (Favorites) ---
// ==========================================
router.post('/favorite', interactionController.addToFavorites);
router.delete('/favorite', interactionController.removeFromFavorites);
router.get('/users/:userId/favorites', interactionController.getFavorites);

// ==========================================
// --- SAJÁT LISTA (My List) ---
// ==========================================
router.post('/mylist', interactionController.addToMyList);
router.delete('/mylist', interactionController.removeFromMyList);
router.get('/users/:userId/mylist', interactionController.getMyList);
router.post('/status', interactionController.checkStatus);

// ==========================================
// --- VÉLEMÉNYEK (Reviews) ---
// ==========================================
// 1. Vélemények lekérése
router.get('/reviews/:type/:id', interactionController.getReviews);

// 2. Vélemény írása
router.post('/reviews', interactionController.addReview);

// 3. Vélemény törlése (EZT PÓTOLTUK!)
router.delete('/reviews', interactionController.deleteReview);

router.post('/reviews/:reviewId/report', interactionController.reportReview);

module.exports = router;