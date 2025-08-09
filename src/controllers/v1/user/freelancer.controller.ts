import { Request, Response } from 'express';
import httpStatus from 'http-status';
import logger from '../../../config/logger';
import { FreelancerStatus, SkillType, TerminationType, User } from '../../../generated/prisma';
import { clientService, emailService, freelancerService } from '../../../services';
import {
  AddCategoryDto,
  AddSkillDto,
  CreateFreelancerDto,
  CreatePortfolioItemDto,
  CreateWorkHistoryDto,
  UpdatePortfolioItemDto,
  UpdateWorkHistoryDto,
} from '../../../types/freelancer';
import ApiError from '../../../utils/ApiError';
import { errorResponse, paginatedResponse, successResponse } from '../../../utils/apiResponse';
import catchAsync from '../../../utils/catchAsync';

interface RequestWithUser extends Request {
  user?: {
    id: number;
    [key: string]: any;
  };
}

/**
 * Register a new freelancer with user and freelancer profile creation only for admin endpoint
 * @route POST /v1/freelancers/register
 */
const register = catchAsync(async (req: Request, res: Response) => {
  const registrationData = req.body as CreateFreelancerDto;
  const result = await freelancerService.register(registrationData);

  try {
    await emailService.sendWelcomeEmail(
      registrationData.email,
      `${registrationData.firstName} ${registrationData.lastName}`, // Construct name
      registrationData.password, // Pass the password (Security Risk!)
    );
    logger.info(`Welcome email sent successfully to ${registrationData.email}`);
  } catch (emailError) {
    logger.error(`Failed to send welcome email to ${registrationData.email}:`, emailError);
  }
  res.status(httpStatus.CREATED).json(successResponse(result, 'Freelancer registered successfully'));
});

/**
 * Register a freelancer profile for an existing user
 * @route POST /v1/freelancers/profile
 */
const registerProfile = catchAsync(async (req: Request, res: Response) => {
  // Assuming user ID is available in req.user after authentication
  if (!(req as RequestWithUser).user?.id) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'User not authenticated');
  }

  const data = {
    ...req.body,
    userId: (req as RequestWithUser).user!.id,
    profilePhoto: req.body.profilePhoto, // Include profilePhoto
  };

  const result = await freelancerService.registerProfile(data);
  res.status(httpStatus.CREATED).json(successResponse(result, 'Freelancer profile created successfully'));
});

/**
 * Update freelancer profile
 * @route PATCH /v1/freelancers/profile
 */
const updateProfile = catchAsync(async (req: Request, res: Response) => {
  // Assuming user ID is available in req.user after authentication
  if (!(req as RequestWithUser).user?.id) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'User not authenticated');
  }

  const updatedFreelancer = await freelancerService.updateProfile(
    (req as RequestWithUser).user!.id,
    {
      ...req.body,
      profilePhoto: req.body.profilePhoto, // Include profilePhoto
    },
  );

  res.status(httpStatus.OK).json(successResponse(updatedFreelancer, 'Freelancer profile updated successfully'));
});

const adminUpdateFreelancerInfo = catchAsync(async (req: Request, res: Response) => {
  const freelancerID = Number(req.params.id);
  const updatedFreelancer = await freelancerService.updateProfile(freelancerID, {
    ...req.body,
  });

  res.status(httpStatus.OK).json(successResponse(updatedFreelancer, 'Freelancer information updated successfully'));
});

/**
 * Get all skills for freelancer registration
 * @route GET /v1/freelancers/skills
 */
const getSkills = catchAsync(async (req: Request, res: Response) => {
  const skills = await freelancerService.getSkills();
  res.status(httpStatus.OK).json(successResponse(skills, 'Skills retrieved successfully'));
});

/**
 * Get all categories for freelancer registration
 * @route GET /v1/freelancers/categories
 */
const getCategories = catchAsync(async (req: Request, res: Response) => {
  const categories = await freelancerService.getCategories();

  res.status(httpStatus.OK).json(successResponse(categories, 'Categories retrieved successfully'));
});

/**
 * Add a new skill (Admin/Protected Route)
 * @route POST /v1/freelancers/skills
 */
const addSkill = catchAsync(async (req: Request, res: Response) => {
  const skill = await freelancerService.addSkill(req.body as AddSkillDto);
  res.status(httpStatus.CREATED).json(successResponse(skill, 'Skill added successfully'));
});

/**
 * Add a new category (Admin/Protected Route)
 * @route POST /v1/freelancers/categories
 */
