export function generateSongNameSuggestions(lyrics: string[]): string[] {
  // Remove empty lines and join all lyrics
  const fullText = lyrics.filter(line => line.trim()).join(' ');
  
  // Extract significant words (excluding common words)
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
  const words = fullText.toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.has(word))
    .map(word => word.replace(/[^a-z]/g, ''));

  // Get unique words and sort by frequency
  const wordFrequency = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const significantWords = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);

  // Generate suggestions
  const suggestions: string[] = [];

  // Combine top words
  if (significantWords.length >= 2) {
    suggestions.push(
      `${capitalize(significantWords[0])} ${capitalize(significantWords[1])}`,
      `The ${capitalize(significantWords[0])}`,
      `${capitalize(significantWords[0])} ${capitalize(significantWords[significantWords.length - 1])}`
    );
  }

  // Add first line if it's not too long
  const firstLine = lyrics.find(line => line.trim())?.trim() || '';
  if (firstLine && firstLine.length < 30) {
    suggestions.push(firstLine);
  }

  return [...new Set(suggestions)];
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}