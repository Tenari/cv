// the map of all traversable tile types and their base move cost
export const moveCosts = {
  grass: 8,
  door: 1,
  mat: 1,
  "tree-stump": 14,
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

export function maxWeight(character) {
  // with endurance of 100, you can carry 200
  // with endurance of 1, you can carry 20
  // ish
  return 40*Math.log(character.stats.endurance) + 20;
}

export function moveCost(character, weight, terrain) {
  return Math.max( 1, Math.round( (moveCosts[terrain] || 10) * (2 * weight / maxWeight(character)) ) );
}


// objects representing individual tiles which you can _.clone() into a room.map
export const treeStumpTile = {type: "tree-stump"};
export const treeTile = {type: "tree", resources: {type: "wood", amount: 10}};