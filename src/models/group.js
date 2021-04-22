const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ServiceSchema = new mongoose.Schema(
  {
    serviceName: { type: String, lowercase: true, required: true },
    serviceTime: { type: String, required: true },
  },
  { _id: false }
);

const GroupSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: uuidv4(),
    },
    name: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, 'digite um nome de grupo!'],
    },
    services: [ServiceSchema],
    chatId: String,
  },
  {
    toJSON: { virtuals: true, getters: true, setters: true },
    toObject: { virtuals: true, getters: true, setters: true },
  }
);

mongoose.model('Group', GroupSchema, 'groups');
