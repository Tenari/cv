import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

import { Characters } from '../characters/characters.js';
import { Trades } from './trades.js';
import { getCharacter } from '../../configs/game.js';

Meteor.methods({
  'trades.start'(gameId, buyerId) {
    console.log(gameId, buyerId);
    if (!this.userId) {
      throw new Meteor.Error('trades.insert.accessDenied',
        'Gotta be logged in to propose a trade');
    }
    const buyer = Characters.findOne(buyerId);
    if (!buyer) throw new Meteor.Error('trades.insert.badId','this buyer doesnt exist, dude');

    const seller = getCharacter(this.userId, gameId, Characters);
    if (buyer.location.roomId != seller.location.roomId || buyer.location.x != seller.location.x || buyer.location.y != seller.location.y) throw new Meteor.Error('trades.insert.invalidOpponent', 'this opponent must have moved or something');

    return Trades.insert({
      sellerId: seller._id,
      buyerId: buyer._id,
      sellerOffer: [],
      buyerOffer: [],
    });
  },
  'trades.end'(gameId, id) {
    if (!this.userId) throw new Meteor.Error('access', 'log in');

    const character = getCharacter(this.userId, gameId, Characters);
    if (!character) throw new Meteor.Error('err', 'no character found');

    const trade = Trades.findOne(id);
    if(!trade || (trade.sellerId != character._id && trade.buyerId != character._id)) throw new Meteor.Error('invalid', 'youre not in that trade');

    return Trades.remove(id);
  },
});
