import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

import { Characters } from '../characters/characters.js';
import { Notifications } from './notifications.js';
import { getCharacter } from '../../configs/game.js'

Meteor.methods({
  'notifications.dismiss'(gameId, id) {
    if (!this.userId) {
      throw new Meteor.Error('accessDenied',
        'Gotta be logged in');
    }
    const character = getCharacter(this.userId, gameId, Characters);

    Notifications.remove({_id: id, characterId: character._id});
  },
});
