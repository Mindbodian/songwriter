import React, { useState, useEffect } from 'react';

/**
 * AILyricHelper Component
 * 
 * This component provides AI-powered lyric suggestions based on the last word of the current line.
 * It generates rhyming suggestions that can be appended to the existing text without replacing it.
 * 
 * Features:
 * - Generates context-aware rhyming suggestions
 * - Preserves existing text when inserting suggestions
 * - Can be closed with Escape key or X button
 * - Filters out awkward or nonsensical combinations
 * - Categorizes suggestions into emotional, narrative, and descriptive themes
 */

interface AILyricHelperProps {
  isOpen: boolean;          // Controls the visibility of the helper modal
  onClose: () => void;      // Function to close the modal
  lastWord: string;         // The last word of the current line to find rhymes for
  onSelect: (line: string) => void;  // Function to handle suggestion selection
}

export function AILyricHelper({ isOpen, onClose, lastWord, onSelect }: AILyricHelperProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Handle Escape key to close the modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  /**
   * Generates rhyming words based on common word endings
   * This is a simplified version - in a production environment, this would
   * likely use an API or more sophisticated rhyming algorithm
   */
  const getRhymingWords = async (word: string) => {
    if (!word.trim()) return [];
    
    try {
      const [perfectRhymes, nearRhymes] = await Promise.all([
        fetch(`https://api.datamuse.com/words?rel_rhy=${encodeURIComponent(word)}&max=20`).then(res => res.json()),
        fetch(`https://api.datamuse.com/words?rel=nry&ml=${encodeURIComponent(word)}&max=20`).then(res => res.json())
      ]);
      
      // Combine and deduplicate rhymes, prioritizing perfect rhymes
      const allRhymes = [...perfectRhymes, ...nearRhymes]
        .filter(rhyme => rhyme.word.toLowerCase() !== word.toLowerCase())
        .sort((a, b) => b.score - a.score)
        .map(rhyme => rhyme.word);
      
      return [...new Set(allRhymes)]; // Remove duplicates
    } catch (error) {
      console.error('Error fetching rhymes:', error);
      return [];
    }
  };

  /**
   * Generates rhyming suggestions based on the last word
   * The suggestions are categorized into three themes:
   * 1. Emotional/feeling based - for expressing emotions and feelings
   * 2. Story/narrative based - for telling stories or describing events
   * 3. Descriptive/imagery based - for creating visual or sensory imagery
   */
  const generateRhymingSuggestions = async () => {
    if (!lastWord) return;
    
    setIsLoading(true);
    try {
      const rhymingWords = await getRhymingWords(lastWord);
      
      // More focused and context-aware templates
      const templates = [
        // Emotional/feeling based - for expressing emotions and feelings
        'I feel it deep inside my',
        'The way you make me',
        'I never thought I\'d',
        'You got me feeling',
        'I can\'t help but',
        'Every time I',
        'I keep on',
        'I want to',
        'I need to',
        'I\'m trying to',
        
        // Story/narrative based - for telling stories or describing events
        'The story of my',
        'I remember when we',
        'Looking back I',
        'The moment that we',
        'I wish that we could',
        'If only we could',
        'Maybe we should',
        'I hope that we can',
        'I wonder if we\'ll',
        'I pray that we\'ll',
        
        // Descriptive/imagery based - for creating visual or sensory imagery
        'Like the stars up in the',
        'Like the waves out on the',
        'Like the wind through the',
        'Like the sun in the',
        'Like the moon in the',
        'Like the rain on the',
        'Like the fire in the',
        'Like the light in the',
        'Like the sound of the',
        'Like the feel of the'
      ];

      // Generate suggestions using the rhyming words
      const suggestions = rhymingWords.map((rhymingWord, index) => {
        const template = templates[index % templates.length];
        // Ensure the template ends with a space before adding the rhyming word
        const cleanTemplate = template.trim() + ' ';
        return `${cleanTemplate}${rhymingWord}`;
      }).filter(suggestion => {
        // Filter out awkward or nonsensical combinations
        return !suggestion.includes('the the') &&
               !suggestion.includes('in the the') &&
               !suggestion.includes('of the the') &&
               suggestion.split(' ').length <= 10; // Keep suggestions concise
      });
      
      setSuggestions(suggestions);
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate initial suggestions when modal opens
  useEffect(() => {
    if (isOpen && suggestions.length === 0) {
      generateRhymingSuggestions();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-96 max-w-full max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-700 relative overflow-hidden">
          {/* Animated background for the header */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 animate-gradient-x"
            style={{
              backgroundImage: 'linear-gradient(to right, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2), rgba(249, 115, 22, 0.2))',
              backgroundSize: '200% 100%',
            }}
          ></div>
          
          {/* Content overlay */}
          <div className="relative z-10 flex items-center justify-between w-full">
            <h2 className="text-xl font-semibold text-white">AI Lyric Suggestions</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Close AI Helper"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {lastWord && (
            <div className="mb-4 text-gray-400">
              Creating rhymes for: <span className="text-white">{lastWord}</span>
            </div>
          )}
          {suggestions.length > 0 && (
            <div className="space-y-2 mb-4">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    // Add a space before the selection to separate it from existing text
                    onSelect(` ${suggestion}`);
                    onClose();
                  }}
                  className="w-full text-left px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={generateRhymingSuggestions}
            disabled={!lastWord || isLoading}
            className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="animate-spin">⌛</span>
                Generating...
              </>
            ) : (
              <>
                <span>✨</span>
                Generate More Suggestions
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 