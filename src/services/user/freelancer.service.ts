import httpStatus from 'http-status';
import { userService } from '..';
import prisma from '../../client';
import {
  FreelancerStatus,
  Role,
  SkillType,
  TerminationType,
  UserStatus,
} from '../../generated/prisma';
import { AvailabilityStatus } from '../../types/enum';
import {
  CreateFreelancerDto, // Example DTO
  CreatePortfolioItemDto,
  CreateWorkHistoryDto,
  UpdateFreelancerDto, // Example DTO
  UpdatePortfolioItemDto, // Example DTO
  UpdateWorkHistoryDto, // Example DTO
} from '../../types/freelancer';
import ApiError from '../../utils/ApiError';
import exclude from '../../utils/exclude';
import { HireService } from '../hire/hire.service';

const hireService = new HireService(prisma);

/**
 * Register a new freelancer
 */
const register = async (createFreelancerDto: CreateFreelancerDto) => {
  try {
    // First create the user with freelancer role
    const userData = {
      email: createFreelancerDto.email,
      password: createFreelancerDto.password,
      firstName: createFreelancerDto.firstName,
      lastName: createFreelancerDto.lastName,
      middleName: createFreelancerDto.middleName,
      role: Role.FREELANCER,
    };

    const user = await userService.createUser(userData);

    // Create availability record
    const availability = await prisma.availability.create({
      data: {
        status: createFreelancerDto.availability?.status || AvailabilityStatus.AVAILABLE,
        availableHoursPerWeek: createFreelancerDto.availability?.availableHoursPerWeek || 40,
        notes: createFreelancerDto.availability?.notes || '',
      },
    });

    // Create statistics information with default values
    const statistics = await prisma.statisticsInformation.create({
      data: {
        totalEarnings: 0,
        totalProjects: 0,
        totalTasks: 0,
        totalReviews: 0,
        totalRating: 0,
        totalClients: 0,
        totalJobsCompleted: 0,
        totalJobsOngoing: 0,
        totalJobsPending: 0,
        totalJobsCancelled: 0,
        totalJobsOnHold: 0,
        totalStorageUsed: 0,
      },
    });

    // Create the freelancer profile
    const freelancer = await prisma.freelancer.create({
      data: {
        userId: user.id,
        headline: createFreelancerDto.headline || '',
        bio: createFreelancerDto.bio || '',
        about: createFreelancerDto.about || '',
        profilePhoto: createFreelancerDto.profilePhoto || '',
        bannerPhoto: createFreelancerDto.bannerPhoto || '',
        availabilityId: availability.id,
        statisticsInformationId: statistics.id,
        status: FreelancerStatus.PENDING,
        skills: createFreelancerDto.skills?.length
          ? {
              connect: createFreelancerDto.skills.map((id) => ({ id })),
            }
          : undefined,
        categories: createFreelancerDto.categories?.length
          ? {
              connect: createFreelancerDto.categories.map((id) => ({ id })),
            }
          : undefined,
      },
    });

    // Add work history if provided
    if (createFreelancerDto.workHistory?.length) {
      await Promise.all(
        createFreelancerDto.workHistory.map((workItem) =>
          prisma.workHistory.create({
            data: {
              ...workItem,
              freelancerId: freelancer.id,
            },
          }),
        ),
      );
    }

    // Add certifications if provided
    if (createFreelancerDto.certifications?.length) {
      await Promise.all(
        createFreelancerDto.certifications.map((cert) =>
          prisma.certification.create({
            data: {
              ...cert,
              freelancerId: freelancer.id,
            },
          }),
        ),
      );
    }

    // Add portfolio items if provided
    if (createFreelancerDto.portfolio?.length) {
      await Promise.all(
        createFreelancerDto.portfolio.map((item) =>
          prisma.portfolioItem.create({
            data: {
              ...item,
              freelancerId: freelancer.id,
            },
          }),
        ),
      );
    }

    // Fetch the complete freelancer data with all relations
    const completeFreelancer = await prisma.freelancer.findUnique({
      where: { id: freelancer.id },
      include: {
        user: true,
        skills: true,
        categories: true,
        workHistory: true,
        certifications: true,
        portfolio: true,
        availability: true,
      },
    });

    const userWithoutPassword = exclude(user, ['password', 'createdAt', 'updatedAt']);

    return {
      user: userWithoutPassword,
      freelancer: completeFreelancer,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    console.error('Registration failed:', error);

    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error instanceof Error ? error.message : 'Failed to register freelancer',
    );
  }
};

