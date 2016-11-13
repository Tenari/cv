import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';

import { Rooms } from './rooms.js';
import { Characters } from '../characters/characters.js';

Meteor.methods({
  'rooms.collect'(gameId){
    let character = Characters.findOne({userId: this.userId, gameId: gameId});
    let room = Rooms.findOne(character.location.roomId);
    let x = character.location.x;
    let y = character.location.y-1;
    switch(character.location.direction) {
      case 2:
        y = character.location.y+1;
        break;
      case 3:
        y = character.location.y;
        x = character.location.x+1;
        break;
      case 4:
        y = character.location.y;
        x = character.location.x-1;
        break;
    }
    const nextSpace = room.map[y][x];
    if (nextSpace.resources && nextSpace.resources.amount > 0) {
      character.stats.resources[nextSpace.resources.type] += 1;
      room.map[y][x].resources.amount -= 1;
    }
    Rooms.update(room._id, {$set: {map: room.map}});
    Characters.update(character._id, {$set: {'stats.resources': character.stats.resources, 'stats.energy': character.stats.energy - 10}});
  },
})
