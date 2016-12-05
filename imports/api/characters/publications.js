import { Meteor } from 'meteor/meteor';

import { Fights } from '../fights/fights.js';
import { Trades } from '../trades/trades.js';
import { Characters } from './characters.js';
import { getCharacter } from '../../configs/game.js';

Meteor.publish ("characters.room", function() {
  // only get to see users if you're logged in
  if (this.userId) {
    // only publish the users in the same room. Don't need to know about those other fuckers.
    const roomId = Characters.findOne({userId: this.userId}).location.roomId;
    return Characters.find({$or: [{userId: this.userId}, {"location.roomId": roomId}], 'stats.hp': {$gt: 0}}, {fields: Characters.publicFields});
  } else {
    this.ready();
  }
});

Meteor.publish ("characters.own", function(showDead) {
  if (this.userId) {
    var search = {userId: this.userId};
    if (!showDead)
      search['stats.hp'] = {$gt: 0};
    return Characters.find(search, {fields: Characters.publicFields});
  } else {
    this.ready();
  }
});

// returns the characters involved in the fight that this.userId is involved in.
Meteor.publish ("characters.fight", function() {
  if (!this.userId) return this.ready();

  const character = Characters.findOne({userId: this.userId, 'stats.hp': {$gt: 0} });
  if (!character) return this.ready();
  const fight = Fights.findOne({$or: [{attackerId: character._id},{defenderId: character._id}]});
  if (!fight) return this.ready();
  return Characters.find({_id: {$in: [fight.attackerId, fight.defenderId] } }, {fields: Characters.publicFields});
});

// returns the characters involved in the trade that this.userId is involved in.
Meteor.publish ("characters.trade", function(gameId) {
  if (!this.userId) return this.ready();

  const character = getCharacter(this.userId, gameId, Characters);
  if (!character) return this.ready();

  const trade = Trades.findOne({$or: [{sellerId: character._id},{buyerId: character._id}]});
  if (!trade) return this.ready();

  return Characters.find({_id: {$in: [trade.sellerId, trade.buyerId] } }, {fields: Characters.publicFields});
});
