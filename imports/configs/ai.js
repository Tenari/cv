import { EJSON } from 'meteor/ejson';
import { moveCharacter } from '../api/characters/methods.js';

export const aiTeam = 'nature';

export const npcConfig = {
  marcoPolo: {
    key: 'marcoPolo',
    team: 'romans',
    name: 'Marco Polo',
    classId: 25,
    defaultStats: {
      money: 10000,
      resources: {
        leather: 5,
        metal: 5,
      }
    },
    dialog: {
      "text": "Hi! My name is Marco Polo. How can I help you?",
      "options": [
        {
          "option": "Trade",
          "action": "npc trade"
        },
        {
          "option": "Help",
          "action": "dialog",
          "dialog": {
            "text": "What do you need help with?",
            "options": [
              {
                "option": "Fighting",
                "action": "dialog",
                "dialog": {
                  "text": "To fight someone, simply stand on the same space as them, and click the fight button next to their name.",
                  "options": [
                    {
                      "option": "OK",
                      "action": "cancel"
                    }
                  ]
                }
              },
              {
                "option": "Trading",
                "action": "dialog",
                "dialog": {
                  "text": "To trade with someone, simply stand on the same space as them, and click the trade button next to their name.",
                  "options": [
                    {
                      "option": "OK",
                      "action": "cancel"
                    }
                  ]
                }
              }
            ]
          }
        }
      ]
    },
  },
  genericRomanTownsPerson: {
    key: 'genericRomanTownsPerson',
    team: 'romans',
    name: function(){
      switch(_.random(1,4)){
        case 1:
          return "Albus Aelius";
        case 2:
          return "Fabius Drusus";
        case 3:
          return "Felix Flavius";
        case 4:
        default:
          return "Laelius Livius";
      }
    },
    classId: 35,
    defaultStats: function(){
      switch(_.random(1,4)){
        case 1:
          return {
            money: 200,
            resources: {
              leather: 1
            }
          };
        case 2:
          return {
            money: 100,
            resources: {
              leather: 2
            }
          };
        case 3:
          return {
            money: 50,
            resources: {
              wood: 1
            }
          };
        case 4:
        default:
          return {
            money: 150,
            resources: {
              metal: 1
            }
          };
      }
    },
    dialog: {
      "text": "Hail, friend. What do you need?",
      "options": [
        {
          "option": "Trade",
          "action": "npc trade"
        },
        {
          "option": "I need a job",
          "action": "dialog",
          "dialog": {
            "text": "Don't we all. If you could bring me some wood, I'd pay you for it.",
            "options": [
              {
                "option": "OK",
                "action": "cancel"
              }
            ]
          }
        }
      ]
    },
  }
}

export function importRoomNpcs(roomDefinition, roomId, gameId, Characters, Items) {
  _.each(roomDefinition.npcs, function(npc){
    var name, defaultStats;
    if (npcConfig[npc.type] && typeof npcConfig[npc.type].name === 'function') {
      name = npcConfig[npc.type].name();
    } else {
      name = npcConfig[npc.type].name;
    }

    if (npcConfig[npc.type] && typeof npcConfig[npc.type].defaultStats === 'function') {
      defaultStats = npcConfig[npc.type].defaultStats();
    } else {
      defaultStats = npcConfig[npc.type].defaultStats;
    }
    const npcId = Characters.insert({
      gameId: gameId,
      name: name,
      team: npcConfig[npc.type].team,
      location: {
        x: npc.location.x,
        y: npc.location.y,
        direction: 2,
        classId: npcConfig[npc.type].classId,
        roomId: roomId,
      },
      npc: true,
      npcKey: npc.type,
      stats: defaultStats,
    })
    _.each(npc.items, function(item){
      Items.insert({key: item.key, type: item.type, ownerId: npcId, condition: 100});
    })
  })
}

function spinnyMoveAlgorithm(character){
  if (_.random(1,2) > 1) { // then just spin
    moveCharacter(character, ((character.location.direction + 1) % 4) || 4);
  } else {
    moveCharacter(character, character.location.direction);
  }
  character.limitBounds();
}

function doNothingFightStrategy(fight, monster, Fights){
  // just maintains the current attack-mode and auto-readies
  let updateObj = {};
  if (fight.attackerId == monster._id) {
    updateObj.attackerReady = true;
  } else {
    updateObj.defenderReady = true;
  }
  Fights.update(fight._id, {$set: updateObj})
}

