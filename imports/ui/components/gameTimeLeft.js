import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import { Games } from '../../api/games/games.js'
import { gameLength } from '../../configs/game.js';

import './gameTimeLeft.html';

Template.gameTimeLeft.onCreated(function () {
  this.time = new ReactiveVar(0);
  var that = this;
  Meteor.setInterval(function(){
    if(!that.data || !that.data.startedAt) return false;
    const left = gameLength - (Date.now() - that.data.startedAt);
    that.time.set(dhm(left));
  }, 1000);
})

Template.gameTimeLeft.helpers({
  timeLeft(){
    return Template.instance().time.get();
  }
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
