import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveDict } from 'meteor/reactive-dict'
import { ReactiveVar } from 'meteor/reactive-var'
import { _ } from 'meteor/underscore';

import { Rooms } from '../../api/rooms/rooms.js';
import '../../api/rooms/methods.js';

import './mapbuilder.html';

import { terrain } from '../../configs/locations.js';
import { buildingConfig } from '../../configs/buildings.js';
import { obstaclesConfig } from '../../configs/obstacles.js';
import { npcConfig, monsterConfig } from '../../configs/ai.js';

Template.mapbuilder.onCreated(function gameOnCreated() {
  let map = [[],[],[],[]];
  for(let i = 0; i< map.length; i++){
    var grass = {type: terrain.grass.type, imageClass: terrain.grass.classes[0]};
    map[i].push(_.clone(grass));
    map[i].push(_.clone(grass));
    map[i].push(_.clone(grass));
    map[i].push(_.clone(grass));
  }
  this.map = new ReactiveVar(map);
  this.dimensions = new ReactiveDict();
  this.dimensions.setDefault({
    rows: 4,
    cols: 4,
  });

  this.selectedTileType = new ReactiveVar('grass');
  this.selectedTile = new ReactiveVar(0);
  this.selectedBuilding = new ReactiveVar('open');
  this.selectedObstacle = new ReactiveVar('tree');
  this.selectedAi = new ReactiveVar('bear');
  this.selectedNpc = new ReactiveVar('genericRomanTownsPerson');

  this.currentX = new ReactiveVar(0);
  this.currentY = new ReactiveVar(0);

  this.tab = new ReactiveVar('tiles');

  this.buildings = new ReactiveVar([]);
  this.saleObject = new ReactiveVar({available: false});

  this.obstacles = new ReactiveVar([]);
  this.obstacleData = new ReactiveVar({});

  this.ais = new ReactiveVar([]);
  this.aiBounds = new ReactiveVar({topLeft:{x:0,y:0},bottomRight:{x:0,y:0}});

  this.npcs = new ReactiveVar([]);
})

