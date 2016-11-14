import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Characters } from '../../api/characters/characters.js'
import { Items } from '../../api/items/items.js'
import { Rooms } from '../../api/rooms/rooms.js'
import '../../api/rooms/methods.js'
import { Fights } from '../../api/fights/fights.js'

import '../components/item.js';
import '../components/status-bars.js';
import '../components/misc-status.js';
import './game.html';

import { nextSpotXY } from '../../configs/locations.js';

Template.game.onCreated(function gameOnCreated() {
  this.getGameId = () => FlowRouter.getParam('gameId');
  this.getRoomId = () => Meteor.userId() && Characters.findOne({userId: Meteor.userId()}).location.roomId;
  this.subscribe('fights.own');
  this.subscribe('items.own');
  var myself = this.subscribe('characters.own');

  this.autorun(() => {
    this.subscribe('game.rooms', this.getGameId());
    if (myself.ready()) {
      if (Characters.find().count() == 0) {
        FlowRouter.go('/');
      } else {
        this.subscribe('characters.room', this.getRoomId());
        this.subscribe('items.room', this.getRoomId());
      }
    }
  })
})

Template.game.helpers({
  gameHTML : function(){
    var room, html, i, j, tile, pos, viewH, viewW, usr, drawX, drawY, s_x, s_y, users;

    viewH = 8; viewW = 12;// default height and width (in tiles) of the viewport
    drawX = 5; drawY = 3; // default place for the user's character to appear onscreen
    usr = Characters.findOne({userId: Meteor.userId()});
    if (usr == undefined || usr.location == undefined) return ""; // make sure we've got the user
    users = Characters.find({}).fetch(); // the only fuckers we have access to are in the same room b/c it's defined that way in the publish method, so dont need to check that here.

    room = Rooms.findOne(usr.location.roomId);
    if (!room) return "";

    // (s_x, s_y) represents (0,0) from character's point of view
    s_x = usr.location.x - drawX;
    s_y = usr.location.y - drawY;
    
    // However, we gotta do some edge detection:
    // normal (big) room cases
    // Check if too close to top edge.
    if (usr.location.y < 4) {
      drawY = usr.location.y;
      s_y = 0;
    }
    // Too close to bottom
    else if (usr.location.y > (room.height - 5)) { // minus 5 for 5 rows visible below.
      drawY = 8 - (room.height - usr.location.y); // 8 for number of rows shown.
      s_y = usr.location.y - drawY;
    }
    // Check if too close to left edge
    if (usr.location.x < 5) {
      s_x = 0;
      drawX = usr.location.x;
    }
    // right edge
    else if (usr.location.x > (room.width - 7)) {
      drawX = 12 - (room.width - usr.location.x); // 12 for number of cols in view
      s_x = usr.location.x - drawX;
    }
    // small room cases
    if (room.width < 13 && room.height < 9){
      drawX = usr.location.x;
      s_x = 0;
      drawY = usr.location.y;
      s_y = 0;
    } else if(room.width < 13){
      drawX = usr.location.x;
      s_x = 0;
    } else if(room.height < 9){
      drawY = usr.location.y;
      s_y = 0;
    }

    html = "";
    for(i = 0; i < viewH; i++){
      html += "<div class='g-row'>";
      for (j = 0; j < viewW; j++){
        if (room.map[i+s_y] != undefined)
          tile = room.map[i+s_y][j+s_x]; // {type: "string", data: some_optional_data}
        else
          tile = undefined;

        var otherUser = _.find(users, function(user){return user.location.y == i+s_y && user.location.x == j+s_x;});

        if (tile == undefined)
          html += "<div class='g-col i-blank'></div>";
        else if (j == drawX && i == drawY)
          html += "<div class='g-col i-"+tile.type+"'><div class='character mc i-"+(parseInt(usr.location.classId)+parseInt(usr.location.direction))+"'></div></div>";
        else if (otherUser) {
          html += "<div class='g-col i-"+tile.type+"'><div class='character i-"+(parseInt(otherUser.location.classId)+parseInt(otherUser.location.direction))+"'></div></div>";
        } else
          html += "<div class='g-col i-"+tile.type+"'></div>";
      }
      html += "</div>";
    }
    return html;
  },
  opponentsToFight: function(){
    const uId = Meteor.userId();
    const character = Characters.findOne({userId: uId});
    if (!character) return null;
//    var fights = Fights.find({$or: [{initiatorId: u._id}, {opponentId: u._id}]}).fetch();
//    return u && fights.length == 0 && getPotentialOpponent() != undefined;
    return Characters.find({'location.x': character.location.x, 'location.y': character.location.y, userId: { $ne: uId }}).count() > 0;
  },
  fighting: function(){
    return Fights.find().count() > 0;
  },
  amFighting: function(id) {
    const fight = Fights.findOne();
    return fight && (fight.attackerId == id || fight.defenderId == id);
  },
  opponents: function(){
    const character = Characters.findOne({userId: Meteor.userId()});

    return Characters.find({'location.x': character.location.x, 'location.y': character.location.y, userId: { $ne: Meteor.userId() }});
  },
  opponentImage: function(opponent){
    return parseInt(opponent.location.classId)+parseInt(opponent.location.direction);
  },
  itemsHere: function(){
    const character = Characters.findOne({userId: Meteor.userId()});
    return Items.find({'location.x': character.location.x, 'location.y':character.location.y}).count() > 0;
  },
  items: function(){
    const character = Characters.findOne({userId: Meteor.userId()});
    return Items.find({'location.x': character.location.x, 'location.y':character.location.y});
  },
  resource: function(){
    const character = Characters.findOne({userId: Meteor.userId(), gameId: FlowRouter.getParam('gameId')});
    const room = Rooms.findOne(character.location.roomId);
    if (!room) return false;
    const xy = nextSpotXY(character);
    const nextSpace = room.map[xy.y] && room.map[xy.y][xy.x];
    return nextSpace && nextSpace.resources;
  },
  resourceSource: function(){
    return "Tree";
  },
  resourceCollectionVerb: function(){
    return "Chop";
  },
  character: function(){
    return Characters.findOne({userId: Meteor.userId(), gameId: FlowRouter.getParam('gameId')});
  },
});

