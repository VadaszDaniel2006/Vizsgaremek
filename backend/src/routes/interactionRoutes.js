const express = require('express');
const router = express.Router();
const interactionController = require('../controllers/interactionController');

router.post('/favorite', interactionController.addToFavorites);
router.delete('/favorite', interactionController.removeFromFavorites);
router.get('/users/:userId/favorites', interactionController.getFavorites);


router.post('/mylist', interactionController.addToMyList);
router.delete('/mylist', interactionController.removeFromMyList);
router.get('/users/:userId/mylist', interactionController.getMyList);
router.post('/status', interactionController.checkStatus);


router.get('/reviews/:type/:id', interactionController.getReviews);

router.post('/reviews', interactionController.addReview);

router.delete('/reviews', interactionController.deleteReview);

router.post('/reviews/:reviewId/report', interactionController.reportReview);

module.exports = router;