# Project Bolt - Music Production App

A React-based music production application with lyric writing tools, MPC-style beat pads, and audio upload capabilities.

## Features

- **Lyric Writing Interface**: Clean, notebook-style writing environment
- **MPC Beat Pads**: 8 programmable pads with default beats and custom audio upload
- **Audio Upload**: Upload custom audio files to any MPC pad
- **Rhyme Dictionary**: Built-in rhyming assistance
- **AI Lyric Helper**: AI-powered lyric suggestions
- **Song Structure Tools**: Pre-built song structure templates
- **File Management**: Save, load, and export your projects
- **Responsive Design**: Works on desktop and mobile devices

## Recent Updates

- ✅ Fixed PowerShell execution policy issues
- ✅ Removed red border and glow from me.png image
- ✅ Added smooth sliding animation for me.png (slides in from right, slides out to right)
- ✅ Integrated audio upload functionality
- ✅ Added custom pad state management

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/your-repo-name.git
cd your-repo-name
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

### Writing Lyrics
- Type in the main writing area
- Use the toolbar for various functions
- Save your work using the save button

### Using MPC Pads
- Click any of the 8 MPC pads to play default beats
- Upload custom audio by clicking "Upload Audio" above the pads
- Select a pad and upload your audio file
- Choose between looped or one-shot playback

### Audio Upload
- Click "Upload Audio" above the MPC pads
- Select an audio file (MP3, WAV, etc.)
- Choose your preferred pad
- Set playback mode (looped or one-shot)
- Save to assign the audio to the selected pad

## Project Structure

```
project/
├── src/
│   ├── components/          # React components
│   ├── context/            # React context providers
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   └── App.tsx             # Main application component
├── public/
│   ├── assets/             # Static assets
│   ├── sounds/             # Audio files
│   └── fonts/              # Custom fonts
└── package.json            # Dependencies and scripts
```

## Technologies Used

- **React 18** - Frontend framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Web Audio API** - Audio playback
- **File API** - File upload handling

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

**Note**: This project includes audio files and may require appropriate licensing for commercial use. 