import { JOB_STATUSES, JOB_TYPES } from '#/constants';
import { JobModel } from '#/database';
import { Op } from 'sequelize';

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
  markJobProcessing,
  updateJobProgress,
};
