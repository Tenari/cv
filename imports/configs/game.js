// fighting
export const fightStyles = {'quick':true, 'normal':true, 'heavy':true, 'block':true, 'flee':true};

export const styleFactors = {quick: 3, normal: 4, heavy: 5, block: 1, flee: 1};

export const fightEnergyCostFactor = 2;

export const speeds = {'hands': 4, 'smallBlade': 3, 'axe': 2, 'largeBlade': 1};

export const equipSlots = {hand: 1, head: 2, legs: 3, chest: 4};

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
  Items.find({ownerId: character._id}).forEach(function(item){weight += item.weight;});
  return weight;
}

export const teamCode = {
  romans: 20,
  japs: 30
}
