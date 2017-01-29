import { npcConfig } from './ai.js';

export const missionsConfig = {
  killMonster: {
    title: 'Pest Control',
    key: 'killMonster',
  },
  killPlayer: {
    title: 'Enemy Elimination',
    key: 'killPlayer',
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
    conditions: function(resource, amount, turnInCharacterId) {
      return {
        resource: resource,
        amount: amount,
        turnIn: {
          characterId: turnInCharacterId,
        },
      };
    }
  },
}
