import { Meteor } from 'meteor/meteor';

import { Characters } from '../characters/characters.js';
import { Items } from './items.js';

Meteor.publish ("items.own", function() {
  if (!this.userId) return this.ready();

  const character = Characters.findOne({userId: this.userId, 'stats.hp': {$gt: 0} });
  if (!character) return this.ready();
  return Items.find({ownerId: character._id}, {fields: Items.publicFields});
});

