const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      enum: ['page_view', 'click'],
      index: true,
    },
    pageUrl: {
      type: String,
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    x: {
      type: Number,
      default: null,
    },
    y: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically for administrative tracking
  }
);

// Compound indexes for analytics query optimization
// 1. For session journey retrieval: find all events for sessionId sorted by timestamp
EventSchema.index({ sessionId: 1, timestamp: 1 });

// 2. For heatmap retrieval: find clicks (eventType = 'click') on a specific page (pageUrl)
EventSchema.index({ pageUrl: 1, eventType: 1 });

const Event = mongoose.model('Event', EventSchema);

module.exports = Event;
