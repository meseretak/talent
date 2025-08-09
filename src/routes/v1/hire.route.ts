import { Router } from 'express';
import {
  fireFreelancer,
  getClientsFreelancers,
  getMyClients,
  getMyFreelancers,
  hireFreelancer,
  isFreelancerHired,
  saveFreelancer,
} from '../../controllers/v1/hire/hire.controller';

const router = Router();

// Hire a freelancer
router.post('/freelancer', hireFreelancer);

// Fire a freelancer
router.post('/fire', fireFreelancer);

// Save a freelancer for future hiring
router.post('/save', saveFreelancer);

// List all freelancers hired by a client
router.get('/client/:clientId/freelancers', getClientsFreelancers); // Old route

router.get('/my-talents', getMyFreelancers); // New route for authenticated client

// List all clients who have hired a freelancer
router.get('/freelancer/:freelancerId/clients', getMyClients);

// Check if a freelancer is currently hired by a client
router.get('/is-hired', isFreelancerHired);

export default router;