/**
 * Get all skills for freelancer registration
 */
const getSkills = async () => {
  return prisma.skill.findMany();
};

/**
 * Get all categories for freelancer registration
 */
const getCategories = async () => {
  return prisma.category.findMany();
};

/**
 * Add a new skill
 */
const addSkill = async (skillData: {
  name: string;
  description?: string;
  type: SkillType; // Assuming SkillType is imported or defined
  // Add other type-specific fields if necessary (e.g., videoType, programmingType)
}) => {
  try {
    // Check if skill with the same name already exists
    const existingSkill = await prisma.skill.findUnique({
      where: { name: skillData.name },
    });

    if (existingSkill) {
      throw new ApiError(httpStatus.CONFLICT, 'Skill with this name already exists');
    }

    return prisma.skill.create({
      data: skillData,
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error instanceof Error ? error.message : 'Failed to add skill',
    );
  }
};

/**
 * Add a new category
 */
const addCategory = async (categoryData: { name: string; description?: string }) => {
  try {
    // Check if category with the same name already exists
    const existingCategory = await prisma.category.findUnique({
      where: { name: categoryData.name },
    });

    if (existingCategory) {
      throw new ApiError(httpStatus.CONFLICT, 'Category with this name already exists');
    }

    return prisma.category.create({
      data: categoryData,
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error instanceof Error ? error.message : 'Failed to add category',
    );
  }
};

/**
 * Update freelancer status. If status is TERMINATED, create TerminationInformation.
 * @param id Freelancer ID
 * @param status New status
 * @param terminationDetails Details required if status is TERMINATED
 */
const updateFreelancerStatus = async (
  id: number,
  status: FreelancerStatus,
  terminationDetails?: {
    terminatedById: number;
    terminationReason?: string;
    terminationType: TerminationType;
  },
) => {
  try {
    const freelancer = await prisma.freelancer.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!freelancer) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Freelancer not found');
    }

    // If terminating, use a transaction
    if (status === FreelancerStatus.TERMINATED) {
      if (!terminationDetails) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          'Termination details (terminatedById, terminationType) are required when setting status to TERMINATED',
        );
      }

      return prisma.$transaction(async (tx) => {
        // 1. Create TerminationInformation record
        const terminationInfo = await tx.terminationInformation.create({
          data: {
            terminatedAt: new Date(),
            terminatedReason: terminationDetails.terminationReason || 'No reason provided.',
            isTerminated: true,
            terminationType: terminationDetails.terminationType,
            userId: terminationDetails.terminatedById,
          },
        });

        // 2. Update the freelancer status and link the termination info
        const updatedFreelancer = await tx.freelancer.update({
          where: { id },
          data: {
            status: FreelancerStatus.TERMINATED,
            terminationInformationId: terminationInfo.id,
          },
        });

        // 3. Update the user's status to inactive
        await tx.user.update({
          where: { id: freelancer.userId },
          data: {
            status: UserStatus.INACTIVE,
          },
        });

        return updatedFreelancer;
      });
    } else {
      // If not terminating (including un-terminating), update status and clear termination link
      // Also reactivate user if status is being changed from TERMINATED
      if (freelancer.status === FreelancerStatus.TERMINATED) {
        await prisma.user.update({
          where: { id: freelancer.userId },
          data: {
            status: UserStatus.ACTIVE,
          },
        });
      }

      return prisma.freelancer.update({
        where: { id },
        data: {
          status,
          terminationInformationId: null,
        },
      });
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error instanceof Error ? error.message : 'Failed to update freelancer status',
    );
  }
};

/**
 * Update freelancer profile
 */
