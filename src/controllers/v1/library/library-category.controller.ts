import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { LibraryCategoryService } from '../../../services/library/library-category.service';
import ApiError from '../../../utils/ApiError';

export class LibraryCategoryController {
  constructor(
    private readonly categoryService: LibraryCategoryService = new LibraryCategoryService(),
  ) {}

  // Create new category
  createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const category = await this.categoryService.createCategory(req.body);
      res
        .status(httpStatus.CREATED)
        .send({ data: category, message: 'Category created successfully' });
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'BadRequestException') {
        throw new ApiError(httpStatus.BAD_REQUEST, error.message);
      }
      throw error;
    }
  };

  // Get all categories
  getCategories = async (req: Request, res: Response): Promise<void> => {
    const { page, limit, search, includeInactive } = req.query;

    const result = await this.categoryService.getCategories({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      search: search?.toString(),
      includeInactive: includeInactive === 'true',
    });

    res.status(httpStatus.OK).send({ data: result });
  };

  // Get category by ID
  getCategoryById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const category = await this.categoryService.getCategoryById(id);
      res.status(httpStatus.OK).send({ data: category });
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'NotFoundException') {
        throw new ApiError(httpStatus.NOT_FOUND, error.message);
      }
      throw error;
    }
  };

  // Update category
  updateCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const category = await this.categoryService.updateCategory(id, req.body);
      res.status(httpStatus.OK).send({ data: category, message: 'Category updated successfully' });
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

  // Delete category
  deleteCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.categoryService.deleteCategory(id);
      res.status(httpStatus.OK).send({ message: 'Category deleted successfully' });
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

  // Deactivate category
  deactivateCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const category = await this.categoryService.deactivateCategory(id);
      res
        .status(httpStatus.OK)
        .send({ data: category, message: 'Category deactivated successfully' });
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'NotFoundException') {
        throw new ApiError(httpStatus.NOT_FOUND, error.message);
      }
      throw error;
    }
  };

  // Get categories with stats
  getCategoriesWithStats = async (_req: Request, res: Response): Promise<void> => {
    const categories = await this.categoryService.getCategoriesWithStats();
    res.status(httpStatus.OK).send({ data: categories });
  };
}
