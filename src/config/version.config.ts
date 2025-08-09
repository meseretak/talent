import { Handler, Router } from 'express';
import versionRouter from 'express-version-route';

export const createVersionedRouter = (routes: { [key: string]: Router }) => {
  const routesMap = new Map<string, Handler>();

  // Add v1 routes
  routesMap.set('1.0.0', routes.v1);

  // Add v2 routes if they exist
  if (routes.v2) {
    routesMap.set('2.0.0', routes.v2);
  }

  // Set default route to v1
  routesMap.set('default', routes.v1);

  return versionRouter.route(routesMap);
};
