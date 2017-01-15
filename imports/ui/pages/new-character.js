import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';
import { ReactiveDict } from 'meteor/reactive-dict';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Characters } from '../../api/characters/characters.js';
import '../../api/characters/methods.js';

import './new-character.html';

Template.newCharacter.onCreated(function newCharacterOnCreated() {
  this.state = new ReactiveDict();
  this.state.setDefault({
    name: '',
    named: false,
    team: null,
  });
  this.subscribe('characters.own');
});

Template.newCharacter.helpers({
  named() {
    return Template.instance().state.get('named');
  },
  name() {
    return Template.instance().state.get('name');
  },
  team() {
    return Template.instance().state.get('team');
  },
});

var handle = null;
Template.newCharacter.events({
  'keyup #change-name': function(e, instance){
    instance.state.set('name', $(e.target).val());
    Meteor.clearTimeout(handle);
    handle = Meteor.setTimeout(function(){
      instance.state.set('named', true);
    }, 667);
  },

  'click img.join-img'(event, instance) {
    const team = $(event.target).data('team');
    instance.state.set('team', team);
  },

  'click a.tutorial'(e, instance){
  
  },

  'click a.game'(e, instance){
    const team = instance.state.get('team');
    const name = instance.state.get('name');

    Meteor.call('characters.insert', {team: team, name: name}, function(err, gameId){
      FlowRouter.go('game.world', {gameId: gameId});
    });
  },
});
