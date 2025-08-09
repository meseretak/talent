-- CreateEnum
CREATE TYPE "ProjectStatusType" AS ENUM ('PLANNING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'ON_HOLD', 'CANCELLED', 'PAUSED', 'COMPLETED_WITH_ISSUES', 'ARCHIVED', 'PENDING', 'FAILED');

-- CreateEnum
CREATE TYPE "ProjectRequestStatusType" AS ENUM ('IN_PROGRESS', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'PROJECT_MANAGER', 'FREELANCER', 'CLIENT', 'SUPPORT', 'INVESTOR');

-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('ACCESS', 'REFRESH', 'RESET_PASSWORD', 'VERIFY_EMAIL', 'OTP');

-- CreateEnum
CREATE TYPE "PaymentMethodType" AS ENUM ('CREDIT_CARD', 'BANK_TRANSFER', 'PAYPAL');

-- CreateEnum
CREATE TYPE "PaymentFrequencyType" AS ENUM ('MONTHLY', 'WEEKLY', 'DAILY');

-- CreateEnum
CREATE TYPE "BankAccountType" AS ENUM ('CHECKING', 'SAVINGS');

-- CreateEnum
CREATE TYPE "TerminationType" AS ENUM ('FREELANCER', 'CLIENT', 'SUPPORT', 'INVESTOR', 'PROJ');

-- CreateEnum
CREATE TYPE "SkillType" AS ENUM ('VIDEO', 'PROGRAMMING', 'DESIGN', 'WRITING', 'MARKETING');

-- CreateEnum
CREATE TYPE "VideoType" AS ENUM ('VSL', 'UGC', 'DRA', 'AIV');

-- CreateEnum
CREATE TYPE "ProgrammingType" AS ENUM ('FRONTEND', 'BACKEND', 'MOBILE', 'FULLSTACK');

-- CreateEnum
CREATE TYPE "DesignType" AS ENUM ('UI_UX', 'GRAPHIC', 'MOTION');

-- CreateEnum
CREATE TYPE "WritingType" AS ENUM ('TECHNICAL', 'CREATIVE', 'CONTENT');

-- CreateEnum
CREATE TYPE "MarketingType" AS ENUM ('SOCIAL', 'EMAIL', 'SEO');

-- CreateEnum
CREATE TYPE "FreelancerStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "ClientFreelancerStatus" AS ENUM ('ACTIVE', 'PAST', 'SAVED');

-- CreateEnum
CREATE TYPE "ClientType" AS ENUM ('INDIVIDUAL', 'COMPANY');

-- CreateEnum
CREATE TYPE "PaymentStatusType" AS ENUM ('DRAFT', 'PENDING', 'SENT', 'PAID', 'OVERDUE', 'REJECTED', 'REFUNDED', 'CANCELLED', 'PARTIALLY_PAID', 'DISPUTED');

-- CreateEnum
CREATE TYPE "BillingEventType" AS ENUM ('SUBSCRIPTION_CREATED', 'SUBSCRIPTION_RENEWED', 'SUBSCRIPTION_CANCELED', 'SUBSCRIPTION_UPGRADED', 'SUBSCRIPTION_DOWNGRADED', 'PAYMENT_SUCCEEDED', 'PAYMENT_FAILED', 'REFUND_ISSUED', 'CREDIT_APPLIED', 'INVOICE_CREATED', 'INVOICE_PAID', 'INVOICE_OVERDUE', 'MANUAL_ADJUSTMENT');

-- CreateEnum
CREATE TYPE "ResourceStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('VIDEO', 'DESIGN', 'AUDIO', 'DOCUMENT', 'CODE', 'OTHER');

-- CreateEnum
CREATE TYPE "AudioType" AS ENUM ('MUSIC', 'VOICEOVER', 'SOUND_EFFECTS', 'PODCAST');

-- CreateEnum
CREATE TYPE "DeliverableStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'REVIEW', 'APPROVED', 'REJECTED', 'DELIVERED');

-- CreateEnum
CREATE TYPE "FeedbackStatus" AS ENUM ('PENDING', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'SUBMITTED_FOR_REVIEW', 'CHANGES_REQUESTED', 'REVISION_IN_PROGRESS', 'APPROVED', 'FINAL_REVIEW', 'COMPLETED', 'CANCELLED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "TaskPriorityType" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "ProjectActivityType" AS ENUM ('JOINED', 'MOVED', 'COMMENTED', 'UPDATED', 'CREATED', 'DELETED');

-- CreateEnum
CREATE TYPE "JobTimerStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "AuditActionType" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW', 'COMMENT', 'UPLOAD', 'DOWNLOAD', 'PAYMENT', 'REVIEW', 'REPORT', 'REJECT', 'APPROVE', 'SUSPEND', 'TERMINATE', 'REQUEST', 'RESPONSE', 'REQUEST_UPDATE', 'RESPONSE_UPDATE');

-- CreateEnum
CREATE TYPE "MediaSource" AS ENUM ('UPLOAD', 'URL', 'NO_MEDIA');

-- CreateEnum
CREATE TYPE "MeetingStatus" AS ENUM ('SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED', 'POSTPONED');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'ERROR', 'SYSTEM', 'PROJECT', 'TASK', 'PAYMENT', 'CHAT', 'SECURITY');

-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('AVAILABLE', 'UNAVAILABLE');

-- CreateEnum
CREATE TYPE "LibResourceStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "LibDifficultyLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "LibAttachmentType" AS ENUM ('PDF', 'VIDEO', 'LINK', 'IMAGE', 'OTHER');

-- CreateEnum
CREATE TYPE "LibReactionType" AS ENUM ('LIKE', 'DISLIKE');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('SUBSCRIPTION', 'REFERRAL', 'USAGE');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'ANNUALLY');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELED', 'EXPIRED', 'PAUSED', 'TRIALING', 'PENDING');

-- CreateEnum
CREATE TYPE "CreditType" AS ENUM ('BASE', 'REFERRAL');

