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
    if (!obstacle) throw new Meteor.Error('rooms', "Obstacle not found");
    let resourcesNeededObj = _.find(obstacle.data.buildingResources, function(obj){return obj.resource == type});
    const amountNeeded = resourcesNeededObj.amount - resourcesNeededObj.has;
    const amountCarrying = character.stats.resources[type];
    const amountToDeposit = amountNeeded > amountCarrying ? amountCarrying : amountNeeded;
    let allResourcesArePresent = true;
    obstacle.data.buildingResources = _.map(obstacle.data.buildingResources, function(obj){
      if (obj.resource == type)
        obj.has += amountToDeposit;
      if (obj.has < obj.amount)
        allResourcesArePresent = false;
      return obj;
    });

    character.stats.resources[type] -= amountToDeposit;

    if (allResourcesArePresent) {
      if (obstacle.data.stats) { // we are dealing with a door/repair
        obstacle.data.stats.hp = obstacle.data.stats.hpBase;
        obstacle.data.buildingResources = _.map(obstacle.data.buildingResources, function(obj){
          obj.has = 0;
          return obj;
        });
      }/* else if (obstacle.data.buildingId) { // it was a building Construction
        const building = Buildings.findOne(room.map[xy.y][xy.x].buildingId);
        // update the map to look like the building
        const dimensions = room.map[xy.y][xy.x].dimensions;
        const buildingType = building.typeObj();
        for(let i = dimensions.topLeft.x; i <= dimensions.bottomRight.x; i+=1) {
          for (let j = dimensions.topLeft.y; j <= dimensions.bottomRight.y; j +=1){
            room.map[j][i].type = buildingType.getTileTypes(dimensions, i, j);
          }
        }
        if (typeof buildingType.interior === 'function') {
          room.map[xy.y][xy.x].stats = doorConfig.stats;
          room.map[xy.y][xy.x].buildingResources = doorConfig.buildingResources;
          // make the inside of the building accessible
          const newRoomName = building.type+":"+building._id;
          const newRoomId = Rooms.insert(buildingType.interior(room.gameId, newRoomName, {name: room.name, x: character.location.x, y: character.location.y}));
          room.map[xy.y][xy.x].data = {name: newRoomName, x: buildingType.entry.x, y: buildingType.entry.y, lock: {type: doorConfig.lockTypes.team, team: character.team}};
          // create the chat
          Chats.insert({scope: "Rooms:"+newRoomId, messages: []});
        }
        // update the building
        Buildings.update(building._id, {$set: {underConstruction: false}});
      }*/
    }

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
