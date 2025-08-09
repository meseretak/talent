import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import { IPrisma } from '@quixo3/prisma-session-store/dist/@types';
import session from 'express-session';
import prisma from '../client';
import config from '../config/config';

const sessionMiddleware = session({
  secret: config.session.secret as string,
  resave: false,
  saveUninitialized: false,
  store: new PrismaSessionStore(prisma as unknown as IPrisma, {
    checkPeriod: 2 * 60 * 1000,
    dbRecordIdIsSessionId: true,
  }),
  cookie: {
    httpOnly: true,
    secure: config.env === 'production',
    maxAge: config.session.expirationDays * 24 * 60 * 60 * 1000,
    sameSite: 'lax', // or 'strict' depending on your needs
  },
  name: 'connect.sid',
});
export default sessionMiddleware;
