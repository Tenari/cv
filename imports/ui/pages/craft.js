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
  itemClass() {
    return Template.instance().itemClass.get();
  },
  itemToCraft() {
    return Template.instance().itemToCraft.get();
  }
})

Template.craft.events({
  'click .menu ul li.type'(event, instance){
    instance.itemClass.set($(event.currentTarget).data('key'));
  },
  'click .menu ul li.item'(event, instance){
    const itemClass = Template.instance().itemClass.get();
    console.log($(event.currentTarget).data('index'));
    const item = _.values(craftingLocations[FlowRouter.getQueryParam('resource')].items[itemClass])[$(event.currentTarget).data('index')];
    console.log(item);
    instance.itemToCraft.set(item);
  } 
})
