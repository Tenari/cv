import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { Characters } from '../../api/characters/characters.js'
import { Items } from '../../api/items/items.js'
import { Rooms } from '../../api/rooms/rooms.js'
import { moveCost } from '../../configs/locations.js'; 
import { carriedWeight } from '../../configs/game.js'; 

import './misc-status.html';

Template.miscStatus.helpers({
  moveCost() {
    const weight = carriedWeight(this, Items);
    const room = Rooms.findOne(this.location.roomId);
    if(!room) return 0;

    const terrain = room.map[this.location.y][this.location.x].type;
    return moveCost(this, weight, terrain);
  }
});