const addCategory = catchAsync(async (req: Request, res: Response) => {
  const category = await freelancerService.addCategory(req.body as AddCategoryDto);
  res.status(httpStatus.CREATED).json(successResponse(category, 'Category added successfully'));
});

/**
 * Update freelancer status (including termination)
 * @route PATCH /v1/freelancers/:id/status
 */
const updateFreelancerStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, terminationDetails } = req.body;

  // Validate status enum value (already done by Joi, but good practice)
  if (!Object.values(FreelancerStatus).includes(status)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid status value');
  }

  const freelancerId = parseInt(id, 10);
  let terminationPayload:
    | {
        terminatedById: number;
        terminationReason?: string;
        terminationType: TerminationType;
      }
    | undefined = undefined;

  // If terminating, prepare the termination payload
  if (status === FreelancerStatus.TERMINATED) {
    // Ensure terminationDetails are provided (Joi validation should catch this)
    if (!terminationDetails) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Termination details required for TERMINATED status',
      );
    }
    // Ensure user is authenticated to get terminatedById
    if (!(req as RequestWithUser).user?.id) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'User performing termination not authenticated');
    }
    terminationPayload = {
      ...terminationDetails,
      terminatedById: (req as RequestWithUser).user!.id, // Get ID of user performing action
    };
  }

  const freelancer = await freelancerService.updateFreelancerStatus(
    freelancerId,
    status as FreelancerStatus,
    terminationPayload, // Pass termination details if applicable
  );

  res.status(httpStatus.OK).json(successResponse(freelancer, 'Freelancer status updated successfully'));
});

/**
 * Get freelancer by ID
 * @route GET /v1/freelancers/:id
 */
const getFreelancerById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const freelancer = await freelancerService.getFreelancerById(parseInt(id, 10));
  res.status(httpStatus.OK).json(successResponse(freelancer, 'Freelancer retrieved successfully'));
});

/**
 * Search freelancers with filters
 * @route GET /v1/freelancers/search
 */
const searchFreelancers = catchAsync(async (req: Request, res: Response) => {
  const {
    skills,
    categories,
    status,
    minRate,
    maxRate,
    availability,
    minHoursPerWeek,
    maxHoursPerWeek,
    keyword,
    name,
    sortBy,
    sortOrder,
    limit,
    offset,
  } = req.query;

  // Process and validate query parameters
  const filters: any = {};

  // Process skills (convert to enum array)
  if (skills) {
    const skillsArray = Array.isArray(skills) ? skills : [skills];

    filters.skills = skillsArray.map((skill) => {
      if (!Object.values(SkillType).includes(skill as SkillType)) {
        throw new ApiError(httpStatus.BAD_REQUEST, `Invalid skill type: ${skill}`);
      }
      return skill as SkillType;
    });
  }

  // Process categories (convert to number array)
  if (categories) {
    const categoriesArray = Array.isArray(categories) ? categories : [categories];

    filters.categories = categoriesArray.map((cat) => {
      const parsed = parseInt(cat as string, 10);
      if (isNaN(parsed)) {
        throw new ApiError(httpStatus.BAD_REQUEST, `Invalid category ID: ${cat}`);
      }
      return parsed;
    });
  }

  // Process status
  if (status) {
    if (!Object.values(FreelancerStatus).includes(status as FreelancerStatus)) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Invalid status: ${status}`);
    }
    filters.status = status as FreelancerStatus;
  }

  // Process numeric values
  if (minRate) {
    const parsed = parseInt(minRate as string, 10);
    if (isNaN(parsed)) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Invalid minRate: ${minRate}`);
    }
    filters.minRate = parsed;
  }

  if (maxRate) {
    const parsed = parseInt(maxRate as string, 10);
    if (isNaN(parsed)) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Invalid maxRate: ${maxRate}`);
    }
    filters.maxRate = parsed;
  }

  if (minHoursPerWeek) {
    const parsed = parseInt(minHoursPerWeek as string, 10);
    if (isNaN(parsed)) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Invalid minHoursPerWeek: ${minHoursPerWeek}`);
    }
    filters.minHoursPerWeek = parsed;
  }

  if (maxHoursPerWeek) {
    const parsed = parseInt(maxHoursPerWeek as string, 10);
    if (isNaN(parsed)) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Invalid maxHoursPerWeek: ${maxHoursPerWeek}`);
    }
    filters.maxHoursPerWeek = parsed;
  }

  // Process string values
  if (availability) filters.availability = availability as string;
  if (keyword) filters.keyword = keyword as string;
  if (name) filters.name = name as string;
  if (sortBy) filters.sortBy = sortBy as string;

  // Process sort order
  if (sortOrder) {
    if (!['asc', 'desc'].includes(sortOrder as string)) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Invalid sortOrder: ${sortOrder}`);
    }
    filters.sortOrder = sortOrder as 'asc' | 'desc';
  }

  // Process pagination
  if (limit) {
    const parsed = parseInt(limit as string, 10);
    if (isNaN(parsed) || parsed < 1) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Invalid limit: ${limit}`);
    }
    filters.limit = parsed;
  }

  if (offset) {
    const parsed = parseInt(offset as string, 10);
    if (isNaN(parsed) || parsed < 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Invalid offset: ${offset}`);
    }
    filters.offset = parsed;
  }

  const result = await freelancerService.searchFreelancers(filters);
  res.status(httpStatus.OK).json(successResponse(result, 'Freelancers search completed successfully'));
});

