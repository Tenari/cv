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

// Character functions
export function carriedWeight(character, Items){
  let weight = 0;
  Items.find({ownerId: character._id}).forEach(function(item){weight += itemConfigs[item.type][item.key].weight;});
  _.each(character.stats.resources, function(amount){weight += amount})
  return weight;
}

export function maxWeight(character) {
  // with endurance of 100, you can carry 200
  // with endurance of 1, you can carry 20
  // ish
  return 40*Math.log(character.stats.endurance) + 20;
}

export function canCarry(character, weight, Items) {
  return maxWeight(character) > (carriedWeight(character, Items) + weight);
}

export const teamCode = {
  romans: 20,
  japs: 30
}

export function getCharacter(userId, gameId, Characters) {
  return Characters.findOne({userId: userId, gameId: gameId, 'stats.hp':{$gt: 0}})
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
