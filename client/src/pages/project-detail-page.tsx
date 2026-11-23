import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { projectService, fileService, jobService } from '@/services';
import type { CreateProjectInput, ProjectDetails, ProjectFile, ZipJob } from '@/types';
import {
  APP_ROUTES,
  FILE_MESSAGES,
  JOB_CONSTANTS,
  JOB_MESSAGES,
  JOB_STATUS,
  PROJECT_MESSAGES,
} from '@/constants';
import { Header, Button, Card, Modal } from '@/components/common';
import { ProjectFormModal, DeleteConfirmModal } from '@/components/projects';
import { FileUploadCard, FileTable } from '@/components/files';
import { JobList } from '@/components/jobs';

export const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  // Project state
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Files & Jobs state
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [jobs, setJobs] = useState<ZipJob[]>([]);
  const [selectedFileIds, setSelectedFileIds] = useState<number[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreatingZip, setIsCreatingZip] = useState(false);

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<ProjectFile | null>(null);

  // Polling ref
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchProjectDetails = useCallback(async () => {
    if (!projectId) return;
    try {
      const data = await projectService.getProject(projectId);
      setProject(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load project details');
      }
    }
  }, [projectId]);

  const fetchFiles = useCallback(async () => {
    if (!projectId) return;
    try {
      const data = await fileService.listFiles(projectId, { limit: 50 });
      setFiles(data.items);
    } catch (err: unknown) {
      console.error('Failed to load files:', err);
    }
  }, [projectId]);

  const fetchJobs = useCallback(async () => {
    if (!projectId) return;
    try {
      const data = await jobService.listJobs(projectId, { limit: 20 });
      setJobs(data.items);
    } catch (err: unknown) {
      console.error('Failed to load jobs:', err);
    }
  }, [projectId]);

  // Initial load
  useEffect(() => {
    let mounted = true;
    const loadAll = async () => {
      setIsLoading(true);
      setError(null);
      await Promise.all([fetchProjectDetails(), fetchFiles(), fetchJobs()]);
      if (mounted) setIsLoading(false);
    };

    loadAll();

    return () => {
      mounted = false;
    };
  }, [fetchProjectDetails, fetchFiles, fetchJobs]);

  // Job Polling logic for in-progress jobs
  useEffect(() => {
    const hasActiveJobs = jobs.some(
      (j) => j.status === JOB_STATUS.PENDING || j.status === JOB_STATUS.PROCESSING,
    );

    if (hasActiveJobs) {
      pollTimerRef.current = setTimeout(() => {
        fetchJobs();
        fetchFiles(); // In case a job completed and generated an output file
      }, JOB_CONSTANTS.POLL_INTERVAL_MS);
    }

    return () => {
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
      }
    };
  }, [jobs, fetchJobs, fetchFiles]);

  const handleUpdateProject = async (data: CreateProjectInput) => {
    if (!projectId) return;
    await projectService.updateProject(projectId, data);
    await fetchProjectDetails();
    setNotification(PROJECT_MESSAGES.SUCCESS_UPDATED);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleDeleteProject = async () => {
    if (!projectId) return;
    await projectService.deleteProject(projectId);
    navigate(APP_ROUTES.DASHBOARD);
  };

  const handleUploadFiles = async (uploadedFiles: File[]) => {
    if (!projectId) return;
    setIsUploading(true);
    try {
      await fileService.uploadFiles(projectId, uploadedFiles);
      await Promise.all([fetchFiles(), fetchProjectDetails()]);
      setNotification(FILE_MESSAGES.SUCCESS_UPLOADED);
      setTimeout(() => setNotification(null), 4000);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadFile = async (file: ProjectFile) => {
    if (!projectId) return;
    try {
      const blob = await fileService.downloadFile(projectId, file.fileId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Download failed');
    }
  };

  const handleDeleteFileConfirm = async () => {
    if (!projectId || !fileToDelete) return;
    try {
      await fileService.deleteFile(projectId, fileToDelete.fileId);
      setSelectedFileIds((prev) => prev.filter((id) => id !== fileToDelete.fileId));
      setFileToDelete(null);
      await Promise.all([fetchFiles(), fetchProjectDetails()]);
      setNotification(FILE_MESSAGES.SUCCESS_DELETED);
      setTimeout(() => setNotification(null), 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Delete file failed');
    }
  };

  const handleCreateZip = async () => {
    if (!projectId || selectedFileIds.length === 0) return;
    setIsCreatingZip(true);
    try {
      await jobService.createZipJob(projectId, { fileIds: selectedFileIds });
      setSelectedFileIds([]);
      await Promise.all([fetchJobs(), fetchProjectDetails()]);
      setNotification(JOB_MESSAGES.SUCCESS_CREATED);
      setTimeout(() => setNotification(null), 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Zip job creation failed');
    } finally {
      setIsCreatingZip(false);
    }
  };

  const handleDownloadZipJob = async (outputFileId: number) => {
    if (!projectId) return;
    try {
      const blob = await fileService.downloadFile(projectId, outputFileId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `project-${projectId}-archive.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Download ZIP failed');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to={APP_ROUTES.DASHBOARD}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            {PROJECT_MESSAGES.BACK_TO_PROJECTS}
          </Link>
        </div>

        {/* Notifications */}
        {notification && (
          <div className="mb-6 p-4 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
            <span>{notification}</span>
            <button
              onClick={() => setNotification(null)}
              className="text-emerald-600 hover:text-emerald-800 p-1 cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        {/* Loading / Error States */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
            <svg
              className="animate-spin h-8 w-8 text-indigo-600 mb-3"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <p className="text-sm font-medium">{PROJECT_MESSAGES.LOADING_PROJECT}</p>
          </div>
        ) : !project ? (
          <Card className="text-center py-12">
            <h3 className="text-lg font-semibold text-zinc-900">
              {PROJECT_MESSAGES.NOT_FOUND_TITLE}
            </h3>
            <p className="text-sm text-zinc-500 mt-1 mb-6">{PROJECT_MESSAGES.NOT_FOUND_SUBTITLE}</p>
            <Button onClick={() => navigate(APP_ROUTES.DASHBOARD)}>
              {PROJECT_MESSAGES.BACK_TO_PROJECTS}
            </Button>
          </Card>
        ) : (
          <div className="flex flex-col gap-8">
            {/* Project Header Card */}
            <Card className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-zinc-900">{project.name}</h1>
                  <span className="text-xs font-mono bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-md border border-zinc-200">
                    ID: #{project.id}
                  </span>
                </div>
                <p className="text-zinc-600 text-sm leading-relaxed mb-4">
                  {project.description || (
                    <span className="italic text-zinc-400">No description provided</span>
                  )}
                </p>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-zinc-400">
                  <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
                  <span>Last Updated: {new Date(project.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-start shrink-0">
                <Button
                  variant="secondary"
                  onClick={() => setIsEditModalOpen(true)}
                  className="gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit
                </Button>
                <Button
                  variant="danger"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="gap-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete
                </Button>
              </div>
            </Card>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">
                    {PROJECT_MESSAGES.FILES_COUNT_LABEL}
                  </span>
                  <span className="text-2xl font-bold text-zinc-900">{files.length}</span>
                </div>
              </Card>

              <Card className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                    />
                  </svg>
                </div>
                <div>
                  <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">
                    {PROJECT_MESSAGES.JOBS_COUNT_LABEL}
                  </span>
                  <span className="text-2xl font-bold text-zinc-900">{jobs.length}</span>
                </div>
              </Card>
            </div>

            {/* Section 1: File Management */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-zinc-900">{FILE_MESSAGES.SECTION_TITLE}</h2>
                  <p className="text-xs text-zinc-500">{FILE_MESSAGES.SECTION_SUBTITLE}</p>
                </div>

                {selectedFileIds.length > 0 && (
                  <Button
                    variant="primary"
                    onClick={handleCreateZip}
                    isLoading={isCreatingZip}
                    className="gap-2 bg-purple-600 hover:bg-purple-700 focus:ring-purple-500"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                      />
                    </svg>
                    {isCreatingZip
                      ? JOB_MESSAGES.CREATING_BUTTON
                      : `${JOB_MESSAGES.CREATE_ZIP_BUTTON} (${selectedFileIds.length})`}
                  </Button>
                )}
              </div>

              {/* Upload Card */}
              <FileUploadCard onUpload={handleUploadFiles} isUploading={isUploading} />

              {/* File Table */}
              <FileTable
                files={files}
                selectedFileIds={selectedFileIds}
                onSelectionChange={setSelectedFileIds}
                onDownload={handleDownloadFile}
                onDelete={(f) => setFileToDelete(f)}
              />
            </div>

            {/* Section 2: Background Zip Jobs */}
            <div className="flex flex-col gap-4 pt-4 border-t border-zinc-200">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">{JOB_MESSAGES.SECTION_TITLE}</h2>
                <p className="text-xs text-zinc-500">{JOB_MESSAGES.SECTION_SUBTITLE}</p>
              </div>

              <JobList jobs={jobs} onDownloadZip={handleDownloadZipJob} />
            </div>
          </div>
        )}
      </main>

      {/* Edit Project Modal */}
      {project && (
        <ProjectFormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleUpdateProject}
          project={project}
        />
      )}

      {/* Delete Project Modal */}
      {project && (
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteProject}
          project={project}
        />
      )}

      {/* Delete File Modal */}
      <Modal
        isOpen={Boolean(fileToDelete)}
        onClose={() => setFileToDelete(null)}
        title={FILE_MESSAGES.DELETE_CONFIRM_TITLE}
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-zinc-600">{FILE_MESSAGES.DELETE_CONFIRM_DESC}</p>
          {fileToDelete && (
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
              <span className="text-xs text-zinc-400 block mb-0.5">File to delete</span>
              <span className="text-sm font-semibold text-zinc-900">{fileToDelete.name}</span>
            </div>
          )}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100">
            <Button type="button" variant="secondary" onClick={() => setFileToDelete(null)}>
              {PROJECT_MESSAGES.CANCEL_BUTTON}
            </Button>
            <Button type="button" variant="danger" onClick={handleDeleteFileConfirm}>
              {FILE_MESSAGES.DELETE_CONFIRM_ACTION}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
