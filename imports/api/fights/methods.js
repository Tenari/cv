import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

import { Characters } from '../characters/characters.js';
import { Fights } from './fights.js';
import { fightStyles } from '../../configs/game.js';

Meteor.methods({
  'fights.start'(defenderId) {
    if (!this.userId) {
      throw new Meteor.Error('fights.insert.accessDenied',
        'Gotta be logged in to create a fight');
    }
    const defender = Characters.findOne(defenderId);
    if (!defender) throw new Meteor.Error('fights.insert.badId','this opponent doesnt exist, dude');

    const attacker = Characters.findOne({userId: this.userId, 'stats.hp': {$gt: 0}});
    if (defender.location.roomId != attacker.location.roomId || defender.location.x != attacker.location.x || defender.location.y != attacker.location.y) throw new Meteor.Error('fights.insert.invalidOpponent', 'this opponent must have moved or something');

    Fights.insert({
      attackerId: attacker._id,
      defenderId: defender._id,
      createdAt: Date.now(),
      rounds: [],
      attackerStyle: attacker.defaultAttackStyle,
      defenderStyle: defender.defaultAttackStyle,
    });
  },
  'fights.changeStyle'(id, characterId, newStyle) {
    if (!fightStyles[newStyle]) throw new Meteor.Error('fight.changeStyle', 'invalid style');

    const fight = Fights.findOne(id);
    var updateObj = {};
    if (fight.attackerId == characterId) {
      updateObj.$set = {attackerStyle: newStyle};
    } else {
      updateObj.$set = {defenderStyle: newStyle};
    }
    return Fights.update(fight._id, updateObj);
  },
});
