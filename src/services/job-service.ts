import * as repositoryFunctions from '#/repositories';
import type { JobAttributes } from '#/database';
import type { CreateZipJobRequest, JobResponse } from '#/types';
import {
  FileDoesNotBelongToProjectException,
  JobNotFoundException,
  ProjectNotFoundException,
  ensureProjectJobsDirectory,
  getProjectJobsDir,
  logger,
  resolveStoragePath,
} from '#/utils';
import { Worker } from 'worker_threads';
import path from 'path';
import { BaseService } from '#/services/base-service.js';

interface JobRepository {
  createOutputFile: typeof repositoryFunctions.createFileRecords;
  createZipJob: typeof repositoryFunctions.createZipJobRecord;
  complete: typeof repositoryFunctions.completeJob;
  fail: typeof repositoryFunctions.failJob;
  findFilesByProjectAndId: typeof repositoryFunctions.findFilesByProjectAndId;
  findJobByProjectAndId: typeof repositoryFunctions.findJobByProjectAndId;
  findProjectById: typeof repositoryFunctions.findProjectById;
  markProcessing: typeof repositoryFunctions.markJobProcessing;
  updateProgress: typeof repositoryFunctions.updateJobProgress;
}

const defaultJobRepository: JobRepository = {
  createOutputFile: (...args) => repositoryFunctions.createFileRecords(...args),
  createZipJob: (...args) => repositoryFunctions.createZipJobRecord(...args),
  complete: (...args) => repositoryFunctions.completeJob(...args),
  fail: (...args) => repositoryFunctions.failJob(...args),
  findFilesByProjectAndId: (...args) => repositoryFunctions.findFilesByProjectAndId(...args),
  findJobByProjectAndId: (...args) => repositoryFunctions.findJobByProjectAndId(...args),
  findProjectById: (...args) => repositoryFunctions.findProjectById(...args),
  markProcessing: (...args) => repositoryFunctions.markJobProcessing(...args),
  updateProgress: (...args) => repositoryFunctions.updateJobProgress(...args),
};

class JobService extends BaseService<JobRepository> {
  constructor(repository: JobRepository) {
    super(repository);
  }

  async getZipJob(projectId: number, jobId: number): Promise<JobResponse> {
    await this.assertProject(projectId);
    const job = await this.repository.findJobByProjectAndId(projectId, jobId);

    if (!job) {
      throw new JobNotFoundException();
    }

    logger.info('ZIP job status retrieved', {
      functionName: 'JobService.getZipJob',
      event: 'job.get.completed',
      projectId,
      jobId,
    });

    return toJobResponse(job);
  }

  async createZipJob(projectId: number, request: CreateZipJobRequest): Promise<JobResponse> {
    await this.assertProject(projectId);
    const sourceFiles = await this.getSourceFiles(projectId, request.fileIds);
    const job = await this.repository.createZipJob(projectId);
    await this.repository.markProcessing(job.id);
    await this.runZipWorker(job.id, projectId, sourceFiles);
    await job.reload();
    this.logJobStarted(projectId, job.id, sourceFiles.length);
    return toJobResponse(job);
  }

  private async runZipWorker(
    jobId: number,
    projectId: number,
    files: Array<{ path: string; name: string }>,
  ): Promise<void> {
    await ensureProjectJobsDirectory(projectId);
    const outputPath = this.getOutputPath(projectId, jobId);
    const worker = new Worker(new URL('../workers/zip-worker.js', import.meta.url), {
      workerData: { outputPath, files },
    });

    worker.on('message', (message: WorkerMessage) =>
      this.handleWorkerMessageSafely(message, jobId, projectId, outputPath),
    );
    worker.on('error', (error: Error) => this.handleWorkerError(error, projectId, jobId));
  }

