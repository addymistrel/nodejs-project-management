import { ZipArchive, type ArchiverError } from 'archiver';
import { createWriteStream } from 'fs';
import { stat, unlink } from 'fs/promises';
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

interface ZipWorkerFileProgress {
  fs?: {
    processedBytes: number;
    totalBytes: number;
  };
}

function send(message: ZipWorkerProgress | ZipWorkerComplete | ZipWorkerFailure): void {
  parentPort?.postMessage(message);
}

function configureArchiveEvents(
  archive: ZipArchive,
  output: ReturnType<typeof createWriteStream>,
  resolve: () => void,
  reject: (error: unknown) => void,
): void {
  output.on('close', resolve);
  output.on('error', reject);
  archive.on('error', reject);
  archive.on('warning', (error: ArchiverError) => reject(error));
  archive.on('progress', (progress: ZipWorkerFileProgress) => {
    const totalBytes = progress.fs?.totalBytes ?? 0;
    if (totalBytes === 0) {
      return;
    }
    const processedBytes = progress.fs?.processedBytes ?? 0;
    send({
      type: 'progress',
      progress: Math.min(90, Math.floor((processedBytes / totalBytes) * 90)),
    });
  });
}

async function addFilesInBatches(
  archive: ZipArchive,
  files: Array<{ path: string; name: string }>,
  batchSize = 25,
): Promise<void> {
  for (let index = 0; index < files.length; index += batchSize) {
    const batch = files.slice(index, index + batchSize);
    for (const file of batch) {
      archive.file(file.path, { name: file.name });
    }
    await new Promise<void>((resolve) => setImmediate(resolve));
  }
}

async function createZip({ outputPath, files }: ZipWorkerData): Promise<void> {
  const output = createWriteStream(outputPath);
  const archive = new ZipArchive({ zlib: { level: 9 } });

  await new Promise<void>((resolve, reject) => {
    configureArchiveEvents(archive, output, resolve, reject);
    void addFilesInBatches(archive, files)
      .then(() => {
        archive.pipe(output);
        return archive.finalize();
      })
      .catch(reject);
  });

  const outputStats = await stat(outputPath);
  send({ type: 'completed', size: outputStats.size });
}

if (parentPort && workerData) {
  createZip(workerData as ZipWorkerData).catch((error: unknown) => {
    const outputPath = (workerData as ZipWorkerData).outputPath;
    void unlink(outputPath).catch(() => undefined);
    send({
      type: 'failed',
      error: error instanceof Error ? error.message : 'ZIP creation failed',
    });
  });
}

export { createZip };
