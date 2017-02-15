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
import { buildingConfig } from '../../configs/buildings.js';
import { obstaclesConfig } from '../../configs/obstacles.js';

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
  this.selectedBuilding = new ReactiveVar('open');
  this.selectedObstacle = new ReactiveVar('tree');
  this.door = new ReactiveVar({name: 'tokyo', x: 3, y:5});

  this.currentX = new ReactiveVar(0);
  this.currentY = new ReactiveVar(0);

  this.tab = new ReactiveVar('tiles');

  this.buildings = new ReactiveVar([]);
  this.saleObject = new ReactiveVar({available: false});

  this.obstacles = new ReactiveVar([]);
  this.obstacleData = new ReactiveVar({});
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
  tabIs(tab) {
    return Template.instance().tab.get() == tab;
  },
  buildings(){
    return _.map(buildingConfig, function(config){return {key: config.key, image: config.imageClass}});
  },
  buildingSelected(key){
    return Template.instance().selectedBuilding.get() == key ? 'selected' : '';
  },
  obstacles(){
    return _.map(obstaclesConfig, function(config){return {key: config.key, image: config.imageClass}});
  },
  obstacleSelected(key){
    return Template.instance().selectedObstacle.get() == key ? 'selected' : '';
  },
  showDoor(){
    return tiles[Template.instance().selected.get()].data;
  },
  hasDimensions(){
    return tiles[Template.instance().selected.get()].dimensions;
  },
  currentX(){
    return Template.instance().currentX.get();
  },
  currentY(){
    return Template.instance().currentY.get();
  },
  buildingAt(x,y){
    return _.find(Template.instance().buildings.get(), function(building){return building.location.x == x && building.location.y == y;});
  },
  buildingImageAt(x,y){
    const b = _.find(Template.instance().buildings.get(), function(building){return building.location.x == x && building.location.y == y;});
    return b && buildingConfig[b.type].imageClass;
  },
  obstacleData(){
    return JSON.stringify(Template.instance().obstacleData.get());
  },
  obstacleAt(x,y){
    return _.find(Template.instance().obstacles.get(), function(building){return building.location.x == x && building.location.y == y;});
  },
  obstacleImageAt(x,y){
    const b = _.find(Template.instance().obstacles.get(), function(building){return building.location.x == x && building.location.y == y;});
    return b && obstaclesConfig[b.type].imageClass;
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
    console.log(JSON.stringify({
      room:{
        name: "asdf",
        width: instance.dimensions.get('cols'),
        height: instance.dimensions.get('rows'),
        map: instance.map.get(),
      },
      obstacles: instance.obstacles.get(),
      buildings: instance.buildings.get(),
    }));
  },
  'click .tiles .g-col'(e, instance){
    instance.selected.set($(e.target).data('key'));
  },
  'click .buildings .g-col'(e, instance){
    instance.selectedBuilding.set($(e.target).data('key'));
  },
  'click .obstacles .g-col'(e, instance){
    instance.selectedObstacle.set($(e.target).data('key'));
    instance.obstacleData.set(obstaclesConfig[$(e.target).data('key')].defaultData);
  },
  'change input.sale-cost'(e, instance){
    if ($(e.currentTarget).val() == '')
      instance.saleObject.set({available: false});
    else
      instance.saleObject.set({available: true, cost: parseInt($(e.currentTarget).val())});
  },
  'change input.obstacle-data'(e, instance){
    instance.obstacleData.set(JSON.parse($(e.currentTarget).val()));
  },
  'click .map .g-col'(e, instance){
    const row = $(e.currentTarget).closest('.g-row').data('index');
    const col = $(e.currentTarget).data('index');
    if (instance.tab.get() == 'tiles') {
      let newTile = _.clone(tiles[instance.selected.get()]);
      let map = instance.map.get();
      map[row][col] = newTile;
      instance.map.set(map);
      instance.dimensions.set('rows', map.length);
    } else if (instance.tab.get() == 'buildings' && instance.saleObject.get()) {
      var buildings = instance.buildings.get();
      buildings.push({type: instance.selectedBuilding.get(), location: {x: col, y: row}, sale: instance.saleObject.get()});
      instance.buildings.set(buildings);
      console.log(buildings);
    } else if (instance.tab.get() == 'obstacles') {
      var obstacles = instance.obstacles.get();
      obstacles.push({type: instance.selectedObstacle.get(), location: {x: col, y: row}, data: instance.obstacleData.get()});
      instance.obstacles.set(obstacles);
      console.log(obstacles);
    }
  },
  'click .map .g-col .building'(e, instance){
    e.stopPropagation();
    const row = $(e.currentTarget).data('y');
    const col = $(e.currentTarget).data('x');
    instance.buildings.set(_.reject(instance.buildings.get(), function(b){return b.location.x == col && b.location.y == row}));
  },
  'click .map .g-col .obstacle-only'(e, instance){
    e.stopPropagation();
    const row = $(e.currentTarget).data('y');
    const col = $(e.currentTarget).data('x');
    instance.obstacles.set(_.reject(instance.obstacles.get(), function(b){return b.location.x == col && b.location.y == row}));
  },
  'click .tabs .show-tab'(e, instance) {
    instance.tab.set($(e.currentTarget).data('tab'));
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
    var big = JSON.parse($('input.import').val())
    instance.map.set(big.room.map);
    instance.dimensions.set('rows', big.room.height);
    instance.dimensions.set('cols', big.room.width);
    instance.buildings.set(big.buildings);
  },
  'mouseenter .map .g-col'(e, instance){
    const row = $(e.currentTarget).closest('.g-row').data('index');
    const col = $(e.currentTarget).data('index');
    instance.currentX.set(col);
    instance.currentY.set(row);
  },
});
