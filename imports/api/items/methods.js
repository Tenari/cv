import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

import { Characters } from '../characters/characters.js';
import { Items } from './items.js';
import { itemConfigs } from '../../configs/items.js'
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
  'items.take'(id, gameId) {
    if (!this.userId) {
      throw new Meteor.Error('items.take.accessDenied',
        'Gotta be logged in to take an item');
    }
    const item = Items.findOne(id);
    const newOwner = getCharacter(this.userId, gameId, Characters);

    if (!newOwner.canCarry(item.weight())) throw new Meteor.Error('items.take.full', 'Item weighs too much to carry');

    Items.update(id, {$set: {equipped: false, ownerId: newOwner._id, location: null}});
  },
  'items.use'(id) {
    if (!this.userId) {
      throw new Meteor.Error('items.use.accessDenied',
        'Gotta be logged in to use an item');
    }

    const item = Items.findOne(id);
    let incObj = {};
    _.each(item.effects(), function(effect){
      incObj[effect.type] = effect.amount;
    })
    Characters.update(item.ownerId, {$inc: incObj});

    return Items.remove(id);
  },
  'items.create'(characterId, type, key){
    if (!this.userId) {
      throw new Meteor.Error('items.craft.accessDenied', 'Gotta be logged in to craft an item');
    }
    let character = Characters.findOne(characterId);
    const item = itemConfigs[type][key];
    for(var i = 0; i < _.keys(item.cost).length; i++) {
      const thisResource = _.keys(item.cost)[i];
      const thisCost = item.cost[thisResource];
      
      if (thisResource == 'energy') {
        if (character.stats.energy < thisCost) {
          throw new Meteor.Error('items.craft.notEnough', 'Gotta have resources to craft an item');
        }
        character.stats[thisResource] -= thisCost;
      } else {
        if (character.stats.resources[thisResource] < thisCost) {
          throw new Meteor.Error('items.craft.notEnough', 'Gotta have resources to craft an item');
        }
        character.stats.resources[thisResource] -= thisCost;
      }
    }

    Items.insert({key: key, type: type, ownerId: character._id, condition: 100});
    return Characters.update(character._id, {$set: { 'stats': character.stats }});
  }
});
