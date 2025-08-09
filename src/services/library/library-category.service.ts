import { BadRequestException, NotFoundException } from '../../exceptions';
import { LibraryCategory, Prisma, PrismaClient } from '../../generated/prisma';

export interface CreateLibraryCategoryDto {
  name: string;
  description?: string;
  color?: string;
  isActive?: boolean;
}

export type UpdateLibraryCategoryDto = Partial<CreateLibraryCategoryDto>;

export class LibraryCategoryService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // Create a new category
  async createCategory(dto: CreateLibraryCategoryDto): Promise<LibraryCategory> {
    try {
      return await this.prisma.libraryCategory.create({
        data: dto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Category with this name already exists');
        }
      }
      throw error;
    }
  }

  // Get all categories with optional filters
  async getCategories(params?: {
    includeInactive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { includeInactive = false, search, page = 1, limit = 10 } = params || {};

    const skip = (page - 1) * limit;
    const where: Prisma.LibraryCategoryWhereInput = {
      ...(includeInactive ? {} : { isActive: true }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [categories, total] = await Promise.all([
      this.prisma.libraryCategory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: {
              resources: true,
            },
          },
        },
      }),
      this.prisma.libraryCategory.count({ where }),
    ]);

    return {
      categories,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    };
  }

  // Get category by ID
  async getCategoryById(id: string): Promise<LibraryCategory> {
    const category = await this.prisma.libraryCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            resources: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  // Update category
  async updateCategory(id: string, dto: UpdateLibraryCategoryDto): Promise<LibraryCategory> {
    try {
      const category = await this.prisma.libraryCategory.findUnique({
        where: { id },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      return await this.prisma.libraryCategory.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Category with this name already exists');
        }
      }
      throw error;
    }
  }

  // Delete category
  async deleteCategory(id: string): Promise<void> {
    // First check if category has any resources
    const category = await this.prisma.libraryCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            resources: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category._count.resources > 0) {
      throw new BadRequestException(
        'Cannot delete category that has associated resources. Please move or delete the resources first.',
      );
    }

    await this.prisma.libraryCategory.delete({
      where: { id },
    });
  }

  // Soft delete - mark category as inactive
  async deactivateCategory(id: string): Promise<LibraryCategory> {
    const category = await this.prisma.libraryCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return await this.prisma.libraryCategory.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // Get categories with resource count
  async getCategoriesWithStats() {
    return await this.prisma.libraryCategory.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        color: true,
        _count: {
          select: {
            resources: {
              where: {
                status: 'PUBLISHED',
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }
}
