import { equipSlots } from './game.js';

export const shittySword = {
  name: 'Shitty sword',
  type: 'largeBlade',
  img: '/images/shitty-sword.png',
  weight: 10,
  equipped: false,
  equipSlot: equipSlots.hand,
  effectType: 'damage',
  effectAmount: 2,
};

export const chickenLeg = {
  name: 'Chicken leg',
  type: 'food',
  img: '/images/chicken-leg.png',
  weight: 1,
  equipped: false,
  effectType: 'stats.hp',
  effectAmount: 5,
};

export const woodenHelmet = {
  key: 'woodenHelmet',
  name: 'Wooden Helm',
  type: 'armor',
  img: '/images/wooden-helmet.png',
  weight: 5,
  equipped: false,
  equipSlot: equipSlots.head,
  effectType: 'damage',
  effectAmount: -2,
  cost: {wood: 6, energy: 20},
};

export const woodenKnuckles = {
  key: 'woodenKnuckles',
  name: 'Wooden Knuckles',
  type: 'hands',
  img: '/images/wooden-knuckles.png',
  weight: 2,
  equipped: false,
  equipSlot: equipSlots.hand,
  effectType: 'damage',
  effectAmount: 1,
  cost: {wood: 2, energy: 25},
};
export const woodenSword = {
  key: 'woodenSword',
  name: 'Wooden Sword',
  type: 'hands',
  img: '/images/wooden-sword.png',
  weight: 2,
  equipped: false,
  equipSlot: equipSlots.hand,
  effectType: 'damage',
  effectAmount: 1,
  cost: {wood: 2, energy: 25},
};

export const workbench = {
  armor: {
    woodenHelmet: woodenHelmet,
  },
  weapon: {
    woodenKnuckles: woodenKnuckles,
    woodenSword: woodenSword,
  }
}

export const craftingLocations = {
  wood: {name: 'Workbench', items: workbench},
};
