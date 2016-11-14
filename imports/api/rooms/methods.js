import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';

import { Rooms } from './rooms.js';
import { Characters } from '../characters/characters.js';

import { treeStumpTile, nextSpotXY } from '../../configs/locations.js';

Meteor.methods({
  'rooms.collect'(gameId){
    let character = Characters.findOne({userId: this.userId, gameId: gameId});
    if (!character) throw new Meteor.Error('rooms.collect', "Character not found");

    let room = Rooms.findOne(character.location.roomId);
    if (!room) throw new Meteor.Error('rooms.collect', "room not found");

    const xy = nextSpotXY(character);
    const nextSpace = room.map[xy.y][xy.x];
    if (nextSpace && nextSpace.resources && nextSpace.resources.amount > 0) {
      character.stats.resources[nextSpace.resources.type] += 1;
      room.map[xy.y][xy.x].resources.amount -= 1;
      if (room.map[xy.y][xy.x].resources.amount == 0) {
        room.map[xy.y][xy.x] = _.clone(treeStumpTile);
      }
      Rooms.update(room._id, {$set: {map: room.map}});
      Characters.update(character._id, {$set: {'stats.resources': character.stats.resources, 'stats.energy': character.stats.energy - 10}});
    }
  },
})
