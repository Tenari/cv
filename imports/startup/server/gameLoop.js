import { Meteor } from 'meteor/meteor';

import { Fights } from '../../api/fights/fights.js';
import { Characters } from '../../api/characters/characters.js';

import { styleFactors, fightEnergyCostFactor, speeds } from '../../configs/game.js';

Meteor.setInterval(fightLoop, 5000);

function fightLoop(){
  Fights.find({}).forEach(function(fight, index, cursor){
    var roundLog = {round: fight.round};
    let attacker = Characters.findOne(fight.attackerId);
    let defender = Characters.findOne(fight.defenderId);

    //TODO: handle people trying to flee

    // lower energies by appropriate amounts
    attacker.stats.energy = attacker.stats.energy - (fightEnergyCostFactor * styleFactors[fight.attackerStyle]);
    defender.stats.energy = defender.stats.energy - (fightEnergyCostFactor * styleFactors[fight.defenderStyle]);

    // calculate the user's functional/current stats
    attacker.stats.strength = attacker.stats.baseStrength; // + weapon modifications, buffs, etc..
    attacker.stats.accuracy = attacker.stats.baseAccuracy;
    attacker.stats.agility = attacker.stats.baseAgility;
    attacker.stats.toughness = attacker.stats.baseToughness;
    defender.stats.strength = defender.stats.baseStrength;
    defender.stats.accuracy = defender.stats.baseAccuracy;
    defender.stats.agility = defender.stats.baseAgility;
    defender.stats.toughness = defender.stats.baseToughness;

    // determine combat order (based on attackspeed, which comes from their weapon and proficiency)
    var order = combatOrder(fight, attacker, defender);
    var first = order[0];
    var last = order[1];
    const firstIs = first._id == attacker._id ? 'attacker' : 'defender';
    const lastIs = last._id == attacker._id ? 'attacker' : 'defender';

    // TODO: check for blocks and counters

    // roll first guy's attempt to hit
    const firstHit = rollToHit(first, last);
    first.stats.baseAccuracy += skillIncreaseAmount(first.stats.baseAccuracy, last);
    last.stats.baseAgility += skillIncreaseAmount(last.stats.baseAgility, first);
    roundLog[firstIs+'Hit'] = firstHit;

    if (firstHit) { // calc damage
      const damage = aDamagesB(fight, first, last);
      last.stats.hp -= damage;
      roundLog[firstIs+'Dealt'] = damage;
      first.stats.baseStrength += powerIncreaseAmount(first.stats.baseStrength, last);
      last.stats.baseToughness += powerIncreaseAmount(last.stats.baseToughness, first);
    } else { // first guy missed
      roundLog[firstIs+'Dealt'] = 0;
    }

    if (last.stats.hp <= 0) { // the last is dead!!!
      last.recentlyDead = true;
      endFight(fight, first, last);
      return;
    }

    // last guy's turn to roll
    const lastHit = rollToHit(last, first, firstHit);
    last.stats.baseAccuracy += skillIncreaseAmount(last.stats.baseAccuracy, first);
    first.stats.baseAgility += skillIncreaseAmount(first.stats.baseAgility, last);
    roundLog[lastIs+'Hit'] = lastHit;

    if( lastHit ) {
      const damage = aDamagesB(fight, last, first);
      first.stats.hp -= damage
      roundLog[lastIs+'Dealt'] = damage;
      last.stats.baseStrength += powerIncreaseAmount(last.stats.baseStrength, first);
      first.stats.baseToughness += powerIncreaseAmount(first.stats.baseToughness, last);
    } else {
      roundLog[lastIs+'Dealt'] = 0;
    }

    if (first.stats.hp <= 0) { // the first is dead!!!
      first.recentlyDead = true;
      endFight(fight, first, last);
      return;
    }
    
    // update all the users records in Mongo
    Characters.update(first._id, {$set: {stats: first.stats}});
    Characters.update(last._id, {$set: {stats: last.stats}});
    console.log(roundLog);
    Fights.update(fight._id, {$inc: {round: 1}, $push: {rounds: roundLog}});
  }); 
}

function endFight(fight, first, last) {
  Fights.remove(fight._id);
  Characters.update(first._id, {$set: {stats: first.stats, recentlyDead: first.recentlyDead}});
  Characters.update(last._id, {$set: {stats: last.stats, recentlyDead: last.recentlyDead}});
}

// a is the attacker
// b is the defender
// missBonus is a boolean for if the odds are easier because someone missed previously.
function rollToHit(a, b, missBonus) {
  const skillDiff = a.stats.accuracy - b.stats.agility; // should essentially be bounded from 100 to -100
  // special equation makes skill differentials exponentially more important
  let maximumRollToHit = 12 * Math.pow( Math.E, (skillDiff * 0.0203)) + 4;
  if (missBonus)
    maximumRollToHit += 10; // easier to hit someone who just missed

  const roll = (Math.random() * 100);

  return roll < maximumRollToHit;
}

function aDamagesB(fight, a, b) {
  const style = fight.attackerId == a._id ? fight.attackerStyle : fight.defenderStyle;
  const styleFactor = styleFactors[style];
  const strDiff = a.stats.strength - b.stats.toughness;
  // calc the damage
  return Math.round(5 * Math.pow( Math.E, (strDiff * 0.038)));
}

function skillIncreaseAmount(trainee, trainer) {
  return Math.pow( Math.E, (-1 * trainee / 20) );
}
function powerIncreaseAmount(trainee, trainer) {
  return Math.pow( Math.E, (-1 * trainee / 10) );
}

function combatOrder(fight, a, b) {
  var aSpeed = attackSpeed(fight.attackerStyle);
  var bSpeed = attackSpeed(fight.defenderStyle);

  if (aSpeed > bSpeed) // higher speed means faster
    return [a, b];
  else
    return [b, a];
}

function attackSpeed(style) {
  var weaponClassSpeed = 4;
  var weapon = null;//Items.findOne({owner: user._id, equipped: true, equip: 'left-hand'});
  if (weapon)
    weaponClassSpeed = speeds[weapon.type];
  return (10 - styleFactors[style]) * weaponClassSpeed;
}
