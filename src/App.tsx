import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Toolbar } from './components/Toolbar';
import { WritingBar, WritingBarRef } from './components/WritingBar';
import { RhymeDictionary } from './components/RhymeDictionary';
import { IdeasPage } from './components/IdeasPage';
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
import { LoginScreen } from './components/LoginScreen';
import WelcomeScreen from './components/WelcomeScreen';
import BarsSplash from './components/BarsSplash';
import ChatbotWidget from './components/ChatbotWidget';

export interface MPCPad {
  id: number;
  audioUrl: string | null;
  isLooping: boolean;
  speed: number;
}

export function App() {
<<<<<<< HEAD
=======
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const handleLogin = () => setIsAuthenticated(true);

>>>>>>> 7acac82e850c04c4c9fb05ca4ffe87fa260a9984
  const [showWelcome, setShowWelcome] = useState(true);
  const [showBarsSplash, setShowBarsSplash] = useState(false);
  const [bars, setBars] = useState<string[]>(Array(25).fill(''));
  const [currentBarIndex, setCurrentBarIndex] = useState(0);
  const [showRhymeDictionary, setShowRhymeDictionary] = useState(false);
  const [showIdeasPage, setShowIdeasPage] = useState(false);
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
  const hasTriggeredToastyRef = useRef(false);
  const [mpcPads, setMpcPads] = useState<MPCPad[]>(
    Array.from({ length: 8 }, (_, i) => ({ id: i + 1, audioUrl: null, isLooping: true, speed: 1.0 }))
  );
  const [hasPlayedStartupSound, setHasPlayedStartupSound] = useState(false);
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
  } = useFileHandlers(bars, setBars, setCurrentBarIndex, () => {
    setHasPlayedToasty(false);
    hasTriggeredToastyRef.current = false;
  });

