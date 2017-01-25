import { Meteor } from 'meteor/meteor';

import { Characters } from '../characters/characters.js';
import { Missions } from './missions.js';

import { getCharacter } from '../../configs/game.js';

// all the missions you have accepted
Meteor.publish ("missions.own", function(gameId) {
  if (!this.userId) return this.ready();

  const character = getCharacter(this.userId, gameId, Characters);
  if (!character) return this.ready();
  return Missions.find({ownerId: character._id, completed: false}, {fields: Missions.publicFields});
});

// all your team's open (un-accepted) missions
Meteor.publish ("missions.team", function(gameId) {
  if (!this.userId) return this.ready();
  const character = getCharacter(this.userId, gameId, Characters);
  if (!character) return this.ready();

  return Missions.find({team: character.team, ownerId: {$exists: false}, completed: false}, {fields: Missions.publicFields});
});
