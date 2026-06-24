const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// Route for tracking client events
router.post('/events', analyticsController.createEvent);

// Route for high-level statistics summary
router.get('/analytics/summary', analyticsController.getAnalyticsSummary);

// Route for listing all sessions (aggregated statistics)
router.get('/sessions', analyticsController.getSessions);

// Route for distinct pages tracked
router.get('/pages', analyticsController.getTrackedPages);

// Route for fetching click event coordinates for a specific page url
router.get('/heatmap', analyticsController.getHeatmapData);

// Route for fetching detailed timeline of events for a single session
router.get('/sessions/:sessionId', analyticsController.getSessionJourney);

module.exports = router;
