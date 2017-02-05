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
  treeStump: {
    key: 'treeStump',
    passable: true,
    moveCost: 6,
    image: '/images/oaktree1cut.png',
    imageClass: 'i-oaktree1cut',
  },
  door: {
    key: 'door',
    passable: true,
    imageClass: 'i-door',
    isDoor: true,
  },
};