const updateProfile = async (userId: number, updateProfileDto: UpdateFreelancerDto) => {
  // Find the freelancer profile
  const freelancer = await prisma.freelancer.findUnique({
    where: { userId },
  });

  if (!freelancer) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Freelancer profile not found');
  }

  // Update the freelancer profile
  const updatedFreelancer = await prisma.freelancer.update({
    where: { id: freelancer.id },
    data: {
      headline: updateProfileDto.headline,
      bio: updateProfileDto.bio,
      about: updateProfileDto.about,
      profilePhoto: updateProfileDto.profilePhoto, // Include profilePhoto
      skills: updateProfileDto.skills
        ? {
            set: [], // First disconnect all
            connect: updateProfileDto.skills.map((id: number) => ({ id: id })),
          }
        : undefined,
      categories: updateProfileDto.categories
        ? {
            set: [], // First disconnect all
            connect: updateProfileDto.categories.map((id: number) => ({ id: id })),
          }
        : undefined,
      availability: updateProfileDto.availability
        ? {
            update: {
              status: updateProfileDto.availability.status,
              availableHoursPerWeek: updateProfileDto.availability.availableHoursPerWeek,
              unavailableUntil: updateProfileDto.availability.unavailableUntil,
              notes: updateProfileDto.availability.notes,
            },
          }
        : undefined,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          middleName: true,
          role: true,
          avatar: true,
          isEmailVerified: true,
        },
      },
      skills: true,
      categories: true,
      availability: true,
    },
  });

  return updatedFreelancer;
};

const registerProfile = async (data: CreateFreelancerDto & { userId: number }) => {
  try {
    return prisma.$transaction(async (tx) => {
      return createFreelancerProfile(tx, data.userId, data);
    });
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error instanceof Error ? error.message : 'Failed to register freelancer profile',
    );
  }
};

/**
 * Helper function to create freelancer profile (reduces code duplication)
 */
const createFreelancerProfile = async (tx: any, userId: number, data: CreateFreelancerDto) => {
  // Validate skills and categories exist before connecting
  if (data.skills && data.skills.length > 0) {
    const skillIds = data.skills.map((id: number) => id);
    const existingSkills = await tx.skill.findMany({
      where: { id: { in: skillIds } },
      select: { id: true },
    });

    if (existingSkills.length !== skillIds.length) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'One or more skills do not exist');
    }
  }

  if (data.categories && data.categories.length > 0) {
    const categoryIds = data.categories.map((id: number) => id);
    const existingCategories = await tx.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true },
    });

    if (existingCategories.length !== categoryIds.length) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'One or more categories do not exist');
    }
  }

  // Create availability record
  const availability = await tx.availability.create({
    data: {
      status: data.availability?.status || AvailabilityStatus.AVAILABLE,
      availableHoursPerWeek: data.availability?.availableHoursPerWeek || 40,
      notes: data.availability?.notes || '',
    },
  });

  // Create statistics information with default values
  const statistics = await tx.statisticsInformation.create({
    data: {
      totalEarnings: 0,
      totalProjects: 0,
      totalTasks: 0,
      totalReviews: 0,
      totalRating: 0,
      totalClients: 0,
      totalJobsCompleted: 0,
      totalJobsOngoing: 0,
      totalJobsPending: 0,
      totalJobsCancelled: 0,
      totalJobsOnHold: 0,
      totalStorageUsed: 0,
    },
  });

  // Create the freelancer profile
  return tx.freelancer.create({
    data: {
      userId,
      headline: data.headline || '',
      bio: data.bio || '',
      about: data.about || '',
      profilePhoto: data.profilePhoto || '', // Include profilePhoto
      availabilityId: availability.id,
      statisticsInformationId: statistics.id,
      status: FreelancerStatus.PENDING,
      skills:
        data.skills && data.skills.length > 0
          ? {
              connect: data.skills.map((id: number) => ({ id: id })),
            }
          : undefined,
      categories:
        data.categories && data.categories.length > 0
          ? {
              connect: data.categories.map((id: number) => ({ id: id })),
            }
          : undefined,
    },
    include: {
      skills: true,
      categories: true,
      availability: true,
    },
  });
};

