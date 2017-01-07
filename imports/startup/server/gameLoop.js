import { Meteor } from 'meteor/meteor';
import { SyncedCron } from 'meteor/percolate:synced-cron';

import { regenLoop } from './regenLoop.js';
import { aiActLoop, aiSpawnLoop } from './aiLoop.js';

SyncedCron.add({
  name: 'regenEnergy/HP',
  schedule: function(parser) {
    return parser.text('every 25 seconds')
  },
  job: regenLoop,
})
SyncedCron.add({
  name: 'aiAct',
  schedule: function(parser) {
    return parser.text('every 2 seconds')
  },
  job: aiActLoop,
})
SyncedCron.add({
  name: 'aiSpawn',
  schedule: function(parser) {
    return parser.text('every 2 minutes')
  },
  job: aiSpawnLoop,
})
SyncedCron.start();
