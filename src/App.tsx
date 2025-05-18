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
export function App() {
  const [bars, setBars] = useState<string[]>(Array(25).fill(''));
  const [currentBarIndex, setCurrentBarIndex] = useState(0);
  const [showRhymeDictionary, setShowRhymeDictionary] = useState(false);
  const [showIdeasPanel, setShowIdeasPanel] = useState(false);
  const [showAIHelper, setShowAIHelper] = useState(false);
  const [lastWord, setLastWord] = useState('');
  const [panelWidth, setPanelWidth] = useState(256);
  const [isResizing, setIsResizing] = useState(false);
  const currentBarRef = useRef<WritingBarRef>(null);
  const resizeRef = useRef<{ x: number; width: number } | null>(null);
  const playSound = useSound();

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

  return (
    <Router>
      <Routes>
        <Route path="/game" element={<PlatformerGame />} />
        <Route path="/" element={
          <div className="min-h-screen bg-gray-900 flex flex-col">
            <Header />
            
            <Toolbar
              fileName={fileName}
              onNew={handleNew}
              onOpen={handleOpen}
              onSave={handleSave}
              onSaveAs={handleSaveAs}
              onRhymeDictionary={() => setShowRhymeDictionary(true)}
              onIdeas={() => setShowIdeasPanel(true)}
              onCopyLyrics={handleCopyLyrics}
              onInsertStructure={handleInsertStructure}
              onAIHelper={() => setShowAIHelper(true)}
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
                suggestions={generateSongNameSuggestions(bars)}
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
          </div>
        } />
      </Routes>
    </Router>
  );
}