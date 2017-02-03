import { Meteor } from 'meteor/meteor';

import { Rooms } from './rooms.js';
import { Characters } from '../characters/characters.js';
import { Obstacles } from '../obstacles/obstacles.js';

import { getCharacter } from '../../configs/game.js';

Meteor.publish ("game.rooms", function(gameId) {
  if (!this.userId) return this.ready();

  const character = getCharacter(this.userId, gameId, Characters);
  if (!character) throw new Meteor.Error('missingCharacter', 'no valid character found');

  return [
    Rooms.find({}),
    Obstacles.find({'location.roomId': character.location.roomId})
  ];
});

