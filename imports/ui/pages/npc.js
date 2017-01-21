import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveVar } from 'meteor/reactive-var';

import { Characters } from '../../api/characters/characters.js'
import { Items } from '../../api/items/items.js'
import { Rooms } from '../../api/rooms/rooms.js'

import './npc.html';
import '../components/item.js';

import { npcConfig } from '../../configs/ai.js';
import { itemConfigs } from '../../configs/items.js';
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
  this.item = new ReactiveVar(null);
  this.playerItem = new ReactiveVar(null);

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
          if (!this.tab.get()) {
            this.dialog.set({trade: true});
            this.tab.set('items');
          }
          this.subscribe('items.character', FlowRouter.getParam('npcId'));
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
  tab(key){
    return Template.instance().tab.get() == key ? 'selected' : false;
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
  },
  items(){
    return _.map(Items.find({ownerId: FlowRouter.getParam('npcId')}).fetch(), function(item){
      item.price = parseInt(itemConfigs[item.type][item.key].npcSellFactor * item.condition);
      return item;
    });
  },
  itemSelectedClass(item){
    const stateItem = Template.instance().item.get();
    return stateItem && item._id == stateItem ? 'selected' : '';
  },
  selectedItem(){
    return Template.instance().item.get();
  },
  playerItems(){
    return _.map(Items.find({ownerId: Template.instance().me()._id}).fetch(), function(item){
      item.price = parseInt(itemConfigs[item.type][item.key].npcBuyFactor * (item.condition || 100));
      return item;
    });
  },
  playerItemSelectedClass(item){
    const stateItem = Template.instance().playerItem.get();
    return stateItem && item._id == stateItem ? 'selected' : '';
  },
  playerSelectedItem(){
    return Template.instance().playerItem.get();
  },
  player(){
    return Template.instance().me();
  },
  playerImage(){
    const player = Template.instance().me();
    return player && player.location.classId + 2;
  },
})

Template.npc.events({
  'click li.response-option'(e, instance){
    const option = JSON.parse($(e.currentTarget).attr('data-option'));
    const action = option.action;
    if (action == 'cancel') {
      FlowRouter.go('/game/'+FlowRouter.getParam('gameId')+"/world");
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
    } else if (action == 'buy item') {
      const item = Items.findOne(instance.item.get());
      const price = parseInt(itemConfigs[item.type][item.key].npcSellFactor * (item.condition || 100));
      Meteor.call('characters.trade', instance.me()._id, FlowRouter.getParam('npcId'), {type: 'money', amount: price}, {type: 'item', itemId: item._id}, function (){
        instance.dialog.set({trade: true});
        instance.playerItem.set(false);
        instance.item.set(false);
      })
    } else if (action == 'sell item') {
      const item = Items.findOne(instance.playerItem.get());
      const price = parseInt(itemConfigs[item.type][item.key].npcBuyFactor * (item.condition || 100));
      Meteor.call('characters.trade', instance.me()._id, FlowRouter.getParam('npcId'), {type: 'item', itemId: item._id}, {type: 'money', amount: price}, function (){
        instance.dialog.set({trade: true});
        instance.playerItem.set(false);
        instance.item.set(false);
      })
    }
  },
  'click .tab-container .tab'(e, instance){
    instance.tab.set($(e.currentTarget).data('tab'));
  },
  'click .tab-displays .trade-resource'(e, instance){
    instance.tradeResource.set($(e.currentTarget).data('resource'));
  },
  'click .tab-displays .npc-items .item'(e, instance){
    instance.playerItem.set(false);
    if (instance.item.get()) {
      instance.item.set(false);
    } else {
      instance.item.set($(e.currentTarget).data('id'));
    }
  },
  'click .tab-displays .player-items .item'(e, instance){
    instance.item.set(false);
    if (instance.playerItem.get()) {
      instance.playerItem.set(false);
    } else {
      instance.playerItem.set($(e.currentTarget).data('id'));
    }
  },
})
