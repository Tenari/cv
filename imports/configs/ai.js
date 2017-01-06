import { moveCharacter } from '../api/characters/methods.js';

export const aiTeam = 'nature';

export const aiNames = {
  bear: 'bear',
};

export const maxAiOfType = {
  bear: 3,
};

export const npcConfig = {
  marcoPolo: {
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
  spawn: function (room){
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
