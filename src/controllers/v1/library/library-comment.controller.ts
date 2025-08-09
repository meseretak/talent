import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { User } from '../../../generated/prisma';
import { LibraryCommentService } from '../../../services/library/library-comment.service';
import ApiError from '../../../utils/ApiError';

export class LibraryCommentController {
  constructor(
    private readonly commentService: LibraryCommentService = new LibraryCommentService(),
  ) {}

  // Create new comment or reply
  createComment = async (req: Request, res: Response): Promise<void> => {
    try {
      const userDetails = req.user as User;
      const comment = await this.commentService.createComment({
        ...req.body,
        userId: userDetails.id,
      });
      res
        .status(httpStatus.CREATED)
        .send({ data: comment, message: 'Comment created successfully' });
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

  // Get comments for a resource
  getResourceComments = async (req: Request, res: Response): Promise<void> => {
    try {
      const { resourceId } = req.params;
      const { page = '1', limit = '10' } = req.query;
      const result = await this.commentService.getResourceComments(
        resourceId,
        parseInt(page as string, 10),
        parseInt(limit as string, 10),
      );
      res.status(httpStatus.OK).send({ data: result });
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'NotFoundException') {
        throw new ApiError(httpStatus.NOT_FOUND, error.message);
      }
      throw error;
    }
  };

  // Update comment
  updateComment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userDetails = req.user as User;
      const comment = await this.commentService.updateComment(id, userDetails.id, req.body);
      res.status(httpStatus.OK).send({ data: comment, message: 'Comment updated successfully' });
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

  // Delete comment
  deleteComment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userDetails = req.user as User;
      await this.commentService.deleteComment(id, userDetails.id);
      res.status(httpStatus.OK).send({ message: 'Comment deleted successfully' });
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

  // Toggle reaction on a comment
  toggleReaction = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { type } = req.body;
      const userDetails = req.user as User;
      const isAdded = await this.commentService.toggleReaction(id, userDetails.id, type);
      res.status(httpStatus.OK).send({
        message: `Reaction ${isAdded ? 'added' : 'removed'} successfully`,
      });
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
}
