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
  this.door = new ReactiveVar({name: 'tokyo', x: 3, y:5});
  this.dataDimensions = new ReactiveVar(tiles['fence-sign'].dimensions);

  this.currentX = new ReactiveVar(0);
  this.currentY = new ReactiveVar(0);
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
  },
  showDoor(){
    return tiles[Template.instance().selected.get()].data;
  },
  hasDimensions(){
    return tiles[Template.instance().selected.get()].dimensions;
  },
  width(){
    return Template.instance().map.get()[0].length * 70;
  },
  currentX(){
    return Template.instance().currentX.get();
  },
  currentY(){
    return Template.instance().currentY.get();
  },
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
    let newTile = _.clone(tiles[instance.selected.get()]);
    if (newTile.data) {
      newTile.data = _.clone(instance.door.get());
    }
    if (newTile.dimensions) {
      newTile.dimensions = $.extend(true, {}, instance.dataDimensions.get()); // deep clone
    }
    const row = $(e.currentTarget).closest('.g-row').data('index');
    const col = $(e.currentTarget).data('index');
    let map = instance.map.get();
    map[row][col] = newTile;
    instance.map.set(map);
    instance.dimensions.set('rows', map.length);
  },
  'change .door-data input.name'(e, instance) {
    let doorData = instance.door.get();
    doorData.name = $(e.currentTarget).val();
    instance.door.set(doorData)
  },
  'change .door-data input.x'(e, instance) {
    let doorData = instance.door.get();
    doorData.x = parseInt($(e.currentTarget).val());
    instance.door.set(doorData)
  },
  'change .door-data input.y'(e, instance) {
    let doorData = instance.door.get();
    doorData.y = parseInt($(e.currentTarget).val());
    instance.door.set(doorData)
  },
  'change .dimensions .dimension-input'(e, instance) {
    const coord = $(e.target).attr('data-coord');
    const part = $(e.target).attr('data-part');
    let dimensions = instance.dataDimensions.get();
    dimensions[coord][part] = parseInt($(e.currentTarget).val());
    instance.dataDimensions.set(dimensions);
  },
  'click button.import-btn'(e, instance){
    instance.map.set(JSON.parse($('input.import').val()));
    instance.dimensions.set('rows', instance.map.get().length);
    instance.dimensions.set('cols', instance.map.get()[0].length);
  },
  'mouseenter .map .g-col'(e, instance){
    const row = $(e.currentTarget).closest('.g-row').data('index');
    const col = $(e.currentTarget).data('index');
    instance.currentX.set(col);
    instance.currentY.set(row);
  },
});
