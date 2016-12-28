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
          dialog: {
            text: "What do you need help with?",
            options: [
              {
                option: "Fighting",
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