  private async handleWorkerMessage(
    message: WorkerMessage,
    jobId: number,
    projectId: number,
    outputPath: string,
  ): Promise<void> {
    if (message.type === 'progress' && message.progress !== undefined) {
      await this.repository.updateProgress(jobId, message.progress);
      return;
    }

    if (message.type === 'completed' && message.size !== undefined) {
      await this.finishZipJob(jobId, projectId, outputPath, message.size);
      return;
    }

    if (message.type === 'failed') {
      logger.error('ZIP job failed', new Error(message.error ?? 'ZIP creation failed'), {
        functionName: 'JobService.handleWorkerMessage',
        event: 'job.zip.failed',
        projectId,
        jobId,
      });
      await this.repository.fail(jobId, message.error ?? 'ZIP creation failed');
    }
  }

  private async finishZipJob(
    jobId: number,
    projectId: number,
    outputPath: string,
    size: number,
  ): Promise<void> {
    try {
      const [outputFile] = await this.repository.createOutputFile(projectId, [
        {
          name: `project-${projectId}-job-${jobId}.zip`,
          storagePath: path.relative(process.cwd(), outputPath),
          size,
          mimeType: 'application/zip',
          isOutput: true,
        },
      ]);
      await this.repository.complete(jobId, outputFile.id);
      this.logJobCompleted(projectId, jobId, outputFile.id);
    } catch (error: unknown) {
      this.logOutputFailure(projectId, jobId, error);
      await this.repository.fail(
        jobId,
        error instanceof Error ? error.message : 'Unable to save ZIP output',
      );
    }
  }

  private async assertProject(projectId: number): Promise<void> {
    if (!(await this.repository.findProjectById(projectId))) {
      throw new ProjectNotFoundException();
    }
  }

  private async getSourceFiles(
    projectId: number,
    fileIds: number[],
  ): Promise<Array<{ path: string; name: string }>> {
    const files = await Promise.all(
      fileIds.map((fileId) => this.repository.findFilesByProjectAndId(projectId, fileId)),
    );

    if (files.some((file) => !file)) {
      throw new FileDoesNotBelongToProjectException();
    }

    return files.map((file) => {
      if (!file) {
        throw new FileDoesNotBelongToProjectException();
      }

      return { path: resolveStoragePath(file.storagePath), name: file.name };
    });
  }

  private async handleWorkerMessageSafely(
    message: WorkerMessage,
    jobId: number,
    projectId: number,
    outputPath: string,
  ): Promise<void> {
    try {
      await this.handleWorkerMessage(message, jobId, projectId, outputPath);
    } catch (error: unknown) {
      logger.error('ZIP worker state update failed', error, {
        functionName: 'JobService.runZipWorker',
        event: 'job.worker.update.failed',
        projectId,
        jobId,
      });
      await this.repository.fail(
        jobId,
        error instanceof Error ? error.message : 'Unable to update job state',
      );
    }
  }

  private handleWorkerError(error: Error, projectId: number, jobId: number): void {
    logger.error('ZIP worker failed', error, {
      functionName: 'JobService.runZipWorker',
      event: 'job.worker.failed',
      projectId,
      jobId,
    });
    void this.repository.fail(jobId, error.message);
  }

  private logJobStarted(projectId: number, jobId: number, fileCount: number): void {
    logger.info('ZIP job started', {
      functionName: 'JobService.createZipJob',
      event: 'job.zip.started',
      projectId,
      jobId,
      fileCount,
    });
  }

  private logJobCompleted(projectId: number, jobId: number, outputFileId: number): void {
    logger.info('ZIP job completed', {
      functionName: 'JobService.finishZipJob',
      event: 'job.zip.completed',
      projectId,
      jobId,
      outputFileId,
    });
  }

  private logOutputFailure(projectId: number, jobId: number, error: unknown): void {
    logger.error('ZIP output could not be saved', error, {
      functionName: 'JobService.finishZipJob',
      event: 'job.zip.output.failed',
      projectId,
      jobId,
    });
  }

  private getOutputPath(projectId: number, jobId: number): string {
    return path.join(getProjectJobsDir(projectId), `project-${projectId}-job-${jobId}.zip`);
  }
}

interface WorkerMessage {
  type: string;
  progress?: number;
  size?: number;
  error?: string;
}

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

const jobService = new JobService(defaultJobRepository);

const createZipJob = jobService.createZipJob.bind(jobService);
const getZipJob = jobService.getZipJob.bind(jobService);

export { JobService, createZipJob, getZipJob };
export type { JobRepository };
