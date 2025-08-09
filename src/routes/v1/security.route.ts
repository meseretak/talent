import express from 'express';
import {
  disable2FA,
  generate2FA,
  verify2FA,
  verifyCode,
} from '../../controllers/v1/user/security.controller';
import auth from '../../middlewares/auth';

const router = express.Router();
router.use(auth());

router.post('/2fa/generate', auth(), generate2FA);
router.post('/2fa/verify', auth(), verify2FA);
router.post('/2fa/disable', auth(), disable2FA);
router.post('/2fa/verify-code', auth(), verifyCode);

export default router;
