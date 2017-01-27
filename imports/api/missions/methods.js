import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

import { Missions } from './missions.js';
import { Characters } from '../characters/characters.js';
import { getCharacter } from '../../configs/game.js'
import { ranksConfig } from '../../configs/ranks.js';

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

      let setObj = {};
      let incObj = {'stats.rankPoints': mission.rankPoints};
      incObj['stats.resources.'+mission.conditions.resource] = -1 * mission.conditions.amount;
      incObj['counts.missionsCompleted'] = 1;
      if (character.canBePromoted(mission.rankPoints)) {
        setObj['stats.rank'] = character.canBePromoted(mission.rankPoints);
      }
      Characters.update(character._id, {$inc: incObj, $set: setObj});
    }
  },
  'missions.create'(gameId, data){
    if (!this.userId) throw new Meteor.Error('accessDenied', 'Gotta be logged in');

    const character = getCharacter(this.userId, gameId, Characters);
    if (!character) throw new Meteor.Error('missions.create', 'you dont have a character in this game');
    if (character.stats.rank == ranksConfig.peasant.key) throw new Meteor.Error('missions.create', 'not high enough rank');

    let missions = {
      gameId: gameId,
      type: data.type,
      rankPoints: ranksConfig[character.stats.rank].missionPoints,
      team: character.team,
      creatorId: character._id,
      conditions: data.conditions
    };

    return Missions.insert(mission);
  }
});
