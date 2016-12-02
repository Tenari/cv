import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Characters } from '../../api/characters/characters.js';
import { craftingLocations } from '../../configs/items.js';

import './craft.html';

Template.craft.onCreated( function craftOnCreated(){
  this.subscribe('characters.own', true);
  this.itemClass = new ReactiveVar(null);
  this.itemToCraft = new ReactiveVar(null);
})

Template.craft.helpers({
  craftLocation() {
    return craftingLocations[FlowRouter.getQueryParam('resource')];
  },
  craftLocationTypes() {
    return _.map(craftingLocations[FlowRouter.getQueryParam('resource')].items, function(valObj, key){ return {key: key, val: valObj};});
  },
  craftLocationItems() {
    const itemClass = Template.instance().itemClass.get();
    return _.values(craftingLocations[FlowRouter.getQueryParam('resource')].items[itemClass]);
  },
  classExpanded(key){
    return Template.instance().itemClass.get() == key;
  },
  itemClass() {
    return Template.instance().itemClass.get();
  },
  itemToCraft() {
    return Template.instance().itemToCraft.get();
  },
  costs() {
    return _.map(Template.instance().itemToCraft.get().cost, function(cost,resource){return {amount: cost, type: resource};});
  },
  myResources() {
    return _.map(myResources(), function(cost,resource){return {amount: cost, type: resource};});
  },
  remainingResources(){
    const mine = myResources();
    let remaining = {};
    _.each(Template.instance().itemToCraft.get().cost, function(cost,resource){
      remaining[resource] = mine[resource] - cost;
    });
    return _.map(remaining, function(cost,resource){return {amount: cost, type: resource};});
  },
  negative(val){
    return val < 0;
  },
  effectMessage(){
    const item = Template.instance().itemToCraft.get();
    let str = '';
    if (item.effectAmount > 0) {
      str= 'increases '+item.effectType+' given by ';
    } else {
      str= 'reduces '+item.effectType+' taken by ';
    }
    return str + Math.abs(item.effectAmount);
  },
  canCreate(){
    let can = true;
    const mine = myResources();
    _.each(Template.instance().itemToCraft.get().cost, function(cost, resource){
      can = can && mine[resource] - cost > 0;
    });
    return can;
  }
})

function myResources() {
  const character = Characters.findOne();
  let myResources = {};
  _.each(_.keys(Template.instance().itemToCraft.get().cost), function(resource) {
    if (character.stats[resource]) {
      myResources[resource] = character.stats[resource];
    } else if (character.stats.resources[resource]) {
      myResources[resource] = character.stats.resources[resource];
    }
  });
  return myResources;
}

Template.craft.events({
  'click .menu ul li.type'(event, instance){
    instance.itemClass.set($(event.currentTarget).data('key'));
  },
  'click .menu ul li.item-selector'(event, instance){
    const itemClass = Template.instance().itemClass.get();
    const item = _.values(craftingLocations[FlowRouter.getQueryParam('resource')].items[itemClass])[$(event.currentTarget).data('index')];
    instance.itemToCraft.set(item);
  },
  'click .craft-actions .craft'(event, instance) {
    Meteor.call('items.create', FlowRouter.getParam('characterId'), FlowRouter.getQueryParam('resource'), instance.itemClass.get(), instance.itemToCraft.get().key);
  },
  'click .craft-actions .cancel'(event, instance) {
    instance.itemClass.set(null);
    instance.itemToCraft.set(null);
  }
})
