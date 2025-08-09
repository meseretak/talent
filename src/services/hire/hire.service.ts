import { ClientFreelancerStatus, PrismaClient } from '../../generated/prisma';

export class HireService {
  constructor(private prisma: PrismaClient) {}

  // Hire a freelancer for a client
  async hireFreelancer(clientId: number, freelancerId: number): Promise<void> {
    await this.prisma.clientHiredFreelancer.upsert({
      where: {
        clientId_freelancerId: { clientId, freelancerId },
      },
      update: {
        status: ClientFreelancerStatus.ACTIVE,
        hiredAt: new Date(),
        terminatedAt: null,
        terminationReason: null,
      },
      create: {
        clientId,
        freelancerId,
        status: ClientFreelancerStatus.ACTIVE,
        hiredAt: new Date(),
      },
    });
  }

  // Fire (terminate) a freelancer for a client
  async fireFreelancer(clientId: number, freelancerId: number, reason?: string): Promise<void> {
    await this.prisma.clientHiredFreelancer.update({
      where: {
        clientId_freelancerId: { clientId, freelancerId },
      },
      data: {
        status: ClientFreelancerStatus.PAST,
        terminatedAt: new Date(),
        terminationReason: reason || null,
      },
    });
  }

  // List all freelancers hired by a client
  async getMyFreelancers(clientId: number) {
    return this.prisma.clientHiredFreelancer.findMany({
      where: { clientId, status: ClientFreelancerStatus.ACTIVE },
      include: {
        freelancer: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  // List all clients who have hired a freelancer
  async getMyClients(freelancerId: number) {
    return this.prisma.clientHiredFreelancer.findMany({
      where: { freelancerId, status: ClientFreelancerStatus.ACTIVE },
      include: { client: true },
    });
  }

  // Check if a freelancer is currently hired by a client
  async isFreelancerHired(clientId: number, freelancerId: number): Promise<boolean> {
    const record = await this.prisma.clientHiredFreelancer.findUnique({
      where: { clientId_freelancerId: { clientId, freelancerId } },
    });
    return !!record && record.status === ClientFreelancerStatus.ACTIVE;
  }

  // Save a freelancer for future hiring (optional feature)
  async saveFreelancer(clientId: number, freelancerId: number): Promise<void> {
    await this.prisma.clientHiredFreelancer.upsert({
      where: {
        clientId_freelancerId: { clientId, freelancerId },
      },
      update: {
        status: ClientFreelancerStatus.SAVED,
      },
      create: {
        clientId,
        freelancerId,
        status: ClientFreelancerStatus.SAVED,
        hiredAt: new Date(),
      },
    });
  }
}

export default HireService;
