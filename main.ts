// main.ts — the entry program: hand the game in.
// One job: copy game/ and screenshots/ from this repository into the
// output directory and write /output/dossier.json with buildDossier
// from vendor/makefun-game.ts, exactly as the kit's library writes it.
// Runs twice; both runs must write the same bytes (buildDossier is
// deterministic, and the copy is a plain file copy). Paths resolve from
// this file's own directory, never from the caller's working directory.
import { cpSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

mkdirSync(outDir, { recursive: true });
cpSync(join(repoRoot, 'game'), join(outDir, 'game'), { recursive: true });
cpSync(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
writeFileSync(
  join(outDir, 'dossier.json'),
  buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
  }),
);