Template.game.rendered = function() {
  $('body').on('keypress', function(e){
    const character = Characters.findOne({userId: Meteor.userId()});
    if (character){
      if( Date.now() <= character.location.updatedAt + 300)
        return;
      if (e.charCode == 119 || e.charCode == 87) {        // 'W' pressed
        Meteor.call('characters.move', 1);
      } else if (e.charCode == 97 || e.charCode == 65) {  // 'A'
        Meteor.call('characters.move', 4);
      } else if (e.charCode == 115 || e.charCode == 83) { // 'S'
        Meteor.call('characters.move', 2);
      } else if (e.charCode == 100 || e.charCode == 68) { // 'D'
        Meteor.call('characters.move', 3);
      }
    }
  });
};

var move = function(direction, search){
  var d = direction;
  var elem = $(search);
  return function(e){
    Meteor.call('characters.move', d);
  };
};

Template.game.events({

  'click .g-row:first' : move(1),
  'click .g-row:last' : move(2),
  'click .g-row>.g-col:last-child' : move(3),
  'click .g-row>.g-col:first-child' : move(4),

  'click button.fight': function(event, template) {
    Meteor.call('fights.start', $(event.target).data('id'), function(error, result){
      if(error) return;
      FlowRouter.go('game.fight', {gameId: Characters.findOne({userId: Meteor.userId()}).gameId});
    });
  },

  'click button.pick-up-item': function(event, template) {
    Meteor.call('items.take', $(event.target).data('id'));
  },

  'click button.collect': function(){
    Meteor.call('rooms.collect', FlowRouter.getParam('gameId'));
  },
});
