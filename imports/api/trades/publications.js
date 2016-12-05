import { Meteor } from 'meteor/meteor';

import { Characters } from '../characters/characters.js';
import { Trades } from './trades.js';

import { getCharacter } from '../../configs/game.js';

Meteor.publish ("trades.own", function(gameId) {
  if (!this.userId) {return this.ready();}

  const character = getCharacter(this.userId, gameId, Characters);
  if (!character) return this.ready();
  return Trades.find({$or: [{sellerId: character._id}, {buyerId: character._id}]}, {fields: Trades.publicFields});
});