const searchClientDashboardFreelancers = catchAsync(async (req: Request, res: Response) => {
  const userDetail = req.user as User;
  const userId = userDetail?.id;

  if (!userId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'User not authenticated');
  }

  const client = await clientService.getClientByUserId(userId);
  if (!client) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Client profile not found for this user');
  }

  const {
    skills,
    categories,
    status,
    minRate,
    maxRate,
    availability,
    minHoursPerWeek,
    maxHoursPerWeek,
    keyword,
    name,
    sortBy,
    sortOrder,
    limit,
    offset,
  } = req.query;

  const filters: any = {};

  if (skills) {
    const skillsArray = Array.isArray(skills) ? skills : [skills];
    filters.skills = skillsArray.map((skill) => {
      if (!Object.values(SkillType).includes(skill as SkillType)) {
        throw new ApiError(httpStatus.BAD_REQUEST, `Invalid skill type: ${skill}`);
      }
      return skill as SkillType;
    });
  }

  if (categories) {
    const categoriesArray = Array.isArray(categories) ? categories : [categories];
    filters.categories = categoriesArray.map((cat) => {
      const parsed = parseInt(cat as string, 10);
      if (isNaN(parsed)) {
        throw new ApiError(httpStatus.BAD_REQUEST, `Invalid category ID: ${cat}`);
      }
      return parsed;
    });
  }

  if (status) {
    if (!Object.values(FreelancerStatus).includes(status as FreelancerStatus)) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Invalid status: ${status}`);
    }
    filters.status = status as FreelancerStatus;
  }

  if (minRate) {
    const parsed = parseInt(minRate as string, 10);
    if (isNaN(parsed)) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Invalid minRate: ${minRate}`);
    }
    filters.minRate = parsed;
  }

  if (maxRate) {
    const parsed = parseInt(maxRate as string, 10);
    if (isNaN(parsed)) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Invalid maxRate: ${maxRate}`);
    }
    filters.maxRate = parsed;
  }

  if (minHoursPerWeek) {
    const parsed = parseInt(minHoursPerWeek as string, 10);
    if (isNaN(parsed)) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Invalid minHoursPerWeek: ${minHoursPerWeek}`);
    }
    filters.minHoursPerWeek = parsed;
  }

  if (maxHoursPerWeek) {
    const parsed = parseInt(maxHoursPerWeek as string, 10);
    if (isNaN(parsed)) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Invalid maxHoursPerWeek: ${maxHoursPerWeek}`);
    }
    filters.maxHoursPerWeek = parsed;
  }

  if (availability) filters.availability = availability as string;
  if (keyword) filters.keyword = keyword as string;
  if (name) filters.name = name as string;
  if (sortBy) filters.sortBy = sortBy as string;

  if (sortOrder) {
    if (!['asc', 'desc'].includes(sortOrder as string)) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Invalid sortOrder: ${sortOrder}`);
    }
    filters.sortOrder = sortOrder as 'asc' | 'desc';
  }

  if (limit) {
    const parsed = parseInt(limit as string, 10);
    if (isNaN(parsed) || parsed < 1) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Invalid limit: ${limit}`);
    }
    filters.limit = parsed;
  }

  if (offset) {
    const parsed = parseInt(offset as string, 10);
    if (isNaN(parsed) || parsed < 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Invalid offset: ${offset}`);
    }
    filters.offset = parsed;
  }

  const result = await freelancerService.searchFreelancersForClientDashboard(client.id, filters);
  res.status(httpStatus.OK).json(successResponse(result, 'Client dashboard freelancers search completed successfully'));
});

// --- Work History Controllers ---

/**
 * Add work history for a freelancer
 * @route POST /v1/freelancers/:freelancerId/work-history
 */
