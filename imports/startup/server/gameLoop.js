import { Meteor } from 'meteor/meteor';

import { fightLoop } from './fightLoop.js';
import { regenLoop } from './regenLoop.js';

Meteor.setInterval(fightLoop, 5000);
Meteor.setInterval(regenLoop, 25000);
