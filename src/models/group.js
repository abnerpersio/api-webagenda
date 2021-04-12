const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

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
    chatId: String,
  },
  {
    toJSON: { virtuals: true, getters: true, setters: true },
    toObject: { virtuals: true, getters: true, setters: true },
  }
);

mongoose.model('Group', GroupSchema, 'groups');
