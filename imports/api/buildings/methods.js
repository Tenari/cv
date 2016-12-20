import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';

import { Characters } from '../characters/characters.js';
import { Rooms } from '../rooms/rooms.js';
import { Buildings } from './buildings.js';

import { getCharacter } from '../../configs/game.js';
import { buildingConfig } from '../../configs/buildings.js';

Meteor.methods({
  'buildings.construct'(gameId, buildingId, params){
    console.log(gameId, buildingId, params, params[0]);
    if (!this.userId) throw new Meteor.Error('buildings.construct', 'not logged in');

    const character = getCharacter(this.userId, gameId, Characters);
    if (!character) throw new Meteor.Error('buildings.construct', 'character not found');

    let building = Buildings.findOne(buildingId);
    if (!building) throw new Meteor.Error('buildings.construct', 'building not found');
    if (character._id != building.ownerId) throw new Meteor.Error('buildings.construct', 'character not building owner');
    if (building.underConstruction) throw new Meteor.Error('buildings.construct', 'building already under construction');

    const type = buildingConfig[params[0]];

    let room = Rooms.findOne(building.roomId);
    room.map[building.door.y][building.door.x].buildingResources = _.map(type.cost, function(obj){
      obj.has = 0;
      return obj;
    });
    Rooms.update(room._id, {$set: {map: room.map}});
    return Buildings.update(buildingId, {$set: {type: type.key, underConstruction: true}});
  },
})
