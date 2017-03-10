import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';

import { Characters } from '../../api/characters/characters.js'
import { Items } from '../../api/items/items.js'
import { Rooms } from '../../api/rooms/rooms.js'
import '../../api/rooms/methods.js'
import { Fights } from '../../api/fights/fights.js'
import '../../api/fights/methods.js'
import { Trades } from '../../api/trades/trades.js'
import '../../api/trades/methods.js'
import { Chats } from '../../api/chats/chats.js'
import '../../api/chats/methods.js'
import { Missions } from '../../api/missions/missions.js'
import '../../api/missions/methods.js'
import { Obstacles } from '../../api/obstacles/obstacles.js'
import { Buildings } from '../../api/buildings/buildings.js'
import '../../api/buildings/buildings.js'

import '../components/music.js';
import '../components/npcTalk.js';
import '../components/useLocation.js';
import '../components/chat.js';
import '../components/item.js';
import '../components/status-bars.js';
import '../components/misc-status.js';
import './game.html';

import { doorIsLocked, nextSpotXY } from '../../configs/locations.js';
import { doorAttackEnergyCost, getCharacter } from '../../configs/game.js';

Template.game.onCreated(function gameOnCreated() {
  var that = this;
  this.getGameId = () => FlowRouter.getParam('gameId');
  this.me = () => getCharacter(Meteor.userId(), that.getGameId(), Characters);
  this.getRoomId = () => Meteor.userId() && that.me() && that.me().location.roomId;
  this.subscribe('fights.own');
  this.subscribe('items.own');
  this.subscribe('missions.own', FlowRouter.getParam('gameId'));
  var myself = this.subscribe('characters.own');
  this.notification = new ReactiveVar(null);
  this.getMyNextSpace = function(){
    const character = that.me();
    const room = Rooms.findOne(character.location.roomId);
    if (!room) return false;
    const xy = nextSpotXY(character);
    return room.map[xy.y] && room.map[xy.y][xy.x];
  };

  this.autorun(() => {
    this.subscribe('game.rooms', this.getGameId());
    this.subscribe('trades.own', this.getGameId());
    if (myself.ready()) {
      this.subscribe('room.obstacles', this.getRoomId());
      this.subscribe('room.buildings', this.getRoomId());
      if (Characters.find().count() == 0 || that.me() == undefined) {
        FlowRouter.go('/');
      } else {
        this.subscribe('characters.room', this.getRoomId());
        this.subscribe('items.room', this.getRoomId());
        this.subscribe('chats.scope', "Rooms:"+this.getRoomId());
      }
    }
  })

  this.autorun(() => {
    if (Trades.find().count() > 0) {
      const trade = Trades.findOne();
      if (this.me() && trade.buyerId == this.me()._id) {
        this.notification.set({type:'good', message: "You have a trade offer", action: "View", actionPath: FlowRouter.path('game.trade', {gameId: this.getGameId(), tradeId: trade._id})});
        var that = this;
        Meteor.setTimeout(function(){
          that.notification.set(null);
          if (!FlowRouter.getRouteName().match("trade")) { // if they are on the trade page, then they obviously accepted it
            Meteor.call('trades.end', that.getGameId(), trade._id);
          }
        }, 9999); // have 10 seconds to open the trade or it expires
      }
    }
  })
})

