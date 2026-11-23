import React, { useState, useRef, type ChangeEvent } from 'react';
import { FILE_CONSTANTS, FILE_MESSAGES } from '@/constants';
import { formatBytes } from '@/utils';
import { Button, Card } from '@/components/common';

export interface FileUploadCardProps {
  onUpload: (files: File[]) => Promise<void>;
  isUploading: boolean;
}

export const FileUploadCard: React.FC<FileUploadCardProps> = ({ onUpload, isUploading }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    if (files.length > FILE_CONSTANTS.MAX_FILES_PER_UPLOAD) {
      setError(FILE_MESSAGES.ERROR_MAX_FILES);
      return;
    }

    setSelectedFiles(files);
  };

  const handleUploadClick = async () => {
    if (selectedFiles.length === 0) {
      setError(FILE_MESSAGES.ERROR_REQUIRED);
      return;
    }

    try {
      await onUpload(selectedFiles);
      setSelectedFiles([]);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Upload failed');
      }
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-zinc-900">{FILE_MESSAGES.SECTION_TITLE}</h3>
          <p className="text-xs text-zinc-500 mt-0.5">{FILE_MESSAGES.DROP_SUBTITLE}</p>
        </div>
      </div>

      {error && (
        <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-zinc-200 hover:border-indigo-400 bg-zinc-50/50 hover:bg-zinc-50 rounded-xl p-6 text-center cursor-pointer transition-colors"
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
          aria-label="file-upload-input"
        />
        <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>
        <span className="text-sm font-medium text-zinc-800 block">{FILE_MESSAGES.DROP_TITLE}</span>
        <span className="text-xs text-zinc-400 block mt-1">Select up to 5 files</span>
      </div>

      {selectedFiles.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Selected Files ({selectedFiles.length}/{FILE_CONSTANTS.MAX_FILES_PER_UPLOAD})
          </span>
          <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-lg overflow-hidden bg-white">
            {selectedFiles.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between px-3 py-2 text-xs">
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="font-medium text-zinc-800 truncate">{file.name}</span>
                  <span className="text-zinc-400 shrink-0">({formatBytes(file.size)})</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                  aria-label={`Remove ${file.name}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end pt-2">
        <Button
          onClick={handleUploadClick}
          isLoading={isUploading}
          disabled={selectedFiles.length === 0}
          className="text-xs py-2 px-4"
        >
          {isUploading ? FILE_MESSAGES.UPLOADING_BUTTON : FILE_MESSAGES.UPLOAD_BUTTON}
        </Button>
      </div>
    </Card>
  );
};
