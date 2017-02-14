// the map of all traversable tile types and their base move cost
export const moveCosts = {
  grass: 8,
  door: 1,
  mat: 1,
  'house-9': 1,
  floor: 2,
  stool: 2,
  "tree-stump": 14,
  'vertical-path': 5,
  'hz-path': 5,
  "path-inv-T": 5,
  "path-plus": 5,
  "path-T": 5,
};

export function nextSpotXY(character){
  let x = character.location.x;
  let y = character.location.y-1;
  let moveObject = {'location.y': -1};
  switch(character.location.direction) {
    case 2:
      y = character.location.y+1;
      moveObject = {'location.y': 1};
      break;
    case 3:
      y = character.location.y;
      x = character.location.x+1;
      moveObject = {'location.x': 1};
      break;
    case 4:
      y = character.location.y;
      x = character.location.x-1;
      moveObject = {'location.x': -1};
      break;
  }
  return {x: x, y: y, moveObject : moveObject};
}

export function moveCost(character, weight, terrain, obstacle) {
  let baseCost = moveCosts[terrain] || 10;
  if (obstacle)
    baseCost += obstacle.moveCost();
  return Math.max( 1, Math.round( baseCost * (2 * weight / character.maxWeight()) ) );
}

export const doorConfig = {
  lockTypes: {
    none: 'none', // means no one is allowed in
    team: 'team', // means only the team specified is allowed in
    all: 'all', // means all (including animals) may enter
  },
  stats: {hp: 30, hpBase: 30},
  buildingResources: [{resource:"wood", amount:30, has:0}],
};

export function doorIsLocked(obstacle, character){
  let locked = false;
  if (obstacle && obstacle.data && obstacle.data.lock && obstacle.data.stats.hp > 0) {
    if (obstacle.data.lock.type == doorConfig.lockTypes.none) return true;

    if (obstacle.data.lock.type == doorConfig.lockTypes.all) return false;

    if (obstacle.data.lock.type == doorConfig.lockTypes.team) {
      return obstacle.data.lock.team != character.team;
    }
  }
  return locked;
}

// objects representing individual tiles which you can _.clone() into a room.map
export const treeStumpTile = {type: "tree-stump"};
export const treeTile = {type: "tree", resources: {type: "wood", amount: 10}};
export const tiles = {
  grass: {type: 'grass'},
  'vertical-path': {type: 'vertical-path'},
  'hz-path': {type: 'hz-path'},
  'path-inv-T': {type: 'path-inv-T'},
  'path-plus': {type: 'path-plus'},
  'path-T': {type: 'path-T'},
  'floor': {type: 'floor'},
};
