const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment-timezone');

require('moment/locale/pt-br');
moment.tz.setDefault('America/Sao_Paulo');

const HourOpeningSchema = new mongoose.Schema(
  {
    working: { type: Boolean, default: true },
    from: {
      type: String,
      required: [true, 'por favor adicione um horário valido'],
    },
    to: {
      type: String,
      required: [true, 'por favor adicione um horário valido'],
    },
  },
  { _id: false }
);

const HourEventSchema = new mongoose.Schema(
  {
    from: {
      type: String,
      required: [true, 'por favor adicione um horário valido'],
    },
    to: {
      type: String,
      required: [true, 'por favor adicione um horário valido'],
    },
  },
  { _id: false }
);

const EventSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: mongoose.Types.ObjectId(),
  },
  clientName: {
    type: String,
    required: [true, 'ei! faltou o nome do cliente'],
  },
  service: {
    type: String,
    lowercase: true,
    required: [true, 'ei! faltou o serviço'],
  },
  professional: {
    type: String,
    required: [true, 'ei! faltou um nome de profissional'],
  },
  from: {
    type: String,
    required: [true, 'por favor adicione um horário valido'],
  },
  to: {
    type: String,
    required: [true, 'por favor adicione um horário valido'],
  },
  exclusionDate: {
    type: String,
    default: moment().add(90, 'days').format('DD-MM-YYYY'),
  },
});

EventSchema.post('validate', function (doc) {
  if (
    !moment(doc.exclusionDate, 'DD-MM-YYYY').isSame(
      moment(doc.from, 'DD-MM-YYYY HH:mm').add(60, 'days'),
      'day'
    )
  ) {
    doc.exclusionDate = moment(doc.from, 'DD-MM-YYYY HH:mm')
      .add(60, 'days')
      .format('DD-MM-YYYY');
  }

  if (String(doc._id).length == 24) {
    let newId = moment(doc.from, 'DD-MM-YYYY HH:mm').format('DD-MM-YYYY HH:mm');
    doc._id = newId.concat(' ', String(doc.professional).toLowerCase());
  }
});

const OpeningSchema = new mongoose.Schema(
  {
    seg: {
      type: HourOpeningSchema,
      required: [true, 'preencha o campo segunda'],
    },
    ter: {
      type: HourOpeningSchema,
      required: [true, 'preencha o campo terça'],
    },
    qua: {
      type: HourOpeningSchema,
      required: [true, 'preencha o campo quarta'],
    },
    qui: {
      type: HourOpeningSchema,
      required: [true, 'preencha o campo quinta'],
    },
    sex: {
      type: HourOpeningSchema,
      required: [true, 'preencha o campo sexta'],
    },
    sáb: {
      type: HourOpeningSchema,
      required: [true, 'preencha o campo sabado'],
    },
    dom: {
      type: HourOpeningSchema,
      required: [true, 'preencha o campo domingo'],
    },
  },
  { _id: false }
);

const ServiceSchema = new mongoose.Schema(
  {
    serviceName: { type: String, lowercase: true, required: true },
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
      lowercase: true,
      unique: true,
      required: [true, 'digite um nome de usuário!'],
    },
    password: {
      type: String,
      min: 6,
      required: [true, 'digite uma senha!'],
    },
    professional: String,
    services: [ServiceSchema],
    opening: OpeningSchema,
    closing: OpeningSchema,
    specialOpening: [HourEventSchema],
    schedule: [EventSchema],
    groupName: String,
    notificationsToken: String,
    isAdmin: { type: Boolean, default: false, select: false },
  },
  {
    toJSON: { virtuals: true, getters: true, setters: true },
    toObject: { virtuals: true, getters: true, setters: true },
  }
);

mongoose.model('User', UserSchema, 'users');
