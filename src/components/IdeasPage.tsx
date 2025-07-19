import React, { useState, useEffect, useRef } from 'react';

interface IdeasPageProps {
  onClose: () => void;
}

export function IdeasPage({ onClose }: IdeasPageProps) {
  const [content, setContent] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load saved ideas on mount
  useEffect(() => {
    const saved = localStorage.getItem('ideasPageContent');
    if (saved) setContent(saved);
    setTimeout(() => {
      if (textareaRef.current) textareaRef.current.focus();
    }, 100);
  }, []);

  // Save ideas to localStorage
  const handleSave = () => {
    localStorage.setItem('ideasPageContent', content);
    setIsDirty(false);
  };

  // Handle content change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsDirty(true);
  };

  return (
    <div className="fixed inset-0 bg-blue-50 z-50 overflow-auto">
      <div className="max-w-3xl mx-auto p-6 h-full flex flex-col">
        <div className="bg-white rounded-lg shadow-lg flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b bg-gray-50">
            <h2 className="text-xl font-semibold">Ideas Notebook</h2>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={!isDirty}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md ${isDirty ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-100 text-gray-400'}`}
              >
                Save
              </button>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                Close
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleChange}
              className="w-full h-full min-h-[600px] bg-white text-gray-900 focus:outline-none border-none resize-none text-lg p-4 rounded shadow-inner"
              placeholder="Write your ideas here... (scroll forever!)"
              style={{ minHeight: '60vh', height: '80vh', maxHeight: 'none' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}