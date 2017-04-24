import { EJSON } from 'meteor/ejson';
import { moveCharacter } from '../api/characters/methods.js';
import { itemConfigs } from './items.js';
import { directionToAFromB, nextSpotXY, terrain } from './locations.js';

import { Games } from '../api/games/games.js';
import { Rooms } from '../api/rooms/rooms.js';
import { Items } from '../api/items/items.js';
import { Characters } from '../api/characters/characters.js';
import { Obstacles } from '../api/obstacles/obstacles.js';
import { Buildings } from '../api/buildings/buildings.js';

export const aiTeam = 'nature';

export const npcConfig = {
  romanBartender: {
    key: 'romanBartender',
    team: 'romans',
    name: 'Bartender',
    classId: 50,
    defaultStats: {
      money: 10000,
      resources: {
      }
    },
    dialog: {
      "text": "Welcome to my pub. How can I help you?",
      "options": [
        {
          "option": "Trade",
          "action": "npc trade"
        }
      ]
    },
    items: [
      {key: 'beer', type: 'consumable'},
      {key: 'beer', type: 'consumable'},
      {key: 'beer', type: 'consumable'},
      {key: 'beer', type: 'consumable'},
      {key: 'beer', type: 'consumable'},
    ],
    act: function(npc, Items){
      const myBeers = Items.find({key: 'beer', ownerId: npc._id}).count();
      if (myBeers < 5) {
        Items.insert({key: 'beer', type: 'consumable', ownerId: npc._id, condition: 100});
      }
    },
  },
  japaneseBartender: {
    key: 'japaneseBartender',
    team: 'japs',
    name: 'Bartender',
    classId: 55,
    defaultStats: {
      money: 10000,
      resources: {
      }
    },
    dialog: {
      "text": "Welcome to my pub. How can I help you?",
      "options": [
        {
          "option": "Trade",
          "action": "npc trade"
        }
      ]
    },
    items: [
      {key: 'beer', type: 'consumable'},
      {key: 'beer', type: 'consumable'},
      {key: 'beer', type: 'consumable'},
      {key: 'beer', type: 'consumable'},
      {key: 'beer', type: 'consumable'},
    ],
    act: function(npc, Items){
      const myBeers = Items.find({key: 'beer', ownerId: npc._id}).count();
      if (myBeers < 5) {
        Items.insert({key: 'beer', type: 'consumable', ownerId: npc._id, condition: 100});
      }
    },
  },
  marcoPolo: {
    key: 'marcoPolo',
    team: 'romans',
    name: 'Marco Polo',
    classId: 25,
    defaultStats: {
      money: 10000,
      resources: {
        leather: 5,
        metal: 5,
      }
    },
    dialog: {
      "text": "Hi! My name is Marco Polo. How can I help you?",
      "options": [
        {
          "option": "Trade",
          "action": "npc trade"
        },
        {
          "option": "Help",
          "action": "dialog",
          "dialog": {
            "text": "What do you need help with?",
            "options": [
              {
                "option": "Fighting",
                "action": "dialog",
                "dialog": {
                  "text": "To fight someone, simply stand on the same space as them, and click the fight button next to their name.",
                  "options": [
                    {
                      "option": "OK",
                      "action": "cancel"
                    }
                  ]
                }
              },
              {
                "option": "Trading",
                "action": "dialog",
                "dialog": {
                  "text": "To trade with someone, simply stand on the same space as them, and click the trade button next to their name.",
                  "options": [
                    {
                      "option": "OK",
                      "action": "cancel"
                    }
                  ]
                }
              }
            ]
          }
        }
      ]
    },
  },
  genericRomanTownsPerson: {
    key: 'genericRomanTownsPerson',
    team: 'romans',
    name: function(){
      switch(_.random(1,4)){
        case 1:
          return "Albus Aelius";
        case 2:
          return "Fabius Drusus";
        case 3:
          return "Felix Flavius";
        case 4:
        default:
          return "Laelius Livius";
      }
    },
    classId: 40,
    defaultStats: function(){
      switch(_.random(1,4)){
        case 1:
          return {
            money: 200,
            resources: {
              leather: 1
            }
          };
        case 2:
          return {
            money: 100,
            resources: {
              leather: 2
            }
          };
        case 3:
          return {
            money: 50,
            resources: {
              wood: 1
            }
          };
        case 4:
        default:
          return {
            money: 150,
            resources: {
              metal: 1
            }
          };
      }
    },
    dialog: {
      "text": "Hail, friend. What do you need?",
      "options": [
        {
          "option": "Trade",
          "action": "npc trade"
        },
        {
          "option": "I need a job",
          "action": "dialog",
          "dialog": {
            "text": "Don't we all. If you could bring me some wood, I'd pay you for it.",
            "options": [
              {
                "option": "OK",
                "action": "cancel"
              }
            ]
          }
        }
      ]
    },
    act: genericTownsPersonAct,
  },
  genericJapaneseTownsPerson: {
    key: 'genericJapaneseTownsPerson',
    team: 'japs',
    name: function(){
      switch(_.random(1,4)){
        case 1:
          return "Bunta";
        case 2:
          return "Akira";
        case 3:
          return "Daichi";
        case 4:
        default:
          return "Hayato";
      }
    },
    classId: 45,
    defaultStats: function(){
      switch(_.random(1,4)){
        case 1:
          return {
            money: 200,
            resources: {
              leather: 1
            }
          };
        case 2:
          return {
            money: 100,
            resources: {
              leather: 2
            }
          };
        case 3:
          return {
            money: 50,
            resources: {
              wood: 1
            }
          };
        case 4:
        default:
          return {
            money: 150,
            resources: {
              metal: 1
            }
          };
      }
    },
    dialog: {
      "text": "Greetings, sir. What do you need?",
      "options": [
        {
          "option": "Trade",
          "action": "npc trade"
        },
        {
          "option": "I need a job",
          "action": "dialog",
          "dialog": {
            "text": "Don't we all. If you could bring me some wood, I'd pay you for it.",
            "options": [
              {
                "option": "OK",
                "action": "cancel"
              }
            ]
          }
        }
      ]
    },
    act: genericTownsPersonAct,
  }
}

