import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft, FilePlus, Download, Trash2 } from 'lucide-react';

interface SimpleIdeasPanelProps {
  onClose: () => void;
  onImportLine: (line: string, index: number) => void;
  currentLineIndex: number;
}

export function SimpleIdeasPanel({ onClose, onImportLine, currentLineIndex }: SimpleIdeasPanelProps) {
  // Using an array of idea blocks - starting with just empty strings
  const [ideas, setIdeas] = useState<string[]>(['']);
  const [title, setTitle] = useState('My Ideas');
  
  // Clear existing localStorage data and reset to defaults
  const clearSavedIdeas = () => {
    localStorage.removeItem('songwritingIdeasBlocks');
    localStorage.removeItem('songwritingIdeasTitle');
    setIdeas(['']);
    setTitle('My Ideas');
  };
  
  // Load saved ideas on mount
  useEffect(() => {
    try {
      // Load saved title
      const savedTitle = localStorage.getItem('songwritingIdeasTitle');
      if (savedTitle) {
        setTitle(savedTitle);
      }
      
      // Load saved ideas
      const savedIdeas = localStorage.getItem('songwritingIdeasBlocks');
      if (savedIdeas) {
        const parsed = JSON.parse(savedIdeas);
        if (Array.isArray(parsed)) {
          if (parsed.length > 0) {
            setIdeas(parsed);
          } else {
            // If array is empty, start with one empty idea
            setIdeas(['']);
          }
        }
      }
    } catch (error) {
      // Silent error handling - no console logs
    }
  }, []);
  
  // Add a new blank idea
  const addNewIdea = () => {
    const newIdeas = [...ideas, ''];
    setIdeas(newIdeas);
    // Save all ideas immediately when adding a new one
    saveAllIdeas(newIdeas);
  };

  // Save ALL ideas, including empty ones
  const saveAllIdeas = (ideasToSave = ideas) => {
    // Save all ideas, not just non-empty ones
    localStorage.setItem('songwritingIdeasBlocks', JSON.stringify(ideasToSave));
    localStorage.setItem('songwritingIdeasTitle', title);
  };
  
  // Save button handler - call saveAllIdeas
  const handleSave = () => {
    saveAllIdeas();
  };

  // Import a block of text to the main editor, splitting it into multiple lines
  const importIdea = (text: string) => {
    // Split the text by paragraph breaks (double newlines)
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim() !== '');
    
    if (paragraphs.length === 0) {
      return; // Nothing to import
    }
    
    // Import the first paragraph
    const firstParagraph = paragraphs[0];
    onImportLine(firstParagraph, currentLineIndex);
    
    // Save ideas before closing so they persist
    saveAllIdeas();
    
    // Close the panel
    onClose();
  };

  // Handle text changes
  const handleTextChange = (index: number, text: string) => {
    const newIdeas = [...ideas];
    newIdeas[index] = text;
    setIdeas(newIdeas);
    
    // Auto-save after a short delay to avoid excessive saves while typing
    setTimeout(() => {
      saveAllIdeas(newIdeas);
    }, 1000);
  };

  // Handle closing with save
  const handleClose = () => {
    // Save all ideas before closing
    saveAllIdeas();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
      {/* Header matching main page style */}
      <header className="bg-gradient-to-b from-gray-900 to-black border-b border-[#D4AF37]">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-center">
            <h1 className="text-[#D4AF37] text-2xl font-serif">
              Ideas Notebook
            </h1>
          </div>
        </div>
      </header>
      
      {/* Toolbar matching main page style */}
      <div className="bg-gray-900 border-b border-gray-700">
        <div className="p-3 flex items-center gap-2 flex-wrap">
          <button
            onClick={handleClose}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md shadow-md transition-all duration-200 bg-gradient-to-b from-red-900 to-black text-white hover:from-yellow-400 hover:to-black hover:shadow-lg active:shadow-sm active:transform active:translate-y-0.5"
          >
            <ArrowLeft size={14} className="text-orange-300" />
            <span>Back</span>
          </button>
          
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md shadow-md transition-all duration-200 bg-gradient-to-b from-red-900 to-black text-white hover:from-yellow-400 hover:to-black hover:shadow-lg active:shadow-sm active:transform active:translate-y-0.5"
          >
            <Save size={14} className="text-orange-300" />
            <span>Save</span>
          </button>
          
          <button
            onClick={addNewIdea}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md shadow-md transition-all duration-200 bg-gradient-to-b from-red-900 to-black text-white hover:from-yellow-400 hover:to-black hover:shadow-lg active:shadow-sm active:transform active:translate-y-0.5"
          >
            <FilePlus size={14} className="text-orange-300" />
            <span>New Idea</span>
          </button>
          
          <button
            onClick={clearSavedIdeas}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md shadow-md transition-all duration-200 bg-gradient-to-b from-red-900 to-black text-white hover:from-yellow-400 hover:to-black hover:shadow-lg active:shadow-sm active:transform active:translate-y-0.5"
          >
            <Trash2 size={14} className="text-orange-300" />
            <span>Clear All</span>
          </button>
          
          <div className="flex-1" />
          
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              // Save title when changed
              localStorage.setItem('songwritingIdeasTitle', e.target.value);
            }}
            className="px-3 py-1.5 text-sm rounded-md bg-gray-800 border border-gray-700 text-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-300"
            placeholder="Notebook Title"
          />
        </div>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-900">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold mb-4 text-orange-300">Your Ideas</h2>
          
          <div className="space-y-6">
            {ideas.map((idea, index) => (
              <div key={index} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
                <div className="bg-gradient-to-b from-gray-800 to-black px-4 py-2 border-b border-gray-700 flex justify-between items-center">
                  <span className="text-orange-300 font-medium">Idea #{index + 1}</span>
                  {idea.trim() !== '' && (
                    <button
                      onClick={() => {
                        importIdea(idea);
                      }}
                      className="px-3 py-1 text-sm rounded-md shadow-md transition-all duration-200 bg-gradient-to-b from-red-900 to-black text-white hover:from-yellow-400 hover:to-black"
                    >
                      Import
                    </button>
                  )}
                </div>
                <textarea
                  value={idea}
                  onChange={(e) => handleTextChange(index, e.target.value)}
                  className="w-full p-4 min-h-[150px] bg-gray-800 text-white focus:outline-none border-none resize-none"
                  placeholder="Write your idea here... (supports multiple paragraphs and word wrap)"
                  rows={6}
                />
              </div>
            ))}
            
            <button
              onClick={addNewIdea}
              className="w-full py-3 rounded-lg shadow-md transition-all duration-200 bg-gradient-to-b from-red-900 to-black text-white hover:from-yellow-400 hover:to-black"
            >
              + Add New Idea
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 