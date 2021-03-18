const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const HorarioSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
});

const OpeningSchema = new mongoose.Schema({
  monday: HorarioSchema,
  tuesday: HorarioSchema,
  wednesday: HorarioSchema,
  thursday: HorarioSchema,
  saturday: HorarioSchema,
  sunday: HorarioSchema,
});

const ServiceSchema = new mongoose.Schema({
  serviceName: { type: String, required: true },
  serviceTime: { type: String, required: true },
});

const UserSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: uuidv4(),
    },
    username: {
      type: String,
      unique: [true, 'nome de usuário já em uso'],
      required: [true, 'digite um nome de usuário!'],
    },
    password: {
      type: String,
      min: 6,
      required: [true, 'digite uma senha!'],
    },
    // services: [ServiceSchema],
    // services: Array,
    // professionals: Array,
    // opening: OpeningSchema,
    opening: {
      day: Number,
    },
    // specialOpening: [HorarioSchema],
    isAdmin: { type: Boolean, default: false, select: false },
  },
  {
    toJSON: { virtuals: true, getters: true, setters: true },
    toObject: { virtuals: true, getters: true, setters: true },
  }
);

mongoose.model('User', UserSchema, 'users');
