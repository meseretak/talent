import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { roleRights } from '../../../config/roles';
import { LibDifficultyLevel, LibResourceStatus, User } from '../../../generated/prisma';
import { LibraryService } from '../../../services/library/library.service';
import ApiError from '../../../utils/ApiError';

export class LibraryController {
  constructor(private readonly libraryService: LibraryService = new LibraryService()) {}

  // Create new resource (Admin only)
  createResource = async (req: Request, res: Response): Promise<void> => {
    try {
      const userDetails = req.user as User;
      const resource = await this.libraryService.createResource({
        ...req.body,
        authorId: userDetails.id,
      });
      res
        .status(httpStatus.CREATED)
        .send({ data: resource, message: 'Resource created successfully' });
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'BadRequestException') {
        throw new ApiError(httpStatus.BAD_REQUEST, error.message);
      }
      throw error;
    }
  };

  // Get published resources
  getPublishedResources = async (req: Request, res: Response): Promise<void> => {
    const { page, limit, categoryId, difficulty, search } = req.query;

    const result = await this.libraryService.getPublishedResources(
      Number(page) || 1,
      Number(limit) || 10,
      {
        categoryId: categoryId?.toString(),
        difficulty: difficulty?.toString() as any,
        search: search?.toString(),
      },
    );

    res.status(httpStatus.OK).send({ data: result });
  };

  // Get resource by ID
  getResourceById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { search, includeContent, page, limit, categoryId, difficulty, status } = req.query;
      const user = req.user as User | undefined;

      // Handle the 'all' case
      if (id === 'all') {
        if (!user || !roleRights.get(user.role)?.includes('manageLibrary')) {
          throw new ApiError(httpStatus.FORBIDDEN, 'Access denied');
        }
        const result = await this.libraryService.getAllResources(
          Number(page) || 1,
          Number(limit) || 10,
          {
            categoryId: categoryId?.toString(),
            difficulty: difficulty?.toString() as LibDifficultyLevel,
            status: status?.toString() as LibResourceStatus,
            search: search?.toString(),
          },
        );
        res.status(httpStatus.OK).send({ data: result });
        return;
      }

      // Handle single resource case
      const resource = await this.libraryService.getResourceById(id, user?.id, {
        search: search?.toString(),
        includeContent: includeContent === 'true',
      });

      // Check if user has access to unpublished resources
      if (resource.status !== LibResourceStatus.PUBLISHED) {
        if (!user || !roleRights.get(user.role)?.includes('manageLibrary')) {
          throw new ApiError(httpStatus.FORBIDDEN, 'Access denied');
        }
      }

      res.status(httpStatus.OK).send({ data: resource });
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'NotFoundException') {
        throw new ApiError(httpStatus.NOT_FOUND, error.message);
      }
      throw error;
    }
  };

  // Update resource (Admin only)
  updateResource = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const resource = await this.libraryService.updateResource(id, req.body);
      res.status(httpStatus.OK).send({ data: resource, message: 'Resource updated successfully' });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.name === 'NotFoundException') {
          throw new ApiError(httpStatus.NOT_FOUND, error.message);
        } else if (error.name === 'BadRequestException') {
          throw new ApiError(httpStatus.BAD_REQUEST, error.message);
        }
      }
      throw error;
    }
  };

  // Delete resource (Admin only)
  deleteResource = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.libraryService.deleteResource(id);
      res.status(httpStatus.OK).send({ message: 'Resource deleted successfully' });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.name === 'NotFoundException') {
          throw new ApiError(httpStatus.NOT_FOUND, error.message);
        } else if (error.name === 'BadRequestException') {
          throw new ApiError(httpStatus.BAD_REQUEST, error.message);
        }
      }
      throw error;
    }
  };

  // Update progress
  updateProgress = async (req: Request, res: Response): Promise<void> => {
    try {
      const { resourceId } = req.params;
      const { percentage } = req.body;
      const userId = (req.user as User)?.id;

      if (!userId) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'User not authenticated');
      }

      const updatedProgress = await this.libraryService.updateProgress(
        userId,
        resourceId,
        percentage,
      );

      res.status(httpStatus.OK).send({
        status: 'success',
        data: {
          progress: {
            id: updatedProgress.id,
            percentage: updatedProgress.percentage,
            completed: updatedProgress.completed,
            createdAt: updatedProgress.createdAt.toISOString(),
            updatedAt: updatedProgress.updatedAt.toISOString(),
          },
        },
        message: 'Progress updated successfully',
      });
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'NotFoundException') {
        throw new ApiError(httpStatus.NOT_FOUND, error.message);
      }
      throw error;
    }
  };

  // Toggle favorite
  toggleFavorite = async (req: Request, res: Response): Promise<void> => {
    const { resourceId } = req.params;
    const userId = (req.user as User)?.id;

    if (!userId) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'User not authenticated');
    }

    const isFavorited = await this.libraryService.toggleFavorite(userId, resourceId);
    res.status(httpStatus.OK).send({
      data: { isFavorited },
      message: isFavorited ? 'Resource added to favorites' : 'Resource removed from favorites',
    });
  };

  // Get user progress
  getUserProgress = async (req: Request, res: Response): Promise<void> => {
    const userId = (req.user as User)?.id;
    const { page, limit, search, status } = req.query;

    if (!userId) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'User not authenticated');
    }

    const progress = await this.libraryService.getUserProgress(
      userId,
      Number(page) || 1,
      Number(limit) || 10,
      {
        search: search?.toString(),
        status: status?.toString() as LibResourceStatus,
      },
    );
    res.status(httpStatus.OK).send({ data: progress });
  };

  // Get all resources (Admin only)
  getAllResources = async (req: Request, res: Response): Promise<void> => {
    const { page, limit, categoryId, difficulty, status, search } = req.query;

    const result = await this.libraryService.getAllResources(
      Number(page) || 1,
      Number(limit) || 10,
      {
        categoryId: categoryId?.toString(),
        difficulty: difficulty?.toString() as LibDifficultyLevel,
        status: status?.toString() as LibResourceStatus,
        search: search?.toString(),
      },
    );

    res.status(httpStatus.OK).send({ data: result });
  };
}