<<<<<<< HEAD
  // Remove login logic

  const handleInsertMultipleStructures = (structures: string[]) => {
=======
  const handleInsertStructure = (structure: string) => {
>>>>>>> 7acac82e850c04c4c9fb05ca4ffe87fa260a9984
    const newBars = [...bars];
    newBars[currentBarIndex] = structure;
    if (currentBarIndex === newBars.length - 1) {
      newBars.push('');
    } else if (newBars[currentBarIndex + 1] !== '') {
      newBars.splice(currentBarIndex + 1, 0, '');
    }
    setBars(newBars);
    playSound('type');
    setTimeout(() => {
      setCurrentBarIndex(currentBarIndex + 1);
      setTimeout(() => {
        currentBarRef.current?.focus();
      }, 50);
    }, 10);
  };

  const handleInsertMultipleStructures = (structures: string[]) => {
    const newBars = [...bars];
    newBars[currentBarIndex] = structures[0];
    if (currentBarIndex === newBars.length - 1) {
      newBars.push('');
    } else if (newBars[currentBarIndex + 1] !== '') {
      newBars.splice(currentBarIndex + 1, 0, '');
    }
    setBars(newBars);
    playSound('type');
    setTimeout(() => {
      setCurrentBarIndex(currentBarIndex + 1);
      setTimeout(() => {
        currentBarRef.current?.focus();
      }, 50);
    }, 10);
  };

  useEffect(() => {
    setTimeout(() => {
      currentBarRef.current?.focus();
    }, 100);
  }, []);

  useEffect(() => {
    const text = bars.filter(bar => bar.trim() !== '').join(' ');
    setCharCount(text.replace(/\s/g, '').length);
    setWordCount(text.trim().split(/\s+/).filter(Boolean).length);
  }, [bars]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const audio = new Audio('/sounds/ahhhhh.mp3');
      audio.volume = 0.6;
      audio.play().catch(() => {});
      const fadeTimer = setTimeout(() => {
        const fadeInterval = setInterval(() => {
          if (audio.volume > 0.01) {
            audio.volume -= 0.01;
          } else {
            audio.pause();
            clearInterval(fadeInterval);
          }
        }, 50);
      }, 2000);
      return () => clearTimeout(fadeTimer);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

<<<<<<< HEAD
  // After welcome video, show BarsSplash
=======
>>>>>>> 7acac82e850c04c4c9fb05ca4ffe87fa260a9984
  useEffect(() => {
    if (!showWelcome) {
      setShowBarsSplash(true);
      const timer = setTimeout(() => setShowBarsSplash(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showWelcome]);

<<<<<<< HEAD
  // Standard mild bad word list
=======
>>>>>>> 7acac82e850c04c4c9fb05ca4ffe87fa260a9984
  const BAD_WORDS = [
    'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'dick', 'pussy', 'cunt', 'cock',
    'fag', 'slut', 'whore', 'crap', 'douche', 'bollocks', 'bugger', 'bloody', 'arse',
    'wank', 'prick', 'twat', 'tit', 'piss', 'shag', 'git', 'twit', 'darn', 'hell'
  ];

  useEffect(() => {
    const allText = bars.join(' ').toLowerCase();
    const found = BAD_WORDS.some(word => allText.includes(word));
    if (found) {
      if (!showAdvisory) {
        setAdvisoryAnimate(true);
      }
      setShowAdvisory(true);
      if (!hasPlayedToasty && !hasTriggeredToastyRef.current) {
        hasTriggeredToastyRef.current = true;
        setHasPlayedToasty(true);
        setShowToastyImage(true);
        try {
          playSound('toasty');
        } catch (e) {}
        setTimeout(() => {
          setShowToastyImage(false);
        }, 3000);
      }
    } else {
      setShowAdvisory(false);
      setAdvisoryAnimate(false);
    }
  }, [bars, hasPlayedToasty]);

  const handleAdvisoryAnimationEnd = () => {
    setAdvisoryAnimate(false);
  };

  const handleEnterKey = () => {
    const newBars = [...bars];
    if (currentBarIndex === newBars.length - 1) {
      newBars.push('');
    }
    setBars(newBars);
    setCurrentBarIndex(currentBarIndex + 1);
    setTimeout(() => {
      currentBarRef.current?.focus();
    }, 50);
  };

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

  const handleSuggestionSelect = (line: string) => {
    const newBars = [...bars];
    newBars[currentBarIndex] += line;
    if (currentBarIndex === newBars.length - 1) {
      newBars.push('');
    }
    setBars(newBars);
    playSound('type');
    setCurrentBarIndex(currentBarIndex + 1);
  };

  const getAllSavedLines = () => {
    const saved = localStorage.getItem('songwritingIdeas');
    return saved ? JSON.parse(saved) : [];
  };

  const startResize = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    resizeRef.current = { x: e.clientX, width: panelWidth };
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

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResize);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResize);
    };
  }, [isResizing, resize, stopResize]);

  const handleShowSaveModal = () => {
    const initial = generateSongNameSuggestions(bars);
    setSaveModalSuggestions(initial);
    setSuggestionHistory(new Set(initial));
    setShowSaveModal(true);
  };

  const handleMoreSuggestions = () => {
    setSaveModalSuggestions(generateSongNameSuggestions(bars));
  };

  const handlePadAudioSave = (padId: number, audioUrl: string, isLooping: boolean, fileName: string) => {
    setMpcPads(prev => prev.map(p => p.id === padId ? { ...p, audioUrl, isLooping } : p));
  };

  const handlePadSpeedChange = (padId: number, speed: number) => {
    setMpcPads(prev => prev.map(p => p.id === padId ? { ...p, speed } : p));
  };

