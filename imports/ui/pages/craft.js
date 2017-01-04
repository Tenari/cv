import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveVar } from 'meteor/reactive-var';

import { Characters } from '../../api/characters/characters.js';
import { Rooms } from '../../api/rooms/rooms.js';
import { craftingLocations, itemConfigs } from '../../configs/items.js';
import { nextSpotXY } from '../../configs/locations.js';

import './craft.html';

Template.craft.onCreated( function craftOnCreated(){
  var myself = this.subscribe('characters.own', true);
  var rooms;
  this.itemClass = new ReactiveVar(null);
  this.itemToCraft = new ReactiveVar(null);
  this.crafted = new ReactiveVar(null);

  this.autorun(() => {
    if(myself.ready()) {
      const character = Characters.findOne();
      rooms = this.subscribe('game.rooms', character.gameId);
      if (rooms.ready()) {
        const room = Rooms.findOne(character.location.roomId)
        const xy = nextSpotXY(character);
        if (room.map[xy.y] && room.map[xy.y][xy.x] && room.map[xy.y][xy.x].use && room.map[xy.y][xy.x].use.params && room.map[xy.y][xy.x].use.params.resource == FlowRouter.getQueryParam('resource')) {
          // all good
        } else {
          FlowRouter.go('/'); //you're not allowed to be here!
        }
      }
    }
  })
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
    return _.map(craftingLocations[FlowRouter.getQueryParam('resource')].items[itemClass], function(key){return itemConfigs[itemClass][key];});
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
    return item.effectDescription();
  },
  canCreate(){
    let can = true;
    const mine = myResources();
    _.each(Template.instance().itemToCraft.get().cost, function(cost, resource){
      can = can && mine[resource] - cost >= 0;
    });
    return can;
  },
  crafted() {
    return Template.instance().crafted.get();
  }
})

function myResources() {
  const character = Characters.findOne();
  let myResources = {};
  _.each(_.keys(Template.instance().itemToCraft.get().cost), function(resource) {
    if (character.stats[resource]) {
      myResources[resource] = character.stats[resource];
    } else if (character.stats.resources[resource] || character.stats.resources[resource] == 0) {
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
    const item = itemConfigs[itemClass][$(event.currentTarget).data('key')];
    instance.itemToCraft.set(item);
  },
  'click .craft-actions .craft'(event, instance) {
    Meteor.call('items.create', FlowRouter.getParam('characterId'), instance.itemClass.get(), instance.itemToCraft.get().key, function(error, result){
      console.log(error, result);
      if (error) {return;}
      //show the "you just made a thing" message
      instance.crafted.set(_.clone(instance.itemToCraft.get()));
      Meteor.setTimeout(function(){
        instance.crafted.set(null);
      }, 7777);
    });
  },
  'click .craft-actions .cancel'(event, instance) {
    instance.itemClass.set(null);
    instance.itemToCraft.set(null);
  }
})
