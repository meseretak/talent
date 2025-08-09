export { default as chatController } from './communication/chat.controller';
export { default as emailController } from './communication/email.controller';
export { default as notificationController } from './communication/notification.controller';
export { default as paymentController } from './payment.controller';
export { default as projectRequestController } from './project/project-request.controller';
export { default as projectController } from './project/project.controller';
export { default as resourceController } from './project/resource.controller';
export { default as taskController } from './project/task.controller';
export { default as auditController } from './user/audit.controller';
export { default as authController } from './user/auth.controller';
export { default as clientController } from './user/client.controller';
export { default as freelancerController } from './user/freelancer.controller';
export { default as pmController } from './user/pm.controller';
export { default as scheduleController } from './user/schedule.controller';
export { default as userController } from './user/user.controller';
import { CreditController } from './credit/credit.controller';
import { ReferralController } from './credit/referral.controller';
import { DiscountController } from './discount/discount.controller';
import { ActivityController } from './project/activity.controller';
import { DeliverableController } from './project/deliverable.controller';
import { DocumentController } from './project/document.controller';
import { KanbanController } from './project/kanban.controller';
import { MeetingController } from './project/meeting.controller';
import { PlanController } from './subscription/plan.controller';
import { SubscriptionController } from './subscription/subscription.controller';

export const controllers = {
  subscription: SubscriptionController,
  plan: PlanController,
  credit: CreditController,
  referral: ReferralController,
  discount: DiscountController,
  meeting: MeetingController,
  activity: ActivityController,
  document: DocumentController,
  kanban: KanbanController,
  deliverable: DeliverableController,
};

export type Controllers = typeof controllers;
