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

///////////////////////////////
// accountHome below
///////////////////////////////

Template.accountHome.onCreated(function accountHomeOnCreated() {
  this.subscribe('characters.own', true);
  this.autorun(() => {
    const recentlyDead = Characters.findOne({'deaths.recentlyDead': true});
    if (recentlyDead)
      FlowRouter.go('character.death', {characterId: recentlyDead._id});
  })
});

Template.accountHome.helpers({
  hasCharacter: function(){
    return Characters.findOne({userId: Meteor.userId()});
  },
  characters(){
    return Characters.find({userId: Meteor.userId()});
  },
  canMakeCharacter(){
    return Characters.find({userId: Meteor.userId(), 'stats.hp': {$gt: 0}}).count() == 0;
  },
  characterGamePath(){
    const gameId = Characters.findOne({userId: Meteor.userId()}).gameId;
    return FlowRouter.path('game.world', {gameId: gameId});
  },
  image(character){
    return 2 + character.location.classId;
  },
  isAlive(character) {
    return character.stats.hp > 0;
  },
  canRevive(character){
    return character && (character.deaths.diedAt + 1800000) < Date.now();
  },
  timeToLife(character){
    return character && Math.round(((character.deaths.diedAt + 1800000) - Date.now()) / 60 / 1000);
  }
});

Template.accountHome.events({
  'click button.revive'(event, instance){
    Meteor.call('characters.revive', $(event.currentTarget).data('id'));
  }
});