export const monsterConfig = {
  bear: {
    key: 'bear',
    name: 'Grizzly bear',
    classId: 100,
    missionValue: 10,
    spawn: function (aiInit, index, room, Characters){
      const location = {
        x: aiInit.location.x,
        y: aiInit.location.y,
        direction: 1,
        classId: monsterConfig.bear.classId,
        roomId: room._id,
        updatedAt: Date.now(),
      };
      const charId = Characters.insert({
        name: monsterConfig.bear.name,
        team: aiTeam,
        gameId: room.gameId,
        location: location,
        monsterKey: monsterConfig.bear.key,
        aiIndex: index,
        aiBounds: aiInit.bounds,
      });
      // TODO: insert items also, so they drop stuff when you kill them
    },
    move: function(bear){
      // this function can get more complicated if we want bears to move in a non-random drift pattern
      moveCharacter(bear, _.random(1,4));
      bear.limitBounds();
    },
    setFightStrategy: doNothingFightStrategy,
  },
  squirrel: {
    key: 'squirrel',
    name: 'Measley squirrel',
    classId: 110,
    missionValue: 1,
    spawn: function (aiInit, index, room, Characters){
      const createdLocation = {
        x: aiInit.location.x,
        y: aiInit.location.y,
        direction: 1,
        classId: monsterConfig.squirrel.classId,
        roomId: room._id,
        updatedAt: Date.now(),
      };
      const stats = {
        hp: 10,
        hpBase: 10,
      };
      const charId = Characters.insert({
        name: monsterConfig.squirrel.name,
        team: aiTeam,
        gameId: room.gameId,
        location: createdLocation,
        stats: stats,
        monsterKey: monsterConfig.squirrel.key,
        aiIndex: index,
        aiBounds: aiInit.bounds,
      });
      // TODO: insert items also, so they drop stuff when you kill them
    },
    move: spinnyMoveAlgorithm,
    setFightStrategy: doNothingFightStrategy,
  },
  fox: {
    key: 'fox',
    name: 'Fox',
    classId: 105,
    missionValue: 2,
    spawn: function (aiInit, index, room, Characters){
      const createdLocation = {
        x: aiInit.location.x,
        y: aiInit.location.y,
        direction: 1,
        classId: monsterConfig.fox.classId,
        roomId: room._id,
        updatedAt: Date.now(),
      };
      const stats = {
        hp: 15,
        hpBase: 15,
      };
      const charId = Characters.insert({
        name: monsterConfig.fox.name,
        team: aiTeam,
        gameId: room.gameId,
        location: createdLocation,
        stats: stats,
        monsterKey: monsterConfig.fox.key,
        aiIndex: index,
        aiBounds: aiInit.bounds,
      });
      // TODO: insert items also, so they drop stuff when you kill them
    },
    move: spinnyMoveAlgorithm,
    setFightStrategy: doNothingFightStrategy,
  },
  wolf: {
    key: 'wolf',
    name: 'Wolf',
    classId: 120,
    missionValue: 4,
    spawn: function (aiInit, index, room, Characters){
      const createdLocation = {
        x: aiInit.location.x,
        y: aiInit.location.y,
        direction: 1,
        classId: monsterConfig.wolf.classId,
        roomId: room._id,
        updatedAt: Date.now(),
      };
      const stats = {
        hp: 20,
        hpBase: 20,
      };
      const charId = Characters.insert({
        name: monsterConfig.wolf.name,
        team: aiTeam,
        gameId: room.gameId,
        location: createdLocation,
        stats: stats,
        monsterKey: monsterConfig.wolf.key,
        aiIndex: index,
        aiBounds: aiInit.bounds,
      });
      // TODO: insert items also, so they drop stuff when you kill them
    },
    move: spinnyMoveAlgorithm,
    setFightStrategy: doNothingFightStrategy,
  },
  easyPixies: {
    key: 'easyPixies',
    name: 'Nice Pixies',
    classId: 115,
    missionValue: 3,
    spawn: function (aiInit, index, room, Characters){
      const createdLocation = {
        x: aiInit.location.x,
        y: aiInit.location.y,
        direction: 1,
        classId: monsterConfig.easyPixies.classId,
        roomId: room._id,
        updatedAt: Date.now(),
      };
      const stats = {
        hp: 18,
        hpBase: 18,
      };
      const charId = Characters.insert({
        name: monsterConfig.easyPixies.name,
        team: aiTeam,
        gameId: room.gameId,
        location: createdLocation,
        stats: stats,
        monsterKey: monsterConfig.easyPixies.key,
        aiIndex: index,
        aiBounds: aiInit.bounds,
      });
      // TODO: insert items also, so they drop stuff when you kill them
    },
    move: spinnyMoveAlgorithm,
    setFightStrategy: doNothingFightStrategy,
  },
  hardPixies: {
    key: 'hardPixies',
    name: 'Mean Pixies',
    classId: 125,
    missionValue: 6,
    spawn: function (aiInit, index, room, Characters){
      const createdLocation = {
        x: aiInit.location.x,
        y: aiInit.location.y,
        direction: 1,
        classId: monsterConfig.hardPixies.classId,
        roomId: room._id,
        updatedAt: Date.now(),
      };
      const stats = {
        hp: 25,
        hpBase: 25,
      };
      const charId = Characters.insert({
        name: monsterConfig.hardPixies.name,
        team: aiTeam,
        gameId: room.gameId,
        location: createdLocation,
        stats: stats,
        monsterKey: monsterConfig.hardPixies.key,
        aiIndex: index,
        aiBounds: aiInit.bounds,
      });
      // TODO: insert items also, so they drop stuff when you kill them
    },
    move: spinnyMoveAlgorithm,
    setFightStrategy: doNothingFightStrategy,
  },
};
