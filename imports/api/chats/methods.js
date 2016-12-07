import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

import { Characters } from '../characters/characters.js';
import { Chats } from './chats.js';

import { getCharacter } from '../../configs/game.js';

Meteor.methods({
  'chats.newMessage'(gameId, chatId, message) {
    if (!this.userId) {
      throw new Meteor.Error('trades.insert.accessDenied',
        'Gotta be logged in');
    }

    if (message.length == 0) return;

    const sender = getCharacter(this.userId, gameId, Characters);

    return Chats.update(chatId, {$push: {messages: {content: message, sender: sender.name}}});
  },
});
