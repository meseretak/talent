import { PrismaClient } from '../../generated/prisma';
import { CreateClientDto, UpdateClientDto } from '../../types/client';
import ApiError from '../../utils/ApiError';

export class ClientService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Create a new client profile for an existing user
   * @param {CreateClientDto} data - Client data
   * @returns {Promise<Client>} The created client
   */
  async createClient(data: CreateClientDto) {
    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Check if client already exists for this user
    const existingClient = await this.prisma.client.findFirst({
      where: { userId: data.userId },
    });

    if (existingClient) {
      throw new ApiError(400, 'Client profile already exists for this user');
    }

    // Create contact person if provided
    let contactPersonId: number | undefined;
    if (data.contactPerson) {
      const contactPerson = await this.prisma.contactPerson.create({
        data: {
          fullName: data.contactPerson.fullName,
          email: data.contactPerson.email,
          phoneNumber: data.contactPerson.phoneNumber || '',
          position: data.contactPerson.position || '',
        },
      });
      contactPersonId = contactPerson.id;
    }

    // Create statistics information
    const statisticsInfo = await this.prisma.statisticsInformation.create({
      data: {
        totalProjects: 0,
        totalRating: 0,
        totalReviews: 0,
        totalEarnings: 0,
        totalTasks: 0,
        totalClients: 0,
        totalJobsCompleted: 0,
        totalJobsOngoing: 0,
        totalJobsPending: 0,
        totalJobsCancelled: 0,
        totalJobsOnHold: 0,
        totalStorageUsed: 0,
      },
    });

    // Create billing address
    const address = await this.prisma.address.create({
      data: {
        street: data.billingAddress.street,
        city: data.billingAddress.city,
        state: data.billingAddress.state,
        country: data.billingAddress.country,
        postalCode: data.billingAddress.postalCode,
        User: { connect: { id: data.userId } },
      },
    });

    // Generate unique referral code
    const referralCode = this.generateReferralCode();

    // Create client
    const client = await this.prisma.client.create({
      data: {
        userId: data.userId,
        companyName: data.companyName,
        companyWebsite: data.companyWebsite,
        billingAddressId: address.id,
        contactPersonId,
        referralCode,
        clientType: data.clientType,
        statisticsInformationId: statisticsInfo.id,
        defaultPaymentMethod: 'credit_card',
        taxExempt: false,
      },
      include: {
        user: true,
        billingAddress: true,
        contactPerson: true,
        statisticsInformation: true,
      },
    });

    return client;
  }

  /**
   * Get client by user ID
   * @param {number} userId - User ID
   * @returns {Promise<Client|null>} The client or null if not found
   */
  async getClientByUserId(userId: number) {
    return this.prisma.client.findFirst({
      where: { userId },
      include: {
        user: true,
        billingAddress: true,
        contactPerson: true,
        statisticsInformation: true,
        subscription: {
          where: { status: 'ACTIVE' },
          include: {
            plan: true,
            price: true,
          },
        },
      },
    });
  }

  /**
   * Get client by ID
   * @param {number} id - Client ID
   * @returns {Promise<Client>} The client
   */
  async getClientById(id: number) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        user: true,
        billingAddress: true,
        contactPerson: true,
        statisticsInformation: true,
        subscription: {
          where: { status: 'ACTIVE' },
          include: {
            plan: true,
            price: true,
          },
        },
        projects: true,
      },
    });

    if (!client) {
      throw new ApiError(404, 'Client not found');
    }

    return client;
  }

  /**
   * Update client information
   * @param {number} id - Client ID
   * @param {UpdateClientDto} data - Client data to update
   * @returns {Promise<Client>} The updated client
   */
  async updateClient(id: number, data: UpdateClientDto) {
    // Verify client exists
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        billingAddress: true,
        contactPerson: true,
      },
    });

    if (!client) {
      throw new ApiError(404, 'Client not found');
    }

    // Use transaction to ensure all updates are atomic
    return this.prisma.$transaction(async (tx) => {
      // Update contact person if provided
      if (data.contactPerson && client.contactPersonId) {
        await tx.contactPerson.update({
          where: { id: client.contactPersonId },
          data: {
            ...(data.contactPerson.fullName && { fullName: data.contactPerson.fullName }),
            ...(data.contactPerson.email && { email: data.contactPerson.email }),
            ...(data.contactPerson.phoneNumber && { phoneNumber: data.contactPerson.phoneNumber }),
            ...(data.contactPerson.position && { position: data.contactPerson.position }),
          },
        });
      } else if (data.contactPerson && !client.contactPersonId) {
        // Create new contact person
        const contactPerson = await tx.contactPerson.create({
          data: {
            fullName: data.contactPerson.fullName || '',
            email: data.contactPerson.email || '',
            phoneNumber: data.contactPerson.phoneNumber || '',
            position: data.contactPerson.position || '',
          },
        });

        // Update client with new contactPersonId
        await tx.client.update({
          where: { id },
          data: { contactPersonId: contactPerson.id },
        });
      }

      // Update billing address if provided
      if (data.billingAddress && client.billingAddressId) {
        await tx.address.update({
          where: { id: client.billingAddressId },
          data: {
            ...(data.billingAddress.street && { street: data.billingAddress.street }),
            ...(data.billingAddress.city && { city: data.billingAddress.city }),
            ...(data.billingAddress.state && { state: data.billingAddress.state }),
            ...(data.billingAddress.country && { country: data.billingAddress.country }),
            ...(data.billingAddress.postalCode && { postalCode: data.billingAddress.postalCode }),
          },
        });
      }

      // Prepare client update data
      const clientUpdateData: Record<string, any> = {};

      if (data.companyName) clientUpdateData.companyName = data.companyName;
      if (data.companyWebsite) clientUpdateData.companyWebsite = data.companyWebsite;
      if (data.defaultPaymentMethod)
        clientUpdateData.defaultPaymentMethod = data.defaultPaymentMethod;
      if (data.taxExempt !== undefined) clientUpdateData.taxExempt = data.taxExempt;
      if (data.taxId) clientUpdateData.taxId = data.taxId;

      // Update client if we have data to update
      if (Object.keys(clientUpdateData).length > 0) {
        await tx.client.update({
          where: { id },
          data: clientUpdateData,
        });
      }

      // Get updated client with all relations
      const updatedClient = await tx.client.findUnique({
        where: { id },
        include: {
          user: true,
          billingAddress: true,
          contactPerson: true,
          statisticsInformation: true,
          subscription: {
            where: { status: 'ACTIVE' },
            include: {
              plan: true,
              price: true,
            },
          },
        },
      });

      return updatedClient;
    });
  }

  /**
   * Generate a unique referral code
   * @returns {string} Referral code
   */
  private generateReferralCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const length = 8;
    let result = '';

    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return result;
  }

  /**
   * Get all clients with pagination
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Results per page (default: 10)
   * @param {string} search - Optional search term for company name
   * @param {string} sortBy - Field to sort by (default: 'createdAt')
   * @param {string} sortOrder - Sort order (default: 'desc')
   * @returns {Promise<{clients: Client[], totalCount: number, page: number, limit: number}>} Paginated clients
   */
  async getAllClients(
    page = 1,
    limit = 10,
    search?: string,
    sortBy = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc',
    clientType?: string,
  ) {
    const skip = (page - 1) * limit;

    // Build filter conditions
    const where: any = {};

    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (clientType) {
      where.clientType = clientType;
    }

    // Validate sort field (only allow sorting by valid fields)
    const validSortFields = ['companyName', 'createdAt', 'updatedAt'];
    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    // Get total count for pagination
    const totalCount = await this.prisma.client.count({ where });

    // Get clients with relations
    const clients = await this.prisma.client.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [finalSortBy]: sortOrder },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            status: true,
            avatar: true,
          },
        },
        billingAddress: true,
        contactPerson: true,
        statisticsInformation: true,
        subscription: {
          where: { status: 'ACTIVE' },
          include: {
            plan: true,
          },
        },
      },
    });

    return {
      clients,
      totalCount,
      page,
      limit,
    };
  }

  /**
   * Delete a client
   * @param {number} id - Client ID to delete
   * @returns {Promise<Client>} The deleted client
   */
  async deleteClient(id: number) {
    const client = await this.prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      throw new ApiError(404, 'Client not found');
    }

    // Use transaction to delete client and related data
    return this.prisma.$transaction(async (tx) => {
      // Delete contact person if exists
      if (client.contactPersonId) {
        await tx.contactPerson.delete({
          where: { id: client.contactPersonId },
        });
      }

      // Delete billing address if exists
      if (client.billingAddressId) {
        await tx.address.delete({
          where: { id: client.billingAddressId },
        });
      }

      // Delete statistics information
      await tx.statisticsInformation.delete({
        where: { id: client.statisticsInformationId },
      });

      // Delete the client
      return tx.client.delete({
        where: { id },
      });
    });
  }
}

export default ClientService;
