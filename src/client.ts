import config from './config/config';
import { Prisma, PrismaClient } from './generated/prisma';

// add prisma to the NodeJS global type
interface CustomNodeJsGlobal extends Global {
  prisma: PrismaClient;
}

// Prevent multiple instances of Prisma Client in development
declare const global: CustomNodeJsGlobal;

const prisma =
  global.prisma ||
  new PrismaClient({
    transactionOptions: {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      maxWait: 5000, // default: 2000
      timeout: 15000, // default: 5000
    },
  });

if (config.env === 'development') global.prisma = prisma;

export default prisma;
