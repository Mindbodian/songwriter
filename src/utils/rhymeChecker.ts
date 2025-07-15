import { useEffect, useState } from 'react';
import { Fragment } from 'react';

interface RhymeWord {
  word: string;
  score: number;
  numSyllables?: number;
}

export async function fetchRhymes(word: string): Promise<RhymeWord[]> {
  if (!word.trim()) return [];
  
  try {
    const [perfectRhymes, nearRhymes] = await Promise.all([
      fetch(`https://api.datamuse.com/words?rel_rhy=${encodeURIComponent(word)}`).then(res => res.json()),
      fetch(`https://api.datamuse.com/words?rel=nry&ml=${encodeURIComponent(word)}`).then(res => res.json())
    ]);
    
    return [...perfectRhymes, ...nearRhymes];
  } catch (error) {
    console.error('Error fetching rhymes:', error);
    return [];
  }
}

export function highlightRhymingWords(text: string, rhymingWords: RhymeWord[]): JSX.Element {
  if (!text || !rhymingWords.length) return <Fragment>{text}</Fragment>;

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

export function useRhymeHighlighting(lastWord: string) {
  const [rhymingWords, setRhymingWords] = useState<RhymeWord[]>([]);

  useEffect(() => {
    if (!lastWord) {
      setRhymingWords([]);
      return;
    }

    const loadRhymes = async () => {
      const words = await fetchRhymes(lastWord);
      setRhymingWords(words);
    };

    loadRhymes();
  }, [lastWord]);

  return rhymingWords;
}