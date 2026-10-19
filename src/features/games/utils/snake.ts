export type Point = { x: number; y: number };
export type Dir = 'up' | 'down' | 'left' | 'right';

export const GRID = 16;

const DELTA: Record<Dir, Point> = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
const OPPOSITE: Record<Dir, Dir> = { up: 'down', down: 'up', left: 'right', right: 'left' };

export interface SnakeState {
  snake: Point[]; // head first
  dir: Dir;
  food: Point;
  score: number;
  over: boolean;
}

export function placeFood(snake: Point[]): Point {
  const free: Point[] = [];
  for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) if (!snake.some((s) => s.x === x && s.y === y)) free.push({ x, y });
  return free[Math.floor(Math.random() * free.length)] ?? { x: 0, y: 0 };
}

export function newSnake(): SnakeState {
  const snake = [{ x: 8, y: 8 }, { x: 7, y: 8 }, { x: 6, y: 8 }];
  return { snake, dir: 'right', food: placeFood(snake), score: 0, over: false };
}

/** A turn straight back into the body is ignored. */
export const turn = (state: SnakeState, wanted: Dir): Dir => (OPPOSITE[wanted] === state.dir ? state.dir : wanted);

export function step(state: SnakeState, wanted: Dir): SnakeState {
  if (state.over) return state;
  const dir = turn(state, wanted);
  const head = { x: state.snake[0].x + DELTA[dir].x, y: state.snake[0].y + DELTA[dir].y };
  const ate = head.x === state.food.x && head.y === state.food.y;
  const body = ate ? state.snake : state.snake.slice(0, -1);
  const hitWall = head.x < 0 || head.y < 0 || head.x >= GRID || head.y >= GRID;
  if (hitWall || body.some((s) => s.x === head.x && s.y === head.y)) return { ...state, dir, over: true };
  const snake = [head, ...body];
  return { snake, dir, food: ate ? placeFood(snake) : state.food, score: state.score + (ate ? 10 : 0), over: false };
}
