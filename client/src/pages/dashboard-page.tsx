import React, { useState, useEffect, useCallback } from 'react';
import { projectService } from '@/services';
import type { CreateProjectInput, Project } from '@/types';
import { PROJECT_MESSAGES, PROJECT_PAGINATION_DEFAULTS } from '@/constants';
import { Header, Button, Pagination } from '@/components/common';
import { ProjectCard, ProjectFormModal, DeleteConfirmModal } from '@/components/projects';

export const DashboardPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState<number>(PROJECT_PAGINATION_DEFAULTS.PAGE);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedProjectForEdit, setSelectedProjectForEdit] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const fetchProjects = useCallback(async (pageNumber: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await projectService.listProjects({
        pageNumber,
        limit: PROJECT_PAGINATION_DEFAULTS.LIMIT,
      });
      setProjects(data.items);
      setTotal(data.total);
      setPage(data.pageNumber);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load projects');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects(page);
  }, [fetchProjects, page]);

  const handleOpenCreateModal = () => {
    setSelectedProjectForEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (project: Project) => {
    setSelectedProjectForEdit(project);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (data: CreateProjectInput) => {
    if (selectedProjectForEdit) {
      await projectService.updateProject(selectedProjectForEdit.id, data);
      setSuccessMessage(PROJECT_MESSAGES.SUCCESS_UPDATED);
    } else {
      await projectService.createProject(data);
      setSuccessMessage(PROJECT_MESSAGES.SUCCESS_CREATED);
    }
    await fetchProjects(page);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    await projectService.deleteProject(projectToDelete.id);
    setSuccessMessage(PROJECT_MESSAGES.SUCCESS_DELETED);
    // If last item on page and page > 1, go to previous page
    const newTotal = total - 1;
    const maxPage = Math.ceil(newTotal / PROJECT_PAGINATION_DEFAULTS.LIMIT) || 1;
    const targetPage = page > maxPage ? maxPage : page;
    await fetchProjects(targetPage);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
              {PROJECT_MESSAGES.LIST_TITLE}
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              {PROJECT_MESSAGES.LIST_SUBTITLE}
            </p>
          </div>

          <Button
            onClick={handleOpenCreateModal}
            className="self-start sm:self-auto gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            {PROJECT_MESSAGES.CREATE_BUTTON}
          </Button>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="mb-6 p-4 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
            <span>{successMessage}</span>
            <button
              onClick={() => setSuccessMessage(null)}
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

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
            <svg className="animate-spin h-8 w-8 text-indigo-600 mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <p className="text-sm font-medium">{PROJECT_MESSAGES.LOADING_PROJECTS}</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white border border-zinc-200/80 rounded-xl p-12 text-center shadow-xs">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-zinc-900">{PROJECT_MESSAGES.EMPTY_TITLE}</h3>
            <p className="text-sm text-zinc-500 max-w-sm mx-auto mt-1 mb-6">
              {PROJECT_MESSAGES.EMPTY_SUBTITLE}
            </p>
            <Button onClick={handleOpenCreateModal}>
              {PROJECT_MESSAGES.CREATE_BUTTON}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={handleOpenEditModal}
                  onDelete={(p) => setProjectToDelete(p)}
                />
              ))}
            </div>

            <Pagination
              currentPage={page}
              totalItems={total}
              itemsPerPage={PROJECT_PAGINATION_DEFAULTS.LIMIT}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </div>
        )}
      </main>

      {/* Create / Edit Modal */}
      <ProjectFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        project={selectedProjectForEdit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(projectToDelete)}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleDeleteConfirm}
        project={projectToDelete}
      />
    </div>
  );
};
