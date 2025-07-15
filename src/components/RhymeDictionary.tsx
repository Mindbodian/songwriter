import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface RhymeDictionaryProps {
  isOpen: boolean;
  onClose: () => void;
  initialWord?: string;
}

interface RhymeWord {
  word: string;
  score: number;
  numSyllables: number;
  tags?: string[];
}

export function RhymeDictionary({ isOpen, onClose, initialWord = '' }: RhymeDictionaryProps) {
  const [searchWord, setSearchWord] = useState(initialWord);
  const [rhymes, setRhymes] = useState<RhymeWord[]>([]);
  const [nearRhymes, setNearRhymes] = useState<RhymeWord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSearchWord(initialWord);
  }, [initialWord]);

  useEffect(() => {
    if (!searchWord.trim()) {
      setRhymes([]);
      setNearRhymes([]);
      return;
    }

    const fetchRhymes = async () => {
      setLoading(true);
      try {
        const rhymesResponse = await fetch(
          `https://api.datamuse.com/words?rel_rhy=${encodeURIComponent(searchWord)}&max=50`
        );
        const rhymesData = await rhymesResponse.json();
        setRhymes(rhymesData);

        const nearRhymesResponse = await fetch(
          `https://api.datamuse.com/words?sl=${encodeURIComponent(searchWord)}&max=50`
        );
        const nearRhymesData = await nearRhymesResponse.json();
        
        const filteredNearRhymes = nearRhymesData
          .filter((word: RhymeWord) => !rhymesData.some((rhyme: RhymeWord) => rhyme.word === word.word))
          .sort((a: RhymeWord, b: RhymeWord) => b.score - a.score)
          .slice(0, 50);
        
        setNearRhymes(filteredNearRhymes);
      } catch (error) {
        console.error('Error fetching rhymes:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchRhymes, 300);
    return () => clearTimeout(debounce);
  }, [searchWord]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Rhyming Dictionary</h2>
          <button
            onClick={onClose}
            className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            aria-label="Close rhyming dictionary"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>
        
        <div className="p-4 border-b">
          <input
            type="text"
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
            placeholder="Enter a word to find rhymes..."
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : (rhymes.length > 0 || nearRhymes.length > 0) ? (
            <div className="space-y-6">
              {rhymes.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Perfect Rhymes</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {rhymes.map((rhyme, index) => (
                      <div
                        key={index}
                        className="rhyme-word px-3 py-2 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          onClose();
                        }}
                      >
                        {rhyme.word}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {nearRhymes.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Near Rhymes</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {nearRhymes.map((rhyme, index) => (
                      <div
                        key={index}
                        className="rhyme-word px-3 py-2 bg-blue-50 rounded-md hover:bg-blue-100 cursor-pointer"
                        onClick={() => {
                          onClose();
                        }}
                      >
                        {rhyme.word}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : searchWord ? (
            <div className="text-center text-gray-500">No rhymes found</div>
          ) : (
            <div className="text-center text-gray-500">
              Enter a word to find rhymes
            </div>
          )}
        </div>
      </div>
    </div>
  );
}