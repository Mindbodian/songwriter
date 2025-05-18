import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';

interface IdeasPanelProps {
  onClose: () => void;
  onImportLine: (line: string, index: number) => void;
  currentLineIndex: number;
}

export function IdeasPanel({ onClose, onImportLine, currentLineIndex }: IdeasPanelProps) {
  // console.error('TEST ERROR LOG FROM IDEASPANEL TOP LEVEL EXECUTION'); // Removed test log
  console.log('IdeasPanel: Component function running.');
  const [ideas, setIdeas] = useState<string[]>(['']);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    console.log('IdeasPanel: useEffect for loadIdeas running.');
    loadIdeas();
  }, []);

  const loadIdeas = () => {
    console.log('IdeasPanel: loadIdeas called.');
    const savedIdeas = localStorage.getItem('songwritingIdeas');
    if (savedIdeas) {
      try {
        const parsedIdeas = JSON.parse(savedIdeas);
        console.log('IdeasPanel: Loaded ideas from localStorage:', parsedIdeas);
        setIdeas(parsedIdeas);
      } catch (e) {
        console.error('IdeasPanel: Error parsing songwritingIdeas from localStorage', e);
        console.log('IdeasPanel: Defaulting to one empty idea due to parse error.');
        setIdeas(['']);
      }
    } else {
      console.log('IdeasPanel: No ideas in localStorage, defaulting to one empty idea.');
      setIdeas(['']);
    }
  };

  const saveIdeas = () => {
    localStorage.setItem('songwritingIdeas', JSON.stringify(ideas.filter(idea => idea.trim() !== '')));
    setIsDirty(false);
    onClose();
  };

  const handleIdeaChange = (index: number, content: string) => {
    const newIdeas = [...ideas];
    newIdeas[index] = content;
    
    if (index === ideas.length - 1 && content !== '') {
      newIdeas.push('');
    }
    
    setIdeas(newIdeas);
    setIsDirty(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const newIdeas = [...ideas];
      newIdeas.splice(index + 1, 0, '');
      setIdeas(newIdeas);
      setIsDirty(true);
      
      setTimeout(() => {
        const nextInput = document.getElementById(`idea-${index + 1}`);
        if (nextInput) {
          nextInput.focus();
        }
      }, 0);
    }
  };

  const handleClose = () => {
    if (isDirty) {
      if (confirm('Do you want to save your changes before closing?')) {
        saveIdeas();
      }
    }
    onClose();
  };

  const handleImportIdea = (idea: string) => {
    onImportLine(idea, currentLineIndex);
    onClose();
  };

  console.log('IdeasPanel: State before return. ideas:', ideas, 'isDirty:', isDirty);
  if (Array.isArray(ideas)) {
    console.log('IdeasPanel: About to map ideas. Current ideas array length:', ideas.length);
  } else {
    console.log('IdeasPanel: ideas is not an array before mapping:', ideas);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Ideas</h2>
          <div className="flex gap-2">
            <button
              onClick={saveIdeas}
              disabled={!isDirty}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md ${
                isDirty
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              <Save size={16} />
              <span>Save</span>
            </button>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="notebook-background min-h-full p-4">
            {ideas.map((idea, index) => {
              console.log(`IdeasPanel: Mapping idea at index ${index}, value: '${idea}'`);
              return (
                <div key={index} className="mb-6 group">
                  <div className="flex">
                    {idea.trim() !== '' && (
                      <button
                        onClick={() => handleImportIdea(idea)}
                        className="opacity-0 group-hover:opacity-100 px-2 py-1 text-blue-500 hover:text-blue-600 transition-colors"
                        title="Import idea"
                      >
                        Import
                      </button>
                    )}
                    <textarea
                      id={`idea-${index}`}
                      value={idea}
                      onChange={(e) => handleIdeaChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className="writing-input flex-1 bg-transparent border-none outline-none focus:ring-0 resize-none min-h-[24px]"
                      placeholder="Write your idea..."
                      rows={1}
                      style={{ 
                        height: 'auto',
                        background: 'rgba(255, 255, 0, 0.2)', /* Slightly yellow background to make it more visible */
                        position: 'relative',
                        zIndex: 9999, /* Very high z-index to ensure it's on top */
                        border: '1px dashed red', /* Visible border for debugging */
                        padding: '8px',
                        cursor: 'text',
                        pointerEvents: 'auto' /* Explicitly enable pointer events */
                      }}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = target.scrollHeight + 'px';
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}