import express from 'express';
import clientController from '../../controllers/v1/user/client.controller';
import auth from '../../middlewares/auth';
import validate from '../../middlewares/validate';
import clientValidation from '../../validations/client.validation';

const router = express.Router();

// Routes available to authenticated users
router.use(auth());

// Get client types for dropdowns
router.get('/types', clientController.getClientTypes);

// Get all clients (with pagination and filtering)
router.get('/', validate(clientValidation.getAllClients), clientController.getAllClients);

// Get current user's client profile
router.get('/me', clientController.getMyClientProfile);

// Create client profile
router.post('/', validate(clientValidation.createClient), clientController.createClient);

// Get client by ID
router.get('/:id', validate(clientValidation.getClient), clientController.getClientById);

// Get client statistics
router.get(
  '/:id/stats',
  validate(clientValidation.getClientStats),
  clientController.getClientStats,
);

// Get client projects
router.get(
  '/:id/projects',
  validate(clientValidation.getClientProjects),
  clientController.getClientProjects,
);

// Update client profile
router.patch('/:id', validate(clientValidation.updateClient), clientController.updateClient);

// Delete client
router.delete('/:id', validate(clientValidation.deleteClient), clientController.deleteClient);

export default router;
