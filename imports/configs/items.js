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
  cost: {wood: 6},
};

export const workbench = {
  armor: {
    woodenHelmet: woodenHelmet,
  }
}

export const craftingLocations = {
  wood: {name: 'Workbench', items: workbench},
};
