import { Meteor } from 'meteor/meteor';

import { Characters } from '../characters/characters.js';
import { Notifications } from './notifications.js';

import { getCharacter } from '../../configs/game.js';

Meteor.publish ("notifications.own", function(gameId) {
  if (!this.userId || !gameId) return this.ready();

  const character = getCharacter(this.userId, gameId, Characters);
  if (!character) return this.ready();

  return Notifications.find({characterId: character._id}, {fields: Notifications.publicFields});
});
