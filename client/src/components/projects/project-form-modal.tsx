import React, { useState, useEffect, type FormEvent } from 'react';
import type { CreateProjectInput, Project } from '@/types';
import { PROJECT_MESSAGES } from '@/constants';
import { Button, Input, Modal } from '@/components/common';

export interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProjectInput) => Promise<void>;
  project?: Project | null;
}

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  project,
}) => {
  const isEditing = Boolean(project);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description ?? '');
    } else {
      setName('');
      setDescription('');
    }
    setError(null);
  }, [project, isOpen]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to save project');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? PROJECT_MESSAGES.EDIT_TITLE : PROJECT_MESSAGES.CREATE_TITLE}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        <Input
          label={PROJECT_MESSAGES.NAME_LABEL}
          placeholder={PROJECT_MESSAGES.NAME_PLACEHOLDER}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="flex flex-col gap-1.5 w-full">
          <label htmlFor="project-description" className="text-sm font-medium text-zinc-700">
            {PROJECT_MESSAGES.DESCRIPTION_LABEL}
          </label>
          <textarea
            id="project-description"
            rows={3}
            placeholder={PROJECT_MESSAGES.DESCRIPTION_PLACEHOLDER}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-white border border-zinc-300 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-100 text-zinc-900 resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            {PROJECT_MESSAGES.CANCEL_BUTTON}
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEditing ? PROJECT_MESSAGES.SUBMIT_UPDATE : PROJECT_MESSAGES.SUBMIT_CREATE}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
