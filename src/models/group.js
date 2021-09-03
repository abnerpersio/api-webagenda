import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const GroupSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    name: {
      type: String,
      lowercase: true,
      unique: true,
      required: true,
    },
    chatId: String,
  },
  {
    toJSON: { virtuals: true, getters: true, setters: true },
    toObject: { virtuals: true, getters: true, setters: true },
  },
);

mongoose.model('Group', GroupSchema, 'groups');
