import { moveCharacter } from '../api/characters/methods.js';

export const aiTeam = 'nature';

export const aiNames = {
  bear: 'bear',
  squirrel: 'Measly squirrel',
};

export const maxAiOfType = {
  bear: 3,
  squirrel: 5,
};

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

export const bearConfig = {
  spawn: function (room, Characters){
    const location = {
      x: 4, // TODO: more complicated location algorithm
      y: 4,
      direction: 1,
      classId: 100,
      roomId: room._id,
      updatedAt: Date.now(),
    };
    const charId = Characters.insert({
      name: aiNames.bear,
      team: aiTeam,
      gameId: room.gameId,
      location: location,
    });
    // TODO: insert items also, so they drop stuff when you kill them
  },
  move: function(bear){
    // this function can get more complicated if we want bears to move in a non-random drift pattern
    moveCharacter(bear, _.random(1,4));
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
}

export const squirrelConfig = {
  classId: 110,
  spawn: function (room, Characters){
    const location = {
      x: 4, // TODO: more complicated location algorithm
      y: 6,
      direction: 1,
      classId: 110,
      roomId: room._id,
      updatedAt: Date.now(),
    };
    const stats = {
      hp: 10,
      hpBase: 10,
    };
    const charId = Characters.insert({
      name: aiNames.squirrel,
      team: aiTeam,
      gameId: room.gameId,
      location: location,
      stats: stats,
    });
    // TODO: insert items also, so they drop stuff when you kill them
  },
  move: function(character){
    if (_.random(1,2) > 1) { // then just spin
      moveCharacter(character, ((character.location.direction + 1) % 4) || 4);
    } else {
      moveCharacter(character, character.location.direction);
    }
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
}
