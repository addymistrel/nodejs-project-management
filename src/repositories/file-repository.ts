import { FILE_SCHEMA_CONST } from '#/constants';
import { FileModel } from '#/database';

interface CreateFileRecordInput {
  name: string;
  storagePath: string;
  size: number;
  mimeType: string;
  isOutput?: boolean;
}

async function createFileRecords(
  projectId: number,
  files: CreateFileRecordInput[],
): Promise<FileModel[]> {
  return FileModel.bulkCreate(
    files.map((file) => ({
      projectId,
      name: file.name,
      storagePath: file.storagePath,
      size: file.size,
      mimeType: file.mimeType,
      checksum: null,
      isOutput: file.isOutput ?? false,
    })),
  );
}

async function findFilesByProjectId(
  projectId: number,
  limit: number,
  offset: number,
): Promise<{ rows: FileModel[]; count: number }> {
  const result = await FileModel.findAndCountAll({
    where: {
      projectId,
    },
    order: [[FILE_SCHEMA_CONST.FIELDS.CREATED_AT, 'DESC']],
    limit,
    offset,
  });
  return { rows: result.rows, count: result.count };
}

async function findFilesByProjectAndId(
  projectId: number,
  fileId: number,
): Promise<FileModel | null> {
  return FileModel.findOne({
    where: {
      id: fileId,
      projectId,
    },
  });
}

async function deleteFileRecord(file: FileModel): Promise<void> {
  await file.destroy();
}

export { createFileRecords, deleteFileRecord, findFilesByProjectAndId, findFilesByProjectId };
export type { CreateFileRecordInput };
