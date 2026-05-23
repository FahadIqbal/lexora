import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { SpeedMatchGame } from '../../src/screens/games/SpeedMatchGame';
import { FillBlankGame } from '../../src/screens/games/FillBlankGame';
import { ScrambleGame } from '../../src/screens/games/ScrambleGame';
import { DefinitionTypeGame } from '../../src/screens/games/DefinitionTypeGame';
import { TrueFalseGame } from '../../src/screens/games/TrueFalseGame';
import { WordChainGame } from '../../src/screens/games/WordChainGame';
import { Screen } from '../../src/components/Screen';
import { LexText } from '../../src/components/LexText';

export default function GameRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const s = String(slug);

  switch (s) {
    case 'speed-match':
      return <SpeedMatchGame />;
    case 'fill-blank':
      return <FillBlankGame />;
    case 'scramble':
      return <ScrambleGame />;
    case 'definition-type':
      return <DefinitionTypeGame />;
    case 'true-false':
      return <TrueFalseGame />;
    case 'word-chain':
      return <WordChainGame />;
    default:
      return (
        <Screen>
          <LexText variant="h2" style={{ padding: 18 }}>
            Game not found
          </LexText>
        </Screen>
      );
  }
}

