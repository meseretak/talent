import { CreditTransaction, PrismaClient, ReferralCreditStatus } from '../../generated/prisma';
import generateEmailHTML from '../../template/email';
import { ReferralProgramSettingsDto, ReferralSettingsDto } from '../../types/referral';
import ApiError from '../../utils/ApiError';
import emailService from '../communication/email.service';

// Enhanced interfaces for worldwide implementation
interface ReferralLocalization {
  language: string;
  currency: string;
  timezone: string;
  dateFormat: string;
  numberFormat: string;
}

interface ReferralData {
  ipAddress: string;
  userAgent?: string;
  location?: string;
  timestamp: Date;
  referringUserId: string;
}

interface FraudScore {
  score: number;
  riskLevel: 'low' | 'medium' | 'high';
  indicators: string[];
}

interface ComplianceResult {
  isAllowed: boolean;
  restrictions: string[];
  requiredDisclosures: string[];
  maxRewardAmount?: number;
}

export class ReferralService {
  // Default settings that can be used by the controller
  readonly creditPerReferral: number = 10;
  readonly expirationDays: number = 30;

  constructor(private prisma: PrismaClient) {}

  /**
   * Enhanced referral credit creation with internationalization support
   */
  async createReferralCredit(
    referrerId: number,
    referredEmail: string,
    creditAmount: number,
    expiresInDays: number,
    locale?: ReferralLocalization,
  ) {
    // Find the client's active subscription
    const subscription = await this.prisma.subscription.findFirst({
      where: { clientId: referrerId, status: 'ACTIVE' },
      include: { client: { include: { user: true } } },
    });

    if (!subscription) throw new ApiError(404, 'Active subscription not found');

    // Check regional compliance (using default country for now)
    const compliance = await this.checkRegionalCompliance('US', 'referral_credit');

    if (!compliance.isAllowed) {
      throw new ApiError(
        403,
        `Referral program not available in your region: ${compliance.restrictions.join(', ')}`,
      );
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // Create the referral credit connected to the subscription
    const referralCredit = await this.prisma.referralCredit.create({
      data: {
        subscription: { connect: { id: subscription.id } },
        creditAmount,
        referredUserEmail: referredEmail,
        expiresAt,
        status: ReferralCreditStatus.ACTIVE,
      },
    });

    // Send localized email notification
    if (subscription.client?.user?.email) {
      try {
        const subject = this.getLocalizedSubject('referral_reward', locale?.language || 'en');
        const text = this.getLocalizedText('referral_reward', locale?.language || 'en', {
          credits: creditAmount,
          referredEmail,
        });

        const htmlContent = generateEmailHTML('referral_reward', {
          name: `${subscription.client.user.firstName || ''} ${
            subscription.client.user.lastName || ''
          }`,
          referralCode: subscription.client.referralCode || 'N/A',
          credits: creditAmount,
          remainingCredits: (subscription.customCredits || 0) + creditAmount,
          expiresAt: this.formatDate(expiresAt, locale),
          referredEmail,
          dashboardLink: `${process.env.FRONTEND_URL}/dashboard/referrals`,
        });

        await emailService.sendEmail(subscription.client.user.email, subject, text, htmlContent);
      } catch (emailError) {
        console.error('Failed to send referral email:', emailError);
      }
    }

    return referralCredit;
  }

  /**
   * Enhanced referral link generation with internationalization
   */
  async generateReferralLink(
    userId: number,
    baseUrl: string,
    locale?: ReferralLocalization,
  ): Promise<string> {
    const client = await this.prisma.client.findFirst({
      where: { user: { id: userId } },
    });

    if (!client) throw new ApiError(404, 'Client not found');

    // Generate unique referral code
    const referralCode = this.generateUniqueCode();

    // Create localized URL
    const localizedUrl = locale?.language
      ? `${baseUrl}/${locale.language}/refer/${referralCode}`
      : `${baseUrl}/refer/${referralCode}`;

    // Set expiry date
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + this.expirationDays);

    // Create coupon code
    const couponCode = `REF-${referralCode.substring(0, 6).toUpperCase()}`;

    // Create the referral record
    await this.prisma.referral.create({
      data: {
        referringClient: { connect: { id: client.id } },
        referredClient: { connect: { id: client.id } },
        referralDate: new Date(),
        status: 'pending',
        discountCredits: this.creditPerReferral,
        discountApplied: false,
        expiryDate,
        referralLink: localizedUrl,
        couponCode,
        linkClicks: 0,
        signups: 0,
      },
    });

    return localizedUrl;
  }

