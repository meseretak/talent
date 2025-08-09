import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { DocumentService } from '../../../services/project/documentmanagement.service';
import catchAsync from '../../../utils/catchAsync';

const documentService = new DocumentService();

export class DocumentController {
  createDocument = catchAsync(async (req: Request, res: Response) => {
    const document = await documentService.createDocument(req.body);
    res.status(httpStatus.CREATED).json(document);
  });

  getDocumentById = catchAsync(async (req: Request, res: Response) => {
    const document = await documentService.getDocumentById(Number(req.params.id));
    if (!document) {
      res.status(httpStatus.NOT_FOUND).json({ message: 'Document not found' });
      return;
    }
    res.json(document);
  });

  updateDocument = catchAsync(async (req: Request, res: Response) => {
    const document = await documentService.updateDocument(Number(req.params.id), req.body);
    if (!document) {
      res.status(httpStatus.NOT_FOUND).json({ message: 'Document not found' });
      return;
    }
    res.json(document);
  });

  deleteDocument = catchAsync(async (req: Request, res: Response) => {
    await documentService.deleteDocument(Number(req.params.id));
    res.status(httpStatus.NO_CONTENT).send();
  });

  listProjectDocuments = catchAsync(async (req: Request, res: Response) => {
    const projectId = Number(req.params.projectId);
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const filter = req.query.filter ? JSON.parse(String(req.query.filter)) : {};

    const documents = await documentService.listProjectDocuments(projectId, filter, page, limit);
    res.json(documents);
  });

  createDocumentVersion = catchAsync(async (req: Request, res: Response) => {
    const documentId = Number(req.params.id);
    const { changedById, fileURL, fileSize, changeNotes } = req.body;

    const version = await documentService.createDocumentVersion(
      documentId,
      Number(changedById),
      fileURL,
      fileSize,
      changeNotes,
    );
    res.status(httpStatus.CREATED).json(version);
  });

  // Folder Management
  createFolder = catchAsync(async (req: Request, res: Response) => {
    const { projectId, createdById, name, description, parentId } = req.body;
    const folder = await documentService.createFolder(
      Number(projectId),
      Number(createdById),
      name,
      description,
      parentId ? Number(parentId) : undefined,
    );
    res.status(httpStatus.CREATED).json(folder);
  });

  getFolderById = catchAsync(async (req: Request, res: Response) => {
    const folder = await documentService.getFolderById(Number(req.params.id));
    if (!folder) {
      res.status(httpStatus.NOT_FOUND).json({ message: 'Folder not found' });
      return;
    }
    res.json(folder);
  });

  updateFolder = catchAsync(async (req: Request, res: Response) => {
    const { name, description } = req.body;
    const folder = await documentService.updateFolder(Number(req.params.id), name, description);
    res.json(folder);
  });

  deleteFolder = catchAsync(async (req: Request, res: Response) => {
    await documentService.deleteFolder(Number(req.params.id));
    res.status(httpStatus.NO_CONTENT).send();
  });

  listProjectFolders = catchAsync(async (req: Request, res: Response) => {
    const projectId = Number(req.params.projectId);
    const parentId = req.query.parentId ? Number(req.query.parentId) : undefined;
    const folders = await documentService.listProjectFolders(projectId, parentId);
    res.json(folders);
  });

  moveDocumentToFolder = catchAsync(async (req: Request, res: Response) => {
    const documentId = Number(req.params.id);
    const { folderId } = req.body;
    const document = await documentService.moveDocumentToFolder(
      documentId,
      folderId ? Number(folderId) : null,
    );
    res.json(document);
  });
}

export default new DocumentController();
