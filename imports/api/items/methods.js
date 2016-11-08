import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

import { Items } from './items.js';

Meteor.methods({
  'items.equip'(id) {
    if (!this.userId) {
      throw new Meteor.Error('todos.insert.accessDenied',
        'Gotta be logged in to equip an item');
    }

    Items.update(id, {$set: {equipped: true}});
  },
  'items.unequip'(id) {
    if (!this.userId) {
      throw new Meteor.Error('todos.insert.accessDenied',
        'Gotta be logged in to unequip an item');
    }

    Items.update(id, {$set: {equipped: false}});
  },
});
