
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Pad } from './components/Pad';
import { AudioUploadModal } from './components/AudioUploadModal';
import { PAD_COUNT } from './constants';
import type { PadData } from './types';
import { UploadCloud, Music, Github } from 'lucide-react';

const App: React.FC = () => {
  const [pads, setPads] = useState<PadData[]>(() =>
    Array.from({ length: PAD_COUNT }, (_, i) => ({
      id: i + 1,
      audioUrl: null,
      isLooping: false,
      name: null,
    }))
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSourcesRef = useRef<{ [key: number]: AudioBufferSourceNode }>({});

  useEffect(() => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.error("Web Audio API is not supported in this browser");
      }
    }
  }, []);

  const handleOpenModal = useCallback(() => {
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSaveAudio = useCallback((padId: number, audioUrl: string, isLooping: boolean, fileName: string) => {
    setPads(prevPads =>
      prevPads.map(pad => {
        if (pad.id === padId) {
          // Revoke the old URL to prevent memory leaks
          if (pad.audioUrl) {
            URL.revokeObjectURL(pad.audioUrl);
          }
          // Stop any sound currently playing on this pad before updating it
          if (activeSourcesRef.current[padId]) {
            try { activeSourcesRef.current[padId].stop(); } catch (e) {}
            delete activeSourcesRef.current[padId];
          }
          return { ...pad, audioUrl, isLooping, name: fileName.replace(/\.[^/.]+$/, "") };
        }
        return pad;
      })
    );
  }, []);
  
  const playPad = useCallback(async (padId: number) => {
    const pad = pads.find(p => p.id === padId);
    if (!pad || !pad.audioUrl || !audioContextRef.current) return;

    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    // If a sound is already playing on this pad
    if (activeSourcesRef.current[padId]) {
      // If it's a looping sound, stop it.
      if (pad.isLooping) {
        try { activeSourcesRef.current[padId].stop(); } catch(e) {}
        delete activeSourcesRef.current[padId];
        return; 
      }
      // If it's a one-shot, stop the old one before starting a new one.
      else {
        try { activeSourcesRef.current[padId].stop(); } catch(e) {}
        delete activeSourcesRef.current[padId];
      }
    }

    try {
      const response = await fetch(pad.audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.loop = pad.isLooping;
      source.connect(audioContextRef.current.destination);
      source.start();

      activeSourcesRef.current[padId] = source;

      source.onended = () => {
        // Only delete the reference if it's the same source.
        // This prevents a new sound from being deleted if the pad was re-triggered quickly.
        if (activeSourcesRef.current[padId] === source) {
          delete activeSourcesRef.current[padId];
        }
      };

    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }, [pads]);

  return (
    <div className="bg-gray-900 min-h-screen text-white flex flex-col items-center p-4">
      <div className="w-full max-w-4xl">
        <header className="text-center my-6">
          <div className="flex items-center justify-center gap-4">
            <Music className="w-12 h-12 text-cyan-400"/>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">React Audio Sampler</h1>
          </div>
          <p className="mt-2 text-lg text-gray-400">Click a pad to play a sample. Upload your own to get started!</p>
        </header>

        <main>
          <div className="flex justify-center mb-6">
            <button
              onClick={handleOpenModal}
              className="flex items-center gap-3 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-lg transition-transform transform hover:scale-105"
            >
              <UploadCloud size={24} />
              Upload New Sample
            </button>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {pads.map(pad => (
              <Pad
                key={pad.id}
                padData={pad}
                onPlay={playPad}
                isPlaying={!!activeSourcesRef.current[pad.id]}
              />
            ))}
          </div>
        </main>
        
        <footer className="text-center mt-8 text-gray-500 text-sm">
            <p>Built with React, TypeScript, and Tailwind CSS.</p>
        </footer>
      </div>

      {isModalOpen && audioContextRef.current && (
        <AudioUploadModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveAudio}
          audioContext={audioContextRef.current}
          padCount={8} // As requested, only show 8 buttons to assign to
        />
      )}
    </div>
  );
};

export default App;
