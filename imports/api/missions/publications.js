import { Meteor } from 'meteor/meteor';

import { Characters } from '../characters/characters.js';
import { Missions } from './missions.js';

import { getCharacter } from '../../configs/game.js';

Meteor.publish ("missions.own", function(gameId) {
  if (!this.userId) return this.ready();

  const character = getCharacter(this.userId, gameId, Characters);
  if (!character) return this.ready();
  return Missions.find({ownerId: character._id}, {fields: Missions.publicFields});
});

Meteor.publish ("missions.team", function(gameId) {
  if (!this.userId) return this.ready();
  const character = getCharacter(this.userId, gameId, Characters);
  if (!character) return this.ready();

  return Missions.find({team: character.team}, {fields: Missions.publicFields});
});
