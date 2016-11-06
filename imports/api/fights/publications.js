import { Meteor } from 'meteor/meteor';

import { Characters } from '../characters/characters.js';
import { Fights } from './fights.js';

Meteor.publish ("fights.own", function() {
  if (!this.userId) {return this.ready();}

  const character = Characters.findOne({userId: this.userId, 'stats.hp': {$gt: 0} });
  if (!character) return this.ready();
  return Fights.find({$or: [{attackerId: character._id}, {defenderId: character._id}]}, {fields: Fights.publicFields});
});

