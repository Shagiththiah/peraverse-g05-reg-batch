// routes/newFeatureRoutes.js
const express = require('express');
const router = express.Router();
const { handleNewFeature } = require('../controllers/newFeatureController');

router.post('/feature', handleNewFeature);

module.exports = router;
