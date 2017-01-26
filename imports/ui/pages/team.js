import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveDict } from 'meteor/reactive-dict';

import { Characters } from '../../api/characters/characters.js';
import { Fights } from '../../api/fights/fights.js';
import { Games } from '../../api/games/games.js';
import { Chats } from '../../api/chats/chats.js';
import { Missions } from '../../api/missions/missions.js';

import { gameLength, getCharacter } from '../../configs/game.js';
import { ranksConfig } from '../../configs/ranks.js';

import '../components/chat.js';
import './team.html';

Template.team.onCreated(function fightOnCreated() {
  this.state = new ReactiveDict();
  this.state.setDefault({
    timeLeft: 0,
    tab: 'summary',
    editingKingMessage: false,
  })
  var teamCharacters = this.subscribe('characters.team');
  this.subscribe('games');
  this.subscribe('missions.team', FlowRouter.getParam('gameId'));
  this.subscribe('missions.own', FlowRouter.getParam('gameId'));
  this.character = () => getCharacter(Meteor.userId(), FlowRouter.getParam('gameId'), Characters);

  this.autorun(() => {
    if (teamCharacters.ready()) {
      const team = this.character().team;
      this.subscribe('chats.scope', "team:"+team);
      this.ranks = _.map(ranksConfig, function(obj, key){
        obj.name = obj[team].name;
        obj.image = obj[team].image;
        if (key == ranksConfig.king.key) {
          obj.player = Characters.findOne({'stats.rank': ranksConfig.king.key});
        } else if (key == ranksConfig.freeman.key) {
          obj.players = {
            count: Characters.find({'stats.rank': ranksConfig.freeman.key}).count(),
          }
        } else if (key == ranksConfig.peasant.key) {
          obj.players = {
            count: Characters.find({'stats.rank': ranksConfig.peasant.key}).count(),
          }
        }
        return obj;
      });
    }
  })

  var that = this;
  Meteor.setInterval(function(){
    const game = Games.findOne(FlowRouter.getParam('gameId'));
    if (!game) return;
    const left = gameLength - (Date.now() - game.startedAt);
    that.state.set('timeLeft', dhm(left));
  }, 1000)
})

Template.team.helpers({
  game(){
    return Games.findOne(FlowRouter.getParam('gameId'));
  },
  team(){
    return Games.findOne(FlowRouter.getParam('gameId'))[Template.instance().character().team];
  },
  otherTeam(){
    const team = Template.instance().character().team == 'romans' ? 'japs' : 'romans';
    return Games.findOne(FlowRouter.getParam('gameId'))[team];
  },
  rankIs(key){
    return Template.instance().character().stats.rank == key;
  },
  ranks(){
    return Template.instance().ranks;
  },
  king(){
    return Template.instance().ranks[0];
  },
  freemen(){
    return Template.instance().ranks[1];
  },
  peasants(){
    return Template.instance().ranks[2];
  },
  timeLeft(){
    return Template.instance().state.get('timeLeft');
  },
  tab(tab){
    return Template.instance().state.get('tab') == tab ? 'active' : false;
  },
  teamChat(){
    return Chats.findOne();
  },
  missions(){
    return Missions.find({ownerId: {$exists: false}});
  },
  myMissions(){
    return Missions.find({ownerId: Template.instance().character()._id});
  },
  kingMessage(){
    const game = Games.findOne(FlowRouter.getParam('gameId'));
    return game && game[Template.instance().character().team].kingMessage;
  },
  character(){
    return Template.instance().character();
  },
  isEditingKingMessage(){
    return Template.instance().state.get('editingKingMessage');
  },
})

// countdown timer function
function dhm(t){
  var cd = 24 * 60 * 60 * 1000,
      ch = 60 * 60 * 1000,
      cm = 60 * 1000,
      d = Math.floor(t / cd),
      h = Math.floor( (t - d * cd) / ch),
      m = Math.round( (t - d * cd - h * ch) / 60000),
      s = Math.round( (t - d * cd - h * ch - m * cm) / 1000)+30,
      pad = function(n){ return n < 10 ? '0' + n : n; };
  if( s === 60 ){
    m++;
    s = 0;
  }
  if( m === 60 ){
    h++;
    m = 0;
  }
  if( h === 24 ){
    d++;
    h = 0;
  }
  if (d > 0)
    return [d+'d', pad(h)+'h'].join(' ');
  else
    return [pad(h), pad(m), pad(s)].join(':');
}

Template.team.events({
  'click a.team-tab'(e, instance){
    instance.state.set('tab', $(e.currentTarget).data('tab'));
  },
  'click button.accept-mission'(e, instance){
    Meteor.call('missions.accept', FlowRouter.getParam('gameId'), $(e.target).attr('data-id'));
  },
  'click a.edit-king-message'(e, instance){
    instance.state.set('editingKingMessage', !instance.state.get('editingKingMessage'));
  },
  'click button.save-new-king-message'(e, instance){
    Meteor.call('games.changeKingMessage', FlowRouter.getParam('gameId'), $('.new-king-message').val(), function(){
      instance.state.set('editingKingMessage', false);
    });
  },
})
