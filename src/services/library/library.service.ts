import httpStatus from 'http-status';
import { BadRequestException, NotFoundException } from '../../exceptions';
import {
  LibAttachmentType,
  LibDifficultyLevel,
  LibraryResource,
  LibReactionType,
  LibResourceStatus,
  Prisma,
  PrismaClient,
} from '../../generated/prisma';
import ApiError from '../../utils/ApiError';

export interface AttachmentInput {
  name: string;
  url: string;
  type: LibAttachmentType;
  description?: string;
}

export interface CreateLibraryResourceDto {
  title: string;
  description: string;
  content: string;
  keyPoints?: string;
  difficulty?: LibDifficultyLevel;
  duration?: number;
  categoryId: string;
  thumbnailUrl?: string;
  authorId: number;
  status?: LibResourceStatus;
  publishedAt?: Date;
  attachments?: AttachmentInput[];
}

export interface UpdateLibraryResourceDto
  extends Omit<Partial<CreateLibraryResourceDto>, 'authorId'> {
  status?: LibResourceStatus;
  allowComments?: boolean;
}

export class LibraryService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // Create a new library resource (Admin only)
  async createResource(dto: CreateLibraryResourceDto): Promise<LibraryResource> {
    const { attachments, ...resourceData } = dto;

    try {
      return await this.prisma.$transaction(async (prisma) => {
        const resource = await prisma.libraryResource.create({
          data: {
            ...resourceData,
          },
        });

        if (attachments && attachments.length > 0) {
          const attachmentData = attachments.map((att) => ({
            ...att,
            resourceId: resource.id,
          }));
          await prisma.libraryAttachment.createMany({
            data: attachmentData,
          });
        }
        // Note: The created attachments are not included in the returned 'resource' object by default with createMany.
        // If they need to be returned, a subsequent fetch or a different creation strategy would be needed.
        // For now, returning the resource as created.
        return resource;
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          // This could be for the resource title or if attachments have unique constraints breached by createMany (unlikely here)
          throw new BadRequestException(
            'Resource with this title already exists or unique constraint failed.',
          );
        }
        if (error.code === 'P2003') {
          // Foreign key constraint failed (e.g., categoryId, authorId)
          throw new BadRequestException(
            'Invalid category or author ID, or other foreign key constraint failed.',
          );
        }
      }
      throw error;
    }
  }

  // Get all published resources (Freelancers & Admin)
  async getPublishedResources(
    page = 1,
    limit = 10,
    filters?: {
      categoryId?: string;
      difficulty?: LibDifficultyLevel;
      search?: string;
    },
  ) {
    const skip = (page - 1) * limit;
    const where: Prisma.LibraryResourceWhereInput = {
      status: LibResourceStatus.PUBLISHED,
      publishedAt: { not: null },
      ...(filters?.categoryId && { categoryId: filters.categoryId }),
      ...(filters?.difficulty && { difficulty: filters.difficulty }),
      ...(filters?.search && {
        OR: [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
          { content: { contains: filters.search, mode: 'insensitive' } },
          { keyPoints: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [resources, total] = await Promise.all([
      this.prisma.libraryResource.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          category: true,
          comments: {
            take: 3, // Get 3 most recent comments
            orderBy: {
              createdAt: 'desc',
            },
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
              replies: {
                take: 2, // Get 2 most recent replies per comment
                orderBy: {
                  createdAt: 'desc',
                },
                include: {
                  user: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                    },
                  },
                  reactions: true,
                },
              },
              reactions: true,
              _count: {
                select: {
                  replies: true,
                  reactions: true,
                },
              },
            },
          },
          _count: {
            select: {
              comments: true,
              favorites: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
      }),
      this.prisma.libraryResource.count({ where }),
    ]);

    // Transform the response to include reaction counts
    const transformedResources = resources.map((resource) => ({
      ...resource,
      comments: resource.comments.map((comment) => ({
        ...comment,
        reactionCounts: this.groupReactionsByType(comment.reactions),
        replies: comment.replies.map((reply) => ({
          ...reply,
          reactionCounts: this.groupReactionsByType(reply.reactions),
        })),
      })),
    }));

    return {
      resources: transformedResources,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    };
  }

  private groupReactionsByType(reactions: { type: LibReactionType }[]) {
    return reactions.reduce((acc, reaction) => {
      acc[reaction.type] = (acc[reaction.type] || 0) + 1;
      return acc;
    }, {} as Record<LibReactionType, number>);
  }

  // Get resource by ID with all details
  async getResourceById(
    id: string,
    userId?: number,
    params?: {
      search?: string;
      includeContent?: boolean;
    },
  ) {
    try {
      const select = {
        // Basic fields
        id: true,
        title: true,
        description: true,
        keyPoints: true,
        difficulty: true,
        duration: true,
        categoryId: true,
        thumbnailUrl: true,
        status: true,
        publishedAt: true,
        views: true,
        content: params?.includeContent !== false,
        authorId: true,
        allowComments: true,
        createdAt: true,
        updatedAt: true,

        // Author information
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },

        // Category information
        category: {
          select: {
            id: true,
            name: true,
            description: true,
            color: true,
          },
        },

        // Sections with full details
        sections: {
          select: {
            id: true,
            title: true,
            content: true,
            order: true,
            imageUrl: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            order: 'asc' as Prisma.SortOrder,
          },
        },

        // Attachments with full details
        attachments: {
          select: {
            id: true,
            name: true,
            description: true,
            url: true,
            type: true,
            size: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            createdAt: 'desc' as Prisma.SortOrder,
          },
        },

        // Comments with nested replies and reactions
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            updatedAt: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
            replies: {
              select: {
                id: true,
                content: true,
                createdAt: true,
                updatedAt: true,
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                  },
                },
                reactions: {
                  select: {
                    id: true,
                    type: true,
                    userId: true,
                    createdAt: true,
                  },
                },
                _count: {
                  select: {
                    reactions: true,
                  },
                },
              },
              orderBy: {
                createdAt: 'desc' as Prisma.SortOrder,
              },
            },
            reactions: {
              select: {
                id: true,
                type: true,
                userId: true,
                createdAt: true,
              },
            },
            _count: {
              select: {
                replies: true,
                reactions: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc' as Prisma.SortOrder,
          },
        },

        // Related resources
        relatedTo: {
          select: {
            relatedTo: {
              select: {
                id: true,
                title: true,
                description: true,
                thumbnailUrl: true,
                difficulty: true,
                duration: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },

        relatedFrom: {
          select: {
            resource: {
              select: {
                id: true,
                title: true,
                description: true,
                thumbnailUrl: true,
                difficulty: true,
                duration: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },

        // Counts
        _count: {
          select: {
            comments: true,
            favorites: true,
            pins: true,
            attachments: true,
            sections: true,
            certificates: true,
          },
        },

        // User-specific information if userId is provided
        ...(userId && {
          // Progress
          progress: {
            where: { userId },
            select: {
              percentage: true,
              completed: true,
              lastAccessed: true,
              completedAt: true,
            },
          },
          // Favorites
          favorites: {
            where: { userId },
            select: {
              id: true,
              createdAt: true,
            },
          },
          // Pins
          pins: {
            where: { userId },
            select: {
              id: true,
              createdAt: true,
            },
          },
          // Certificates
          certificates: {
            where: { userId },
            select: {
              id: true,
              title: true,
              imageUrl: true,
              issuedAt: true,
            },
          },
        }),
      } as const;

      const resource = await this.prisma.libraryResource.findUnique({
        where: {
          id,
          ...(params?.search && {
            OR: [
              { title: { contains: params.search, mode: 'insensitive' } },
              { description: { contains: params.search, mode: 'insensitive' } },
              { content: { contains: params.search, mode: 'insensitive' } },
            ],
          }),
        },
        select,
      });

      if (!resource) {
        throw new NotFoundException('Resource not found');
      }

      type ResourceWithRelations = typeof resource & {
        comments?: Array<{
          reactions: Array<{ type: LibReactionType }>;
          replies: Array<{
            reactions: Array<{ type: LibReactionType }>;
          }>;
        }>;
        relatedTo?: Array<{ relatedTo: any }>;
        relatedFrom?: Array<{ resource: any }>;
      };

      const typedResource = resource as ResourceWithRelations;

      // Transform the response to include reaction counts for comments and replies
      const transformedResource = {
        ...typedResource,
        comments: (typedResource.comments || []).map((comment) => ({
          ...comment,
          reactionCounts: this.groupReactionsByType(comment.reactions),
          replies: (comment.replies || []).map((reply) => ({
            ...reply,
            reactionCounts: this.groupReactionsByType(reply.reactions),
          })),
        })),
        // Combine related resources from both directions
        relatedResources: [
          ...(typedResource.relatedTo || []).map((r) => r.relatedTo),
          ...(typedResource.relatedFrom || []).map((r) => r.resource),
        ],
      };

      // Increment views
      await this.prisma.libraryResource.update({
        where: { id },
        data: { views: { increment: 1 } },
      });

      return transformedResource;
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Log the Prisma error for debugging if needed
        // console.error('Prisma Error in getResourceById:', error);
        // P2023: Inconsistent column data (e.g. invalid ID format for CUID)
        // P2025: Record not found (though NotFoundException should catch this if Prisma returns null)
        if (error.code === 'P2023' || error.message.includes('Malformed ObjectID')) {
          throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid resource ID format.');
        }
        // For other Prisma known errors that aren't explicitly a "not found" that we handle later
        throw new ApiError(
          httpStatus.INTERNAL_SERVER_ERROR,
          'Could not retrieve resource due to a database error.',
        );
      }
      if (error instanceof NotFoundException) {
        throw new ApiError(httpStatus.NOT_FOUND, error.message);
      }
      // Handle other custom exceptions or rethrow if necessary
      if (error instanceof ApiError) {
        throw error;
      }
      // Fallback for unexpected errors
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'An unexpected error occurred while retrieving the resource.',
      );
    }
  }

  // Update resource (Admin only)
  async updateResource(id: string, dto: UpdateLibraryResourceDto): Promise<LibraryResource> {
    const resource = await this.prisma.libraryResource.findUnique({ where: { id } });
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    const { attachments, ...resourceDataToUpdate } = dto;

    // Prepare the data for updating the LibraryResource itself
    const prismaUpdateData: Prisma.LibraryResourceUpdateInput = {
      ...resourceDataToUpdate, // Contains all fields from dto except 'attachments'
    };

    // If the DTO specifies the status as PUBLISHED, set/update publishedAt
    // This uses resourceDataToUpdate.status, which is dto.status if status was in the dto
    if (resourceDataToUpdate.status === LibResourceStatus.PUBLISHED) {
      prismaUpdateData.publishedAt = new Date();
    }

    // Check if 'attachments' was explicitly passed in the DTO
    // (undefined means don't touch, empty array means remove all)
    if (attachments !== undefined) {
      return await this.prisma.$transaction(async (tx) => {
        // 1. Update the resource itself
        const updatedResource = await tx.libraryResource.update({
          where: { id },
          data: prismaUpdateData,
        });

        // 2. Delete all existing attachments for this resource
        await tx.libraryAttachment.deleteMany({
          where: { resourceId: id },
        });

        // 3. If new attachments are provided (and the array is not empty), create them
        if (attachments.length > 0) {
          const newAttachmentData = attachments.map((att) => ({
            name: att.name,
            url: att.url,
            type: att.type,
            description: att.description,
            resourceId: id, // Link to the parent resource
          }));
          await tx.libraryAttachment.createMany({
            data: newAttachmentData,
          });
        }

        // The 'updatedResource' object from this step does not include attachments by default.
        // The method returns Promise<LibraryResource>, consistent with this.
        return updatedResource;
      });
    } else {
      // 'attachments' was not in the DTO, so only update the resource fields
      return await this.prisma.libraryResource.update({
        where: { id },
        data: prismaUpdateData,
      });
    }
  }

  // Delete resource (Admin only)
  async deleteResource(id: string): Promise<void> {
    const resource = await this.prisma.libraryResource.findUnique({ where: { id } });
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    await this.prisma.libraryResource.delete({ where: { id } });
  }

  // Track progress for a user
  async updateProgress(userId: number, resourceId: string, newPercentage: number) {
    const resource = await this.prisma.libraryResource.findUnique({
      where: { id: resourceId },
      select: {
        id: true,
        title: true,
      },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    // Get existing progress
    const existingProgress = await this.prisma.libraryProgress.findUnique({
      where: {
        userId_resourceId: { userId, resourceId },
      },
    });

    // Calculate new cumulative percentage
    let finalPercentage = newPercentage;
    if (existingProgress) {
      finalPercentage = Math.min(100, existingProgress.percentage + newPercentage);
    }

    const completed = finalPercentage >= 100;
    const now = new Date();

    // Start a transaction to handle both progress update and certificate creation
    return await this.prisma.$transaction(async (prisma) => {
      // Update or create progress
      const progress = await prisma.libraryProgress.upsert({
        where: {
          userId_resourceId: { userId, resourceId },
        },
        create: {
          userId,
          resourceId,
          percentage: finalPercentage,
          completed,
          completedAt: completed ? now : null,
        },
        update: {
          percentage: finalPercentage,
          completed,
          completedAt: completed ? now : null,
          lastAccessed: now,
        },
      });

      // If progress is completed (100%), automatically create certificate if it doesn't exist
      if (completed) {
        const existingCertificate = await prisma.libraryCertificate.findUnique({
          where: {
            userId_resourceId: { userId, resourceId },
          },
        });

        if (!existingCertificate) {
          await prisma.libraryCertificate.create({
            data: {
              userId,
              resourceId,
              title: `Certificate of Completion - ${resource.title}`,
              issuedAt: now,
            },
          });
        }
      }

      return progress;
    });
  }

  // Toggle favorite status
  async toggleFavorite(userId: number, resourceId: string): Promise<boolean> {
    const favorite = await this.prisma.libraryFavorite.findUnique({
      where: {
        userId_resourceId: { userId, resourceId },
      },
    });

    if (favorite) {
      await this.prisma.libraryFavorite.delete({
        where: { id: favorite.id },
      });
      return false;
    } else {
      await this.prisma.libraryFavorite.create({
        data: { userId, resourceId },
      });
      return true;
    }
  }

  // Get user's learning progress
  async getUserProgress(
    userId: number,
    page = 1,
    limit = 10,
    filters?: {
      search?: string;
      status?: LibResourceStatus;
    },
  ) {
    const skip = (page - 1) * limit;
    const where: Prisma.LibraryProgressWhereInput = {
      userId,
      resource: {
        ...(filters?.status && { status: filters.status }),
        ...(filters?.search && {
          OR: [
            { title: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } },
          ],
        }),
      },
    };

    const [progress, total] = await Promise.all([
      this.prisma.libraryProgress.findMany({
        where,
        include: {
          resource: {
            select: {
              id: true,
              title: true,
              thumbnailUrl: true,
              difficulty: true,
              status: true,
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { lastAccessed: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.libraryProgress.count({ where }),
    ]);

    return {
      progress,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    };
  }

  // Get all resources (Admin only)
  async getAllResources(
    page = 1,
    limit = 10,
    filters?: {
      categoryId?: string;
      difficulty?: LibDifficultyLevel;
      status?: LibResourceStatus;
      search?: string;
    },
  ) {
    const skip = (page - 1) * limit;
    const where: Prisma.LibraryResourceWhereInput = {
      ...(filters?.categoryId && { categoryId: filters.categoryId }),
      ...(filters?.difficulty && { difficulty: filters.difficulty }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.search && {
        OR: [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
          { content: { contains: filters.search, mode: 'insensitive' } },
          { keyPoints: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [resources, total] = await Promise.all([
      this.prisma.libraryResource.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          category: true,
          _count: {
            select: {
              comments: true,
              favorites: true,
              attachments: true,
              sections: true,
            },
          },
        },
        orderBy: [{ status: 'asc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.libraryResource.count({ where }),
    ]);

    return {
      resources,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    };
  }
}
