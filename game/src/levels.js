// The three rooms of the heist. Each level is one room the thief crosses in
// a single frame: walls and cover to hide behind, guard patrols, sweeping
// cameras, small loot, one diamond case (the target) and the exit door.
// Cover blocks line of sight; patrols and cones are placed so every room
// has at least two routes to the diamond — a fast open one and a slow
// covered one.
import { ROOM } from './config.js';

function rect(x, y, w, h, kind) {
  return { x, y, w, h, kind: kind || 'crate' };
}

// Display cases and pillars read as museum furniture; crates as cover.
export function buildLevels() {
  const x0 = ROOM.x;
  const y0 = ROOM.y;
  const x1 = ROOM.x + ROOM.w;
  const y1 = ROOM.y + ROOM.h;

  return [
    {
      name: 'LEVEL 1 — THE MERIDIAN GALLERY',
      par: 75,
      entry: { x: x0 + 70, y: y0 + ROOM.h - 70 },
      exit: { x: x1 - 90, y: y0 + 26, w: 64, h: 26 },
      diamond: { x: (x0 + x1) / 2, y: y0 + 150 },
      loot: [
        { x: x0 + 220, y: y0 + 130, kind: 'vase', value: 150 },
        { x: x1 - 250, y: y0 + 200, kind: 'painting', value: 150 },
        { x: x0 + 180, y: y1 - 160, kind: 'vase', value: 150 },
        { x: x1 - 200, y: y1 - 150, kind: 'painting', value: 150 },
      ],
      cover: [
        rect(x0 + 150, y0 + 220, 130, 60, 'case'),
        rect(x0 + 430, y0 + 90, 60, 130, 'pillar'),
        rect((x0 + x1) / 2 - 130, y0 + 300, 260, 56, 'case'),
        rect(x1 - 340, y0 + 90, 60, 130, 'pillar'),
        rect(x1 - 300, y0 + 330, 130, 60, 'case'),
        rect(x0 + 300, y0 + 430, 56, 120, 'pillar'),
        rect(x1 - 560, y0 + 430, 56, 120, 'pillar'),
        rect(x0 + 480, y1 - 120, 240, 50, 'case'),
      ],
      guards: [
        {
          path: [
            [x0 + 330, y0 + 120],
            [x1 - 330, y0 + 120],
            [x1 - 330, y0 + 300],
            [x0 + 330, y0 + 300],
          ],
          pause: 1.2,
        },
        {
          path: [
            [x1 - 260, y1 - 120],
            [x0 + 260, y1 - 120],
            [x0 + 260, y0 + 420],
            [x1 - 260, y0 + 420],
          ],
          pause: 1.0,
        },
      ],
      cameras: [
        { x: (x0 + x1) / 2, y: y0 + 8, base: Math.PI / 2, arc: 0.9, speed: 0.45 },
      ],
      lasers: [],
    },
    {
      name: 'LEVEL 2 — THE VAULT HALL',
      par: 90,
      entry: { x: x0 + 70, y: y0 + 70 },
      exit: { x: x1 - 90, y: y1 - 52, w: 64, h: 26 },
      diamond: { x: (x0 + x1) / 2, y: y0 + ROOM.h / 2 - 20 },
      loot: [
        { x: x0 + 200, y: y0 + 110, kind: 'gold', value: 200 },
        { x: x1 - 220, y: y0 + 110, kind: 'gold', value: 200 },
        { x: x0 + 200, y: y1 - 130, kind: 'gold', value: 200 },
        { x: x1 - 220, y: y1 - 130, kind: 'gold', value: 200 },
        { x: (x0 + x1) / 2, y: y0 + 90, kind: 'vase', value: 200 },
      ],
      cover: [
        rect(x0 + 140, y0 + 180, 56, 150, 'pillar'),
        rect(x1 - 200, y0 + 180, 56, 150, 'pillar'),
        rect(x0 + 140, y1 - 330, 56, 150, 'pillar'),
        rect(x1 - 200, y1 - 330, 56, 150, 'pillar'),
        rect((x0 + x1) / 2 - 190, y0 + 130, 380, 50, 'case'),
        rect((x0 + x1) / 2 - 190, y1 - 180, 380, 50, 'case'),
        rect(x0 + 320, y0 + 260, 120, 56, 'crate'),
        rect(x1 - 440, y0 + 260, 120, 56, 'crate'),
      ],
      guards: [
        {
          path: [
            [x0 + 250, y0 + 120],
            [x1 - 250, y0 + 120],
            [x1 - 250, y1 - 120],
            [x0 + 250, y1 - 120],
          ],
          pause: 0.8,
        },
        {
          path: [
            [(x0 + x1) / 2, y0 + 220],
            [(x0 + x1) / 2, y1 - 220],
          ],
          pause: 1.4,
        },
        {
          path: [
            [x0 + 420, y1 - 140],
            [x1 - 420, y1 - 140],
            [x1 - 420, y0 + 300],
            [x0 + 420, y0 + 300],
          ],
          pause: 0.9,
        },
      ],
      cameras: [
        { x: x0 + 8, y: (y0 + y1) / 2, base: 0, arc: 1.0, speed: 0.55 },
        { x: x1 - 8, y: (y0 + y1) / 2, base: Math.PI, arc: 1.0, speed: 0.55 },
      ],
      lasers: [
        { x: x0 + 430, top: y0 + 40, bottom: y1 - 40, speed: 55, phase: 0 },
        { x: x1 - 430, top: y0 + 40, bottom: y1 - 40, speed: 55, phase: 0.5 },
      ],
    },
    {
      name: 'LEVEL 3 — ROOFTOP GETAWAY',
      par: 100,
      entry: { x: (x0 + x1) / 2, y: y1 - 70 },
      exit: { x: (x0 + x1) / 2 - 32, y: y0 + 4, w: 64, h: 26 },
      diamond: { x: (x0 + x1) / 2, y: y0 + 210 },
      loot: [
        { x: x0 + 170, y: y0 + 120, kind: 'gold', value: 250 },
        { x: x1 - 190, y: y0 + 120, kind: 'gold', value: 250 },
        { x: x0 + 170, y: y1 - 130, kind: 'painting', value: 250 },
        { x: x1 - 190, y: y1 - 130, kind: 'painting', value: 250 },
        { x: x0 + 420, y: y0 + 300, kind: 'vase', value: 250 },
        { x: x1 - 440, y: y0 + 300, kind: 'vase', value: 250 },
      ],
      cover: [
        rect(x0 + 120, y0 + 200, 150, 60, 'crate'),
        rect(x1 - 270, y0 + 200, 150, 60, 'crate'),
        rect(x0 + 120, y1 - 260, 150, 60, 'crate'),
        rect(x1 - 270, y1 - 260, 150, 60, 'crate'),
        rect((x0 + x1) / 2 - 28, y0 + 300, 56, 130, 'pillar'),
        rect(x0 + 430, y0 + 110, 56, 120, 'pillar'),
        rect(x1 - 490, y0 + 110, 56, 120, 'pillar'),
        rect((x0 + x1) / 2 - 220, y1 - 170, 440, 50, 'case'),
      ],
      guards: [
        {
          path: [
            [x0 + 200, y0 + 130],
            [x1 - 200, y0 + 130],
            [x1 - 200, y0 + 330],
            [x0 + 200, y0 + 330],
          ],
          pause: 0.6,
        },
        {
          path: [
            [x0 + 200, y1 - 130],
            [x1 - 200, y1 - 130],
            [x1 - 200, y0 + 420],
            [x0 + 200, y0 + 420],
          ],
          pause: 0.6,
        },
        {
          path: [
            [x0 + 330, y0 + 380],
            [x1 - 330, y0 + 380],
          ],
          pause: 1.0,
        },
      ],
      cameras: [
        { x: x0 + 8, y: y0 + 90, base: Math.PI / 4, arc: 0.8, speed: 0.7 },
        { x: x1 - 8, y: y0 + 90, base: (3 * Math.PI) / 4, arc: 0.8, speed: 0.7 },
      ],
      lasers: [{ x: (x0 + x1) / 2, top: y0 + 40, bottom: y1 - 40, speed: 70, phase: 0 }],
    },
  ];
}
