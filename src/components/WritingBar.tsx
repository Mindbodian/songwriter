import React, { KeyboardEvent, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useSound } from '../hooks/useSound';

/**
 * Props for the WritingBar component
 */
interface WritingBarProps {
  content: string;                                // The text content of the line
  onChange: (content: string) => void;            // Handler for content changes
  onEnter: () => void;                            // Handler for Enter key press
  isFocused?: boolean;                            // Whether this line is currently focused
  onMultiLinePaste?: (lines: string[]) => void;   // Handler for multi-line paste operations
  onCursorPositionChange?: (position: number) => void; // Handler for cursor position changes
  onFocus?: () => void;                           // Handler for focus events
  index: number;                                  // The index of this line in the document
  isStructureLine?: boolean;                      // Whether this line is a structure line (e.g., [Verse])
  prevLineIsStructure?: boolean;                  // Whether the previous line is a structure line
  onTextOverflow: (overflowingText: string, currentIndex: number) => void; // Handler for text overflow
}

/**
 * Ref methods exposed by the WritingBar component
 */
export interface WritingBarRef {
  insertTextAtCursor: (text: string) => void;     // Method to insert text at cursor position
  focus: () => void;                              // Method to focus this line
}

/**
 * WritingBar Component
 * 
 * A specialized text input component that handles a single line of text in the lyric editor.
 * Features:
 * 1. Single-line input with overflow detection and handling
 * 2. Special styling for structure tags ([Verse], [Chorus], etc.)
 * 3. Drop cap styling for the first letter of the first line
 * 4. Keyboard navigation (Enter, Tab, Arrow keys)
 * 5. Copy/paste handling with multi-line support
 * 
 * Styling behaviors:
 * - Structure tags are displayed in bold
 * - First letter of the first non-structure line gets drop cap styling
 * - Text is automatically split into multiple lines when it overflows
 */
