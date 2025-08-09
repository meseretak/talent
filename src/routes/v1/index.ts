import express from 'express';
import config from '../../config/config';
import authRoute from './auth.route';
import chatRoute from './chat.route';
import clientRoute from './client.route';
import creditRoute from './credit.route';
import customPlanRoute from './custom-plan.routes';
import docsRoute from './docs.route';
import emailRoute from './email.route';
import freelancerRoute from './freelancer.route';
import hireRoute from './hire.route';
import notificationRoute from './notification.route';
import otpRoute from './otp.route';

import paymentRoute from './payment.routes';
import planRoute from './plan.route';
import pmRoute from './pm.route';
import pricingRoute from './pricing.route';
import activityRoute from './project/activity.route';
import deliverableRoute from './project/deliverable.route';
import documentRoute from './project/document.route';
import kanbanRoute from './project/kanban.route';
import meetingRoute from './project/meeting.route';
import milestoneRoute from './project/milestone.route';
import projectRequestRoute from './project/project-request.route';

import libraryAttachmentRoute from './library/library-attachment.routes';
import libraryCommentRoute from './library/library-comment.routes';
import libraryRoute from './library/library.routes';
import projectRoute from './project/project.route';
import taskRoute from './project/task.route';
import timetrackingRoute from './project/timetracking.route';
import referalRoute from './referal.route';
import resourceRoute from './resource.route';
import scheduleRoute from './schedule.route';
import securityRoute from './security.route';
import subscriptionRoute from './subscription.route';
import uploadRoute from './upload.routes';
import userRoute from './user.route';
import webhookRoute from './webhook.routes';
const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/security',
    route: securityRoute,
  },
  {
    path: '/clients',
    route: clientRoute,
  },
  {
    path: '/freelancers',
    route: freelancerRoute,
  },

  {
    path: '/resources',
    route: resourceRoute,
  },
  {
    path: '/payment',
    route: paymentRoute,
  },
  {
    path: '/pricing',
    route: pricingRoute,
  },
  {
    path: '/plans',
    route: planRoute,
  },
  {
    path: '/custom-plans',
    route: customPlanRoute,
  },
  {
    path: '/chat',
    route: chatRoute,
  },
  {
    path: '/schedules',
    route: scheduleRoute,
  },
  {
    path: '/email',
    route: emailRoute,
  },
  {
    path: '/otp',
    route: otpRoute,
  },
  {
    path: '/hire',
    route: hireRoute,
  },
  {
    path: '/pm',
    route: pmRoute,
  },
  {
    path: '/subscription',
    route: subscriptionRoute,
  },
  {
    path: '/credit',
    route: creditRoute,
  },
  {
    path: '/referrals',
    route: referalRoute,
  },
  {
    path: '/file',
    route: uploadRoute,
  },
  {
    path: '/projects',
    route: projectRoute,
  },
  {
    path: '/project-requests',
    route: projectRequestRoute,
  },
  {
    path: '/project-meetings',
    route: meetingRoute,
  },
  {
    path: '/project-activities',
    route: activityRoute,
  },
  {
    path: '/project-documents',
    route: documentRoute,
  },
  {
    path: '/project-kanban',
    route: kanbanRoute,
  },
  {
    path: '/project-deliverables',
    route: deliverableRoute,
  },
  {
    path: '/project-tasks',
    route: taskRoute,
  },
  {
    path: '/project-milestones',
    route: milestoneRoute,
  },
  {
    path: '/time-tracking',
    route: timetrackingRoute,
  },
  {
    path: '/library',
    route: libraryRoute,
  },
  {
    path: '/library-attachments',
    route: libraryAttachmentRoute,
  },
  {
    path: '/library-comments',
    route: libraryCommentRoute,
  },
  {
    path: '/notifications',
    route: notificationRoute,
  },
  {
    path: '/webhook',
    route: webhookRoute,
  },
];

const devRoutes = [
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

export default router;
