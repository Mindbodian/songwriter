import React, { useState } from 'react';
import { Check, X } from 'lucide-react';

interface AddIdeaFormProps {
  onSave: (idea: string) => void;
  onCancel: () => void;
}

export function AddIdeaForm({ onSave, onCancel }: AddIdeaFormProps) {
  const [newIdea, setNewIdea] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setNewIdea(prev => prev + '\n');
    }
  };

  const handleSave = () => {
    if (newIdea.trim()) {
      onSave(newIdea);
      setNewIdea('');
    }
  };

  return (
    <div className="border-b border-gray-200 p-3 bg-gray-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-gray-700">Add New Idea</h3>
        <div className="flex gap-1.5">
          <button
            onClick={handleSave}
            className="flex items-center gap-1 px-2 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            <Check size={14} />
            <span>Done</span>
          </button>
          <button
            onClick={onCancel}
            className="flex items-center gap-1 px-2 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            <X size={14} />
            <span>Cancel</span>
          </button>
        </div>
      </div>
      <textarea
        value={newIdea}
        onChange={(e) => setNewIdea(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px] writing-input text-base whitespace-pre-wrap"
        placeholder="Write your idea here..."
        autoFocus
        style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
      />
    </div>
  );
}