export const WritingBar = forwardRef<WritingBarRef, WritingBarProps>(({
  content,
  onChange: प्रोपOnChange,
  onEnter,
  isFocused,
  onMultiLinePaste,
  onCursorPositionChange,
  onFocus,
  index,
  isStructureLine = false,
  prevLineIsStructure,
  onTextOverflow,
}, ref) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const selfRef = useRef<HTMLDivElement>(null);
  const playSound = useSound();
  const lastKeyPressTime = useRef<number>(0);
  const MIN_SOUND_INTERVAL = 50;

  // Add a processing flag to prevent recursive calls and logging
  const isProcessingRef = useRef(false);
  const lastOverflowTextRef = useRef('');

  // Ref for a hidden div to measure text accurately
  const measureRef = useRef<HTMLDivElement | null>(null);
  // Cache for width measurement to avoid frequent recalculation
  const widthCacheRef = useRef<number | null>(null);

  // Check if content starts with a structure tag like [Verse]
  const isStructureTag = content.trim().startsWith('[') && content.includes(']');
  
  // Remove drop cap functionality - always false
  const shouldHaveDropCap = false;
  const firstChar = content.charAt(0);
  const restOfContent = content.substring(1);

  useImperativeHandle(ref, () => ({
    insertTextAtCursor: (text: string) => {
      const textarea = inputRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart || 0;
      const end = textarea.selectionEnd || 0;
      
      let newContentValue;
      if (shouldHaveDropCap && firstChar) {
        newContentValue = firstChar + restOfContent.substring(0, start) + text + restOfContent.substring(end);
      } else if (shouldHaveDropCap && !firstChar && text.length > 0) {
        newContentValue = text;
      } else {
        newContentValue = content.substring(0, start) + text + content.substring(end);
      }
      
      प्रोपOnChange(newContentValue);
      playSound('type');
      
      setTimeout(() => {
        if (textarea) {
          let newPosition = start + text.length;
          textarea.setSelectionRange(newPosition, newPosition);
        }
      }, 0);
    },
    focus: () => {
      inputRef.current?.focus();
    }
  }));

  // Effect to create and style the measuring div
  useEffect(() => {
    const measureDiv = document.createElement('div');
    measureDiv.style.position = 'absolute';
    measureDiv.style.visibility = 'hidden';
    measureDiv.style.height = 'auto';
    measureDiv.style.whiteSpace = 'pre-wrap';
    measureDiv.style.wordWrap = 'break-word';
    measureDiv.style.boxSizing = 'border-box'; // Usually matches textareas

    // Attempt to apply textarea styles if available
    // This might run before inputRef.current is ready, so we also apply styles in handleContentChange
    if (inputRef.current) {
      const computedStyle = window.getComputedStyle(inputRef.current);
      measureDiv.style.font = computedStyle.font;
      measureDiv.style.padding = computedStyle.padding;
      measureDiv.style.letterSpacing = computedStyle.letterSpacing;
      measureDiv.style.width = (inputRef.current.clientWidth - parseFloat(computedStyle.paddingLeft) - parseFloat(computedStyle.paddingRight)) + 'px';
    }
    
    document.body.appendChild(measureDiv);
    measureRef.current = measureDiv;

    return () => {
      if (measureRef.current) {
        document.body.removeChild(measureRef.current);
        measureRef.current = null;
      }
    };
  }, []);

  // Effect for positioning the cursor within the textarea
  useEffect(() => {
    if (isFocused && inputRef.current) {
      const currentTextareaValue = inputRef.current.value;
      inputRef.current.setSelectionRange(currentTextareaValue.length, currentTextareaValue.length);
    }
  }, [isFocused, content, index, isStructureLine]);

  // Effect for scrolling the entire component into view when it GAINS focus
  useEffect(() => {
    if (isFocused && selfRef.current) {
      selfRef.current.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'nearest' });
    }
  }, [isFocused]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const now = Date.now();
    if (e.key !== 'Tab' && e.key !== 'ArrowUp' && e.key !== 'ArrowDown' && now - lastKeyPressTime.current >= MIN_SOUND_INTERVAL) {
      playSound('type');
      lastKeyPressTime.current = now;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      playSound('enter');
      // Reset immediately
      isProcessingRef.current = false;
      lastOverflowTextRef.current = '';
      onEnter();
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      playSound('enter');
      // Reset immediately
      isProcessingRef.current = false;
      lastOverflowTextRef.current = '';
      onEnter();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      // Reset immediately
      isProcessingRef.current = false;
      lastOverflowTextRef.current = '';
      onEnter();
      return;
    }
    if (e.key === 'Backspace' && shouldHaveDropCap && firstChar) {
      const textarea = e.target as HTMLTextAreaElement;
      const cursorPos = textarea.selectionStart;
      if (cursorPos === 0 && textarea.selectionStart === textarea.selectionEnd) {
        e.preventDefault();
        if (restOfContent.length > 0) {
          प्रोपOnChange(restOfContent);
        } else {
          प्रोपOnChange('');
        }
      }
    }
  };

  // This is the special handleChange for when drop cap is active and has content
  const internalHandleChangeForDropCap = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValueInTextarea = e.target.value;
    handleContentChange(firstChar + newValueInTextarea);
  };

  const handleContentChange = (newText: string) => {
    const textarea = inputRef.current;
    const measureDiv = measureRef.current;

    // Prevent recursive processing
    if (isProcessingRef.current) {
      return;
    }

    if (!textarea || !measureDiv) {
      प्रोपOnChange(newText); // Fallback if refs aren't ready
      return;
    }
    
    // Set processing flag
    isProcessingRef.current = true;

    try {
      // Only recalculate width if needed (textarea size changed)
      if (widthCacheRef.current === null || textarea.clientWidth !== widthCacheRef.current) {
        const computedTextareaStyle = window.getComputedStyle(textarea);
        const contentBoxWidth = textarea.clientWidth - 
          parseFloat(computedTextareaStyle.paddingLeft) - 
          parseFloat(computedTextareaStyle.paddingRight);
        
        measureDiv.style.width = contentBoxWidth + 'px';
        measureDiv.style.font = computedTextareaStyle.font;
        measureDiv.style.letterSpacing = computedTextareaStyle.letterSpacing;
        measureDiv.style.padding = computedTextareaStyle.padding;
        measureDiv.style.lineHeight = computedTextareaStyle.lineHeight;
        
        // Cache the width
        widthCacheRef.current = textarea.clientWidth;
      }
  
      // Fast path: if text is very short (likely fits on one line), skip measurement
      if (newText.length < 50 && !newText.includes('\n')) {
        प्रोपOnChange(newText);
        lastOverflowTextRef.current = '';
        isProcessingRef.current = false;
        return;
      }

      measureDiv.textContent = newText;
      const contentActualHeight = measureDiv.scrollHeight;
      const singleLineVisualHeight = textarea.clientHeight;

      if (contentActualHeight <= singleLineVisualHeight * 1.15) {
        // Content fits
        प्रोपOnChange(newText);
        lastOverflowTextRef.current = '';
      } else {
        // Content overflows
        let textForThisBar = "";
        let textToOverflow = newText;
  
        // Try to find a reasonable split point (last space before overflow)
        let splitPoint = -1;
        
        // Optimization: binary search for split point instead of linear search
        // First check if half the text fits
        const midPoint = Math.floor(newText.length / 2);
        measureDiv.textContent = newText.substring(0, midPoint);
        const halfFits = measureDiv.scrollHeight <= singleLineVisualHeight * 1.15;
        
        if (halfFits) {
          // Search between midPoint and end
          let left = midPoint;
          let right = newText.length - 1;
          
          while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const testText = newText.substring(0, mid);
            measureDiv.textContent = testText;
            
            if (measureDiv.scrollHeight <= singleLineVisualHeight * 1.15) {
              // This fits, try including more text
              left = mid + 1;
              // Save the last good position
              splitPoint = mid;
            } else {
              // Too much text, try less
              right = mid - 1;
            }
          }
        } else {
          // Search between start and midPoint
          let left = 0;
          let right = midPoint - 1;
          
          while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const testText = newText.substring(0, mid);
            measureDiv.textContent = testText;
            
            if (measureDiv.scrollHeight <= singleLineVisualHeight * 1.15) {
              // This fits, try including more text
              left = mid + 1;
              // Save the last good position
              splitPoint = mid;
            } else {
              // Too much text, try less
              right = mid - 1;
            }
          }
        }
        
        // If we found a split point
        if (splitPoint > 0) {
          // Prefer splitting at word boundaries
          const lastSpaceBeforeSplit = newText.lastIndexOf(' ', splitPoint);
          if (lastSpaceBeforeSplit > 0 && lastSpaceBeforeSplit > splitPoint - 10) {
            // If there's a space within 10 characters of our optimal split, use it
            splitPoint = lastSpaceBeforeSplit;
          }
          
          textForThisBar = newText.substring(0, splitPoint);
          textToOverflow = newText.substring(splitPoint);
          
          // If splitPoint was a space, trim leading space from overflow text
          if (newText[splitPoint] === ' ') {
            textToOverflow = textToOverflow.trimStart();
          }
        } else if (splitPoint === 0) {
          textForThisBar = "";
          textToOverflow = newText;
        } else {
          textForThisBar = "";
          textToOverflow = newText;
        }
        
        // Prevent infinite loop
        if (textToOverflow === lastOverflowTextRef.current) {
          प्रोपOnChange(textForThisBar || '');
          lastOverflowTextRef.current = '';
          return;
        }
        
        lastOverflowTextRef.current = textToOverflow;
        प्रोपOnChange(textForThisBar);
        
        if (textToOverflow.length > 0 || (textForThisBar.length === 0 && newText.length > 0)) {
          // No setTimeout - call immediately for better performance
          onTextOverflow(textToOverflow, index);
        }
      }
    } finally {
      // Reset immediately - no timeout needed
      isProcessingRef.current = false;
    }
  };
  
  const mainOnChangeHandler = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (shouldHaveDropCap && firstChar) {
      internalHandleChangeForDropCap(e);
    } else {
      handleContentChange(e.target.value);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const lines = pastedText.split(/\r?\n/).filter(line => line.trim() !== '');
    
    if (lines.length > 1 && onMultiLinePaste) {
      onMultiLinePaste(lines);
    } else {
      const textarea = inputRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart || 0;
      const end = textarea.selectionEnd || 0;
      let newPastedContent;
      if (shouldHaveDropCap && firstChar) {
        newPastedContent = firstChar + restOfContent.substring(0, start) + lines[0] + restOfContent.substring(end);
      } else {
        newPastedContent = content.substring(0, start) + lines[0] + content.substring(end);
      }
      प्रोपOnChange(newPastedContent);
      playSound('type');
      setTimeout(() => {
        if (textarea) {
          const newPosition = start + lines[0].length;
          textarea.setSelectionRange(newPosition, newPosition);
        }
      }, 0);
    }
  };

  const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const textarea = e.target as HTMLTextAreaElement;
    if (onCursorPositionChange) {
      const adjustedPosition = shouldHaveDropCap && firstChar 
        ? textarea.selectionStart + 1
        : textarea.selectionStart;
      onCursorPositionChange(adjustedPosition);
    }
  };

  const internalHandleFocus = () => {
    if (onFocus) {
      onFocus();
    }
  };

  // Determine props for the single textarea
  let textareaValue: string;
  const textareaStyle: React.CSSProperties = { 
    resize: 'none', 
    height: '1.5em', // Fixed height for single-line appearance
    overflow: 'hidden', // Hide overflow
    flexGrow: 1,
    whiteSpace: 'pre-wrap', // Important for scrollHeight calculation
    wordWrap: 'break-word',  // Important for scrollHeight calculation
    fontWeight: isStructureTag ? 'bold' : 'normal' // Make structure tags bold
  };
  let showDropCapSpan = false;

  if (shouldHaveDropCap) {
    if (firstChar) {
      textareaValue = restOfContent;
      textareaStyle.paddingLeft = '40px';
      showDropCapSpan = true;
    } else {
      textareaValue = content;
    }
  } else {
    textareaValue = content;
  }

  return (
    <div ref={selfRef} className="writing-line flex items-start min-h-[24px]">
      {showDropCapSpan && (
        <span 
          className="drop-cap text-xl font-semibold text-orange-500" 
          style={{ 
            marginRight: '-0.45em',
            lineHeight: '1', 
            paddingTop: '1px'
          }}
        >
          {firstChar}
        </span>
      )}
      <textarea
        ref={inputRef}
        value={textareaValue}
        onChange={mainOnChangeHandler}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onSelect={handleSelect}
        onClick={handleSelect}
        onFocus={internalHandleFocus}
        className={`writing-input bg-transparent border-none outline-none focus:ring-0 w-full py-0 ${isStructureTag ? 'font-bold' : ''}`}
        placeholder="Enter text..."
        style={textareaStyle}
      />
    </div>
  );
});

WritingBar.displayName = 'WritingBar';