// backend/src/routes/moziRoutes.js
const express = require('express');
const router = express.Router();

// --- EZ A SOR HIÁNYZOTT VAGY HIBÁS VOLT: ---
const moziController = require('../controllers/moziController'); 

// Visszaadja az összes mozit
router.get('/', moziController.getOsszesMozi);

// Visszaadja egy konkrét film mozis vetítéseit
router.get('/:id/mozik', moziController.getMozikForMedia);

// Visszaadja egy konkrét film streaming platformjait
router.get('/:id/platformok', moziController.getPlatformokForMedia);

module.exports = router;