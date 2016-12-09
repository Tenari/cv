import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';

import { Games } from '../../api/games/games.js';
import { Rooms } from '../../api/rooms/rooms.js';
import { Items } from '../../api/items/items.js';
import { Characters } from '../../api/characters/characters.js';
import { Fights } from '../../api/fights/fights.js';
import { moveCharacter } from '../../api/characters/methods.js';

import { aiTeam, aiNames, maxAiOfType } from '../../configs/ai.js';

export function aiActLoop(){
  Characters.find({team: aiTeam}).forEach(attack);
  Characters.find({team: aiTeam, name: aiNames.bear}).forEach(moveBear);
}

export function aiSpawnLoop(){
  Games.find().forEach(function(game){
    const totalBears = Characters.find({team: aiTeam, name: aiNames.bear}).count();
    const bearsToSpawn = maxAiOfType.bear - totalBears;
    for (let i = 0; i < bearsToSpawn; i++){
      const room = Rooms.findOne({gameId: game._id, name: 'rome'})
      spawnBear(room);
    }
  });
}

function spawnBear(room){
  const location = {
    x: 4, // TODO: more complicated location algorithm
    y: 4,
    direction: 1,
    classId: 100,
    roomId: room._id,
    updatedAt: Date.now(),
  };
  Characters.insert({
    name: aiNames.bear,
    team: aiTeam,
    gameId: room.gameId,
    location: location,
  })
}

function moveBear(bear){
  // this function can get more complicated if we want bears to move in a non-random drift pattern
  moveCharacter(bear, _.random(1,4));
}

function attack(ai){
  if (Fights.find({$or:[{attackerId: ai._id},{defenderId: ai._id}]}).count() > 0) return;
  const defender = Characters.findOne({gameId: ai.gameId, 'location.roomId': ai.location.roomId, 'location.x': ai.location.x, 'location.y': ai.location.y, team: {$not: {$eq: aiTeam}}})
  if (!defender || Date.now() < (defender.lastFightEndedAt + 10000)) return; // ai will wait 10s from your last fight before attacking you again

  Fights.insert({
    attackerId: ai._id,
    defenderId: defender._id,
    createdAt: Date.now(),
    rounds: [],
    attackerStyle: ai.defaultAttackStyle,
    defenderStyle: defender.defaultAttackStyle,
  });
}
