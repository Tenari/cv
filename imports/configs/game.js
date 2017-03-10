import { Effects } from '../api/effects/effects.js';
import { itemConfigs } from './items.js';

export const gameLength = 1000*60*60*24*14;
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
  const effects = Effects.find({characterId: character._id, expiresAt: {$gt: Date.now()}}).fetch();
  let byPath = {};
  _.each(effects, function(effect){
    byPath[effect.statPath] = effect;
  })

  _.each(_.keys(speeds), function(weaponType){
    const effectBuff = (byPath['weapon.'+weaponType] && byPath['weapon.'+weaponType].amount) || 0;
    character.stats.weapon[weaponType] = character.stats.weapon[weaponType+'Base'] + effectBuff;
  })
  _.each(['strength','accuracy','agility','toughness'], function(statKey){
    const effectBuff = (byPath[statKey] && byPath[statKey].amount) || 0;
    character.stats[statKey] = character.stats[statKey+'Base'] + effectBuff;
  })

  character.stats.collecting.crafting = character.stats.collecting.craftingBase;
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
    wood: 'Improves how much energy you spend to chop wood.',
    hide: 'Improves how much energy you spend to collect from animals.',
    leather: 'Improves how much leather you make from hide.',
    ore: 'Improves how much energy you spend to mine ore from rocks.',
    metal: 'Improves how much metal you get from refining ore.',
  },
};

export const resourceConfig = {
  wood: {
    key: 'wood',
    label: 'Wood',
    cost: 1,
    value: 0.5,
    baseCostToCollect: 50,
    missionValue: 1,
  },
  hide: {
    key: 'hide',
    label: 'Hide',
    cost: 4,
    value: 3,
    baseCostToCollect: 60,
    missionValue: 2,
  },
  leather: {
    key: 'leather',
    label: 'Leather',
    cost: 8,
    value: 5,
    baseCostToCollect: 100,
    missionValue: 3,
  },
  ore: {
    key: 'ore',
    label: 'Ore',
    cost: 3,
    value: 1.5,
    baseCostToCollect: 70,
    missionValue: 2,
  },
  metal: {
    key: 'metal',
    label: 'Metal',
    cost: 6,
    value: 4,
    baseCostToCollect: 120,
    missionValue: 4,
  },
};

export function collectingSkillGrowthAmount(stat) {
  return 0.1;
}

export function craftingSkillGrowthAmount(stat, item) {
  return (50 - stat) * 0.01 * item.minToCraft;
}
