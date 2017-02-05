import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { Characters } from '../../api/characters/characters.js'
import { Rooms } from '../../api/rooms/rooms.js'
import { Obstacles } from '../../api/obstacles/obstacles.js'
import { moveCost } from '../../configs/locations.js'; 

import './misc-status.html';

Template.miscStatus.helpers({
  moveCost() {
    const weight = this.carriedWeight();
    const room = Rooms.findOne(this.location.roomId);
    if(!room) return 0;

    const terrain = room.map[this.location.y][this.location.x].type;
    const obstacle = this.getCurrentTileObstacle(Obstacles);
    return moveCost(this, weight, terrain, obstacle);
  },
  roomName() {
    const room = Rooms.findOne(this.location.roomId);
    return room && room.name;
  }
});
