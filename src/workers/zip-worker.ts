import { ZipArchive, type ArchiverError } from 'archiver';
import { createWriteStream } from 'fs';
import { stat } from 'fs/promises';
import { parentPort, workerData } from 'worker_threads';

interface ZipWorkerData {
  outputPath: string;
  files: Array<{ path: string; name: string }>;
}

interface ZipWorkerProgress {
  type: 'progress';
  progress: number;
}

interface ZipWorkerComplete {
  type: 'completed';
  size: number;
}

interface ZipWorkerFailure {
  type: 'failed';
  error: string;
}

function send(message: ZipWorkerProgress | ZipWorkerComplete | ZipWorkerFailure): void {
  parentPort?.postMessage(message);
}

async function createZip({ outputPath, files }: ZipWorkerData): Promise<void> {
  const output = createWriteStream(outputPath);
  const archive = new ZipArchive({ zlib: { level: 9 } });
  let processed = 0;

  await new Promise<void>((resolve, reject) => {
    output.on('close', resolve);
    output.on('error', reject);
    archive.on('error', reject);
    archive.on('warning', (error: ArchiverError) => {
      reject(error);
    });

    for (const file of files) {
      archive.file(file.path, { name: file.name });
      processed += 1;
      send({
        type: 'progress',
        progress: Math.min(99, Math.floor((processed / files.length) * 90)),
      });
    }

    archive.pipe(output);
    void archive.finalize().catch(reject);
  });

  const outputStats = await stat(outputPath);
  send({ type: 'completed', size: outputStats.size });
}

createZip(workerData as ZipWorkerData).catch((error: unknown) => {
  send({
    type: 'failed',
    error: error instanceof Error ? error.message : 'ZIP creation failed',
  });
});
