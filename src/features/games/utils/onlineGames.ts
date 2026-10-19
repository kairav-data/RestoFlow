export interface OnlineGame {
  name: string;
  genre: string;
  blurb: string;
  url: string;
}

/** Popular free browser games on their own websites. Each one opens in a new browser tab. */
export const ONLINE_GAMES: OnlineGame[] = [
  { name: 'Shell Shockers', genre: 'FPS shooting', blurb: 'Multiplayer battles as armed eggs.', url: 'https://shellshock.io' },
  { name: 'Smash Karts', genre: 'Racing & combat', blurb: 'Race, collect weapons and attack opponents.', url: 'https://smashkarts.io' },
  { name: 'Krunker.io', genre: 'FPS shooting', blurb: 'Fast-paced competitive shooting.', url: 'https://krunker.io' },
  { name: 'Agar.io', genre: 'Multiplayer survival', blurb: 'Eat smaller cells and grow bigger.', url: 'https://agar.io' },
  { name: 'Moto X3M', genre: 'Racing', blurb: 'Perform stunts and avoid obstacles.', url: 'https://www.crazygames.com/game/moto-x3m' },
  { name: 'Drift Hunters', genre: 'Car simulation', blurb: 'Drift cars and earn points.', url: 'https://www.crazygames.com/game/drift-hunters' },
  { name: 'Slope', genre: 'Arcade', blurb: 'Control a ball racing down a 3D slope.', url: 'https://www.crazygames.com/game/slope' },
  { name: 'Paper.io 2', genre: 'Strategy', blurb: 'Capture territory while avoiding opponents.', url: 'https://paper-io.com' },
  { name: 'Skribbl.io', genre: 'Party game', blurb: 'Draw pictures while friends guess the words.', url: 'https://skribbl.io' },
  { name: '2048', genre: 'Puzzle', blurb: 'Combine numbers to reach 2048.', url: 'https://play2048.co' },
];
