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
  const [words, setWords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tab, setTab] = useState<'rhyme' | 'syn' | 'ant' | 'simile'>('rhyme');

  useEffect(() => {
    if (!lastWord) return;
    setIsLoading(true);
    let url = '';
    if (tab === 'rhyme') url = `https://api.datamuse.com/words?rel_rhy=${encodeURIComponent(lastWord)}&max=20`;
    else if (tab === 'syn') url = `https://api.datamuse.com/words?rel_syn=${encodeURIComponent(lastWord)}&max=20`;
    else if (tab === 'ant') url = `https://api.datamuse.com/words?rel_ant=${encodeURIComponent(lastWord)}&max=20`;
    else if (tab === 'simile') url = `https://api.datamuse.com/words?ml=like+${encodeURIComponent(lastWord)}&max=20`;
    fetch(url)
      .then(res => res.json())
      .then((data) => {
        setWords(data.map((w: any) => w.word));
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [lastWord, tab]);

  useEffect(() => {
    if (!lastWord) return;
    // Only for rhyme tab, show saved lines that rhyme
    if (tab !== 'rhyme') {
      setSuggestions([]);
      return;
    }
    fetch(`https://api.datamuse.com/words?rel_rhy=${encodeURIComponent(lastWord)}&max=20`)
      .then(res => res.json())
      .then((rhymes) => {
        const words = rhymes.map((r: any) => r.word);
        const rhymingSuggestions = savedLines.filter(line => {
          const lastWordOfLine = line.trim().split(' ').pop()?.toLowerCase();
          return words.some((w: string) => w.toLowerCase() === lastWordOfLine);
        });
        setSuggestions(rhymingSuggestions);
      });
  }, [lastWord, savedLines, tab]);

  if (!lastWord) {
    return (
      <div className="w-full bg-gray-800 p-2 text-gray-400 text-xs">
        Type a word to see suggestions
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-800 flex flex-col h-full">
      <div className="p-2 border-b border-gray-700 flex gap-2">
        <button className={`text-[10px] px-1.5 py-0.5 rounded-sm ${tab==='rhyme' ? 'bg-orange-400 text-black' : 'bg-gray-700 text-gray-200'}`} onClick={()=>setTab('rhyme')}>Rhymes</button>
        <button className={`text-[10px] px-1.5 py-0.5 rounded-sm ${tab==='syn' ? 'bg-orange-400 text-black' : 'bg-gray-700 text-gray-200'}`} onClick={()=>setTab('syn')}>Synonyms</button>
        <button className={`text-[10px] px-1.5 py-0.5 rounded-sm ${tab==='ant' ? 'bg-orange-400 text-black' : 'bg-gray-700 text-gray-200'}`} onClick={()=>setTab('ant')}>Antonyms</button>
        <button className={`text-[10px] px-1.5 py-0.5 rounded-sm ${tab==='simile' ? 'bg-orange-400 text-black' : 'bg-gray-700 text-gray-200'}`} onClick={()=>setTab('simile')}>Similes</button>
      </div>
      <div className="p-2 border-b border-gray-700">
        <h3 className="text-gray-300 text-xs font-medium mb-1">
          {tab === 'rhyme' && `Rhyming Words:`}
          {tab === 'syn' && `Synonyms:`}
          {tab === 'ant' && `Antonyms:`}
          {tab === 'simile' && `Similes (words with similar meaning):`}
        </h3>
        {isLoading ? (
          <div className="text-gray-400 text-xs">Loading...</div>
        ) : words.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {words.map((word, index) => (
              <span key={index} className="bg-gray-700 text-gray-300 text-xs px-1.5 py-0.5 rounded">
                {word}
              </span>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 text-xs">No results found</div>
        )}
      </div>
      {tab === 'rhyme' && (
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
      )}
    </div>
  );
}