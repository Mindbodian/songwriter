import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

interface MultiStructureSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (structures: string[]) => void;
}

const songStructureOptions = [
  'Verse 1', 'Verse 2', 'Verse 3', 'Intro', 'Interlude', 
  'Bridge', 'Chorus', 'Hook', 'End', 'Pre-Chorus', 
  'Build up', 'Post Chorus', 'Fade in', 'Fade out', 
  'Instrumental', 'Guitar Solo', 'Piano Solo', 'Drum Solo', 
  'Bass solo', 'Instrumental Break', 'Male vocal', 
  'Female vocal', 'Duet', 'Choir', 'Spoken word', 
  'Harmonies', 'Vulnerable vocals', 'Whisper'
];

export const MultiStructureSelector: React.FC<MultiStructureSelectorProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  const [selectedStructures, setSelectedStructures] = useState<string[]>([]);

  const handleStructureSelect = (structure: string) => {
    if (!selectedStructures.includes(structure)) {
      setSelectedStructures([...selectedStructures, structure]);
    }
  };

  const handleRemoveStructure = (structureToRemove: string) => {
    setSelectedStructures(selectedStructures.filter(s => s !== structureToRemove));
  };

  const handleConfirm = () => {
    if (selectedStructures.length > 0) {
      const structureLine = selectedStructures.map(s => `[${s}]`).join(' ');
      onConfirm([structureLine]);
      setSelectedStructures([]);
    }
  };

  const handleCancel = () => {
    setSelectedStructures([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">Select Multiple Structures</h3>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Selected Structures Display */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Selected Structures:</h4>
          {selectedStructures.length === 0 ? (
            <p className="text-gray-500 text-sm italic">No structures selected yet</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedStructures.map((structure, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 bg-orange-600 text-white px-3 py-1 rounded-full text-sm"
                >
                  <span>[{structure}]</span>
                  <button
                    onClick={() => handleRemoveStructure(structure)}
                    className="hover:bg-orange-700 rounded-full p-0.5 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview */}
        {selectedStructures.length > 0 && (
          <div className="mb-4 p-3 bg-gray-700 rounded border border-gray-600">
            <h4 className="text-sm font-medium text-gray-300 mb-1">Preview:</h4>
            <p className="text-orange-300 font-bold">
              {selectedStructures.map(s => `[${s}]`).join(' ')}
            </p>
          </div>
        )}

        {/* Structure Options */}
        <div className="flex-1 overflow-y-auto">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Available Structures:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {songStructureOptions.map((option) => (
              <button
                key={option}
                onClick={() => handleStructureSelect(option)}
                disabled={selectedStructures.includes(option)}
                className={`px-3 py-2 text-left text-sm rounded transition-colors ${
                  selectedStructures.includes(option)
                    ? 'bg-orange-600 text-white cursor-not-allowed'
                    : 'bg-gray-700 text-orange-300 hover:bg-gray-600 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>[{option}]</span>
                  {selectedStructures.includes(option) && <Plus size={12} />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4 pt-4 border-t border-gray-700">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedStructures.length === 0}
            className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded transition-colors"
          >
            Insert Structures
          </button>
        </div>
      </div>
    </div>
  );
}; 