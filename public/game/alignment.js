export const ALIGNMENT_MIN=0,ALIGNMENT_MAX=1000,ALIGNMENT_NEUTRAL=500;
export const alignmentScore = state => state.alignment ?? 0;
export const alignmentPoints = state => Number.isInteger(state.alignmentPoints)?state.alignmentPoints:Math.max(ALIGNMENT_MIN,Math.min(ALIGNMENT_MAX,ALIGNMENT_NEUTRAL+alignmentScore(state)*5));
export const alignmentLocked = state => alignmentPoints(state)===ALIGNMENT_MIN&&state.flags?.evilAlignmentLocked===true;
export const alignmentLabel = score => score > 0 ? 'Good' : score < 0 ? 'Evil' : 'Neutral';
export const alignmentIsNeutral = state => state.exploration?.area?.startsWith('planet-') || state.dungeon?.expedition?.startsWith('planet-');

export function adjustAlignment(state, change) {
  const shifted=applyAlignmentImpact(state,change*5);
  return Math.trunc(shifted/5);
}

export function applyAlignmentImpact(state, points, reason=''){
 if(!Number.isFinite(points)||alignmentIsNeutral(state)||alignmentLocked(state)&&points>0)return 0;
 const before=alignmentPoints(state),next=Math.max(ALIGNMENT_MIN,Math.min(ALIGNMENT_MAX,before+points));
 state.alignmentPoints=next;state.alignment=Math.round((next-ALIGNMENT_NEUTRAL)/5);
 if(next===ALIGNMENT_MIN){state.flags??={};state.flags.evilAlignmentLocked=true;}
 if(next===ALIGNMENT_MAX){state.flags??={};state.flags.chosenPaladin=true;}
 if(points<0&&state.flags?.chosenPaladin)delete state.flags.chosenPaladin;
 return next-before;
}

export function alignmentShiftMessage(before, after) {
 const change = Number.isInteger(before?.alignmentPoints) || Number.isInteger(after?.alignmentPoints)
  ? alignmentPoints(after) - alignmentPoints(before)
  : alignmentScore(after) - alignmentScore(before);
 return change ? `Your alignment shifted toward the ${change > 0 ? 'good' : 'evil'}!` : null;
}

export const paladinAlignmentAllowed = state => alignmentScore(state) >= 0;
export const wizardAlignmentAllowed = state => alignmentScore(state) >= -20;
