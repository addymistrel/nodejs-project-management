import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FileUploadCard } from './file-upload-card';
import { FILE_MESSAGES } from '@/constants';

describe('FileUploadCard (TDD)', () => {
  it('should render file input and upload button', () => {
    render(<FileUploadCard onUpload={vi.fn()} isUploading={false} />);

    expect(screen.getByText(FILE_MESSAGES.DROP_TITLE)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: FILE_MESSAGES.UPLOAD_BUTTON })).toBeInTheDocument();
  });

  it('should list selected files and trigger onUpload with valid files', async () => {
    const onUpload = vi.fn().mockResolvedValueOnce(undefined);
    render(<FileUploadCard onUpload={onUpload} isUploading={false} />);

    const fileInput = screen.getByLabelText(/file-upload-input/i);
    const mockFile1 = new File(['content1'], 'test1.txt', { type: 'text/plain' });
    const mockFile2 = new File(['content2'], 'test2.txt', { type: 'text/plain' });

    fireEvent.change(fileInput, {
      target: { files: [mockFile1, mockFile2] },
    });

    expect(screen.getByText('test1.txt')).toBeInTheDocument();
    expect(screen.getByText('test2.txt')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: FILE_MESSAGES.UPLOAD_BUTTON }));

    await waitFor(() => {
      expect(onUpload).toHaveBeenCalledWith([mockFile1, mockFile2]);
    });
  });

  it('should show error if more than 5 files are selected', () => {
    render(<FileUploadCard onUpload={vi.fn()} isUploading={false} />);

    const fileInput = screen.getByLabelText(/file-upload-input/i);
    const mockFiles = Array.from(
      { length: 6 },
      (_, i) => new File([`content${i}`], `file${i}.txt`, { type: 'text/plain' }),
    );

    fireEvent.change(fileInput, {
      target: { files: mockFiles },
    });

    expect(screen.getByText(FILE_MESSAGES.ERROR_MAX_FILES)).toBeInTheDocument();
  });
});
