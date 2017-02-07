export const obstaclesConfig = {
  tree: {
    key: 'tree',
    passable: false,
    image: '/images/oaktree1.png',
    imageClass: 'i-oaktree1',
    insertEmptyVersion: function(obstacle, Obstacles){
      Obstacles.insert({
        location: obstacle.location,
        type: 'treeStump',
        data: {},
      })
    }
  },
  tree2: {
    key: 'tree2',
    passable: false,
    image: '/images/oaktree2.png',
    imageClass: 'i-oaktree2',
    insertEmptyVersion: function(obstacle, Obstacles){
      Obstacles.insert({
        location: obstacle.location,
        type: 'treeStump2',
        data: {},
      })
    }
  },
  tree3: {
    key: 'tree3',
    passable: false,
    image: '/images/oaktree3.png',
    imageClass: 'i-oaktree3',
    insertEmptyVersion: function(obstacle, Obstacles){
      Obstacles.insert({
        location: obstacle.location,
        type: 'treeStump3',
        data: {},
      })
    }
  },
  treeStump: {
    key: 'treeStump',
    passable: true,
    moveCost: 6,
    image: '/images/oaktree1cut.png',
    imageClass: 'i-oaktree1cut',
  },
  treeStump2: {
    key: 'treeStump2',
    passable: true,
    moveCost: 6,
    image: '/images/oaktree2cut.png',
    imageClass: 'i-oaktree2cut',
  },
  treeStump3: {
    key: 'treeStump3',
    passable: true,
    moveCost: 6,
    image: '/images/oaktree3cut.png',
    imageClass: 'i-oaktree3cut',
  },
  door: {
    key: 'door',
    passable: true,
    imageClass: 'i-door',
    isDoor: true,
  },
  mat: {
    key: 'mat',
    passable: true,
    imageClass: 'i-mat',
    isDoor: true,
  },
  workbench: {
    key: 'workbench',
    passable: false,
    imageClass: 'obstacle-2x1 i-workbench',
    width: 2,
    //"use":{"name":"Wood-working bench","type":"craft","params":{"resource":"wood"}}
  },
};
