import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './death.html';

Template.death.onCreated( function deathOnCreated(){
  Meteor.call('characters.sawDeathNotification', FlowRouter.getParam('characterId'));
})

Template.death.events({
  'click button#new-character'(event, instance) {
    FlowRouter.go('/new');
  }
})
