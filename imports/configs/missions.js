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
    description: function(conditions){
      return "Collect " + conditions.amount +
             "lbs of "  + conditions.resource +
             " and bring it to " + npcConfig[conditions.turnIn.npc].name;
    },
    conditions: function(resource, amount, turnInCharacter) {
      let turnIn = {};
      if (turnInCharacter.npc) {
        turnIn.npc = turnInCharacter.npcKey;
      }
      return {
        resource: resource,
        amount: amount,
        turnIn: turnIn,
      };
    }
  },
}
