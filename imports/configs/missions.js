import { npcConfig } from './ai.js';

export const missionsConfig = {
  killMonster: {
    title: 'Pest Control',
  },
  killPlayer: {
    title: 'Enemy Elimination',
  },
  collectResources: {
    title: 'Resource Acquisition',
    icon: 'bar-chart',
    description: function(conditions){
      return "Collect " + conditions.amount +
             "lbs of "  + conditions.resource +
             " and bring it to " + npcConfig[conditions.turnIn.npc].name;
    },
  },
}
