import type { Request, Response } from 'express';
import { createZipJob, getZipJob } from '#/services';

function getProjectId(req: Request): number {
  return Number(req.params.projectId);
}

function getJobId(req: Request): number {
  return Number(req.params.jobId);
}

async function createZipJobController(req: Request, res: Response): Promise<void> {
  const job = await createZipJob(getProjectId(req), req.body);
  res.status(202).json(job);
}

async function getJobController(req: Request, res: Response): Promise<void> {
  const job = await getZipJob(getProjectId(req), getJobId(req));
  res.status(200).json(job);
}

export { createZipJobController, getJobController };
