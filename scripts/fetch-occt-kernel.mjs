#!/usr/bin/env node
/**
 * Download occt-kernel artefacts (K3-1 bootstrap) for @opencad/kernel tests.
 * Usage: node scripts/fetch-occt-kernel.mjs
 */
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const TAG = 'v0.2.0'
const racine = join(dirname(fileURLToPath(import.meta.url)), '..')
const sortie = join(racine, 'packages', 'kernel', 'occt')

await mkdir(sortie, { recursive: true })
execFileSync(
  'gh',
  [
    'release',
    'download',
    TAG,
    '--repo',
    'naanouff/occt-wasm',
    '--pattern',
    'occt-kernel.*',
    '--pattern',
    'LICENSE*',
    '--pattern',
    'OCCT_LGPL*',
    '--pattern',
    'link-libs.txt',
    '--dir',
    sortie,
    '--clobber',
  ],
  { stdio: 'inherit' },
)

const libs = await readFile(join(sortie, 'link-libs.txt'), 'utf8')
if (/TKOpenGl/i.test(libs)) {
  console.error('link-libs.txt contains TKOpenGl')
  process.exit(1)
}
await writeFile(join(sortie, 'VERSION'), `${TAG}\n`, 'utf8')
console.log(`occt-kernel ${TAG} → ${sortie}`)
