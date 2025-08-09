import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { errorResponse, paginatedResponse, successResponse } from '../../utils/apiResponse';
import catchAsync from '../../utils/catchAsync';

export class ExampleController {
  /**
   * Example of a simple success response
   */
  static getItem = catchAsync(async (req: Request, res: Response) => {
    // Simulate fetching an item
    const item = {
      id: 1,
      name: 'Example Item',
      description: 'This is an example item',
    };

    // Return a success response with data and message
    res.status(httpStatus.OK).json(successResponse(item, 'Item retrieved successfully'));
  });

  /**
   * Example of a paginated response
   */
  static getItems = catchAsync(async (req: Request, res: Response) => {
    // Parse query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Simulate fetching paginated data
    const items = Array.from({ length: limit }, (_, i) => ({
      id: (page - 1) * limit + i + 1,
      name: `Item ${(page - 1) * limit + i + 1}`,
      description: `Description for item ${(page - 1) * limit + i + 1}`,
    }));

    // Simulate total count
    const totalCount = 100;

    // Return a paginated response
    res
      .status(httpStatus.OK)
      .json(paginatedResponse(items, page, limit, totalCount, 'Items retrieved successfully'));
  });

  /**
   * Example of an error response
   */
  static createItem = catchAsync(async (req: Request, res: Response) => {
    // Simulate validation error
    const { name } = req.body;

    if (!name) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(
          errorResponse('Name is required', { field: 'name', issue: 'missing_required_field' }),
        );
    }

    // Simulate successful creation
    const newItem = {
      id: 101,
      name,
      description: req.body.description || '',
      createdAt: new Date(),
    };

    // Return a success response with data and message
    res.status(httpStatus.CREATED).json(successResponse(newItem, 'Item created successfully'));
  });

  /**
   * Example with custom meta information
   */
  static getItemStats = catchAsync(async (req: Request, res: Response) => {
    // Simulate fetching item stats
    const stats = {
      views: 1250,
      likes: 42,
      shares: 15,
    };

    // Custom meta information
    const meta = {
      lastUpdated: new Date(),
      source: 'analytics-service',
      reliability: 'high',
    };

    // Return a success response with data, message and meta
    res
      .status(httpStatus.OK)
      .json(successResponse(stats, 'Item statistics retrieved successfully', meta));
  });
}
