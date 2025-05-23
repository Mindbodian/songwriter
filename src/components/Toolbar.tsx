import React, { useState } from 'react';
import { Save, FilePlus, Download, BookOpen, Lightbulb, FolderOpen, Copy, ChevronDown, Printer } from 'lucide-react';

export interface ToolbarProps {
  fileName: string;
  onNew: () => void;
  onOpen: (file: File) => Promise<void>;
  onSave: () => void;
  onSaveAs: () => void;
  onRhymeDictionary: () => void;
  onIdeas: () => void;
  onCopyLyrics: () => Promise<void>;
  onPrintLyrics: () => void;
  onInsertStructure: (structure: string) => void;
  onAIHelper: () => void;
  onFileNameChange?: (newName: string) => void;
}

const songStructureOptions = [
  '[Verse 1]', '[Verse 2]', '[Verse 3]', '[Intro]', '[Interlude]', 
  '[Bridge]', '[Chorus]', '[Hook]', '[End]', '[Pre-Chorus]', 
  '[Build up]', '[Post Chorus]', '[Fade in]', '[Fade out]', 
  '[Instrumental]', '[Guitar Solo]', '[Piano Solo]', '[Drum Solo]', 
  '[Bass solo]', '[Instrumental Break]', '[Male vocal]', 
  '[Female vocal]', '[Duet]', '[Choir]', '[Spoken word]', 
  '[Harmonies]', '[Vulnerable vocals]', '[Whisper]'
];

