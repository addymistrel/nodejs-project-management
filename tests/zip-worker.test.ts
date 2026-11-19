import { mkdtemp, mkdir, readFile, rm, writeFile } from 'fs/promises';
import os from 'os';
import path from 'path';
import { afterEach, describe, expect, it } from 'vitest';
import { createZip } from '../src/workers/zip-worker.js';

let temporaryDirectory: string | undefined;

afterEach(async () => {
  if (temporaryDirectory) {
    await new Promise<void>((resolve) => setTimeout(resolve, 25));
    await rm(temporaryDirectory, { recursive: true, force: true });
    temporaryDirectory = undefined;
  }
});

describe('ZIP worker', () => {
  it('creates a ZIP archive from source files', async () => {
    temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), 'zip-worker-'));
    const sourcePath = path.join(temporaryDirectory, 'source.txt');
    const outputPath = path.join(temporaryDirectory, 'output.zip');
    await writeFile(sourcePath, 'zip worker test');

    await createZip({
      outputPath,
      files: [{ path: sourcePath, name: 'source.txt' }],
    });

    const archive = await readFile(outputPath);
    expect(archive.byteLength).toBeGreaterThan(0);
  });

  it('rejects when the output directory does not exist', async () => {
    temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), 'zip-worker-'));
    const sourcePath = path.join(temporaryDirectory, 'source.txt');
    const missingDirectory = path.join(temporaryDirectory, 'missing');
    await mkdir(missingDirectory).catch(() => undefined);
    await writeFile(sourcePath, 'zip worker test');

    await expect(
      createZip({
        outputPath: path.join(missingDirectory, 'nested', 'output.zip'),
        files: [{ path: sourcePath, name: 'source.txt' }],
      }),
    ).rejects.toBeDefined();
  });
});
