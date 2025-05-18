import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ThesaurusProps {
  isOpen: boolean;
  onClose: () => void;
  initialWord?: string;
  onSelectWord: (word: string) => void;
}

interface ThesaurusEntry {
  word: string;
  partOfSpeech: string;
  synonyms: string[];
}

export function Thesaurus({ isOpen, onClose, initialWord = '', onSelectWord }: ThesaurusProps) {
  const [searchWord, setSearchWord] = useState(initialWord);
  const [results, setResults] = useState<ThesaurusEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchThesaurus = async () => {
      if (!searchWord.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://api.datamuse.com/words?rel=syn&ml=${encodeURIComponent(searchWord)}`
        );
        const data = await response.json();
        
        // Group by part of speech if available
        const groupedResults: ThesaurusEntry[] = [];
        const words = data.slice(0, 30); // Limit to top 30 results
        
        if (words.length === 0) {
          setError('No synonyms found for this word.');
          setResults([]);
          return;
        }

        // Group words by part of speech if available
        const grouped = words.reduce((acc: any, word: any) => {
          const pos = word.tags?.find((tag: string) => tag.startsWith('n.') || tag.startsWith('v.') || tag.startsWith('adj.') || tag.startsWith('adv.')) || 'misc.';
          if (!acc[pos]) {
            acc[pos] = [];
          }
          acc[pos].push(word.word);
          return acc;
        }, {});

        Object.entries(grouped).forEach(([pos, words]: [string, any]) => {
          groupedResults.push({
            word: searchWord,
            partOfSpeech: pos,
            synonyms: words
          });
        });

        setResults(groupedResults);
      } catch (err) {
        setError('Failed to fetch synonyms. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    searchThesaurus();
  }, [searchWord]);

  const handleSynonymClick = (synonym: string) => {
    onSelectWord(synonym);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Thesaurus</h2>
          <button
            onClick={onClose}
            className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            aria-label="Close thesaurus"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>
        
        <div className="p-4 border-b">
          <input
            type="text"
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
            placeholder="Enter a word to find synonyms..."
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center p-4">{error}</div>
          ) : results.length > 0 ? (
            <div className="space-y-6">
              {results.map((entry, index) => (
                <div key={index} className="space-y-2">
                  <h3 className="font-medium text-gray-700">
                    {entry.partOfSpeech.replace('.', '')}:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {entry.synonyms.map((synonym, i) => (
                      <button
                        key={i}
                        onClick={() => handleSynonymClick(synonym)}
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-sm transition-colors"
                      >
                        {synonym}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : searchWord ? (
            <div className="text-gray-500 text-center p-4">
              Start typing to see synonyms...
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
} 