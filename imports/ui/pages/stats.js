import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import { Characters } from '../../api/characters/characters.js'
import { Items } from '../../api/items/items.js'

import '../../api/items/methods.js'; 
import { equipSlots } from '../../configs/game.js'; 

import '../components/status-bars.js';
import './stats.html';

Template.stats.onCreated(function gameOnCreated() {
  this.subscribe('characters.own');
  this.subscribe('items.own');
  this.state = new ReactiveDict();
  this.state.setDefault({
    page: 'Skills',
    item: null,
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
    return Template.instance().state.get('item');
  },

  itemSelectedClass(item){
    const stateItem = Template.instance().state.get('item');
    return stateItem && item._id == stateItem._id ? 'selected' : '';
  },

  equippedRightHand(){
    return Items.findOne({equipped: true, equipSlot: equipSlots.hand});
  },

  equippedLeftHand(){
    return Items.find({equipped: true, equipSlot: equipSlots.hand}).fetch()[1];
  },

  equippedHead(){
    return Items.findOne({equipped: true, equipSlot: equipSlots.head});
  },

  equippedChest(){
    return Items.findOne({equipped: true, equipSlot: equipSlots.chest});
  },

  equippedLegs(){
    return Items.findOne({equipped: true, equipSlot: equipSlots.legs});
  },

});

Template.stats.events({
  'click .tab-links>a'(e, instance) {
    instance.state.set('page', $(e.target).data('page'));
    instance.state.set('item', false);
  },
  'click .items-display-container>.item'(e, instance){
    instance.state.set('item', instance.state.get('item') ? false : Items.findOne($(e.currentTarget).data('id')));
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
})
