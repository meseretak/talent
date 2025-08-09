import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { User } from '../../../generated/prisma';
import { LibraryAttachmentService } from '../../../services/library/library-attachment.service';
import ApiError from '../../../utils/ApiError';

export class LibraryAttachmentController {
  constructor(
    private readonly attachmentService: LibraryAttachmentService = new LibraryAttachmentService(),
  ) {}

  // Create new attachment
  createAttachment = async (req: Request, res: Response): Promise<void> => {
    try {
      const userDetails = req.user as User;
      const attachment = await this.attachmentService.createAttachment({
        ...req.body,
        userId: userDetails.id,
      });
      res
        .status(httpStatus.CREATED)
        .send({ data: attachment, message: 'Attachment created successfully' });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.name === 'BadRequestException') {
          throw new ApiError(httpStatus.BAD_REQUEST, error.message);
        }
        if (error.name === 'NotFoundException') {
          throw new ApiError(httpStatus.NOT_FOUND, error.message);
        }
      }
      throw error;
    }
  };

  // Get attachments for a resource
  getResourceAttachments = async (req: Request, res: Response): Promise<void> => {
    try {
      const { resourceId } = req.params;
      const attachments = await this.attachmentService.getResourceAttachments(resourceId);
      res.status(httpStatus.OK).send({ data: attachments });
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'NotFoundException') {
        throw new ApiError(httpStatus.NOT_FOUND, error.message);
      }
      throw error;
    }
  };

  // Get single attachment
  getAttachment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const attachment = await this.attachmentService.getAttachment(id);
      res.status(httpStatus.OK).send({ data: attachment });
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'NotFoundException') {
        throw new ApiError(httpStatus.NOT_FOUND, error.message);
      }
      throw error;
    }
  };

  // Update attachment
  updateAttachment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userDetails = req.user as User;
      const attachment = await this.attachmentService.updateAttachment(
        id,
        userDetails.id,
        req.body,
      );
      res
        .status(httpStatus.OK)
        .send({ data: attachment, message: 'Attachment updated successfully' });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.name === 'NotFoundException') {
          throw new ApiError(httpStatus.NOT_FOUND, error.message);
        }
        if (error.name === 'BadRequestException') {
          throw new ApiError(httpStatus.BAD_REQUEST, error.message);
        }
      }
      throw error;
    }
  };

  // Delete attachment
  deleteAttachment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.attachmentService.deleteAttachment(id);
      res.status(httpStatus.OK).send({ message: 'Attachment deleted successfully' });
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'NotFoundException') {
        throw new ApiError(httpStatus.NOT_FOUND, error.message);
      }
      throw error;
    }
  };

  // Get total size of attachments for a resource
  getResourceAttachmentsSize = async (req: Request, res: Response): Promise<void> => {
    try {
      const { resourceId } = req.params;
      const totalSize = await this.attachmentService.getResourceAttachmentsSize(resourceId);
      res.status(httpStatus.OK).send({ data: { totalSize } });
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'NotFoundException') {
        throw new ApiError(httpStatus.NOT_FOUND, error.message);
      }
      throw error;
    }
  };
}
