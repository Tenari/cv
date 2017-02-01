import { resourceConfig } from './game.js';
import { monsterConfig } from './ai.js';

export const missionsConfig = {
  killMonster: {
    title: 'Pest Control',
    key: 'killMonster',
    icon: 'paw',
    description: function(conditions, character){
      return "Hunt down and kill " + conditions.amount +
             " " + monsterConfig[conditions.monsterKey].name + "s";
    },
    conditions: function(data) {
      return {
        monsterKey: data.monsterKey,
        amount: data.amount,
        killCount: 0,
      };
    },
    missionValue: function(data){
      return parseInt(monsterConfig[data.monsterKey].missionValue * (data.amount));
    },
  },
  killPlayer: {
    title: 'Enemy Elimination',
    key: 'killPlayer',
    icon: 'street-view',
  },
  collectResources: {
    title: 'Resource Acquisition',
    key: 'collectResources',
    icon: 'bar-chart',
    description: function(conditions, character){
      return "Collect " + conditions.amount +
             "lbs of "  + conditions.resource +
             " and bring it to " + character.name;
    },
    conditions: function(data) {
      return {
        resource: data.resource,
        amount: data.amount,
        turnIn: {
          characterId: data.turnInId,
        },
      };
    },
    missionValue: function(data){
      const resource = data.resource;
      const amount = data.amount;
      return parseInt(resourceConfig[resource].missionValue * (amount / 2));
    },
  },
}
