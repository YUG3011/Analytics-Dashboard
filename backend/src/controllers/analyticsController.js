const Event = require('../models/Event');

/**
 * Receive and save an tracking event
 * POST /api/events
 */
exports.createEvent = async (req, res) => {
  try {
    const { sessionId, eventType, pageUrl, timestamp, x, y } = req.body;

    if (!sessionId || !eventType || !pageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: sessionId, eventType, and pageUrl are required.',
      });
    }

    const newEvent = new Event({
      sessionId,
      eventType,
      pageUrl,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      x: eventType === 'click' ? x : null,
      y: eventType === 'click' ? y : null,
    });

    await newEvent.save();

    return res.status(201).json({
      success: true,
      message: 'Event tracked successfully',
      data: newEvent,
    });
  } catch (error) {
    console.error('Error creating event:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error while tracking event.',
      error: error.message,
    });
  }
};

/**
 * Retrieve list of all sessions sorted by last activity
 * GET /api/sessions
 */
exports.getSessions = async (req, res) => {
  try {
    const sessions = await Event.aggregate([
      {
        $group: {
          _id: '$sessionId',
          totalEvents: { $sum: 1 },
          lastActivity: { $max: '$timestamp' },
        },
      },
      {
        $project: {
          _id: 0,
          sessionId: '$_id',
          totalEvents: 1,
          lastActivity: 1,
        },
      },
      {
        $sort: { lastActivity: -1 },
      },
    ]);

    return res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error while fetching sessions.',
      error: error.message,
    });
  }
};

/**
 * Get all events for a specific session ordered chronologically
 * GET /api/sessions/:sessionId
 */
exports.getSessionJourney = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'sessionId is required.',
      });
    }

    const events = await Event.find({ sessionId }).sort({ timestamp: 1 });

    return res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error(`Error fetching session journey for ${req.params.sessionId}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error while fetching session journey.',
      error: error.message,
    });
  }
};

/**
 * Get click coordinates only for a given URL
 * GET /api/heatmap
 */
exports.getHeatmapData = async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter url is required.',
      });
    }

    // Retrieve x, y coordinates for all click events on the specified page
    const clicks = await Event.find(
      { pageUrl: url, eventType: 'click' },
      { x: 1, y: 1, _id: 0 }
    ).sort({ timestamp: 1 });

    return res.status(200).json({
      success: true,
      count: clicks.length,
      data: clicks,
    });
  } catch (error) {
    console.error(`Error fetching heatmap for ${req.query.url}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error while fetching heatmap data.',
      error: error.message,
    });
  }
};

/**
 * Get distinct tracked pages URLs
 * GET /api/pages
 */
exports.getTrackedPages = async (req, res) => {
  try {
    const pages = await Event.distinct('pageUrl');

    return res.status(200).json({
      success: true,
      count: pages.length,
      data: pages,
    });
  } catch (error) {
    console.error('Error fetching distinct pages:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error while fetching distinct pages.',
      error: error.message,
    });
  }
};

/**
 * Retrieve high-level summary metrics
 * GET /api/analytics/summary
 */
exports.getAnalyticsSummary = async (req, res) => {
  try {
    const summary = await Event.aggregate([
      {
        $facet: {
          totalEvents: [{ $count: 'count' }],
          totalClicks: [{ $match: { eventType: 'click' } }, { $count: 'count' }],
          totalPageViews: [{ $match: { eventType: 'page_view' } }, { $count: 'count' }],
          uniqueSessions: [{ $group: { _id: '$sessionId' } }, { $count: 'count' }],
        },
      },
    ]);

    const result = {
      totalEvents: summary[0]?.totalEvents[0]?.count || 0,
      totalClicks: summary[0]?.totalClicks[0]?.count || 0,
      totalPageViews: summary[0]?.totalPageViews[0]?.count || 0,
      totalSessions: summary[0]?.uniqueSessions[0]?.count || 0,
    };

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error generating summary analytics:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error while fetching summary metrics.',
      error: error.message,
    });
  }
};
