import { Request, Response } from 'express';
import { services } from '../../../services';
import { CreateComparisonDto, CreatePlanInformationDto } from '../../../types/plan';

export class PricingController {
  static async getPlanInformation(req: Request, res: Response) {
    try {
      const { planId } = req.params;
      const planInfo = await services.pricing.getPlanInformation(planId);

      if (!planInfo && planId) {
        return res.status(404).json({ error: `Plan information for plan ID ${planId} not found` });
      }

      res.json(planInfo);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  }

  static async getComparisons(req: Request, res: Response) {
    try {
      const comparisons = await services.pricing.getComparisons();
      res.json(comparisons);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  }

  static async getComparisonTable(req: Request, res: Response) {
    try {
      const { comparisonId } = req.params;

      if (!comparisonId) {
        return res.status(400).json({ error: 'Comparison ID is required' });
      }

      const comparisonTable = await services.pricing.getComparisonTable(comparisonId);

      if (!comparisonTable) {
        return res.status(404).json({ error: `Comparison with ID ${comparisonId} not found` });
      }

      res.json(comparisonTable);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  }

  static async createPlanInformation(req: Request, res: Response) {
    try {
      const planInfoData: CreatePlanInformationDto = req.body;

      // Validate required fields
      if (!planInfoData.planId || !planInfoData.displayName || !planInfoData.priceDescription) {
        return res.status(400).json({
          error: 'Missing required fields: planId, displayName, and priceDescription are required',
        });
      }

      const newPlanInfo = await services.pricing.createPlanInformation(planInfoData);
      res.status(201).json(newPlanInfo);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res
        .status(error instanceof Error && error.message.includes('not found') ? 404 : 500)
        .json({ error: errorMessage });
    }
  }

  static async createComparison(req: Request, res: Response) {
    try {
      const comparisonData: CreateComparisonDto = req.body;

      // Validate required fields
      if (!comparisonData.title || !comparisonData.planIds || comparisonData.planIds.length < 2) {
        return res.status(400).json({
          error: 'Missing required fields: title and at least 2 planIds are required',
        });
      }

      const newComparison = await services.pricing.createComparison(comparisonData);
      res.status(201).json(newComparison);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res
        .status(error instanceof Error && error.message.includes('not found') ? 404 : 500)
        .json({ error: errorMessage });
    }
  }
}