const addWorkHistory = catchAsync(async (req: Request, res: Response) => {
  const { freelancerId } = req.params;
  // Optional: Add check if the logged-in user is the freelancer or an admin
  const workHistory = await freelancerService.addWorkHistory(
    parseInt(freelancerId, 10),
    req.body as CreateWorkHistoryDto,
  );
  res.status(httpStatus.CREATED).json(successResponse(workHistory, 'Work history added successfully'));
});

/**
 * Get work history for a freelancer
 * @route GET /v1/freelancers/:freelancerId/work-history
 */
const getWorkHistory = catchAsync(async (req: Request, res: Response) => {
  const { freelancerId } = req.params;
  const workHistory = await freelancerService.getWorkHistoryByFreelancerId(
    parseInt(freelancerId, 10),
  );
  res.status(httpStatus.OK).json(successResponse(workHistory, 'Work history retrieved successfully'));
});

/**
 * Update a specific work history entry
 * @route PATCH /v1/work-history/:workHistoryId
 */
const updateWorkHistory = catchAsync(async (req: Request, res: Response) => {
  const { workHistoryId } = req.params;
  // Optional: Add check if the logged-in user owns this work history or is an admin
  const updatedWorkHistory = await freelancerService.updateWorkHistory(
    parseInt(workHistoryId, 10),
    req.body as UpdateWorkHistoryDto,
  );
  res.status(httpStatus.OK).json(successResponse(updatedWorkHistory, 'Work history updated successfully'));
});

/**
 * Delete a specific work history entry
 * @route DELETE /v1/work-history/:workHistoryId
 */
const deleteWorkHistory = catchAsync(async (req: Request, res: Response) => {
  const { workHistoryId } = req.params;
  // Optional: Add check if the logged-in user owns this work history or is an admin
  await freelancerService.deleteWorkHistory(parseInt(workHistoryId, 10));
  res.status(httpStatus.OK).json(successResponse(null, 'Work history deleted successfully'));
});

// --- Portfolio Item Controllers ---

/**
 * Add portfolio item for a freelancer
 * @route POST /v1/freelancers/:freelancerId/portfolio
 */
const addPortfolioItem = catchAsync(async (req: Request, res: Response) => {
  const { freelancerId } = req.params;
  // Optional: Add ownership/admin check
  const portfolioItem = await freelancerService.addPortfolioItem(
    parseInt(freelancerId, 10),
    req.body as CreatePortfolioItemDto,
  );
  res.status(httpStatus.CREATED).json(successResponse(portfolioItem, 'Portfolio item added successfully'));
});

/**
 * Get portfolio items for a freelancer
 * @route GET /v1/freelancers/:freelancerId/portfolio
 */
const getPortfolioItems = catchAsync(async (req: Request, res: Response) => {
  const { freelancerId } = req.params;
  const portfolioItems = await freelancerService.getPortfolioItemsByFreelancerId(
    parseInt(freelancerId, 10),
  );
  res.status(httpStatus.OK).json(successResponse(portfolioItems, 'Portfolio items retrieved successfully'));
});

/**
 * Update a specific portfolio item
 * @route PATCH /v1/portfolio/:portfolioItemId
 */
const updatePortfolioItem = catchAsync(async (req: Request, res: Response) => {
  const { portfolioItemId } = req.params;
  // Optional: Add ownership/admin check
  const updatedItem = await freelancerService.updatePortfolioItem(
    parseInt(portfolioItemId, 10),
    req.body as UpdatePortfolioItemDto,
  );
  res.status(httpStatus.OK).json(successResponse(updatedItem, 'Portfolio item updated successfully'));
});

/**
 * Delete a specific portfolio item
 * @route DELETE /v1/portfolio/:portfolioItemId
 */
const deletePortfolioItem = catchAsync(async (req: Request, res: Response) => {
  const { portfolioItemId } = req.params;
  // Optional: Add ownership/admin check
  await freelancerService.deletePortfolioItem(parseInt(portfolioItemId, 10));
  res.status(httpStatus.OK).json(successResponse(null, 'Portfolio item deleted successfully'));
});

/**
 * Get all freelancers with full details
 * @route GET /v1/freelancers
 */
const getAllFreelancers = catchAsync(async (req: Request, res: Response) => {
  const freelancers = await freelancerService.getAllFreelancers();
  res.status(httpStatus.OK).json(successResponse(freelancers, 'All freelancers retrieved successfully'));
});

/**
 * Get freelancers with limited data for card view
 * @route GET /v1/freelancers/card-view
 */
