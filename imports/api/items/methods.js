import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

import { Characters } from '../characters/characters.js';
import { Items } from './items.js';
import { craftingLocations } from '../../configs/items.js'
import { getCharacter } from '../../configs/game.js'

Meteor.methods({
  'items.equip'(id) {
    if (!this.userId) {
      throw new Meteor.Error('items.equip.accessDenied',
        'Gotta be logged in to equip an item');
    }

    Items.update(id, {$set: {equipped: true}});
  },
  'items.unequip'(id) {
    if (!this.userId) {
      throw new Meteor.Error('items.unequip.accessDenied',
        'Gotta be logged in to unequip an item');
    }

    Items.update(id, {$set: {equipped: false}});
  },
  'items.drop'(id) {
    if (!this.userId) {
      throw new Meteor.Error('items.drop.accessDenied',
        'Gotta be logged in to drop an item');
    }
    const item = Items.findOne(id);

    const owner = Characters.findOne(item.ownerId);

    const newLocation = {x: owner.location.x, y: owner.location.y, roomId: owner.location.roomId, updatedAt: Date.now()};

    Items.update(id, {$set: {equipped: false, ownerId: null, location: newLocation}});
  },
  'items.take'(id) {
    if (!this.userId) {
      throw new Meteor.Error('items.take.accessDenied',
        'Gotta be logged in to take an item');
    }
    const item = Items.findOne(id);
    const newOwner = Characters.findOne({userId: this.userId, 'stats.hp':{$gt: 0}});

    Items.update(id, {$set: {equipped: false, ownerId: newOwner._id, location: null}});
  },
  'items.use'(id) {
    if (!this.userId) {
      throw new Meteor.Error('items.use.accessDenied',
        'Gotta be logged in to use an item');
    }

    const item = Items.findOne(id);
    let incObj = {};
    incObj[item.effectType] = item.effectAmount
    Characters.update(item.ownerId, {$inc: incObj});

    return Items.remove(id);
  },
  'items.create'(characterId, location, type, key){
    if (!this.userId) {
      throw new Meteor.Error('items.craft.accessDenied', 'Gotta be logged in to craft an item');
    }
    let character = Characters.findOne(characterId);
    let item = _.clone(craftingLocations[location].items[type][key]);
    _.each(item.cost, function(cost, resource) {
      if (character.stats.resources[resource] < cost) {
        throw new Meteor.Error('items.craft.notEnough', 'Gotta have resources to craft an item');
      }
      character.stats.resources[resource] -= cost;
    });

    item.ownerId = character._id;
    Items.insert(item);
    Characters.update(character._id, {$set: { 'stats.resources': character.stats.resources }});
  }
});
