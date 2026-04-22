const express = require('express');
const router = express.Router();
const AnalyticsController = require('../controllers/AnalyticsController');

router.get('/dashboard', AnalyticsController.getDashboardStats);

module.exports = router;
