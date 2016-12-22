import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';

import { Rooms } from './rooms.js';
import { Characters } from '../characters/characters.js';
import { Buildings } from '../buildings/buildings.js';

import { treeStumpTile, nextSpotXY, doorConfig } from '../../configs/locations.js';
import { getCharacter, doorAttackEnergyCost } from '../../configs/game.js';
import { buildingConfig } from '../../configs/buildings.js';

Meteor.methods({
  'rooms.collect'(gameId){
    let character = Characters.findOne({userId: this.userId, gameId: gameId});
    if (!character) throw new Meteor.Error('rooms.collect', "Character not found");

    let room = Rooms.findOne(character.location.roomId);
    if (!room) throw new Meteor.Error('rooms.collect', "room not found");

    const xy = nextSpotXY(character);
    const nextSpace = room.map[xy.y][xy.x];
    const amountToCollect = 1;

    if (!character.canCarry(amountToCollect)) throw new Meteor.Error('rooms.collect', 'You cannot carry any more resources.');

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
    let resourcesNeededObj = _.find(room.map[xy.y][xy.x].buildingResources, function(obj){return obj.resource == type});
    const amountNeeded = resourcesNeededObj.amount - resourcesNeededObj.has;
    const amountCarrying = character.stats.resources[type];
    const amountToDeposit = amountNeeded > amountCarrying ? amountCarrying : amountNeeded;
    let allResourcesArePresent = true;
    room.map[xy.y][xy.x].buildingResources = _.map(room.map[xy.y][xy.x].buildingResources, function(obj){
      if (obj.resource == type)
        obj.has += amountToDeposit;
      if (obj.has < obj.amount)
        allResourcesArePresent = false;
      return obj;
    });

    character.stats.resources[type] -= amountToDeposit;

    if (allResourcesArePresent) {
      if (room.map[xy.y][xy.x].stats) { // we are dealing with a door/repair
        room.map[xy.y][xy.x].stats.hp = room.map[xy.y][xy.x].stats.baseHp;
        room.map[xy.y][xy.x].buildingResources = _.map(room.map[xy.y][xy.x].buildingResources, function(obj){
          obj.has = 0;
          return obj;
        });
      } else if (room.map[xy.y][xy.x].buildingId) { // it was a building Construction
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
          Rooms.insert(buildingType.interior(room.gameId, newRoomName, {name: room.name, x: character.location.x, y: character.location.y}));
          room.map[xy.y][xy.x].data = {name: newRoomName, x: buildingType.entry.x, y: buildingType.entry.y, lock: {type: doorConfig.lockTypes.none}};
        }
        // update the building
        Buildings.update(building._id, {$set: {underConstruction: false}});
      }
    }

    Rooms.update(room._id, {$set: {map: room.map}});
    return Characters.update(character._id, {$set: {'stats.resources': character.stats.resources}});
  },
  'rooms.buy'(gameId){
    const character = getCharacter(this.userId, gameId, Characters);
    if (!character) throw new Meteor.Error('rooms', "Character not found");
    
    let room = Rooms.findOne(character.location.roomId);
    if (!room) throw new Meteor.Error('rooms', "room not found");

    const xy = nextSpotXY(character);

    const cost = room.map[xy.y][xy.x].use.cost;
    if (cost > character.stats.money) throw new Meteor.Error('rooms.buy', "You do not have enough money")

    const building = Buildings.findOne({
      roomId: room._id,
      'topLeft.x':room.map[xy.y][xy.x].dimensions.topLeft.x,
      'topLeft.y':room.map[xy.y][xy.x].dimensions.topLeft.y,
    })
    if (building) {
      Characters.update(building.ownerId, {$inc: {'stats.money': cost}}); // old owner gets $$$
      // then building gets new owner
      room.map[xy.y][xy.x].buildingId = building._id;
      Buildings.update(building._id, {$set: {ownerId: character._id}});
    } else {
      const bId = Buildings.insert({
        ownerId: character._id,
        roomId: room._id,
        topLeft: room.map[xy.y][xy.x].dimensions.topLeft,
        bottomRight: room.map[xy.y][xy.x].dimensions.bottomRight,
        door: {x: xy.x, y: xy.y},
        type: buildingConfig.open.key,
        underConstruction: false,
        resources: {
          wood: 0,
          hide: 0,
          leather: 0,
          ore: 0,
          metal: 0,
        },
        level: 0,
        settings: {
          door: {
            lock: {
              type: doorConfig.lockTypes.none
            }
          },
        }
      });
      room.map[xy.y][xy.x].buildingId = bId;
    }

    room.map[xy.y][xy.x].use = {message: "Owned by "+character.name+" ("+character.team+")"};
    room.map[xy.y][xy.x].ownerId = character._id;

    Rooms.update(room._id, {$set: {map: room.map}});
    return Characters.update(character._id, {$set: {'stats.money': character.stats.money - cost}});
  }
})
