import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { SyncedCron } from 'meteor/percolate:synced-cron';

import { Games } from '../api/games/games.js';
import { Fights } from '../api/fights/fights.js';
import { Items } from '../api/items/items.js';
import { Characters } from '../api/characters/characters.js';
import { Missions } from '../api/missions/missions.js';

import { styleFactors, fightEnergyCostFactor, speeds, recalculateStats } from './game.js';
import { equipSlots } from './items.js';
import { aiTeam, monsterConfig } from './ai.js';
import { ranksConfig } from './ranks.js';
import { missionsConfig } from './missions.js';

export function countDownToRound(fightId){
  const fight = Fights.findOne(fightId)
  SyncedCron.add({
    name: 'Fights:'+fightId+':'+fight.round,
    schedule: function(parser){
      var t = new Date();
      t.setSeconds(t.getSeconds() + 5);
      return parser.recur().on(t).fullDate();
    },
    job: function(){
      fightNextRound(fightId);
    }
  })
}

export function fightNextRound(fightId){
  let fight = Fights.findOne(fightId);
  // either it has been 5 seconds, and it doesn't matter if they are ready, 
  //   OR
  // they must both be ready
  if ((fight.lastRoundAt + 4900) > Date.now() && (!fight.attackerReady || !fight.defenderReady)) return;

  // we actually are going to fight now, so clear the timer to prevent any other occurrence of this;
  if ((fight.lastRoundAt + 4900) > Date.now()) // only clear the timer if it is early. otherwise we'll be cancelling ourselves
    SyncedCron.remove('Fights:'+fightId+':'+fight.round)

  var roundLog = {round: fight.round};
  let attacker = Characters.findOne(fight.attackerId);
  let defender = Characters.findOne(fight.defenderId);

  // handle fleeing
  if (fight.attackerStyle == 'flee' && fight.defenderStyle == 'flee'){
    // if everyone wants to flee, the fight is over
    endFight(fight, attacker, defender);
    return;
  } else if (fight.attackerStyle == 'flee' && Math.random() < 0.6) { // easier for attacker to flee
    endFight(fight, attacker, defender);
    return;
  } else if (fight.defenderStyle == 'flee' && Math.random() < 0.5) {
    endFight(fight, attacker, defender);
    return;
  }

  // lower energies by appropriate amounts
  if (attacker.stats.energy > 0)
    attacker.stats.energy = attacker.stats.energy - (fightEnergyCostFactor * styleFactors[fight.attackerStyle]);
  if (defender.stats.energy > 0)
    defender.stats.energy = defender.stats.energy - (fightEnergyCostFactor * styleFactors[fight.defenderStyle]);

  // calculate the user's functional/current stats
  attacker = recalculateStats(attacker);
  defender = recalculateStats(defender);

  // determine combat order (based on attackspeed, which comes from their weapon and proficiency)
  const attackerWeapon = Items.findOne({ownerId: attacker._id, equipped: true, type: 'weapon'});
  const defenderWeapon = Items.findOne({ownerId: defender._id, equipped: true, type: 'weapon'});
  var order = combatOrder(fight, attacker, defender, attackerWeapon, defenderWeapon);
  var first = order[0];
  var last = order[1];
  roundLog.firstId = first._id;
  var firstIs, lastIs, firstWeapon, lastWeapon;
  if (first._id == attacker._id) {
    firstIs = 'attacker';
    lastIs = 'defender';
    firstWeapon = attackerWeapon;
    lastWeapon = defenderWeapon;
  } else {
    firstIs = 'defender';
    lastIs = 'attacker';
    firstWeapon = defenderWeapon;
    lastWeapon = attackerWeapon;
  }

  // roll first guy's attempt to hit
  let firstHit = false;
  if (fight[firstIs+'Style'] != 'flee' && first.stats.energy >= 0) {
    firstHit = rollToHit(first, last, firstWeapon);
    first.stats.accuracyBase += skillIncreaseAmount(first.stats.accuracyBase, last);
    if (firstWeapon)
      first.stats.weapon[firstWeapon.weaponType()+'Base'] += skillIncreaseAmount(first.stats.weapon[firstWeapon.weaponType()+'Base'], last);
    last.stats.agilityBase += skillIncreaseAmount(last.stats.agilityBase, first);
  }
  roundLog[firstIs+'Hit'] = firstHit;

  if (firstHit) { // calc damage
    const damage = aDamagesB(fight, first, last, firstWeapon);
    last.stats.hp -= damage;
    roundLog[firstIs+'Dealt'] = damage;
    first.stats.strengthBase += powerIncreaseAmount(first.stats.strengthBase, last);
    last.stats.toughnessBase += powerIncreaseAmount(last.stats.toughnessBase, first);
  } else { // first guy missed
    roundLog[firstIs+'Dealt'] = 0;
  }

  if (last.stats.hp <= 0) { // the last is dead!!!
    endFight(fight, first, last);
    return;
  }

  // last guy's turn to roll
  let lastHit = false;
  if (fight[lastIs+'Style'] != 'flee' && last.stats.energy >= 0) {
    lastHit = rollToHit(last, first, lastWeapon, firstHit);
    last.stats.accuracyBase += skillIncreaseAmount(last.stats.accuracyBase, first);
    if (lastWeapon)
      last.stats.weapon[lastWeapon.weaponType()+'Base'] += skillIncreaseAmount(last.stats.weapon[lastWeapon.weaponType()+'Base'], last);
    first.stats.agilityBase += skillIncreaseAmount(first.stats.agilityBase, last);
  }
  roundLog[lastIs+'Hit'] = lastHit;

  if( lastHit ) {
    const damage = aDamagesB(fight, last, first, lastWeapon);
    first.stats.hp -= damage
    roundLog[lastIs+'Dealt'] = damage;
    last.stats.strengthBase += powerIncreaseAmount(last.stats.strengthBase, first);
    first.stats.toughnessBase += powerIncreaseAmount(first.stats.toughnessBase, last);
  } else {
    roundLog[lastIs+'Dealt'] = 0;
  }

  if (first.stats.hp <= 0) { // the first is dead!!!
    endFight(fight, first, last);
    return;
  }

  // update all the users records in Mongo
  Characters.update(first._id, {$set: {stats: first.stats}});
  Characters.update(last._id, {$set: {stats: last.stats}});
  Fights.update(fightId, {$inc: {round: 1}, $push: {rounds: roundLog}, $set: {attackerReady: false, defenderReady: false}});

  // handle AIs making their next move
  _.each([first,last], function(character){
    if (character.team == aiTeam) {
      monsterConfig[character.monsterKey].setFightStrategy(fight, character, Fights);
    }
  });

  // and finally, trigger the countDown again
  countDownToRound(fightId);
}

