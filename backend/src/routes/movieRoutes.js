const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');

router.get('/', movieController.getAllMovies);
router.get('/top50', movieController.getTop50Movies); // ÚJ VÉGPONT

module.exports = router;