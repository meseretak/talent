import { z } from 'zod';

// Define the condition types for policies
export type Condition =
  | { type: 'allOf'; conditions: Condition[] }
  | { type: 'anyOf'; conditions: Condition[] }
  | { type: 'not'; condition: Condition }
  | { type: 'attribute'; attribute: string; operator: string; value?: any };

// Define the policy target
export type PolicyTarget = {
  role?: string[];
  resources: string[];
  actions: string[];
};

// Define the policy structure
export type Policy = {
  id: string;
  effect: 'allow' | 'deny';
  description?: string;
  priority: number;
  target: PolicyTarget;
  conditions: Condition;
};

// Define the context for policy evaluation
export type AttributeContext = {
  action: string;
  user: {
    id: string;
    role: string[];
    department?: string;
    [key: string]: any;
  };
  resource: {
    type: string;
    ownerId?: string;
    [key: string]: any;
  };
  environment: {
    time: string;
    date: string;
    ip?: string;
    location?: string;
    [key: string]: any;
  };
};

// Zod schema for validating conditions
export const conditionSchema: z.ZodType<Condition> = z.lazy(() =>
  z.discriminatedUnion('type', [
    z.object({
      type: z.literal('allOf'),
      conditions: z.array(z.lazy(() => conditionSchema)),
    }),
    z.object({
      type: z.literal('anyOf'),
      conditions: z.array(z.lazy(() => conditionSchema)),
    }),
    z.object({
      type: z.literal('not'),
      condition: z.lazy(() => conditionSchema),
    }),
    z.object({
      type: z.literal('attribute'),
      attribute: z.string(),
      operator: z.string(),
      value: z.any().optional().default(null),
    }),
  ]),
);

// Zod schema for validating policies
export const policySchema = z.object({
  id: z.string(),
  effect: z.enum(['allow', 'deny']),
  description: z.string().optional(),
  priority: z.number().int().positive(),
  target: z.object({
    role: z.array(z.string()).optional(),
    resources: z.array(z.string()).nonempty(),
    actions: z.array(z.string()).nonempty(),
  }),
  conditions: conditionSchema,
});

// Custom errors for policy validation and evaluation
export class PolicyValidationError extends Error {
  constructor(message: string, public readonly zodError?: z.ZodError) {
    super(
      zodError ? `${message}: ${zodError.errors.map((e: any) => e.message).join(', ')}` : message,
    );
    this.name = 'PolicyValidationError';
  }
}

export class PolicyEvaluationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PolicyEvaluationError';
  }
}
