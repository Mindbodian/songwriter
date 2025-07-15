import React from 'react';
import { Plus, Save, X } from 'lucide-react';

interface IdeasHeaderProps {
  onAdd: () => void;
  onSave: () => void;
  onClose: () => void;
  isDirty: boolean;
  isAddingIdea: boolean;
}

export function IdeasHeader({ onAdd, onSave, onClose, isDirty, isAddingIdea }: IdeasHeaderProps) {
  return (
    <div className="flex items-center justify-between p-3 border-b bg-gray-50">
      <h2 className="text-lg font-semibold text-gray-800">Ideas</h2>
      <div className="flex items-center gap-1.5">
        <button
          onClick={onAdd}
          disabled={isAddingIdea}
          className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
          title="Add new idea"
        >
          <Plus size={16} />
        </button>
        <button
          onClick={onSave}
          disabled={!isDirty}
          className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors ${
            isDirty
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-gray-100 text-gray-400'
          }`}
          title="Save changes"
        >
          <Save size={16} />
        </button>
        <button
          onClick={onClose}
          className="flex items-center justify-center w-8 h-8 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          title="Close"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}