import React, { useState } from 'react';
import type { Project } from '@/types';
import { PROJECT_MESSAGES } from '@/constants';
import { Button, Modal } from '@/components/common';

export interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  project: Project | null;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  project,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to delete project');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={PROJECT_MESSAGES.DELETE_CONFIRM_TITLE}>
      <div className="flex flex-col gap-4">
        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        <p className="text-sm text-zinc-600">{PROJECT_MESSAGES.DELETE_CONFIRM_DESC}</p>

        {project && (
          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
            <span className="text-xs text-zinc-400 block mb-0.5">Project</span>
            <span className="text-sm font-semibold text-zinc-900">{project.name}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isDeleting}>
            {PROJECT_MESSAGES.CANCEL_BUTTON}
          </Button>
          <Button type="button" variant="danger" onClick={handleConfirm} isLoading={isDeleting}>
            {PROJECT_MESSAGES.DELETE_CONFIRM_ACTION}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
