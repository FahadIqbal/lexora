import * as Haptics from 'expo-haptics';

const canHaptic = process.env.EXPO_OS !== 'web';

export function hapticSelection() {
  if (!canHaptic) return;
  Haptics.selectionAsync().catch(() => {});
}

export function hapticImpact(style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) {
  if (!canHaptic) return;
  Haptics.impactAsync(style).catch(() => {});
}

export function hapticNotify(type: Haptics.NotificationFeedbackType) {
  if (!canHaptic) return;
  Haptics.notificationAsync(type).catch(() => {});
}

export { Haptics };
