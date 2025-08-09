import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { User } from '../../../generated/prisma';
import { LibraryEngagementService } from '../../../services/library/library-engagement.service';
import ApiError from '../../../utils/ApiError';

export class LibraryEngagementController {
  constructor(
    private readonly engagementService: LibraryEngagementService = new LibraryEngagementService(),
  ) {}

  // Toggle pin status for a resource
  togglePin = async (req: Request, res: Response): Promise<void> => {
    try {
      const { resourceId } = req.params;
      const userId = (req.user as User)?.id;

      if (!userId) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'User not authenticated');
      }

      const isPinned = await this.engagementService.togglePin(userId, resourceId);
      res.status(httpStatus.OK).send({
        status: 'success',
        data: { isPinned },
        message: isPinned ? 'Resource pinned successfully' : 'Resource unpinned successfully',
      });
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'NotFoundException') {
        throw new ApiError(httpStatus.NOT_FOUND, error.message);
      }
      throw error;
    }
  };

  // Get user's pinned resources
  getUserPins = async (req: Request, res: Response): Promise<void> => {
    const userId = (req.user as User)?.id;
    const { page, limit } = req.query;

    if (!userId) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'User not authenticated');
    }

    const result = await this.engagementService.getUserPins(
      userId,
      Number(page) || 1,
      Number(limit) || 10,
    );

    res.status(httpStatus.OK).send({
      status: 'success',
      data: result,
    });
  };

  // Get user's certificates
  getUserCertificates = async (req: Request, res: Response): Promise<void> => {
    const userId = (req.user as User)?.id;
    const { page, limit } = req.query;

    if (!userId) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'User not authenticated');
    }

    const result = await this.engagementService.getUserCertificates(
      userId,
      Number(page) || 1,
      Number(limit) || 10,
    );

    res.status(httpStatus.OK).send({
      status: 'success',
      data: result,
    });
  };

  // Toggle reaction on comment or reply
  toggleReaction = async (req: Request, res: Response): Promise<void> => {
    try {
      const { type } = req.body;
      const { commentId, replyId } = req.params;
      const userId = (req.user as User)?.id;

      if (!userId) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'User not authenticated');
      }

      const isAdded = await this.engagementService.toggleReaction(userId, type, {
        commentId,
        replyId,
      });

      res.status(httpStatus.OK).send({
        status: 'success',
        data: { isAdded },
        message: isAdded ? 'Reaction added successfully' : 'Reaction removed successfully',
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

  // Get reaction counts
  getReactionCounts = async (req: Request, res: Response): Promise<void> => {
    try {
      const { commentId, replyId } = req.params;
      const counts = await this.engagementService.getReactionCounts({ commentId, replyId });

      res.status(httpStatus.OK).send({
        status: 'success',
        data: { counts },
      });
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'BadRequestException') {
        throw new ApiError(httpStatus.BAD_REQUEST, error.message);
      }
      throw error;
    }
  };
}