Template.mapbuilder.helpers({
  map: function(){
   return Template.instance().map.get();
  },
  tiles: function(){
    return _.keys(terrain);
  },
  tileTypeSelected(key){
    return Template.instance().selectedTileType.get() == key;
  },
  specificTiles() {
    return terrain[Template.instance().selectedTileType.get()].classes;
  },
  specificTileSelected(key){
    return Template.instance().selectedTile.get() == key ? 'selected' : '';
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
  width(){
    return Template.instance().dimensions.get('cols') * 60;
  },
  aiBounds(){
    return JSON.stringify(Template.instance().aiBounds.get());
  },
  aiSelected(key){
    return Template.instance().selectedAi.get() == key ? 'selected' : '';
  },
  ais(){
    return _.map(monsterConfig, function(config){return {key: config.key, image: 'i-' + (config.classId + 2)}});
  },
  aiAt(x,y){
    return _.find(Template.instance().ais.get(), function(building){return building.location.x == x && building.location.y == y;});
  },
  aiImageAt(x,y){
    const b = _.find(Template.instance().ais.get(), function(building){return building.location.x == x && building.location.y == y;});
    return b && ('i-'+ (monsterConfig[b.type].classId + 2));
  },
  npcSelected(key){
    return Template.instance().selectedNpc.get() == key ? 'selected' : '';
  },
  npcs(){
    return _.map(npcConfig, function(config){return {key: config.key, image: 'i-' + (config.classId + 2)}});
  },
  npcAt(x,y){
    return _.find(Template.instance().npcs.get(), function(character){return character.location.x == x && character.location.y == y;});
  },
  npcImageAt(x,y){
    const b = _.find(Template.instance().npcs.get(), function(character){return character.location.x == x && character.location.y == y;});
    return b && ('i-'+ (npcConfig[b.type].classId + 2));
  },
});

Template.mapbuilder.events({
  'change input.rows'(e, instance){
    let map = instance.map.get();
    map.length = $(e.target).val();
    for(let i = 0; i< map.length; i++){
      map[i] = [];
      for(let j = 0; j < instance.dimensions.get('cols'); j++) {
        var tile = {type: terrain[instance.selectedTileType.get()].type, imageClass: terrain[instance.selectedTileType.get()].classes[instance.selectedTile.get()]};
        map[i].push(tile);
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
        var tile = {type: terrain[instance.selectedTileType.get()].type, imageClass: terrain[instance.selectedTileType.get()].classes[instance.selectedTile.get()]};
        map[i].push(tile);
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
      ai: instance.ais.get(),
      npcs: instance.npcs.get(),
    }));
  },
  'click .tiles .tile-type'(e, instance){
    instance.selectedTileType.set($(e.target).data('key'));
  },
  'click .tiles .g-col'(e, instance){
    instance.selectedTile.set(parseInt($(e.target).data('index')));
  },
  'click .buildings .g-col'(e, instance){
    instance.selectedBuilding.set($(e.target).data('key'));
  },
  'click .obstacles .g-col'(e, instance){
    instance.selectedObstacle.set($(e.target).data('key'));
    instance.obstacleData.set(obstaclesConfig[$(e.target).data('key')].defaultData);
  },
  'click .ais .g-col'(e, instance){
    instance.selectedAi.set($(e.target).data('key'));
  },
  'click .npcs .g-col'(e, instance){
    instance.selectedNpc.set($(e.target).data('key'));
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
  'change input.ai-bounds'(e, instance){
    instance.aiBounds.set(JSON.parse($(e.currentTarget).val()));
  },
  'click .map .g-col'(e, instance){
    const row = $(e.currentTarget).closest('.g-row').data('index');
    const col = $(e.currentTarget).data('index');
    if (instance.tab.get() == 'tiles') {
      let newTile = {type: terrain[instance.selectedTileType.get()].type, imageClass: terrain[instance.selectedTileType.get()].classes[instance.selectedTile.get()]};
      let map = instance.map.get();
      map[row][col] = newTile;
      instance.map.set(map);
      instance.dimensions.set('rows', map.length);
    } else if (instance.tab.get() == 'buildings' && instance.saleObject.get()) {
      var buildings = instance.buildings.get();
      buildings.push({type: instance.selectedBuilding.get(), location: {x: col, y: row}, sale: instance.saleObject.get()});
      instance.buildings.set(buildings);
    } else if (instance.tab.get() == 'obstacles') {
      var obstacles = instance.obstacles.get();
      obstacles.push({type: instance.selectedObstacle.get(), location: {x: col, y: row}, data: instance.obstacleData.get()});
      instance.obstacles.set(obstacles);
    } else if (instance.tab.get() == 'ais') {
      var ais = instance.ais.get();
      var newAi = {type: instance.selectedAi.get(), location: {x: col, y: row}};
      if (instance.aiBounds.get())
        newAi.bounds = instance.aiBounds.get();

      ais.push(newAi);
      instance.ais.set(ais);
    } else if (instance.tab.get() == 'npcs') {
      var npcs = instance.npcs.get();
      var newNpc = {type: instance.selectedNpc.get(), location: {x: col, y: row}};
      if (instance.aiBounds.get())
        newNpc.aiBounds = instance.aiBounds.get();
      npcs.push(newNpc);
      instance.npcs.set(npcs);
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
  'click .map .g-col .monster.character'(e, instance){
    e.stopPropagation();
    const row = $(e.currentTarget).data('y');
    const col = $(e.currentTarget).data('x');
    instance.ais.set(_.reject(instance.ais.get(), function(b){return b.location.x == col && b.location.y == row}));
  },
  'click .map .g-col .npc.character'(e, instance){
    e.stopPropagation();
    const row = $(e.currentTarget).data('y');
    const col = $(e.currentTarget).data('x');
    instance.npcs.set(_.reject(instance.npcs.get(), function(b){return b.location.x == col && b.location.y == row}));
  },
  'click .tabs .show-tab'(e, instance) {
    instance.tab.set($(e.currentTarget).data('tab'));
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
    instance.obstacles.set(big.obstacles);
    instance.ais.set(big.ai);
    instance.npcs.set(big.npcs || []);
  },
  'mouseenter .map .g-col'(e, instance){
    const row = $(e.currentTarget).closest('.g-row').data('index');
    const col = $(e.currentTarget).data('index');
    instance.currentX.set(col);
    instance.currentY.set(row);
  },
});
