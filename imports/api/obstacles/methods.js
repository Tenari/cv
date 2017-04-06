import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';

import { Characters } from '../characters/characters.js';
import { Buildings } from '../buildings/buildings.js';
import { Obstacles } from './obstacles.js';
import { Chats } from '../chats/chats.js';

import { nextSpotXY, doorConfig } from '../../configs/locations.js';
import { getCharacter, doorAttackEnergyCost, resourceConfig, collectingSkillGrowthAmount } from '../../configs/game.js';
import { buildingConfig } from '../../configs/buildings.js';
import { importRoomObstaclesAndBuildings } from '../../configs/obstacles.js';

Meteor.methods({
  'obstacles.forge'(gameId){
    let character = Characters.findOne({userId: this.userId, gameId: gameId});
    if (!character) throw new Meteor.Error('obstacles.forge', "Character not found");

    const obstacle = character.getFacingObstacle(Obstacles);
    if (!obstacle) throw new Meteor.Error('obstacles.forge', "obstacle not found")

    if (obstacle && obstacle.data.use && obstacle.data.use.type == 'forge') {
      const resource = obstacle.data.use.params.resource
      if (character.stats.resources[resource] <= 0) throw new Meteor.Error('obstacles.forge', "Not enough " + obstacle.data.use.params.resource + " to use");

      let otherResource;
      if (resource == resourceConfig.ore.key) {
        otherResource = resourceConfig.metal.key;
      } else {
        otherResource = resourceConfig.leather.key;
      }

      character.stats.resources[resource] -= 1;
      character.stats.resources[otherResource] += 1;

      const newEnergy = character.stats.energy - Math.max(resourceConfig[otherResource].baseCostToCollect - parseInt(character.stats.collecting[otherResource]), 1);

      const growth = collectingSkillGrowthAmount(character.stats.collecting[otherResource+'Base']);
      character.stats.collecting[otherResource] += growth;
      character.stats.collecting[otherResource+'Base'] += growth;

      Characters.update(character._id, {$set: {'stats.resources': character.stats.resources, 'stats.energy': newEnergy, 'stats.collecting': character.stats.collecting}});
      return {message: "You turned 1 "+resource +" into 1 "+otherResource+"!"};
    }
  },
})
