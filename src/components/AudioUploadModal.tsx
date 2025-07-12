import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface AudioUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (padId: number, audioUrl: string, isLooping: boolean, fileName: string) => void;
  audioContext: AudioContext;
  padCount: number;
}

// Helper to convert seconds to a parts object {min, sec, ms}
const timeToParts = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return { min: 0, sec: 0, ms: 0 };
    const minutes = Math.floor(timeInSeconds / 60);
    const remSec = timeInSeconds % 60;
    const seconds = Math.floor(remSec);
    const milliseconds = Math.round((remSec - seconds) * 1000);
    return { min: minutes, sec: seconds, ms: milliseconds };
};

function bufferToWave(abuffer: AudioBuffer): Blob {
    const numOfChan = abuffer.numberOfChannels;
    const C = abuffer.getChannelData(0).length;
    const length = C * numOfChan * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    let pos = 0;
    const writeString = (s: string) => { for (let i = 0; i < s.length; i++) { view.setUint8(pos++, s.charCodeAt(i)); } };
    const setUint16 = (data: number) => { view.setUint16(pos, data, true); pos += 2; };
    const setUint32 = (data: number) => { view.setUint32(pos, data, true); pos += 4; };
    writeString('RIFF'); setUint32(length - 8); writeString('WAVE'); writeString('fmt '); setUint32(16); setUint16(1); setUint16(numOfChan); setUint32(abuffer.sampleRate); setUint32(abuffer.sampleRate * 2 * numOfChan); setUint16(numOfChan * 2); setUint16(16); writeString('data'); setUint32(length - pos - 4);
    for (let i = 0; i < C; i++) {
        for (let j = 0; j < numOfChan; j++) {
            let s = Math.max(-1, Math.min(1, abuffer.getChannelData(j)[i]));
            s = s < 0 ? s * 0x8000 : s * 0x7FFF;
            view.setInt16(pos, s, true);
            pos += 2;
        }
    }
    return new Blob([view], { type: 'audio/wav' });
}