const getFreelancerById = async (id: number) => {
  const freelancer = await prisma.freelancer.findUnique({
    where: { id },
    include: {
      user: true,
      skills: true,
      categories: true,
      paymentInformation: true,
      portfolio: true,
      availability: true,
      statisticsInformation: true,
      workHistory: true,
      reviews: true,
      // Exclude tasks relation completely since it's causing issues with assignedById
      // tasks: true,
      timeLogs: true,
      projectTeams: {
        include: {
          project: true,
        },
      },
    },
  });

  if (!freelancer) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Freelancer not found');
  }
  return freelancer;
};

/**
 * Get all freelancers with full details
 */
const getAllFreelancers = async () => {
  return prisma.freelancer.findMany({
    include: {
      user: true,
      skills: true,
      categories: true,
      paymentInformation: true,
      portfolio: true,
      availability: true,
      statisticsInformation: true,
      reviews: true,
      timeLogs: true,
      projectTeams: {
        include: {
          project: true,
        },
      },
    },
  });
};

/**
 * Get freelancers with limited data for card view
 */
const getFreelancersForCardView = async (params: {
  page?: number;
  limit?: number;
  status?: string;
  skills?: string[];
}) => {
  const { page = 1, limit = 10, status, skills } = params;

  // Build where conditions
  const whereConditions: any = {};

  if (status) {
    whereConditions.status = status;
  }

  if (skills && skills.length > 0) {
    whereConditions.skills = {
      some: {
        name: {
          in: skills,
        },
      },
    };
  }

  // Get total count for pagination
  const total = await prisma.freelancer.count({
    where: whereConditions,
  });

  // Get freelancers with pagination
  const freelancers = await prisma.freelancer.findMany({
    where: whereConditions,
    select: {
      id: true,
      profilePhoto: true,
      headline: true,
      bio: true,
      rank: true,
      status: true,
      createdAt: true,
      featuredFreelancer: true,
      availability: {
        select: {
          status: true,
        },
      },
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      skills: {
        select: {
          name: true,
        },
      },
      categories: {
        select: {
          name: true,
        },
      },
      statisticsInformation: {
        select: {
          totalRating: true,
          totalProjects: true,
        },
      },
    },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: {
      statisticsInformation: {
        totalRating: 'desc',
      },
    },
  });

  return {
    freelancers,
    total,
    page,
    limit,
  };
};

/**
 * Search freelancers with comprehensive filtering options
 */
