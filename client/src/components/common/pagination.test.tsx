import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from './pagination';

describe('Pagination Component (TDD)', () => {
  it('should render pagination info correctly', () => {
    const { container } = render(
      <Pagination currentPage={1} totalItems={25} itemsPerPage={10} onPageChange={vi.fn()} />,
    );

    expect(container.textContent).toContain('Showing 1 to 10 of 25 results');
    expect(container.textContent).toContain('Page 1 of 3');
  });

  it('should disable previous button on first page and enable next button', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination currentPage={1} totalItems={25} itemsPerPage={10} onPageChange={onPageChange} />,
    );

    const prevButton = screen.getByRole('button', { name: /previous/i });
    const nextButton = screen.getByRole('button', { name: /next/i });

    expect(prevButton).toBeDisabled();
    expect(nextButton).not.toBeDisabled();

    fireEvent.click(nextButton);
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('should disable next button on last page', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination currentPage={3} totalItems={25} itemsPerPage={10} onPageChange={onPageChange} />,
    );

    const prevButton = screen.getByRole('button', { name: /previous/i });
    const nextButton = screen.getByRole('button', { name: /next/i });

    expect(prevButton).not.toBeDisabled();
    expect(nextButton).toBeDisabled();

    fireEvent.click(prevButton);
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('should not render anything when totalItems is 0', () => {
    const { container } = render(
      <Pagination currentPage={1} totalItems={0} itemsPerPage={10} onPageChange={vi.fn()} />,
    );

    expect(container.firstChild).toBeNull();
  });
});
