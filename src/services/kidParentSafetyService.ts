import type { KidRuntimeState } from './kidLearningService';

export type KidParentGateChallenge = {
  prompt: string;
  answer: string;
  expiresInMinutes: number;
};

const GATE_TTL_MS = 15 * 60 * 1000;

export function getKidParentGateChallenge(kid: KidRuntimeState, now = Date.now()): KidParentGateChallenge {
  const profileSeed = kid.activeProfileId?.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) ?? 17;
  const day = Math.floor(now / 86_400_000);
  const left = 7 + ((profileSeed + day) % 8);
  const right = 4 + ((profileSeed * 3 + day) % 7);
  return {
    prompt: `${left} + ${right}`,
    answer: String(left + right),
    expiresInMinutes: GATE_TTL_MS / 60_000,
  };
}

export function verifyKidParentGateAnswer(kid: KidRuntimeState, answer: string, now = Date.now()) {
  const challenge = getKidParentGateChallenge(kid, now);
  return answer.trim() === challenge.answer;
}

export function isKidParentGateOpen(kid: KidRuntimeState, now = Date.now()) {
  if (!kid.parentGatePassedAt) return false;
  return now - kid.parentGatePassedAt < GATE_TTL_MS;
}
