import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Toolbar } from './components/Toolbar';
import { WritingBar, WritingBarRef } from './components/WritingBar';
import { RhymeDictionary } from './components/RhymeDictionary';
import { IdeasPanel } from './components/IdeasPanel';
import { Header } from './components/Header';
import { SaveModal } from './components/SaveModal';
import { Suggestions } from './components/Suggestions';
import { AILyricHelper } from './components/AILyricHelper';
import { useFileHandlers } from './hooks/useFileHandlers';
import { generateSongNameSuggestions } from './utils/songNameSuggestions';
import { useSound } from './hooks/useSound';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PlatformerGame from './components/PlatformerGame';
import { AudioProvider } from './context/AudioContext';
import { ParentalAdvisoryWarning } from './components/ParentalAdvisoryWarning';

/**
 * Main Application Component for Mindbodian Soulman Lyric Writer
 * 
 * Features implemented:
 * 1. Main text editor with line-by-line input
 * 2. Structure selections (Verse, Chorus, etc.) with bold formatting
 * 3. Drop cap styling for the first letter of the first line only
 * 4. Automatic cursor movement to next line on Enter key and structure insertion
 * 5. Auto-focus on first line when app loads
 * 6. Text overflow handling for long lines
 * 7. Suggestions panel on the right side
 * 8. Rhyme dictionary, ideas panel, and AI helper as modal overlays
 * 9. File operations (New, Open, Save, Save As)
 * 
 * UI Components:
 * - Header: Contains MPC buttons and app title
 * - Toolbar: Contains file operations and writing tools
 * - WritingBar: Individual line editor with special formatting
 * - Suggestions: Panel showing contextual suggestions
 */
export interface MPCPad {
  id: number;
  audioUrl: string | null;
  isLooping: boolean;
  speed: number; // 1.0 = normal speed
}

