import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

import { Games } from '../games/games.js';
import { Rooms } from '../rooms/rooms.js';
import { Fights } from '../fights/fights.js';
import { Trades } from '../trades/trades.js';
import { Items } from '../items/items.js';
import { Characters } from './characters.js';

import { doorIsLocked, moveCost, moveCosts, nextSpotXY } from '../../configs/locations.js';
import { getCharacter } from '../../configs/game.js';
import { teamConfigs } from '../../configs/ranks.js';

Meteor.methods({
  'characters.insert'(obj) {
    if (!this.userId) {
      throw new Meteor.Error('todos.insert.accessDenied',
        'Gotta be logged in to create a character');
    }

    const character = Characters.findOne({userId: this.userId, 'stats.hp': {$gt: 0}});

    if (character) {
      throw new Meteor.Error('todos.insert.alreadyThere',
        'You already have a character, bro');
    }

    const room = Rooms.findOne({name: 'tokyo'});
    const location = {
      x: 3,
      y: 5,
      direction: 1,
      classId: teamConfigs[obj.team].startingCharacterCode,
      roomId: room._id,
      updatedAt: Date.now(),
    };

    obj.gameId = obj.gameId || Games.findOne({})._id;
    obj.userId = this.userId;
    obj.location = location;

    const id = Characters.insert(obj);

    Items.insert({key: 'rustySword', type: 'weapon', ownerId: id, condition: 100});
    Items.insert({key: 'chickenLeg', type: 'consumable', ownerId: id});

    return obj.gameId; //return the gameId so the ui knows what url to go to
  },

  'characters.move'(directionInt) {
    var character = Characters.findOne({userId: this.userId, 'stats.hp':{$gt: 0}});
    moveCharacter(character, directionInt);
  },

  'characters.sawDeathNotification'(characterId) {
    console.log('setting recentlyDead to false due to method call');
    if (this.userId != Characters.findOne(characterId).userId) throw new Meteor.Error('characters.sawDeathNotification', 'not your character dude');
    Characters.update(characterId, {$set: {'deaths.recentlyDead': false}});
  },

  'characters.revive'(id) {
    if (this.userId != Characters.findOne(id).userId) throw new Meteor.Error('characters.revive', 'not your character dude');
    if (Characters.find({'stats.hp': {$gt: 0}, userId: this.userId}).count() > 0) throw new Meteor.Error('characters.revive', 'dumbass, you already have a character alive');
    return Characters.update(id, {$set: {'stats.energy': 20, 'stats.hp': 1}});
  },

  'characters.dropResource'(gameId, resource, amount) {
    let character = getCharacter(this.userId, gameId, Characters);
    if(!character.stats.resources[resource]) throw new Meteor.Error('invalid resource');

    character.stats.resources[resource] -= amount;
    if(character.stats.resources[resource] < 0) character.stats.resources[resource] = 0;

    return Characters.update(character._id, {$set: {'stats.resources': character.stats.resources}});
  },

  'characters.trade'(characterId, npcId, giving, getting){ // giving = {type: 'money', amount: 100} getting = {type: 'resource', resource: 'metal', amount: 5}
    // could also be: {type: 'item', itemId: 'alkdsjfh'}
    const character = Characters.findOne(characterId);
    if (giving.type == 'money' && giving.amount > character.stats.money) return false;
    if (giving.type == 'resource' && giving.amount > character.stats.resources[giving.resource]) return false;

    const npc = Characters.findOne(npcId);
    if (getting.type == 'resource' && getting.amount > npc.stats.resources[getting.resource]) return false;
    if (getting.type == 'money' && getting.amount > npc.stats.money) return false;

    if (giving.type == 'money') {
      Characters.update(characterId, {$inc: {'stats.money': (-1 * Math.abs(giving.amount)) }}) //ensure money decrements
      Characters.update(npcId, {$inc: {'stats.money': (Math.abs(giving.amount)) }}) //ensure money decrements
      if (getting.type == 'resource'){
        let incObj = {};
        incObj['stats.resources.'+getting.resource] = Math.abs(getting.amount);
        Characters.update(characterId, {$inc: incObj });
        incObj['stats.resources.'+getting.resource] = -1 * Math.abs(getting.amount);
        Characters.update(npcId, {$inc: incObj });
      } else if (getting.type == 'item') {
        Items.update(getting.itemId, {$set: {ownerId: characterId}});
      }
    } else if (getting.type == 'money') {
      Characters.update(npcId, {$inc: {'stats.money': -1 * Math.abs(getting.amount) }});
      Characters.update(characterId, {$inc: {'stats.money': Math.abs(getting.amount) }});
      if (giving.type == 'resource'){
        let incObj = {};
        incObj['stats.resources.'+giving.resource] = -1 * Math.abs(giving.amount);
        Characters.update(characterId, {$inc: incObj });
        incObj['stats.resources.'+giving.resource] = Math.abs(giving.amount);
        Characters.update(npcId, {$inc: incObj });
      } else if (giving.type == 'item') {
        Items.update(giving.itemId, {$set: {ownerId: npcId}});
      }
    }
  }
});

export function moveCharacter(character, directionInt) {
  const room = Rooms.findOne(character.location.roomId);
  var nextSpot, moveObject = {};
  directionInt = parseInt(directionInt);

  if( Date.now() <= character.location.updatedAt + 300)
    return false;
  if (Fights.find({$or: [{attackerId: character._id},{defenderId: character._id}]}).count() > 0)
    return false;

  const weight = character.carriedWeight();
  const terrain = room.map[character.location.y][character.location.x].type;
  const newEnergy = character.stats.energy - moveCost(character, weight, terrain);
  const newEndurance = character.stats.endurance + (0.01 * weight / character.maxWeight());

  if (newEnergy < 0) // can't move without energy
    return false;

  const xy = nextSpotXY(character);
  nextSpot = room.map[xy.y] && room.map[xy.y][xy.x] ? room.map[xy.y][xy.x] : "out of bounds";
  moveObject = xy.moveObject;

  if (nextSpot != "out of bounds" && moveCosts[nextSpot.type] && character.location.direction == directionInt) { // can traverse the next spot and are facing the right way
    Trades.remove({$or: [{sellerId: character._id}, {buyerId: character._id}]}) // if the dude leaves, the trade is cancelled

    if (nextSpot.data && nextSpot.data.x > -1 && nextSpot.data.y > -1) { // next spot is a door
      if (!doorIsLocked(nextSpot, character)) {
        const roomId = Rooms.findOne({gameId: room.gameId, name: nextSpot.data.name})._id;

        Characters.update(character._id, {
          $set: {
            'location.direction': directionInt, 
            'location.updatedAt': Date.now(),
            'location.roomId': roomId,
            'location.x': nextSpot.data.x,
            'location.y': nextSpot.data.y,
            'stats.energy': newEnergy,
          } 
        });
      }
    } else { // just move there normally
      Characters.update(character._id, {
        $inc: moveObject, 
        $set: {'location.direction': directionInt, 'location.updatedAt': Date.now(), 'stats.energy': newEnergy, 'stats.endurance': newEndurance}
      });
    }
  } else {
    Characters.update(character._id, {
      $set: {'location.direction': directionInt, 'location.updatedAt': Date.now()} 
    });
  }
}
