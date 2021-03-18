const mongoose = require('mongoose');

const HorarioSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
});

const EventSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  service: { type: String, required: true },
  professional: { type: String, required: true },
  horario: HorarioSchema,
});

const ScheduleSchema = new mongoose.Schema(
  {
    _id: { type: String },
    events: [EventSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
  }
);

mongoose.model('Schedule', ScheduleSchema);