Template.game.helpers({
  gameHTML : function(){
    var room, html, i, j, tile, pos, viewH, viewW, usr, drawX, drawY, s_x, s_y, users;

    viewH = 8; viewW = 12;// default height and width (in tiles) of the viewport
    drawX = 5; drawY = 3; // default place for the user's character to appear onscreen
    usr = Template.instance().me();
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

    const obstacles = Obstacles.find({'location.x': {$gte: s_x - 4, $lte: viewW+s_x }, 'location.y': {$gte: s_y - 4, $lte: viewH+s_y }});
    const buildings = Buildings.find({'location.x': {$gte: s_x - 4, $lte: viewW+s_x }, 'location.y': {$gte: s_y - 4, $lte: viewH+s_y }});

    // indexing by location for rendering speed-boost at cost of (slight) memory inefficiency
    let indexedObstacles = {};
    html = "";
    obstacles.forEach(function(obstacle){
      indexedObstacles[obstacle.location.x+":"+obstacle.location.y] = obstacle;

      if(obstacle.location.x < s_x || obstacle.location.y < s_y) {
        // need to render the shifted image
        html += "<div class='obstacle shift-x"+(obstacle.location.x - s_x)+" shift-y"+(obstacle.location.y - s_y)+" "+obstacle.imageClass()+"'></div>";
      }
    })

    let indexedBuildings = {};
    buildings.forEach(function(building){
      indexedBuildings[building.location.x+":"+building.location.y] = building;

      if(building.location.x < s_x || building.location.y < s_y) {
        // need to render the shifted image
        html += "<div class='obstacle shift-x"+(building.location.x - s_x)+" shift-y"+(building.location.y - s_y)+" "+building.imageClass()+"'></div>";
      }
    })

    for(i = 0; i < viewH; i++){
      html += "<div class='g-row'>";
      for (j = 0; j < viewW; j++){
        if (room.map[i+s_y] != undefined)
          tile = room.map[i+s_y][j+s_x]; // {type: "string", data: some_optional_data}
        else
          tile = undefined;

        var otherUser = _.find(users, function(user){return user.location.y == i+s_y && user.location.x == j+s_x;});
        var obstacle = indexedObstacles[(j+s_x)+":"+(i+s_y)];
        var building = indexedBuildings[(j+s_x)+":"+(i+s_y)];

        if (tile == undefined)
          html += "<div class='g-col i-blank'></div>";
        else {
          html += "<div class='g-col i-"+tile.type+"'>";
          if (obstacle)
            html += "<div class='obstacle "+obstacle.imageClass()+"'></div>";
          if (building)
            html += "<div class='obstacle "+building.imageClass()+"'></div>";
          if (j == drawX && i == drawY)
            html += "<div class='character mc i-"+(parseInt(usr.location.classId)+parseInt(usr.location.direction))+"'></div>";
          else if (otherUser) 
            html += "<div class='character i-"+(parseInt(otherUser.location.classId)+parseInt(otherUser.location.direction))+"'></div>";
          html += "</div>";
        }
      }
      html += "</div>";
    }
    return html;
  },
  opponentsToFight: function(){
    const uId = Meteor.userId();
    const character = Template.instance().me();
    if (!character) return null;
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
    const character = Template.instance().me();

    return Characters.find({'location.x': character.location.x, 'location.y': character.location.y, userId: { $ne: Meteor.userId() }});
  },
  opponentImage: function(opponent){
    return parseInt(opponent.location.classId)+parseInt(opponent.location.direction);
  },
  itemsHere: function(){
    const character = Template.instance().me();
    return Items.find({'location.x': character.location.x, 'location.y':character.location.y}).count() > 0;
  },
  items: function(){
    const character = Template.instance().me();
    return Items.find({'location.x': character.location.x, 'location.y':character.location.y});
  },
  resource: function(){
    const obstacle = Template.instance().me().getFacingObstacle(Obstacles);
    return obstacle && obstacle.data.resources;
  },
  resourceSource: function(){
    const obstacle = Template.instance().me().getFacingObstacle(Obstacles);
    return obstacle.typeObj().resourceSource;
  },
  resourceCollectionVerb: function(){
    const obstacle = Template.instance().me().getFacingObstacle(Obstacles);
    return obstacle.typeObj().resourceCollectionVerb;
  },
  character: function(){
    return Template.instance().me();
  },
  usableLocation: function(){
    const character = Template.instance().me();
    const obstacle = character.getFacingObstacle(Obstacles);
    if (!obstacle || !obstacle.data.use) return false;
    let useObj = obstacle.data.use;
    if (useObj.type == 'craft')
      useObj.path = FlowRouter.path('character.'+useObj.type, {characterId: character._id}, useObj.params);
    if (useObj.type == 'forge') {
      useObj.verb = "Forge";
      if (useObj.params.resource == 'hide')
        useObj.verb = "Tan";
    }
    return useObj;
  },
  usableBuilding: function(){
    const character = Template.instance().me();
    const building = character.getFacingBuilding(Buildings);
    if (!building) return false;
    return building.useObject();
  },
  notification: function(){
    return Template.instance().notification.get();
  },
  canTrade: function(character){
    return !opponent.monsterKey;
  },
  roomChat: function(){
    return Chats.findOne();
  },
  lockedDoor: function(){
    const character = Template.instance().me();
    const obstacle = character.getFacingObstacle(Obstacles);
    return obstacle && obstacle.isDoor() && doorIsLocked(obstacle, Template.instance().me()) && obstacle.data;
  },
  doorAttackEnergyCost: function(){return doorAttackEnergyCost;},
  nextSpaceAcceptsResources: function(){
    const obstacle = Template.instance().me().getFacingObstacle(Obstacles);
    if (obstacle && obstacle.data.buildingResources) {
      if (obstacle.isDoor()){
        if (obstacle.data.stats.hp <= 0) // which can only be built back up if it is destroyed.
          return obstacle.data.buildingResources;
        else
          return false;
      }
    }
    const building = Template.instance().me().getFacingBuilding(Buildings);
    if (building && building.underConstruction && building.data.buildingResources) {
      return building.data.buildingResources;
    }
    return false;
  },
  myResources: function(type){
    const character = Template.instance().me();
    return character.stats.resources[type] > 0 ? character.stats.resources[type] : false;
  },
  npc: function(){
    return Session.get('npcTalkingTo') && Characters.findOne(Session.get('npcTalkingTo'));
  },
  canFinishMission: function(character){
    const mission = Missions.findOne({'conditions.turnIn.characterId': character._id});
    if (mission && mission.passesConditionsToFinish(Template.instance().me()))
      return mission._id;
    return false;
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

Template.game.onDestroyed(function(){
  $('body').unbind('keypress');
});

var move = function(direction, search){
  var d = direction;
  var elem = $(search);
  return function(e){
    Meteor.call('characters.move', d);
    Session.set('npcTalkingTo', null);
  };
};

Template.game.events({

  'click .g-row:first' : move(1),
  'click .g-row:last' : move(2),
  'click .g-row>.g-col:last-child' : move(3),
  'click .g-row>.g-col:first-child' : move(4),

  'click button.fight': function(event, instance) {
    Meteor.call('fights.start', $(event.target).data('id'), function(error, result){
      if(error) return;
      FlowRouter.go('game.fight', {gameId: FlowRouter.getParam('gameId')});
    });
  },

  'click button.trade': function(event, instance) {
    Meteor.call('trades.start', FlowRouter.getParam('gameId'), $(event.target).data('id'), function(error, result){
      if(error) return;
      FlowRouter.go('game.trade', {gameId: FlowRouter.getParam('gameId'), tradeId: result});
    });
  },

  'click button.pick-up-item': function(event, instance) {
    Meteor.call('items.take', $(event.target).data('id'), FlowRouter.getParam('gameId'), handleNotification(instance));
  },

  'click button.collect': function(event, instance){
    Meteor.call('rooms.collect', FlowRouter.getParam('gameId'), handleNotification(instance));
  },

  'click .locked-door a.break-down-door': function(event, instance) {
    Meteor.call('rooms.attackDoor', instance.me()._id);
  },

  'click .build-in-progress a.add-resources': function(event, instance) {
    Meteor.call('rooms.build', instance.me()._id, $(event.currentTarget).data('type'));
  },

  'click a.use-space': function(event, instance) {
    Meteor.call($(event.currentTarget).data('action'), FlowRouter.getParam('gameId'), handleNotification(instance));
  },

  'click a.talk-to-npc': function(e, instance){
    Session.set('npcTalkingTo', $(e.target).attr('data-id'));
  },

  'click a.finish-mission': function(e, instance){
    Meteor.call('missions.finish', FlowRouter.getParam('gameId'), $(e.target).attr('data-id'));
  },
});

function handleNotification(instance) {
  return function(error, result){
    if(error) {
      instance.notification.set({type:'error', message: error.reason});
      Meteor.setTimeout(function(){
        instance.notification.set(null);
      }, 7777);
    }
    if (result) {
      if (result.message) {
        instance.notification.set({type:'good', message: result.message});
        Meteor.setTimeout(function(){
          instance.notification.set(null);
        }, 7777);
      }
    }
  }
}
