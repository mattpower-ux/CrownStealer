export const MULTIVERSE_TRANSITION_MS=4000;

export function multiverseTransitionProgress(elapsed){
 return Math.max(0,Math.min(1,elapsed/MULTIVERSE_TRANSITION_MS));
}
