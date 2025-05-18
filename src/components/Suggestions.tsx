import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';

export interface SuggestionsProps {
  lastWord: string;
  savedLines: string[];
  onSelect: (line: string) => void;
  onClose: () => void;
}

interface RhymeWord {
  word: string;
  score: number;
}

export function Suggestions({ lastWord, savedLines, onSelect }: SuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [rhymingWords, setRhymingWords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const findRhymingWords = async () => {
      if (!lastWord) return;

      setIsLoading(true);
      try {
        // Get rhyming words for the last word
        const response = await fetch(
          `https://api.datamuse.com/words?rel_rhy=${encodeURIComponent(lastWord)}&max=20`
        );
        const rhymes: RhymeWord[] = await response.json();
        
        // Extract just the words
        const words = rhymes.map(rhyme => rhyme.word);
        setRhymingWords(words);
        
        // Find lines from saved ideas that end with rhyming words
        const rhymingSuggestions = savedLines.filter(line => {
          const lastWordOfLine = line.trim().split(' ').pop()?.toLowerCase();
          return rhymes.some(rhyme => 
            rhyme.word.toLowerCase() === lastWordOfLine
          );
        });

        setSuggestions(rhymingSuggestions);
      } catch (error) {
        console.error('Error fetching rhymes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    findRhymingWords();
  }, [lastWord, savedLines]);

  if (!lastWord) {
    return (
      <div className="w-full bg-gray-800 p-2 text-gray-400 text-xs">
        Type a word to see rhyming suggestions
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-800 flex flex-col h-full">
      <div className="p-2 border-b border-gray-700">
        <h2 className="text-orange-300 font-semibold text-sm">Rhymes for: {lastWord}</h2>
      </div>
      
      <div className="p-2 border-b border-gray-700">
        <h3 className="text-gray-300 text-xs font-medium mb-1">Rhyming Words:</h3>
        {isLoading ? (
          <div className="text-gray-400 text-xs">Loading...</div>
        ) : rhymingWords.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {rhymingWords.map((word, index) => (
              <span key={index} className="bg-gray-700 text-gray-300 text-xs px-1.5 py-0.5 rounded">
                {word}
              </span>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 text-xs">No rhyming words found</div>
        )}
      </div>
      
      <div className="p-2 border-b border-gray-700">
        <h3 className="text-gray-300 text-xs font-medium mb-1">Saved Lines:</h3>
        {suggestions.length > 0 ? (
          <div className="space-y-1">
            {suggestions.map((line, index) => (
              <div
                key={index}
                className="group flex items-start p-1 hover:bg-gray-700/50 cursor-pointer border-b border-gray-700/50"
              >
                <button
                  onClick={() => onSelect(line)}
                  className="flex items-center gap-1 w-full text-left"
                >
                  <Plus size={14} className="text-orange-300 opacity-0 group-hover:opacity-100" />
                  <span className="text-gray-300 text-xs">{line}</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 text-xs">No saved lines found</div>
        )}
      </div>
    </div>
  );
}