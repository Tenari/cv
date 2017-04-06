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

export function directionToAFromB(start, goal){
  if (start.y > goal.y)
    return 1;
  if (start.y < goal.y)
    return 2;
  if (start.x < goal.x)
    return 3;
  if (start.x > goal.x)
    return 4;
}

export function moveCost(character, weight, terrainType, obstacle) {
  let baseCost = (terrain[terrainType] && terrain[terrainType].moveCost) || 10;
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

export const terrain = {
  grass: {
    moveCost: 8,
    type: 'grass',
    classes: ['i-terrain-grassv1', 'i-terrain-grassv2', 'i-terrain-grassv3', 'i-terrain-grassv4'],
  },
  road: {
    type: 'road',
    moveCost: 3,
    classes: ['i-terrain-roadv1', 'i-terrain-roadv2', 'i-terrain-roadv3', 'i-terrain-roadv4', 'i-terrain-roadev1', 'i-terrain-roadev2', 'i-terrain-roadev3', 'i-terrain-roadev4', 'i-terrain-roadnv1', 'i-terrain-roadnv2', 'i-terrain-roadnv3', 'i-terrain-roadnv4', 'i-terrain-roadnev1', 'i-terrain-roadnev2', 'i-terrain-roadnev3', 'i-terrain-roadnev4', 'i-terrain-roadnsv1', 'i-terrain-roadnsv2', 'i-terrain-roadnsv3', 'i-terrain-roadnsv4', 'i-terrain-roadnwv1', 'i-terrain-roadnwv2', 'i-terrain-roadnwv3', 'i-terrain-roadnwv4', 'i-terrain-roadsv1', 'i-terrain-roadsv2', 'i-terrain-roadsv3', 'i-terrain-roadsv4', 'i-terrain-roadsev1', 'i-terrain-roadsev2', 'i-terrain-roadsev3', 'i-terrain-roadsev4', 'i-terrain-roadswv1', 'i-terrain-roadswv2', 'i-terrain-roadswv3', 'i-terrain-roadswv4', 'i-terrain-roadw4', 'i-terrain-roadwv1', 'i-terrain-roadwv2', 'i-terrain-roadwv3', 'i-terrain-roadwev1', 'i-terrain-roadwev2', 'i-terrain-roadwev3', 'i-terrain-roadwev4']
  },
  dirt: {
    type: 'dirt',
    moveCost: 5,
    classes: ['i-dirt']
  },
  floor: {
    type: 'floor',
    moveCost: 2,
    classes: ['i-floor'],
  },
  brickRoad: {
    type: 'brickRoad',
    moveCost: 2,
    classes: ['i-brick-road'],
  }
};
