import { Meteor } from 'meteor/meteor';

import { Characters } from '../../api/characters/characters.js';

import { styleFactors, fightEnergyCostFactor, speeds } from '../../configs/game.js';

export function regenLoop(){
  Characters.update({'stats.hp':{$gt: 0}, $where: "this.stats.energy < this.stats.baseEnergy"}, {$inc: {'stats.energy': 4}}, {multi: true});
  Characters.find({'stats.hp':{$gt: 0}}).forEach(function(character, index, cursor){
    const roll = Math.random();
    if (roll < 0.5 && character.stats.hp < character.stats.baseHp) {
      Characters.update(character._id, {$inc: {'stats.hp': 1}});
    }
  })
}
