const express = require('express');
const router = express.Router();
const { getOsszesMozi } = require('../controllers/moziController');

// Ez felel majd a /api/mozik lekérdezésért
router.get('/', getOsszesMozi);

module.exports = router;