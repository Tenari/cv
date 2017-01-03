import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveDict } from 'meteor/reactive-dict';

import { Characters } from '../../api/characters/characters.js'
import { Fights } from '../../api/fights/fights.js'
import { Items } from '../../api/items/items.js'

import { getCharacter } from '../../configs/game.js';
import { equipSlots } from '../../configs/items.js';

import '../components/status-bars.js';
import './fight.html';

Template.fight.onCreated(function fightOnCreated() {
  this.state = new ReactiveDict();
  this.state.setDefault({
    menu: 'base',
    next: 'quick',
    opponentDamage: 0,
    ownDamage: 0,
    timeLeft: 5
  })
  var state = this.state;
  this.subscribe('fights.own');
  this.subscribe('items.own');
  this.subscribe('characters.fight');
  this.character = () => getCharacter(Meteor.userId(), FlowRouter.getParam('gameId'), Characters);

  Meteor.setInterval(()=>{
    state.set('timeLeft', state.get('timeLeft') - 1);
  },1000);

  this.autorun(() => {
    state.set('timeLeft', 5);
    const fight = Fights.findOne();
    if (!fight) return;
    const round = fight.rounds[fight.rounds.length-1];
    if (!round) return;

    const damage = this.character()._id == fight.attackerId ? round.attackerDealt : round.defenderDealt;
    this.state.set('opponentDamage', damage);

    const ownDamage = this.character()._id == fight.attackerId ? round.defenderDealt : round.attackerDealt;
    this.state.set('ownDamage', ownDamage);

    Meteor.setTimeout(function(){
      state.set('opponentDamage', 0);
      state.set('ownDamage', 0);
    }, 2000) 
  })

  this.autorun(()=> {
    if (this.subscriptionsReady()) {
      if (Fights.find().count() == 0) // if there is no fight, re-route.
        FlowRouter.go('game.world', {gameId: FlowRouter.getParam('gameId')})
    }
  })
})

function nextAttack() {
  const character = Template.instance().character();
  const fight = Fights.findOne();
  let style = fight.defenderStyle;
  if (fight.attackerId == character._id) {
    style = fight.attackerStyle;
  }
  return style;
}

Template.fight.helpers({
  menu(key){
    return key == Template.instance().state.get('menu');
  },
  nextAttack: nextAttack,
  nextIsAttack(){
    const style = nextAttack();
    return style == 'flee' || style == 'block' ? false : style;
  },
  enemy(){
    return Characters.findOne({userId: {$ne: Meteor.userId()}});
  },
  enemyMainImage() {
    const enemy = Characters.findOne({userId: {$ne: Meteor.userId()}});
    return enemy.location.classId + 2;
  },
  ownMainImage() {
    return Template.instance().character().location.classId + 1;
  },
  fight(){
    return Fights.findOne();
  },
  opponentDamageTaken(){
    const dmg = Template.instance().state.get('opponentDamage');
    return dmg > 0 ? ("-"+dmg) : "";
  },
  ownDamageTaken(){
    const dmg = Template.instance().state.get('ownDamage');
    return dmg > 0 ? ("-"+dmg) : "";
  },
  timeLeft(){
    return Template.instance().state.get('timeLeft');
  },
  currentWeapon(){
    const character = Template.instance().character();
    return Items.findOne({ownerId: character._id, equipped: true, type: 'weapon'}) || {name: 'bare hands'};
  }
})

Template.fight.events({
  'click .fight-option'(e, instance){
    instance.state.set('menu', 'attack');
  },
  'click .option.attack'(e, instance){
    Meteor.call('fights.changeStyle', Fights.findOne()._id, instance.character()._id, $(e.target).data('style'));
    instance.state.set('menu', 'base');
  },
})
