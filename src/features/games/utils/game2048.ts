export type Board = number[][];
export type Direction = 'up' | 'down' | 'left' | 'right';

export const SIZE = 4;

const empty = (): Board => Array.from({ length: SIZE }, () => Array<number>(SIZE).fill(0));

function addRandomTile(board: Board): Board {
  const free: [number, number][] = [];
  board.forEach((row, r) => row.forEach((v, c) => v === 0 && free.push([r, c])));
  if (free.length === 0) return board;
  const [r, c] = free[Math.floor(Math.random() * free.length)];
  const next = board.map((row) => [...row]);
  next[r][c] = Math.random() < 0.9 ? 2 : 4;
  return next;
}

export const newGame = (): Board => addRandomTile(addRandomTile(empty()));

/** Slides and merges one row towards index 0. */
function slideRow(row: number[]): { row: number[]; gained: number } {
  const tiles = row.filter(Boolean);
  const out: number[] = [];
  let gained = 0;
  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i] === tiles[i + 1]) {
      out.push(tiles[i] * 2);
      gained += tiles[i] * 2;
      i++;
    } else out.push(tiles[i]);
  }
  while (out.length < SIZE) out.push(0);
  return { row: out, gained };
}

const rotate = (b: Board): Board => b[0].map((_, c) => b.map((row) => row[c]).reverse());

/** Moves every tile in a direction. `moved` is false when nothing changed (no new tile is added then). */
export function move(board: Board, dir: Direction): { board: Board; gained: number; moved: boolean } {
  // Rotate so the move is always "left", then rotate back.
  const turns = { left: 0, down: 1, right: 2, up: 3 }[dir];
  let work = board;
  for (let i = 0; i < turns; i++) work = rotate(work);
  let gained = 0;
  work = work.map((row) => {
    const res = slideRow(row);
    gained += res.gained;
    return res.row;
  });
  for (let i = 0; i < (4 - turns) % 4; i++) work = rotate(work);
  const moved = work.some((row, r) => row.some((v, c) => v !== board[r][c]));
  return { board: moved ? addRandomTile(work) : board, gained, moved };
}

export const hasMoves = (board: Board): boolean =>
  (['left', 'right', 'up', 'down'] as Direction[]).some((d) => move(board, d).moved);

export const highestTile = (board: Board): number => Math.max(...board.flat());
