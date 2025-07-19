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

  // Custom input for all tabs
  const [customInput, setCustomInput] = useState('');
  // Track when to trigger search
  const [searchTrigger, setSearchTrigger] = useState('');

  // Helper: Extract last 1-3 words from lastWord
  function getLastWords(str: string, count: number) {
    if (!str) return '';
    const words = str.trim().split(/\s+/);
    return words.slice(-count).join(' ');
  }

  // Helper: Remove duplicates from array
  function unique(arr: string[]) {
    return Array.from(new Set(arr));
  }

  // Fetch function for all tabs
  function fetchWords(type: 'rhyme' | 'syn' | 'ant' | 'simile', phrase: string, setResult: (arr: string[]) => void) {
    if (!phrase) {
      setResult([]);
      return;
    }
    setIsLoading(true);
    let url = '';
    if (type === 'rhyme') url = `https://api.datamuse.com/words?rel_rhy=${encodeURIComponent(phrase)}&max=30`;
    else if (type === 'syn') url = `https://api.datamuse.com/words?rel_syn=${encodeURIComponent(phrase)}&max=30`;
    else if (type === 'ant') url = `https://api.datamuse.com/words?rel_ant=${encodeURIComponent(phrase)}&max=30`;
    else if (type === 'simile') url = `https://api.datamuse.com/words?ml=like+${encodeURIComponent(phrase)}&max=30`;
    fetch(url)
      .then(res => res.json())
      .then((data) => {
        setResult(data.map((w: any) => w.word));
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }

  // Main effect: update results for all tabs, but only when searchTrigger changes
  useEffect(() => {
    if (tab === 'rhyme') {
      // If custom input, use it; else mix rhymes for last 1, 2, 3 words
      if (searchTrigger) {
        fetchWords('rhyme', searchTrigger, setWords);
      } else if (!customInput.trim()) {
        // Fetch for last 1, 2, 3 words, then merge
        const promises = [1, 2, 3].map(n => {
          const phrase = getLastWords(lastWord, n);
          if (!phrase) return Promise.resolve([]);
          return fetch(`https://api.datamuse.com/words?rel_rhy=${encodeURIComponent(phrase)}&max=30`)
            .then(res => res.json())
            .then((data) => data.map((w: any) => w.word))
            .catch(() => []);
        });
        setIsLoading(true);
        Promise.all(promises).then(results => {
          setWords(unique([].concat(...results)));
          setIsLoading(false);
        });
      }
    } else if (tab === 'syn') {
      if (searchTrigger) {
        fetchWords('syn', searchTrigger, setWords);
      } else if (!customInput.trim()) {
        fetchWords('syn', lastWord, setWords);
      }
    } else if (tab === 'ant') {
      if (searchTrigger) {
        fetchWords('ant', searchTrigger, setWords);
      } else if (!customInput.trim()) {
        fetchWords('ant', lastWord, setWords);
      }
    } else if (tab === 'simile') {
      if (searchTrigger) {
        fetchWords('simile', searchTrigger, setWords);
      } else if (!customInput.trim()) {
        fetchWords('simile', lastWord, setWords);
      }
    }
    // eslint-disable-next-line
  }, [lastWord, tab, searchTrigger]);

  // Saved lines that rhyme (unchanged)
  useEffect(() => {
    if (!lastWord || tab !== 'rhyme') {
      setSuggestions([]);
      return;
    }
    fetch(`https://api.datamuse.com/words?rel_rhy=${encodeURIComponent(getLastWords(lastWord, 1))}&max=30`)
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

  if (!lastWord && !customInput) {
    return (
      <div className="w-full bg-gray-800 p-2 text-gray-400 text-xs">
        Type a word to see suggestions
      </div>
    );
  }

  // Handler for custom input
  function handleCustomInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCustomInput(e.target.value);
  }

  // Handler for key events
  function handleCustomInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (tab === 'rhyme' || tab === 'syn') {
      // Update on Space or Enter
      if (e.key === ' ' || e.key === 'Enter') {
        // Only trigger if last char is not a space (avoid double space)
        if (customInput.trim()) {
          setSearchTrigger(customInput.trim());
        }
      }
    } else if (tab === 'ant' || tab === 'simile') {
      // Only update on Enter
      if (e.key === 'Enter') {
        if (customInput.trim()) {
          setSearchTrigger(customInput.trim());
        }
      }
    }
  }

  // Handler for blur (input loses focus)
  function handleCustomInputBlur() {
    if (customInput.trim()) {
      setSearchTrigger(customInput.trim());
    }
  }

  return (
    <div className="w-full bg-gray-800 flex flex-col h-full">
      <div className="p-2 border-b border-gray-700 flex gap-2">
        <button className={`text-[10px] px-1.5 py-0.5 rounded-sm ${tab==='rhyme' ? 'bg-orange-400 text-black' : 'bg-gray-700 text-gray-200'}`} onClick={()=>setTab('rhyme')}>Rhymes</button>
        <button className={`text-[10px] px-1.5 py-0.5 rounded-sm ${tab==='syn' ? 'bg-orange-400 text-black' : 'bg-gray-700 text-gray-200'}`} onClick={()=>setTab('syn')}>Synonyms</button>
        <button className={`text-[10px] px-1.5 py-0.5 rounded-sm ${tab==='ant' ? 'bg-orange-400 text-black' : 'bg-gray-700 text-gray-200'}`} onClick={()=>setTab('ant')}>Antonyms</button>
        <button className={`text-[10px] px-1.5 py-0.5 rounded-sm ${tab==='simile' ? 'bg-orange-400 text-black' : 'bg-gray-700 text-gray-200'}`} onClick={()=>setTab('simile')}>Similes</button>
      </div>
      {/* Custom input for all tabs */}
      <div className="p-2 border-b border-gray-700 flex flex-col gap-2">
        <input
          type="text"
          value={customInput}
          onChange={handleCustomInputChange}
          onKeyDown={handleCustomInputKeyDown}
          onBlur={handleCustomInputBlur}
          placeholder={`Type a word or phrase for ${tab === 'rhyme' ? 'rhymes' : tab === 'syn' ? 'synonyms' : tab === 'ant' ? 'antonyms' : 'similes'}...`}
          className="w-full px-2 py-1 rounded bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-orange-400 text-xs mb-1"
        />
        <h4 className="text-gray-300 text-xs font-semibold mb-1">
          {customInput ? `${tab.charAt(0).toUpperCase() + tab.slice(1)} for "${customInput}"` : tab === 'rhyme' ? 'Rhymes for last words' : `${tab.charAt(0).toUpperCase() + tab.slice(1)} for last word`}
        </h4>
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
      {/* Saved lines that rhyme (unchanged) */}
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