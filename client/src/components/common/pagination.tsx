import React from 'react';
import { Button } from './button';

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  if (totalItems === 0) {
    return null;
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2">
      <div className="text-sm text-zinc-600">
        Showing <span className="font-medium text-zinc-900">{startItem}</span> to{' '}
        <span className="font-medium text-zinc-900">{endItem}</span> of{' '}
        <span className="font-medium text-zinc-900">{totalItems}</span> results
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="text-xs px-3 py-1.5"
          aria-label="Previous"
        >
          Previous
        </Button>
        <div className="text-xs font-medium text-zinc-600 px-2">
          Page {currentPage} of {totalPages}
        </div>
        <Button
          variant="secondary"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="text-xs px-3 py-1.5"
          aria-label="Next"
        >
          Next
        </Button>
      </div>
    </div>
  );
};
