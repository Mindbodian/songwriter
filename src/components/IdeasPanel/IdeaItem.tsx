import React from 'react';
import { Plus } from 'lucide-react';
import { RhymeHighlight } from '../RhymeHighlight';
import { RhymeWord } from '../../utils/types';

interface IdeaItemProps {
  idea: string;
  onImport: () => void;
  onDelete: () => void;
  rhymingWords: RhymeWord[];
}

export function IdeaItem({ idea, onImport, onDelete, rhymingWords }: IdeaItemProps) {
  return (
    <div className="group flex items-end min-h-[24px] hover:bg-gray-50/50 py-1">
      <div className="flex items-center gap-2 min-w-[60px] pl-2 pb-1">
        <button
          onClick={onImport}
          className="text-blue-500 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Import idea"
        >
          <Plus size={16} />
        </button>
        <button
          onClick={onDelete}
          className="text-red-500 hover:text-red-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity"
          title="Delete idea"
        >
          -
        </button>
      </div>
      <div className="writing-input flex-1 py-0 whitespace-pre-wrap">
        <RhymeHighlight text={idea} rhymingWords={rhymingWords} />
      </div>
    </div>
  );
}