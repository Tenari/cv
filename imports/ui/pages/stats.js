import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import { Characters } from '../../api/characters/characters.js'
import { Items } from '../../api/items/items.js'
import { Rooms } from '../../api/rooms/rooms.js'
import { Buildings } from '../../api/buildings/buildings.js'

import '../../api/items/methods.js'; 
import { statDescriptions } from '../../configs/game.js'; 
import { equipSlots } from '../../configs/items.js'; 
import { buildingConfig } from '../../configs/buildings.js'; 

import '../components/item.js';
import '../components/status-bars.js';
import '../components/misc-status.js';
import './stats.html';

Template.stats.onCreated(function gameOnCreated() {
  this.subscribe('game.rooms', FlowRouter.getParam('gameId'));
  this.subscribe('characters.own');
  this.subscribe('items.own');
  this.subscribe('buildings.own', FlowRouter.getParam('gameId'));
  this.state = new ReactiveDict();
  this.state.setDefault({
    page: 'Skills',
    item: null,
    stat: null,
    dropping: {},
    building: null,
    buildingMenu: 'description',
  });

  this.autorun(() => {
    if (this.subscriptionsReady()) {
      if (Characters.find().count() == 0)
        FlowRouter.go('/');
    }
  })
})

Template.stats.helpers({
  character : function(){
    return Characters.findOne({userId: Meteor.userId()});
  },

  page: function(key) {
    return Template.instance().state.get('page') == key ? 'active' : false;
  },

  decimal(stat){
    return stat.toFixed(2);
  },

  items(){
    return Items.find();
  },

  selectedItem(){
    return Items.findOne(Template.instance().state.get('item'));
  },

  itemDescription(){
    const item = Items.findOne(Template.instance().state.get('item'));
    if (item.effectType() == 'stats.hp') {
     return 'Increases your HP by '+ item.effectAmount() +' on use. Is consumed in the process.';
    }
    return false;
  },

  itemSelectedClass(item){
    const stateItem = Template.instance().state.get('item');
    return stateItem && item._id == stateItem ? 'selected' : '';
  },

  equippedRightHand(){
    return _.find(Items.find({equipped: true}).fetch(), function(item){ return item.equipSlot() == equipSlots.hand});
  },

  equippedLeftHand(){
    return _.filter(Items.find({equipped: true}).fetch(), function(item){ return item.equipSlot() == equipSlots.hand})[1];
  },

  equippedHead(){
    return _.find(Items.find({equipped: true}).fetch(), function(item){ return item.equipSlot() == equipSlots.head});
  },

  equippedChest(){
    return _.find(Items.find({equipped: true}).fetch(), function(item){ return item.equipSlot() == equipSlots.chest});
  },

  equippedLegs(){
    return _.find(Items.find({equipped: true}).fetch(), function(item){ return item.equipSlot() == equipSlots.legs});
  },

  selectedStat(){
    if (Template.instance().state.get('page') != 'Skills') return false;
    var fullStatKey = Template.instance().state.get('stat');
    if (fullStatKey == null) return false;
    let category = fullStatKey.split(".")[0];
    let specific = fullStatKey.split(".")[1];
    if (!specific) {
      specific = category;
      category = 'fighting';
    }
    return statDescriptions[category][specific];
  },

  droppingResource(resource) {
    return Template.instance().state.get('dropping')[resource];
  },

  hasBuilding(){
    return Buildings.find().count() > 0;
  },

  buildings(){
    return Buildings.find();
  },

  selectedBuilding() {
    const bId = Template.instance().state.get('building');
    return bId && Buildings.findOne(bId);
  },

  buildingMenu(menuKey){
    return Template.instance().state.get('buildingMenu') == menuKey;
  },

  buildingTypes() {
    return _.values(buildingConfig);
  }
});

Template.stats.events({
  'click .tab-links>a'(e, instance) {
    instance.state.set('page', $(e.target).data('page'));
    instance.state.set('item', false);
  },
  'click .items-display-container>div>.item'(e, instance){
    instance.state.set('item', instance.state.get('item') ? false : $(e.currentTarget).data('id'));
  },
  'click .item-actions>.action'(e, instance){
    const action = $(e.currentTarget).data('action');
    const itemId = $(e.currentTarget).data('id');
    Meteor.call('items.'+action, itemId);
    instance.state.set('item', false);
  },
  'click .right-arm-box>img'(e, instance){
    const item = Items.findOne({equipped: true, equipSlot: equipSlots.hand});
    if (item) 
      Meteor.call('items.unequip', item._id);
  },
  'click .left-arm-box>img'(e, instance){
    const item = Items.find({equipped: true, equipSlot: equipSlots.hand}).fetch()[1];
    if (item) 
      Meteor.call('items.unequip', item._id);
  },
  'click .head-box>img'(e, instance){
    const item = Items.findOne({equipped: true, equipSlot: equipSlots.head});
    if (item) 
      Meteor.call('items.unequip', item._id);
  },
  'click .chest-box>img'(e, instance){
    const item = Items.findOne({equipped: true, equipSlot: equipSlots.chest});
    if (item) 
      Meteor.call('items.unequip', item._id);
  },
  'click .legs-box>img'(e, instance){
    const item = Items.findOne({equipped: true, equipSlot: equipSlots.legs});
    if (item) 
      Meteor.call('items.unequip', item._id);
  },
  'mouseenter .skills-display-container>li'(e, instance){
    instance.state.set('stat', $(e.currentTarget).data('stat'));
  },
  'click a.drop'(e, instance){
    const resource = $(e.currentTarget).data('resource');
    let dropping = instance.state.get('dropping');
    if(dropping[resource]) {
      const amount = $(e.currentTarget).closest('li').find('input.drop-resource-amount').val();
      Meteor.call('characters.dropResource', FlowRouter.getParam('gameId'), resource, amount);
      dropping[resource] = false;
    } else {
      dropping[resource] = true;
    }
    instance.state.set('dropping', dropping);
  },
  'click div.building-card'(event, instance) {
    instance.state.set('building', $(event.currentTarget).data('id'));
  },
  'click .building-actions-menu .action-menu'(event, instance){
    instance.state.set('buildingMenu', $(event.currentTarget).data('menu'));
  }
})