export function Toolbar({
  fileName,
  onNew,
  onOpen,
  onSave,
  onSaveAs,
  onRhymeDictionary,
  onIdeas,
  onCopyLyrics,
  onPrintLyrics,
  onInsertStructure,
  onAIHelper,
  onFileNameChange
}: ToolbarProps) {
  const [isStructureOpen, setIsStructureOpen] = useState(false);
  const [isEditingFileName, setIsEditingFileName] = useState(false);
  const [editedFileName, setEditedFileName] = useState(fileName);

  const handleStructureSelect = (structure: string) => {
    onInsertStructure(structure);
    setIsStructureOpen(false);
  };

  const handleFileNameClick = () => {
    setEditedFileName(fileName);
    setIsEditingFileName(true);
  };

  const handleFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedFileName(e.target.value);
  };

  const handleFileNameBlur = () => {
    if (editedFileName.trim() && onFileNameChange) {
      onFileNameChange(editedFileName);
    }
    setIsEditingFileName(false);
  };

  const handleFileNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (editedFileName.trim() && onFileNameChange) {
        onFileNameChange(editedFileName);
      }
      setIsEditingFileName(false);
    } else if (e.key === 'Escape') {
      setIsEditingFileName(false);
    }
  };

  return (
    <div className="bg-gray-900 border-b border-gray-700">
      <div className="p-3 flex items-center gap-2 flex-wrap">
        <button
          onClick={onNew}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md shadow-md transition-all duration-200 bg-gradient-to-b from-red-900 to-black text-white hover:from-yellow-400 hover:to-black hover:shadow-lg active:shadow-sm active:transform active:translate-y-0.5"
        >
          <FilePlus size={14} className="text-orange-300 group-hover:text-yellow-500" />
          <span>New</span>
        </button>
        <button
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.txt,.json';
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) onOpen(file);
            };
            input.click();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md shadow-md transition-all duration-200 bg-gradient-to-b from-red-900 to-black text-white hover:from-yellow-400 hover:to-black hover:shadow-lg active:shadow-sm active:transform active:translate-y-0.5"
        >
          <FolderOpen size={14} className="text-orange-300 group-hover:text-yellow-500" />
          <span>Open</span>
        </button>
        <button
          onClick={onSave}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md shadow-md transition-all duration-200 bg-gradient-to-b from-red-900 to-black text-white hover:from-yellow-400 hover:to-black hover:shadow-lg active:shadow-sm active:transform active:translate-y-0.5"
        >
          <Save size={14} className="text-orange-300 group-hover:text-yellow-500" />
          <span>Save</span>
        </button>
        <button
          onClick={onSaveAs}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md shadow-md transition-all duration-200 bg-gradient-to-b from-red-900 to-black text-white hover:from-yellow-400 hover:to-black hover:shadow-lg active:shadow-sm active:transform active:translate-y-0.5"
        >
          <Download size={14} className="text-orange-300 group-hover:text-yellow-500" />
          <span>Save As</span>
        </button>

        <div className="h-6 w-px bg-gray-700" />

        <button
          onClick={onRhymeDictionary}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md shadow-md transition-all duration-200 bg-gradient-to-b from-red-900 to-black text-white hover:from-yellow-400 hover:to-black hover:shadow-lg active:shadow-sm active:transform active:translate-y-0.5"
        >
          <BookOpen size={14} className="text-orange-300 group-hover:text-yellow-500" />
          <span>Rhymes</span>
        </button>
        <button
          onClick={onIdeas}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md shadow-md transition-all duration-200 bg-gradient-to-b from-red-900 to-black text-white hover:from-yellow-400 hover:to-black hover:shadow-lg active:shadow-sm active:transform active:translate-y-0.5"
        >
          <Lightbulb size={14} className="text-orange-300 group-hover:text-yellow-500" />
          <span>Ideas</span>
        </button>
        <button
          onClick={onAIHelper}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md shadow-md transition-all duration-200 bg-gradient-to-b from-red-900 to-black text-white hover:from-yellow-400 hover:to-black hover:shadow-lg active:shadow-sm active:transform active:translate-y-0.5"
        >
          <span>✨</span>
          <span>AI Helper</span>
        </button>

        <div className="h-6 w-px bg-gray-700" />

        <button
          onClick={onCopyLyrics}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md shadow-md transition-all duration-200 bg-gradient-to-b from-red-900 to-black text-white hover:from-yellow-400 hover:to-black hover:shadow-lg active:shadow-sm active:transform active:translate-y-0.5"
        >
          <Copy size={14} className="text-orange-300 group-hover:text-yellow-500" />
          <span>Copy</span>
        </button>
        
        <button
          onClick={onPrintLyrics}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md shadow-md transition-all duration-200 bg-gradient-to-b from-red-900 to-black text-white hover:from-yellow-400 hover:to-black hover:shadow-lg active:shadow-sm active:transform active:translate-y-0.5"
        >
          <Printer size={14} className="text-orange-300 group-hover:text-yellow-500" />
          <span>Print</span>
        </button>

        <div className="relative inline-block">
          <button 
            onClick={() => setIsStructureOpen(!isStructureOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md shadow-md transition-all duration-200 bg-gradient-to-b from-red-900 to-black text-white hover:from-yellow-400 hover:to-black hover:shadow-lg active:shadow-sm active:transform active:translate-y-0.5 ${isStructureOpen ? 'from-yellow-400 to-black' : ''}`}
          >
            <ChevronDown size={14} className="text-orange-300 group-hover:text-yellow-500" />
            <span>Structure</span>
          </button>
          
          {isStructureOpen && (
            <div className="absolute left-0 mt-2 py-2 w-48 bg-gray-800 rounded-md shadow-xl z-50 max-h-96 overflow-y-auto">
              {songStructureOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleStructureSelect(option)}
                  className="w-full px-4 py-2 text-left text-orange-300 hover:bg-gray-700 transition-colors"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1" />
        
        {isEditingFileName ? (
          <input
            type="text"
            value={editedFileName}
            onChange={handleFileNameChange}
            onBlur={handleFileNameBlur}
            onKeyDown={handleFileNameKeyDown}
            className="ml-2 px-2 py-1 text-sm bg-gray-800 text-orange-300 border border-gray-700 rounded focus:outline-none focus:border-orange-400"
            autoFocus
          />
        ) : (
          <span 
            className="text-orange-300 ml-2 text-sm cursor-pointer hover:text-orange-400"
            onClick={handleFileNameClick}
            title="Click to edit song name"
          >
            {fileName || 'Untitled'}
          </span>
        )}
      </div>
    </div>
  );
}