import { useState } from 'react';
import { handleFileOpen, handleFileSave, handleCopyToClipboard } from '../utils/fileHandlers';
import { generateSongNameSuggestions } from '../utils/songNameSuggestions';

export function useFileHandlers(bars: string[], setBars: (bars: string[]) => void, setCurrentBarIndex: (index: number) => void) {
  const [fileName, setFileName] = useState('Song 1');
  const [showSaveModal, setShowSaveModal] = useState(false);

  const handleNew = () => {
    if (confirm('Start a new song? Current changes will be lost.')) {
      setBars(Array(25).fill(''));
      setCurrentBarIndex(0);
      // Find the next available song number
      let num = 1;
      while (localStorage.getItem(`song${num}`) !== null) {
        num++;
      }
      setFileName(`Song ${num}`);
    }
  };

  const handleOpen = async (file: File) => {
    try {
      const { lines, fileName } = await handleFileOpen(file);
      setBars(lines);
      setFileName(fileName);
      setCurrentBarIndex(0);
    } catch (error) {
      alert(error);
    }
  };

  const handleSave = () => {
    handleFileSave(fileName, bars);
  };

  const handleSaveAs = () => {
    setShowSaveModal(true);
  };

  const handleSaveConfirm = (newFileName: string) => {
    setFileName(newFileName);
    handleFileSave(newFileName, bars);
    setShowSaveModal(false);
  };

  const handleCopyLyrics = async () => {
    try {
      await handleCopyToClipboard(bars);
      alert('Lyrics copied to clipboard!');
    } catch (error) {
      alert(error);
    }
  };

  return {
    fileName,
    setFileName,
    showSaveModal,
    setShowSaveModal,
    handleNew,
    handleOpen,
    handleSave,
    handleSaveAs,
    handleSaveConfirm,
    handleCopyLyrics,
  };
}