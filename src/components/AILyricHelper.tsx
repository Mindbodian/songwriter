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
  // Epic: Songwriter state
  const [showSongForm, setShowSongForm] = useState(false);
  const [songSubject, setSongSubject] = useState('');
  const [songGenre, setSongGenre] = useState('');
  const [songMood, setSongMood] = useState('');
  const [songStructure, setSongStructure] = useState('Verse, Chorus, Verse, Chorus, Bridge, Chorus');
  const [generatedSong, setGeneratedSong] = useState('');
  const [isSongLoading, setIsSongLoading] = useState(false);
  // Epic: Next Bar Suggestion state
  const [showNextBar, setShowNextBar] = useState(false);
  const [nextBarSuggestions, setNextBarSuggestions] = useState<string[]>([]);
  const [isNextBarLoading, setIsNextBarLoading] = useState(false);

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

  // Epic: Generate a full song (mocked for now)
  const handleGenerateSong = async () => {
    setIsSongLoading(true);
    // Simulate AI call
    await new Promise(res => setTimeout(res, 1200));

    // Build a long song with repeated sections
    const verse = `[Verse]\nWoke up this morning, thinking about ${songSubject},\nThe world outside is painted in a shade of blue.\nEvery memory lingers, every moment feels so true,\nWalking through the city, every street reminds me of you.\n\n`;
    const chorus = `[Chorus]\n${songSubject} on my mind, can't let go,\nEverywhere I turn, it's all I know.\nDreams of ${songSubject} in the night,\nHoping everything will turn out right.\n\n`;
    const bridge = `[Bridge]\nMaybe someday I'll find a way,\nTo turn these words to gold and say,\n${songSubject}, you light my way.\nThrough the darkness, through the pain,\nYour memory falls like gentle rain.\n\n`;
    const outro = `[Outro]\nSo I'll keep singing, holding on,\nTo every note, to every song.\n${songSubject}, you're my endless muse,\nIn every lyric, it's you I choose.\n\n`;

    // Repeat sections to reach ~3000 characters
    let song = `Song about: ${songSubject}\nGenre: ${songGenre}\nMood: ${songMood}\nStructure: ${songStructure}\n\n`;
    for (let i = 0; i < 5; i++) song += verse;
    for (let i = 0; i < 4; i++) song += chorus;
    song += bridge;
    song += chorus;
    song += outro;

    setGeneratedSong(song);
    setIsSongLoading(false);
  };

  // Epic: Generate next bar suggestions
  const handleNextBarSuggestions = async () => {
    setIsNextBarLoading(true);
    setNextBarSuggestions([]);
    // Simulate AI call
    await new Promise(res => setTimeout(res, 900));
    // Use lastWord for rhyme, generate full sentences
    const rhymes = await getRhymingWords(lastWord);
    const templates = [
      `I keep moving forward, never looking ${rhymes[0] || 'back'}.`,
      `Every dream I chase leads me to the track of ${rhymes[1] || 'black'}.`,
      `In the silence of the night, I hear the echo of ${rhymes[2] || 'crack'}.`,
      `With every step I take, I find another ${rhymes[3] || 'pack'}.`,
      `The story isn't over, there's more to ${rhymes[4] || 'unpack'}.`
    ];
    setNextBarSuggestions(templates.slice(0, 3 + Math.floor(Math.random() * 3)));
    setIsNextBarLoading(false);
  };

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
          {/* Epic: Songwriter UI */}
          {!showSongForm && !generatedSong && !showNextBar && (
            <>
              <button
                className="w-full mb-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-semibold"
                onClick={() => setShowSongForm(true)}
              >
                🎤 Write a Song for Me
              </button>
              <button
                className="w-full mb-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors font-semibold"
                onClick={() => { setShowNextBar(true); handleNextBarSuggestions(); }}
              >
                💡 Suggest Next Bar
              </button>
            </>
          )}
          {showSongForm && !generatedSong && (
            <form
              className="space-y-3 mb-4"
              onSubmit={e => { e.preventDefault(); handleGenerateSong(); }}
            >
              <div>
                <label className="block text-sm text-gray-300 mb-1">Song Subject <span className="text-red-400">*</span></label>
                <input
                  className="w-full px-2 py-1 rounded bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-blue-400"
                  value={songSubject}
                  onChange={e => setSongSubject(e.target.value)}
                  required
                  placeholder="e.g. hope, summer nights, heartbreak"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Genre/Style</label>
                <input
                  className="w-full px-2 py-1 rounded bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-blue-400"
                  value={songGenre}
                  onChange={e => setSongGenre(e.target.value)}
                  placeholder="e.g. pop, rap, country, lo-fi"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Mood</label>
                <input
                  className="w-full px-2 py-1 rounded bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-blue-400"
                  value={songMood}
                  onChange={e => setSongMood(e.target.value)}
                  placeholder="e.g. uplifting, sad, energetic"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Structure</label>
                <input
                  className="w-full px-2 py-1 rounded bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-blue-400"
                  value={songStructure}
                  onChange={e => setSongStructure(e.target.value)}
                  placeholder="e.g. Verse, Chorus, Verse, Chorus, Bridge, Chorus"
                />
              </div>
              <button
                type="submit"
                className="w-full mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors font-semibold flex items-center justify-center gap-2"
                disabled={isSongLoading || !songSubject.trim()}
              >
                {isSongLoading ? (
                  <>
                    <span className="animate-spin">⌛</span>
                    Generating Song...
                  </>
                ) : (
                  <>
                    <span>🎶</span>
                    Generate Song
                  </>
                )}
              </button>
              <button
                type="button"
                className="w-full mt-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors font-semibold"
                onClick={() => setShowSongForm(false)}
                disabled={isSongLoading}
              >
                Cancel
              </button>
            </form>
          )}
          {generatedSong && (
            <div className="mb-4">
              <div className="whitespace-pre-line bg-gray-900 text-white rounded p-3 mb-2 border border-gray-700" style={{ fontFamily: 'monospace', fontSize: 14 }}>
                {generatedSong}
              </div>
              <button
                className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors font-semibold"
                onClick={() => {
                  onSelect('\n' + generatedSong);
                  setGeneratedSong('');
                  setShowSongForm(false);
                  onClose();
                }}
              >
                Insert into Notebook
              </button>
              <button
                className="w-full mt-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors font-semibold"
                onClick={() => {
                  setGeneratedSong('');
                  setShowSongForm(false);
                }}
              >
                Back
              </button>
            </div>
          )}
          {showNextBar && !isNextBarLoading && nextBarSuggestions.length > 0 && (
            <div className="mb-4">
              <div className="text-gray-300 mb-2">Suggestions for the next bar:</div>
              <div className="space-y-2">
                {nextBarSuggestions.map((sugg, idx) => (
                  <button
                    key={idx}
                    className="w-full text-left px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                    onClick={() => {
                      onSelect(' ' + sugg);
                      setShowNextBar(false);
                      setNextBarSuggestions([]);
                      onClose();
                    }}
                  >
                    {sugg}
                  </button>
                ))}
              </div>
              <button
                className="w-full mt-3 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors font-semibold"
                onClick={() => { setShowNextBar(false); setNextBarSuggestions([]); }}
              >
                Back
              </button>
            </div>
          )}
          {showNextBar && isNextBarLoading && (
            <div className="mb-4 flex flex-col items-center justify-center text-gray-300">
              <span className="animate-spin text-2xl mb-2">⌛</span>
              Generating suggestions...
            </div>
          )}
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