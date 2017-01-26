import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

import { Characters } from '../characters/characters.js';
import { Games } from './games.js';

import { ranksConfig } from '../../configs/ranks.js';
import { getCharacter } from '../../configs/game.js';

Meteor.methods({
  'games.changeKingMessage'(gameId, message) {
    if (!this.userId) {
      throw new Meteor.Error('accessDenied','Gotta be logged in');
    }

    const king = getCharacter(this.userId, gameId, Characters);
    if (king.stats.rank != ranksConfig.king.key) throw new Meteor.Error('notKing', 'go away');

    let setObj = {};
    setObj[king.team+'.kingMessage'] = message;

    return Games.update(gameId, {$set: setObj});
  },
});
