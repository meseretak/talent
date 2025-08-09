import { Request, Response } from 'express';
import securityService from '../../../services/security.service';
import securityValidation from '../../../validations/security.validation';

export const generate2FA = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    // No need to validate userId in body anymore
    const { error } = securityValidation.enable2FASchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const result = await securityService.generate2FASecret((req.user as any).id);
    res.json(result);
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
};

export const verify2FA = async (req: Request, res: Response) => {
  try {
    const { error } = securityValidation.verify2FASchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const result = await securityService.verify2FAToken(req.body.userId, req.body.token);
    res.json(result);
  } catch (err: unknown) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

export const disable2FA = async (req: Request, res: Response) => {
  try {
    const { error } = securityValidation.enable2FASchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const result = await securityService.disable2FA(req.body.userId);
    res.json(result);
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
};

export const verifyCode = async (req: Request, res: Response) => {
  try {
    const { error } = securityValidation.verifyCodeSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const result = await securityService.verifyCode(req.body.userId, req.body.code);
    res.json(result);
  } catch (err: unknown) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};
