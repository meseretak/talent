import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import {
  AttributeContext,
  Condition,
  Policy,
  PolicyEvaluationError,
  PolicyValidationError,
  policySchema,
} from './types';

/**
 * Base Policy Engine for handling attribute-based access control
 */
export class PolicyEngine {
  private static policyCache = new Map<string, Policy[]>();
  private static conditionCache = new Map<string, boolean>();
  private static initialized = false;
  private static policies: Policy[] = []; // Add this line

  /**
   * Initialize the policy engine by loading policies from the policies directory
   * @returns Promise that resolves when initialization is complete
   */
  static async initializeFromFiles() {
    if (this.initialized) return;

    try {
      // Load all policy files from the policies directory
      const policiesDir = path.join(__dirname, 'policies');
      const policyFiles = fs.readdirSync(policiesDir);

      for (const file of policyFiles) {
        if (file.endsWith('.json')) {
          const policyContent = fs.readFileSync(path.join(policiesDir, file), 'utf8');
          const policies = JSON.parse(policyContent);
          this.policies.push(...policies);
        }
      }

      // Validate and build cache with loaded policies
      this.validatePolicies(this.policies);
      this.buildPolicyCache(this.policies);

      this.initialized = true;
      console.log('Policy Engine initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Policy Engine:', error);
      throw error;
    }
  }

  // Remove the duplicate sync initialize method
  /**
   * Initialize the policy engine with the provided policies
   * @param policies Array of policies to initialize the engine with
   */
  static initialize(policies: Policy[]): void {
    try {
      this.validatePolicies(policies);
      this.buildPolicyCache(policies);
      this.initialized = true;
    } catch (error) {
      if (error instanceof PolicyValidationError) {
        throw error;
      }
      throw new PolicyValidationError('Failed to initialize policy engine');
    }
  }

  /**
   * Validate the provided policies against the policy schema
   * @param policies Array of policies to validate
   */
  private static validatePolicies(policies: Policy[]): void {
    const result = z.array(policySchema).safeParse(policies);
    if (!result.success) {
      throw new PolicyValidationError('Invalid policy configuration', result.error);
    }
  }

  /**
   * Build the policy cache for faster lookup during evaluation
   * @param policies Array of policies to cache
   */
  private static buildPolicyCache(policies: Policy[]): void {
    // Clear existing cache
    this.policyCache.clear();
    this.conditionCache.clear();

    // Build new cache
    policies.forEach((policy) => {
      policy.target.resources.forEach((resource) => {
        policy.target.actions.forEach((action) => {
          const key = this.getCacheKey(resource, action);
          const existing = this.policyCache.get(key) || [];
          this.policyCache.set(key, [...existing, policy]);
        });
      });
    });

    // Sort policies by priority (higher priority first)
    Array.from(this.policyCache.entries()).forEach(([key, policies]) => {
      this.policyCache.set(
        key,
        policies.sort((a, b) => b.priority - a.priority),
      );
    });
  }

  /**
   * Get the cache key for a resource and action
   * @param resource Resource type
   * @param action Action type
   * @returns Cache key string
   */
  private static getCacheKey(resource: string, action: string): string {
    return `${resource}:${action}`;
  }

  /**
   * Get the condition cache key for a policy and context
   * @param policyId Policy ID
   * @param context Attribute context
   * @returns Condition cache key string
   */
  private static getConditionCacheKey(policyId: string, context: AttributeContext): string {
    // Create a simplified context to use as a cache key
    const simplifiedContext = {
      user: { id: context.user.id, roles: context.user.roles },
      resource: { type: context.resource.type, id: context.resource.id },
      action: context.action,
    };
    return `${policyId}:${JSON.stringify(simplifiedContext)}`;
  }

  /**
   * Evaluate access based on the provided context
   * @param context Attribute context for evaluation
   * @returns Boolean indicating if access is allowed
   */
  static evaluate(context: AttributeContext): boolean {
    if (!this.initialized) {
      throw new PolicyEvaluationError('Policy engine not initialized');
    }

    const applicablePolicies = this.getApplicablePolicies(context.resource.type, context.action);

    if (applicablePolicies.length === 0) {
      return false; // No applicable policies, deny by default
    }

    let allowDecision: boolean | null = null;

    for (const policy of applicablePolicies) {
      if (!this.isTargetMatch(policy, context)) continue;

      const cacheKey = this.getConditionCacheKey(policy.id, context);
      let result = this.conditionCache.get(cacheKey);

      if (result === undefined) {
        result = this.evaluateConditions(policy.conditions, context);
        this.conditionCache.set(cacheKey, result);
      }

      if (result) {
        if (policy.effect === 'deny') return false; // Explicit deny takes precedence
        if (allowDecision === null) {
          allowDecision = true;
        }
      }
    }

    return allowDecision ?? false; // Default to deny if no policy matched
  }

