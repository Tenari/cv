import { Meteor } from 'meteor/meteor';

import { Games } from '../../api/games/games.js';
import { Characters } from '../../api/characters/characters.js';
import { Missions } from '../../api/missions/missions.js';

import { playerTeamKeys } from '../../configs/ranks.js';
import { missionsConfig } from '../../configs/missions.js';
import { npcConfig } from '../../configs/ai.js';

export function missionSpawnLoop(){
  Games.find().forEach(function (game){
    _.each(playerTeamKeys, function(key) {
      const missionCount = Missions.find({gameId: game._id, team: key, creatorId: {$exists: false}, completed: false}).count();
      const neededMissionCount = 5 - missionCount;
      const marcoPolo = Characters.findOne({npc: true, gameId: game._id, npcKey: npcConfig.marcoPolo.key});
      for (var i=0; i < neededMissionCount; i++) {
        Missions.insert({
          gameId: game._id,
          type: 'collectResources',
          rankPoints: 48,
          team: key,
          conditions: {
            resource: 'wood',
            amount: 5,
            turnIn: {
              characterId: marcoPolo._id,
              characterName: marcoPolo.name,
            }
          },
          createdAt: Date.now(),
        });
      }
    })
  })
}
