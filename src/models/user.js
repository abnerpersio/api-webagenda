import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment-timezone';
import 'moment/locale/pt-br';
import { hash } from '../setup/crypto';

moment.tz.setDefault('America/Sao_Paulo');

const HourOpeningSchema = new mongoose.Schema(
  {
    working: { type: Boolean, default: true },
    from: {
      type: String,
      required: true,
    },
    to: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const HourEventSchema = new mongoose.Schema(
  {
    from: {
      type: String,
      required: true,
    },
    to: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const EventSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: mongoose.Types.ObjectId(),
  },
  clientName: {
    type: String,
    required: true,
  },
  clientPhone: String,
  service: {
    type: String,
    lowercase: true,
  },
  professional: {
    type: String,
    required: false,
  },
  from: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  exclusionDate: {
    type: String,
    default: moment().add(90, 'days').format('DD-MM-YYYY'),
  },
});

EventSchema.post('validate', (doc) => {
  if (
    !moment(doc.exclusionDate, 'DD-MM-YYYY').isSame(
      moment(doc.from, 'DD-MM-YYYY HH:mm').add(60, 'days'),
      'day',
    )
  ) {
    doc.exclusionDate = moment(doc.from, 'DD-MM-YYYY HH:mm')
      .add(60, 'days')
      .format('DD-MM-YYYY');
  }

  if (String(doc._id).length === 24) {
    const newId = moment(doc.from, 'DD-MM-YYYY HH:mm').format('DD-MM-YYYY HH:mm');
    doc._id = newId.concat(' ', String(doc.professional).toLowerCase());
  }
});

const OpeningSchema = new mongoose.Schema(
  {
    seg: {
      type: HourOpeningSchema,
      required: true,
    },
    ter: {
      type: HourOpeningSchema,
      required: true,
    },
    qua: {
      type: HourOpeningSchema,
      required: true,
    },
    qui: {
      type: HourOpeningSchema,
      required: true,
    },
    sex: {
      type: HourOpeningSchema,
      required: true,
    },
    sáb: {
      type: HourOpeningSchema,
      required: true,
    },
    dom: {
      type: HourOpeningSchema,
      required: true,
    },
  },
  { _id: false },
);

const ServiceSchema = new mongoose.Schema(
  {
    serviceName: { type: String, lowercase: true, required: true },
    serviceTime: { type: String, required: true },
  },
  { _id: false },
);

const getDefaultOpening = () => ({
  seg: {
    from: '00:00',
    to: '00:00',
  },
  ter: {
    from: '00:00',
    to: '00:00',
  },
  qua: {
    from: '00:00',
    to: '00:00',
  },
  qui: {
    from: '00:00',
    to: '00:00',
  },
  sex: {
    from: '00:00',
    to: '00:00',
  },
  sáb: {
    from: '00:00',
    to: '00:00',
  },
  dom: {
    from: '00:00',
    to: '00:00',
  },
});

const UserSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    username: {
      type: String,
      lowercase: true,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      min: 6,
      required: true,
      select: false,
      set: (e) => hash(e),
    },
    role: {
      type: String,
      default: 'user',
    },
    professional: String,
    services: [ServiceSchema],
    opening: {
      type: OpeningSchema,
      default: () => getDefaultOpening(),
    },
    closing: {
      type: OpeningSchema,
      default: () => getDefaultOpening(),
    },
    specialOpening: [HourEventSchema],
    schedule: [EventSchema],
    groupName: String,
    notificationsToken: String,
    isAdmin: { type: Boolean, default: false, select: false },
  },
);

mongoose.model('User', UserSchema, 'users');
