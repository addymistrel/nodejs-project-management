import type { Request, Response } from 'express';
import { HTTP_STATUS_CODE } from '#/constants';
import { createZipJob, getZipJob } from '#/services';
import { AppResponse } from '#/utils';

function getProjectId(req: Request): number {
  return Number(req.params.projectId);
}

function getJobId(req: Request): number {
  return Number(req.params.jobId);
}

async function createZipJobController(req: Request, res: Response): Promise<void> {
  const job = await createZipJob(getProjectId(req), req.body);
  AppResponse.sendSuccess(res, HTTP_STATUS_CODE.ACCEPTED, job);
}

async function getJobController(req: Request, res: Response): Promise<void> {
  const job = await getZipJob(getProjectId(req), getJobId(req));
  AppResponse.sendSuccess(res, HTTP_STATUS_CODE.OK, job);
}

export { createZipJobController, getJobController };