  /**
   * Get applicable policies for a resource and action
   * @param resource Resource type
   * @param action Action type
   * @returns Array of applicable policies
   */
  private static getApplicablePolicies(resource: string, action: string): Policy[] {
    const key = this.getCacheKey(resource, action);
    return this.policyCache.get(key) || [];
  }

  /**
   * Check if a policy's target matches the context
   * @param policy Policy to check
   * @param context Attribute context
   * @returns Boolean indicating if the target matches
   */
  private static isTargetMatch(policy: Policy, context: AttributeContext): boolean {
    // Check if user roles match (if roles are specified in the policy)
    if (
      policy.target.role &&
      policy.target.role.length > 0 &&
      !policy.target.role.some((role) => context.user.roles.includes(role))
    ) {
      return false;
    }

    // Check if resource and action match
    return (
      policy.target.resources.includes(context.resource.type) &&
      policy.target.actions.includes(context.action)
    );
  }

  /**
   * Evaluate conditions recursively
   * @param condition Condition to evaluate
   * @param context Attribute context
   * @returns Boolean result of condition evaluation
   */
  private static evaluateConditions(condition: Condition, context: AttributeContext): boolean {
    switch (condition.type) {
      case 'allOf':
        return condition.conditions.every((c) => this.evaluateConditions(c, context));
      case 'anyOf':
        return condition.conditions.some((c) => this.evaluateConditions(c, context));
      case 'not':
        return !this.evaluateConditions(condition.condition, context);
      case 'attribute':
        return this.evaluateAttribute(condition, context);
      default:
        throw new PolicyEvaluationError('Invalid condition type');
    }
  }

  /**
   * Evaluate an attribute condition
   * @param condition Attribute condition
   * @param context Attribute context
   * @returns Boolean result of attribute evaluation
   */
  private static evaluateAttribute(condition: any, context: AttributeContext): boolean {
    try {
      const value = this.getAttributeValue(condition.attribute, context);

      // Handle template values (e.g., {{user.id}})
      let expectedValue = condition.value;
      if (typeof expectedValue === 'string' && expectedValue.match(/\{\{.*\}\}/)) {
        expectedValue = this.resolveTemplate(expectedValue, context);
      }

      return this.compareValues(value, condition.operator, expectedValue);
    } catch (error) {
      console.error(`Error evaluating attribute: ${error}`);
      return false;
    }
  }

  /**
   * Resolve template values in policy conditions
   * @param template Template string (e.g., {{user.id}})
   * @param context Attribute context
   * @returns Resolved value
   */
  private static resolveTemplate(template: string, context: AttributeContext): any {
    return template.replace(/\{\{(.*?)\}\}/g, (match, path) => {
      return this.getAttributeValue(path.trim(), context);
    });
  }

  /**
   * Get attribute value from context using dot notation
   * @param path Attribute path (e.g., user.department)
   * @param context Attribute context
   * @returns Attribute value
   */
  private static getAttributeValue(path: string, context: AttributeContext): any {
    const [scope, ...keys] = path.split('.');
    let obj;

    switch (scope) {
      case 'user':
        obj = context.user;
        break;
      case 'resource':
        obj = context.resource;
        break;
      case 'environment':
        obj = context.environment;
        break;
      default:
        throw new PolicyEvaluationError(`Invalid attribute scope: ${scope}`);
    }

    return keys.reduce((result, key) => {
      if (result === undefined || result === null) {
        return undefined;
      }
      return result[key];
    }, obj);
  }

  /**
   * Compare values using the specified operator
   * @param actual Actual value
   * @param operator Comparison operator
   * @param expected Expected value
   * @returns Boolean result of comparison
   */
  private static compareValues(actual: any, operator: string, expected: any): boolean {
    switch (operator.toLowerCase()) {
      case 'equals':
        return actual === expected;
      case 'notequals':
        return actual !== expected;
      case 'in':
        return Array.isArray(expected) && expected.includes(actual);
      case 'notin':
        return Array.isArray(expected) && !expected.includes(actual);
      case 'contains':
        return typeof actual === 'string' && actual.includes(expected);
      case 'startswith':
        return typeof actual === 'string' && actual.startsWith(expected);
      case 'endswith':
        return typeof actual === 'string' && actual.endsWith(expected);
      case 'greaterthan':
        return actual > expected;
      case 'lessthan':
        return actual < expected;
      case 'between':
        return (
          Array.isArray(expected) &&
          expected.length === 2 &&
          actual >= expected[0] &&
          actual <= expected[1]
        );
      case 'hasrole':
        return Array.isArray(actual) && actual.includes(expected);
      default:
        throw new PolicyEvaluationError(`Invalid operator: ${operator}`);
    }
  }
}

export default PolicyEngine;
