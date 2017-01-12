import { itemConfigs } from './items.js';

// fighting
export const fightStyles = {'quick':true, 'normal':true, 'heavy':true, 'block':true, 'flee':true};

export const styleFactors = {quick: 3, normal: 4, heavy: 5, block: 1, flee: 1};

export const fightEnergyCostFactor = 2;

export const speeds = {'hands': 4, 'smallBlade': 3, 'axe': 2, 'largeBlade': 1};

export const doorAttackEnergyCost = 80;

// death functions
const deathWaitTimeMs = 1800000;

export function canRevive(character) {
  return character && (character.deaths.diedAt + deathWaitTimeMs) < Date.now();
};

export function minutesUntilRevive(character) {
  return character && Math.round(((character.deaths.diedAt + deathWaitTimeMs) - Date.now()) / 60 / 1000); 
}

export function getCharacter(userId, gameId, Characters) {
  return Characters.findOne({userId: userId, gameId: gameId, 'stats.hp':{$gt: 0}})
}

export function recalculateStats(character) {
  _.each(_.keys(speeds), function(weaponType){
    character.stats.weapon[weaponType] = character.stats.weapon[weaponType+'Base'];
  })
  character.stats.strength = character.stats.strengthBase; // + weapon modifications, buffs, etc..
  character.stats.accuracy = character.stats.accuracyBase;
  character.stats.agility = character.stats.agilityBase;
  character.stats.toughness = character.stats.toughnessBase;
  return character;
}

// copy/text constants
export const statDescriptions = {
  fighting: {
    strength: 'Your Strength skill affects how much damage each attack you land will cause.',
    accuracy: 'Your Accuracy skill affects how likely you are to hit an opponent.',
    agility: 'Your Agility skill affects how difficult it is for an opponent to hit you.',
    toughness: 'Your Toughness skill affects how much damage you take when an opponent hits you.',
    endurance: 'Your Endurance skill affects how much energy it costs to move. It also affects how much weight you can carry.',
  },
  weapon: {
    hands: 'Your Hands skill increases the amount of damage and the likelyhood to hit during unarmed combat.',
    smallBlade: 'Your Small Blade skill increases the amount of damage and the likelyhood to hit when using a small blade in combat.',
    largeBlade: 'Your Large Blade skill increases the amount of damage and the likelyhood to hit when using a large blade in combat.',
    axe: 'Your Axe skill increases the amount of damage and the likelyhood to hit when using an axe in combat.',
  },
  collecting: {
    wood: 'Improves how much wood you collect in one chop.',
    hide: 'Improves how much hide you collect from animals.',
    leather: 'Improves how much leather you make from hide.',
    ore: 'Improves how much ore you mine from rocks.',
    metal: 'Improves how much metal you get from refining ore.',
  },
};

export const resourceConfig = {
  wood: {
    key: 'wood',
    label: 'Wood',
    cost: 1,
    baseCostToCollect: 50,
  },
  hide: {
    key: 'hide',
    label: 'Hide',
    cost: 4,
    baseCostToCollect: 60,
  },
  leather: {
    key: 'leather',
    label: 'Leather',
    cost: 8,
    baseCostToCollect: 100,
  },
  ore: {
    key: 'ore',
    label: 'Ore',
    cost: 3,
    baseCostToCollect: 70,
  },
  metal: {
    key: 'metal',
    label: 'Metal',
    cost: 6,
    baseCostToCollect: 120,
  },
};

export function collectingSkillGrowthAmount(stat) {
  return 0.1;
}
