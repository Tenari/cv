import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';
import { ReactiveDict } from 'meteor/reactive-dict';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Characters } from '../../api/characters/characters.js';
import '../../api/characters/methods.js';

import './sales.html';
import './account-home.html';
import './root.html';

Template.salesPage.events({
  'click button.signup'(event, instance) {
    FlowRouter.go('/join');
  }
})

Template.accountHome.onCreated(function accountHomeOnCreated() {
  this.state = new ReactiveDict();
  this.state.setDefault({
    name: '',
    named: false,
  });
  this.subscribe('characters.own');
});

Template.accountHome.helpers({
  hasCharacter: function(){
    return Characters.findOne({userId: Meteor.userId()});
  },
  named() {
    return Template.instance().state.get('named');
  },
  name() {
    return Template.instance().state.get('name');
  },
  characters(){
    const cursor = Characters.find({userId: Meteor.userId()});
    if (cursor.count() == 1) {
      //TODO: better way to go into the game. this currently has infinte-loop potential without the timeout
      Meteor.setTimeout(function(){}, 2000);
    }
    return cursor;
  },
  characterGamePath(){
    const gameId = Characters.findOne({userId: Meteor.userId()}).gameId;
    return FlowRouter.path('game.world', {gameId: gameId});
  }
});

var handle = null;
Template.accountHome.events({
  'keyup #change-name': function(e, instance){
    instance.state.set('name', $(e.target).val());
    Meteor.clearTimeout(handle);
    handle = Meteor.setTimeout(function(){
      instance.state.set('named', true);
    }, 667);
  },

  'click img.join-img'(event, instance) {
    const team = $(event.target).data('team');
    const name = instance.state.get('name');

    Meteor.call('characters.insert', {team: team, name: name}, function(){
      FlowRouter.go('game.world', {gameId: Characters.findOne({userId: Meteor.userId()}).gameId});
    });
  }
});
