import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';

import { Characters } from '../characters/characters.js';
import { Rooms } from '../rooms/rooms.js';
import { Buildings } from './buildings.js';

import { getCharacter } from '../../configs/game.js';
import { buildingConfig } from '../../configs/buildings.js';

Meteor.methods({
  'buildings.construct'(gameId, buildingId, params){
    if (!this.userId) throw new Meteor.Error('buildings.construct', 'not logged in');

    const character = getCharacter(this.userId, gameId, Characters);
    if (!character) throw new Meteor.Error('buildings.construct', 'character not found');

    let building = Buildings.findOne(buildingId);
    if (!building) throw new Meteor.Error('buildings.construct', 'building not found');
    if (character._id != building.ownerId) throw new Meteor.Error('buildings.construct', 'character not building owner');
    if (building.underConstruction) throw new Meteor.Error('buildings.construct', 'building already under construction');

    const type = buildingConfig[params[0]];

    if (type.key == buildingConfig.open.key) { // open type is built immediately
      if (building.interiorRoomId)
        Rooms.remove(building.interiorRoomId);
      Characters.update(character._id, {$set: {'stats.energy': character.stats.energy - buildingConfig.open.energyCost}});
    }
    return Buildings.update(buildingId, {$set: {type: type.key, underConstruction: type.key != buildingConfig.open.key, data: {buildingResources: type.cost, stats: {hp: 30, hpBase: 30}}}});
  },
  'buildings.lock'(gameId, buildingId, lock, team) {
    if (!this.userId) throw new Meteor.Error('buildings.construct', 'not logged in');

    const character = getCharacter(this.userId, gameId, Characters);
    if (!character) throw new Meteor.Error('buildings.construct', 'character not found');

    let building = Buildings.findOne(buildingId);
    if (!building) throw new Meteor.Error('buildings.construct', 'building not found');
    if (character._id != building.ownerId) throw new Meteor.Error('buildings.construct', 'character not building owner');
    
    building.data.lock = {type: lock, team: team};
    if (!building.data.stats)
      building.data.stats = {hp: 30, hpBase: 30};
    
    return Buildings.update(building._id, {$set: {data: building.data}});
  },
  'buildings.sell'(gameId, buildingId, params){
    // TODO security
    return Buildings.update(buildingId, {$set: {sale: {available: true, cost: parseInt(params[0])}}});
  },
  'buildings.unsell'(gameId, buildingId) {
    // TODO security
    return Buildings.update(buildingId, {$set: {sale: undefined}});
  },
})
