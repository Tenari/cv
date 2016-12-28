import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveVar } from 'meteor/reactive-var';

import { Characters } from '../../api/characters/characters.js'
import { Items } from '../../api/items/items.js'
import { Rooms } from '../../api/rooms/rooms.js'

import './npc.html';

import { npcConfig } from '../../configs/ai.js';
import { getCharacter } from '../../configs/game.js';

Template.npc.onCreated(function gameOnCreated() {
  var that = this;
  this.getGameId = () => FlowRouter.getParam('gameId');
  this.me = () => getCharacter(Meteor.userId(), that.getGameId(), Characters);
  this.getRoomId = () => Meteor.userId() && that.me() && that.me().location.roomId;
  this.subscribe('items.own');
  var myself = this.subscribe('characters.own');
  this.notification = new ReactiveVar(null);

  this.autorun(() => {
    this.subscribe('game.rooms', this.getGameId());
    if (myself.ready()) {
      if (Characters.find().count() == 0) {
        FlowRouter.go('/');
      } else {
        if (this.subscribe('characters.room', this.getRoomId()).ready()) {
          const myLocation = this.me().location;
          var npc = Characters.findOne({
            _id: FlowRouter.getParam('npcId'),
            npc: true,
            'location.x': myLocation.x,
            'location.y': myLocation.y,
          });
          if(!npc) FlowRouter.go('/'); // must be on the same space as npc to stay on this page.
        }
      }
    }
  })
})

Template.npc.helpers({
  npc() {
    return Characters.findOne(FlowRouter.getParam('npcId'));
  },
  image(){
    const npc = Characters.findOne(FlowRouter.getParam('npcId'))
    return npc && npc.location.classId + 2;
  },
})
