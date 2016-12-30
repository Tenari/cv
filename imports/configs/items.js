export const equipSlots = {hand: 1, head: 2, legs: 3, chest: 4};

export const itemConfigs = {
  armor: {
    woodenHelmet: {
      key: 'woodenHelmet',
      type: 'armor',
      name: 'Wooden Helm',
      img: '/images/wooden-helmet.png',
      weight: 5,
      equipSlot: equipSlots.head,
      effectType: 'damage',
      effectAmount: -2,
      cost: {
        wood: 6, energy: 20
      },
    },
  },
  weapon: {
    rustySword: {
      key: 'rustySword',
      type: 'weapon',
      weaponType: 'largeBlade',
      name: 'Rusty sword',
      img: '/images/shitty-sword.png',
      weight: 10,
      equipSlot: equipSlots.hand,
      effectType: 'damage',
      effectAmount: 2,
      cost: {
        wood: 1, metal: 10, energy: 200
      },
      npcSellFactor: 0.5,
      npcBuyFactor: 0.4,
    },
    woodenKnuckles: {
      key: 'woodenKnuckles',
      type: 'weapon',
      weaponType: 'hands',
      name: 'Wooden Knuckles',
      img: '/images/wooden-knuckles.png',
      weight: 2,
      equipSlot: equipSlots.hand,
      effectType: 'damage',
      effectAmount: 1,
      cost: {wood: 3, energy: 25},
    },
    woodenSword: {
      key: 'woodenSword',
      weaponType: 'largeBlade',
      type: 'weapon',
      name: 'Wooden Sword',
      img: '/images/wooden-sword.png',
      weight: 3,
      equipSlot: equipSlots.hand,
      effectType: 'damage',
      effectAmount: 1,
      cost: {wood: 4, energy: 25},
    },
  },
  consumable: {
    chickenLeg: {
      key: 'chickenLeg',
      type: 'consumable',
      name: 'Chicken leg',
      img: '/images/chicken-leg.png',
      weight: 1,
      effectType: 'stats.hp',
      effectAmount: 5,
      npcSellFactor: 0.1,
      npcBuyFactor: 0.08,
    }
  }
};

export const craftingLocations = {
  wood: {
    name: 'Workbench',
    items: {
      armor: ['woodenHelmet'],
      weapon: ['woodenKnuckles', 'woodenSword']
    }
  },
};