const searchFreelancers = async (filters: {
  skills?: SkillType[];
  categories?: number[];
  status?: FreelancerStatus;
  minRate?: number;
  maxRate?: number;
  availability?: string;
  minHoursPerWeek?: number;
  maxHoursPerWeek?: number;
  keyword?: string;
  name?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}) => {
  try {
    const whereConditions: any[] = [];

    // Filter by skills
    if (filters.skills && filters.skills.length > 0) {
      whereConditions.push({ skills: { some: { type: { in: filters.skills } } } });
    }

    // Filter by categories
    if (filters.categories && filters.categories.length > 0) {
      whereConditions.push({
        categories: {
          some: {
            id: { in: filters.categories },
          },
        },
      });
    }

    // Filter by status
    if (filters.status) {
      whereConditions.push({ status: filters.status });
    }

    // Filter by payment rate
    if (filters.minRate) {
      whereConditions.push({
        paymentInformation: {
          some: { paymentAmount: { gte: filters.minRate } },
        },
      });
    }

    if (filters.maxRate) {
      whereConditions.push({
        paymentInformation: {
          some: { paymentAmount: { lte: filters.maxRate } },
        },
      });
    }

    // Filter by availability status
    if (filters.availability) {
      whereConditions.push({
        availability: {
          status: filters.availability,
        },
      });
    }

    // Filter by hours per week
    if (filters.minHoursPerWeek) {
      whereConditions.push({
        availability: {
          availableHoursPerWeek: { gte: filters.minHoursPerWeek },
        },
      });
    }

    if (filters.maxHoursPerWeek) {
      whereConditions.push({
        availability: {
          availableHoursPerWeek: { lte: filters.maxHoursPerWeek },
        },
      });
    }

    // Search by name (first name, last name, or full name)
    if (filters.name) {
      whereConditions.push({
        user: {
          OR: [
            { firstName: { contains: filters.name, mode: 'insensitive' } },
            { lastName: { contains: filters.name, mode: 'insensitive' } },
            {
              AND: [
                { firstName: { contains: filters.name.split(' ')[0], mode: 'insensitive' } },
                { lastName: { contains: filters.name.split(' ')[1] || '', mode: 'insensitive' } },
              ],
            },
          ],
        },
      });
    }

    // Keyword search across multiple fields
    if (filters.keyword) {
      whereConditions.push({
        OR: [
          { headline: { contains: filters.keyword, mode: 'insensitive' } },
          { bio: { contains: filters.keyword, mode: 'insensitive' } },
          { about: { contains: filters.keyword, mode: 'insensitive' } },
          {
            user: {
              OR: [
                { firstName: { contains: filters.keyword, mode: 'insensitive' } },
                { lastName: { contains: filters.keyword, mode: 'insensitive' } },
                { email: { contains: filters.keyword, mode: 'insensitive' } },
              ],
            },
          },
        ],
      });
    }

    // Prepare sorting options
    const orderBy: any = {};
    if (filters.sortBy) {
      // Handle nested fields
      if (filters.sortBy.includes('.')) {
        const [relation, field] = filters.sortBy.split('.');
        orderBy[relation] = { [field]: filters.sortOrder || 'asc' };
      } else {
        orderBy[filters.sortBy] = filters.sortOrder || 'asc';
      }
    } else {
      // Default sorting
      orderBy.createdAt = 'desc';
    }

    // Execute query with pagination
    const freelancers = await prisma.freelancer.findMany({
      where: whereConditions.length > 0 ? { AND: whereConditions } : {},
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            middleName: true,
            role: true,
            avatar: true,
            isEmailVerified: true,
          },
        },
        skills: true,
        categories: true,
        statisticsInformation: true,
        availability: true,
        reviews: true,
        paymentInformation: true,
      },
      orderBy,
      skip: filters.offset || 0,
      take: filters.limit || 50,
    });

    // Get total count for pagination
    const totalCount = await prisma.freelancer.count({
      where: whereConditions.length > 0 ? { AND: whereConditions } : {},
    });

    return {
      freelancers,
      pagination: {
        total: totalCount,
        limit: filters.limit || 50,
        offset: filters.offset || 0,
      },
    };
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error instanceof Error ? error.message : 'Failed to search freelancers',
    );
  }
};

const searchFreelancersForClientDashboard = async (
  clientId: number,
  filters: {
    skills?: SkillType[];
    categories?: number[];
    status?: FreelancerStatus;
    minRate?: number;
    maxRate?: number;
    availability?: string;
    minHoursPerWeek?: number;
    maxHoursPerWeek?: number;
    keyword?: string;
    name?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  },
) => {
  // Get initial search results
  const searchResult = await searchFreelancers(filters);

  if (!searchResult || searchResult.freelancers.length === 0) {
    return searchResult; // Return empty or original result if no freelancers found
  }

  // Get freelancers hired by the client
  const hiredByClient = await hireService.getMyFreelancers(clientId);
  const hiredFreelancerIds = new Set(hiredByClient.map((hire) => hire.freelancerId));

  // Augment freelancer data with isHiredByYou flag
  const augmentedFreelancers = searchResult.freelancers.map((freelancer) => ({
    ...freelancer,
    isHiredByYou: hiredFreelancerIds.has(freelancer.id),
  }));

  return {
    ...searchResult,
    freelancers: augmentedFreelancers,
  };
};

// --- Work History ---

/**
 * Add a work history entry for a freelancer
 */
const addWorkHistory = async (freelancerId: number, data: CreateWorkHistoryDto) => {
  // Ensure freelancer exists
  const freelancer = await prisma.freelancer.findUnique({ where: { id: freelancerId } });
  if (!freelancer) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Freelancer not found');
  }

  return prisma.workHistory.create({
    data: {
      ...data,
      freelancerId, // Connect to the freelancer
    },
  });
};

/**
 * Get all work history entries for a specific freelancer
 */
