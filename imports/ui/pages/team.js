import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveDict } from 'meteor/reactive-dict';

import { Characters } from '../../api/characters/characters.js';
import { Fights } from '../../api/fights/fights.js';
import { Games } from '../../api/games/games.js';
import { Chats } from '../../api/chats/chats.js';

import { gameLength, getCharacter } from '../../configs/game.js';
import { ranksConfig } from '../../configs/ranks.js';

import '../components/chat.js';
import './team.html';

Template.team.onCreated(function fightOnCreated() {
  this.state = new ReactiveDict();
  this.state.setDefault({
    timeLeft: 0,
    tab: 'summary',
  })
  var teamCharacters = this.subscribe('characters.team');
  this.subscribe('games');
  this.character = () => getCharacter(Meteor.userId(), FlowRouter.getParam('gameId'), Characters);

  this.autorun(() => {
    if (teamCharacters.ready()) {
      this.subscribe('chats.scope', "team:"+this.character().team);
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
  ranks(){
  },
  timeLeft(){
    return Template.instance().state.get('timeLeft');
  },
  tab(tab){
    return Template.instance().state.get('tab') == tab;
  },
  teamChat(){
    return Chats.findOne();
  },
})

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
})
