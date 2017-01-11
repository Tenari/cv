import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveDict } from 'meteor/reactive-dict';

import { Characters } from '../../api/characters/characters.js'
import { Fights } from '../../api/fights/fights.js'
import { Games } from '../../api/games/games.js'

import { getCharacter } from '../../configs/game.js';
import { ranksConfig } from '../../configs/ranks.js';

import './team.html';

Template.team.onCreated(function fightOnCreated() {
  this.state = new ReactiveDict();
  this.state.setDefault({
  })
  this.subscribe('characters.team');
  this.subscribe('games');
  this.character = () => getCharacter(Meteor.userId(), FlowRouter.getParam('gameId'), Characters);

  this.autorun(()=> {
    if (this.subscriptionsReady()) {
    }
  })
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
})

Template.team.events({
})