const getWorkHistoryByFreelancerId = async (freelancerId: number) => {
  // Ensure freelancer exists (optional, depends if you want to return empty or error)
  const freelancer = await prisma.freelancer.findUnique({ where: { id: freelancerId } });
  if (!freelancer) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Freelancer not found');
  }

  return prisma.workHistory.findMany({
    where: { freelancerId },
    orderBy: { startDate: 'desc' }, // Example sorting
  });
};

/**
 * Update a specific work history entry
 */
const updateWorkHistory = async (workHistoryId: number, data: UpdateWorkHistoryDto) => {
  // Ensure work history entry exists
  const workHistory = await prisma.workHistory.findUnique({ where: { id: workHistoryId } });
  if (!workHistory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Work history entry not found');
  }

  return prisma.workHistory.update({
    where: { id: workHistoryId },
    data,
  });
};

/**
 * Delete a specific work history entry
 */
const deleteWorkHistory = async (workHistoryId: number) => {
  // Ensure work history entry exists
  const workHistory = await prisma.workHistory.findUnique({ where: { id: workHistoryId } });
  if (!workHistory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Work history entry not found');
  }

  await prisma.workHistory.delete({
    where: { id: workHistoryId },
  });
  // Return success or the deleted item id, depending on preference
  return { message: 'Work history deleted successfully' };
};

/**
 * Add a portfolio item for a freelancer
 */
const addPortfolioItem = async (freelancerId: number, data: CreatePortfolioItemDto) => {
  // Ensure freelancer exists
  const freelancer = await prisma.freelancer.findUnique({ where: { id: freelancerId } });
  if (!freelancer) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Freelancer not found');
  }

  return prisma.portfolioItem.create({
    data: {
      ...data,
      freelancerId, // Connect to the freelancer
    },
  });
};

/**
 * Get all portfolio items for a specific freelancer
 */
const getPortfolioItemsByFreelancerId = async (freelancerId: number) => {
  // Ensure freelancer exists (optional)
  const freelancer = await prisma.freelancer.findUnique({ where: { id: freelancerId } });
  if (!freelancer) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Freelancer not found');
  }

  return prisma.portfolioItem.findMany({
    where: { freelancerId },
    orderBy: { id: 'desc' }, // Example sorting
  });
};

/**
 * Update a specific portfolio item
 */
const updatePortfolioItem = async (portfolioItemId: number, data: UpdatePortfolioItemDto) => {
  // Ensure portfolio item exists
  const portfolioItem = await prisma.portfolioItem.findUnique({ where: { id: portfolioItemId } });
  if (!portfolioItem) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Portfolio item not found');
  }

  return prisma.portfolioItem.update({
    where: { id: portfolioItemId },
    data,
  });
};

/**
 * Delete a specific portfolio item
 */
const deletePortfolioItem = async (portfolioItemId: number) => {
  // Ensure portfolio item exists
  const portfolioItem = await prisma.portfolioItem.findUnique({ where: { id: portfolioItemId } });
  if (!portfolioItem) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Portfolio item not found');
  }

  await prisma.portfolioItem.delete({
    where: { id: portfolioItemId },
  });
  return { message: 'Portfolio item deleted successfully' };
};
/**
 * Add a review for a freelancer
 */
const addFreelancerReview = async (reviewData: {
  rating: number;
  reviewText?: string;
  comment?: string;
  freelancerId: number;
  clientId: number;
  reviewerId: number;
  projectId?: number;
}) => {
  try {
    // Ensure freelancer exists
    const freelancer = await prisma.freelancer.findUnique({
      where: { id: reviewData.freelancerId },
    });

    if (!freelancer) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Freelancer not found');
    }

    // Ensure client exists
    const client = await prisma.client.findUnique({
      where: { id: reviewData.clientId },
    });

    if (!client) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Client not found');
    }

    // Ensure reviewer exists
    const reviewer = await prisma.user.findUnique({
      where: { id: reviewData.reviewerId },
    });

    if (!reviewer) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Reviewer not found');
    }

    // If projectId is provided, ensure project exists
    if (reviewData.projectId) {
      const project = await prisma.project.findUnique({
        where: { id: reviewData.projectId },
      });

      if (!project) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Project not found');
      }
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        rating: reviewData.rating,
        reviewText: reviewData.reviewText,
        comment: reviewData.comment,
        freelancer: { connect: { id: reviewData.freelancerId } },
        client: { connect: { id: reviewData.clientId } },
        reviewer: { connect: { id: reviewData.reviewerId } },
        project: reviewData.projectId ? { connect: { id: reviewData.projectId } } : undefined,
      },
    });

    // Update the freelancer's statistics
    await updateFreelancerRatingStatistics(reviewData.freelancerId);

    return review;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error instanceof Error ? error.message : 'Failed to add freelancer review',
    );
  }
};

