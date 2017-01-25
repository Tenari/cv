import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

import { Missions } from './missions.js';
import { Characters } from '../characters/characters.js';
import { getCharacter } from '../../configs/game.js'

Meteor.methods({
  'missions.accept'(gameId, id) {
    if (!this.userId) {
      throw new Meteor.Error('missions.accept.accessDenied',
        'Gotta be logged in');
    }
    const character = getCharacter(this.userId, gameId, Characters);
    if (!character) throw new Meteor.Error('missions.accept', 'you dont have a character in this game');

    Missions.update(id, {$set: {ownerId: character._id}});
    Characters.update(character._id, {$inc: {'stats.energy': -100}});
  },
  'missions.finish'(gameId, id) {
    if (!this.userId) {
      throw new Meteor.Error('missions.finish.accessDenied',
        'Gotta be logged in');
    }
    const character = getCharacter(this.userId, gameId, Characters);
    if (!character) throw new Meteor.Error('missions.finish', 'you dont have a character in this game');

    const mission = Missions.findOne(id);
    if (mission.passesConditionsToFinish(character)) {
      Missions.update(id, {$set: {completed: true}});
      let incObj = {'stats.rankPoints': mission.rankPoints};
      incObj['stats.resources.'+mission.conditions.resource] = -1 * mission.conditions.amount;
      Characters.update(character._id, {$inc: incObj});
    }
  },
});