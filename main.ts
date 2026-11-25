// WOK HEI — a best-cooking-game-20261125-0137 entry (Node 22, stdlib only).
//
// The game lives in this directory's game/ folder: plain static files a
// desktop browser loads offline — game/index.html plus its ES modules under
// game/src/. No library, no network request, no build step. This program
// hands the entry in: it copies game/ and screenshots/ from beside this file
// to /output and writes /output/dossier.json with the vendored make.fun
// library, so the judge can read the game.
//
// Play it locally with a static server over game/, then open index.html.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's own caps: only text_max_bytes shapes the bytes; the rest
// refuse an entry the scorer would refuse (more than 4 screenshots or one
// over 256 KiB; more than 993 files in game/ or 48 MiB of game files in all,
// or a path under game/ over 1000 bytes; game/ counts beside /output's own
// 1000-entry cap, its screenshots/ and dossier.json).
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

// Build-log summary (stderr only, never into /output): dossier size and
// screenshot count, so a bad build is visible before anyone submits it.
const dossierBytes = statSync(join(out, 'dossier.json')).size;
const shotCount = existsSync(join(out, 'screenshots'))
  ? readdirSync(join(out, 'screenshots')).length
  : 0;
console.error(`WOK HEI: dossier.json ${dossierBytes} bytes, ${shotCount} screenshots in /output`);
