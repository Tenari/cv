import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { SyncedCron } from 'meteor/percolate:synced-cron';

import { Fights } from '../api/fights/fights.js';
import { Items } from '../api/items/items.js';
import { Characters } from '../api/characters/characters.js';

import { styleFactors, fightEnergyCostFactor, speeds, recalculateStats } from './game.js';
import { equipSlots } from './items.js';

export function countDownToRound(fightId){
  const fight = Fights.findOne(fightId)
  SyncedCron.add({
    name: 'Fights:'+fightId+':'+fight.round,
    schedule: function(parser){
      var t = new Date();
      t.setSeconds(t.getSeconds() + 5);
      return parser.recur().on(t).fullDate();
    },
    job: function(){
      fightNextRound(fightId);
    }
  })
}

export function fightNextRound(fightId){
  let fight = Fights.findOne(fightId);
  // either it has been 5 seconds, and it doesn't matter if they are ready, 
  //   OR
  // they must both be ready
  if ((fight.updatedAt + 5000) > Date.now() && (!fight.attackerReady || !fight.defenderReady)) return;

  // we actually are going to fight now, so clear the timer to prevent any other occurrence of this;
  if ((fight.updatedAt + 5000) > Date.now()) // only clear the timer if it is early. otherwise we'll be cancelling ourselves
    SyncedCron.remove('Fights:'+fightId+':'+fight.round)

  var roundLog = {round: fight.round};
  let attacker = Characters.findOne(fight.attackerId);
  let defender = Characters.findOne(fight.defenderId);

  //TODO replace with real logic
  let first = attacker;
  let last = defender;
  first.stats.hp -= 1;
  last.stats.hp -= 1;
  roundLog.defenderHit = true;
  roundLog.defenderDealt = 1;
  roundLog.attackerHit = true;
  roundLog.attackerDealt = 1;
  roundLog.firstId = first._id;
  // end TODO

  // update all the users records in Mongo
  Characters.update(first._id, {$set: {stats: first.stats}});
  Characters.update(last._id, {$set: {stats: last.stats}});
  Fights.update(fightId, {$inc: {round: 1}, $push: {rounds: roundLog}});

  // and finally, trigger the countDown again
  countDownToRound(fightId);
}
