import { BadRequestException, NotFoundException } from '../../exceptions';
import { LibReactionType, PrismaClient } from '../../generated/prisma';

export class LibraryEngagementService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // Pin/Unpin a library resource
  async togglePin(userId: number, resourceId: string): Promise<boolean> {
    const resource = await this.prisma.libraryResource.findUnique({
      where: { id: resourceId },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    const existingPin = await this.prisma.libraryPin.findUnique({
      where: {
        userId_resourceId: { userId, resourceId },
      },
    });

    if (existingPin) {
      await this.prisma.libraryPin.delete({
        where: { id: existingPin.id },
      });
      return false;
    } else {
      await this.prisma.libraryPin.create({
        data: { userId, resourceId },
      });
      return true;
    }
  }

  // Get user's pinned resources
  async getUserPins(userId: number, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where = { userId };

    const [pins, total] = await Promise.all([
      this.prisma.libraryPin.findMany({
        where,
        include: {
          resource: {
            select: {
              id: true,
              title: true,
              description: true,
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
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.libraryPin.count({ where }),
    ]);

    return {
      pins,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    };
  }

  // Get user's certificates
  async getUserCertificates(userId: number, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where = { userId };

    const [certificates, total] = await Promise.all([
      this.prisma.libraryCertificate.findMany({
        where,
        include: {
          resource: {
            select: {
              id: true,
              title: true,
              thumbnailUrl: true,
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { issuedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.libraryCertificate.count({ where }),
    ]);

    return {
      certificates,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    };
  }

  // Toggle reaction on a comment or reply
  async toggleReaction(
    userId: number,
    type: LibReactionType,
    options: {
      commentId?: string;
      replyId?: string;
    },
  ): Promise<boolean> {
    const { commentId, replyId } = options;

    if (!commentId && !replyId) {
      throw new BadRequestException('Must provide either commentId or replyId');
    }

    if (commentId && replyId) {
      throw new BadRequestException('Cannot react to both comment and reply');
    }

    // Check if target exists
    if (commentId) {
      const comment = await this.prisma.libraryComment.findUnique({
        where: { id: commentId },
      });
      if (!comment) {
        throw new NotFoundException('Comment not found');
      }
    }

    if (replyId) {
      const reply = await this.prisma.libraryReply.findUnique({
        where: { id: replyId },
      });
      if (!reply) {
        throw new NotFoundException('Reply not found');
      }
    }

    // Check for existing reaction
    const existingReaction = await this.prisma.libraryReaction.findFirst({
      where: {
        userId,
        type,
        ...(commentId && { commentId }),
        ...(replyId && { replyId }),
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
          type,
          ...(commentId && { commentId }),
          ...(replyId && { replyId }),
        },
      });
      return true;
    }
  }

  // Get reaction counts for a comment or reply
  async getReactionCounts(options: { commentId?: string; replyId?: string }) {
    const { commentId, replyId } = options;

    if (!commentId && !replyId) {
      throw new BadRequestException('Must provide either commentId or replyId');
    }

    const reactions = await this.prisma.libraryReaction.groupBy({
      by: ['type'],
      where: {
        ...(commentId && { commentId }),
        ...(replyId && { replyId }),
      },
      _count: true,
    });

    return reactions.reduce((acc, curr) => {
      acc[curr.type] = curr._count;
      return acc;
    }, {} as Record<LibReactionType, number>);
  }
}
