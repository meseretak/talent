/**
 * Utility class for consistent date handling in subscription system
 */
export class DateUtils {
  /**
   * Get the current date in a consistent format
   * @returns Current date
   */
  static getCurrentDate(): Date {
    return new Date();
  }

  /**
   * Calculate the end date for a subscription period based on billing cycle
   * @param billingCycle The billing cycle (MONTHLY, ANNUALLY)
   * @param startDate The start date (defaults to current date)
   * @returns The calculated end date
   */
  static calculatePeriodEnd(billingCycle: string, startDate?: Date): Date {
    const start = startDate || this.getCurrentDate();
    const end = new Date(start);

    switch (billingCycle?.toUpperCase()) {
      case 'ANNUALLY':
        end.setFullYear(end.getFullYear() + 1);
        break;
      case 'MONTHLY':
      default:
        end.setMonth(end.getMonth() + 1);
        break;
    }

    return end;
  }

  /**
   * Calculate the end date for a custom plan based on duration
   * @param durationMonths Number of months for the custom plan
   * @param startDate The start date (defaults to current date)
   * @returns The calculated end date
   */
  static calculateCustomPlanEnd(durationMonths: number, startDate?: Date): Date {
    const start = startDate || this.getCurrentDate();
    const end = new Date(start);
    end.setMonth(end.getMonth() + durationMonths);
    return end;
  }

  /**
   * Convert a Unix timestamp to a Date object
   * @param timestamp Unix timestamp in seconds
   * @returns Date object
   */
  static fromUnixTimestamp(timestamp: number): Date {
    return new Date(timestamp * 1000);
  }

  /**
   * Check if a date is in the past
   * @param date The date to check
   * @returns True if the date is in the past
   */
  static isExpired(date: Date): boolean {
    return date < this.getCurrentDate();
  }

  /**
   * Get the number of days remaining until a date
   * @param endDate The end date
   * @returns Number of days remaining
   */
  static getDaysRemaining(endDate: Date): number {
    const now = this.getCurrentDate();
    const diffTime = endDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Format a date for display
   * @param date The date to format
   * @returns Formatted date string
   */
  static formatForDisplay(date: Date): string {
    return date.toLocaleDateString();
  }
}
