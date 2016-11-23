import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Characters } from '../../api/characters/characters.js';
//import { canRevive, minutesUntilRevive } from '../../configs/game.js';

import './craft.html';

Template.craft.onCreated( function craftOnCreated(){
  this.subscribe('characters.own', true);
})

Template.craft.helpers({
})

Template.craft.events({
})
