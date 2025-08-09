import { CustomPlanRequest, PrismaClient } from '../../generated/prisma';
import generateEmailHTML from '../../template/email';
import ApiError from '../../utils/ApiError';
import emailService from '../communication/email.service';

const prisma = new PrismaClient();

export class CustomPlanService {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  /**
   * Create a new custom plan request
   * @param data The custom plan request data
   * @returns The created custom plan request
   */
  async createCustomPlanRequest(data: {
    clientId: number;
    requestedCredits: number;
    requestedBrands: number;
    durationMonths: number;
  }): Promise<CustomPlanRequest> {
    // Check if client exists
    const client = await this.prisma.client.findUnique({
      where: { id: data.clientId },
      include: { user: true },
    });

    if (!client) {
      throw new ApiError(404, 'Client not found');
    }

    // Create the custom plan request
    const customPlanRequest = await this.prisma.customPlanRequest.create({
      data: {
        clientId: data.clientId,
        requestedCredits: data.requestedCredits,
        requestedBrands: data.requestedBrands,
        durationMonths: data.durationMonths,
        status: 'PENDING',
      },
    });

    // Send notification email to admin
    await this.sendCustomPlanRequestNotification(customPlanRequest, client);

    return customPlanRequest;
  }

  /**
   * Get all custom plan requests
   * @param filter Optional filter criteria
   * @returns List of custom plan requests
   */
  async getCustomPlanRequests(
    filter: {
      status?: string;
      clientId?: number;
    } = {},
  ): Promise<CustomPlanRequest[]> {
    return this.prisma.customPlanRequest.findMany({
      where: filter,
      include: {
        clients: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get a custom plan request by ID
   * @param id The custom plan request ID
   * @returns The custom plan request
   */
  async getCustomPlanRequestById(id: string): Promise<CustomPlanRequest | null> {
    return this.prisma.customPlanRequest.findUnique({
      where: { id },
      include: {
        clients: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  /**
   * Update a custom plan request status
   * @param id The custom plan request ID
   * @param status The new status
   * @returns The updated custom plan request
   */
  async updateCustomPlanRequestStatus(id: string, status: string): Promise<CustomPlanRequest> {
    const customPlanRequest = await this.prisma.customPlanRequest.findUnique({
      where: { id },
      include: {
        clients: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!customPlanRequest) {
      throw new ApiError(404, 'Custom plan request not found');
    }

    const updatedRequest = await this.prisma.customPlanRequest.update({
      where: { id },
      data: { status },
    });

    // If status is approved, notify client
    if (status === 'APPROVED') {
      await this.sendCustomPlanApprovalNotification(customPlanRequest);
    }

    return updatedRequest;
  }

  /**
   * Update a custom plan request details
   * @param id The custom plan request ID
   * @param data The data to update
   * @returns The updated custom plan request
   */
  async updateCustomPlanRequest(
    id: string,
    data: {
      requestedCredits?: number;
      requestedBrands?: number;
      durationMonths?: number;
    },
  ): Promise<CustomPlanRequest> {
    const customPlanRequest = await this.prisma.customPlanRequest.findUnique({
      where: { id },
    });

    if (!customPlanRequest) {
      throw new ApiError(404, 'Custom plan request not found');
    }

    // Only update fields that are provided
    const updateData: any = {};

    if (data.requestedCredits !== undefined) {
      updateData.requestedCredits = data.requestedCredits;
    }

    if (data.requestedBrands !== undefined) {
      updateData.requestedBrands = data.requestedBrands;
    }

    if (data.durationMonths !== undefined) {
      updateData.durationMonths = data.durationMonths;
    }

    return this.prisma.customPlanRequest.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Send notification email about new custom plan request
   * @param customPlanRequest The custom plan request
   * @param client The client who made the request
   */
  private async sendCustomPlanRequestNotification(
    customPlanRequest: CustomPlanRequest,
    client: any,
  ): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';

    const subject = 'New Custom Plan Request';
    const text = `A new custom plan request has been submitted by ${client.user.firstName} ${client.user.lastName}`;

    const htmlContent = generateEmailHTML('custom_plan_request_notification', {
      clientName: `${client.user.firstName} ${client.user.lastName}`,
      clientEmail: client.user.email,
      requestId: customPlanRequest.id,
      requestedCredits: customPlanRequest.requestedCredits,
      requestedBrands: customPlanRequest.requestedBrands,
      durationMonths: customPlanRequest.durationMonths,
      dashboardLink: `${process.env.ADMIN_DASHBOARD_URL}/custom-plans/${customPlanRequest.id}`,
    });

    await emailService.sendEmail(adminEmail, subject, text, htmlContent);
  }

  /**
   * Send approval notification to client
   * @param customPlanRequest The approved custom plan request
   */
  private async sendCustomPlanApprovalNotification(customPlanRequest: any): Promise<void> {
    const client = customPlanRequest.clients;

    const subject = 'Custom Plan Request Approved';
    const text = `Your custom plan request has been approved`;

    const htmlContent = generateEmailHTML('custom_plan_approval', {
      name: `${client.user.firstName} ${client.user.lastName}`,
      requestId: customPlanRequest.id,
      requestedCredits: customPlanRequest.requestedCredits,
      requestedBrands: customPlanRequest.requestedBrands,
      durationMonths: customPlanRequest.durationMonths,
      dashboardLink: `${process.env.FRONTEND_URL}/dashboard/custom-plan/${customPlanRequest.id}`,
    });

    await emailService.sendEmail(client.user.email, subject, text, htmlContent);
  }
}

export default new CustomPlanService(prisma);
