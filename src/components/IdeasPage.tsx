import React, { useState, useEffect, useRef } from 'react';
import { Save, FilePlus, Download, X, ArrowLeft, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Suggestions } from './Suggestions';

interface IdeasPageProps {
  onClose: () => void;
  onImportLine: (line: string) => void;
  currentBarIndex: number;
  lastWord: string;
}

interface IdeaFile {
  name: string;
  pages: Array<{
    content: string[];
    pageNumber: number;
  }>;
}

export function IdeasPage({ onClose, onImportLine, currentBarIndex, lastWord }: IdeasPageProps) {
  console.error('TEST ERROR LOG FROM IDEASPAGE TOP LEVEL EXECUTION');
  console.log('IdeasPage component function is running');

  const [files, setFiles] = useState<IdeaFile[]>([]);
  const [currentFile, setCurrentFile] = useState<IdeaFile | null>(null);
  const [fileName, setFileName] = useState('Untitled');
  const [currentPage, setCurrentPage] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedLine, setFocusedLine] = useState<string | null>(null);
  const firstTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const savedIdeas = localStorage.getItem('savedIdeas');
    let loadedFiles: IdeaFile[] = [];
    console.log('IdeasPage: Initial useEffect running. Checking localStorage...');

    if (savedIdeas) {
      try {
        console.log('IdeasPage: Found savedIdeas in localStorage:', savedIdeas);
        const parsed = JSON.parse(savedIdeas);
        if (Array.isArray(parsed)) {
          loadedFiles = parsed;
          console.log('IdeasPage: Successfully parsed savedIdeas:', loadedFiles);
        } else {
          console.error("IdeasPage: Saved ideas from localStorage is not an array:", parsed);
          localStorage.removeItem('savedIdeas');
        }
      } catch (error) {
        console.error("IdeasPage: Failed to parse savedIdeas from localStorage:", error);
        localStorage.removeItem('savedIdeas');
      }
    } else {
      console.log('IdeasPage: No savedIdeas found in localStorage.');
    }

    if (loadedFiles.length > 0) {
      console.log('IdeasPage: Setting files from loadedFiles. First file will be:', loadedFiles[0]);
      setFiles(loadedFiles);
      setCurrentFile(loadedFiles[0]);
      setCurrentPage(0);
      console.log('IdeasPage: currentFile set to:', loadedFiles[0], 'currentPage set to: 0');
    } else {
      console.log('IdeasPage: No loaded files. Setting default file.');
      const defaultFile: IdeaFile = {
        name: 'Untitled',
        pages: [{ content: [''], pageNumber: 1 }]
      };
      setFiles([defaultFile]);
      setCurrentFile(defaultFile);
      setCurrentPage(0);
      console.log('IdeasPage: Default currentFile set to:', defaultFile, 'currentPage set to: 0');
    }
  }, []);

  useEffect(() => {
    // Safely access page and its content
    const page = currentFile?.pages?.[currentPage];
    if (page && Array.isArray(page.content)) {
      // Only attempt to focus if there is at least one line (even if empty) 
      // and the ref to the first textarea is available.
      if (page.content.length > 0) {
        console.log('Attempting to focus firstTextareaRef due to file/page change. Ref available:', !!firstTextareaRef.current);
        setTimeout(() => {
          if (firstTextareaRef.current) {
            firstTextareaRef.current.focus();
            console.log('Focus call attempted on firstTextareaRef.current');
          } else {
            console.warn('firstTextareaRef.current was null or undefined at the time of focus attempt.');
          }
        }, 100);
      } else {
        console.log('Current page has no content lines, not attempting to focus.');
      }
    } else if (currentFile) {
      // Log if the page or content structure is not as expected
      console.warn('Current file/page structure issue. Page or page.content is invalid:', currentFile.name, 'page index:', currentPage, 'page object:', page);
    }
  }, [currentFile, currentPage]);

  const saveToStorage = (updatedFiles: IdeaFile[]) => {
    localStorage.setItem('savedIdeas', JSON.stringify(updatedFiles));
    setFiles(updatedFiles);
  };

  const handleNew = () => {
    if (!currentFile || confirm('Start a new ideas file? Current changes will be lost.')) {
      setCurrentFile({
        name: 'Untitled',
        pages: [{ content: [''], pageNumber: 1 }]
      });
      setFileName('Untitled');
      setCurrentPage(0);
    }
  };

  const handleSave = () => {
    if (!currentFile) return;
    
    // Clean up empty lines before saving
    const cleanedPages = currentFile.pages.map(page => ({
      ...page,
      content: page.content.filter(line => line.trim() !== '')
    }));
    
    const cleanedFile = {
      ...currentFile,
      pages: cleanedPages
    };
    
    const updatedFiles = files.map(f => 
      f.name === currentFile.name ? cleanedFile : f
    );
    
    if (!files.find(f => f.name === currentFile.name)) {
      updatedFiles.push(cleanedFile);
    }
    
    saveToStorage(updatedFiles);
  };

  const handleSaveAs = () => {
    if (!currentFile) return;
    
    const newName = prompt('Enter file name:', fileName);
    if (newName) {
      const newFile = { ...currentFile, name: newName };
      setCurrentFile(newFile);
      setFileName(newName);
      
      const updatedFiles = [...files.filter(f => f.name !== newName), newFile];
      saveToStorage(updatedFiles);
    }
  };

  const handleLineChange = (index: number, content: string) => {
    if (!currentFile) return;
    
    const newPages = [...currentFile.pages];
    const currentPageContent = [...newPages[currentPage].content];
    
    // Update the content
    currentPageContent[index] = content;
    
    // Add a new empty line if we're at the end and the current line is not empty
    if (index === currentPageContent.length - 1 && content.trim() !== '') {
      currentPageContent.push('');
    }
    
    // Remove trailing empty lines
    while (currentPageContent.length > 1 && currentPageContent[currentPageContent.length - 1].trim() === '') {
      currentPageContent.pop();
    }
    
    newPages[currentPage] = {
      ...newPages[currentPage],
      content: currentPageContent
    };
    
    setCurrentFile({
      ...currentFile,
      pages: newPages
    });
  };

  const handleAddPage = () => {
    if (!currentFile) return;
    
    const newPages = [...currentFile.pages];
    newPages.push({
      content: [''],
      pageNumber: newPages.length + 1
    });
    
    setCurrentFile({
      ...currentFile,
      pages: newPages
    });
    setCurrentPage(newPages.length - 1);
  };

  const handlePageChange = (newPage: number) => {
    if (!currentFile) return;
    if (newPage >= 0 && newPage < currentFile.pages.length) {
      setCurrentPage(newPage);
    }
  };

  const getAllSavedLines = () => {
    return files.flatMap(file => 
      file.pages.flatMap(page => 
        page.content.filter(line => line.trim() !== '')
      )
    );
  };

  // Log state before rendering
  console.log('IdeasPage: Preparing to render. CurrentFile:', currentFile, 'CurrentPage:', currentPage);
  if (currentFile) {
    console.log('IdeasPage: currentFile details for render:', currentFile.name, 'Pages count:', currentFile.pages?.length);
    if (currentFile.pages && currentFile.pages[currentPage]) {
      console.log('IdeasPage: currentPage content for render:', currentFile.pages[currentPage].content);
      console.log('IdeasPage: Is currentPage content an array?', Array.isArray(currentFile.pages[currentPage].content));
    } else {
      console.log('IdeasPage: currentFile.pages or currentFile.pages[currentPage] is undefined for render.');
    }
  } else {
    console.log('IdeasPage: currentFile is null for render.');
  }

  return (
    <div className="fixed inset-0 bg-blue-50 z-50">
      <div className="max-w-4xl mx-auto p-6 h-full flex flex-col">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="bg-gray-50 p-4 border-b flex items-center gap-4">
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border rounded-md hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
            <button
              onClick={handleNew}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border rounded-md hover:bg-gray-50 transition-colors"
            >
              <FilePlus size={16} />
              <span>New</span>
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border rounded-md hover:bg-gray-50 transition-colors"
            >
              <Save size={16} />
              <span>SAVE_BUTTON_TEST_123</span>
            </button>
            <button
              onClick={handleSaveAs}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border rounded-md hover:bg-gray-50 transition-colors"
            >
              <Download size={16} />
              <span>Save As</span>
            </button>
            <button
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border rounded-md hover:bg-gray-50 transition-colors"
            >
              <span>Suggestions</span>
            </button>
            <span className="text-gray-500 ml-4">
              {currentFile?.name || 'Select or create a file'}
            </span>
          </div>

          <div className="flex-1 flex gap-4 p-4 overflow-hidden">
            {/* Files List */}
            <div className="w-64 bg-gray-50 rounded-lg p-4 overflow-y-auto">
              <h3 className="font-semibold mb-4">Saved Files</h3>
              {files.map((file, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setCurrentFile(file);
                    setCurrentPage(0);
                  }}
                  className={`p-2 rounded-md cursor-pointer mb-2 ${
                    currentFile?.name === file.name
                      ? 'bg-blue-100'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {file.name}
                </div>
              ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
              {currentFile ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0 || !currentFile.pages || currentFile.pages.length === 0}
                        className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <span className="font-medium">
                        Page {currentPage + 1} of {currentFile.pages?.length || 0}
                      </span>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!currentFile.pages || currentPage >= currentFile.pages.length - 1}
                        className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50"
                      >
                        <ChevronRight size={20} />
                      </button>
                      <button
                        onClick={handleAddPage}
                        className="ml-4 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      >
                        Add Page
                      </button>
                    </div>
                  </div>
                  <div className="notebook-background min-h-full">
                    <div className="max-w-2xl mx-auto">
                      {currentFile.pages && currentFile.pages[currentPage] && Array.isArray(currentFile.pages[currentPage].content) ? (
                        currentFile.pages[currentPage].content.map((line, index) => {
                          const lineId = `idea-line-${currentPage}-${index}`;
                          return (
                            <div 
                              key={index} 
                              className="writing-line" 
                              onClick={(e) => {
                                console.log(`Click on writing-line, index: ${index}, target:`, e.target, 'currentTarget:', e.currentTarget);
                                const textarea = (e.currentTarget as HTMLDivElement).querySelector('textarea');
                                if (textarea) {
                                  console.log('Attempting to focus textarea from writing-line click:', textarea);
                                  textarea.focus(); // This will also trigger the textarea's onFocus handler if successful
                                }
                              }}
                            >
                              <span className="text-gray-400 w-8 text-sm text-right pr-2">
                                {index + 1}
                              </span>
                              <textarea
                                ref={index === 0 ? firstTextareaRef : null}
                                id={lineId}
                                value={line}
                                onChange={(e) => handleLineChange(index, e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    const newContent = [...currentFile.pages[currentPage].content];
                                    newContent.splice(index + 1, 0, '');
                                    const newPages = [...currentFile.pages];
                                    newPages[currentPage] = {
                                      ...newPages[currentPage],
                                      content: newContent
                                    };
                                    setCurrentFile({
                                      ...currentFile,
                                      pages: newPages
                                    });
                                    setTimeout(() => {
                                      const nextInput = document.getElementById(`idea-line-${currentPage}-${index + 1}`);
                                      if (nextInput instanceof HTMLTextAreaElement) {
                                        nextInput.focus();
                                      }
                                    }, 0);
                                  }
                                }}
                                data-index={index}
                                className={`writing-input bg-transparent border-none outline-none focus:ring-0 w-full resize-none ${
                                  focusedLine === lineId ? 'border-2 border-red-500' : ''
                                }`}
                                placeholder="Enter text..."
                                rows={1}
                                tabIndex={0} 
                                style={{
                                  height: 'auto',
                                  minHeight: '24px',
                                  overflow: 'hidden',
                                }}
                                onInput={(e) => {
                                  const target = e.target as HTMLTextAreaElement;
                                  target.style.height = 'auto';
                                  target.style.height = `${target.scrollHeight}px`;
                                }}
                                onClick={(e) => { // This onClick on the textarea itself might still be useful
                                  e.stopPropagation(); // Prevent this click from bubbling to the parent div's onClick
                                  console.log('Textarea direct click, attempting focus.');
                                  (e.currentTarget as HTMLTextAreaElement).focus();
                                }}
                                onFocus={() => {
                                  console.log(`Focus on line: ${lineId}`);
                                  setFocusedLine(lineId);
                                }}
                                onBlur={() => {
                                  console.log(`Blur from line: ${lineId}`);
                                  setFocusedLine(null);
                                }}
                              />
                              {line && (
                                <button
                                  onClick={() => onImportLine(line)}
                                  className="opacity-0 group-hover:opacity-100 px-2 py-0.5 bg-blue-500 text-white rounded-md text-sm ml-2 transition-opacity duration-150"
                                >
                                  Import
                                </button>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-4 text-gray-500">
                          This page has no content, or the data is not in the expected format. Try adding a new page or selecting a different one.
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  Select a file or create a new one to start
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {showSuggestions && (
        <Suggestions
          lastWord={lastWord}
          savedLines={getAllSavedLines()}
          onSelect={onImportLine}
          onClose={() => setShowSuggestions(false)}
        />
      )}
    </div>
  );
}