  /**
   * Enhanced click tracking with fraud detection
   */
  async trackReferralClick(
    referralCode: string,
    ipAddress: string,
    userAgent?: string,
    location?: string,
  ): Promise<void> {
    // Find the client with this referral code
    const client = await this.prisma.client.findFirst({
      where: { referralCode },
    });

    if (!client) throw new ApiError(404, 'Invalid referral code');

    // Fraud detection
    const fraudScore = await this.detectFraudulentActivity({
      ipAddress,
      userAgent,
      location,
      timestamp: new Date(),
      referringUserId: client.id.toString(),
    });

    if (fraudScore.riskLevel === 'high') {
      console.warn(`High fraud risk detected for referral code: ${referralCode}`, fraudScore);
      // Continue tracking but flag for review
    }

    // Find or create a referral record
    let referral = await this.prisma.referral.findFirst({
      where: {
        referringClientId: client.id,
        referredIp: ipAddress,
      },
    });

    if (!referral) {
      const referralLink = `${process.env.FRONTEND_URL}/refer/${referralCode}`;
      const couponCode = `REF-${referralCode.substring(0, 6).toUpperCase()}`;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + this.expirationDays);

      referral = await this.prisma.referral.create({
        data: {
          referringClient: { connect: { id: client.id } },
          referredIp: ipAddress,
          referredUserAgent: userAgent,
          referredLocation: location,
          referralDate: new Date(),
          status: 'pending',
          linkClicks: 1,
          signups: 0,
          discountCredits: this.creditPerReferral,
          expiryDate,
          referralLink,
          couponCode,
          referredClient: { connect: { id: client.id } },
        },
      });
    } else {
      // Update existing referral with new click
      await this.prisma.referral.update({
        where: { id: referral.id },
        data: {
          linkClicks: { increment: 1 },
          lastClickedAt: new Date(),
        },
      });
    }

    // Record the click
    await this.prisma.referralClick.create({
      data: {
        referral: { connect: { id: referral.id } },
        ipAddress,
        userAgent,
        location,
        clickedAt: new Date(),
      },
    });