function genericTownsPersonAct(npc, Items, Rooms, Obstacles, Buildings, Characters) {
  const room = Rooms.findOne(npc.location.roomId);
  const otherCharacter = Characters.findOne({_id: {$ne: npc._id}, userId: {$exists: true}, 'location.x': npc.location.x, 'location.y': npc.location.y, 'location.roomId': room._id});
  if (otherCharacter) return false;
  if (room.name.split(":")[0] == 'house') {
    const obstacles = Obstacles.find({'location.roomId':room._id}).fetch();
    const buildings = Buildings.find({'location.roomId':room._id}).fetch();
    paceMoveAlgorithm({x:1,y:1},{x:2, y:4}, npc, room, obstacles, buildings);
  } else {
    followRoadsDontGoThroughDoors(npc, room, Obstacles, Buildings);
  }
}

function followRoadsDontGoThroughDoors(character, room, Obstacles, Buildings) {
  const obstacle = character.getFacingObstacle(Obstacles);
  const building = character.getFacingBuilding(Buildings);
  if (obstacle || building) { // never walk into an obstacle or a building
    moveCharacter(character, ((character.location.direction + 1) % 4) || 4); // this just spins the character
  } else {
    const xy = nextSpotXY(character);
    const tile = room.map[xy.y] && room.map[xy.y][xy.x];
    if (tile && tile.type && tile.type == terrain.road.type) { // nextSpot is a road of some kind
      moveCharacter(character, character.location.direction); // go forward
    } else {
      moveCharacter(character, ((character.location.direction + 1) % 4) || 4); // this just spins the character
    }
  }
  
}

function paceMoveAlgorithm(pointA, pointB, character, room, obstacles, buildings){
  if (Date.now() % 100000 > 50000) { // go to point A for 50 seconds
    moveToLocationViaAStar(character, pointA, room, obstacles, buildings);
  } else {  // go to point B for 50 seconds
    moveToLocationViaAStar(character, pointB, room, obstacles, buildings);
  }
}

