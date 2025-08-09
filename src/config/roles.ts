import { Role } from '../generated/prisma';

const allRoles = {
  [Role.SUPER_ADMIN]: ['getUsers', 'manageUsers', 'createUser', 'notification'],
  [Role.ADMIN]: [
    'getUsers',
    'manageUsers',
    'createUser',
    'manageSkills',
    'manageCategories',
    'manageFreelancers',
    'freelancerData',
    'projectRequest',
    'tasks',
    'documents',
    'manageLibrary',
    'project',
    'chat',
    'notification',
  ],
  [Role.PROJECT_MANAGER]: [
    'getUsers',
    'manageUsers',
    'createUser',
    'tasks',
    'manageTasks',
    'documents',
    'project',
    'chat',
    'notification',
  ],
  [Role.FREELANCER]: [
    'getUsers',
    'manageUsers',
    'createUser',
    'freelancerData',
    'tasks',
    'documents',
    'manageLibrary',
    'project',
    'notification',
  ],
  [Role.CLIENT]: [
    'getUsers',
    'manageUsers',
    'createUser',
    'projectRequest',
    'documents',
    'project',
    'chat',
    'notification',
  ],
  [Role.SUPPORT]: ['getUsers', 'manageUsers', 'createUser', 'notification'],
  [Role.INVESTOR]: ['getUsers', 'manageUsers', 'createUser', 'notification'],
};

export const roles = Object.keys(allRoles);
export const roleRights = new Map(Object.entries(allRoles));
