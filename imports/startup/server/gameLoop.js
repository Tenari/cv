import { Meteor } from 'meteor/meteor';
import { SyncedCron } from 'meteor/percolate:synced-cron';

import { regenLoop } from './regenLoop.js';
import { aiActLoop, aiSpawnLoop } from './aiLoop.js';

SyncedCron.start();
Meteor.setInterval(regenLoop, 25000);
Meteor.setInterval(aiActLoop, 2000);
Meteor.setInterval(aiSpawnLoop, 240000);
