export const alignmentScore = state => state.alignment ?? 0;
export const alignmentLabel = score => score > 0 ? 'Good' : score < 0 ? 'Evil' : 'Neutral';

export function adjustAlignment(state, change) {
  state.alignment = Math.max(-100, Math.min(100, alignmentScore(state) + change));
}

export function alignmentShiftMessage(before, after) {
 const change = alignmentScore(after) - alignmentScore(before);
 return change ? `Your alignment shifted toward the ${change > 0 ? 'good' : 'evil'}!` : null;
}

export const paladinAlignmentAllowed = state => alignmentScore(state) >= 0;
export const wizardAlignmentAllowed = state => alignmentScore(state) >= -20;
