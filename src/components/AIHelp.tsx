import React, { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';

interface AIHelpProps {
  isOpen: boolean;
  onClose: () => void;
  currentBar: string;
  onSelect: (suggestion: string) => void;
}

export function AIHelp({ isOpen, onClose, currentBar, onSelect }: AIHelpProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      generateSuggestions();
    }
  }, [isOpen, currentBar]);

  const generateSuggestions = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate AI generating suggestions
      // In a real implementation, this would call an AI API
      setTimeout(() => {
        const mockSuggestions = [
          "In the moonlight, shadows dance on the wall",
          "Memories fade like photographs in time",
          "The rhythm of life keeps moving on",
          "Every moment feels like a new beginning",
          "Words unspoken echo in my mind"
        ];
        setSuggestions(mockSuggestions);
        setIsLoading(false);
      }, 1500);
    } catch (err) {
      setError("Failed to generate suggestions. Please try again.");
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-purple-500" />
            <h2 className="text-xl font-semibold">AI Help</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            aria-label="Close AI Help"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>
        
        <div className="p-4 border-b">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Current Bar:</h3>
          <div className="p-3 bg-gray-50 rounded-md">
            {currentBar || <span className="text-gray-400 italic">No text entered yet</span>}
          </div>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Suggestions for next bar:</h3>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              <span className="ml-2 text-gray-500">Generating suggestions...</span>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-600 rounded-md">
              {error}
            </div>
          ) : (
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => onSelect(suggestion)}
                  className="w-full text-left p-3 bg-gray-50 hover:bg-purple-50 rounded-md transition-colors border border-gray-200 hover:border-purple-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t bg-gray-50">
          <button
            onClick={generateSuggestions}
            disabled={isLoading}
            className="w-full py-2 px-4 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Generating..." : "Generate More Suggestions"}
          </button>
        </div>
      </div>
    </div>
  );
} 