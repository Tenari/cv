import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveDict } from 'meteor/reactive-dict'
import { ReactiveVar } from 'meteor/reactive-var'
import { _ } from 'meteor/underscore';

import { Rooms } from '../../api/rooms/rooms.js'
import '../../api/rooms/methods.js'

import './mapbuilder.html';

import { tiles } from '../../configs/locations.js';

Template.mapbuilder.onCreated(function gameOnCreated() {
  let map = [[],[],[],[]];
  for(let i = 0; i< map.length; i++){
    map[i].push(_.clone(tiles.grass));
    map[i].push(_.clone(tiles.grass));
    map[i].push(_.clone(tiles.grass));
    map[i].push(_.clone(tiles.grass));
  }
  this.map = new ReactiveVar(map);
  this.dimensions = new ReactiveDict();
  this.dimensions.setDefault({
    rows: 4,
    cols: 4,
  });

  this.selected = new ReactiveVar('grass');
})

Template.mapbuilder.helpers({
  map: function(){
   return Template.instance().map.get();
  },
  tiles: function(){
    var arr = [];
    for (var key in tiles) arr.push({key: key, value: tiles[key]});
    return arr;
  },
  tileSelected(key){
    return Template.instance().selected.get() == key ? 'selected' : '';
  }
});

Template.mapbuilder.events({
  'change input.rows'(e, instance){
    let map = instance.map.get();
    map.length = $(e.target).val();
    for(let i = 0; i< map.length; i++){
      map[i] = [];
      for(let j = 0; j < instance.dimensions.get('cols'); j++) {
        map[i].push(_.clone(tiles[instance.selected.get()]));
      }
    }
    instance.map.set(map);
    instance.dimensions.set('rows', map.length);
  },
  'change input.cols'(e, instance){
    let map = instance.map.get();
    for(let i = 0; i< map.length; i++){
      map[i] = [];
      for(let j = 0; j < $(e.target).val(); j++) {
        map[i].push(_.clone(tiles[instance.selected.get()]));
      }
    }
    instance.map.set(map);
    instance.dimensions.set('cols', $(e.target).val());
  },
  'click button.export'(e, instance){
    console.log(JSON.stringify(instance.map.get()));
  },
  'click .tiles .g-col'(e, instance){
    instance.selected.set($(e.target).data('key'));
  },
  'click .map .g-col'(e, instance){
    const newTile = _.clone(tiles[instance.selected.get()]);
    const row = $(e.currentTarget).closest('.g-row').data('index');
    const col = $(e.currentTarget).data('index');
    let map = instance.map.get();
    map[row][col] = newTile;
    instance.map.set(map);
    instance.dimensions.set('rows', map.length);
  },
});
