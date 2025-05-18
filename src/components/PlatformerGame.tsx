import React, { useEffect, useRef, useState } from 'react';

interface GameState {
  player: {
    x: number;
    y: number;
    width: number;
    height: number;
    velocityX: number;
    velocityY: number;
    isJumping: boolean;
    facingRight: boolean;
  };
  platforms: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    type: 'piano' | 'black-key';
  }>;
  coins: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    collected: boolean;
    type: 'note' | 'star';
  }>;
  particles: Array<{
    x: number;
    y: number;
    size: number;
    color: string;
    velocityX: number;
    velocityY: number;
    life: number;
  }>;
  score: number;
  backgroundOffset: number;
}

const PlatformerGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    player: {
      x: 50,
      y: 300,
      width: 40,
      height: 40,
      velocityX: 0,
      velocityY: 0,
      isJumping: false,
      facingRight: true,
    },
    platforms: [
      { x: 0, y: 400, width: 800, height: 20, type: 'piano' },
      { x: 200, y: 300, width: 100, height: 20, type: 'black-key' },
      { x: 400, y: 250, width: 100, height: 20, type: 'piano' },
      { x: 600, y: 200, width: 100, height: 20, type: 'black-key' },
    ],
    coins: [
      { x: 250, y: 250, width: 20, height: 20, collected: false, type: 'note' },
      { x: 450, y: 200, width: 20, height: 20, collected: false, type: 'star' },
      { x: 650, y: 150, width: 20, height: 20, collected: false, type: 'note' },
    ],
    particles: [],
    score: 0,
    backgroundOffset: 0,
  });

  const keys = useRef<{ [key: string]: boolean }>({});
  const sprites = useRef<{ [key: string]: HTMLImageElement }>({});

  // Load sprites
  useEffect(() => {
    const loadSprite = (name: string, src: string) => {
      const img = new Image();
      img.src = src;
      sprites.current[name] = img;
    };

    // Load all sprites
    loadSprite('player', '/game-assets/piano-player.png');
    loadSprite('piano-platform', '/game-assets/piano-platform.png');
    loadSprite('black-key', '/game-assets/black-key.png');
    loadSprite('note', '/game-assets/music-note.png');
    loadSprite('star', '/game-assets/star.png');
  }, []);

  const createParticles = (x: number, y: number, color: string) => {
    const newParticles = Array(10).fill(null).map(() => ({
      x,
      y,
      size: Math.random() * 4 + 2,
      color,
      velocityX: (Math.random() - 0.5) * 4,
      velocityY: (Math.random() - 0.5) * 4,
      life: 1,
    }));
    setGameState(prev => ({
      ...prev,
      particles: [...prev.particles, ...newParticles],
    }));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 500;

    // Event listeners for keyboard
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.key] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Game loop
    const gameLoop = setInterval(() => {
      // Update game state
      setGameState(prevState => {
        const newState = { ...prevState };
        const player = newState.player;

        // Handle movement
        if (keys.current['ArrowLeft']) {
          player.velocityX = -5;
          player.facingRight = false;
        } else if (keys.current['ArrowRight']) {
          player.velocityX = 5;
          player.facingRight = true;
        } else {
          player.velocityX = 0;
        }

        // Handle jumping
        if (keys.current[' '] && !player.isJumping) {
          player.velocityY = -15;
          player.isJumping = true;
          createParticles(player.x + player.width/2, player.y + player.height, '#FF5733');
        }

        // Apply gravity
        player.velocityY += 0.8;
        player.x += player.velocityX;
        player.y += player.velocityY;

        // Update background offset
        newState.backgroundOffset = (newState.backgroundOffset + 0.5) % 800;

        // Check platform collisions
        newState.platforms.forEach(platform => {
          if (
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height > platform.y &&
            player.y < platform.y + platform.height
          ) {
            if (player.velocityY > 0) {
              player.y = platform.y - player.height;
              player.velocityY = 0;
              player.isJumping = false;
              createParticles(player.x + player.width/2, player.y + player.height, '#2ECC71');
            }
          }
        });

        // Check coin collisions
        newState.coins.forEach(coin => {
          if (!coin.collected &&
              player.x < coin.x + coin.width &&
              player.x + player.width > coin.x &&
              player.y + player.height > coin.y &&
              player.y < coin.y + coin.height
          ) {
            coin.collected = true;
            newState.score += 10;
            createParticles(coin.x + coin.width/2, coin.y + coin.height/2, '#F1C40F');
          }
        });

        // Update particles
        newState.particles = newState.particles
          .map(particle => ({
            ...particle,
            x: particle.x + particle.velocityX,
            y: particle.y + particle.velocityY,
            life: particle.life - 0.02,
          }))
          .filter(particle => particle.life > 0);

        // Keep player in bounds
        if (player.x < 0) player.x = 0;
        if (player.x + player.width > canvas.width) {
          player.x = canvas.width - player.width;
        }

        return newState;
      });

      // Draw everything
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw piano keys background
      for (let i = 0; i < canvas.width + 100; i += 50) {
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(i - gameState.backgroundOffset, 0, 30, canvas.height);
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(i + 30 - gameState.backgroundOffset, 0, 20, canvas.height);
      }
      
      // Draw platforms
      gameState.platforms.forEach(platform => {
        if (platform.type === 'piano') {
          ctx.fillStyle = '#ffffff';
        } else {
          ctx.fillStyle = '#000000';
        }
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
      });

      // Draw player
      const playerSprite = sprites.current['player'];
      if (playerSprite) {
        ctx.save();
        if (!gameState.player.facingRight) {
          ctx.translate(gameState.player.x + gameState.player.width, gameState.player.y);
          ctx.scale(-1, 1);
          ctx.drawImage(playerSprite, 0, 0, gameState.player.width, gameState.player.height);
        } else {
          ctx.drawImage(playerSprite, gameState.player.x, gameState.player.y, gameState.player.width, gameState.player.height);
        }
        ctx.restore();
      } else {
        ctx.fillStyle = '#FF5733';
        ctx.fillRect(
          gameState.player.x,
          gameState.player.y,
          gameState.player.width,
          gameState.player.height
        );
      }

      // Draw coins
      gameState.coins.forEach(coin => {
        if (!coin.collected) {
          const coinSprite = sprites.current[coin.type];
          if (coinSprite) {
            ctx.drawImage(coinSprite, coin.x, coin.y, coin.width, coin.height);
          } else {
            ctx.fillStyle = '#F1C40F';
            ctx.beginPath();
            ctx.arc(
              coin.x + coin.width / 2,
              coin.y + coin.height / 2,
              coin.width / 2,
              0,
              Math.PI * 2
            );
            ctx.fill();
          }
        }
      });

      // Draw particles
      gameState.particles.forEach(particle => {
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Draw score
      ctx.fillStyle = '#ffffff';
      ctx.font = '20px Arial';
      ctx.fillText(`Score: ${gameState.score}`, 10, 30);
    }, 1000 / 60);

    return () => {
      clearInterval(gameLoop);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <h1 className="text-3xl font-bold mb-4 text-white">Piano Platformer</h1>
      <div className="bg-gray-900 p-4 rounded-lg shadow-lg">
        <canvas
          ref={canvasRef}
          className="border-2 border-gray-700 rounded"
        />
      </div>
      <div className="mt-4 text-gray-400">
        <p>Controls: Arrow keys to move, Space to jump</p>
        <p>Collect musical notes and stars to increase your score!</p>
      </div>
    </div>
  );
};

export default PlatformerGame; 