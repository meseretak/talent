export interface CreateDocumentDto {
  fileName?: string;
  description?: string;
  fileURL: string;
  fileSize?: number;
  fileType?: string;
  uploadedById: number;
  projectId: number;
  taskId?: number;
  freelancerId?: number;
  folderId?: number;
}

export interface UpdateDocumentDto {
  fileName?: string;
  description?: string;
  folderId?: number | null;
}

export interface DocumentVersionDto {
  documentId: number;
  versionNumber: number;
  fileURL: string;
  fileSize?: number;
  changedById: number;
  changeNotes?: string;
}

export interface CreateFolderDto {
  name: string;
  description?: string;
  projectId: number;
  createdById: number;
  parentId?: number;
}

export interface UpdateFolderDto {
  name?: string;
  description?: string;
  parentId?: number | null;
}

export interface DocumentFilterDto {
  projectId: number;
  taskId?: number;
  freelancerId?: number;
  folderId?: number | null;
  uploadedById?: number;
  fileType?: string;
  dateFrom?: Date;
  dateTo?: Date;
}
