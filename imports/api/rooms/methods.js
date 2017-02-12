import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';

import { Rooms } from './rooms.js';
import { Characters } from '../characters/characters.js';
import { Buildings } from '../buildings/buildings.js';
import { Obstacles } from '../obstacles/obstacles.js';
import { Chats } from '../chats/chats.js';

import { treeStumpTile, nextSpotXY, doorConfig } from '../../configs/locations.js';
import { getCharacter, doorAttackEnergyCost, resourceConfig, collectingSkillGrowthAmount } from '../../configs/game.js';
import { buildingConfig } from '../../configs/buildings.js';
import { importRoomObstacles } from '../../configs/obstacles.js';

Meteor.methods({
  'rooms.collect'(gameId){
    let character = Characters.findOne({userId: this.userId, gameId: gameId});
    if (!character) throw new Meteor.Error('rooms.collect', "Character not found");

    let room = Rooms.findOne(character.location.roomId);
    if (!room) throw new Meteor.Error('rooms.collect', "room not found");

    const amountToCollect = 1;
    if (!character.canCarry(amountToCollect)) throw new Meteor.Error('rooms.collect', 'You cannot carry any more resources.');

    const obstacle = character.getFacingObstacle(Obstacles);

    if (obstacle && obstacle.data.resources && obstacle.data.resources.amount > 0) {
      character.stats.resources[obstacle.data.resources.type] += amountToCollect;
      obstacle.data.resources.amount -= amountToCollect;
      if (obstacle.data.resources.amount == 0) {
        // remove the obstacle and turn it into it's empty version (tree into treeStump
        obstacle.insertEmptyVersion();
        Obstacles.remove(obstacle._id);
      } else {
        // update the obstacle
        Obstacles.update(obstacle._id, {$set: {'data.resources.amount': obstacle.data.resources.amount}})
      }
      // update the character
      const newEnergy = character.stats.energy - Math.max(resourceConfig[obstacle.data.resources.type].baseCostToCollect - parseInt(character.stats.collecting[obstacle.data.resources.type]), 1);
      character.stats.collecting[obstacle.data.resources.type] += collectingSkillGrowthAmount(character.stats.collecting[obstacle.data.resources.type+'Base']);
      character.stats.collecting[obstacle.data.resources.type+'Base'] += collectingSkillGrowthAmount(character.stats.collecting[obstacle.data.resources.type+'Base']);
      Characters.update(character._id, {$set: {'stats.resources': character.stats.resources, 'stats.energy': newEnergy, 'stats.collecting': character.stats.collecting}});
    }
  },
  'rooms.attackDoor'(characterId) {
    const character = Characters.findOne(characterId);
    if (!character) throw new Meteor.Error('rooms', "Character not found");

    if (character.stats.energy < doorAttackEnergyCost) return "out of energy";

    let room = Rooms.findOne(character.location.roomId);
    if (!room) throw new Meteor.Error('rooms', "room not found");

    const obstacle = character.getFacingObstacle(Obstacles);
    if (!obstacle) throw new Meteor.Error('rooms', "door not found");

    Obstacles.update(obstacle._id, {$inc: {'data.stats.hp': -1}});

    return Characters.update(character._id, {$set: {'stats.energy': character.stats.energy - doorAttackEnergyCost}});
  },
  'rooms.build'(characterId, type){
    let character = Characters.findOne(characterId);
    if (!character) throw new Meteor.Error('rooms', "Character not found");

    let obstacle = character.getFacingObstacle(Obstacles);
    let building = character.getFacingBuilding(Buildings);
    if (!obstacle && !building) throw new Meteor.Error('rooms', "Obstacle or Building not found");

    let thing = obstacle || building;
    let resourcesNeededObj = _.find(thing.data.buildingResources, function(obj){return obj.resource == type});
    const amountNeeded = resourcesNeededObj.amount - resourcesNeededObj.has;
    const amountCarrying = character.stats.resources[type];
    const amountToDeposit = amountNeeded > amountCarrying ? amountCarrying : amountNeeded;
    let allResourcesArePresent = true;
    thing.data.buildingResources = _.map(thing.data.buildingResources, function(obj){
      if (obj.resource == type)
        obj.has += amountToDeposit;
      if (obj.has < obj.amount)
        allResourcesArePresent = false;
      return obj;
    });

    character.stats.resources[type] -= amountToDeposit;

    if (allResourcesArePresent) {
      if (obstacle && thing.data.stats) { // we are dealing with a door/repair
        thing.data.stats.hp = thing.data.stats.hpBase;
        thing.data.buildingResources = _.map(thing.data.buildingResources, function(obj){
          obj.has = 0;
          return obj;
        });
      } else if (thing.underConstruction) { // it was a building Construction
        const buildingType = thing.typeObj();
        if (typeof buildingType.interior === 'function') {
          const newRoomName = building.type+":"+building._id;
          const interior = buildingType.interior(character.gameId, newRoomName, building)
          const newRoomId = Rooms.insert(interior.room);
          importRoomObstacles(interior, newRoomId, character.gameId, Obstacles, Rooms);
          // create the chat
          Chats.insert({scope: "Rooms:"+newRoomId, messages: []});
          // update the building
          Buildings.update(building._id, {$set: {underConstruction: false, data: {id: newRoomId, x: buildingType.insideLocation.x, y: buildingType.insideLocation.y}}});
        }
      }
    } else {
      if (building)
        Buildings.update(building._id, {$set: {data: building.data}});
    }

    if (obstacle)
      Obstacles.update(obstacle._id, {$set: {data: obstacle.data}});

    return Characters.update(character._id, {$set: {'stats.resources': character.stats.resources}});
  },
  'rooms.buy'(gameId){
    const character = getCharacter(this.userId, gameId, Characters);
    if (!character) throw new Meteor.Error('rooms', "Character not found");

    const building = character.getFacingBuilding(Buildings);
    if (!building || !building.sale.available || building.sale.cost > character.stats.money) throw new Meteor.Error('rooms.buy', "You do not have enough money")

    if (building.ownerId)
      Characters.update(building.ownerId, {$inc: {'stats.money': building.sale.cost}}); // old owner gets $$$

    // then building gets new owner
    Buildings.update(building._id, {$set: {ownerId: character._id, 'sale.available':false}});

    return Characters.update(character._id, {$set: {'stats.money': character.stats.money - building.sale.cost}});
  }
})
