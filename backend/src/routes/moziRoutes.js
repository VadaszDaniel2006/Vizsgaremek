const express = require('express');
const router = express.Router();

const moziController = require('../controllers/moziController'); 

router.get('/', moziController.getOsszesMozi);

router.get('/:id/mozik', moziController.getMozikForMedia);

router.get('/:id/platformok', moziController.getPlatformokForMedia);

module.exports = router;