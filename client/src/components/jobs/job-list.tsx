import React from 'react';
import type { ZipJob } from '@/types';
import { JOB_MESSAGES, JOB_STATUS } from '@/constants';
import { formatDate } from '@/utils';
import { Button } from '@/components/common';

export interface JobListProps {
  jobs: ZipJob[];
  onDownloadZip: (outputFileId: number) => void;
}

export const JobList: React.FC<JobListProps> = ({ jobs, onDownloadZip }) => {
  if (jobs.length === 0) {
    return (
      <div className="bg-white border border-zinc-200/80 rounded-xl p-10 text-center shadow-xs">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-50 flex items-center justify-center text-purple-500">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h4 className="text-sm font-semibold text-zinc-900">{JOB_MESSAGES.EMPTY_JOBS_TITLE}</h4>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
          {JOB_MESSAGES.EMPTY_JOBS_SUBTITLE}
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: ZipJob['status']) => {
    switch (status) {
      case JOB_STATUS.COMPLETED:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {JOB_MESSAGES.STATUS_COMPLETED}
          </span>
        );
      case JOB_STATUS.PROCESSING:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            {JOB_MESSAGES.STATUS_PROCESSING}
          </span>
        );
      case JOB_STATUS.FAILED:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            {JOB_MESSAGES.STATUS_FAILED}
          </span>
        );
      case JOB_STATUS.PENDING:
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {JOB_MESSAGES.STATUS_PENDING}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {jobs.map((job) => (
        <div
          key={job.jobId}
          className="bg-white border border-zinc-200/80 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
        >
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-sm text-zinc-900">Job #{job.jobId}</span>
              <span className="text-xs font-mono text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded">
                {job.type}
              </span>
              {getStatusBadge(job.status)}
            </div>

            <span className="text-xs text-zinc-400">
              {JOB_MESSAGES.CREATED_LABEL}: {formatDate(job.createdAt)}
            </span>

            {job.status === JOB_STATUS.PROCESSING && (
              <div className="w-full sm:w-64 bg-zinc-100 rounded-full h-1.5 overflow-hidden mt-1">
                <div
                  className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${job.progress}%` }}
                />
              </div>
            )}

            {job.error && (
              <span className="text-xs text-red-600 bg-red-50 py-1 px-2 rounded border border-red-100 mt-1">
                {job.error}
              </span>
            )}
          </div>

          <div className="shrink-0 flex items-center gap-2">
            {job.status === JOB_STATUS.COMPLETED && job.outputFileId && (
              <Button
                variant="primary"
                onClick={() => onDownloadZip(job.outputFileId!)}
                className="text-xs py-1.5 px-3 gap-1.5 bg-purple-600 hover:bg-purple-700 focus:ring-purple-500"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                {JOB_MESSAGES.DOWNLOAD_ZIP_ACTION}
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
