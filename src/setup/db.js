require('dotenv').config();
const mongoose = require('mongoose');

const dbuser = process.env.DBUSER;
const dbpass = process.env.DBPASS;
const dburl = process.env.DBURL;
const uri = `mongodb+srv://${dbuser}:${dbpass}@${dburl}`;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

require('../models/user');
require('../models/group');
const User = mongoose.model('User');
const Group = mongoose.model('Group');
