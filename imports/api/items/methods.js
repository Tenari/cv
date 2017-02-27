import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

import { Games } from '../games/games.js';
import { Effects } from '../effects/effects.js';
import { Characters } from '../characters/characters.js';
import { Notifications } from '../notifications/notifications.js';
import { Obstacles } from '../obstacles/obstacles.js';
import { Chats } from '../chats/chats.js';
import { Rooms } from '../rooms/rooms.js';
import { Items } from './items.js';
import { itemConfigs } from '../../configs/items.js'
import { recalculateStats, getCharacter } from '../../configs/game.js'
import { playerTeamKeys, teamConfigs } from '../../configs/ranks.js'
import { craftedItem } from '../../configs/tutorial.js'

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
    
    if (item.key == itemConfigs.misc.maguffin.key) {
      // send everyone a notification that the maguffin has been found
      Notifications.insert({
        title: 'You found the maguffin!',
        message: 'As long as you or someone on your team holds this item, your team will steadily gain points.',
        characterId: newOwner._id,
      });
      if (!item.foundAt) {
        Notifications.insertAsyncByQuery({
          title: 'The game has changed',
          message: 'The long lost maguffin has been found. What powers it holds, no one knows for sure, but the '+teamConfigs[newOwner.team].name+' is about to find out.'
        }, {team: {$in: playerTeamKeys}});
        // first finder earns his team a bunch of points
        let incObj = {};
        incObj[newOwner.team + '.score'] = 100;
        Games.update(newOwner.gameId, {$inc: incObj});
      }
    }

    Items.update(id, {$set: {equipped: false, ownerId: newOwner._id, location: null, foundAt: item.foundAt || Date.now()}});
  },
  'items.use'(id, gameId) {
    if (!this.userId) {
      throw new Meteor.Error('items.use.accessDenied',
        'Gotta be logged in to use an item');
    }

    const item = Items.findOne(id);
    const character = getCharacter(this.userId, gameId, Characters);
    if (!item || !character || item.ownerId != character._id) throw new Meteor.Error('items.use.accessDenied', 'That is not your item to use');

    if (item.key == itemConfigs.misc.maguffin.key) {
      if (!item.usedAt || (Date.now() - item.usedAt) > itemConfigs.misc.maguffin.useDelay) {
        Effects.insert({characterId: item.ownerId, statPath: 'strength', amount: character.stats.strength*0.5, expiresAt: Date.now() + 1000*60*60 });
        Effects.insert({characterId: item.ownerId, statPath: 'agility', amount: character.stats.agility*0.5, expiresAt: Date.now() + 1000*60*60 });
        Effects.insert({characterId: item.ownerId, statPath: 'accuracy', amount: character.stats.accuracy*0.5, expiresAt: Date.now() + 1000*60*60 });
        Effects.insert({characterId: item.ownerId, statPath: 'toughness', amount: character.stats.toughness*0.5, expiresAt: Date.now() + 1000*60*60 });
        Characters.update(character._id, {$set: {'stats': recalculateStats(character).stats}});
      }
    } else {
      let incObj = {};
      _.each(item.effects(), function(effect){
        incObj[effect.type] = effect.amount;
      })
      Characters.update(item.ownerId, {$inc: incObj});
    }

    if (item.type == 'consumable') {
      return Items.remove(id);
    } else {
      // re-usable items get handled;
      return Items.update(item._id, {$set: {usedAt: Date.now()}});
    }
  },
  'items.create'(characterId, type, key){
    if (!this.userId) throw new Meteor.Error('items.craft.accessDenied', 'Gotta be logged in to craft an item');

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

    if (Games.findOne(character.gameId).tutorial) {
      craftedItem(character, Obstacles, Chats, Rooms);
    }

    Items.insert({key: key, type: type, ownerId: character._id, condition: 100});
    return Characters.update(character._id, {$set: { 'stats': character.stats }});
  }
});
