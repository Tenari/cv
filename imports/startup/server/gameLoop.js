import { Meteor } from 'meteor/meteor';

import { fightLoop } from './fightLoop.js';
import { regenLoop } from './regenLoop.js';
import { aiActLoop, aiSpawnLoop } from './aiLoop.js';

Meteor.setInterval(fightLoop, 5000);
Meteor.setInterval(regenLoop, 25000);
Meteor.setInterval(aiActLoop, 2000);
Meteor.setInterval(aiSpawnLoop, 240000);