const getFreelancersForCardView = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, status, skills } = req.query;

  const params = {
    page: page ? parseInt(page as string, 10) : undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined,
    status: status as string,
    skills: Array.isArray(skills)
      ? skills.map((skill) => String(skill))
      : skills
      ? [String(skills)]
      : undefined,
  };

  const result = await freelancerService.getFreelancersForCardView(params);
  res.status(httpStatus.OK).json(successResponse(result, 'Freelancers for card view retrieved successfully'));
});

/**
 * Add a review for a freelancer
 */
const addFreelancerReview = catchAsync(async (req: Request, res: Response) => {
  const { freelancerId } = req.params;
  const { rating, reviewText, comment, clientId, projectId } = req.body;

  // Assuming the reviewer is the authenticated user
  const uesrDetail = req.user as User;
  const reviewerId = uesrDetail.id;

  const review = await freelancerService.addFreelancerReview({
    rating,
    reviewText,
    comment,
    freelancerId: Number(freelancerId),
    clientId,
    reviewerId,
    projectId,
  });

  res.status(httpStatus.CREATED).json(successResponse(review, 'Freelancer review added successfully'));
});

/**
 * Get all reviews for a specific freelancer
 */
const getFreelancerReviews = catchAsync(async (req: Request, res: Response) => {
  const { freelancerId } = req.params;

  const reviews = await freelancerService.getFreelancerReviews(Number(freelancerId));

  res.status(httpStatus.OK).json(successResponse(reviews, 'Freelancer reviews retrieved successfully'));
});

/**
 * Update a specific review
 */
const updateFreelancerReview = catchAsync(async (req: Request, res: Response) => {
  const { reviewId } = req.params;
  const { rating, reviewText, comment } = req.body;

  // Optional: Add authorization check to ensure only the reviewer can update their review
  // if (req.user.id !== review.reviewerId) {
  //   throw new ApiError(httpStatus.FORBIDDEN, 'You are not authorized to update this review');
  // }

  const updatedReview = await freelancerService.updateFreelancerReview(Number(reviewId), {
    rating,
    reviewText,
    comment,
  });

  res.status(httpStatus.OK).json(successResponse(updatedReview, 'Freelancer review updated successfully'));
});

/**
 * Delete a specific review
 */
const deleteFreelancerReview = catchAsync(async (req: Request, res: Response) => {
  const { reviewId } = req.params;

  // Optional: Add authorization check to ensure only the reviewer can delete their review
  // if (req.user.id !== review.reviewerId) {
  //   throw new ApiError(httpStatus.FORBIDDEN, 'You are not authorized to delete this review');
  // }

  const result = await freelancerService.deleteFreelancerReview(Number(reviewId));

  res.status(httpStatus.OK).json(successResponse(result, 'Freelancer review deleted successfully'));
});

/**
 * Get featured freelancers with pagination
 */
const getFeaturedFreelancers = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const size = parseInt(req.query.size as string) || 10;

  const result = await freelancerService.getFeaturedFreelancers(page, size);
  res.status(httpStatus.OK).json(successResponse(result, 'Featured freelancers retrieved successfully'));
});

/**
 * Toggle featured status
 */
const toggleFeaturedStatus = catchAsync(async (req: Request, res: Response) => {
  const { freelancerId } = req.params;
  const { featured } = req.body;

  const result = await freelancerService.toggleFeaturedStatus(parseInt(freelancerId), featured);
  res.status(httpStatus.OK).json(successResponse(result, 'Featured status toggled successfully'));
});

/**
 * Delete a freelancer and all related records
 * @route DELETE /v1/freelancers/:freelancerId
 */
const deleteFreelancer = catchAsync(async (req: Request, res: Response) => {
  const { freelancerId } = req.params;
  const result = await freelancerService.deleteFreelancer(parseInt(freelancerId, 10));
  res.status(httpStatus.OK).json(successResponse(result, 'Freelancer deleted successfully'));
});

export default {
  register,
  registerProfile,
  getSkills,
  getCategories,
  addSkill,
  addCategory,
  adminUpdateFreelancerInfo,
  updateFreelancerStatus,
  updateProfile,
  getFreelancerById,
  searchFreelancers,
  getAllFreelancers,
  getFreelancersForCardView,
  getFeaturedFreelancers,
  toggleFeaturedStatus,
  // Work History
  addWorkHistory,
  getWorkHistory,
  updateWorkHistory,
  deleteWorkHistory,
  // Portfolio Items
  addPortfolioItem,
  getPortfolioItems,
  updatePortfolioItem,
  deletePortfolioItem,
  addFreelancerReview,
  getFreelancerReviews,
  updateFreelancerReview,
  deleteFreelancerReview,
  searchClientDashboardFreelancers,
  deleteFreelancer,
};
