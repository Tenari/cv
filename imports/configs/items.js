export const equipSlots = {hand: 1, head: 2, legs: 3, chest: 4};

export function effectsDescription(effects){
  let str = '';
  _.each(effects, function(effect){
    if (effect.amount){
      str += effect.amount + ' to ' + effectDescriptions[effect.type] + '. ';
    } else {
      str += effectDescriptions[effect.type];
    }
  })
  return str;
}

export const itemConfigs = {
  armor: {
    woodenHelmet: {
      key: 'woodenHelmet',
      type: 'armor',
      name: 'Wooden Helm',
      img: '/images/wooden-helmet.png',
      weight: 5,
      equipSlot: equipSlots.head,
      effects: [{
        type: 'damageTaken',
        amount: -1,
      }],
      cost: {
        wood: 6, energy: 20
      },
      npcSellFactor: 0.2,
      npcBuyFactor: 0.18,
    },
    woodenSheild: {
      key: 'woodenSheild',
      type: 'armor',
      name: 'Wooden Sheild',
      img: '/images/wooden-sheild.png',
      weight: 5,
      equipSlot: equipSlots.hand,
      effects: [{
        type: 'damageTaken',
        amount: -1,
      }],
      cost: {
        wood: 7, energy: 20
      },
      npcSellFactor: 0.2,
      npcBuyFactor: 0.18,
    },
  },
  weapon: {
    woodenKnuckles: {
      key: 'woodenKnuckles',
      type: 'weapon',
      weaponType: 'hands',
      name: 'Wooden Knuckles',
      img: '/images/wooden-knuckles.png',
      weight: 2,
      equipSlot: equipSlots.hand,
      effects: [{
        type: 'damageDealt',
        amount: 1,
      }],
      cost: {wood: 3, energy: 25},
      npcSellFactor: 0.1,
      npcBuyFactor: 0.09,
    },
    woodenSword: {
      key: 'woodenSword',
      weaponType: 'largeBlade',
      type: 'weapon',
      name: 'Wooden Sword',
      img: '/images/wooden-sword.png',
      weight: 3,
      equipSlot: equipSlots.hand,
      effects: [{
        type: 'damageDealt',
        amount: 2,
      }],
      cost: {wood: 4, energy: 25},
      npcSellFactor: 0.2,
      npcBuyFactor: 0.18,
    },
    rustySword: {
      key: 'rustySword',
      type: 'weapon',
      weaponType: 'largeBlade',
      name: 'Rusty sword',
      img: '/images/shitty-sword.png',
      weight: 10,
      equipSlot: equipSlots.hand,
      effects: [{
        type: 'damageDealt',
        amount: 3,
      }],
      cost: {
        wood: 1, metal: 10, energy: 200
      },
      npcSellFactor: 0.5,
      npcBuyFactor: 0.4,
    },
    standardSword: {
      key: 'standardSword',
      weaponType: 'largeBlade',
      type: 'weapon',
      name: 'Sword',
      img: '/images/standard-sword.png',
      weight: 11,
      equipSlot: equipSlots.hand,
      effects: [{
        type: 'damageDealt',
        amount: 4,
      }],
      cost: {metal: 10, energy: 50},
      npcSellFactor: 0.65,
      npcBuyFactor: 0.5,
    },
    romanSword: {
      key: 'romanSword',
      weaponType: 'largeBlade',
      type: 'weapon',
      name: 'Gladius',
      img: '/images/roman-sword.png',
      weight: 12,
      equipSlot: equipSlots.hand,
      effects: [{
        type: 'damageDealt',
        amount: 5,
      }],
      cost: {metal: 15, energy: 75},
      npcSellFactor: 0.75,
      npcBuyFactor: 0.6,
    },
    japaneseSword: {
      key: 'japaneseSword',
      weaponType: 'largeBlade',
      type: 'weapon',
      name: 'Katana',
      img: '/images/japanese-sword.png',
      weight: 12,
      equipSlot: equipSlots.hand,
      effects: [{
        type: 'damageDealt',
        amount: 5,
      }],
      cost: {metal: 15, energy: 75},
      npcSellFactor: 0.75,
      npcBuyFactor: 0.6,
    },
    foldedSword: {
      key: 'foldedSword',
      weaponType: 'largeBlade',
      type: 'weapon',
      name: 'Folded Steel Sword',
      img: '/images/folded-sword.png',
      weight: 15,
      equipSlot: equipSlots.hand,
      effects: [{
        type: 'damageDealt',
        amount: 6,
      }],
      cost: {metal: 25, energy: 175},
      npcSellFactor: 0.99,
      npcBuyFactor: 0.75,
    },
    masterSword: {
      key: 'masterSword',
      weaponType: 'largeBlade',
      type: 'weapon',
      name: 'Master\'s Sword',
      img: '/images/master-sword.png',
      weight: 16,
      equipSlot: equipSlots.hand,
      effects: [{
        type: 'damageDealt',
        amount: 7,
      }],
      cost: {metal: 35, energy: 275},
      npcSellFactor: 1.99,
      npcBuyFactor: 1.50,
    },
    standardDagger: {
      key: 'standardDagger',
      weaponType: 'smallBlade',
      type: 'weapon',
      name: 'Dagger',
      img: '/images/standard-dagger.png',
      weight: 3,
      equipSlot: equipSlots.hand,
      effects: [{
        type: 'damageDealt',
        amount: 2,
      }],
      cost: {metal: 5, energy: 30},
      npcSellFactor: 0.5,
      npcBuyFactor: 0.35,
    },
    romanDagger: {
      key: 'romanDagger',
      weaponType: 'smallBlade',
      type: 'weapon',
      name: 'Roman Dagger',
      img: '/images/roman-dagger.png',
      weight: 4,
      equipSlot: equipSlots.hand,
      effects: [{
        type: 'damageDealt',
        amount: 3,
      }],
      cost: {metal: 7, energy: 60},
      npcSellFactor: 0.75,
      npcBuyFactor: 0.6,
    },
    japaneseDagger: {
      key: 'japaneseDagger',
      weaponType: 'smallBlade',
      type: 'weapon',
      name: 'Katana',
      img: '/images/japanese-dagger.png',
      weight: 4,
      equipSlot: equipSlots.hand,
      effects: [{
        type: 'damageDealt',
        amount: 3,
      }],
      cost: {metal: 7, energy: 60},
      npcSellFactor: 0.75,
      npcBuyFactor: 0.6,
    },
    foldedDagger: {
      key: 'foldedDagger',
      weaponType: 'smallBlade',
      type: 'weapon',
      name: 'Folded Steel Dagger',
      img: '/images/folded-dagger.png',
      weight: 5,
      equipSlot: equipSlots.hand,
      effects: [{
        type: 'damageDealt',
        amount: 4,
      }],
      cost: {metal: 9, energy: 100},
      npcSellFactor: 0.8,
      npcBuyFactor: 0.75,
    },
    masterDagger: {
      key: 'masterDagger',
      weaponType: 'smallBlade',
      type: 'weapon',
      name: 'Master\'s Dagger',
      img: '/images/master-dagger.png',
      weight: 6,
      equipSlot: equipSlots.hand,
      effects: [{
        type: 'damageDealt',
        amount: 5,
      }],
      cost: {metal: 11, energy: 200},
      npcSellFactor: 1.50,
      npcBuyFactor: 1.25,
    },
  },
  consumable: {
    chickenLeg: {
      key: 'chickenLeg',
      type: 'consumable',
      name: 'Chicken leg',
      img: '/images/chicken-leg.png',
      weight: 1,
      effects: [{
        type: 'stats.hp',
        amount: 2,
      },{
        type: 'stats.energy',
        amount: -15,
      }],
      npcSellFactor: 0.1,
      npcBuyFactor: 0.08,
    }
  },
  misc: {
    maguffin: {
      key: 'maguffin',
      type: 'misc',
      name: 'Mysterious Maguffin',
      img: '/images/maguffin.png',
      weight: 10,
      effects: [{
        type: 'maguffin',
      }],
      npcSellFactor: 100,
      npcBuyFactor: 1,
      useDelay: 1000*60*60*6, // only usable 1 per 6 hours
    }
  }
};

export const effectDescriptions = {
  damageDealt: 'damage you give',
  'stats.hp': 'your current health',
  'stats.energy': 'your current energy',
  damageTaken: 'damage you take',
  maguffin: 'unknown',
}

export const craftingLocations = {
  wood: {
    name: 'Workbench',
    items: {
      armor: ['woodenHelmet', 'woodenSheild'],
      weapon: ['woodenKnuckles', 'woodenSword']
    }
  },
  metal: {
    name: 'Anvil',
    items: {
      weapon: ['standardSword', 'romanSword', 'japaneseSword', 'foldedSword', 'masterSword', 'standardDagger', 'romanDagger', 'japaneseDagger', 'foldedDagger', 'masterDagger']
    }
  },
};
