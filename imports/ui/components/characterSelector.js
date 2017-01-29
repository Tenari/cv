import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';

import { Characters } from '../../api/characters/characters.js'

import './characterSelector.html';

var timeout = null;
Template.characterSelector.onCreated(function(){
  this.matches = new ReactiveVar([]);
})

Template.characterSelector.helpers({
  searchResults: function(){
    return Template.instance().matches.get();
  },
})

Template.characterSelector.events({
  'keypress input.character-search'(e, instance) {
    const search = e.target.value + e.key;
    Meteor.clearTimeout(timeout);
    timeout = Meteor.setTimeout(function(){
      Meteor.call('characters.search', FlowRouter.getParam('gameId'), search, function(error, result){
        if (!error) {
          instance.matches.set(result);
        }
      });
    }, 333);
  },
  'click ul li.select-character'(e, instance) {
    Session.set('selectedCharacterId', $(e.currentTarget).attr('data-id'));
  },
})
