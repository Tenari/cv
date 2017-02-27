import { resourceConfig } from './game.js';
import { monsterConfig } from './ai.js';

export const missionsConfig = {
  killMonster: {
    title: 'Pest Control',
    key: 'killMonster',
    icon: 'paw',
    description: function(conditions){
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
    description: function(conditions){
      return "Hunt down and kill " + conditions.playerName;
    },
    conditions: function(data) {
      return {
        playerId: data.playerId,
        playerName: data.playerName,
      };
    },
    missionValue: function(data){
      return data.value;
    },
  },
  collectResources: {
    title: 'Resource Acquisition',
    key: 'collectResources',
    icon: 'bar-chart',
    description: function(conditions){
      return "Collect " + conditions.amount +
             "lbs of "  + conditions.resource +
             " and bring it to " + conditions.turnIn.characterName;
    },
    conditions: function(data) {
      return {
        resource: data.resource,
        amount: data.amount,
        turnIn: {
          characterId: data.turnInId,
          characterName: data.characterName,
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
