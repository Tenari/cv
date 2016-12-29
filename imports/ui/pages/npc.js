import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveVar } from 'meteor/reactive-var';

import { Characters } from '../../api/characters/characters.js'
import { Items } from '../../api/items/items.js'
import { Rooms } from '../../api/rooms/rooms.js'

import './npc.html';

import { npcConfig } from '../../configs/ai.js';
import { resourceConfig, getCharacter } from '../../configs/game.js';

Template.npc.onCreated(function gameOnCreated() {
  var that = this;
  this.getGameId = () => FlowRouter.getParam('gameId');
  this.me = () => getCharacter(Meteor.userId(), that.getGameId(), Characters);
  this.getRoomId = () => Meteor.userId() && that.me() && that.me().location.roomId;
  this.subscribe('items.own');
  var myself = this.subscribe('characters.own');
  this.dialog = new ReactiveVar(null);
  this.tab = new ReactiveVar(null);
  this.tradeResource = new ReactiveVar(null);

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
          this.dialog.set(npcConfig[npc.npcKey].dialog);
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
  dialog(){
    return Template.instance().dialog.get();
  },
  encode(obj){
    return JSON.stringify(obj);
  },
  tab(key){
    return Template.instance().tab.get() == key;
  },
  items(){
    return [];
  },
  resources(){
    const npc = Characters.findOne(FlowRouter.getParam('npcId'));
    return _.map(resourceConfig, function(obj, key){
      obj.amount = npc.stats.resources[key];
      return obj;
    });
  },
  tradeResource(key){
    return Template.instance().tradeResource.get() == key;
  }
})

Template.npc.events({
  'click li.response-option'(e, instance){
    const option = JSON.parse($(e.currentTarget).attr('data-option'));
    const action = option.action;
    if (action == 'dialog') {
      instance.dialog.set(option.dialog);
    } else if (action == 'cancel') {
      instance.dialog.set(npcConfig[Characters.findOne(FlowRouter.getParam('npcId')).npcKey].dialog);
    } else if (action == 'npc trade') {
      instance.dialog.set({trade: true});
      instance.tab.set('items');
    } else if (action == 'trade') {
      const type = $('.resource-trade-type').val();
      const amount = $('.resource-trade-amount').val();
      const money = {
        type: 'money',
        amount: amount * resourceConfig[instance.tradeResource.get()].cost,
      };
      const resource = {
        type: 'resource',
        resource: instance.tradeResource.get(),
        amount: amount,
      };
      var giving = money, getting = resource;
      if (type == 'sell') {
        giving = resource; getting = money;
      }
      Meteor.call('characters.trade', instance.me()._id, FlowRouter.getParam('npcId'), giving, getting, function (){
        instance.dialog.set({trade: true});
      })
    }
  },
  'click .tab-container .tab'(e, instance){
    instance.tab.set($(e.currentTarget).data('tab'));
  },
  'click .tab-displays .trade-resource'(e, instance){
    instance.tradeResource.set($(e.currentTarget).data('resource'));
  },
})