function moveToLocationViaAStar(character, targetXY, room, obstacles, buildings) {
  let aStarResults = aStar(character, targetXY, room, obstacles, buildings)
  let last = aStarResults.finalNode;
  while (last && last.previous && last.previous.previous) {
    last = last.previous;
  }
  if (directionToAFromB(character.location, last))
    moveCharacter(character, directionToAFromB(character.location, last));
}

export function importRoomNpcs(roomDefinition, roomId, gameId, Characters, Items) {
  _.each(roomDefinition.npcs, function(npc){
    var name, defaultStats;
    if (npcConfig[npc.type] && typeof npcConfig[npc.type].name === 'function') {
      name = npcConfig[npc.type].name();
    } else {
      name = npcConfig[npc.type].name;
    }

    if (npcConfig[npc.type] && typeof npcConfig[npc.type].defaultStats === 'function') {
      defaultStats = npcConfig[npc.type].defaultStats();
    } else {
      defaultStats = npcConfig[npc.type].defaultStats;
    }
    const npcId = Characters.insert({
      gameId: gameId,
      name: name,
      team: npcConfig[npc.type].team,
      location: {
        x: npc.location.x,
        y: npc.location.y,
        direction: 2,
        classId: npcConfig[npc.type].classId,
        roomId: roomId,
      },
      npc: true,
      npcKey: npc.type,
      stats: defaultStats,
    })
    _.each(npc.items, function(item){
      Items.insert({key: item.key, type: item.type, ownerId: npcId, condition: 100});
    })
  })
}

function spinnyMoveAlgorithm(character){
  if (_.random(1,2) > 1) { // then just spin
    moveCharacter(character, ((character.location.direction + 1) % 4) || 4);
  } else {
    if (!(character.getFacingObstacle(Obstacles) || character.getFacingBuilding(Buildings))) {
      moveCharacter(character, character.location.direction);
    }
  }
  character.limitBounds();
}

function doNothingFightStrategy(fight, monster, Fights){
  // just maintains the current attack-mode and auto-readies
  let updateObj = {};
  if (fight.attackerId == monster._id) {
    updateObj.attackerReady = true;
  } else {
    updateObj.defenderReady = true;
  }
  Fights.update(fight._id, {$set: updateObj})
}

export function aStar(npc, targetXY, room, obstacles, buildings){
  let first = _.clone(npc.location);
  first.priority = 0;
  let open = [first];
  let costSoFar = {};
  costSoFar[npc.location.x+":"+npc.location.y] = 0
  while (open[0] && (open[0].x != targetXY.x || open[0].y != targetXY.y)) {
    open = _.sortBy(open, function(loc) {return loc.priority;});
    let current = open[0];
    if (current.x == targetXY.x && current.y == targetXY.y)
      break;
    open = _.rest(open);
    for (var i = -1; i < 2; i+= 1){
      for (var j = -1; j < 2; j+= 1){
        if (i == j) continue;
        if (i + j == 0) continue;
        let next = {x: current.x + i, y: current.y + j};
        const obstacle = _.find(obstacles, function(o){ return !o.passable() && o.location.x == next.x && o.location.y == next.y})
        const building = _.find(buildings, function(b){
          return _.find(b.locations(), function(loc){loc.x == next.x && loc.y == next.y });
        })
        if (room.map[next.y] && room.map[next.y][next.x] && !obstacle && !building) {
          let newCost = costSoFar[current.x+":"+current.y] + 1;
          if (!costSoFar[next.x+":"+next.y] || newCost < costSoFar[next.x+":"+next.y]) {
            costSoFar[next.x+":"+next.y] = newCost;
            next.priority = newCost + manhattanDistance(next, targetXY);
            next.previous = current;
            open.push(next);
          }
        }
      }
    }
  }
  // return first if open[0] is falsy because that means we could not find a path
  return {finalNode: open[0] || first, costs: costSoFar};
}

