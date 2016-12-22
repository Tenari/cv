import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import { Characters } from '../../api/characters/characters.js'
import { Items } from '../../api/items/items.js'
import { Rooms } from '../../api/rooms/rooms.js'
import { Buildings } from '../../api/buildings/buildings.js'

import '../../api/items/methods.js'; 
import { teamCode, statDescriptions } from '../../configs/game.js'; 
import { equipSlots } from '../../configs/items.js'; 
import { buildingConfig } from '../../configs/buildings.js'; 
import { doorConfig } from '../../configs/locations.js'; 

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
    buildingTypeToCreate: null,
    buildingSellPrice: 100,
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
    return _.filter(_.values(buildingConfig), function(obj){return obj.key != buildingConfig.open.key});
  },

  buildingDemolishCost(){
    return buildingConfig.open.energyCost;
  },

  selectedBuildingTypeToCreate(key) {
    const type = Template.instance().state.get('buildingTypeToCreate');
    if (key)
      return type == key;
    else
      return type;
  },

  buildingConstructionProgress(){
    const building = Buildings.findOne(Template.instance().state.get('building'));
    const room = Rooms.findOne(building.roomId);
    return room.map[building.door.y][building.door.x].buildingResources;
  },

  doorConfig(){
    return doorConfig;
  },

  teams() {
    return _.keys(teamCode);
  },

  doorLockTypeSelected(key) {
    const building = Buildings.findOne(Template.instance().state.get('building'));
    return building.doorLockType(key) ? {selected:'selected'} : '';
  },

  doorLockTeamSelected(key) {
    const building = Buildings.findOne(Template.instance().state.get('building'));
    return building.doorLockTeam(key) ? {selected:'selected'} : '';
  },

  buildingSellPrice(){
    return Template.instance().state.get('buildingSellPrice');
  },
});

Template.stats.events({
  'click .tab-links>a'(e, instance) {
    instance.state.set('page', $(e.target).data('page'));
    instance.state.set('item', false);
    instance.state.set('building', null);
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
  'click .building-managment-menu .action-menu, click .building-actions-menu .action-menu'(event, instance){
    instance.state.set('buildingMenu', $(event.currentTarget).data('menu'));
  },
  'click .building-actions-menu .action'(e, instance){
    const action = $(e.currentTarget).data('action');
    const buildingId = $(e.currentTarget).data('id');
    const params = $(e.currentTarget).data('params');
    Meteor.call('buildings.'+action, FlowRouter.getParam('gameId'), buildingId, params, function(error, response){
      instance.state.set('buildingMenu', 'description');
    });
  },
  'click .building-managment-menu .demolish'(e, instance){
    const buildingId = Template.instance().state.get('building');
    Meteor.call('buildings.construct', FlowRouter.getParam('gameId'), buildingId, [buildingConfig.open.key], function(error, response){
      instance.state.set('buildingMenu', 'description');
    });
  },
  'click .building-info .building-type'(event, instance){
    instance.state.set('buildingTypeToCreate', $(event.currentTarget).data('key'));
  },
  'change .building-lock-setting, change .building-lock-setting-team'(event, instance){
    Meteor.call('buildings.lock', FlowRouter.getParam('gameId'), $('.building-lock-setting').data('id'), $('.building-lock-setting').val(), $('.building-lock-setting-team').val());
  },
  'change .building-managment-menu .sell-price'(e, instance){
    instance.state.set('buildingSellPrice', Math.abs(parseInt($(e.currentTarget).val()))); // cant be negative retards
  },
})
