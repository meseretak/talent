import { BadRequestException, NotFoundException } from '../../exceptions';
import { LibraryComment, LibReactionType, Prisma, PrismaClient } from '../../generated/prisma';

export interface CreateCommentDto {
  content: string;
  resourceId: string;
  userId: number;
  commentId?: string; // For replies
}

export interface UpdateCommentDto {
  content: string;
}

export class LibraryCommentService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // Create a new comment or reply
  async createComment(dto: CreateCommentDto): Promise<LibraryComment | any> {
    try {
      // If commentId is provided, create a reply instead of a comment
      if (dto.commentId) {
        const parentComment = await this.prisma.libraryComment.findUnique({
          where: { id: dto.commentId },
        });

        if (!parentComment) {
          throw new NotFoundException('Parent comment not found');
        }

        return await this.prisma.libraryReply.create({
          data: {
            content: dto.content,
            userId: dto.userId,
            commentId: dto.commentId,
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
        });
      }

      // Create a top-level comment
      const resource = await this.prisma.libraryResource.findUnique({
        where: { id: dto.resourceId },
      });

      if (!resource) {
        throw new NotFoundException('Resource not found');
      }

      return await this.prisma.libraryComment.create({
        data: {
          content: dto.content,
          resourceId: dto.resourceId,
          userId: dto.userId,
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
          _count: {
            select: {
              replies: true,
              reactions: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new BadRequestException('Invalid resource or user ID');
        }
      }
      throw error;
    }
  }

  // Get comments for a resource
  async getResourceComments(resourceId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      this.prisma.libraryComment.findMany({
        where: { resourceId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          replies: {
            take: 2,
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
              _count: {
                select: {
                  reactions: true,
                },
              },
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
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.libraryComment.count({
        where: { resourceId },
      }),
    ]);

    return {
      comments,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    };
  }

  // Update a comment
  async updateComment(id: string, userId: number, dto: UpdateCommentDto): Promise<LibraryComment> {
    const comment = await this.prisma.libraryComment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new BadRequestException('You can only edit your own comments');
    }

    return await this.prisma.libraryComment.update({
      where: { id },
      data: dto,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
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
    });
  }

  // Delete a comment
  async deleteComment(id: string, userId: number): Promise<void> {
    const comment = await this.prisma.libraryComment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new BadRequestException('You can only delete your own comments');
    }

    await this.prisma.libraryComment.delete({ where: { id } });
  }

  // Toggle reaction on a comment
  async toggleReaction(commentId: string, userId: number, type: LibReactionType): Promise<boolean> {
    const comment = await this.prisma.libraryComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const existingReaction = await this.prisma.libraryReaction.findUnique({
      where: {
        userId_commentId_type: {
          userId,
          commentId,
          type,
        },
      },
    });

    if (existingReaction) {
      await this.prisma.libraryReaction.delete({
        where: { id: existingReaction.id },
      });
      return false;
    } else {
      await this.prisma.libraryReaction.create({
        data: {
          userId,
          commentId,
          type,
        },
      });
      return true;
    }
  }
}
