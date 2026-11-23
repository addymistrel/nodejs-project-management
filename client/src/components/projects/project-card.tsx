import React from 'react';
import { Link } from 'react-router-dom';
import type { Project } from '@/types';
import { getProjectDetailsPath, PROJECT_MESSAGES } from '@/constants';
import { Card, Button } from '@/components/common';

export interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onDelete }) => {
  const formattedDate = new Date(project.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Card className="flex flex-col justify-between hover:border-zinc-300 transition-all hover:shadow-sm">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link
            to={getProjectDetailsPath(project.id)}
            className="text-lg font-semibold text-zinc-900 hover:text-indigo-600 transition-colors line-clamp-1"
          >
            {project.name}
          </Link>
          <span className="text-xs font-mono text-zinc-400 shrink-0">#{project.id}</span>
        </div>

        <p className="text-sm text-zinc-600 line-clamp-2 min-h-[2.5rem] mb-4">
          {project.description || (
            <span className="italic text-zinc-400">No description provided</span>
          )}
        </p>
      </div>

      <div className="pt-4 border-t border-zinc-100 flex items-center justify-between gap-2">
        <span className="text-xs text-zinc-400">
          {PROJECT_MESSAGES.CREATED_AT_LABEL}: {formattedDate}
        </span>

        <div className="flex items-center gap-1.5">
          <Button
            variant="secondary"
            onClick={() => onEdit(project)}
            className="text-xs py-1 px-2.5 h-8"
            aria-label="Edit project"
          >
            Edit
          </Button>
          <Button
            variant="danger"
            onClick={() => onDelete(project)}
            className="text-xs py-1 px-2.5 h-8 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
            aria-label="Delete project"
          >
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
};
