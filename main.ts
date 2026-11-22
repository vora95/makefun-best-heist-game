// MERIDIAN VAULT — entry program (Node 22, standard library only).
//
// The game lives in game/ as plain static files (index.html + ES modules,
// no library, no network request) and its screenshots live in screenshots/.
// This program hands both in: it copies game/ and screenshots/ next to this
// file into /output and writes /output/dossier.json with the vendored
// make.fun library, exactly as the kit's starter does. Outside the grader,
// MAKEFUN_OUTPUT_DIR stands in for /output:
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// The run is deterministic: the same repository always writes the same
// bytes, so the grader's two runs agree.
import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function fail(message) {
  console.error(`main.ts: ${message}`);
  process.exit(1);
}

// The game must be present and non-empty, or the dossier would be a lie.
if (!existsSync(join(here, 'game', 'index.html'))) fail('game/index.html is missing');
const gameFiles = readdirSync(join(here, 'game'), { recursive: true });
if (gameFiles.length === 0) fail('game/ is empty');

// Screenshots are the judge's whole view of the game: refuse to hand in
// an entry without them rather than submit a blind one.
const shotDir = join(here, 'screenshots');
if (!existsSync(shotDir)) fail('screenshots/ is missing');
const shots = readdirSync(shotDir).filter((name) => {
  const full = join(shotDir, name);
  return statSync(full).isFile() && /\.(png|jpe?g)$/i.test(name);
});
if (shots.length < 3 || shots.length > 4) {
  fail(`expected 3 or 4 screenshots, found ${shots.length}`);
}
for (const name of shots) {
  const size = statSync(join(shotDir, name)).size;
  if (size > 262144) fail(`screenshot ${name} is ${size} bytes (cap 256 KiB)`);
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
cpSync(shotDir, join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (from the competition's gate): only text_max_bytes
// shapes the bytes; the rest refuse an entry the scorer would refuse.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);

console.log(`wrote ${shots.length} screenshots + dossier.json to ${out}`);
