import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';

import { Fights } from '../../api/fights/fights.js';
import { Items } from '../../api/items/items.js';
import { Characters } from '../../api/characters/characters.js';

import { equipSlots, styleFactors, fightEnergyCostFactor, speeds } from '../../configs/game.js';

export function fightLoop(){
  Fights.find({}).forEach(function(fight, index, cursor){
    var roundLog = {round: fight.round};
    let attacker = Characters.findOne(fight.attackerId);
    let defender = Characters.findOne(fight.defenderId);

    // handle fleeing
    if (fight.attackerStyle == 'flee' && fight.defenderStyle == 'flee'){
      // if everyone wants to flee, the fight is over
      Fights.remove(fight._id);
      return;
    } else if (fight.attackerStyle == 'flee' && Math.random() < 0.6) { // easier for attacker to flee
      Fights.remove(fight._id);
      return;
    } else if (fight.defenderStyle == 'flee' && Math.random() < 0.5) {
      Fights.remove(fight._id);
      return;
    }

    // lower energies by appropriate amounts
    attacker.stats.energy = attacker.stats.energy - (fightEnergyCostFactor * styleFactors[fight.attackerStyle]);
    defender.stats.energy = defender.stats.energy - (fightEnergyCostFactor * styleFactors[fight.defenderStyle]);

    // calculate the user's functional/current stats
    _.each(_.keys(speeds), function(weaponType){
      attacker.stats.weapon[weaponType] = attacker.stats.weapon[weaponType+'Base'];
      defender.stats.weapon[weaponType] = defender.stats.weapon[weaponType+'Base'];
    })
    attacker.stats.strength = attacker.stats.baseStrength; // + weapon modifications, buffs, etc..
    attacker.stats.accuracy = attacker.stats.baseAccuracy;
    attacker.stats.agility = attacker.stats.baseAgility;
    attacker.stats.toughness = attacker.stats.baseToughness;
    defender.stats.strength = defender.stats.baseStrength;
    defender.stats.accuracy = defender.stats.baseAccuracy;
    defender.stats.agility = defender.stats.baseAgility;
    defender.stats.toughness = defender.stats.baseToughness;

    // determine combat order (based on attackspeed, which comes from their weapon and proficiency)
    const attackerWeapon = Items.findOne({ownerId: attacker._id, equipped: true, equipSlot: equipSlots.hand});
    const defenderWeapon = Items.findOne({ownerId: defender._id, equipped: true, equipSlot: equipSlots.hand});
    var order = combatOrder(fight, attacker, defender, attackerWeapon, defenderWeapon);
    var first = order[0];
    var last = order[1];
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
    if (fight[firstIs+'Style'] != 'flee') {
      firstHit = rollToHit(first, last, firstWeapon);
      first.stats.baseAccuracy += skillIncreaseAmount(first.stats.baseAccuracy, last);
      if (firstWeapon)
        first.stats.weapon[firstWeapon.type+'Base'] += skillIncreaseAmount(first.stats.weapon[firstWeapon.type+'Base'], last);
      last.stats.baseAgility += skillIncreaseAmount(last.stats.baseAgility, first);
    }
    roundLog[firstIs+'Hit'] = firstHit;

    if (firstHit) { // calc damage
      const damage = aDamagesB(fight, first, last, firstWeapon);
      last.stats.hp -= damage;
      roundLog[firstIs+'Dealt'] = damage;
      first.stats.baseStrength += powerIncreaseAmount(first.stats.baseStrength, last);
      last.stats.baseToughness += powerIncreaseAmount(last.stats.baseToughness, first);
    } else { // first guy missed
      roundLog[firstIs+'Dealt'] = 0;
    }

    if (last.stats.hp <= 0) { // the last is dead!!!
      endFight(fight, first, last);
      return;
    }

    // last guy's turn to roll
    let lastHit = false;
    if (fight[lastIs+'Style'] != 'flee') {
      lastHit = rollToHit(last, first, lastWeapon, firstHit);
      last.stats.baseAccuracy += skillIncreaseAmount(last.stats.baseAccuracy, first);
      if (lastWeapon)
        last.stats.weapon[lastWeapon.type+'Base'] += skillIncreaseAmount(last.stats.weapon[lastWeapon.type+'Base'], last);
      first.stats.baseAgility += skillIncreaseAmount(first.stats.baseAgility, last);
    }
    roundLog[lastIs+'Hit'] = lastHit;

    if( lastHit ) {
      const damage = aDamagesB(fight, last, first, lastWeapon);
      first.stats.hp -= damage
      roundLog[lastIs+'Dealt'] = damage;
      last.stats.baseStrength += powerIncreaseAmount(last.stats.baseStrength, first);
      first.stats.baseToughness += powerIncreaseAmount(first.stats.baseToughness, last);
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
    Fights.update(fight._id, {$inc: {round: 1}, $push: {rounds: roundLog}});
  }); 
}

function endFight(fight, first, last) {
  if (first.stats.hp <= 0) {
    first.deaths.recentlyDead = true;
    first.deaths.diedAt = Date.now();
    first.deaths.count += 1;
    const newLocation = {x: first.location.x, y: first.location.y, roomId: first.location.roomId, updatedAt: Date.now()};
    Items.update({ownerId: first._id}, {$set: {equipped: false, ownerId: null, location: newLocation}}, {multi: true});
  }
  if (last.stats.hp <= 0) {
    last.deaths.recentlyDead = true;
    last.deaths.diedAt = Date.now();
    last.deaths.count += 1;
    const newLocation = {x: last.location.x, y: last.location.y, roomId: last.location.roomId, updatedAt: Date.now()};
    Items.update({ownerId: last._id}, {$set: {equipped: false, ownerId: null, location: newLocation}}, {multi: true});
  }
  Fights.remove(fight._id);
  Characters.update(first._id, {$set: {stats: first.stats, 'deaths': first.deaths}});
  Characters.update(last._id, {$set: {stats: last.stats, 'deaths': last.deaths}});
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
    weaponClassSpeed = speeds[weapon.type];
  return (10 - styleFactors[style]) * weaponClassSpeed;
}

// a is the attacker
// b is the defender
// missBonus is a boolean for if the odds are easier because someone missed previously.
function rollToHit(a, b, aWeapon, missBonus) {
  const skillDiff = a.stats.accuracy + a.stats.weapon[aWeapon ? aWeapon.type : 'hands'] - b.stats.agility; // should essentially be bounded from 200 to -100
  // special equation makes skill differentials exponentially more important
  let maximumRollToHit = 12 * Math.pow( Math.E, (skillDiff * 0.0203)) + 7;
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
  const weaponDmg = aWeapon ? aWeapon.effectAmount : 0;
  // calc the damage
  return Math.round((styleFactor + weaponDmg) * Math.pow( Math.E, (strDiff * 0.038)));
}

function skillIncreaseAmount(trainee, trainer) {
  return Math.pow( Math.E, (-1 * trainee / 20) );
}
function powerIncreaseAmount(trainee, trainer) {
  return Math.pow( Math.E, (-1 * trainee / 10) );
}

