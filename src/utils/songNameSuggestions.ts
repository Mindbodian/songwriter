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
    .map(([word]) => capitalize(word));

  // Word banks for random generation
  const adjectives = [
    'Midnight', 'Golden', 'Neon', 'Silent', 'Lonely', 'Electric', 'Fading', 'Burning', 'Lost', 'Open',
    'Wild', 'Broken', 'Endless', 'Falling', 'Hidden', 'Crystal', 'Velvet', 'Shadow', 'Sacred', 'Blue',
    'Crimson', 'Silver', 'Radiant', 'Secret', 'Wandering', 'Echoing', 'Distant', 'Shining', 'Restless', 'Sacred'
  ];
  const nouns = [
    'Dreams', 'Groove', 'Sound', 'Skyline', 'Horizon', 'Reflection', 'Road', 'Soul', 'Night', 'Light',
    'Fire', 'Rain', 'Heart', 'Song', 'River', 'City', 'Memory', 'Shadow', 'Star', 'Whisper',
    'Vision', 'Journey', 'Sunrise', 'Twilight', 'Mirage', 'Pulse', 'Wave', 'Desire', 'Promise', 'Flight'
  ];
  const templates = [
    '{adj} {noun}',
    'The {adj} {noun}',
    '{noun} of {noun}',
    '{adj} {noun} Blues',
    'Under the {adj} {noun}',
    'Lost in the {noun}',
    'Echoes of {noun}',
    'Return to {noun}',
    'Chasing {noun}',
    'Between the {noun} and {noun}',
    'Call of the {adj} {noun}',
    'Dancing with {noun}',
    'Beyond the {adj} {noun}',
    'Into the {adj} {noun}',
    'Whispers of {noun}',
    'Fading {noun}',
    'Neon {noun}',
    'Midnight {noun}',
    'Open {noun}',
    'Skyline {noun}'
  ];

  // Helper to pick a random item
  function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // Helper to generate a random title
  function randomTitle(): string {
    let template = pick(templates);
    // 30% chance to use a significant word from lyrics if available
    let useSig = significantWords.length > 0 && Math.random() < 0.3;
    let adj = useSig ? pick(significantWords) : pick(adjectives);
    let noun1 = useSig ? pick(significantWords) : pick(nouns);
    let noun2 = pick(nouns);
    return template
      .replace('{adj}', adj)
      .replace('{noun}', noun1)
      .replace('{noun}', noun2);
  }

  // Always generate 5 unique random suggestions
  const suggestions = new Set<string>();
  let tries = 0;
  while (suggestions.size < 5 && tries < 30) {
    suggestions.add(randomTitle());
    tries++;
  }

  return Array.from(suggestions).slice(0, 5);
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}