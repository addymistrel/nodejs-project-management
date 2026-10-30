import {
  completeJob,
  createFileRecords,
  createZipJobRecord,
  failJob,
  findFilesByProjectAndId,
  findJobByProjectAndId,
  findProjectById,
  markJobProcessing,
  updateJobProgress,
} from '#/repositories';
import type { JobAttributes } from '#/database';
import type { CreateZipJobRequest, JobResponse } from '#/types';
import {
  AppError,
  ensureProjectJobsDirectory,
  getProjectJobsDir,
  resolveStoragePath,
} from '#/utils';
import { Worker } from 'worker_threads';
import path from 'path';

function toJobResponse(job: JobAttributes): JobResponse {
  return {
    jobId: job.id,
    projectId: job.projectId,
    type: job.type,
    status: job.status,
    progress: job.progress,
    ...(job.outputFileId === null ? {} : { outputFileId: job.outputFileId }),
    ...(job.errorMessage === null ? {} : { error: job.errorMessage }),
    createdAt: job.createdAt,
    ...(job.startedAt === null ? {} : { startedAt: job.startedAt }),
    ...(job.completedAt === null ? {} : { completedAt: job.completedAt }),
  };
}

async function assertProject(projectId: number): Promise<void> {
  if (!(await findProjectById(projectId))) {
    throw new AppError('Project not found', 404);
  }
}

async function getZipJob(projectId: number, jobId: number): Promise<JobResponse> {
  await assertProject(projectId);
  const job = await findJobByProjectAndId(projectId, jobId);

  if (!job) {
    throw new AppError('Job not found', 404);
  }

  return toJobResponse(job);
}

async function createZipJob(projectId: number, request: CreateZipJobRequest): Promise<JobResponse> {
  await assertProject(projectId);

  const files = await Promise.all(
    request.fileIds.map((fileId) => findFilesByProjectAndId(projectId, fileId)),
  );
  if (files.some((file) => !file)) {
    throw new AppError('File does not belong to this project', 400);
  }

  const sourceFiles = files.map((file) => {
    if (!file) {
      throw new AppError('File does not belong to this project', 400);
    }
    return {
      path: resolveStoragePath(file.storagePath),
      name: file.name,
    };
  });

  const job = await createZipJobRecord(projectId);
  await markJobProcessing(job.id);
  await runZipWorker(job.id, projectId, sourceFiles);
  await job.reload();

  return toJobResponse(job);
}

async function runZipWorker(
  jobId: number,
  projectId: number,
  files: Array<{ path: string; name: string }>,
): Promise<void> {
  await ensureProjectJobsDirectory(projectId);
  const outputPath = getOutputPath(projectId, jobId);
  const worker = new Worker(new URL('../workers/zip-worker.js', import.meta.url), {
    workerData: { outputPath, files },
  });

  worker.on('message', (message: WorkerMessage) => {
    void handleWorkerMessage(message, jobId, projectId, outputPath).catch((error: unknown) =>
      failJob(jobId, error instanceof Error ? error.message : 'Unable to update job state'),
    );
  });

  worker.on('error', (error: Error) => {
    void failJob(jobId, error.message);
  });
}

interface WorkerMessage {
  type: string;
  progress?: number;
  size?: number;
  error?: string;
}

function getOutputPath(projectId: number, jobId: number): string {
  return path.join(getProjectJobsDir(projectId), `project-${projectId}-job-${jobId}.zip`);
}

async function handleWorkerMessage(
  message: WorkerMessage,
  jobId: number,
  projectId: number,
  outputPath: string,
): Promise<void> {
  if (message.type === 'progress' && message.progress !== undefined) {
    await updateJobProgress(jobId, message.progress);
    return;
  }

  if (message.type === 'completed' && message.size !== undefined) {
    await finishZipJob(jobId, projectId, outputPath, message.size);
    return;
  }

  if (message.type === 'failed') {
    await failJob(jobId, message.error ?? 'ZIP creation failed');
  }
}

async function finishZipJob(
  jobId: number,
  projectId: number,
  outputPath: string,
  size: number,
): Promise<void> {
  try {
    const [outputFile] = await createFileRecords(projectId, [
      {
        name: `project-${projectId}-job-${jobId}.zip`,
        storagePath: path.relative(process.cwd(), outputPath),
        size,
        mimeType: 'application/zip',
        isOutput: true,
      },
    ]);
    await completeJob(jobId, outputFile.id);
  } catch (error: unknown) {
    await failJob(jobId, error instanceof Error ? error.message : 'Unable to save ZIP output');
  }
}

export { createZipJob, getZipJob };
