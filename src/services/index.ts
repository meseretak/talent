// Individual service exports
export { default as chatService } from './communication/chat.service';
export { default as emailService } from './communication/email.service';
export { default as auditService } from './user/audit.service';
export { default as authService } from './user/auth.service';
export { default as freelancerService } from './user/freelancer.service';
// Remove or update this line if payment.service.ts is in the subscription folder
// export { default as paymentService } from './payment.service';

export { default as projectService } from './project/project.service';
export { default as resourceService } from './project/resource.service';
export { default as taskService } from './project/task.service';
export { default as SubscriptionService } from './subscription/subscription.service';
export { default as ClientService } from './user/client.service';
export { default as userService } from './user/user.service';

// Import class-based services
import prisma from '../client';
import { CreditValueService } from './credit/credit-value.service';
import { CreditService } from './credit/credit.service';
import { ReferralService } from './credit/referral.service';
import { DiscountEngine } from './discount/discount-engine.service';
import { DiscountService } from './discount/discount.service';
import { HireService } from './hire/hire.service';
import { ProjectRequestService } from './project/project-request.service';
import { CustomPlanService } from './subscription/custom-plan.service';
import { PaymentService } from './subscription/payment.service';
import { PlanService } from './subscription/plan.service';
import { PricingService } from './subscription/pricing.service';
import { SubscriptionService } from './subscription/subscription.service';
import { ClientService } from './user/client.service';

// Create and export instances of class-based services
export const creditService = new CreditService(prisma);
export const creditValueService = new CreditValueService(prisma);
export const referralService = new ReferralService(prisma);
export const discountService = new DiscountService(prisma);
export const discountEngine = new DiscountEngine(prisma);
export const planService = new PlanService(prisma);
export const pricingService = new PricingService(prisma);
export const subscriptionService = new SubscriptionService(prisma);
// Add the payment service instance
export const paymentService = new PaymentService(prisma);
export const hireService = new HireService(prisma);
export const projectRequestService = new ProjectRequestService(prisma);
export const clientService = new ClientService(prisma);
export const customPlanService = new CustomPlanService(prisma);

// Update the services object to include the payment service
export const services = {
  plan: planService,
  pricing: pricingService,
  payment: paymentService,
  subscription: subscriptionService,
  credit: creditService,
  creditValue: creditValueService,
  referral: referralService,
  discount: discountService,
  discountEngine: discountEngine,
  hire: hireService,
  projectRequest: projectRequestService,
  client: clientService,
  customPlan: customPlanService,
};

// Default export for backward compatibility
export default services;
