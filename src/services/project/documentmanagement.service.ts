import { PrismaClient } from '../../generated/prisma';
import { CreateDocumentDto, UpdateDocumentDto } from '../../types/documentProject';

const prisma = new PrismaClient();

export class DocumentService {
  async createDocument(createDocumentDto: CreateDocumentDto) {
    return prisma.projectDocument.create({
      data: {
        fileName: createDocumentDto.fileName,
        description: createDocumentDto.description,
        fileURL: createDocumentDto.fileURL,
        fileSize: createDocumentDto.fileSize,
        fileType: createDocumentDto.fileType,
        uploadedAt: new Date(),
        uploadedBy: { connect: { id: createDocumentDto.uploadedById } },
        Project: { connect: { id: createDocumentDto.projectId } },
        ...(createDocumentDto.taskId && {
          task: { connect: { id: createDocumentDto.taskId } },
        }),
        ...(createDocumentDto.freelancerId && {
          freelancer: { connect: { id: createDocumentDto.freelancerId } },
        }),
        ...(createDocumentDto.folderId && {
          folder: { connect: { id: createDocumentDto.folderId } },
        }),
      },
      include: {
        uploadedBy: true,
        task: true,
        freelancer: true,
        Project: true,
        folder: true,
        DocumentVersion: true,
      },
    });
  }

  async getDocumentById(id: number) {
    return prisma.projectDocument.findUnique({
      where: { id },
      include: {
        uploadedBy: true,
        task: true,
        freelancer: true,
        Project: true,
        folder: true,
        DocumentVersion: {
          orderBy: {
            versionNumber: 'desc',
          },
          include: {
            changedBy: true,
          },
        },
      },
    });
  }

  async updateDocument(id: number, updateDocumentDto: UpdateDocumentDto) {
    const data: any = {};

    if (updateDocumentDto.fileName !== undefined) data.fileName = updateDocumentDto.fileName;
    if (updateDocumentDto.description !== undefined)
      data.description = updateDocumentDto.description;

    if (updateDocumentDto.folderId !== undefined) {
      if (updateDocumentDto.folderId === null) {
        data.folder = { disconnect: true };
      } else {
        data.folder = { connect: { id: updateDocumentDto.folderId } };
      }
    }

    return prisma.projectDocument.update({
      where: { id },
      data,
      include: {
        uploadedBy: true,
        task: true,
        freelancer: true,
        Project: true,
        folder: true,
      },
    });
  }

  async deleteDocument(id: number) {
    return prisma.projectDocument.delete({
      where: { id },
    });
  }

  async listProjectDocuments(
    projectId: number,
    filter: Record<string, any> = {},
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;
    return prisma.projectDocument.findMany({
      where: {
        projectId,
        ...filter,
      },
      skip,
      take: limit,
      include: {
        uploadedBy: true,
        task: true,
        folder: true,
      },
      orderBy: {
        uploadedAt: 'desc',
      },
    });
  }

  async createDocumentVersion(
    documentId: number,
    changedById: number,
    fileURL: string,
    fileSize?: number,
    changeNotes?: string,
  ) {
    // Get current highest version number
    const currentVersion = await prisma.documentVersion.findFirst({
      where: { documentId },
      orderBy: {
        versionNumber: 'desc',
      },
      select: {
        versionNumber: true,
      },
    });

    const newVersionNumber = (currentVersion?.versionNumber || 0) + 1;

    return prisma.documentVersion.create({
      data: {
        document: { connect: { id: documentId } },
        versionNumber: newVersionNumber,
        fileURL,
        fileSize,
        changedBy: { connect: { id: changedById } },
        changeNotes,
        createdAt: new Date(),
      },
      include: {
        changedBy: true,
      },
    });
  }

  async createFolder(
    projectId: number,
    createdById: number,
    name: string,
    description?: string,
    parentId?: number,
  ) {
    return prisma.documentFolder.create({
      data: {
        name,
        description,
        project: { connect: { id: projectId } },
        createdBy: { connect: { id: createdById } },
        ...(parentId && { parent: { connect: { id: parentId } } }),
        createdAt: new Date(),
      },
      include: {
        project: true,
        createdBy: true,
        parent: true,
        children: true,
        documents: true,
      },
    });
  }

  async getFolderById(id: number) {
    return prisma.documentFolder.findUnique({
      where: { id },
      include: {
        project: true,
        createdBy: true,
        parent: true,
        children: true,
        documents: {
          include: {
            uploadedBy: true,
          },
        },
      },
    });
  }

  async updateFolder(id: number, name: string, description?: string) {
    return prisma.documentFolder.update({
      where: { id },
      data: {
        name,
        description,
      },
      include: {
        project: true,
        createdBy: true,
        parent: true,
        children: true,
        documents: true,
      },
    });
  }

  async deleteFolder(id: number) {
    // First, move all documents to root (null folder)
    await prisma.projectDocument.updateMany({
      where: { folderId: id },
      data: {
        folderId: null,
      },
    });

    // Then, move all subfolders to root (null parent)
    await prisma.documentFolder.updateMany({
      where: { parentId: id },
      data: {
        parentId: null,
      },
    });

    // Finally, delete the folder
    return prisma.documentFolder.delete({
      where: { id },
    });
  }

  async listProjectFolders(projectId: number, parentId?: number) {
    return prisma.documentFolder.findMany({
      where: {
        projectId,
        parentId: parentId === undefined ? null : parentId,
      },
      include: {
        children: true,
        documents: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async moveDocumentToFolder(documentId: number, folderId: number | null) {
    return prisma.projectDocument.update({
      where: { id: documentId },
      data: {
        folder: folderId ? { connect: { id: folderId } } : { disconnect: true },
      },
      include: {
        folder: true,
      },
    });
  }
}