function manhattanDistance(start, goal){
  dx = Math.abs(start.x - goal.x);
  dy = Math.abs(start.y - goal.y);
  return dx + dy;
}

function chasePlayerMoveAlgorithm(monster, room, Characters, Obstacles, Buildings){
  if (monster.aiBounds) {
    const playerToChase = Characters.findOne({
      'location.roomId': monster.location.roomId,
      'location.x': {$gte: monster.aiBounds.topLeft.x, $lte: monster.aiBounds.bottomRight.x},
      'location.y': {$gte: monster.aiBounds.topLeft.y, $lte: monster.aiBounds.bottomRight.y},
      userId: {$exists: true},
    })
    if (playerToChase) {
      const targetXY = {x:playerToChase.location.x, y: playerToChase.location.y};
      const obstacles = Obstacles.find({'location.roomId':room._id}).fetch();
      const buildings = Buildings.find({'location.roomId':room._id}).fetch();
      moveToLocationViaAStar(monster, targetXY, room, obstacles, buildings);
    } else {
      moveCharacter(monster, _.random(1,4));
    }
    monster.limitBounds();
  }
}

export function aiSpawnLoop(){
  Games.find().forEach(function(game){
    _.each(game.rooms, function(roomName){
      var roomDefinition = EJSON.parse(Assets.getText(roomName+'.json'));
      const room = Rooms.findOne({gameId: game._id, name: roomName})
      if (!roomDefinition || !room) return false;
      _.each(roomDefinition.ai, function(ai, index){
        const monster = Characters.findOne({'location.roomId':room._id, team: aiTeam, monsterKey: ai.type, 'stats.hp': {$gt: 0}, aiIndex: index});
        if (!monster) {
          monsterConfig[ai.type].spawn(ai, index, room, Characters, Items);
        }
      })
    })
  });
}

