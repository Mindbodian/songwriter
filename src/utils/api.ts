import { RhymeWord } from './types';

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