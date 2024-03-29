import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { EJSON } from 'meteor/ejson';

import { Games } from '../../api/games/games.js';
import { Rooms } from '../../api/rooms/rooms.js';
import { Items } from '../../api/items/items.js';
import { Characters } from '../../api/characters/characters.js';
import { Fights } from '../../api/fights/fights.js';
import { Buildings } from '../../api/buildings/buildings.js';
import { Obstacles } from '../../api/obstacles/obstacles.js';

import { monsterConfig, aiTeam } from '../../configs/ai.js';
import { countDownToRound } from '../../configs/fights.js';

export function aiActLoop(){
  Characters.find({team: aiTeam, 'stats.hp': {$gt: 0}}).forEach(attack);
  Characters.find({team: aiTeam, 'stats.hp': {$gt: 0}}).forEach(function(monster){
    monsterConfig[monster.monsterKey].move(monster, Rooms.findOne(monster.location.roomId), Characters, Obstacles, Buildings);
  });
}

function attack(ai){
  if (Fights.find({$or:[{attackerId: ai._id},{defenderId: ai._id}]}).count() > 0) return;
  const defender = Characters.findOne({gameId: ai.gameId, 'location.roomId': ai.location.roomId, 'location.x': ai.location.x, 'location.y': ai.location.y, team: {$not: {$eq: aiTeam}}})
  if (!defender || Date.now() < (defender.lastFightEndedAt + 10000)) return; // ai will wait 10s from your last fight before attacking you again

  const fightId = Fights.insert({
    attackerId: ai._id,
    defenderId: defender._id,
    createdAt: Date.now(),
    round: 0,
    rounds: [],
    attackerStyle: ai.defaultAttackStyle,
    defenderStyle: defender.defaultAttackStyle,
  });
  countDownToRound(fightId)
}
