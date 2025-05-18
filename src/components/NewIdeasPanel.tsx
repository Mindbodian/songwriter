import React, { useState, useEffect, useRef } from 'react';
import { Save, ArrowLeft } from 'lucide-react';

interface NewIdeasPanelProps {
  onClose: () => void;
  onImportLine: (line: string, index: number) => void;
  currentLineIndex: number;
}

export function NewIdeasPanel({ onClose, onImportLine, currentLineIndex }: NewIdeasPanelProps) {
  console.log('NewIdeasPanel: Started rendering');
  
  // Initialize with a few empty strings to ensure the editor has space to work with
  const [ideas, setIdeas] = useState<string[]>(Array(20).fill(''));
  const [isDirty, setIsDirty] = useState(false);
  const [title, setTitle] = useState('My Ideas');
  
  // Ref for the editor area to detect clicks
  const editorAreaRef = useRef<HTMLDivElement>(null);

  // Load ideas from localStorage on component mount
  useEffect(() => {
    console.log('NewIdeasPanel: useEffect running');
    const savedIdeas = localStorage.getItem('songwritingIdeas');
    const savedTitle = localStorage.getItem('songwritingIdeasTitle');
    
    if (savedTitle) {
      setTitle(savedTitle);
    }
    
    if (savedIdeas) {
      try {
        const parsed = JSON.parse(savedIdeas);
        console.log('NewIdeasPanel: Loaded ideas from localStorage:', parsed);
        
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Always ensure we have at least 20 lines total with padding at the end
          const paddedIdeas = [...parsed];
          const padding = Math.max(0, 20 - parsed.length);
          for (let i = 0; i < padding; i++) {
            paddedIdeas.push('');
          }
          setIdeas(paddedIdeas);
        } else {
          console.log('NewIdeasPanel: Saved ideas were empty or invalid, using default');
        }
      } catch (e) {
        console.error('NewIdeasPanel: Error parsing saved ideas:', e);
      }
    } else {
      console.log('NewIdeasPanel: No saved ideas found in localStorage');
    }
  }, []);

  const saveIdeas = () => {
    console.log('NewIdeasPanel: Saving ideas');
    const filteredIdeas = ideas.filter(idea => idea.trim() !== '');
    localStorage.setItem('songwritingIdeas', JSON.stringify(filteredIdeas));
    localStorage.setItem('songwritingIdeasTitle', title);
    setIsDirty(false);
  };

  const handleChange = (index: number, value: string) => {
    console.log(`NewIdeasPanel: Handling change at index ${index}, new value: "${value}"`);
    
    const newIdeas = [...ideas];
    newIdeas[index] = value;
    
    // If we're editing one of the last 5 empty lines, add more empty lines
    if (index >= ideas.length - 5) {
      // Add 5 more empty lines to ensure we always have space to work with
      for (let i = 0; i < 5; i++) {
        newIdeas.push('');
      }
    }
    
    setIdeas(newIdeas);
    setIsDirty(true);
  };

  const handleImport = (idea: string) => {
    console.log(`NewIdeasPanel: handleImport called. Importing idea: "${idea}" to main editor line index: ${currentLineIndex}`);
    // Call onImportLine with the idea text
    onImportLine(idea, currentLineIndex);
    // Force panel to close
    console.log('NewIdeasPanel: Explicitly closing ideas panel');
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      
      const newIdeas = [...ideas];
      newIdeas.splice(index + 1, 0, '');
      setIdeas(newIdeas);
      setIsDirty(true);
      
      // Focus the next line after state update
      setTimeout(() => {
        const nextLine = document.getElementById(`idea-line-${index + 1}`);
        if (nextLine instanceof HTMLTextAreaElement) {
          nextLine.focus();
        }
      }, 0);
    }
  };

  // Handle click on the editor area to focus nearest textarea
  const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === editorAreaRef.current) {
      // Clicked on the editor background, not on a textarea
      // Find the nearest textarea and focus it
      const rect = editorAreaRef.current?.getBoundingClientRect();
      if (rect) {
        // Calculate the line number based on the click position
        const relativeY = e.clientY - rect.top;
        const lineHeight = 28; // Approximate line height
        const lineIndex = Math.floor(relativeY / lineHeight);
        
        // Find the nearest available textarea - clamped to valid indices
        const targetIndex = Math.min(Math.max(0, lineIndex), ideas.length - 1);
        const textarea = document.getElementById(`idea-line-${targetIndex}`);
        if (textarea instanceof HTMLTextAreaElement) {
          textarea.focus();
        }
      }
    }
  };

  console.log('NewIdeasPanel: Current ideas array:', ideas);

  return (
    <div className="fixed inset-0 bg-blue-50 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-50 p-4 border-b flex items-center gap-4">
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-1.5 bg-white border rounded-md hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
        
        <button
          onClick={saveIdeas}
          className="flex items-center gap-2 px-3 py-1.5 bg-white border rounded-md hover:bg-gray-50 transition-colors"
        >
          <Save size={16} />
          <span>Save</span>
        </button>
        
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setIsDirty(true);
          }}
          className="px-3 py-1.5 border rounded-md ml-4 flex-grow max-w-xs"
          placeholder="Notebook Title"
        />
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div 
            ref={editorAreaRef}
            onClick={handleEditorClick}
            className="notebook-background min-h-full p-4 min-h-[800px]"
          >
            {ideas.map((idea, index) => (
              <div key={index} className="writing-line group relative">
                <span className="text-gray-400 w-8 text-sm text-right pr-2">
                  {index + 1}
                </span>
                <textarea
                  id={`idea-line-${index}`}
                  value={idea}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="writing-input bg-transparent border-none outline-none focus:ring-0 w-full resize-none"
                  placeholder="Enter text..."
                  rows={1}
                  style={{
                    minHeight: '24px',
                    height: 'auto',
                    overflow: 'hidden'
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = `${target.scrollHeight}px`;
                  }}
                />
                
                {idea.trim() !== '' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent bubbling
                      const trimmedIdea = idea.trim(); // Ensure we're importing the trimmed version
                      console.log(`Import button clicked for line #${index}: "${trimmedIdea}"`);
                      
                      // Try direct importing
                      console.log(`Directly calling onImportLine(${trimmedIdea}, ${currentLineIndex})`);
                      onImportLine(trimmedIdea, currentLineIndex);
                      
                      // Close after a short delay to ensure state updates complete
                      setTimeout(() => {
                        console.log("Closing ideas panel after import");
                        onClose();
                      }, 50);
                    }}
                    className="px-2 py-0.5 bg-blue-500 text-white rounded-md text-sm ml-2 hover:bg-blue-600"
                  >
                    Import
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 