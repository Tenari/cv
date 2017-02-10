import { Meteor } from 'meteor/meteor';

import { Buildings } from './buildings.js';
import { Characters } from '../characters/characters.js';

import { getCharacter } from  '../../configs/game.js'

Meteor.publish ("buildings.own", function(gameId) {
  if (!this.userId) {
    return this.ready();
  }

  return Buildings.find({ownerId: getCharacter(this.userId, gameId, Characters)._id});
});

Meteor.publish ("room.buildings", function(roomId) {
  if (!this.userId) return this.ready();

  return Buildings.find({'location.roomId': roomId});
});
