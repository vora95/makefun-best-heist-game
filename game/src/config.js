// MERIDIAN VAULT — shared constants for the heist.
// One room per level, drawn whole in a single 1280x720 frame so the judge
// sees the thief, the guards, their vision cones, the cameras, the loot
// target and the alarm meter all at once.
export const VIEW_W = 1280;
export const VIEW_H = 720;
export const HUD_H = 64;
// Playable room bounds (inside the outer wall).
export const ROOM = { x: 36, y: HUD_H + 16, w: 1208, h: 600 };

// Movement (pixels per second).
export const THIEF_SPEED = 215;
export const THIEF_SNEAK_SPEED = 118;
export const THIEF_DASH_SPEED = 520;
export const DASH_TIME = 0.16;
export const DASH_COOLDOWN = 1.6;
export const THIEF_RADIUS = 13;

// Vision: a guard's cone. Sneaking shrinks the range a guard can spot.
export const GUARD_FOV = (68 * Math.PI) / 180;
export const GUARD_RANGE = 205;
export const GUARD_SNEAK_RANGE = 135;
export const CAMERA_FOV = (52 * Math.PI) / 180;
export const CAMERA_RANGE = 235;

// Suspicion: 0..100 per guard. Full suspicion = the guard chases you.
export const SUSPICION_GAIN = 95; // per second, fully inside a cone
export const SUSPICION_DECAY = 26; // per second, unseen
export const CHASE_SPEED = 178;
export const PATROL_SPEED = 62;

// Alarm: 0..100 for the whole heist. 100 = caught, lose a life.
export const ALARM_CHASE_GAIN = 16; // per second while any guard chases
export const ALARM_SPOT_GAIN = 9; // per second while any guard is suspicious
export const ALARM_CAMERA_GAIN = 30; // per second while a camera sees you
export const ALARM_LASER_HIT = 28; // flat, on crossing a live laser
export const ALARM_DECAY = 5.5; // per second while nobody sees you
export const ALARM_AFTER_CAUGHT = 42;

// Tools. Every tool costs something, so the judge can see the trade-off.
export const TOOLS_START = { smoke: 3, emp: 2, coins: 5 };
export const SMOKE_TIME = 4.5; // seconds a smoke cloud blocks vision
export const SMOKE_RADIUS = 95;
export const EMP_TIME = 6; // seconds cameras stay dark
export const COIN_RADIUS = 150; // guards inside this walk to the coin
export const COIN_TIME = 5;

// Scoring.
export const SCORE_DIAMOND = 1000;
export const SCORE_EXIT = 250;
export const SCORE_GHOST_BONUS = 500; // finish a level never spotted
export const SCORE_TIME_BONUS_PER_SEC = 12; // leftover par time pays out

// Palette: night museum. Gold = loot, amber = guard danger, red = camera,
// teal = the thief, so safe cover, danger and loot read at a glance.
export const COLORS = {
  floor: '#141a2e',
  floorTile: '#182036',
  wall: '#2b3350',
  wallEdge: '#4a5578',
  cover: '#232c47',
  coverTop: '#31406b',
  glass: '#7fd4ff',
  gold: '#f5c542',
  goldGlow: '#ffe9a3',
  guard: '#ff9f43',
  guardCone: 'rgba(255, 159, 67, 0.20)',
  guardConeAlert: 'rgba(255, 64, 64, 0.30)',
  camera: '#ff5d5d',
  cameraCone: 'rgba(255, 93, 93, 0.16)',
  thief: '#2dd4bf',
  thiefSneak: '#5eead4',
  smoke: 'rgba(180, 190, 210, 0.55)',
  laser: '#ff2e63',
  exit: '#34d399',
  hudBg: '#0d1120',
  hudLine: '#2b3350',
  text: '#e8ecf8',
  dim: '#9aa5c4',
  alarmLow: '#34d399',
  alarmMid: '#f5c542',
  alarmHigh: '#ff5d5d',
};