export const monsterConfig = {
  bear: {
    key: 'bear',
    name: 'Grizzly bear',
    classId: 100,
    missionValue: 10,
    spawn: function (aiInit, index, room, Characters, Items){
      const location = {
        x: aiInit.location.x,
        y: aiInit.location.y,
        direction: 1,
        classId: monsterConfig.bear.classId,
        roomId: room._id,
        updatedAt: Date.now(),
      };
      const charId = Characters.insert({
        name: monsterConfig.bear.name,
        team: aiTeam,
        gameId: room.gameId,
        location: location,
        monsterKey: monsterConfig.bear.key,
        aiIndex: index,
        aiBounds: aiInit.bounds,
      });
      if (_.random(1,3) < 3) { // 2/3 times
        Items.insert({key: itemConfigs.consumable.bearMeat.key, type: itemConfigs.consumable.bearMeat.type, ownerId: charId})
      }
    },
    move: chasePlayerMoveAlgorithm,
    setFightStrategy: doNothingFightStrategy,
    createsCorpse: true,
  },
  squirrel: {
    key: 'squirrel',
    name: 'Measley squirrel',
    classId: 110,
    missionValue: 1,
    spawn: function (aiInit, index, room, Characters, Items){
      const createdLocation = {
        x: aiInit.location.x,
        y: aiInit.location.y,
        direction: 1,
        classId: monsterConfig.squirrel.classId,
        roomId: room._id,
        updatedAt: Date.now(),
      };
      const stats = {
        hp: 10,
        hpBase: 10,
      };
      const charId = Characters.insert({
        name: monsterConfig.squirrel.name,
        team: aiTeam,
        gameId: room.gameId,
        location: createdLocation,
        stats: stats,
        monsterKey: monsterConfig.squirrel.key,
        aiIndex: index,
        aiBounds: aiInit.bounds,
      });
      if (_.random(1,3) < 2) { // 1/3 times
        Items.insert({key: itemConfigs.consumable.squirrelMeat.key, type: itemConfigs.consumable.squirrelMeat.type, ownerId: charId})
      }
    },
    move: spinnyMoveAlgorithm,
    setFightStrategy: doNothingFightStrategy,
    createsCorpse: true,
  },
  fox: {
    key: 'fox',
    name: 'Fox',
    classId: 105,
    missionValue: 2,
    spawn: function (aiInit, index, room, Characters, Items){
      const createdLocation = {
        x: aiInit.location.x,
        y: aiInit.location.y,
        direction: 1,
        classId: monsterConfig.fox.classId,
        roomId: room._id,
        updatedAt: Date.now(),
      };
      const stats = {
        hp: 15,
        hpBase: 15,
      };
      const charId = Characters.insert({
        name: monsterConfig.fox.name,
        team: aiTeam,
        gameId: room.gameId,
        location: createdLocation,
        stats: stats,
        monsterKey: monsterConfig.fox.key,
        aiIndex: index,
        aiBounds: aiInit.bounds,
      });
      if (_.random(1,3) < 2) { // 1/3 times
        Items.insert({key: itemConfigs.consumable.foxMeat.key, type: itemConfigs.consumable.foxMeat.type, ownerId: charId})
      }
    },
    move: chasePlayerMoveAlgorithm,
    setFightStrategy: doNothingFightStrategy,
    createsCorpse: true,
  },
  wolf: {
    key: 'wolf',
    name: 'Wolf',
    classId: 120,
    missionValue: 4,
    spawn: function (aiInit, index, room, Characters, Items){
      const createdLocation = {
        x: aiInit.location.x,
        y: aiInit.location.y,
        direction: 1,
        classId: monsterConfig.wolf.classId,
        roomId: room._id,
        updatedAt: Date.now(),
      };
      const stats = {
        hp: 20,
        hpBase: 20,
      };
      const charId = Characters.insert({
        name: monsterConfig.wolf.name,
        team: aiTeam,
        gameId: room.gameId,
        location: createdLocation,
        stats: stats,
        monsterKey: monsterConfig.wolf.key,
        aiIndex: index,
        aiBounds: aiInit.bounds,
      });
      if (_.random(1,3) < 3) { // 2/3 times
        Items.insert({key: itemConfigs.consumable.wolfMeat.key, type: itemConfigs.consumable.wolfMeat.type, ownerId: charId})
      }
    },
    move: spinnyMoveAlgorithm,
    setFightStrategy: doNothingFightStrategy,
    createsCorpse: true,
  },
  easyPixies: {
    key: 'easyPixies',
    name: 'Nice Pixies',
    classId: 115,
    missionValue: 3,
    spawn: function (aiInit, index, room, Characters, Items){
      const createdLocation = {
        x: aiInit.location.x,
        y: aiInit.location.y,
        direction: 1,
        classId: monsterConfig.easyPixies.classId,
        roomId: room._id,
        updatedAt: Date.now(),
      };
      const stats = {
        hp: 18,
        hpBase: 18,
      };
      const charId = Characters.insert({
        name: monsterConfig.easyPixies.name,
        team: aiTeam,
        gameId: room.gameId,
        location: createdLocation,
        stats: stats,
        monsterKey: monsterConfig.easyPixies.key,
        aiIndex: index,
        aiBounds: aiInit.bounds,
      });
    },
    move: spinnyMoveAlgorithm,
    setFightStrategy: doNothingFightStrategy,
  },
  hardPixies: {
    key: 'hardPixies',
    name: 'Mean Pixies',
    classId: 125,
    missionValue: 6,
    spawn: function (aiInit, index, room, Characters, Items){
      const createdLocation = {
        x: aiInit.location.x,
        y: aiInit.location.y,
        direction: 1,
        classId: monsterConfig.hardPixies.classId,
        roomId: room._id,
        updatedAt: Date.now(),
      };
      const stats = {
        hp: 25,
        hpBase: 25,
      };
      const charId = Characters.insert({
        name: monsterConfig.hardPixies.name,
        team: aiTeam,
        gameId: room.gameId,
        location: createdLocation,
        stats: stats,
        monsterKey: monsterConfig.hardPixies.key,
        aiIndex: index,
        aiBounds: aiInit.bounds,
      });
    },
    move: spinnyMoveAlgorithm,
    setFightStrategy: doNothingFightStrategy,
  },
};
