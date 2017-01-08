// the map of all traversable tile types and their base move cost
export const moveCosts = {
  grass: 8,
  door: 1,
  mat: 1,
  floor: 2,
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

export function moveCost(character, weight, terrain) {
  return Math.max( 1, Math.round( (moveCosts[terrain] || 10) * (2 * weight / character.maxWeight()) ) );
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

export function doorIsLocked(nextSpot, character){
  let locked = false;
  if (nextSpot.data && nextSpot.data.lock && nextSpot.stats.hp > 0) {
    if (nextSpot.data.lock.type == doorConfig.lockTypes.none) return true;

    if (nextSpot.data.lock.type == doorConfig.lockTypes.all) return false;

    if (nextSpot.data.lock.type == doorConfig.lockTypes.team) {
      return nextSpot.data.lock.team != character.team;
    }
  }
  return locked;
}

// objects representing individual tiles which you can _.clone() into a room.map
export const treeStumpTile = {type: "tree-stump"};
export const treeTile = {type: "tree", resources: {type: "wood", amount: 10}};
export const tiles = {
  treeStump: treeStumpTile,
  tree: treeTile,
  grass: {type: 'grass'},
  'workbench-left': {type: "workbench-left", use:{name:"Wood-working bench",type:"craft",params:{resource:"wood"}}},
  'workbench-right': {type: "workbench-right", use:{name:"Wood-working bench",type:"craft",params:{resource:"wood"}}},
  door: {type: 'door', data: {x: 0, y: 0, name: 'rome', lock: {type: doorConfig.lockTypes.none}}, stats: doorConfig.stats, buildingResources: doorConfig.buildingResources},
  mat: {type: 'mat', data: {x: 0, y: 0, name: 'rome'}},
  'vertical-path': {type: 'vertical-path'},
  'hz-path': {type: 'hz-path'},
  'path-inv-T': {type: 'path-inv-T'},
  'path-plus': {type: 'path-plus'},
  'path-T': {type: 'path-T'},
  'hz-fence': {type: 'hz-fence'},
  'vt-fence': {type: 'vt-fence'},
  'floor': {type: 'floor'},
  'bar': {type: 'bar'},
  'full-building-wall': {type: 'full-building-wall'},
  'fence-horizontal': {type: 'fence-horizontal'},
  'fence-vertical': {type: 'fence-vertical'},
  'fence-bottom-left-corner': {type: 'fence-bottom-left-corner'},
  'fence-bottom-right-corner': {type: 'fence-bottom-right-corner'},
  'fence-top-left-corner': {type: 'fence-top-left-corner'},
  'fence-top-right-corner': {type: 'fence-top-right-corner'},
  'fence-sign': {type: 'fence-sign', use: {message: 'Buy this parcel of land?', verb: "Buy", cost: 100, action: "rooms.buy"}, dimensions: {topLeft:{x:1,y:0},bottomRight:{x:3, y:2}}},
};
