import React, { Fragment } from 'react';
import { RhymeWord } from '../utils/types';

interface RhymeHighlightProps {
  text: string;
  rhymingWords: RhymeWord[];
}

export function RhymeHighlight({ text, rhymingWords }: RhymeHighlightProps): JSX.Element {
  if (!text || !rhymingWords.length) {
    return <Fragment>{text}</Fragment>;
  }

  const words = text.split(/\b/);
  
  return (
    <Fragment>
      {words.map((word, index) => {
        const isRhyming = rhymingWords.some(
          rhyme => rhyme.word.toLowerCase() === word.toLowerCase()
        );
        
        return (
          <span
            key={index}
            className={isRhyming ? 'text-green-600 font-medium' : undefined}
          >
            {word}
          </span>
        );
      })}
    </Fragment>
  );
}