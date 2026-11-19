import {evilEmpowered} from './evil-route.js';

export function beginEvilTakeover(state, defeated, note) {
  if (!evilEmpowered(state) || state.location !== 'bellwether'
    || !state.flags?.['garrison:0'] || defeated?.castleRoyalDefense !== 'king'
    || defeated.groupSize !== 12) return false;
  state.flags.castleRoyalGuardsDefeated = true;
  state.flags.kingFled = true;
  state.flags.kingUsurped = true;
  state.flags.married = true;
  state.flags.evilMarriage = true;
  state.flags.evilRulerTitle = 'Dread Sovereign of Bellwether';
  state.flags['castleBan:bellwether'] = false;
  state.flags['castleFine:bellwether'] = 0;
  if (state.castle) {
    state.castle.alarm = false;
    delete state.castle.guardPositions;
    delete state.castle.guardConsultation;
  }
  state.evilRoute = {version: 1, phase: 'percivalChoice'};
  state.mode = 'town';
  state.returnMode = 'town';
  state.enemy = null;
  note(state, 'King Malachi flees. Princess Bunnyfoot is forced to marry you, and the court cowers before your stolen throne. Stone shatters overhead—Percival, Lord of Paladins, has come to answer your reign.');
  return true;
}
