import { BadRequestException, NotFoundException } from '../../exceptions';
import { LibAttachmentType, LibraryAttachment, Prisma, PrismaClient } from '../../generated/prisma';

export interface CreateAttachmentDto {
  name: string;
  size: number;
  type: LibAttachmentType;
  url: string;
  resourceId: string;
  userId: number;
}

export interface UpdateAttachmentDto {
  name?: string;
  description?: string;
}

export class LibraryAttachmentService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // Create a new attachment
  async createAttachment(dto: CreateAttachmentDto): Promise<LibraryAttachment> {
    try {
      // Check if resource exists
      const resource = await this.prisma.libraryResource.findUnique({
        where: { id: dto.resourceId },
      });

      if (!resource) {
        throw new NotFoundException('Resource not found');
      }

      return await this.prisma.libraryAttachment.create({
        data: {
          name: dto.name,
          size: dto.size,
          type: dto.type,
          url: dto.url,
          resourceId: dto.resourceId,
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

  // Get attachments for a resource
  async getResourceAttachments(resourceId: string) {
    const resource = await this.prisma.libraryResource.findUnique({
      where: { id: resourceId },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    return await this.prisma.libraryAttachment.findMany({
      where: { resourceId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Get a single attachment
  async getAttachment(id: string): Promise<LibraryAttachment> {
    const attachment = await this.prisma.libraryAttachment.findUnique({
      where: { id },
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    return attachment;
  }

  // Update attachment details
  async updateAttachment(
    id: string,
    userId: number,
    dto: UpdateAttachmentDto,
  ): Promise<LibraryAttachment> {
    const attachment = await this.prisma.libraryAttachment.findUnique({
      where: { id },
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    // Since we don't have uploadedById in schema, we'll need a different way to check ownership
    // This might need to be handled at the controller level or through a different mechanism

    return await this.prisma.libraryAttachment.update({
      where: { id },
      data: dto,
    });
  }

  // Delete an attachment
  async deleteAttachment(id: string): Promise<void> {
    const attachment = await this.prisma.libraryAttachment.findUnique({
      where: { id },
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    await this.prisma.libraryAttachment.delete({ where: { id } });
  }

  // Get total size of attachments for a resource
  async getResourceAttachmentsSize(resourceId: string): Promise<number> {
    const result = await this.prisma.libraryAttachment.aggregate({
      where: { resourceId },
      _sum: {
        size: true,
      },
    });

    return result._sum?.size || 0;
  }
}
