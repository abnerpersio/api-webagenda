const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const UserSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: uuidv4(),
    },
    username: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      min: 6,
      required: true,
    },
    services: Array,
    professionals: Array,
    opening: {
      monday: {
        from: { type: String },
        to: { type: String },
      },
      tuesday: {
        from: { type: String },
        to: { type: String },
      },
      wednesday: {
        from: { type: String },
        to: { type: String },
      },
      thursday: {
        from: { type: String },
        to: { type: String },
      },
      saturday: {
        from: { type: String },
        to: { type: String },
      },
      sunday: {
        from: { type: String },
        to: { type: String },
      },
    },
    specialOpening: [{ from: String, to: String }],
    isAdmin: { type: Boolean, default: false, select: false },
  },
  {
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
  }
);

mongoose.model('User', UserSchema);