export function App() {
  const [bars, setBars] = useState<string[]>(Array(25).fill(''));
  const [currentBarIndex, setCurrentBarIndex] = useState(0);
  const [showRhymeDictionary, setShowRhymeDictionary] = useState(false);
  const [showIdeasPanel, setShowIdeasPanel] = useState(false);
  const [showAIHelper, setShowAIHelper] = useState(false);
  const [lastWord, setLastWord] = useState('');
  const [panelWidth, setPanelWidth] = useState(256);
  const [isResizing, setIsResizing] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const currentBarRef = useRef<WritingBarRef>(null);
  const resizeRef = useRef<{ x: number; width: number } | null>(null);
  const playSound = useSound();
  const [showAdvisory, setShowAdvisory] = useState(false);
  const [advisoryAnimate, setAdvisoryAnimate] = useState(false);
  const [saveModalSuggestions, setSaveModalSuggestions] = useState<string[]>(() => generateSongNameSuggestions(bars));
  const [suggestionHistory, setSuggestionHistory] = useState<Set<string>>(new Set());
  const [hasPlayedToasty, setHasPlayedToasty] = useState(false);
  const [showToastyImage, setShowToastyImage] = useState(false);
  const [mpcPads, setMpcPads] = useState<MPCPad[]>(
    Array.from({ length: 8 }, (_, i) => ({ id: i + 1, audioUrl: null, isLooping: true, speed: 1.0 }))
  );
  const [hasPlayedStartupSound, setHasPlayedStartupSound] = useState(false);
  // Remove selectedPad and setSelectedPad state
  // Add activePadIndex state to track the currently playing pad
  const [activePadIndex, setActivePadIndex] = useState<number | null>(null);

  const {
    fileName,
    showSaveModal,
    setShowSaveModal,
    handleNew,
    handleOpen,
    handleSave,
    handleSaveAs,
    handleSaveConfirm,
    handleCopyLyrics,
  } = useFileHandlers(bars, setBars, setCurrentBarIndex);

  // Auto-focus the first line when the page loads
  useEffect(() => {
    // Wait for the component to be fully mounted
    setTimeout(() => {
      if (currentBarRef.current) {
        currentBarRef.current.focus();
      }
    }, 100);
  }, []);

  // Add effect to update charCount and wordCount
  useEffect(() => {
    const text = bars.filter(bar => bar.trim() !== '').join(' ');
    setCharCount(text.replace(/\s/g, '').length);
    setWordCount(text.trim().split(/\s+/).filter(word => word !== '').length);
  }, [bars]);

  // Play ahhhhh sound 1 second after page load with fade-out
  useEffect(() => {
    const timer = setTimeout(() => {
      const audio = new Audio('/sounds/ahhhhh.mp3');
      audio.volume = 0.6;
      audio.play().catch(() => {});
      
      // Start fade-out after 2 seconds
      const fadeTimer = setTimeout(() => {
        const fadeInterval = setInterval(() => {
          if (audio.volume > 0.01) {
            audio.volume -= 0.01;
          } else {
            audio.pause();
            clearInterval(fadeInterval);
          }
        }, 50); // Fade out over ~3 seconds
      }, 2000);

      return () => clearTimeout(fadeTimer);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Standard mild bad word list
  const BAD_WORDS = [
    'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'dick', 'pussy', 'cunt', 'cock', 'fag', 'slut', 'whore', 'crap', 'douche', 'bollocks', 'bugger', 'bloody', 'arse', 'wank', 'prick', 'twat', 'tit', 'piss', 'shag', 'git', 'twit', 'darn', 'hell'
  ];

  // Detect bad words in any bar
  useEffect(() => {
    const allText = bars.join(' ').toLowerCase();
    const found = BAD_WORDS.some(word => allText.includes(word));
    if (found) {
      if (!showAdvisory) {
        setAdvisoryAnimate(true);
      }
      setShowAdvisory(true);
      if (!hasPlayedToasty) {
        playSound('toasty');
        setHasPlayedToasty(true);
        setTimeout(() => {
          setShowToastyImage(true);
          setTimeout(() => setShowToastyImage(false), 1000); // Show for 1 second
        }, 200); // Delay by 0.2 seconds
      }
    } else {
      setShowAdvisory(false);
      setAdvisoryAnimate(false);
      setHasPlayedToasty(false);
    }
  }, [bars]);

  // After animation, stop animating but keep badge
  const handleAdvisoryAnimationEnd = () => {
    setAdvisoryAnimate(false);
  };

  /**
   * Handle Enter key press in text editor
   * - Creates a new line if at the end
   * - Moves cursor to the next line
   * - Focuses on the next line after state update
   */
  const handleEnterKey = () => {
    const newBars = [...bars];
    if (currentBarIndex === bars.length - 1) {
      newBars.push('');
    }
    setBars(newBars);
    
    // Set the focus to the next line
    setCurrentBarIndex(currentBarIndex + 1);
    
    // Give the UI time to update, then focus the textarea
    setTimeout(() => {
      if (currentBarRef.current) {
        currentBarRef.current.focus();
      }
    }, 50);
  };

  /**
   * Handle content changes in the current writing bar
   * - Updates the bars array with new content
   * - Updates the lastWord state for suggestions
   */
  const handleBarChange = (content: string) => {
    const newBars = [...bars];
    const isStructureLine = newBars[currentBarIndex].trim().startsWith('[') && newBars[currentBarIndex].includes(']');
    if (isStructureLine && content.trim() !== newBars[currentBarIndex].trim()) {
      // Only move if user is typing something other than the structure tag
      const structure = newBars[currentBarIndex];
      const typed = content.replace(structure, '').trim();
      if (typed.length > 0) {
        // Move typed content to the next line, but do not erase the structure line
        if (currentBarIndex === newBars.length - 1) {
          newBars.push(typed);
        } else if (newBars[currentBarIndex + 1].trim() === '') {
          newBars[currentBarIndex + 1] = typed;
        } else {
          newBars[currentBarIndex + 1] += ' ' + typed;
        }
        // Do NOT change the structure line
        setBars(newBars);
        setCurrentBarIndex(currentBarIndex + 1);
        setTimeout(() => {
          if (currentBarRef.current) {
            currentBarRef.current.focus();
          }
        }, 0);
        return;
      }
    }
    newBars[currentBarIndex] = content;
    setBars(newBars);

    const words = content.trim().split(/\s+/);
    const lastWordFromContent = words[words.length - 1];
    if (lastWordFromContent && lastWordFromContent !== lastWord) {
      setLastWord(lastWordFromContent);
    }
  };

  /**
   * Handle structure insertion (e.g., [Verse], [Chorus])
   * - Inserts structure tag at current line
   * - Ensures there's an empty line after the structure
   * - Automatically moves to the next line
   * - Focuses on the next line after state updates
   */
  const handleInsertStructure = (structure: string) => {
    const newBars = [...bars];
    // Insert the structure at the current line
    newBars[currentBarIndex] = structure;
    
    // Always ensure there's an empty line after the structure
    if (currentBarIndex === newBars.length - 1) {
      newBars.push('');
    } else if (newBars[currentBarIndex + 1] === '') {
      // Next line is already empty, no need to add a new one
    } else {
      // Insert a new empty line after the structure
      newBars.splice(currentBarIndex + 1, 0, '');
    }
    
    // Update the state with the new bars first
    setBars(newBars);
    playSound('type');
    
    // Use setTimeout to ensure state is updated before changing focus
    setTimeout(() => {
      // Move to the next line
      setCurrentBarIndex(currentBarIndex + 1);
      
      // Give the UI time to update, then focus on the new line
      setTimeout(() => {
        if (currentBarRef.current) {
          currentBarRef.current.focus();
        }
      }, 50);
    }, 10);
  };

  const handleSuggestionSelect = (line: string) => {
    const newBars = [...bars];
    
    // Append the suggestion to the current line instead of replacing it
    newBars[currentBarIndex] = newBars[currentBarIndex] + line;
    
    // Add a new empty line if we're at the end
    if (currentBarIndex === newBars.length - 1) {
      newBars.push('');
    }
    
    setBars(newBars);
    playSound('type');
    
    // Move to the next line
    setCurrentBarIndex(currentBarIndex + 1);
  };

  const getAllSavedLines = () => {
    const savedIdeas = localStorage.getItem('songwritingIdeas');
    if (savedIdeas) {
      return JSON.parse(savedIdeas);
    }
    return [];
  };

  const startResize = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    resizeRef.current = {
      x: e.clientX,
      width: panelWidth
    };
    playSound('panel');
  }, [panelWidth, playSound]);

  const stopResize = useCallback(() => {
    setIsResizing(false);
    resizeRef.current = null;
    playSound('panel');
  }, [playSound]);

  const resize = useCallback((e: MouseEvent) => {
    if (!isResizing || !resizeRef.current) return;

    const delta = resizeRef.current.x - e.clientX;
    const newWidth = Math.min(Math.max(resizeRef.current.width + delta, 200), 600);
    setPanelWidth(newWidth);
  }, [isResizing]);

  React.useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResize);
    }

    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResize);
    };
  }, [isResizing, resize, stopResize]);

  // Print lyrics handler for Toolbar
  const handlePrintLyrics = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Please allow popups to print your lyrics');
      return;
    }
    // Get the song content without empty lines
    const lyricsContent = bars.filter(line => line.trim() !== '').join('\n');
    // Create a simple HTML document with the lyrics
    const formattedContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${fileName || 'Untitled Song'}</title>
        <style>
          body { font-family: 'Georgia', serif; line-height: 1.6; margin: 2rem; }
          h1 { text-align: center; font-size: 24px; margin-bottom: 1.5rem; }
          .lyrics { white-space: pre-wrap; font-size: 16px; }
          .structure { font-weight: bold; color: #333; margin-top: 1rem; margin-bottom: 0.5rem; }
          @media print { body { margin: 0.5in; } }
        </style>
      </head>
      <body>
        <h1>${fileName || 'Untitled Song'}</h1>
        <div class="lyrics">
          ${lyricsContent.split('\n').map(line => {
            if (line.trim().startsWith('[') && line.includes(']')) {
              return `<div class="structure">${line}</div>`;
            } else {
              return `<div>${line}</div>`;
            }
          }).join('')}
        </div>
      </body>
      </html>
    `;
    printWindow.document.open();
    printWindow.document.write(formattedContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.onafterprint = () => { printWindow.close(); };
    }, 500);
  };

  const handleShowSaveModal = () => {
    const initialSuggestions = generateSongNameSuggestions(bars);
    setSaveModalSuggestions(initialSuggestions);
    setSuggestionHistory(new Set(initialSuggestions));
    setShowSaveModal(true);
  };

  const handleMoreSuggestions = () => {
    setSaveModalSuggestions(generateSongNameSuggestions(bars));
  };

  // Handler for AudioUploadModal to update pad audio/looping, preserving speed
  const handlePadAudioSave = (padId: number, audioUrl: string, isLooping: boolean, fileName: string) => {
    setMpcPads(prev => prev.map(pad => pad.id === padId ? { ...pad, audioUrl, isLooping } : pad));
  };

  // Handler to update speed for a pad
  const handlePadSpeedChange = (padId: number, speed: number) => {
    setMpcPads(prev => prev.map(pad => pad.id === padId ? { ...pad, speed } : pad));
  };

  return (
    <AudioProvider>
      <div className="relative min-h-screen">
        <Router>
          <Routes>
            <Route path="/game" element={<PlatformerGame />} />
            <Route path="/" element={
              <div className="min-h-screen bg-gray-900 flex flex-col">
                <Header
                  charCount={charCount}
                  wordCount={wordCount}
                  mpcPads={mpcPads}
                  onPadAudioSave={handlePadAudioSave}
                  activePadIndex={activePadIndex}
                  setActivePadIndex={setActivePadIndex}
                  onPadSpeedChange={handlePadSpeedChange}
                />
                <ParentalAdvisoryWarning show={showAdvisory} animate={advisoryAnimate} onAnimationEnd={handleAdvisoryAnimationEnd} />
                
                <Toolbar
                  fileName={fileName}
                  onNew={handleNew}
                  onOpen={handleOpen}
                  onSave={handleSave}
                  onSaveAs={handleShowSaveModal}
                  onRhymeDictionary={() => setShowRhymeDictionary(true)}
                  onIdeas={() => setShowIdeasPanel(true)}
                  onCopyLyrics={handleCopyLyrics}
                  onInsertStructure={handleInsertStructure}
                  onAIHelper={() => setShowAIHelper(true)}
                  onPrintLyrics={handlePrintLyrics}
                />

                <div className="flex-1 flex overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="notebook-background">
                      <div className="w-full">
                        {bars.map((content, index) => {
                          // Determine if previous line is a structure
                          const prevLineIsStructure = index > 0 && 
                            bars[index-1].trim().startsWith('[') && 
                            bars[index-1].includes(']');
                            
                          return (
                            <WritingBar
                              key={index}
                              ref={index === currentBarIndex ? currentBarRef : null}
                              content={content}
                              onChange={(newContent) => {
                                if (index === currentBarIndex) {
                                  handleBarChange(newContent);
                                }
                              }}
                              onEnter={handleEnterKey}
                              isFocused={index === currentBarIndex}
                              onFocus={() => setCurrentBarIndex(index)}
                              index={index}
                              isStructureLine={content.trim().startsWith('[') && content.includes(']')}
                              prevLineIsStructure={prevLineIsStructure}
                              onTextOverflow={(overflowText, overflowIndex) => {
                                // Handle text overflow by moving text to the next line
                                const newBars = [...bars];
                                
                                // If we're at the last line, add a new one
                                if (overflowIndex === newBars.length - 1) {
                                  newBars.push(overflowText);
                                } else {
                                  // Otherwise, insert the overflow text at the beginning of next line
                                  newBars[overflowIndex + 1] = overflowText + newBars[overflowIndex + 1];
                                }
                                
                                setBars(newBars);
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div 
                    style={{ width: `${panelWidth}px` }}
                    className="flex-none bg-gray-800 relative"
                  >
                    <div
                      className="absolute left-0 top-0 w-1 h-full cursor-ew-resize hover:bg-orange-500 transition-colors"
                      onMouseDown={startResize}
                    />
                    <div className="h-full border-l border-gray-700">
                      <Suggestions
                        lastWord={lastWord}
                        savedLines={getAllSavedLines()}
                        onSelect={handleSuggestionSelect}
                        onClose={() => {}}
                      />
                    </div>
                  </div>
                </div>

                {showRhymeDictionary && (
                  <RhymeDictionary
                    isOpen={showRhymeDictionary}
                    onClose={() => setShowRhymeDictionary(false)}
                    initialWord={lastWord}
                  />
                )}

                {showIdeasPanel && (
                  <IdeasPanel
                    onClose={() => setShowIdeasPanel(false)}
                    onImportLine={(line) => {
                      handleBarChange(line);
                      handleEnterKey();
                    }}
                    currentLineIndex={currentBarIndex}
                  />
                )}

                {showSaveModal && (
                  <SaveModal
                    isOpen={showSaveModal}
                    onClose={() => setShowSaveModal(false)}
                    onSave={handleSaveConfirm}
                    currentFileName={fileName}
                    suggestions={saveModalSuggestions}
                    onRequestMoreSuggestions={handleMoreSuggestions}
                  />
                )}

                {showAIHelper && (
                  <AILyricHelper
                    isOpen={showAIHelper}
                    onClose={() => setShowAIHelper(false)}
                    lastWord={lastWord}
                    onSelect={handleSuggestionSelect}
                  />
                )}

                {showToastyImage && (
                  <img
                    src="/assets/toasty.png"
                    alt="Toasty!"
                    style={{
                      position: 'fixed',
                      right: 24,
                      bottom: 24,
                      width: 120,
                      height: 'auto',
                      zIndex: 9999,
                      pointerEvents: 'none',
                      transition: 'opacity 0.3s',
                      opacity: showToastyImage ? 1 : 0,
                    }}
                  />
                )}
              </div>
            } />
          </Routes>
        </Router>
      </div>
    </AudioProvider>
  );
}