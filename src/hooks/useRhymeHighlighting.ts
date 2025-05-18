import { useState, useEffect } from 'react';
import { RhymeWord } from '../utils/types';
import { fetchRhymes } from '../utils/api';

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