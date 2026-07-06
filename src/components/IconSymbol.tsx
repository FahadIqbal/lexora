import React from 'react';
import { Text } from 'react-native';
import { Image } from 'expo-image';

export function IconSymbol({
  name,
  fallback,
  color,
  size = 20,
}: {
  name: string;
  fallback: string;
  color: string;
  size?: number;
}) {
  if (process.env.EXPO_OS === 'ios') {
    return (
      <Image
        source={`sf:${name}`}
        tintColor={color}
        style={{ width: size, height: size }}
        contentFit="contain"
      />
    );
  }

  return <Text style={{ color, fontSize: Math.round(size * 0.88), lineHeight: size }}>{fallback}</Text>;
}
