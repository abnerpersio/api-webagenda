const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const HorarioSchema = new mongoose.Schema(
  {
    from: { type: String, required: true },
    to: { type: String, required: true },
  },
  { _id: false }
);

const EventSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  service: { type: String, required: true },
  professional: { type: String, required: true },
  horario: HorarioSchema,
});

const OpeningSchema = new mongoose.Schema(
  {
    monday: HorarioSchema,
    tuesday: HorarioSchema,
    wednesday: HorarioSchema,
    thursday: HorarioSchema,
    saturday: HorarioSchema,
    sunday: HorarioSchema,
  },
  { _id: false }
);

const ServiceSchema = new mongoose.Schema(
  {
    serviceName: { type: String, required: true },
    serviceTime: { type: String, required: true },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: uuidv4(),
    },
    username: {
      type: String,
      unique: true,
      required: [true, 'digite um nome de usuário!'],
    },
    password: {
      type: String,
      min: 6,
      required: [true, 'digite uma senha!'],
    },
    professionals: Array,
    services: [ServiceSchema],
    opening: OpeningSchema,
    specialOpening: [HorarioSchema],
    schedule: [EventSchema],
    isAdmin: { type: Boolean, default: false, select: false },
  },
  {
    toJSON: { virtuals: true, getters: true, setters: true },
    toObject: { virtuals: true, getters: true, setters: true },
  }
);

mongoose.model('User', UserSchema, 'users');
