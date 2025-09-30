// node run-live.mjs
import { LiquipediaProvider } from './providers/liquipediaProvider.mjs';
import fs from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';

const ORIGINAL_FILE = './index.js';            // ← ton vrai fichier
const TMP_FILE = path.join(os.tmpdir(), '.tmp-esport-vision.js');

function serializeCalendrier(array) {
  return JSON.stringify(array, null, 2)
    .replace(/"À venir"/g, `'À venir'`)
    .replace(/"Terminé"/g, `'Terminé'`);
}

async function buildCalendrierLive() {
  const provider = new LiquipediaProvider({
    userAgent: 'EsportVision/1.0 (contact: wessim.harmel1@gmail.com)'
  });

  const matchsLoL = await provider.fetchMany({
    jeu: 'League of Legends',
    competition: 'LFL',
    paires: [
      { equipeA: 'Karmine Corp', equipeB: 'Solary' },
      { equipeA: 'Gentle Mates', equipeB: 'BDS Academy' }
    ]
  });

  const matchsValorant = await provider.fetchMany({
    jeu: 'Valorant',
    competition: 'VCT EMEA',
    paires: [
      { equipeA: 'Team Vitality', equipeB: 'Mandatory' },
      { equipeA: 'Karmine Corp', equipeB: 'Mandatory' }
    ]
  });

  return [...matchsLoL, ...matchsValorant];
}

async function patchInMemory(sourceCode, calendrier) {
  const regex = /const\s+calendrierMatchs\s*=\s*\[[\s\S]*?\];/m;
  const replacement = `const calendrierMatchs = ${serializeCalendrier(calendrier)};`;
  if (!regex.test(sourceCode)) {
    throw new Error(
      "Impossible de trouver `const calendrierMatchs = [...]` dans index.js. " +
      "Il doit exister tel quel pour le patch non-invasif."
    );
  }
  return sourceCode.replace(regex, replacement);
}

async function runTempFile(file) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [file], { stdio: 'inherit' });
    child.on('exit', code => code === 0 ? resolve() : reject(new Error(`Process exited ${code}`)));
    child.on('error', reject);
  });
}

(async () => {
  try {
    const calendrierLive = await buildCalendrierLive();
    const originalCode = await fs.readFile(ORIGINAL_FILE, 'utf8');
    const patched = await patchInMemory(originalCode, calendrierLive);
    await fs.writeFile(TMP_FILE, patched, 'utf8');
    console.log('[runner] Exécution du fichier temporaire:', TMP_FILE);
    await runTempFile(TMP_FILE);
    // await fs.unlink(TMP_FILE); // si tu veux nettoyer
  } catch (err) {
    console.error('[runner] Erreur:', err.message);
    process.exit(1);
  }
})();
