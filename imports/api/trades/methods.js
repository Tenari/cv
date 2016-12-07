import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

import { Characters } from '../characters/characters.js';
import { Chats } from '../chats/chats.js';
import { Items } from '../items/items.js';
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

    const tradeId = Trades.insert({
      sellerId: seller._id,
      buyerId: buyer._id,
      sellerOffer: [],
      buyerOffer: [],
    });
    Chats.insert({scope: "trade:"+tradeId, messages: []});
    return tradeId;
  },
  'trades.updateOffer'(tradeId, characterId, offer){
    const character = Characters.findOne(characterId);
    if (!character) throw new Meteor.Error('trades.insert.badId','this character doesnt exist, dude');

    if (offer.type == 'money' && offer.amount > character.stats.money)
      offer.amount = character.stats.money;
    if (offer.type == 'resource' && offer.amount > character.stats.resources[offer.resource])
      offer.amount = character.stats.resources[offer.resource];

    let trade = Trades.findOne(tradeId);
    const label = trade.sellerId == character._id ? 'sellerOffer' : 'buyerOffer';
    let updated = false;
    let newFullOffer = _.map(trade[label], function(offerObj){
      if (offerObj.type == offer.type) {
        if (offer.type == 'resource' && offer.resource == offerObj.resource ||
            offer.type == 'money') {

          updated = true;
          return offer;
        }
      }
      return offerObj;
    })
    if (!updated) newFullOffer.push(offer);
    let updateObj = {buyerAccepts: false, sellerAccepts: false};
    updateObj[label] = newFullOffer;

    return Trades.update(tradeId, {$set: updateObj});
  },
  'trades.removeOffer'(tradeId, characterId, index){
    const character = Characters.findOne(characterId);
    if (!character) throw new Meteor.Error('trades.insert.badId','this character doesnt exist, dude');

    let trade = Trades.findOne(tradeId);
    const label = trade.sellerId == character._id ? 'sellerOffer' : 'buyerOffer';

    let updateObj = {buyerAccepts: false, sellerAccepts: false};
    trade[label].splice(index, 1);
    updateObj[label] = trade[label];

    return Trades.update(tradeId, {$set: updateObj});
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
