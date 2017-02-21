import { moveCharacter } from '../api/characters/methods.js';

export const aiTeam = 'nature';

export const npcConfig = {
  marcoPolo: {
    key: 'marcoPolo',
    name: 'Marco Polo',
    dialog: {
      text: "Hi! My name is Marco Polo. How can I help you?",
      options: [
        {
          option: "Trade",
          action: "npc trade"
        },
        {
          option: "Help",
          action: 'dialog',
          dialog: {
            text: "What do you need help with?",
            options: [
              {
                option: "Fighting",
                action: 'dialog',
                dialog: {
                  text: "To fight someone, simply stand on the same space as them, and click the fight button next to their name.",
                  options: [
                    {
                      option: "OK",
                      action: "cancel",
                    }
                  ]
                }
              },
              {
                option: "Trading",
                action: 'dialog',
                dialog: {
                  text: "To trade with someone, simply stand on the same space as them, and click the trade button next to their name.",
                  options: [
                    {
                      option: "OK",
                      action: "cancel",
                    }
                  ]
                }
              }
            ]
          }
        }
      ]
    }
  }
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
      character.limitBounds();
    },
    setFightStrategy: function(fight, bear, Fights){
      // just maintains the current attack-mode and auto-readies
      let updateObj = {};
      if (fight.attackerId == bear._id) {
        updateObj.attackerReady = true;
      } else {
        updateObj.defenderReady = true;
      }
      Fights.update(fight._id, {$set: updateObj})
    }
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
    move: function(character){
      if (_.random(1,2) > 1) { // then just spin
        moveCharacter(character, ((character.location.direction + 1) % 4) || 4);
      } else {
        moveCharacter(character, character.location.direction);
      }
      character.limitBounds();
    },
    setFightStrategy: function(fight, character, Fights){
      // just maintains the current attack-mode and auto-readies
      let updateObj = {};
      if (fight.attackerId == character._id) {
        updateObj.attackerReady = true;
      } else {
        updateObj.defenderReady = true;
      }
      Fights.update(fight._id, {$set: updateObj})
    }
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
    move: function(character){
      if (_.random(1,2) > 1) { // then just spin
        moveCharacter(character, ((character.location.direction + 1) % 4) || 4);
      } else {
        moveCharacter(character, character.location.direction);
      }
      character.limitBounds();
    },
    setFightStrategy: function(fight, character, Fights){
      // just maintains the current attack-mode and auto-readies
      let updateObj = {};
      if (fight.attackerId == character._id) {
        updateObj.attackerReady = true;
      } else {
        updateObj.defenderReady = true;
      }
      Fights.update(fight._id, {$set: updateObj})
    }
  },
};
