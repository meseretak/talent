import { NextFunction, Request, Response } from 'express';
import { NotificationType, User } from '../../../generated/prisma';
import services from '../../../services';
import notificationService from '../../../services/communication/notification.service';

// Hire a freelancer for a client
export async function hireFreelancer(req: Request, res: Response, next: NextFunction) {
  try {
    const { clientId, freelancerId } = req.body;
    const user = req.user as User;

    await services.hire.hireFreelancer(clientId, freelancerId);

    // Create notification for freelancer being hired
    try {
      await notificationService.createNotification({
        type: NotificationType.SYSTEM,
        content: `You have been hired by a client!`,
        recipientId: freelancerId,
        senderId: user?.id,
        entityType: 'hire',
        entityId: clientId,
      });
    } catch (error) {
      console.error('Failed to create notification for freelancer hire:', error);
    }

    res.status(201).json({ message: 'Freelancer hired successfully.' });
  } catch (error) {
    next(error);
  }
}

// Fire (terminate) a freelancer for a client
export async function fireFreelancer(req: Request, res: Response, next: NextFunction) {
  try {
    const { clientId, freelancerId, reason } = req.body;
    const user = req.user as User;

    await services.hire.fireFreelancer(clientId, freelancerId, reason);

    // Create notification for freelancer being fired
    try {
      const reasonText = reason ? ` Reason: ${reason}` : '';
      await notificationService.createNotification({
        type: NotificationType.SYSTEM,
        content: `Your contract with a client has been terminated.${reasonText}`,
        recipientId: freelancerId,
        senderId: user?.id,
        entityType: 'hire',
        entityId: clientId,
      });
    } catch (error) {
      console.error('Failed to create notification for freelancer termination:', error);
    }

    res.status(200).json({ message: 'Freelancer fired successfully.' });
  } catch (error) {
    next(error);
  }
}

// List all freelancers hired by a client
export async function getClientsFreelancers(req: Request, res: Response, next: NextFunction) {
  try {
    const clientId = Number(req.params.clientId);
    const freelancers = await services.hire.getMyFreelancers(clientId);
    res.status(200).json(freelancers);
  } catch (error) {
    next(error);
  }
}

// List all freelancers hired by a client
export async function getMyFreelancers(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user as User;
    if (!user || !user.id) {
      return res.status(401).json({ message: 'Authentication required.' });
    }
    const userId = user.id;

    // Assuming a service method to get client by userId
    const client = await services.client.getClientByUserId(userId);

    if (!client) {
      return res.status(404).json({ message: 'Client profile not found for this user.' });
    }

    const clientId = client.id;
    const freelancers = await services.hire.getMyFreelancers(clientId);
    res.status(200).json(freelancers);
  } catch (error) {
    next(error);
  }
}

// List all clients who have hired a freelancer
export async function getMyClients(req: Request, res: Response, next: NextFunction) {
  try {
    const freelancerId = Number(req.params.freelancerId);
    const clients = await services.hire.getMyClients(freelancerId);
    res.status(200).json(clients);
  } catch (error) {
    next(error);
  }
}

// Check if a freelancer is currently hired by a client
export async function isFreelancerHired(req: Request, res: Response, next: NextFunction) {
  try {
    const { clientId, freelancerId } = req.query;
    const hired = await services.hire.isFreelancerHired(Number(clientId), Number(freelancerId));
    res.status(200).json({ hired });
  } catch (error) {
    next(error);
  }
}

// Save a freelancer for future hiring
export async function saveFreelancer(req: Request, res: Response, next: NextFunction) {
  try {
    const { clientId, freelancerId } = req.body;
    const user = req.user as User;

    await services.hire.saveFreelancer(clientId, freelancerId);

    // Create notification for freelancer being saved
    try {
      await notificationService.createNotification({
        type: NotificationType.SYSTEM,
        content: `A client has saved your profile for future hiring opportunities!`,
        recipientId: freelancerId,
        senderId: user?.id,
        entityType: 'hire',
        entityId: clientId,
      });
    } catch (error) {
      console.error('Failed to create notification for freelancer save:', error);
    }

    res.status(200).json({ message: 'Freelancer saved for future hiring.' });
  } catch (error) {
    next(error);
  }
}
