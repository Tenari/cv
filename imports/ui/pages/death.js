import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Characters } from '../../api/characters/characters.js';
import { canRevive, minutesUntilRevive } from '../../configs/game.js';

import './death.html';

Template.death.onCreated( function deathOnCreated(){
  Meteor.call('characters.sawDeathNotification', FlowRouter.getParam('characterId'));
  this.subscribe('characters.own', true);
})

Template.death.helpers({
  canRevive(){
    const character = Characters.findOne(FlowRouter.getParam('characterId'));
    return canRevive(character);
  },
  timeToLife(){
    const character = Characters.findOne(FlowRouter.getParam('characterId'));
    return minutesUntilRevive(character);
  }
})

Template.death.events({
  'click button#new-character'(event, instance) {
    FlowRouter.go('/new');
  },
  'click button.revive'(){
    Meteor.call('characters.revive', FlowRouter.getParam('characterId'), function(){
      FlowRouter.go('App.home');
    })
  }
})
