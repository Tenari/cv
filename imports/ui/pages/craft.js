import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Characters } from '../../api/characters/characters.js';
import { craftingLocations } from '../../configs/items.js';

import './craft.html';

Template.craft.onCreated( function craftOnCreated(){
  this.subscribe('characters.own', true);
})

Template.craft.helpers({
  craftLocation() {
    return craftingLocations[FlowRouter.getQueryParam('resource')];
  },
  craftLocationItems() {
    return _.map(craftingLocations[FlowRouter.getQueryParam('resource')].items, function(valObj, key){ return {key: key, val: valObj};});
  }
})

Template.craft.events({
})
