import { Meteor } from 'meteor/meteor';
import { SyncedCron } from 'meteor/percolate:synced-cron';

import { Games } from '../../api/games/games.js';
import { Items } from '../../api/items/items.js';
import { Characters } from '../../api/characters/characters.js';
import { itemConfigs } from '../../configs/items.js';

import { regenLoop } from './regenLoop.js';
import { missionSpawnLoop } from './missionSpawnLoop.js';
import { aiActLoop, aiSpawnLoop } from './aiLoop.js';

SyncedCron.add({
  name: 'regenEnergy/HP',
  schedule: function(parser) {
    return parser.text('every 25 seconds')
  },
  job: regenLoop,
})
/*
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
SyncedCron.add({
  name: 'maguffin point-tick',
  schedule: function(parser){
    return parser.text('every 1 minute');
  },
  job: function(){
    Items.find({key: itemConfigs.misc.maguffin.key}).forEach(function(maguffin){
      if (!maguffin.ownerId) return;
      const owner = Characters.findOne(maguffin.ownerId);
      let incObj = {};
      incObj[owner.team+'.score'] = 1;
      Games.update(owner.gameId, {$inc: incObj});
    });
  }
});
SyncedCron.add({
  name: 'team auto-generate missions',
  schedule: function(parser){
    return parser.text('every 10 minutes');
  },
  job: missionSpawnLoop,
});
*/
Meteor.setTimeout(missionSpawnLoop, 2000);
SyncedCron.start();
