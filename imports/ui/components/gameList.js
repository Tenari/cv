import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';

import { Games } from '../../api/games/games.js'

import '../components/gameTimeLeft.js';
import './gameList.html';

Template.gameList.onCreated(function () {
  this.subscribe('games');
})

Template.gameList.helpers({
  games(){
    return Games.find({});
  },
  selectedGameId(){
    return Session.get('selectedGameId');
  },
  selectedGame(){
    return Games.findOne(Session.get('selectedGameId'));
  },
})

Template.gameList.events({
  'click .game-card'(e, instance){
    const id = $(e.currentTarget).data('id');
    Session.set('selectedGameId', Session.get('selectedGameId') == id ? false : id);
  },
})
