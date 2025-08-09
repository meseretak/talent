import { BadRequestException, NotFoundException } from '../../exceptions';
import {
  LibraryResource,
  LibraryResourceRelation,
  LibResourceStatus,
  Prisma,
  PrismaClient,
} from '../../generated/prisma';

export interface CreateResourceRelationDto {
  resourceId: string;
  relatedToId: string;
}

type RelatedResourceInfo = Pick<
  LibraryResource,
  | 'id'
  | 'title'
  | 'description'
  | 'thumbnailUrl'
  | 'difficulty'
  | 'duration'
  | 'status'
  | 'publishedAt'
  | 'categoryId'
>;

export class LibraryResourceRelationService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // Create a relation between two resources
  async createRelation(dto: CreateResourceRelationDto): Promise<LibraryResourceRelation> {
    try {
      // Check if both resources exist
      const [resource, relatedResource] = await Promise.all([
        this.prisma.libraryResource.findUnique({ where: { id: dto.resourceId } }),
        this.prisma.libraryResource.findUnique({ where: { id: dto.relatedToId } }),
      ]);

      if (!resource || !relatedResource) {
        throw new NotFoundException('One or both resources not found');
      }

      // Prevent self-relation
      if (dto.resourceId === dto.relatedToId) {
        throw new BadRequestException('Cannot relate a resource to itself');
      }

      return await this.prisma.libraryResourceRelation.create({
        data: {
          resourceId: dto.resourceId,
          relatedToId: dto.relatedToId,
        },
        include: {
          resource: {
            select: {
              id: true,
              title: true,
              description: true,
              thumbnailUrl: true,
            },
          },
          relatedTo: {
            select: {
              id: true,
              title: true,
              description: true,
              thumbnailUrl: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('This relation already exists');
        }
      }
      throw error;
    }
  }

  // Get all related resources for a resource
  async getRelatedResources(resourceId: string): Promise<RelatedResourceInfo[]> {
    const resource = await this.prisma.libraryResource.findUnique({
      where: { id: resourceId },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    const relations = await this.prisma.libraryResourceRelation.findMany({
      where: {
        OR: [{ resourceId }, { relatedToId: resourceId }],
      },
      include: {
        resource: {
          select: {
            id: true,
            title: true,
            description: true,
            thumbnailUrl: true,
            difficulty: true,
            duration: true,
            status: true,
            publishedAt: true,
            categoryId: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        relatedTo: {
          select: {
            id: true,
            title: true,
            description: true,
            thumbnailUrl: true,
            difficulty: true,
            duration: true,
            status: true,
            publishedAt: true,
            categoryId: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return relations.map((relation) =>
      relation.resourceId === resourceId ? relation.relatedTo : relation.resource,
    );
  }

  // Delete a relation
  async deleteRelation(resourceId: string, relatedToId: string): Promise<void> {
    const relation = await this.prisma.libraryResourceRelation.findFirst({
      where: {
        OR: [
          { resourceId, relatedToId },
          { resourceId: relatedToId, relatedToId: resourceId },
        ],
      },
    });

    if (!relation) {
      throw new NotFoundException('Relation not found');
    }

    await this.prisma.libraryResourceRelation.delete({
      where: { id: relation.id },
    });
  }

  // Check if two resources are related
  async checkRelation(resourceId: string, relatedToId: string): Promise<boolean> {
    const relation = await this.prisma.libraryResourceRelation.findFirst({
      where: {
        OR: [
          { resourceId, relatedToId },
          { resourceId: relatedToId, relatedToId: resourceId },
        ],
      },
    });

    return !!relation;
  }

  // Get suggested related resources based on category and tags
  async getSuggestedRelations(resourceId: string, limit = 5): Promise<RelatedResourceInfo[]> {
    const resource = await this.prisma.libraryResource.findUnique({
      where: { id: resourceId },
      select: {
        id: true,
        categoryId: true,
      },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    const existingRelations = await this.prisma.libraryResourceRelation.findMany({
      where: {
        OR: [{ resourceId }, { relatedToId: resourceId }],
      },
      select: {
        resourceId: true,
        relatedToId: true,
      },
    });

    const excludeIds = [
      resourceId,
      ...existingRelations.map((r) => r.resourceId),
      ...existingRelations.map((r) => r.relatedToId),
    ];

    return await this.prisma.libraryResource.findMany({
      where: {
        categoryId: resource.categoryId,
        id: { notIn: excludeIds },
        status: LibResourceStatus.PUBLISHED,
        publishedAt: { not: null },
      },
      select: {
        id: true,
        title: true,
        description: true,
        thumbnailUrl: true,
        difficulty: true,
        duration: true,
        status: true,
        publishedAt: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      take: limit,
      orderBy: {
        publishedAt: 'desc',
      },
    });
  }
}