    // Update analytics
    await this.updateReferralAnalytics(referral.id);
  }

  /**
   * Enhanced fraud detection system
   */
  private async detectFraudulentActivity(referralData: ReferralData): Promise<FraudScore> {
    const indicators: string[] = [];
    let score = 0;

    // Check IP reputation
    const ipReputation = await this.checkIPReputation(referralData.ipAddress);
    if (ipReputation < 0.3) {
      indicators.push('suspicious_ip');
      score += 0.4;
    }

    // Check user agent patterns
    if (referralData.userAgent) {
      const userAgentScore = this.checkUserAgentPattern(referralData.userAgent);
      if (userAgentScore > 0.7) {
        indicators.push('suspicious_user_agent');
        score += 0.3;
      }
    }

    // Check geographic anomalies
    if (referralData.location) {
      const geoScore = await this.checkGeographicAnomalies(referralData.location);
      if (geoScore > 0.6) {
        indicators.push('geographic_anomaly');
        score += 0.2;
      }
    }

    // Check temporal patterns
    const temporalScore = await this.checkTemporalPatterns(
      referralData.timestamp,
      referralData.referringUserId,
    );
    if (temporalScore > 0.5) {
      indicators.push('temporal_anomaly');
      score += 0.1;
    }

    return {
      score: Math.min(score, 1),
      riskLevel: score < 0.3 ? 'low' : score < 0.7 ? 'medium' : 'high',
      indicators,
    };
  }

  /**
   * Check IP reputation
   */
  private async checkIPReputation(ipAddress: string): Promise<number> {
    // TODO: Implement actual IP reputation checking
    // For now, return a default score
    return 0.5;
  }

  /**
   * Check user agent patterns
   */
  private checkUserAgentPattern(userAgent: string): number {
    const suspiciousPatterns = [
      'bot',
      'crawler',
      'spider',
      'scraper',
      'headless',
      'phantom',
      'selenium',
      'webdriver',
      'automation',
    ];

    const lowerUserAgent = userAgent.toLowerCase();
    const matches = suspiciousPatterns.filter((pattern) => lowerUserAgent.includes(pattern));

    return matches.length / suspiciousPatterns.length;
  }

  /**
   * Check geographic anomalies
   */
  private async checkGeographicAnomalies(location: string): Promise<number> {
    // TODO: Implement geographic anomaly detection
    return 0.1;
  }

  /**
   * Check temporal patterns
   */
  private async checkTemporalPatterns(timestamp: Date, referringUserId: string): Promise<number> {
    // Check for rapid successive clicks
    const recentClicks = await this.prisma.referralClick.count({
      where: {
        referral: {
          referringClientId: parseInt(referringUserId),
        },
        clickedAt: {
          gte: new Date(timestamp.getTime() - 5 * 60 * 1000), // Last 5 minutes
        },
      },
    });

    return recentClicks > 10 ? 0.8 : 0.1;
  }

  /**
   * Check regional compliance
   */
  private async checkRegionalCompliance(
    country: string,
    referralType: string,
  ): Promise<ComplianceResult> {
    // TODO: Implement actual compliance checking
    // For now, return default compliance
    return {
      isAllowed: true,
      restrictions: [],
      requiredDisclosures: [],
    };
  }

  /**
   * Get localized subject
   */
  private getLocalizedSubject(template: string, language: string): string {
    const subjects: Record<string, Record<string, string>> = {
      referral_reward: {
        en: 'Referral Credits Added',
        es: 'Créditos de Referencia Agregados',
        fr: 'Crédits de Parrainage Ajoutés',
        de: 'Empfehlungsguthaben Hinzugefügt',
        zh: '推荐积分已添加',
      },
    };

    return subjects[template]?.[language] || subjects[template]?.en || 'Referral Credits Added';
  }

  /**
   * Get localized text
   */
  private getLocalizedText(template: string, language: string, params: any): string {
    const texts: Record<string, Record<string, string>> = {
      referral_reward: {
        en: `You've received ${params.credits} referral credits for inviting ${params.referredEmail}`,
        es: `Has recibido ${params.credits} créditos de referencia por invitar a ${params.referredEmail}`,
        fr: `Vous avez reçu ${params.credits} crédits de parrainage pour avoir invité ${params.referredEmail}`,
        de: `Sie haben ${params.credits} Empfehlungsguthaben für die Einladung von ${params.referredEmail} erhalten`,
        zh: `您因邀请 ${params.referredEmail} 而获得了 ${params.credits} 推荐积分`,
      },
    };

    return (
      texts[template]?.[language] ||
      texts[template]?.en ||
      `You've received ${params.credits} referral credits`
    );
  }

  /**
   * Format date according to locale
   */
  private formatDate(date: Date, locale?: ReferralLocalization): string {
    if (!locale) return date.toLocaleDateString();

    return date.toLocaleDateString(locale.language, {
      timeZone: locale.timezone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  async getReferralStats(clientId: number) {
    // Get client with their active subscription
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      include: {
        user: true,
        subscription: {
          where: { status: 'ACTIVE' },
        },
      },
    });

    if (!client) {
      throw new ApiError(404, 'Client not found');
    }

    const activeSubscription = client.subscription;

    if (!activeSubscription) {
      return {
        totalReferrals: 0,
        creditEarned: 0,
        referralCode: client.referralCode || '',
        referrals: 0,
        totalClicks: 0,
        totalSignups: 0,
      };
    }

    // Get referral credits through subscription
    const [totalReferrals, creditEarned] = await Promise.all([
      this.prisma.referralCredit.count({
        where: { subscriptionId: activeSubscription.id },
      }),
      this.prisma.referralCredit.aggregate({
        where: { subscriptionId: activeSubscription.id },
        _sum: { creditAmount: true },
      }),
    ]);

    // Get referral information
    const referrals = await this.prisma.referral.findMany({
      where: { referringClientId: clientId },
    });

    // Calculate total clicks and signups
    const totalClicks = await this.prisma.referralClick.count({
      where: {
        referral: {
          referringClientId: clientId,
        },
      },
    });

    const totalSignups = referrals.reduce(
      (sum, ref) => sum + (ref.status === 'completed' ? 1 : 0),
      0,
    );

    return {
      totalReferrals,
      creditEarned: creditEarned._sum.creditAmount || 0,
      referralCode: client.referralCode,
      referrals: referrals.length,
      totalClicks,
      totalSignups,
    };
  }

  private generateUniqueCode(): string {
    // Generate a random 8-character alphanumeric code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  async completeReferral(referralLink: string, newClientId: number): Promise<void> {
    // Find the referral with this link
    const referral = await this.prisma.referral.findUnique({
      where: { referralLink },
    });

    if (!referral) throw new ApiError(404, 'Invalid referral link');
    if (referral.isCompleted) throw new ApiError(400, 'Referral already completed');

    // Update the referral record
    await this.prisma.referral.update({
      where: { id: referral.id },
      data: {
        referredClient: { connect: { id: newClientId } },
        status: 'completed',
        signups: { increment: 1 },
        isCompleted: true,
      },
    });

    // Find the most recent click and update it to converted
    const mostRecentClick = await this.prisma.referralClick.findFirst({
      where: {
        referralId: referral.id,
        converted: false,
      },
      orderBy: {
        clickedAt: 'desc',
      },
    });

    if (mostRecentClick) {
      await this.prisma.referralClick.update({
        where: { id: mostRecentClick.id },
        data: { converted: true },
      });
    }

    // Process the reward
    await this.processReferralReward(referral.id);

    // Update analytics
    await this.updateReferralAnalytics(referral.id);
  }

  async countPendingReferrals(clientId: number): Promise<number> {
    // Count referrals that haven't been converted to signups yet
    const referrals = await this.prisma.referral.count({
      where: {
        referringClientId: clientId,
        status: 'pending',
      },
    });

    return referrals;
  }

  async updateReferralSettings(settings: ReferralProgramSettingsDto): Promise<void> {
    try {
      // Update the SystemSettings table with new values
      await this.prisma.systemSettings.update({
        where: { id: '1' }, // Assuming there's a default record with id '1'
        data: {
          creditPerReferral: settings.creditPerReferral,
          referralExpirationDays: settings.expirationDays,
          // Map other fields as needed
        },
      });
    } catch (error) {
      // Fallback to console log if update fails
      console.log('Referral program settings update failed:', error);
      // Consider creating the record or throwing a more specific error
    }
  }

  async getReferralSettings(): Promise<ReferralSettingsDto> {
    try {
      const settings = await this.prisma.systemSettings.findFirst();

      if (settings) {
        return {
          creditPerReferral: settings.creditPerReferral,
          expirationDays: settings.referralExpirationDays,
        };
      }
    } catch (error) {
      // Table might not exist or other error
    }

    // Return default settings
    return {
      creditPerReferral: this.creditPerReferral,
      expirationDays: this.expirationDays,
    };
  }

  // Referral Reward Service
  async processReferralReward(referralId: number): Promise<CreditTransaction | null> {
    // Get the referral with related data
    const referral = await this.prisma.referral.findUnique({
      where: { id: referralId },
      include: {
        referringClient: {
          include: {
            user: true, // Ensure user information is included
            subscription: {
              where: { status: 'ACTIVE' },
            },
          },
        },
      },
    });

    if (!referral) throw new ApiError(404, 'Referral not found');
    if (referral.status !== 'completed') throw new ApiError(400, 'Referral is not completed');
    if (referral.discountApplied) throw new ApiError(400, 'Reward already applied');

    // Get the active subscription
    const subscription = referral.referringClient.subscription;
    if (!subscription) throw new ApiError(404, 'No active subscription found');

    // Create a credit transaction
    const transaction = await this.prisma.creditTransaction.create({
      data: {
        client: { connect: { id: referral.referringClientId } },
        subscription: { connect: { id: subscription.id } },
        amount: referral.discountCredits,
        type: 'REFERRAL',
        description: `Referral reward for inviting a new user`,
        remaining: (subscription.customCredits || 0) + referral.discountCredits,
        referral: { connect: { id: referralId } }, // Connect to the referral
      },
    });

    // Update the referral to mark discount as applied
    await this.prisma.referral.update({
      where: { id: referralId },
      data: {
        discountApplied: true,
        rewardsEarned: referral.discountCredits,
        activeUsers: 1,
      },
    });

    // Send email notification
    const referringClient = referral.referringClient;

    if (referringClient?.user?.email) {
      const subject = 'Referral Reward Earned!';
      const text = `You've earned ${referral.discountCredits} credits from your referral!`;
      const htmlContent = generateEmailHTML('referral_reward', {
        name: `${referringClient.user.firstName || ''} ${referringClient.user.lastName || ''}`,
        credits: referral.discountCredits,
        dashboardLink: `${process.env.FRONTEND_URL}/dashboard/referrals`,
      });

      await emailService.sendEmail(referringClient.user.email, subject, text, htmlContent);
    }

    return transaction;
  }

  // New method to update referral analytics
  private async updateReferralAnalytics(referralId: number): Promise<void> {
    const referral = await this.prisma.referral.findUnique({
      where: { id: referralId },
      include: {
        clicks: true,
        creditTransactions: true,
      },
    });

    if (!referral) return;

    // Calculate conversion rate
    const conversionRate =
      referral.linkClicks > 0 ? (referral.signups / referral.linkClicks) * 100 : 0;

    // Calculate average spend (if applicable)
    const totalRewards = Number(referral.rewardsEarned);

    // Calculate time to conversion (if applicable)
    let timeToConversion = null;
    if (referral.status === 'completed' && referral.lastClickedAt && referral.referralDate) {
      const conversionTime = referral.lastClickedAt.getTime() - referral.referralDate.getTime();
      timeToConversion = Math.floor(conversionTime / (1000 * 60 * 60 * 24)); // Convert to days
    }

    // Update or create analytics record
    await this.prisma.referralAnalytics.upsert({
      where: {
        id: `${referralId}`, // Convert to string if needed
      },
      update: {
        conversionRate,
        averageSpend: totalRewards,
        timeToConversion,
        updatedAt: new Date(),
      },
      create: {
        referral: { connect: { id: referralId } },
        conversionRate,
        averageSpend: totalRewards,
        timeToConversion,
        deviceBreakdown: {},
        locationData: {},
      },
    });
  }

  async getReferralAnalytics(referralId: number) {
    const analytics = await this.prisma.referralAnalytics.findFirst({
      where: { referralId },
      include: {
        referral: {
          include: {
            clicks: true,
            creditTransactions: true,
          },
        },
      },
    });

    if (!analytics) {
      throw new ApiError(404, 'Referral analytics not found');
    }

    return analytics;
  }
}

export default new ReferralService(new PrismaClient());
