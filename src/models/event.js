const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
    },
    service: {
      type: String,
    },
    professional: {
      type: String,
    },
    from: {
      type: String,
    },
    to: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
  }
);

mongoose.model('Event', EventSchema);