/**
 * Get all reviews for a specific freelancer
 */
const getFreelancerReviews = async (freelancerId: number) => {
  // Ensure freelancer exists
  const freelancer = await prisma.freelancer.findUnique({
    where: { id: freelancerId },
  });

  if (!freelancer) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Freelancer not found');
  }

  return prisma.review.findMany({
    where: { freelancerId },
    include: {
      reviewer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
      client: {
        select: {
          id: true,
          companyName: true,
        },
      },
      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Update a specific review
 */
const updateFreelancerReview = async (
  reviewId: number,
  updateData: {
    rating?: number;
    reviewText?: string;
    comment?: string;
  },
) => {
  // Ensure review exists
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Review not found');
  }

  const updatedReview = await prisma.review.update({
    where: { id: reviewId },
    data: updateData,
  });

  // If rating was updated, update the freelancer's statistics
  if (updateData.rating !== undefined && review.freelancerId) {
    await updateFreelancerRatingStatistics(review.freelancerId);
  }

  return updatedReview;
};

/**
 * Delete a specific review
 */
const deleteFreelancerReview = async (reviewId: number) => {
  // Ensure review exists
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Review not found');
  }

  // Store freelancerId before deleting the review
  const freelancerId = review.freelancerId;

  await prisma.review.delete({
    where: { id: reviewId },
  });

  // Update the freelancer's statistics if the review was for a freelancer
  if (freelancerId) {
    await updateFreelancerRatingStatistics(freelancerId);
  }

  return { message: 'Review deleted successfully' };
};

/**
 * Helper function to update a freelancer's rating statistics
 */
const updateFreelancerRatingStatistics = async (freelancerId: number) => {
  // Get all reviews for the freelancer
  const reviews = await prisma.review.findMany({
    where: { freelancerId },
    select: { rating: true },
  });

  // Calculate new statistics
  const totalReviews = reviews.length;
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

  // Update the freelancer's statistics
  await prisma.statisticsInformation.update({
    where: {
      id: (
        await prisma.freelancer.findUnique({
          where: { id: freelancerId },
          select: { statisticsInformationId: true },
        })
      )?.statisticsInformationId,
    },
    data: {
      totalReviews,
      totalRating: Math.round(averageRating * 100) / 100, // Round to 2 decimal places
    },
  });
};

/**
 * Get featured freelancers with pagination and random ordering
 */
const getFeaturedFreelancers = async (page: number = 1, size: number = 10) => {
  try {
    // First get total count of featured freelancers
    const totalCount = await prisma.freelancer.count({
      where: {
        featuredFreelancer: true,
      },
    });

    // Get all featured freelancers with random ordering
    const freelancers = await prisma.freelancer.findMany({
      where: {
        featuredFreelancer: true,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        skills: true,
        categories: true,
        availability: true,
        statisticsInformation: true,
      },
      orderBy: [
        {
          createdAt: 'desc',
        },
      ],
      skip: (page - 1) * size,
      take: size,
    });

    // Shuffle the results for randomness
    const shuffledFreelancers = freelancers.sort(() => Math.random() - 0.5);

    return {
      data: shuffledFreelancers,
      pagination: {
        total: totalCount,
        page,
        size,
        totalPages: Math.ceil(totalCount / size),
      },
    };
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error instanceof Error ? error.message : 'Failed to get featured freelancers',
    );
  }
};

/**
 * Toggle featured status for a freelancer
 */