<<<<<<< HEAD
  // Test animation function
  const handleTestAnimation = () => {
    setShowToastyImage(true);
    setTimeout(() => {
      setShowToastyImage(false);
    }, 3000);
  };

  if (showWelcome) {
    return <WelcomeScreen onFinish={() => setShowWelcome(false)} />;
=======
  // 👇 Force login if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
>>>>>>> 7acac82e850c04c4c9fb05ca4ffe87fa260a9984
  }

  if (showWelcome) {
    return <WelcomeScreen onFinish={() => setShowWelcome(false)} />;
  }

  return (
    <>
      {showBarsSplash && <BarsSplash onFinish={() => setShowBarsSplash(false)} />}
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
                    onIdeas={() => setShowIdeasPage(true)}
                    onCopyLyrics={handleCopyLyrics}
                    onInsertStructure={handleInsertStructure}
                    onAIHelper={() => setShowAIHelper(true)}
<<<<<<< HEAD
                    onPrintLyrics={handlePrintLyrics}
                    onInsertMultipleStructures={handleInsertMultipleStructures}
                    onTestAnimation={handleTestAnimation}
                  />



=======
                    onPrintLyrics={() => {}}
                    onInsertMultipleStructures={handleInsertMultipleStructures}
                    onTestAnimation={() => {}}
                  />
>>>>>>> 7acac82e850c04c4c9fb05ca4ffe87fa260a9984
                  <div className="flex-1 flex overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-4">
                      <div className="notebook-background">
                        <div className="w-full">
                          {bars.map((content, index) => {
<<<<<<< HEAD
                            // Determine if previous line is a structure
                            const prevLineIsStructure = index > 0 && 
                              bars[index-1].trim().startsWith('[') && 
                              bars[index-1].includes(']');
                              
=======
                            const prevLineIsStructure = index > 0 &&
                              bars[index - 1].trim().startsWith('[') &&
                              bars[index - 1].includes(']');
>>>>>>> 7acac82e850c04c4c9fb05ca4ffe87fa260a9984
                            return (
                              <WritingBar
                                key={index}
                                ref={index === currentBarIndex ? currentBarRef : null}
                                content={content}
<<<<<<< HEAD
                                onChange={(newContent) => {
                                  if (index === currentBarIndex) {
                                    handleBarChange(newContent);
                                  }
                                }}
=======
                                onChange={newContent => index === currentBarIndex && handleBarChange(newContent)}
>>>>>>> 7acac82e850c04c4c9fb05ca4ffe87fa260a9984
                                onEnter={handleEnterKey}
                                isFocused={index === currentBarIndex}
                                onFocus={() => setCurrentBarIndex(index)}
                                index={index}
                                isStructureLine={content.trim().startsWith('[') && content.includes(']')}
                                prevLineIsStructure={prevLineIsStructure}
                                onTextOverflow={(overflowText, overflowIndex) => {
<<<<<<< HEAD
                                  // Handle text overflow by moving text to the next line
                                  const newBars = [...bars];
                                  
                                  // If we're at the last line, add a new one
                                  if (overflowIndex === newBars.length - 1) {
                                    newBars.push(overflowText);
                                  } else {
                                    // Otherwise, insert the overflow text at the beginning of next line
                                    newBars[overflowIndex + 1] = overflowText + newBars[overflowIndex + 1];
                                  }
                                  
=======
                                  const newBars = [...bars];
                                  if (overflowIndex === newBars.length - 1) {
                                    newBars.push(overflowText);
                                  } else {
                                    newBars[overflowIndex + 1] = overflowText + newBars[overflowIndex + 1];
                                  }
>>>>>>> 7acac82e850c04c4c9fb05ca4ffe87fa260a9984
                                  setBars(newBars);
                                }}
                              />
                            );
                          })}
                        </div>
                      </div>
                    </div>
<<<<<<< HEAD

                    <div 
                      style={{ width: `${panelWidth}px` }}
                      className="flex-none bg-gray-800 relative"
                    >
=======
                    <div style={{ width: `${panelWidth}px` }} className="flex-none bg-gray-800 relative">
>>>>>>> 7acac82e850c04c4c9fb05ca4ffe87fa260a9984
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

<<<<<<< HEAD
                  {showIdeasPage && (
                    <IdeasPage onClose={() => setShowIdeasPage(false)} />
                  )}
=======
                  {showIdeasPage && <IdeasPage onClose={() => setShowIdeasPage(false)} />}
>>>>>>> 7acac82e850c04c4c9fb05ca4ffe87fa260a9984

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

                  <img
                    src="/assets/me.png"
                    alt="Toasty!"
                    style={{
                      position: 'fixed',
                      right: showToastyImage ? 24 : -150,
                      bottom: 24,
                      width: 120,
                      height: 'auto',
                      zIndex: 9999,
                      pointerEvents: 'none',
                      opacity: showToastyImage ? 1 : 0,
                      transition: 'right 0.5s ease-in-out, opacity 0.5s ease-in-out',
                    }}
<<<<<<< HEAD
                    onLoad={() => console.log('Toasty image loaded successfully')}
                    onError={(e) => console.error('Toasty image failed to load:', e)}
=======
>>>>>>> 7acac82e850c04c4c9fb05ca4ffe87fa260a9984
                  />
                </div>
              } />
            </Routes>
          </Router>
        </div>
      </AudioProvider>
      <ChatbotWidget />
    </>
  );
}
