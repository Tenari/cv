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
      armor: ['woodenHelmet'],
      weapon: ['woodenKnuckles', 'woodenSword']
    }
  },
};
