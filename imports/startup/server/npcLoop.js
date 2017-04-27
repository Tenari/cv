import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { EJSON } from 'meteor/ejson';

import { Games } from '../../api/games/games.js';
import { Rooms } from '../../api/rooms/rooms.js';
import { Items } from '../../api/items/items.js';
import { Characters } from '../../api/characters/characters.js';
import { Fights } from '../../api/fights/fights.js';
import { Buildings } from '../../api/buildings/buildings.js';
import { Obstacles } from '../../api/obstacles/obstacles.js';

import { npcConfig } from '../../configs/ai.js';

export function npcActLoop(){
  Characters.find({npc: true, 'stats.hp': {$gt: 0}}).forEach(function(npc){
    if (typeof npcConfig[npc.npcKey].act === 'function')
      npcConfig[npc.npcKey].act(npc, Items, Rooms, Obstacles, Buildings, Characters, Fights);
  });
}
