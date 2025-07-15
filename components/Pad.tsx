
import React from 'react';
import type { PadData } from '../types';

interface PadProps {
  padData: PadData;
  onPlay: (padId: number) => void;
  isPlaying: boolean;
}

export const Pad: React.FC<PadProps> = ({ padData, onPlay, isPlaying }) => {
  const hasSample = !!padData.audioUrl;

  const baseClasses = "aspect-square rounded-lg flex flex-col items-center justify-center p-2 text-white font-bold cursor-pointer transition-all duration-150 shadow-md border-b-4";
  const activeClasses = isPlaying ? "transform scale-95 border-b-2" : "hover:scale-105";
  
  const colorClasses = hasSample 
    ? (isPlaying ? "bg-cyan-400 border-cyan-600" : "bg-cyan-500 hover:bg-cyan-400 border-cyan-700")
    : "bg-gray-700 hover:bg-gray-600 border-gray-800";

  return (
    <button onClick={() => hasSample && onPlay(padData.id)} className={`${baseClasses} ${colorClasses} ${activeClasses}`} disabled={!hasSample}>
      <span className="text-2xl">{padData.id}</span>
      {padData.name && <span className="text-xs mt-1 truncate w-full px-1">{padData.name}</span>}
    </button>
  );
};
