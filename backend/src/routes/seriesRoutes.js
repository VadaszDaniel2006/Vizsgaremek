const express = require('express');
const router = express.Router();
const seriesController = require('../controllers/seriesController');

router.get('/', seriesController.getAllSeries);
router.get('/top50', seriesController.getTop50Series);

module.exports = router;