function endFight(fight, first, last) {
  if (first.stats.hp <= 0) {
    first.deaths.recentlyDead = true;
    first.deaths.diedAt = Date.now();
    first.deaths.count += 1;
    var obj = {};
    obj[last.team+'.kills'] = 1;
    if (first.team != aiTeam && last.team != first.team) {
      obj[last.team+'.score'] = ranksConfig[first.stats.rank].value; // your team gains as many points as the opponent's rank in his team is worth
    }
    if (first.team == aiTeam) {
      updateKillMissions(last, first);
    }
    Games.update(first.gameId, {$inc: obj});
    const newLocation = {x: first.location.x, y: first.location.y, roomId: first.location.roomId, updatedAt: Date.now()};
    Items.update({ownerId: first._id}, {$set: {equipped: false, ownerId: null, location: newLocation}}, {multi: true});
  }
  if (last.stats.hp <= 0) {
    last.deaths.recentlyDead = true;
    last.deaths.diedAt = Date.now();
    last.deaths.count += 1;
    var obj = {};
    obj[first.team+'.kills'] = 1;
    if (last.team != aiTeam && last.team != first.team) {
      obj[first.team+'.score'] = ranksConfig[last.stats.rank].value; // your team gains as many points as the opponent's rank in his team is worth
    }
    if (last.team == aiTeam) {
      updateKillMissions(first, last);
    }
    Games.update(first.gameId, {$inc: obj});
    const newLocation = {x: last.location.x, y: last.location.y, roomId: last.location.roomId, updatedAt: Date.now()};
    Items.update({ownerId: last._id}, {$set: {equipped: false, ownerId: null, location: newLocation}}, {multi: true});
  }
  Fights.remove(fight._id);
  Characters.update(first._id, {$set: {stats: first.stats, 'deaths': first.deaths, lastFightEndedAt: Date.now()}});
  Characters.update(last._id, {$set: {stats: last.stats, 'deaths': last.deaths, lastFightEndedAt: Date.now()}});
}

function updateKillMissions(killer, monster) {
  const missions = Missions.find({completed: false, ownerId: killer._id, type: missionsConfig.killMonster.key, 'conditions.monsterKey': monster.monsterKey});
  missions.forEach(function(mission){
    if (mission.conditions.killCount + 1 >= mission.conditions.amount) {
      mission.finish(killer);
    } else {
      Missions.update(mission._id, {$inc: {'conditions.killCount': 1}})
    }
  })
}

function combatOrder(fight, a, b, aW, bW) {
  var aSpeed = attackSpeed(fight.attackerStyle, a, aW);
  var bSpeed = attackSpeed(fight.defenderStyle, b, bW);

  if (aSpeed > bSpeed) // higher speed means faster
    return [a, b];
  else
    return [b, a];
}

function attackSpeed(style, character, weapon) {
  var weaponClassSpeed = speeds.hands;
  if (weapon)
    weaponClassSpeed = speeds[weapon.weaponType()];
  return (10 - styleFactors[style]) * weaponClassSpeed;
}

// a is the attacker
// b is the defender
// missBonus is a boolean for if the odds are easier because someone missed previously.
function rollToHit(a, b, aWeapon, missBonus) {
  const skillDiff = a.stats.accuracy + a.stats.weapon[aWeapon ? aWeapon.weaponType() : 'hands'] - b.stats.agility; // should essentially be bounded from 200 to -100
  // special equation makes skill differentials exponentially more important
  let maximumRollToHit = 75 + (0.125 * skillDiff) ;
  if (missBonus == true)
    maximumRollToHit += 10; // easier to hit someone who just missed
  else if (missBonus === false)
    maximumRollToHit -= 20; // really hard to hit someone who just hit you

  const roll = (Math.random() * 100);

  return roll < maximumRollToHit;
}

function aDamagesB(fight, a, b, aWeapon) {
  const style = fight.attackerId == a._id ? fight.attackerStyle : fight.defenderStyle;
  const styleFactor = styleFactors[style];
  const strDiff = a.stats.strength - b.stats.toughness;
  const weaponDmg = aWeapon ? aWeapon.damageDealt() : 0;
  const items = Items.find({ownerId: b._id, equipped: true}).fetch();
  const armorDmgEffect = _.reduce(items, function(memo, item) {return memo + item.damageTaken();}, 0);
  // calc the damage
  return Math.max(Math.round(styleFactor + weaponDmg + armorDmgEffect + (0.125 * strDiff)), 0); //never do negative dmg
}

function skillIncreaseAmount(trainee, trainer) {
  return Math.pow( Math.E, (-1 * trainee / 20) );
}
function powerIncreaseAmount(trainee, trainer) {
  return Math.pow( Math.E, (-1 * trainee / 10) );
}