export const AudioUploadModal: React.FC<AudioUploadModalProps> = ({ isOpen, onClose, onSave, audioContext, padCount }) => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [loopStart, setLoopStart] = useState(0);
  const [loopEnd, setLoopEnd] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoopingEnabled, setIsLoopingEnabled] = useState(true);
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const [draggingHandle, setDraggingHandle] = useState<null | 'start' | 'end'>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState(0);
  const [selectedPad, setSelectedPad] = useState<number | null>(1);
  
  // State for the individual time part strings for the input fields
  const [startPartsStr, setStartPartsStr] = useState({ min: '00', sec: '00', ms: '000' });
  const [endPartsStr, setEndPartsStr] = useState({ min: '00', sec: '00', ms: '000' });


  const zoomCanvasRef = useRef<HTMLCanvasElement>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const playbackStartTimeRef = useRef(0);
  const playbackStartOffsetRef = useRef(0);

  const HANDLE_COLOR_START = '#fbbf24';
  const HANDLE_COLOR_END = '#38bdf8';
  const PLAYHEAD_COLOR = '#f59e0b';
  const MIN_ZOOM = 1;
  const MAX_ZOOM = 40;

  const stopPreview = useCallback(() => {
    if (sourceRef.current) {
      try { sourceRef.current.stop(); } catch (e) {}
      sourceRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const resetState = useCallback(() => {
    stopPreview();
    setAudioFile(null);
    setAudioBuffer(null);
    setLoopStart(0);
    setLoopEnd(1);
    setIsPlaying(false);
    setIsLoopingEnabled(true);
    setPlayheadPosition(0);
    setZoom(1);
    setPan(0);
    setSelectedPad(1);
    const fileInput = document.getElementById('audio-upload-modal') as HTMLInputElement;
    if(fileInput) fileInput.value = '';
  }, [stopPreview]);
  
  const handleClose = () => {
    resetState();
    onClose();
  };
  
  const draw = useCallback((canvas: HTMLCanvasElement, buffer: AudioBuffer, highlight?: { start: number, end: number }, playheadPercent?: number) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    const viewLength = buffer.length / zoom;
    const maxPan = zoom > 1 ? 1 - 1 / zoom : 0;
    const panClamped = Math.max(0, Math.min(pan, maxPan));
    const viewStartSample = Math.floor(panClamped * buffer.length);
    const bufferData = buffer.getChannelData(0);
    const step = viewLength / width;
    const amp = height / 2;
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#4A5568';
    ctx.beginPath();
    for (let i = 0; i < width; i++) {
        let min = 1.0, max = -1.0;
        const sampleIndexStart = Math.floor(viewStartSample + (i * step));
        const sampleIndexEnd = Math.floor(sampleIndexStart + step);
        for (let j = sampleIndexStart; j < sampleIndexEnd; j++) {
            const datum = bufferData[j];
            if (datum < min) min = datum;
            if (datum > max) max = datum;
        }
        ctx.moveTo(i + 0.5, (1 + min) * amp);
        ctx.lineTo(i + 0.5, (1 + max) * amp);
    }
    ctx.stroke();
    if (highlight) {
        const highlightStartX = (highlight.start * buffer.length - viewStartSample) / viewLength * width;
        const highlightEndX = (highlight.end * buffer.length - viewStartSample) / viewLength * width;
        ctx.fillStyle = 'rgba(6, 182, 212, 0.3)';
        ctx.fillRect(highlightStartX, 0, highlightEndX - highlightStartX, height);
    }
    if (playheadPercent !== undefined) {
      const playheadX = (playheadPercent * buffer.length - viewStartSample) / viewLength * width;
      if (playheadX >= 0 && playheadX <= width) {
        ctx.strokeStyle = PLAYHEAD_COLOR;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(playheadX, 0);
        ctx.lineTo(playheadX, height);
        ctx.stroke();
      }
    }
  }, [zoom, pan]);

  useEffect(() => {
    if (audioBuffer && zoomCanvasRef.current) {
        draw(zoomCanvasRef.current, audioBuffer, { start: loopStart, end: loopEnd }, playheadPosition);
    }
  }, [audioBuffer, draw, loopStart, loopEnd, playheadPosition, zoom, pan]);

  useEffect(() => {
    let animationFrameId: number | null = null;
    const animate = () => {
      if (!audioBuffer || !isPlaying) return;
      const elapsedTime = audioContext.currentTime - playbackStartTimeRef.current;
      const loopDuration = (loopEnd - loopStart) * audioBuffer.duration;
      let currentBufferTime: number;
      if (isLoopingEnabled && loopDuration > 0) {
        currentBufferTime = playbackStartOffsetRef.current + (elapsedTime % loopDuration);
      } else {
        currentBufferTime = playbackStartOffsetRef.current + elapsedTime;
        const endBufferTime = loopEnd * audioBuffer.duration;
        if (currentBufferTime >= endBufferTime) {
            currentBufferTime = endBufferTime;
            stopPreview();
        }
      }
      setPlayheadPosition(currentBufferTime / audioBuffer.duration);
      animationFrameId = requestAnimationFrame(animate);
    };
    if (isPlaying) animate();
    else if (audioBuffer) setPlayheadPosition(loopStart);
    return () => { if (animationFrameId) cancelAnimationFrame(animationFrameId); };
  }, [isPlaying, audioBuffer, loopStart, loopEnd, isLoopingEnabled, stopPreview, audioContext]);

  // When master loop points change, update the display strings for inputs
  useEffect(() => {
    if (audioBuffer) {
        const start = timeToParts(loopStart * audioBuffer.duration);
        setStartPartsStr({
            min: String(start.min).padStart(2, '0'),
            sec: String(start.sec).padStart(2, '0'),
            ms: String(start.ms).padStart(3, '0'),
        });
        const end = timeToParts(loopEnd * audioBuffer.duration);
        setEndPartsStr({
            min: String(end.min).padStart(2, '0'),
            sec: String(end.sec).padStart(2, '0'),
            ms: String(end.ms).padStart(3, '0'),
        });
    }
  }, [loopStart, loopEnd, audioBuffer]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      resetState();
      setAudioFile(file);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const decodedBuffer = await audioContext.decodeAudioData(arrayBuffer);
        setAudioBuffer(decodedBuffer);
      } catch (error) {
          alert("Failed to decode audio file. Please try a different file.");
          console.error("Audio decode error:", error);
          resetState();
      }
    }
  };

  const playPreview = useCallback(() => {
    if (!audioBuffer || isPlaying) return;
    if (audioContext.state === 'suspended') audioContext.resume();
    if (sourceRef.current) { try { sourceRef.current.stop(); } catch (e) {} }
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    const startOffsetSeconds = loopStart * audioBuffer.duration;
    const endOffsetSeconds = loopEnd * audioBuffer.duration;
    playbackStartOffsetRef.current = startOffsetSeconds;
    playbackStartTimeRef.current = audioContext.currentTime;
    if (isLoopingEnabled) {
        source.loop = true;
        source.loopStart = startOffsetSeconds;
        source.loopEnd = endOffsetSeconds;
        source.start(0, startOffsetSeconds);
    } else {
        const duration = endOffsetSeconds - startOffsetSeconds;
        source.start(0, startOffsetSeconds, duration > 0 ? duration : undefined);
    }
    source.onended = () => { if (sourceRef.current === source) setIsPlaying(false); };
    sourceRef.current = source;
    setIsPlaying(true);
  }, [audioBuffer, loopStart, loopEnd, isPlaying, isLoopingEnabled, audioContext]);
  
  // User types in an input field. Update the local string state.
  const handleTimePartInputChange = (
      type: 'start' | 'end',
      part: 'min' | 'sec' | 'ms',
      value: string
  ) => {
      const updater = type === 'start' ? setStartPartsStr : setEndPartsStr;
      updater(prev => ({ ...prev, [part]: value }));
  };

  // User blurs from an input field group. Commit the change.
  const handleTimePartInputBlur = (type: 'start' | 'end') => {
      if (!audioBuffer) return;
      const parts = type === 'start' ? startPartsStr : endPartsStr;
      const min = parseInt(parts.min, 10) || 0;
      const sec = parseInt(parts.sec, 10) || 0;
      const ms = parseInt(parts.ms, 10) || 0;

      const totalSeconds = (min * 60) + sec + (ms / 1000);
      let newPosition = totalSeconds / audioBuffer.duration;
      newPosition = Math.max(0, Math.min(1, newPosition));

      if (type === 'start') {
          setLoopStart(Math.min(newPosition, loopEnd));
      } else {
          setLoopEnd(Math.max(newPosition, loopStart));
      }
  };
  
  const handleTimeKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, type: 'start' | 'end') => {
      if (e.key === 'Enter') {
          handleTimePartInputBlur(type);
          (document.activeElement as HTMLElement)?.blur();
      }
  };

  const handleSave = async () => {
    if (!audioBuffer || !selectedPad || !audioFile) return;
    stopPreview();
    const startSample = Math.floor(loopStart * audioBuffer.length);
    const endSample = Math.floor(loopEnd * audioBuffer.length);
    const sampleCount = endSample - startSample;
    if (sampleCount <= 0) { alert("Invalid selection."); return; }
    const newBuffer = audioContext.createBuffer(audioBuffer.numberOfChannels, sampleCount, audioBuffer.sampleRate);
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
      newBuffer.getChannelData(i).set(audioBuffer.getChannelData(i).subarray(startSample, endSample));
    }
    const wavBlob = bufferToWave(newBuffer);
    const audioUrl = URL.createObjectURL(wavBlob);
    onSave(selectedPad, audioUrl, isLoopingEnabled, audioFile.name);
    handleClose();
  };

  useEffect(() => {
    const handleDragMove = (e: MouseEvent | TouchEvent) => {
      if (!draggingHandle || !audioBuffer || !zoomCanvasRef.current) return;
      e.preventDefault();
      const rect = zoomCanvasRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const viewLength = audioBuffer.length / zoom;
      const maxPan = zoom > 1 ? 1 - 1 / zoom : 0;
      const panClamped = Math.max(0, Math.min(pan, maxPan));
      const viewStartSample = Math.floor(panClamped * audioBuffer.length);
      const samplePos = viewStartSample + ((clientX - rect.left) / rect.width) * viewLength;
      let percent = Math.max(0, Math.min(1, samplePos / audioBuffer.length));
      if (draggingHandle === 'start') setLoopStart(Math.min(percent, loopEnd));
      else setLoopEnd(Math.max(percent, loopStart));
    };
    const handleDragEnd = () => setDraggingHandle(null);
    if (draggingHandle) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('touchmove', handleDragMove, { passive: false });
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchend', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [draggingHandle, audioBuffer, zoom, pan, loopStart, loopEnd]);

  if (!isOpen) return null;

  const duration = audioBuffer?.duration || 0;
  const viewStartPercent = Math.max(0, Math.min(pan, 1 - 1 / zoom));
  const viewEndPercent = viewStartPercent + 1 / zoom;
  const getHandleLeftPosition = (loopPercent: number) => {
    if (loopPercent < viewStartPercent || loopPercent > viewEndPercent) return '-100%';
    return `${((loopPercent - viewStartPercent) / (1 / zoom)) * 100}%`;
  };

  const timeInputClass = "w-12 text-center bg-gray-900 focus:outline-none focus:bg-gray-700 rounded p-1";
  const onFocusSelect = (e: React.FocusEvent<HTMLInputElement>) => e.target.select();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-full overflow-y-auto p-6 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 id="dialog-title" className="text-2xl font-bold text-white">Upload and Trim Audio</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-white text-3xl leading-none" aria-label="Close dialog">&times;</button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <input id="audio-upload-modal" type="file" accept="audio/*" onChange={handleFileChange} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cyan-500 file:text-white hover:file:bg-cyan-600"/>
            {audioBuffer && (
              <button onClick={resetState} className="flex items-center gap-2 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg">
                  <RotateCcw size={18}/> Reset
              </button>
            )}
          </div>

          {audioBuffer && (
            <>
              <div className="relative w-full select-none">
                <canvas ref={zoomCanvasRef} width="1000" height="150" className="w-full h-auto bg-gray-900 rounded-md border-2 border-cyan-500/50 cursor-crosshair" aria-label="Audio waveform"/>
                <div className="absolute top-0 left-0 h-full w-full">
                  <div style={{ position: 'absolute', left: getHandleLeftPosition(loopStart), top: 0, bottom: 0, transform: 'translateX(-50%)', width: '24px', cursor: 'ew-resize', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }} onMouseDown={() => setDraggingHandle('start')} onTouchStart={() => setDraggingHandle('start')}>
                    <div style={{ width: 16, height: 16, background: HANDLE_COLOR_START, borderRadius: '50%', border: '2px solid white', boxShadow: '0 2px 6px rgba(0,0,0,0.3)', marginTop: -8 }}/>
                    <div style={{ flexGrow: 1, width: 4, background: HANDLE_COLOR_START, borderRadius: 2 }}/>
                  </div>
                  <div style={{ position: 'absolute', left: getHandleLeftPosition(loopEnd), top: 0, bottom: 0, transform: 'translateX(-50%)', width: '24px', cursor: 'ew-resize', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }} onMouseDown={() => setDraggingHandle('end')} onTouchStart={() => setDraggingHandle('end')}>
                    <div style={{ width: 16, height: 16, background: HANDLE_COLOR_END, borderRadius: '50%', border: '2px solid white', boxShadow: '0 2px 6px rgba(0,0,0,0.3)', marginTop: -8 }}/>
                    <div style={{ flexGrow: 1, width: 4, background: HANDLE_COLOR_END, borderRadius: 2 }}/>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-2">
                <div className="flex items-center gap-2"><label className="text-sm font-medium text-cyan-300 w-12">Zoom</label><input type="range" min={MIN_ZOOM} max={MAX_ZOOM} step="0.1" value={zoom} onChange={e => setZoom(Number(e.target.value))} className="w-full accent-cyan-400"/><span className="text-sm text-cyan-200 w-12 text-right">{zoom.toFixed(1)}x</span></div>
                <div className="flex items-center gap-2"><label className="text-sm font-medium text-cyan-300 w-12">Pan</label><input type="range" min={0} max={zoom > 1 ? 1 - 1 / zoom : 0} step="0.001" value={pan} onChange={e => setPan(Number(e.target.value))} disabled={zoom <= 1} className="w-full accent-cyan-400 disabled:opacity-50"/><span className="text-sm text-cyan-200 w-12 text-right">{Math.round((zoom <= 1 ? 0 : pan / (1-1/zoom)) * 100)}%</span></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <div className="flex justify-between items-center">
                    <label htmlFor="loopStartInput" className="block text-sm font-medium text-gray-300">Start</label>
                    <div className="flex items-center bg-gray-900 rounded-md text-white" onBlur={() => handleTimePartInputBlur('start')} onKeyDown={(e) => handleTimeKeyDown(e, 'start')}>
                        <input type="text" inputMode="numeric" value={startPartsStr.min} onChange={e => handleTimePartInputChange('start', 'min', e.target.value)} onFocus={onFocusSelect} className={timeInputClass} aria-label="Start minutes" />
                        <span className="text-gray-500 mx-0.5">:</span>
                        <input type="text" inputMode="numeric" value={startPartsStr.sec} onChange={e => handleTimePartInputChange('start', 'sec', e.target.value)} onFocus={onFocusSelect} className={timeInputClass} aria-label="Start seconds" />
                        <span className="text-gray-500 mx-0.5">.</span>
                        <input type="text" inputMode="numeric" value={startPartsStr.ms}  onChange={e => handleTimePartInputChange('start', 'ms', e.target.value)} onFocus={onFocusSelect} className={`${timeInputClass} w-16`} aria-label="Start milliseconds" />
                    </div>
                  </div>
                  <input id="loopStart" type="range" min="0" max="1" step="0.0001" value={loopStart} onChange={e => setLoopStart(Math.min(parseFloat(e.target.value), loopEnd))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-thumb-cyan" />
                </div>
                <div>
                  <div className="flex justify-between items-center">
                    <label htmlFor="loopEndInput" className="block text-sm font-medium text-gray-300">End</label>
                    <div className="flex items-center bg-gray-900 rounded-md text-white" onBlur={() => handleTimePartInputBlur('end')} onKeyDown={(e) => handleTimeKeyDown(e, 'end')}>
                        <input type="text" inputMode="numeric" value={endPartsStr.min} onChange={e => handleTimePartInputChange('end', 'min', e.target.value)} onFocus={onFocusSelect} className={timeInputClass} aria-label="End minutes" />
                        <span className="text-gray-500 mx-0.5">:</span>
                        <input type="text" inputMode="numeric" value={endPartsStr.sec} onChange={e => handleTimePartInputChange('end', 'sec', e.target.value)} onFocus={onFocusSelect} className={timeInputClass} aria-label="End seconds" />
                        <span className="text-gray-500 mx-0.5">.</span>
                        <input type="text" inputMode="numeric" value={endPartsStr.ms}  onChange={e => handleTimePartInputChange('end', 'ms', e.target.value)} onFocus={onFocusSelect} className={`${timeInputClass} w-16`} aria-label="End milliseconds" />
                    </div>
                  </div>
                  <input id="loopEnd" type="range" min="0" max="1" step="0.0001" value={loopEnd} onChange={e => setLoopEnd(Math.max(parseFloat(e.target.value), loopStart))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-thumb-cyan" />
                </div>
              </div>
              <div className="flex items-center justify-center gap-6 pt-4 border-t border-gray-700/50">
                <div className="flex items-center gap-2">
                    <input type="checkbox" id="looping-enabled" checked={isLoopingEnabled} onChange={(e) => setIsLoopingEnabled(e.target.checked)} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600"/>
                    <label htmlFor="looping-enabled" className="text-gray-300">Enable Looping</label>
                </div>
                {isPlaying ? (<button onClick={stopPreview} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg"><Pause size={20}/>Stop</button>) : (<button onClick={playPreview} className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg"><Play size={20}/>{isLoopingEnabled ? 'Preview Loop' : 'Play Selection'}</button>)}
              </div>
            </>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-700 flex justify-between items-center">
          {/* Pad Assignment */}
          <div className="flex items-center gap-2">
            {audioBuffer && <>
              <span className="text-sm font-medium text-gray-300 mr-2">Assign:</span>
              {Array.from({ length: padCount }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setSelectedPad(i + 1)}
                  className={`w-10 h-10 rounded-md text-black font-bold transition-colors flex items-center justify-center border-b-2
                    ${selectedPad === i + 1 
                      ? 'bg-yellow-300 border-yellow-500 ring-2 ring-white' 
                      : 'bg-yellow-500 hover:bg-yellow-400 border-yellow-700'}`}
                  aria-pressed={selectedPad === i + 1}
                >
                  {i + 1}
                </button>
              ))}
            </>}
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <button onClick={handleClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
            <button onClick={handleSave} disabled={!audioBuffer || !selectedPad} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed">
              Save to Pad {selectedPad}
            </button>
          </div>
        </div>

        <style>{`
          .range-thumb-cyan::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 16px; height: 16px; background: #06b6d4; cursor: pointer; border-radius: 50%; }
          .range-thumb-cyan::-moz-range-thumb { width: 16px; height: 16px; background: #06b6d4; cursor: pointer; border-radius: 50%; border: none; }
          input[type="checkbox"]:checked { background-color: #06b6d4; }
          input[type="text"]::-webkit-outer-spin-button,
          input[type="text"]::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          input[type=text] {
            -moz-appearance: textfield;
          }
        `}</style>
      </div>
    </div>
  );
}; 