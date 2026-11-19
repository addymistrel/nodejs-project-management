import { JOB_STATUSES, JOB_TYPES } from '#/constants';
import { databaseClient, FileModel, JobModel } from '#/database';
import { Op } from 'sequelize';
import type { Transaction } from 'sequelize';

async function createZipJobRecord(projectId: number): Promise<JobModel> {
  return JobModel.create({
    projectId,
    type: JOB_TYPES.ZIP_COMPRESSION,
    status: JOB_STATUSES.PENDING,
    progress: 0,
    outputFileId: null,
    errorMessage: null,
    startedAt: null,
    completedAt: null,
  });
}

async function findJobByProjectAndId(projectId: number, jobId: number): Promise<JobModel | null> {
  return JobModel.findOne({ where: { id: jobId, projectId } });
}

async function findJobsByProjectId(
  projectId: number,
  limit: number,
  offset: number,
): Promise<{ rows: JobModel[]; count: number }> {
  const result = await JobModel.findAndCountAll({
    where: { projectId },
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });
  return { rows: result.rows, count: result.count };
}

async function markJobProcessing(jobId: number): Promise<void> {
  await JobModel.update(
    { status: JOB_STATUSES.PROCESSING, startedAt: new Date(), progress: 0 },
    { where: { id: jobId, status: JOB_STATUSES.PENDING } },
  );
}

async function updateJobProgress(jobId: number, progress: number): Promise<void> {
  await JobModel.update({ progress }, { where: { id: jobId, status: JOB_STATUSES.PROCESSING } });
}

async function completeJob(jobId: number, outputFileId: number): Promise<void> {
  await JobModel.update(
    {
      status: JOB_STATUSES.COMPLETED,
      progress: 100,
      outputFileId,
      completedAt: new Date(),
      errorMessage: null,
    },
    { where: { id: jobId, status: JOB_STATUSES.PROCESSING } },
  );
}

async function saveCompletedZipJob(
  jobId: number,
  projectId: number,
  storagePath: string,
  size: number,
): Promise<FileModel> {
  return databaseClient.transaction(async (transaction) => {
    const outputFile = await createOutputFileRecord(
      projectId,
      jobId,
      storagePath,
      size,
      transaction,
    );
    await markJobCompleted(jobId, outputFile.id, transaction);
    return outputFile;
  });
}

async function createOutputFileRecord(
  projectId: number,
  jobId: number,
  storagePath: string,
  size: number,
  transaction: Transaction,
): Promise<FileModel> {
  return FileModel.create(
    {
      projectId,
      name: `project-${projectId}-job-${jobId}.zip`,
      storagePath,
      size,
      mimeType: 'application/zip',
      checksum: null,
      isOutput: true,
    },
    { transaction },
  );
}

async function markJobCompleted(
  jobId: number,
  outputFileId: number,
  transaction: Transaction,
): Promise<void> {
  await JobModel.update(
    {
      status: JOB_STATUSES.COMPLETED,
      progress: 100,
      outputFileId,
      completedAt: new Date(),
      errorMessage: null,
    },
    { where: { id: jobId, status: JOB_STATUSES.PROCESSING }, transaction },
  );
}

async function failJob(jobId: number, errorMessage: string): Promise<void> {
  await JobModel.update(
    {
      status: JOB_STATUSES.FAILED,
      errorMessage,
      completedAt: new Date(),
    },
    {
      where: {
        id: jobId,
        status: { [Op.in]: [JOB_STATUSES.PENDING, JOB_STATUSES.PROCESSING] },
      },
    },
  );
}

export {
  completeJob,
  createZipJobRecord,
  failJob,
  findJobByProjectAndId,
  findJobsByProjectId,
  markJobProcessing,
  saveCompletedZipJob,
  updateJobProgress,
};
