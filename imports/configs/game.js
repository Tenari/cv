export const moveCost = {
  grass: 2,
  door: 1,
  mat: 1
};

export const teamCode = {
  roman: 20,
  japs: 30
}

export const doors = {'door':true, 'mat': true};

export const movableSpots = {'grass':true, 'hz-path': true, "path-inv-T": true, "path-plus": true, "path-T": true};

export const fightStyles = {'quick':true, 'normal':true, 'heavy':true, 'block':true, 'flee':true};

export const styleFactors = {quick: 3, normal: 4, heavy: 5};

export const fightEnergyCostFactor = 2;

export const speeds = {'hands': 4, 'smallBlade': 3, 'axe': 2, 'largeBlade': 1};

export const equipSlots = {hand: 1, head: 2, legs: 3, chest: 4};

export function canRevive(character) {
  return character && (character.deaths.diedAt + 1800000) < Date.now();
};

export function minutesUntilRevive(character) {
  return character && Math.round(((character.deaths.diedAt + 1800000) - Date.now()) / 60 / 1000); 
}
