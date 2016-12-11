import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';

import { Rooms } from './rooms.js';
import { Characters } from '../characters/characters.js';
import { Items } from '../items/items.js';

import { treeStumpTile, nextSpotXY } from '../../configs/locations.js';
import { doorAttackEnergyCost, canCarry } from '../../configs/game.js';

Meteor.methods({
  'rooms.collect'(gameId){
    let character = Characters.findOne({userId: this.userId, gameId: gameId});
    if (!character) throw new Meteor.Error('rooms.collect', "Character not found");

    let room = Rooms.findOne(character.location.roomId);
    if (!room) throw new Meteor.Error('rooms.collect', "room not found");

    const xy = nextSpotXY(character);
    const nextSpace = room.map[xy.y][xy.x];
    const amountToCollect = 1;

    if (!canCarry(character, amountToCollect, Items)) throw new Meteor.Error('rooms.collect', 'You cannot carry any more resources.');

    if (nextSpace && nextSpace.resources && nextSpace.resources.amount > 0) {
      character.stats.resources[nextSpace.resources.type] += amountToCollect;
      room.map[xy.y][xy.x].resources.amount -= amountToCollect;
      if (room.map[xy.y][xy.x].resources.amount == 0) {
        room.map[xy.y][xy.x] = _.clone(treeStumpTile);
      }
      Rooms.update(room._id, {$set: {map: room.map}});
      Characters.update(character._id, {$set: {'stats.resources': character.stats.resources, 'stats.energy': character.stats.energy - 10}});
    }
  },
  'rooms.attackDoor'(characterId) {
    const character = Characters.findOne(characterId);
    if (!character) throw new Meteor.Error('rooms', "Character not found");

    if (character.stats.energy < doorAttackEnergyCost) return "out of energy";

    let room = Rooms.findOne(character.location.roomId);
    if (!room) throw new Meteor.Error('rooms', "room not found");

    const xy = nextSpotXY(character);
    room.map[xy.y][xy.x].stats.hp -= 1;
    Rooms.update(room._id, {$set: {map: room.map}});
    return Characters.update(character._id, {$set: {'stats.energy': character.stats.energy - doorAttackEnergyCost}});
  },
  'rooms.build'(characterId, type){
    let character = Characters.findOne(characterId);
    if (!character) throw new Meteor.Error('rooms', "Character not found");

    let room = Rooms.findOne(character.location.roomId);
    if (!room) throw new Meteor.Error('rooms', "room not found");

    const xy = nextSpotXY(character);
    let resourcesNeededObj = _.find(room.map[xy.y][xy.x].buildingResources, function(obj){return obj.type == type});
    const amountNeeded = resourcesNeededObj.required - resourcesNeededObj.has;
    const amountCarrying = character.stats.resources[type];
    const amountToDeposit = amountNeeded > amountCarrying ? amountCarrying : amountNeeded;
    let allResourcesArePresent = true;
    room.map[xy.y][xy.x].buildingResources = _.map(room.map[xy.y][xy.x].buildingResources, function(obj){
      if (obj.type == type)
        obj.has += amountToDeposit;
      if (obj.has < obj.required)
        allResourcesArePresent = false;
      return obj;
    });

    character.stats.resources[type] -= amountToDeposit;

    if (allResourcesArePresent) {
      if (room.map[xy.y][xy.x].stats) { // we are dealing with a door/repair
        room.map[xy.y][xy.x].stats.hp = room.map[xy.y][xy.x].stats.baseHp;
      }
      room.map[xy.y][xy.x].buildingResources = _.map(room.map[xy.y][xy.x].buildingResources, function(obj){
        obj.has = 0;
        return obj;
      });
    }

    Rooms.update(room._id, {$set: {map: room.map}});
    return Characters.update(character._id, {$set: {'stats.resources': character.stats.resources}});
  }
})