-- CreateEnum
CREATE TYPE "ReferralCreditStatus" AS ENUM ('ACTIVE', 'USED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'CREDIT_BONUS');

-- CreateEnum
CREATE TYPE "DiscountTarget" AS ENUM ('PLANS', 'SERVICES', 'ALL', 'BUNDLES');

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "messageType" TEXT NOT NULL,
    "senderId" INTEGER NOT NULL,
    "recipientId" INTEGER,
    "roomId" INTEGER NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editedAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "reactions" JSONB,
    "attachmentId" INTEGER,
    "mediaContent" JSONB,
    "replyTo" JSONB,
    "forwardedFrom" JSONB,
    "mentions" INTEGER[],
    "metadata" JSONB,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatRoom" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "lastMessageAt" TIMESTAMP(3),
    "isGroupChat" BOOLEAN NOT NULL DEFAULT false,
    "groupChatId" INTEGER,
    "chatType" TEXT NOT NULL,
    "adminId" INTEGER,
    "mutedParticipants" INTEGER[],
    "isTyping" JSONB,
    "pinnedMessages" INTEGER[],
    "settings" JSONB NOT NULL,
    "metadata" JSONB,
    "projectId" INTEGER,

    CONSTRAINT "ChatRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "type" "NotificationType" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "readAt" TIMESTAMP(3),
    "recipientId" INTEGER NOT NULL,
    "senderId" INTEGER,
    "userId" INTEGER NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" INTEGER NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "subject" TEXT NOT NULL,
    "bodyTemplate" TEXT NOT NULL,
    "variables" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "companyName" TEXT,
    "companyWebsite" TEXT,
    "billingAddressId" INTEGER,
    "contactPersonId" INTEGER,
    "referralCode" TEXT NOT NULL,
    "clientType" "ClientType" NOT NULL,
    "statisticsInformationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "defaultPaymentMethod" TEXT,
    "taxExempt" BOOLEAN NOT NULL DEFAULT false,
    "taxId" TEXT,
    "stripeCustomerId" TEXT,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactPerson" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "position" TEXT,

    CONSTRAINT "ContactPerson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" SERIAL NOT NULL,
    "clientId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "termsAndConditions" TEXT NOT NULL,
    "signedAt" TIMESTAMP(3) NOT NULL,
    "signedById" INTEGER NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "File" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "description" TEXT,
    "fileURL" TEXT NOT NULL,
    "fileSize" INTEGER,
    "fileType" TEXT,
    "storageProvider" TEXT,
    "bucket" TEXT,
    "objectType" TEXT,
    "objectId" INTEGER,
    "metadata" JSONB,
    "uploadedById" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentTransaction" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "PaymentStatusType" NOT NULL,
    "paymentMethod" "PaymentMethodType" NOT NULL,
    "type" "TransactionType" NOT NULL,
    "paymentReference" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "clientId" INTEGER NOT NULL,
    "invoiceId" INTEGER,
    "subscriptionId" TEXT,
    "billingAddressId" TEXT,
    "refundedAmount" DECIMAL(10,2),
    "refundReason" TEXT,
    "refundedAt" TIMESTAMP(3),
    "paymentProcessor" TEXT NOT NULL DEFAULT 'STRIPE',
    "processorFee" DECIMAL(10,2),
    "netAmount" DECIMAL(10,2),
    "taxAmount" DECIMAL(10,2),
    "taxRate" DECIMAL(5,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentAttempt" (
    "id" TEXT NOT NULL,
    "paymentTransactionId" TEXT NOT NULL,
    "status" "PaymentStatusType" NOT NULL,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "gatewayResponse" JSONB,
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingAddress" (
    "id" TEXT NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "clientId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingHistory" (
    "id" TEXT NOT NULL,
    "clientId" INTEGER NOT NULL,
    "subscriptionId" TEXT,
    "invoiceId" INTEGER,
    "paymentTransactionId" TEXT,
    "eventType" "BillingEventType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BillingHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialSummary" (
    "id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "totalRevenue" DECIMAL(12,2) NOT NULL,
    "subscriptionRevenue" DECIMAL(12,2) NOT NULL,
    "oneTimeRevenue" DECIMAL(12,2) NOT NULL,
    "refundAmount" DECIMAL(12,2) NOT NULL,
    "processingFees" DECIMAL(12,2) NOT NULL,
    "netRevenue" DECIMAL(12,2) NOT NULL,
    "taxCollected" DECIMAL(12,2) NOT NULL,
    "newSubscriptions" INTEGER NOT NULL,
    "canceledSubscriptions" INTEGER NOT NULL,
    "renewedSubscriptions" INTEGER NOT NULL,
    "upgradedSubscriptions" INTEGER NOT NULL,
    "downgradedSubscriptions" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxRate" (
    "id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "state" TEXT,
    "postalCode" TEXT,
    "rate" DECIMAL(5,2) NOT NULL,
    "taxType" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaxRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" SERIAL NOT NULL,
    "amount" INTEGER NOT NULL,
    "lateFeeAmount" INTEGER,
    "discountAmount" INTEGER,
    "issuedAt" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3),
    "status" "PaymentStatusType" NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "notes" TEXT,
    "taxAmount" INTEGER,
    "totalAmount" INTEGER NOT NULL,
    "pdfUrl" TEXT,
    "sentAt" TIMESTAMP(3),
    "viewedAt" TIMESTAMP(3),
    "reminderSentAt" TIMESTAMP(3),

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceItem" (
    "id" TEXT NOT NULL,
    "invoiceId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "taxable" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,

    CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Freelancer" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "headline" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "about" TEXT NOT NULL,
    "featuredFreelancer" BOOLEAN NOT NULL DEFAULT false,
    "rank" BOOLEAN NOT NULL DEFAULT false,
    "status" "FreelancerStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "availabilityId" INTEGER NOT NULL,
    "statisticsInformationId" INTEGER NOT NULL,
    "terminationInformationId" INTEGER,
    "profilePhoto" TEXT,
    "bannerPhoto" TEXT,

    CONSTRAINT "Freelancer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "SkillType" NOT NULL,
    "videoType" "VideoType",
    "programmingType" "ProgrammingType",
    "designType" "DesignType",
    "writingType" "WritingType",
    "marketingType" "MarketingType",

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certification" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "issuingOrganization" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "expirationDate" TIMESTAMP(3),
    "credentialId" TEXT,
    "freelancerId" INTEGER,

    CONSTRAINT "Certification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkHistory" (
    "id" SERIAL NOT NULL,
    "companyName" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "description" TEXT,
    "freelancerId" INTEGER,

    CONSTRAINT "WorkHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Availability" (
    "id" SERIAL NOT NULL,
    "status" "AvailabilityStatus" NOT NULL,
    "availableHoursPerWeek" INTEGER,
    "unavailableUntil" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "Availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TerminationInformation" (
    "id" SERIAL NOT NULL,
    "terminatedAt" TIMESTAMP(3),
    "terminatedReason" TEXT,
    "isTerminated" BOOLEAN NOT NULL,
    "terminationType" "TerminationType" NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "TerminationInformation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioItem" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageURL" TEXT,
    "projectURL" TEXT,
    "freelancerId" INTEGER,

    CONSTRAINT "PortfolioItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentInformation" (
    "id" SERIAL NOT NULL,
    "bankAccountNumber" TEXT NOT NULL,
    "bankAccountName" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "bankAccountType" "BankAccountType" NOT NULL,
    "paymentMethod" "PaymentMethodType" NOT NULL,
    "paymentFrequency" "PaymentFrequencyType" NOT NULL,
    "paymentAmount" INTEGER NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "taxId" TEXT,
    "taxCountry" TEXT,
    "taxState" TEXT,
    "taxAddress" TEXT,
    "taxPercentage" INTEGER,
    "freelancerId" INTEGER,
    "taxInformationId" INTEGER,
    "invoiceId" INTEGER,

    CONSTRAINT "PaymentInformation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatisticsInformation" (
    "id" SERIAL NOT NULL,
    "totalEarnings" INTEGER NOT NULL,
    "totalProjects" INTEGER NOT NULL,
    "totalTasks" INTEGER NOT NULL,
    "totalReviews" INTEGER NOT NULL,
    "totalRating" INTEGER NOT NULL,
    "totalClients" INTEGER NOT NULL,
    "totalJobsCompleted" INTEGER NOT NULL,
    "totalJobsOngoing" INTEGER NOT NULL,
    "totalJobsPending" INTEGER NOT NULL,
    "totalJobsCancelled" INTEGER NOT NULL,
    "totalJobsOnHold" INTEGER NOT NULL,
    "totalStorageUsed" INTEGER NOT NULL,

    CONSTRAINT "StatisticsInformation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientHiredFreelancer" (
    "clientId" INTEGER NOT NULL,
    "freelancerId" INTEGER NOT NULL,
    "hiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ClientFreelancerStatus" NOT NULL DEFAULT 'ACTIVE',
    "terminatedAt" TIMESTAMP(3),
    "terminationReason" TEXT,

    CONSTRAINT "ClientHiredFreelancer_pkey" PRIMARY KEY ("clientId","freelancerId")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" SERIAL NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" INTEGER,
    "reviewerId" INTEGER NOT NULL,
    "comment" TEXT,
    "freelancerId" INTEGER,
    "clientId" INTEGER NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LibraryResource" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "keyPoints" TEXT,
    "status" "LibResourceStatus" NOT NULL DEFAULT 'DRAFT',
    "difficulty" "LibDifficultyLevel" NOT NULL DEFAULT 'INTERMEDIATE',
    "duration" INTEGER,
    "views" INTEGER NOT NULL DEFAULT 0,
    "allowComments" BOOLEAN NOT NULL DEFAULT true,
    "thumbnailUrl" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" INTEGER NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "LibraryResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LibrarySection" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resourceId" TEXT NOT NULL,

    CONSTRAINT "LibrarySection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LibraryAttachment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "type" "LibAttachmentType" NOT NULL,
    "size" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resourceId" TEXT NOT NULL,

    CONSTRAINT "LibraryAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LibraryResourceRelation" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "relatedToId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LibraryResourceRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LibraryComment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "resourceId" TEXT NOT NULL,

    CONSTRAINT "LibraryComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LibraryReply" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "commentId" TEXT NOT NULL,

    CONSTRAINT "LibraryReply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LibraryReaction" (
    "id" TEXT NOT NULL,
    "type" "LibReactionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "commentId" TEXT,
    "replyId" TEXT,

    CONSTRAINT "LibraryReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LibraryProgress" (
    "id" TEXT NOT NULL,
    "percentage" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "lastAccessed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "resourceId" TEXT NOT NULL,

    CONSTRAINT "LibraryProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LibraryFavorite" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "resourceId" TEXT NOT NULL,

    CONSTRAINT "LibraryFavorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LibraryPin" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "resourceId" TEXT NOT NULL,

    CONSTRAINT "LibraryPin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LibraryCertificate" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "resourceId" TEXT NOT NULL,

    CONSTRAINT "LibraryCertificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LibraryCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LibraryCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectManager" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "ProjectManager_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "resourceType" "ResourceType" NOT NULL,
    "inspirationLinks" TEXT[],
    "referenceLinks" TEXT[],
    "tags" TEXT[],
    "status" "ResourceStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "clientId" INTEGER,
    "mediaSpecificationsId" INTEGER NOT NULL,
    "brandingGuidelinesId" INTEGER NOT NULL,
    "projectId" INTEGER,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaSpecifications" (
    "id" SERIAL NOT NULL,
    "videoType" "VideoType",
    "audioType" "AudioType",
    "designType" "DesignType",
    "codeType" "ProgrammingType",

    CONSTRAINT "MediaSpecifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandingGuidelines" (
    "id" SERIAL NOT NULL,
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "accentColors" TEXT[],
    "typography" TEXT,
    "logoUrl" TEXT,
    "brandVoice" TEXT,
    "styleGuideUrl" TEXT,

    CONSTRAINT "BrandingGuidelines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ProjectStatusType" NOT NULL DEFAULT 'IN_PROGRESS',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "budget" DOUBLE PRECISION NOT NULL,
    "creatorId" INTEGER NOT NULL,
    "projectManagerId" INTEGER,
    "clientId" INTEGER NOT NULL,
    "budgetInfoId" INTEGER,
    "kanbanBoardId" INTEGER,
    "terminationInfoId" INTEGER,
    "Color" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "requestId" INTEGER,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "priority" "TaskPriorityType" NOT NULL DEFAULT 'MEDIUM',
    "dueDate" TIMESTAMP(3) NOT NULL,
    "estimatedHours" DOUBLE PRECISION NOT NULL,
    "actualHours" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "assignedToId" INTEGER,
    "assignedById" INTEGER,
    "assignedAt" TIMESTAMP(3),
    "parentTaskId" INTEGER,
    "freelancerId" INTEGER,
    "projectManagerId" INTEGER,
    "milestoneId" INTEGER,
    "kanbanColumnId" INTEGER,
    "projectId" INTEGER,
    "activityId" INTEGER,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubTask" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "parentTaskId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectActivity" (
    "id" SERIAL NOT NULL,
    "type" "ProjectActivityType" NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "taskId" INTEGER,

    CONSTRAINT "ProjectActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeLog" (
    "id" SERIAL NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "taskId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "projectId" INTEGER,
    "freelancerId" INTEGER NOT NULL,

    CONSTRAINT "TimeLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobTimer" (
    "id" SERIAL NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "taskId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "status" "JobTimerStatus" NOT NULL DEFAULT 'ACTIVE',
    "duration" INTEGER,

    CONSTRAINT "JobTimer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetInformation" (
    "id" SERIAL NOT NULL,
    "budget" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "paymentMethod" "PaymentMethodType" NOT NULL,
    "paymentFrequency" "PaymentFrequencyType" NOT NULL,
    "budgetStatus" "PaymentStatusType" NOT NULL,
    "budgetDate" TIMESTAMP(3) NOT NULL,
    "freelancerBudget" INTEGER NOT NULL,
    "freelancerBudgetPercentage" INTEGER NOT NULL,
    "companyBudget" INTEGER NOT NULL,

    CONSTRAINT "BudgetInformation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectTeam" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "ProjectTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "taskId" INTEGER NOT NULL,
    "authorId" INTEGER NOT NULL,
    "mentions" INTEGER[],

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "TaskStatus" NOT NULL,
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedById" INTEGER NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectDocument" (
    "id" SERIAL NOT NULL,
    "fileName" TEXT,
    "description" TEXT,
    "fileURL" TEXT NOT NULL,
    "fileSize" INTEGER,
    "fileType" TEXT,
    "uploadedById" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "taskId" INTEGER,
    "freelancerId" INTEGER,
    "projectId" INTEGER NOT NULL,
    "folderId" INTEGER,

    CONSTRAINT "ProjectDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentFolder" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "projectId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" INTEGER NOT NULL,
    "parentId" INTEGER,

    CONSTRAINT "DocumentFolder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentVersion" (
    "id" SERIAL NOT NULL,
    "documentId" INTEGER NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "fileURL" TEXT NOT NULL,
    "fileSize" INTEGER,
    "changedById" INTEGER NOT NULL,
    "changeNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meeting" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" "MeetingStatus" NOT NULL DEFAULT 'SCHEDULED',
    "organizerId" INTEGER NOT NULL,
    "projectId" INTEGER,
    "isClientInitiated" BOOLEAN NOT NULL DEFAULT false,
    "meetingLink" TEXT,
    "meetingNotes" TEXT,
    "meetingAgenda" TEXT,
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "action" "AuditActionType" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "projectId" INTEGER,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectRequest" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "timeline" TEXT,
    "requirements" TEXT,
    "reviewNotes" TEXT,
    "clientId" INTEGER NOT NULL,
    "resourceId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "ProjectRequestStatusType" NOT NULL DEFAULT 'IN_PROGRESS',
    "projectId" INTEGER,
    "approvedAt" TIMESTAMP(3),

    CONSTRAINT "ProjectRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" SERIAL NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "taskId" INTEGER,
    "commentId" INTEGER,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KanbanBoard" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "projectId" INTEGER,

    CONSTRAINT "KanbanBoard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KanbanColumn" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "boardId" INTEGER NOT NULL,

    CONSTRAINT "KanbanColumn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" SERIAL NOT NULL,
    "taskId" INTEGER,
    "userId" INTEGER NOT NULL,
    "projectId" INTEGER,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deliverable" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "taskId" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3),
    "status" "DeliverableStatus" NOT NULL DEFAULT 'DRAFT',
    "priority" "TaskPriorityType" NOT NULL DEFAULT 'MEDIUM',
    "attachments" JSONB,
    "version" INTEGER,
    "revisionNotes" TEXT,
    "clientApproval" BOOLEAN DEFAULT false,
    "feedbackRequired" BOOLEAN DEFAULT false,
    "completionDate" TIMESTAMP(3),
    "acceptanceDate" TIMESTAMP(3),
    "revisionRequests" TEXT[],
    "finalPaymentStatus" "PaymentStatusType",
    "metrics" JSONB,
    "rating" INTEGER,
    "clientFeedback" TEXT,
    "likes" INTEGER,
    "shares" INTEGER,
    "views" INTEGER,
    "downloads" INTEGER,
    "sales" INTEGER,
    "conversions" INTEGER,
    "watchTime" INTEGER,
    "retentionRate" DOUBLE PRECISION,
    "clickThroughRate" DOUBLE PRECISION,
    "conversionRate" DOUBLE PRECISION,
    "engagement" DOUBLE PRECISION,
    "demographics" JSONB,
    "geographicDistribution" JSONB,
    "deviceStats" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deliverable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliverableFeedback" (
    "id" SERIAL NOT NULL,
    "deliverableId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "feedback" TEXT NOT NULL,
    "attachments" JSONB,
    "status" "FeedbackStatus" NOT NULL DEFAULT 'PENDING',
    "isReadByPM" BOOLEAN NOT NULL DEFAULT false,
    "isReadByClient" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliverableFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliverableComment" (
    "id" SERIAL NOT NULL,
    "deliverableId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "attachments" JSONB,
    "parentId" INTEGER,
    "mentions" INTEGER[],
    "isReadBy" INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliverableComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoTaskRequest" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "additionalInfo" TEXT,
    "outcomes" TEXT,
    "videoType" "VideoType" NOT NULL,
    "requestedLength" INTEGER NOT NULL,
    "priority" "TaskPriorityType" NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "mediaSource" "MediaSource" NOT NULL,
    "mediaUrl" TEXT,
    "subtitlesNeeded" BOOLEAN NOT NULL DEFAULT false,
    "voiceoverNeeded" BOOLEAN NOT NULL DEFAULT false,
    "scriptProvided" BOOLEAN NOT NULL DEFAULT false,
    "musicProvided" BOOLEAN NOT NULL DEFAULT false,
    "clientId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "status" "ProjectRequestStatusType" NOT NULL DEFAULT 'IN_PROGRESS',
    "createdTaskId" INTEGER,
    "reviewNotes" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoTaskRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuestSchedule" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "companyName" TEXT,
    "phoneNumber" TEXT,
    "currentEditingSolution" TEXT,
    "frustrations" TEXT[],
    "monthlyPlanPreference" TEXT,
    "notes" TEXT,
    "country" TEXT,
    "scheduledDate" TIMESTAMP(3),
    "duration" INTEGER,
    "timeZone" TEXT,
    "meetingType" TEXT,
    "meetingLink" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "canceledAt" TIMESTAMP(3),

    CONSTRAINT "GuestSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" TEXT NOT NULL,
    "creditPerReferral" INTEGER NOT NULL DEFAULT 100,
    "referralExpirationDays" INTEGER NOT NULL DEFAULT 60,
    "minPurchaseForCredit" BOOLEAN NOT NULL DEFAULT false,
    "referralBonusOnPurchase" INTEGER NOT NULL DEFAULT 50,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureFlag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "percentage" INTEGER NOT NULL DEFAULT 100,
    "rules" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Referral" (
    "id" SERIAL NOT NULL,
    "referringClientId" INTEGER NOT NULL,
    "referredClientId" INTEGER NOT NULL,
    "referredIp" TEXT,
    "referredUserAgent" TEXT,
    "referredLocation" TEXT,
    "referralDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "discountCredits" INTEGER NOT NULL,
    "discountApplied" BOOLEAN NOT NULL DEFAULT false,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "referralLink" TEXT NOT NULL,
    "couponCode" TEXT NOT NULL,
    "linkClicks" INTEGER NOT NULL DEFAULT 0,
    "signups" INTEGER NOT NULL DEFAULT 0,
    "activeUsers" INTEGER NOT NULL DEFAULT 0,
    "rewardsEarned" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "lastClickedAt" TIMESTAMP(3),
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferralClick" (
    "id" SERIAL NOT NULL,
    "referralId" INTEGER NOT NULL,
    "clickedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "location" TEXT,
    "converted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ReferralClick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferralAnalytics" (
    "id" TEXT NOT NULL,
    "referralId" INTEGER NOT NULL,
    "conversionRate" DOUBLE PRECISION,
    "averageSpend" DOUBLE PRECISION,
    "retentionRate" DOUBLE PRECISION,
    "campaignSource" TEXT,
    "deviceBreakdown" JSONB,
    "locationData" JSONB,
    "timeToConversion" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReferralAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanStatistics" (
    "id" SERIAL NOT NULL,
    "totalProjects" INTEGER NOT NULL,
    "totalClients" INTEGER NOT NULL,
    "totalEarnings" INTEGER NOT NULL,

    CONSTRAINT "PlanStatistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditTransaction" (
    "id" TEXT NOT NULL,
    "clientId" INTEGER NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "remaining" INTEGER NOT NULL,
    "expirationDate" TIMESTAMP(3),
    "description" TEXT,
    "subscriptionId" TEXT,
    "referralId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditUsageAnalytics" (
    "id" TEXT NOT NULL,
    "clientId" INTEGER NOT NULL,
    "period" TEXT NOT NULL,
    "totalUsed" INTEGER NOT NULL,
    "byServiceType" JSONB NOT NULL,
    "peakUsageDays" JSONB,
    "unusualActivity" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditUsageAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomPlanRequest" (
    "id" TEXT NOT NULL,
    "clientId" INTEGER NOT NULL,
    "requestedCredits" INTEGER NOT NULL,
    "requestedBrands" INTEGER NOT NULL,
    "durationMonths" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "stripePaymentLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomPlanRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionHistory" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "priceId" TEXT,
    "status" "SubscriptionStatus" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubscriptionHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "clientId" INTEGER NOT NULL,
    "planId" TEXT NOT NULL,
    "priceId" TEXT,
    "customCredits" INTEGER,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "invoiceId" INTEGER,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "baseCreditsUsed" INTEGER NOT NULL DEFAULT 0,
    "referralCreditsUsed" INTEGER NOT NULL DEFAULT 0,
    "brandsUsed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "planStatisticsId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanFeature" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expirationPolicy" TEXT NOT NULL DEFAULT 'END_OF_BILLING_CYCLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feature" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanPrice" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "credits" INTEGER,
    "amount" DECIMAL(65,30) NOT NULL,
    "billingCycle" "BillingCycle" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditValue" (
    "id" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "baseUnit" TEXT NOT NULL DEFAULT 'MINUTE',
    "creditsPerUnit" INTEGER NOT NULL,
    "minUnits" INTEGER NOT NULL DEFAULT 1,
    "maxUnits" INTEGER,
    "tieredPricing" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditConsumption" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "serviceId" TEXT,
    "units" DOUBLE PRECISION NOT NULL,
    "unitType" TEXT NOT NULL,
    "creditRate" INTEGER NOT NULL,
    "totalCredits" INTEGER NOT NULL,
    "discountApplied" INTEGER NOT NULL DEFAULT 0,
    "creditType" "CreditType" NOT NULL DEFAULT 'BASE',
    "referralCreditId" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditConsumption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferralCredit" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "creditAmount" INTEGER NOT NULL,
    "referralDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "referredUserEmail" TEXT,
    "status" "ReferralCreditStatus" NOT NULL DEFAULT 'ACTIVE',
    "consumedInId" TEXT,

    CONSTRAINT "ReferralCredit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandConsumption" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BrandConsumption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Discount" (
    "id" TEXT NOT NULL,
    "code" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "DiscountType" NOT NULL DEFAULT 'PERCENTAGE',
    "value" DECIMAL(65,30) NOT NULL,
    "maxDiscount" DECIMAL(65,30),
    "minRequirement" JSONB,
    "appliesTo" "DiscountTarget" NOT NULL DEFAULT 'PLANS',
    "planIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "serviceTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "schedule" JSONB,
    "timezone" TEXT DEFAULT 'UTC',
    "maxUses" INTEGER,
    "userMaxUses" INTEGER DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Discount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HolidayDiscountRule" (
    "id" TEXT NOT NULL,
    "discountId" TEXT NOT NULL,
    "holidayName" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT true,
    "multiplier" DECIMAL(65,30) NOT NULL DEFAULT 1.5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HolidayDiscountRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscountRedemption" (
    "id" TEXT NOT NULL,
    "discountId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "clientId" INTEGER NOT NULL,
    "appliedTo" TEXT NOT NULL,
    "appliedAmount" DECIMAL(65,30) NOT NULL,
    "creditValueId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscountRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanInformation" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "priceDescription" TEXT NOT NULL,
    "highlight" BOOLEAN NOT NULL DEFAULT false,
    "mostPopular" BOOLEAN NOT NULL DEFAULT false,
    "buttonText" TEXT NOT NULL DEFAULT 'Get Started',
    "order" INTEGER NOT NULL DEFAULT 0,
    "monthlyPrice" DECIMAL(65,30),
    "annualPrice" DECIMAL(65,30),
    "creditIncluded" INTEGER,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanInformation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanFeatureDisplay" (
    "id" TEXT NOT NULL,
    "planInfoId" TEXT NOT NULL,
    "featureText" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "isHighlight" BOOLEAN NOT NULL DEFAULT false,
    "tooltip" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlanFeatureDisplay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanComparison" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "featuredPlanId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanComparison_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sid" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'FREELANCER',
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "provider" TEXT,
    "providerId" TEXT,
    "avatar" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Token" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "blacklisted" BOOLEAN NOT NULL,
    "email" TEXT,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" SERIAL NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Security" (
    "id" SERIAL NOT NULL,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "isCodeVerified" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "backupCodes" TEXT[],
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Security_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPreferences" (
    "id" SERIAL NOT NULL,
    "color" TEXT,
    "theme" TEXT NOT NULL DEFAULT 'light',
    "layout" TEXT NOT NULL DEFAULT 'default',
    "fontSize" INTEGER NOT NULL DEFAULT 14,
    "language" TEXT NOT NULL DEFAULT 'en',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "emailFrequency" TEXT NOT NULL DEFAULT 'daily',
    "dateFormat" TEXT NOT NULL DEFAULT 'MM/DD/YYYY',
    "timeFormat" TEXT NOT NULL DEFAULT '12-hour',
    "privacyId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "UserPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Privacy" (
    "id" SERIAL NOT NULL,
    "analyticsSharing" BOOLEAN NOT NULL DEFAULT true,
    "personalizedAds" BOOLEAN NOT NULL DEFAULT true,
    "dataRetention" TEXT NOT NULL DEFAULT '1 year',

    CONSTRAINT "Privacy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPreferences" (
    "id" SERIAL NOT NULL,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "accountActivity" BOOLEAN NOT NULL DEFAULT true,
    "newFeatures" BOOLEAN NOT NULL DEFAULT true,
    "marketing" BOOLEAN NOT NULL DEFAULT false,
    "frequency" TEXT NOT NULL DEFAULT 'daily',
    "quietHoursStart" TEXT NOT NULL DEFAULT '22:00',
    "quietHoursEnd" TEXT NOT NULL DEFAULT '08:00',
    "userId" INTEGER NOT NULL,

    CONSTRAINT "NotificationPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLoginAudit" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "ip" TEXT,
    "organization" TEXT,
    "asn" TEXT,
    "city" TEXT,
    "region" TEXT,
    "country" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "timezone" TEXT,
    "userAgent" TEXT,
    "platform" TEXT,
    "host" TEXT,
    "currency" TEXT,
    "language" TEXT,
    "loginTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserLoginAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiUsage" (
    "id" TEXT NOT NULL,
    "userId" INTEGER,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "status" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "ApiUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MessageAttachments" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_MessageAttachments_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_UserToChatRoomParticipant" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_UserToChatRoomParticipant_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_UserToChatRoomManager" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_UserToChatRoomManager_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_FreelancerSkills" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_FreelancerSkills_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_FreelancerToProject" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_FreelancerToProject_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ProjectTeamToFreelancer" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ProjectTeamToFreelancer_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_BlockedTalentsOnProject" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_BlockedTalentsOnProject_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_FreelancerCategories" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_FreelancerCategories_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_TaskToActivityMany" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_TaskToActivityMany_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ResourceDocuments" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ResourceDocuments_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_UserToMeetingParticipant" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_UserToMeetingParticipant_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_DeliverableAssignees" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_DeliverableAssignees_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_RelatedTasksToDeliverables" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_RelatedTasksToDeliverables_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_PlanComparisonToPlanInformation" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PlanComparisonToPlanInformation_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "ChatMessage_senderId_idx" ON "ChatMessage"("senderId");

-- CreateIndex
CREATE INDEX "ChatMessage_recipientId_idx" ON "ChatMessage"("recipientId");

-- CreateIndex
CREATE INDEX "ChatMessage_roomId_idx" ON "ChatMessage"("roomId");

-- CreateIndex
CREATE INDEX "ChatRoom_adminId_idx" ON "ChatRoom"("adminId");

-- CreateIndex
CREATE INDEX "ChatRoom_projectId_idx" ON "ChatRoom"("projectId");

-- CreateIndex
CREATE INDEX "Notification_recipientId_idx" ON "Notification"("recipientId");

-- CreateIndex
CREATE INDEX "Notification_senderId_idx" ON "Notification"("senderId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationTemplate_name_key" ON "NotificationTemplate"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Client_userId_key" ON "Client"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Client_referralCode_key" ON "Client"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "Client_stripeCustomerId_key" ON "Client"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "Client_billingAddressId_idx" ON "Client"("billingAddressId");

-- CreateIndex
CREATE INDEX "Client_contactPersonId_idx" ON "Client"("contactPersonId");

-- CreateIndex
CREATE INDEX "Client_statisticsInformationId_idx" ON "Client"("statisticsInformationId");

-- CreateIndex
CREATE INDEX "Contract_clientId_idx" ON "Contract"("clientId");

-- CreateIndex
CREATE INDEX "Contract_projectId_idx" ON "Contract"("projectId");

-- CreateIndex
CREATE INDEX "Contract_signedById_idx" ON "Contract"("signedById");

-- CreateIndex
CREATE UNIQUE INDEX "File_uuid_key" ON "File"("uuid");

-- CreateIndex
CREATE INDEX "File_uploadedById_idx" ON "File"("uploadedById");

-- CreateIndex
CREATE INDEX "File_objectType_objectId_idx" ON "File"("objectType", "objectId");

-- CreateIndex
CREATE INDEX "PaymentTransaction_clientId_idx" ON "PaymentTransaction"("clientId");

-- CreateIndex
CREATE INDEX "PaymentTransaction_invoiceId_idx" ON "PaymentTransaction"("invoiceId");

-- CreateIndex
CREATE INDEX "PaymentTransaction_subscriptionId_idx" ON "PaymentTransaction"("subscriptionId");

-- CreateIndex
CREATE INDEX "PaymentTransaction_status_idx" ON "PaymentTransaction"("status");

-- CreateIndex
CREATE INDEX "PaymentTransaction_createdAt_idx" ON "PaymentTransaction"("createdAt");

-- CreateIndex
CREATE INDEX "PaymentAttempt_paymentTransactionId_idx" ON "PaymentAttempt"("paymentTransactionId");

-- CreateIndex
CREATE INDEX "PaymentAttempt_status_idx" ON "PaymentAttempt"("status");

-- CreateIndex
CREATE INDEX "BillingAddress_clientId_idx" ON "BillingAddress"("clientId");

-- CreateIndex
CREATE INDEX "BillingHistory_clientId_idx" ON "BillingHistory"("clientId");

-- CreateIndex
CREATE INDEX "BillingHistory_subscriptionId_idx" ON "BillingHistory"("subscriptionId");

-- CreateIndex
CREATE INDEX "BillingHistory_invoiceId_idx" ON "BillingHistory"("invoiceId");

-- CreateIndex
CREATE INDEX "BillingHistory_paymentTransactionId_idx" ON "BillingHistory"("paymentTransactionId");

-- CreateIndex
CREATE INDEX "BillingHistory_eventType_idx" ON "BillingHistory"("eventType");

-- CreateIndex
CREATE INDEX "BillingHistory_createdAt_idx" ON "BillingHistory"("createdAt");

-- CreateIndex
CREATE INDEX "FinancialSummary_period_idx" ON "FinancialSummary"("period");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialSummary_period_key" ON "FinancialSummary"("period");

-- CreateIndex
CREATE INDEX "TaxRate_country_state_postalCode_idx" ON "TaxRate"("country", "state", "postalCode");

-- CreateIndex
CREATE UNIQUE INDEX "TaxRate_country_state_postalCode_taxType_key" ON "TaxRate"("country", "state", "postalCode", "taxType");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "InvoiceItem_invoiceId_idx" ON "InvoiceItem"("invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "Freelancer_userId_key" ON "Freelancer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_name_key" ON "Skill"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE INDEX "TerminationInformation_userId_idx" ON "TerminationInformation"("userId");

-- CreateIndex
CREATE INDEX "ClientHiredFreelancer_freelancerId_idx" ON "ClientHiredFreelancer"("freelancerId");

-- CreateIndex
CREATE INDEX "Review_projectId_idx" ON "Review"("projectId");

-- CreateIndex
CREATE INDEX "Review_reviewerId_idx" ON "Review"("reviewerId");

-- CreateIndex
CREATE INDEX "Review_freelancerId_idx" ON "Review"("freelancerId");

-- CreateIndex
CREATE INDEX "Review_clientId_idx" ON "Review"("clientId");

-- CreateIndex
CREATE INDEX "LibraryResource_status_publishedAt_idx" ON "LibraryResource"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "LibraryResource_categoryId_idx" ON "LibraryResource"("categoryId");

-- CreateIndex
CREATE INDEX "LibraryResource_authorId_idx" ON "LibraryResource"("authorId");

-- CreateIndex
CREATE INDEX "LibrarySection_resourceId_order_idx" ON "LibrarySection"("resourceId", "order");

-- CreateIndex
CREATE INDEX "LibraryAttachment_resourceId_type_idx" ON "LibraryAttachment"("resourceId", "type");

-- CreateIndex
CREATE INDEX "LibraryResourceRelation_resourceId_idx" ON "LibraryResourceRelation"("resourceId");

-- CreateIndex
CREATE INDEX "LibraryResourceRelation_relatedToId_idx" ON "LibraryResourceRelation"("relatedToId");

-- CreateIndex
CREATE UNIQUE INDEX "LibraryResourceRelation_resourceId_relatedToId_key" ON "LibraryResourceRelation"("resourceId", "relatedToId");

-- CreateIndex
CREATE INDEX "LibraryComment_resourceId_createdAt_idx" ON "LibraryComment"("resourceId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "LibraryComment_userId_idx" ON "LibraryComment"("userId");

-- CreateIndex
CREATE INDEX "LibraryReply_commentId_createdAt_idx" ON "LibraryReply"("commentId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "LibraryReply_userId_idx" ON "LibraryReply"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LibraryReaction_userId_commentId_type_key" ON "LibraryReaction"("userId", "commentId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "LibraryReaction_userId_replyId_type_key" ON "LibraryReaction"("userId", "replyId", "type");

-- CreateIndex
CREATE INDEX "LibraryProgress_userId_completed_idx" ON "LibraryProgress"("userId", "completed");

-- CreateIndex
CREATE INDEX "LibraryProgress_resourceId_completed_idx" ON "LibraryProgress"("resourceId", "completed");

-- CreateIndex
CREATE UNIQUE INDEX "LibraryProgress_userId_resourceId_key" ON "LibraryProgress"("userId", "resourceId");

-- CreateIndex
CREATE INDEX "LibraryFavorite_userId_createdAt_idx" ON "LibraryFavorite"("userId", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "LibraryFavorite_userId_resourceId_key" ON "LibraryFavorite"("userId", "resourceId");

-- CreateIndex
CREATE INDEX "LibraryPin_userId_createdAt_idx" ON "LibraryPin"("userId", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "LibraryPin_userId_resourceId_key" ON "LibraryPin"("userId", "resourceId");

-- CreateIndex
CREATE INDEX "LibraryCertificate_userId_issuedAt_idx" ON "LibraryCertificate"("userId", "issuedAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "LibraryCertificate_userId_resourceId_key" ON "LibraryCertificate"("userId", "resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "LibraryCategory_name_key" ON "LibraryCategory"("name");

-- CreateIndex
CREATE INDEX "LibraryCategory_isActive_idx" ON "LibraryCategory"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectManager_userId_key" ON "ProjectManager"("userId");

-- CreateIndex
CREATE INDEX "ProjectManager_userId_idx" ON "ProjectManager"("userId");

-- CreateIndex
CREATE INDEX "Resource_clientId_idx" ON "Resource"("clientId");

-- CreateIndex
CREATE INDEX "Resource_mediaSpecificationsId_idx" ON "Resource"("mediaSpecificationsId");

-- CreateIndex
CREATE INDEX "Resource_brandingGuidelinesId_idx" ON "Resource"("brandingGuidelinesId");

-- CreateIndex
CREATE INDEX "Resource_projectId_idx" ON "Resource"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_budgetInfoId_key" ON "Project"("budgetInfoId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_kanbanBoardId_key" ON "Project"("kanbanBoardId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_terminationInfoId_key" ON "Project"("terminationInfoId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_requestId_key" ON "Project"("requestId");

-- CreateIndex
CREATE INDEX "Project_creatorId_idx" ON "Project"("creatorId");

-- CreateIndex
CREATE INDEX "Project_projectManagerId_idx" ON "Project"("projectManagerId");

-- CreateIndex
CREATE INDEX "Project_clientId_idx" ON "Project"("clientId");

-- CreateIndex
CREATE INDEX "Project_budgetInfoId_idx" ON "Project"("budgetInfoId");

-- CreateIndex
CREATE INDEX "Project_kanbanBoardId_idx" ON "Project"("kanbanBoardId");

-- CreateIndex
CREATE INDEX "Project_terminationInfoId_idx" ON "Project"("terminationInfoId");

-- CreateIndex
CREATE UNIQUE INDEX "Task_activityId_key" ON "Task"("activityId");

-- CreateIndex
CREATE INDEX "Task_assignedToId_idx" ON "Task"("assignedToId");

-- CreateIndex
CREATE INDEX "Task_assignedById_idx" ON "Task"("assignedById");

-- CreateIndex
CREATE INDEX "Task_parentTaskId_idx" ON "Task"("parentTaskId");

-- CreateIndex
CREATE INDEX "Task_freelancerId_idx" ON "Task"("freelancerId");

-- CreateIndex
CREATE INDEX "Task_projectManagerId_idx" ON "Task"("projectManagerId");

-- CreateIndex
CREATE INDEX "Task_milestoneId_idx" ON "Task"("milestoneId");

-- CreateIndex
CREATE INDEX "Task_kanbanColumnId_idx" ON "Task"("kanbanColumnId");

-- CreateIndex
CREATE INDEX "SubTask_parentTaskId_idx" ON "SubTask"("parentTaskId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectActivity_taskId_key" ON "ProjectActivity"("taskId");

-- CreateIndex
CREATE INDEX "ProjectActivity_userId_idx" ON "ProjectActivity"("userId");

-- CreateIndex
CREATE INDEX "ProjectActivity_projectId_idx" ON "ProjectActivity"("projectId");

-- CreateIndex
CREATE INDEX "ProjectActivity_taskId_idx" ON "ProjectActivity"("taskId");

-- CreateIndex
CREATE INDEX "TimeLog_taskId_idx" ON "TimeLog"("taskId");

-- CreateIndex
CREATE INDEX "TimeLog_userId_idx" ON "TimeLog"("userId");

-- CreateIndex
CREATE INDEX "JobTimer_taskId_idx" ON "JobTimer"("taskId");

-- CreateIndex
CREATE INDEX "JobTimer_userId_idx" ON "JobTimer"("userId");

-- CreateIndex
CREATE INDEX "BudgetInformation_id_idx" ON "BudgetInformation"("id");

-- CreateIndex
CREATE INDEX "ProjectTeam_projectId_idx" ON "ProjectTeam"("projectId");

-- CreateIndex
CREATE INDEX "Comment_taskId_idx" ON "Comment"("taskId");

-- CreateIndex
CREATE INDEX "Comment_authorId_idx" ON "Comment"("authorId");

-- CreateIndex
CREATE INDEX "Milestone_projectId_idx" ON "Milestone"("projectId");

-- CreateIndex
CREATE INDEX "Document_uploadedById_idx" ON "Document"("uploadedById");

-- CreateIndex
CREATE INDEX "ProjectDocument_taskId_idx" ON "ProjectDocument"("taskId");

-- CreateIndex
CREATE INDEX "ProjectDocument_projectId_idx" ON "ProjectDocument"("projectId");

-- CreateIndex
CREATE INDEX "ProjectDocument_uploadedById_idx" ON "ProjectDocument"("uploadedById");

-- CreateIndex
CREATE INDEX "ProjectDocument_freelancerId_idx" ON "ProjectDocument"("freelancerId");

-- CreateIndex
CREATE INDEX "ProjectDocument_folderId_idx" ON "ProjectDocument"("folderId");

-- CreateIndex
CREATE INDEX "DocumentFolder_projectId_idx" ON "DocumentFolder"("projectId");

-- CreateIndex
CREATE INDEX "DocumentFolder_createdById_idx" ON "DocumentFolder"("createdById");

-- CreateIndex
CREATE INDEX "DocumentFolder_parentId_idx" ON "DocumentFolder"("parentId");

-- CreateIndex
CREATE INDEX "DocumentVersion_documentId_idx" ON "DocumentVersion"("documentId");

-- CreateIndex
CREATE INDEX "DocumentVersion_changedById_idx" ON "DocumentVersion"("changedById");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentVersion_documentId_versionNumber_key" ON "DocumentVersion"("documentId", "versionNumber");

-- CreateIndex
CREATE INDEX "Meeting_organizerId_idx" ON "Meeting"("organizerId");

-- CreateIndex
CREATE INDEX "Meeting_projectId_idx" ON "Meeting"("projectId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_projectId_idx" ON "AuditLog"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectRequest_projectId_key" ON "ProjectRequest"("projectId");

-- CreateIndex
CREATE INDEX "ProjectRequest_clientId_idx" ON "ProjectRequest"("clientId");

-- CreateIndex
CREATE INDEX "ProjectRequest_resourceId_idx" ON "ProjectRequest"("resourceId");

-- CreateIndex
CREATE INDEX "Attachment_taskId_idx" ON "Attachment"("taskId");

-- CreateIndex
CREATE INDEX "Attachment_commentId_idx" ON "Attachment"("commentId");

-- CreateIndex
CREATE UNIQUE INDEX "KanbanBoard_projectId_key" ON "KanbanBoard"("projectId");

-- CreateIndex
CREATE INDEX "KanbanColumn_boardId_idx" ON "KanbanColumn"("boardId");

-- CreateIndex
CREATE INDEX "Favorite_taskId_idx" ON "Favorite"("taskId");

-- CreateIndex
CREATE INDEX "Favorite_userId_idx" ON "Favorite"("userId");

-- CreateIndex
CREATE INDEX "Favorite_projectId_idx" ON "Favorite"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Deliverable_taskId_key" ON "Deliverable"("taskId");

-- CreateIndex
CREATE INDEX "Deliverable_projectId_idx" ON "Deliverable"("projectId");

-- CreateIndex
CREATE INDEX "Deliverable_taskId_idx" ON "Deliverable"("taskId");

-- CreateIndex
CREATE INDEX "Deliverable_status_idx" ON "Deliverable"("status");

-- CreateIndex
CREATE INDEX "Deliverable_dueDate_idx" ON "Deliverable"("dueDate");

-- CreateIndex
CREATE INDEX "Deliverable_clientApproval_idx" ON "Deliverable"("clientApproval");

-- CreateIndex
CREATE INDEX "DeliverableFeedback_deliverableId_idx" ON "DeliverableFeedback"("deliverableId");

-- CreateIndex
CREATE INDEX "DeliverableFeedback_userId_idx" ON "DeliverableFeedback"("userId");

-- CreateIndex
CREATE INDEX "DeliverableFeedback_status_idx" ON "DeliverableFeedback"("status");

-- CreateIndex
CREATE INDEX "DeliverableComment_deliverableId_idx" ON "DeliverableComment"("deliverableId");

-- CreateIndex
CREATE INDEX "DeliverableComment_userId_idx" ON "DeliverableComment"("userId");

-- CreateIndex
CREATE INDEX "DeliverableComment_parentId_idx" ON "DeliverableComment"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "VideoTaskRequest_createdTaskId_key" ON "VideoTaskRequest"("createdTaskId");

-- CreateIndex
CREATE INDEX "VideoTaskRequest_clientId_idx" ON "VideoTaskRequest"("clientId");

-- CreateIndex
CREATE INDEX "VideoTaskRequest_projectId_idx" ON "VideoTaskRequest"("projectId");

-- CreateIndex
CREATE INDEX "VideoTaskRequest_status_idx" ON "VideoTaskRequest"("status");

-- CreateIndex
CREATE INDEX "VideoTaskRequest_createdTaskId_idx" ON "VideoTaskRequest"("createdTaskId");

-- CreateIndex
CREATE INDEX "GuestSchedule_status_idx" ON "GuestSchedule"("status");

-- CreateIndex
CREATE INDEX "GuestSchedule_email_idx" ON "GuestSchedule"("email");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureFlag_name_key" ON "FeatureFlag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Referral_referralLink_key" ON "Referral"("referralLink");

-- CreateIndex
CREATE INDEX "Referral_referringClientId_idx" ON "Referral"("referringClientId");

-- CreateIndex
CREATE INDEX "Referral_referredClientId_idx" ON "Referral"("referredClientId");

-- CreateIndex
CREATE INDEX "Referral_referralLink_idx" ON "Referral"("referralLink");

-- CreateIndex
CREATE INDEX "Referral_couponCode_idx" ON "Referral"("couponCode");

-- CreateIndex
CREATE UNIQUE INDEX "Referral_referringClientId_referredClientId_key" ON "Referral"("referringClientId", "referredClientId");

-- CreateIndex
CREATE INDEX "ReferralClick_referralId_idx" ON "ReferralClick"("referralId");

-- CreateIndex
CREATE INDEX "ReferralClick_clickedAt_idx" ON "ReferralClick"("clickedAt");

-- CreateIndex
CREATE INDEX "ReferralAnalytics_referralId_idx" ON "ReferralAnalytics"("referralId");

-- CreateIndex
CREATE INDEX "CreditUsageAnalytics_clientId_idx" ON "CreditUsageAnalytics"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "CreditUsageAnalytics_clientId_period_key" ON "CreditUsageAnalytics"("clientId", "period");

-- CreateIndex
CREATE INDEX "SubscriptionHistory_subscriptionId_idx" ON "SubscriptionHistory"("subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_clientId_key" ON "Subscription"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_name_key" ON "Plan"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PlanFeature_planId_featureId_key" ON "PlanFeature"("planId", "featureId");

-- CreateIndex
CREATE UNIQUE INDEX "Feature_name_key" ON "Feature"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Feature_key_key" ON "Feature"("key");

-- CreateIndex
CREATE UNIQUE INDEX "PlanPrice_planId_credits_billingCycle_key" ON "PlanPrice"("planId", "credits", "billingCycle");

-- CreateIndex
CREATE UNIQUE INDEX "CreditValue_serviceType_key" ON "CreditValue"("serviceType");

-- CreateIndex
CREATE INDEX "CreditValue_serviceType_idx" ON "CreditValue"("serviceType");

-- CreateIndex
CREATE INDEX "CreditValue_category_idx" ON "CreditValue"("category");

-- CreateIndex
CREATE INDEX "CreditValue_baseUnit_idx" ON "CreditValue"("baseUnit");

-- CreateIndex
CREATE INDEX "CreditConsumption_serviceId_idx" ON "CreditConsumption"("serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "ReferralCredit_consumedInId_key" ON "ReferralCredit"("consumedInId");

-- CreateIndex
CREATE UNIQUE INDEX "Discount_code_key" ON "Discount"("code");

-- CreateIndex
CREATE INDEX "Discount_code_idx" ON "Discount"("code");

-- CreateIndex
CREATE INDEX "Discount_validUntil_idx" ON "Discount"("validUntil");

-- CreateIndex
CREATE INDEX "DiscountRedemption_discountId_idx" ON "DiscountRedemption"("discountId");

-- CreateIndex
CREATE INDEX "DiscountRedemption_clientId_idx" ON "DiscountRedemption"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanInformation_planId_key" ON "PlanInformation"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sid_key" ON "Session"("sid");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_provider_providerId_idx" ON "User"("provider", "providerId");

-- CreateIndex
CREATE INDEX "Token_token_idx" ON "Token"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Address_userId_key" ON "Address"("userId");

-- CreateIndex
CREATE INDEX "Address_userId_idx" ON "Address"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Security_userId_key" ON "Security"("userId");

-- CreateIndex
CREATE INDEX "Security_userId_idx" ON "Security"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreferences_userId_key" ON "UserPreferences"("userId");

-- CreateIndex
CREATE INDEX "UserPreferences_userId_idx" ON "UserPreferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreferences_userId_key" ON "NotificationPreferences"("userId");

-- CreateIndex
CREATE INDEX "NotificationPreferences_userId_idx" ON "NotificationPreferences"("userId");

-- CreateIndex
CREATE INDEX "UserLoginAudit_userId_idx" ON "UserLoginAudit"("userId");

-- CreateIndex
CREATE INDEX "ApiUsage_userId_idx" ON "ApiUsage"("userId");

-- CreateIndex
CREATE INDEX "ApiUsage_endpoint_idx" ON "ApiUsage"("endpoint");

-- CreateIndex
CREATE INDEX "ApiUsage_timestamp_idx" ON "ApiUsage"("timestamp");

-- CreateIndex
CREATE INDEX "_MessageAttachments_B_index" ON "_MessageAttachments"("B");

-- CreateIndex
CREATE INDEX "_UserToChatRoomParticipant_B_index" ON "_UserToChatRoomParticipant"("B");

-- CreateIndex
CREATE INDEX "_UserToChatRoomManager_B_index" ON "_UserToChatRoomManager"("B");

-- CreateIndex
CREATE INDEX "_FreelancerSkills_B_index" ON "_FreelancerSkills"("B");

-- CreateIndex
CREATE INDEX "_FreelancerToProject_B_index" ON "_FreelancerToProject"("B");

-- CreateIndex
CREATE INDEX "_ProjectTeamToFreelancer_B_index" ON "_ProjectTeamToFreelancer"("B");

-- CreateIndex
CREATE INDEX "_BlockedTalentsOnProject_B_index" ON "_BlockedTalentsOnProject"("B");

-- CreateIndex
CREATE INDEX "_FreelancerCategories_B_index" ON "_FreelancerCategories"("B");

-- CreateIndex
CREATE INDEX "_TaskToActivityMany_B_index" ON "_TaskToActivityMany"("B");

-- CreateIndex
CREATE INDEX "_ResourceDocuments_B_index" ON "_ResourceDocuments"("B");

-- CreateIndex
CREATE INDEX "_UserToMeetingParticipant_B_index" ON "_UserToMeetingParticipant"("B");

-- CreateIndex
CREATE INDEX "_DeliverableAssignees_B_index" ON "_DeliverableAssignees"("B");

-- CreateIndex
CREATE INDEX "_RelatedTasksToDeliverables_B_index" ON "_RelatedTasksToDeliverables"("B");

-- CreateIndex
CREATE INDEX "_PlanComparisonToPlanInformation_B_index" ON "_PlanComparisonToPlanInformation"("B");

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "ChatRoom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatRoom" ADD CONSTRAINT "ChatRoom_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatRoom" ADD CONSTRAINT "ChatRoom_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_billingAddressId_fkey" FOREIGN KEY ("billingAddressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_contactPersonId_fkey" FOREIGN KEY ("contactPersonId") REFERENCES "ContactPerson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_statisticsInformationId_fkey" FOREIGN KEY ("statisticsInformationId") REFERENCES "StatisticsInformation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_signedById_fkey" FOREIGN KEY ("signedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_billingAddressId_fkey" FOREIGN KEY ("billingAddressId") REFERENCES "BillingAddress"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentAttempt" ADD CONSTRAINT "PaymentAttempt_paymentTransactionId_fkey" FOREIGN KEY ("paymentTransactionId") REFERENCES "PaymentTransaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingAddress" ADD CONSTRAINT "BillingAddress_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingHistory" ADD CONSTRAINT "BillingHistory_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingHistory" ADD CONSTRAINT "BillingHistory_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingHistory" ADD CONSTRAINT "BillingHistory_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingHistory" ADD CONSTRAINT "BillingHistory_paymentTransactionId_fkey" FOREIGN KEY ("paymentTransactionId") REFERENCES "PaymentTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Freelancer" ADD CONSTRAINT "Freelancer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Freelancer" ADD CONSTRAINT "Freelancer_availabilityId_fkey" FOREIGN KEY ("availabilityId") REFERENCES "Availability"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Freelancer" ADD CONSTRAINT "Freelancer_statisticsInformationId_fkey" FOREIGN KEY ("statisticsInformationId") REFERENCES "StatisticsInformation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Freelancer" ADD CONSTRAINT "Freelancer_terminationInformationId_fkey" FOREIGN KEY ("terminationInformationId") REFERENCES "TerminationInformation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certification" ADD CONSTRAINT "Certification_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "Freelancer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkHistory" ADD CONSTRAINT "WorkHistory_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "Freelancer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TerminationInformation" ADD CONSTRAINT "TerminationInformation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioItem" ADD CONSTRAINT "PortfolioItem_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "Freelancer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentInformation" ADD CONSTRAINT "PaymentInformation_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "Freelancer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentInformation" ADD CONSTRAINT "PaymentInformation_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientHiredFreelancer" ADD CONSTRAINT "ClientHiredFreelancer_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientHiredFreelancer" ADD CONSTRAINT "ClientHiredFreelancer_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "Freelancer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "Freelancer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryResource" ADD CONSTRAINT "LibraryResource_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryResource" ADD CONSTRAINT "LibraryResource_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "LibraryCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibrarySection" ADD CONSTRAINT "LibrarySection_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "LibraryResource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryAttachment" ADD CONSTRAINT "LibraryAttachment_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "LibraryResource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryResourceRelation" ADD CONSTRAINT "LibraryResourceRelation_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "LibraryResource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryResourceRelation" ADD CONSTRAINT "LibraryResourceRelation_relatedToId_fkey" FOREIGN KEY ("relatedToId") REFERENCES "LibraryResource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryComment" ADD CONSTRAINT "LibraryComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryComment" ADD CONSTRAINT "LibraryComment_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "LibraryResource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryReply" ADD CONSTRAINT "LibraryReply_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryReply" ADD CONSTRAINT "LibraryReply_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "LibraryComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryReaction" ADD CONSTRAINT "LibraryReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryReaction" ADD CONSTRAINT "LibraryReaction_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "LibraryComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryReaction" ADD CONSTRAINT "LibraryReaction_replyId_fkey" FOREIGN KEY ("replyId") REFERENCES "LibraryReply"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryProgress" ADD CONSTRAINT "LibraryProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryProgress" ADD CONSTRAINT "LibraryProgress_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "LibraryResource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryFavorite" ADD CONSTRAINT "LibraryFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryFavorite" ADD CONSTRAINT "LibraryFavorite_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "LibraryResource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryPin" ADD CONSTRAINT "LibraryPin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryPin" ADD CONSTRAINT "LibraryPin_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "LibraryResource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryCertificate" ADD CONSTRAINT "LibraryCertificate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryCertificate" ADD CONSTRAINT "LibraryCertificate_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "LibraryResource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectManager" ADD CONSTRAINT "ProjectManager_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_mediaSpecificationsId_fkey" FOREIGN KEY ("mediaSpecificationsId") REFERENCES "MediaSpecifications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_brandingGuidelinesId_fkey" FOREIGN KEY ("brandingGuidelinesId") REFERENCES "BrandingGuidelines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_projectManagerId_fkey" FOREIGN KEY ("projectManagerId") REFERENCES "ProjectManager"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_budgetInfoId_fkey" FOREIGN KEY ("budgetInfoId") REFERENCES "BudgetInformation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_kanbanBoardId_fkey" FOREIGN KEY ("kanbanBoardId") REFERENCES "KanbanBoard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_terminationInfoId_fkey" FOREIGN KEY ("terminationInfoId") REFERENCES "TerminationInformation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ProjectRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "Freelancer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectManagerId_fkey" FOREIGN KEY ("projectManagerId") REFERENCES "ProjectManager"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_kanbanColumnId_fkey" FOREIGN KEY ("kanbanColumnId") REFERENCES "KanbanColumn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubTask" ADD CONSTRAINT "SubTask_parentTaskId_fkey" FOREIGN KEY ("parentTaskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectActivity" ADD CONSTRAINT "ProjectActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectActivity" ADD CONSTRAINT "ProjectActivity_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectActivity" ADD CONSTRAINT "ProjectActivity_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeLog" ADD CONSTRAINT "TimeLog_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeLog" ADD CONSTRAINT "TimeLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeLog" ADD CONSTRAINT "TimeLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeLog" ADD CONSTRAINT "TimeLog_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "Freelancer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobTimer" ADD CONSTRAINT "JobTimer_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobTimer" ADD CONSTRAINT "JobTimer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTeam" ADD CONSTRAINT "ProjectTeam_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectDocument" ADD CONSTRAINT "ProjectDocument_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectDocument" ADD CONSTRAINT "ProjectDocument_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectDocument" ADD CONSTRAINT "ProjectDocument_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "Freelancer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectDocument" ADD CONSTRAINT "ProjectDocument_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectDocument" ADD CONSTRAINT "ProjectDocument_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "DocumentFolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentFolder" ADD CONSTRAINT "DocumentFolder_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentFolder" ADD CONSTRAINT "DocumentFolder_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentFolder" ADD CONSTRAINT "DocumentFolder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "DocumentFolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentVersion" ADD CONSTRAINT "DocumentVersion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "ProjectDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentVersion" ADD CONSTRAINT "DocumentVersion_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectRequest" ADD CONSTRAINT "ProjectRequest_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectRequest" ADD CONSTRAINT "ProjectRequest_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectRequest" ADD CONSTRAINT "ProjectRequest_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KanbanColumn" ADD CONSTRAINT "KanbanColumn_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "KanbanBoard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deliverable" ADD CONSTRAINT "Deliverable_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deliverable" ADD CONSTRAINT "Deliverable_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliverableFeedback" ADD CONSTRAINT "DeliverableFeedback_deliverableId_fkey" FOREIGN KEY ("deliverableId") REFERENCES "Deliverable"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliverableFeedback" ADD CONSTRAINT "DeliverableFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliverableComment" ADD CONSTRAINT "DeliverableComment_deliverableId_fkey" FOREIGN KEY ("deliverableId") REFERENCES "Deliverable"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliverableComment" ADD CONSTRAINT "DeliverableComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliverableComment" ADD CONSTRAINT "DeliverableComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "DeliverableComment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoTaskRequest" ADD CONSTRAINT "VideoTaskRequest_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoTaskRequest" ADD CONSTRAINT "VideoTaskRequest_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoTaskRequest" ADD CONSTRAINT "VideoTaskRequest_createdTaskId_fkey" FOREIGN KEY ("createdTaskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referringClientId_fkey" FOREIGN KEY ("referringClientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referredClientId_fkey" FOREIGN KEY ("referredClientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralClick" ADD CONSTRAINT "ReferralClick_referralId_fkey" FOREIGN KEY ("referralId") REFERENCES "Referral"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralAnalytics" ADD CONSTRAINT "ReferralAnalytics_referralId_fkey" FOREIGN KEY ("referralId") REFERENCES "Referral"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_referralId_fkey" FOREIGN KEY ("referralId") REFERENCES "Referral"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditUsageAnalytics" ADD CONSTRAINT "CreditUsageAnalytics_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomPlanRequest" ADD CONSTRAINT "CustomPlanRequest_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionHistory" ADD CONSTRAINT "SubscriptionHistory_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_priceId_fkey" FOREIGN KEY ("priceId") REFERENCES "PlanPrice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_planStatisticsId_fkey" FOREIGN KEY ("planStatisticsId") REFERENCES "PlanStatistics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanFeature" ADD CONSTRAINT "PlanFeature_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanFeature" ADD CONSTRAINT "PlanFeature_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "Feature"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanPrice" ADD CONSTRAINT "PlanPrice_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditConsumption" ADD CONSTRAINT "CreditConsumption_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditConsumption" ADD CONSTRAINT "CreditConsumption_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "CreditValue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralCredit" ADD CONSTRAINT "ReferralCredit_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralCredit" ADD CONSTRAINT "ReferralCredit_consumedInId_fkey" FOREIGN KEY ("consumedInId") REFERENCES "CreditConsumption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandConsumption" ADD CONSTRAINT "BrandConsumption_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HolidayDiscountRule" ADD CONSTRAINT "HolidayDiscountRule_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "Discount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountRedemption" ADD CONSTRAINT "DiscountRedemption_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "Discount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountRedemption" ADD CONSTRAINT "DiscountRedemption_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountRedemption" ADD CONSTRAINT "DiscountRedemption_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountRedemption" ADD CONSTRAINT "DiscountRedemption_creditValueId_fkey" FOREIGN KEY ("creditValueId") REFERENCES "CreditValue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanInformation" ADD CONSTRAINT "PlanInformation_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanFeatureDisplay" ADD CONSTRAINT "PlanFeatureDisplay_planInfoId_fkey" FOREIGN KEY ("planInfoId") REFERENCES "PlanInformation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Security" ADD CONSTRAINT "Security_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPreferences" ADD CONSTRAINT "UserPreferences_privacyId_fkey" FOREIGN KEY ("privacyId") REFERENCES "Privacy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPreferences" ADD CONSTRAINT "UserPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreferences" ADD CONSTRAINT "NotificationPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLoginAudit" ADD CONSTRAINT "UserLoginAudit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiUsage" ADD CONSTRAINT "ApiUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MessageAttachments" ADD CONSTRAINT "_MessageAttachments_A_fkey" FOREIGN KEY ("A") REFERENCES "ChatMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MessageAttachments" ADD CONSTRAINT "_MessageAttachments_B_fkey" FOREIGN KEY ("B") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToChatRoomParticipant" ADD CONSTRAINT "_UserToChatRoomParticipant_A_fkey" FOREIGN KEY ("A") REFERENCES "ChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToChatRoomParticipant" ADD CONSTRAINT "_UserToChatRoomParticipant_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToChatRoomManager" ADD CONSTRAINT "_UserToChatRoomManager_A_fkey" FOREIGN KEY ("A") REFERENCES "ChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToChatRoomManager" ADD CONSTRAINT "_UserToChatRoomManager_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FreelancerSkills" ADD CONSTRAINT "_FreelancerSkills_A_fkey" FOREIGN KEY ("A") REFERENCES "Freelancer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FreelancerSkills" ADD CONSTRAINT "_FreelancerSkills_B_fkey" FOREIGN KEY ("B") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FreelancerToProject" ADD CONSTRAINT "_FreelancerToProject_A_fkey" FOREIGN KEY ("A") REFERENCES "Freelancer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FreelancerToProject" ADD CONSTRAINT "_FreelancerToProject_B_fkey" FOREIGN KEY ("B") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectTeamToFreelancer" ADD CONSTRAINT "_ProjectTeamToFreelancer_A_fkey" FOREIGN KEY ("A") REFERENCES "Freelancer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectTeamToFreelancer" ADD CONSTRAINT "_ProjectTeamToFreelancer_B_fkey" FOREIGN KEY ("B") REFERENCES "ProjectTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BlockedTalentsOnProject" ADD CONSTRAINT "_BlockedTalentsOnProject_A_fkey" FOREIGN KEY ("A") REFERENCES "Freelancer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BlockedTalentsOnProject" ADD CONSTRAINT "_BlockedTalentsOnProject_B_fkey" FOREIGN KEY ("B") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FreelancerCategories" ADD CONSTRAINT "_FreelancerCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FreelancerCategories" ADD CONSTRAINT "_FreelancerCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "Freelancer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TaskToActivityMany" ADD CONSTRAINT "_TaskToActivityMany_A_fkey" FOREIGN KEY ("A") REFERENCES "ProjectActivity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TaskToActivityMany" ADD CONSTRAINT "_TaskToActivityMany_B_fkey" FOREIGN KEY ("B") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ResourceDocuments" ADD CONSTRAINT "_ResourceDocuments_A_fkey" FOREIGN KEY ("A") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ResourceDocuments" ADD CONSTRAINT "_ResourceDocuments_B_fkey" FOREIGN KEY ("B") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToMeetingParticipant" ADD CONSTRAINT "_UserToMeetingParticipant_A_fkey" FOREIGN KEY ("A") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToMeetingParticipant" ADD CONSTRAINT "_UserToMeetingParticipant_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DeliverableAssignees" ADD CONSTRAINT "_DeliverableAssignees_A_fkey" FOREIGN KEY ("A") REFERENCES "Deliverable"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DeliverableAssignees" ADD CONSTRAINT "_DeliverableAssignees_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RelatedTasksToDeliverables" ADD CONSTRAINT "_RelatedTasksToDeliverables_A_fkey" FOREIGN KEY ("A") REFERENCES "Deliverable"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RelatedTasksToDeliverables" ADD CONSTRAINT "_RelatedTasksToDeliverables_B_fkey" FOREIGN KEY ("B") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlanComparisonToPlanInformation" ADD CONSTRAINT "_PlanComparisonToPlanInformation_A_fkey" FOREIGN KEY ("A") REFERENCES "PlanComparison"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlanComparisonToPlanInformation" ADD CONSTRAINT "_PlanComparisonToPlanInformation_B_fkey" FOREIGN KEY ("B") REFERENCES "PlanInformation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
