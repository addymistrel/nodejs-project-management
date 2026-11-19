import { FILE_SCHEMA_CONST } from '#/constants';
import { databaseClient, FileModel } from '#/database';
import { Op } from 'sequelize';

interface CreateFileRecordInput {
  name: string;
  storagePath: string;
  size: number;
  mimeType: string;
  isOutput?: boolean;
  checksum?: string | null;
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
      checksum: file.checksum ?? null,
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

async function findFilesByProjectAndIds(
  projectId: number,
  fileIds: number[],
): Promise<FileModel[]> {
  if (fileIds.length === 0) {
    return [];
  }

  return FileModel.findAll({
    where: {
      projectId,
      id: { [Op.in]: [...new Set(fileIds)] },
    },
  });
}

async function deleteFileRecord(file: FileModel): Promise<void> {
  await databaseClient.transaction(async (transaction) => {
    await file.destroy({ transaction });
  });
}

export {
  createFileRecords,
  deleteFileRecord,
  findFilesByProjectAndId,
  findFilesByProjectAndIds,
  findFilesByProjectId,
};
export type { CreateFileRecordInput };
