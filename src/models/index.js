import mongoose from 'mongoose';

import './user';
import './group';

export const User = mongoose.model('User');
export const Group = mongoose.model('Group');
