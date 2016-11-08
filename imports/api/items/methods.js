import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

import { Characters } from '../characters/characters.js';
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
  'items.drop'(id) {
    if (!this.userId) {
      throw new Meteor.Error('todos.insert.accessDenied',
        'Gotta be logged in to drop an item');
    }
    const item = Items.findOne(id);

    const owner = Characters.findOne(item.ownerId);

    const newLocation = {x: owner.location.x, y: owner.location.y, roomId: owner.location.roomId, updatedAt: Date.now()};

    Items.update(id, {$set: {equipped: false, ownerId: null, location: newLocation}});
  },
  'items.take'(id) {
    if (!this.userId) {
      throw new Meteor.Error('todos.insert.accessDenied',
        'Gotta be logged in to take an item');
    }
    const item = Items.findOne(id);
    const newOwner = Characters.findOne({userId: this.userId, 'stats.hp':{$gt: 0}});

    Items.update(id, {$set: {equipped: false, ownerId: newOwner._id, location: null}});
  },
});
