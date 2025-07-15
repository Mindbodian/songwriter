import React from 'react';

interface SongStructureButtonProps {
  onInsert: (text: string) => void;
  onEnter: () => void;
}

export function SongStructureButtons({ onInsert, onEnter }: SongStructureButtonProps) {
  const structures = [
    'Hook',
    'Verse',
    'Bridge',
    'Pre-Chorus',
    'Drop',
    'Interlude'
  ];

  const handleStructureClick = (structure: string) => {
    onInsert(`[${structure}]`);
    onEnter();
  };

  return (
    <div className="flex flex-wrap gap-1 px-3 py-2 bg-gradient-to-b from-gray-800 to-black border-t border-gray-700">
      {structures.map((structure) => (
        <button
          key={structure}
          onClick={() => handleStructureClick(structure)}
          className="px-2 py-0.5 text-xs bg-gradient-to-b from-red-900 to-black text-orange-300 rounded 
                   hover:from-green-500 hover:to-green-700 hover:text-white transition-all duration-200 
                   shadow-sm hover:shadow-md active:transform active:translate-y-0.5"
        >
          {structure}
        </button>
      ))}
    </div>
  );
}