const toggleFeaturedStatus = async (freelancerId: number, featured: boolean) => {
  try {
    // Check if freelancer exists
    const existingFreelancer = await prisma.freelancer.findUnique({
      where: { id: freelancerId },
    });

    if (!existingFreelancer) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Freelancer not found');
    }

    // Update featured status
    const updatedFreelancer = await prisma.freelancer.update({
      where: { id: freelancerId },
      data: {
        featuredFreelancer: featured,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        skills: true,
        categories: true,
        availability: true,
        statisticsInformation: true,
      },
    });

    return updatedFreelancer;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error instanceof Error ? error.message : 'Failed to update featured status',
    );
  }
};

/**
 * Delete a freelancer and all related records
 */
const deleteFreelancer = async (freelancerId: number) => {
  try {
    // Get the freelancer to check if exists and get userId
    const freelancer = await prisma.freelancer.findUnique({
      where: { id: freelancerId },
      include: {
        user: true,
      },
    });

    if (!freelancer) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Freelancer not found');
    }

    // Use a transaction to ensure all related records are deleted
    return prisma.$transaction(async (tx) => {
      // Delete all related records first
      await tx.workHistory.deleteMany({
        where: { freelancerId },
      });

      await tx.portfolioItem.deleteMany({
        where: { freelancerId },
      });

      await tx.certification.deleteMany({
        where: { freelancerId },
      });

      await tx.review.deleteMany({
        where: { freelancerId },
      });

      await tx.timeLog.deleteMany({
        where: { freelancerId },
      });

      await tx.paymentInformation.deleteMany({
        where: { freelancerId },
      });

      // Disconnect the freelancer from any project teams, don't delete the team
      const projectTeams = await tx.projectTeam.findMany({
        where: { freelancers: { some: { id: freelancerId } } },
        select: { id: true },
      });

      for (const team of projectTeams) {
        await tx.projectTeam.update({
          where: { id: team.id },
          data: {
            freelancers: {
              disconnect: { id: freelancerId },
            },
          },
        });
      }

      // Delete the freelancer record itself first to resolve foreign key constraints
      await tx.freelancer.delete({
        where: { id: freelancerId },
      });

      if (freelancer.availabilityId) {
        await tx.availability.delete({
          where: { id: freelancer.availabilityId },
        });
      }

      if (freelancer.statisticsInformationId) {
        await tx.statisticsInformation.delete({
          where: { id: freelancer.statisticsInformationId },
        });
      }

      if (freelancer.terminationInformationId) {
        await tx.terminationInformation.delete({
          where: { id: freelancer.terminationInformationId },
        });
      }

      // Delete user preferences before deleting the user
      await tx.userPreferences.deleteMany({
        where: { userId: freelancer.userId },
      });

      // Delete notification preferences before deleting the user
      await tx.notificationPreferences.deleteMany({
        where: { userId: freelancer.userId },
      });

      // Finally delete the user
      await tx.user.delete({
        where: { id: freelancer.userId },
      });

      return { message: 'Freelancer and all related records deleted successfully' };
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error instanceof Error ? error.message : 'Failed to delete freelancer',
    );
  }
};

/**
 * Get freelancer by user ID
 * @param userId
 * @returns
 */
const getFreelancerByUserId = async (userId: number) => {
  return prisma.freelancer.findUnique({
    where: { userId },
    include: {
      user: true,
    },
  });
};

export default {
  register,
  registerProfile,
  getSkills,
  getCategories,
  addSkill,
  addCategory,
  updateProfile,
  updateFreelancerStatus,
  getFreelancerByUserId,
  getFreelancerById,
  getAllFreelancers,
  getFreelancersForCardView,
  searchFreelancers,
  getFeaturedFreelancers,
  toggleFeaturedStatus,
  // Work History
  addWorkHistory,
  getWorkHistoryByFreelancerId,
  updateWorkHistory,
  deleteWorkHistory,
  // Portfolio Items
  addPortfolioItem,
  getPortfolioItemsByFreelancerId,
  updatePortfolioItem,
  deletePortfolioItem,
  // Reviews
  addFreelancerReview,
  getFreelancerReviews,
  updateFreelancerReview,
  deleteFreelancerReview,
  searchFreelancersForClientDashboard,
  deleteFreelancer,
};
