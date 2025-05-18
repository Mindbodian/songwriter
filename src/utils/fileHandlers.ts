import { readFile } from './fileHandler';

export const handleFileOpen = async (file: File) => {
  try {
    const content = await readFile(file);
    const lines = content.split('\n').filter(line => line.trim() !== '');
    return {
      lines: [...lines, ''],
      fileName: file.name.replace(/\.txt$/, '')
    };
  } catch (error) {
    console.error('Error reading file:', error);
    throw new Error('Failed to open file. Please try again.');
  }
};

export const handleFileSave = (fileName: string, content: string[]) => {
  const blob = new Blob([content.join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};

export const handleCopyToClipboard = async (content: string[]) => {
  const lyrics = content.filter(line => line.trim() !== '').join('\n');
  try {
    await navigator.clipboard.writeText(lyrics);
    return true;
  } catch (error) {
    console.error('Failed to copy lyrics:', error);
    throw new Error('Failed to copy lyrics. Please try again.');
  }
};