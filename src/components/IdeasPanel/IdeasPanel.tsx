import React, { useState, useEffect } from 'react';
import { AddIdeaForm } from './AddIdeaForm';
import { IdeaItem } from './IdeaItem';
import { IdeasHeader } from './IdeasHeader';
import { useRhymeHighlighting } from '../../hooks/useRhymeHighlighting';

interface IdeasPanelProps {
  onClose: () => void;
  onImportLine: (line: string, index: number) => void;
  currentLineIndex: number;
  lastWord?: string;
}

export function IdeasPanel({ onClose, onImportLine, currentLineIndex, lastWord = '' }: IdeasPanelProps) {
  console.log('IdeasPanel component function is running');

  const [ideas, setIdeas] = useState<string[]>([]);
  const [isAddingIdea, setIsAddingIdea] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const rhymingWords = useRhymeHighlighting(lastWord);

  useEffect(() => {
    loadIdeas();
  }, []);

  const loadIdeas = () => {
    const savedIdeas = localStorage.getItem('songwritingIdeas');
    if (savedIdeas) {
      setIdeas(JSON.parse(savedIdeas));
    }
  };

  const saveIdeas = (updatedIdeas: string[]) => {
    localStorage.setItem('songwritingIdeas', JSON.stringify(updatedIdeas));
    setIdeas(updatedIdeas);
    setIsDirty(false);
  };

  const handleAddIdea = (newIdea: string) => {
    const updatedIdeas = [...ideas, newIdea];
    saveIdeas(updatedIdeas);
    setIsAddingIdea(false);
  };

  const handleDeleteIdea = (index: number) => {
    if (confirm('Are you sure you want to delete this idea?')) {
      const updatedIdeas = ideas.filter((_, i) => i !== index);
      saveIdeas(updatedIdeas);
    }
  };

  const handleClose = () => {
    if (isDirty) {
      if (confirm('Do you want to save your changes before closing?')) {
        saveIdeas(ideas);
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col">
        <IdeasHeader
          onAdd={() => setIsAddingIdea(true)}
          onSave={() => saveIdeas(ideas)}
          onClose={handleClose}
          isDirty={isDirty}
          isAddingIdea={isAddingIdea}
        />

        {isAddingIdea && (
          <AddIdeaForm
            onSave={handleAddIdea}
            onCancel={() => setIsAddingIdea(false)}
          />
        )}
        
        <div className="flex-1 overflow-y-auto">
          <div className="notebook-background min-h-full">
            {ideas.map((idea, index) => (
              <IdeaItem
                key={index}
                idea={idea}
                onImport={() => onImportLine(idea, currentLineIndex)}
                onDelete={() => handleDeleteIdea(index)}
                rhymingWords={rhymingWords}
              />
            ))}
            {ideas.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No ideas yet. Click the + button to add one.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
