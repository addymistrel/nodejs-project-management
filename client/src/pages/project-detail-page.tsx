import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { projectService } from '@/services';
import type { CreateProjectInput, ProjectDetails } from '@/types';
import { APP_ROUTES, PROJECT_MESSAGES } from '@/constants';
import { Header, Button, Card } from '@/components/common';
import { ProjectFormModal, DeleteConfirmModal } from '@/components/projects';

export const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchProjectDetails = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await projectService.getProject(projectId);
      setProject(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load project details');
      }
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);

  const handleUpdate = async (data: CreateProjectInput) => {
    if (!projectId) return;
    await projectService.updateProject(projectId, data);
    await fetchProjectDetails();
  };

  const handleDelete = async () => {
    if (!projectId) return;
    await projectService.deleteProject(projectId);
    navigate(APP_ROUTES.DASHBOARD);
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {PROJECT_MESSAGES.BACK_TO_PROJECTS}
          </Link>
        </div>

        {/* State rendering */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
            <svg className="animate-spin h-8 w-8 text-indigo-600 mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <p className="text-sm font-medium">{PROJECT_MESSAGES.LOADING_PROJECT}</p>
          </div>
        ) : error || !project ? (
          <Card className="text-center py-12">
            <h3 className="text-lg font-semibold text-zinc-900">{PROJECT_MESSAGES.NOT_FOUND_TITLE}</h3>
            <p className="text-sm text-zinc-500 mt-1 mb-6">
              {error || PROJECT_MESSAGES.NOT_FOUND_SUBTITLE}
            </p>
            <Button onClick={() => navigate(APP_ROUTES.DASHBOARD)}>
              {PROJECT_MESSAGES.BACK_TO_PROJECTS}
            </Button>
          </Card>
        ) : (
          <div className="flex flex-col gap-6">
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
                  <span>
                    Created: {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                  <span>
                    Last Updated: {new Date(project.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-start shrink-0">
                <Button
                  variant="secondary"
                  onClick={() => setIsEditModalOpen(true)}
                  className="gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </Button>
                <Button
                  variant="danger"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="gap-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">
                    {PROJECT_MESSAGES.FILES_COUNT_LABEL}
                  </span>
                  <span className="text-2xl font-bold text-zinc-900">{project.filesCount}</span>
                </div>
              </Card>

              <Card className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <div>
                  <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">
                    {PROJECT_MESSAGES.JOBS_COUNT_LABEL}
                  </span>
                  <span className="text-2xl font-bold text-zinc-900">{project.jobsCount}</span>
                </div>
              </Card>
            </div>

            {/* Placeholder for Step 3 (Files & Jobs) */}
            <Card className="border-dashed border-2 border-zinc-200 bg-zinc-50/50">
              <div className="py-8 text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-zinc-200/60 flex items-center justify-center text-zinc-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <h4 className="text-sm font-semibold text-zinc-800">Files & Zip Jobs Workspace</h4>
                <p className="text-xs text-zinc-500 max-w-md mx-auto mt-1">
                  Upload files, download individual documents, and trigger background zip archive jobs here (wired in Step 3 on branch feat/client-files-and-jobs).
                </p>
              </div>
            </Card>
          </div>
        )}
      </main>

      {/* Edit Modal */}
      {project && (
        <ProjectFormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleUpdate}
          project={project}
        />
      )}

      {/* Delete Modal */}
      {project && (
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
          project={project}
        />
      )}
    </div>
  );
};
