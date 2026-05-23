import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { WordDetailScreen } from '../../src/screens/WordDetailScreen';

export default function WordDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <WordDetailScreen id={String(id)} />;
}

