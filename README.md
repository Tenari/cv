Coalition Victory, in meteor, one more time.

# Setup
1. install [node](https://nodejs.org/en/download/)
2. install [meteor](https://www.meteor.com/install)
3. clone the repo `git clone https://github.com/Tenari/cv.git`
4. run `meteor` from the project directory
5. go to [http://localhost:3000/](http://localhost:3000/) in Chrome

# Essential concepts

The game is meant to feel like playing Pokemon and other classic JRPGs of old, combined with a multi-player team-focus derived from Pardus (or World of Warcraft).

The setting is generic "ancient times." Fantasy elements like magic and powers and monsters are rare/intended to be added in a later version.

The game is meant to be very competitive/harsh in nature in contrast to runescape where you basically live in your bubble and nothing you do has any consequences.

The game is not an "endless open world." It starts and ends in rounds (of say, 2 weeks). This is to prevent political stagnation and to make introducing new features easier.

# Tone/Feel
- competitive (there is a winner/loser)
- hard (the game is relatively un-forgiving + penalizes you fairly hard for dying)
- co-operative (you cannot win/dominate by yourself)
- nostalgic (like pokemon)

I think firefly is a good model for tone here. There will be jokes built into it, but generally it is a more serious kind of feel.

The tone is NOT:

- happy-go-lucky like my little pony
- pure comedy like south park
- devils and darkness like diablo 2
- mass spastic chaos like doom video games or hardcore henry

In one sentence I would describe it as "slightly more self-aware, competitive pokemon"

# Design specifications for beta candidate

_(in no particular order)_

- sales page that looks professional
- character creation + tutorial flow
- game features:
    - [moving](#moving)
    - [fighting](#fighting)
    - collecting [resources](#resources)
    - making [items](#items)
    - interacting (trading/talking) with NPCs
    - ai monsters
    - 2 cities + wildernes in between
    - stat progressions/display page
    - character item equips
    - game-wide events/plot (find the [MacGuffin](http://tvtropes.org/pmwiki/pmwiki.php/Main/MacGuffin), then fight over it/steal it for your team)
- account + character management screens
- pay to play past your first game/character

## Moving

- `W`,`A`,`S`, and `D` move the player from tile to tile in the world similar to how moving around in pokemon games feels.
- The character animates when he moves
- moving uses up energy, which when depleted, prevents the player from moving any further

## Fighting

- Fighting is turn-based, but turns happen automatically on a timer of 5 seconds
- 4 attack styles: quick, normal, heavy, block
- characters animate when they attack/hit/get hit
- equipped weapons affect attack speed (who attacks first) and attack damage
- character skill levels affect attack accuracy and attack damage
- a convineint log of past turns of combat exists

## Resources

- wood, hide, leather, ore, and metal

## Items

- Weapons
    - hands
    - small blades
    - large blades
    - axes
- Armor
- Single use
    - food: heals HP
    - drinks: restore energy
