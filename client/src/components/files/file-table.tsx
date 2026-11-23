import React from 'react';
import type { ProjectFile } from '@/types';
import { FILE_MESSAGES } from '@/constants';
import { formatBytes, formatDate } from '@/utils';
import { Button } from '@/components/common';

export interface FileTableProps {
  files: ProjectFile[];
  selectedFileIds: number[];
  onSelectionChange: (selectedIds: number[]) => void;
  onDownload: (file: ProjectFile) => void;
  onDelete: (file: ProjectFile) => void;
}

export const FileTable: React.FC<FileTableProps> = ({
  files,
  selectedFileIds,
  onSelectionChange,
  onDownload,
  onDelete,
}) => {
  if (files.length === 0) {
    return (
      <div className="bg-white border border-zinc-200/80 rounded-xl p-10 text-center shadow-xs">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h4 className="text-sm font-semibold text-zinc-900">{FILE_MESSAGES.EMPTY_FILES_TITLE}</h4>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
          {FILE_MESSAGES.EMPTY_FILES_SUBTITLE}
        </p>
      </div>
    );
  }

  const allSelected = files.length > 0 && selectedFileIds.length === files.length;

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(files.map((f) => f.fileId));
    }
  };

  const handleToggleFile = (fileId: number) => {
    if (selectedFileIds.includes(fileId)) {
      onSelectionChange(selectedFileIds.filter((id) => id !== fileId));
    } else {
      onSelectionChange([...selectedFileIds, fileId]);
    }
  };

  return (
    <div className="bg-white border border-zinc-200/80 rounded-xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200 text-xs font-semibold text-zinc-600 uppercase tracking-wider">
              <th className="py-3 px-4 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleSelectAll}
                  aria-label="select-all-files"
                  className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
              </th>
              <th className="py-3 px-4">{FILE_MESSAGES.TABLE_HEADER_NAME}</th>
              <th className="py-3 px-4">{FILE_MESSAGES.TABLE_HEADER_SIZE}</th>
              <th className="py-3 px-4">{FILE_MESSAGES.TABLE_HEADER_TYPE}</th>
              <th className="py-3 px-4">{FILE_MESSAGES.TABLE_HEADER_UPLOADED}</th>
              <th className="py-3 px-4 text-right">{FILE_MESSAGES.TABLE_HEADER_ACTIONS}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-xs text-zinc-700">
            {files.map((file) => {
              const isSelected = selectedFileIds.includes(file.fileId);

              return (
                <tr
                  key={file.fileId}
                  className={`hover:bg-zinc-50/70 transition-colors ${
                    isSelected ? 'bg-indigo-50/30' : ''
                  }`}
                >
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleFile(file.fileId)}
                      aria-label={`select file ${file.fileId}`}
                      className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-zinc-900 truncate max-w-xs sm:max-w-md">
                        {file.name}
                      </span>
                      {file.isOutput && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-100 text-purple-800">
                          {FILE_MESSAGES.BADGE_OUTPUT_ZIP}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-zinc-500">{formatBytes(file.size)}</td>
                  <td className="py-3 px-4 text-zinc-500 truncate max-w-[150px]">
                    {file.type || 'unknown'}
                  </td>
                  <td className="py-3 px-4 text-zinc-400">{formatDate(file.uploadedAt)}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="secondary"
                        onClick={() => onDownload(file)}
                        className="text-xs py-1 px-2.5 h-7 gap-1"
                        aria-label={`Download ${file.name}`}
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                        {FILE_MESSAGES.DOWNLOAD_ACTION}
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => onDelete(file)}
                        className="text-xs py-1 px-2 h-7 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                        aria-label={`Delete ${file.name}`}
                      >
                        {FILE_MESSAGES.DELETE_ACTION}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
