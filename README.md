# Mindbodian Soulman Lyric Writer

A specialized lyric writing application built with React, TypeScript, and Vite.

## Features

### Core Writing Features
- **Line-by-Line Writing**: Each line is a separate input for focused writing
- **Structure Tags**: Insert structural elements like Verse, Chorus, Bridge, etc. 
- **Special Formatting**:
  - Structure tags are displayed in bold
  - The first letter of the first non-structure line gets drop cap styling
- **Auto-focus**: Cursor automatically placed on first line when app loads
- **Auto-advance**: Enter key and structure insertion automatically move to next line
- **Overflow Handling**: Text automatically flows to the next line when it gets too long

### UI Components
- **Header**: Contains MPC-style drum pad buttons and app title
- **Toolbar**: Contains file operations and writing tools
- **WritingBar**: Individual line editor with special formatting
- **Suggestions**: Panel showing contextual suggestions

### Tools and Helpers
- **Rhyme Dictionary**: Look up rhymes for words
- **Ideas Panel**: Create and save writing ideas
- **AI Helper**: Get AI-assisted writing suggestions
- **Structure Dropdown**: Quick insertion of song structure elements
- **File Operations**: New, Open, Save, Save As functionality

## Technical Implementation Details

### Key Components
- **App.tsx**: Main application component and state management
- **WritingBar.tsx**: Specialized text input with formatting and overflow handling
- **Toolbar.tsx**: Tools and actions for the lyric writer
- **Header.tsx**: App header with MPC buttons
- **MPCButtons.tsx**: Drum pad buttons for beat creation

### Special Features
1. **Drop Cap Implementation**:
   - Only appears on the first line of text
   - Skip structure tags when determining drop cap
   - Custom styling with orange color and larger font

2. **Structure Tag Handling**:
   - Bold styling for structure tags
   - Auto-advance to next line after structure insertion
   - Special handling to ensure proper cursor positioning

3. **Text Overflow Algorithm**:
   - Uses hidden measurement div to detect when text would overflow
   - Binary search algorithm to find optimal split point
   - Prefers splitting at word boundaries
   - Automatically moves overflow text to next line

4. **Keyboard Navigation**:
   - Enter key to create new lines
   - Tab key to advance to next line
   - Down arrow to move to next line
   - Auto-focus implementation for smooth writing experience

## Getting Started

### Installation
```bash
npm install
```

### Running Development Server
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Technologies Used
- React
- TypeScript
- Vite
- Tailwind CSS
- Lucide React (icons) 