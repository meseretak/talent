import Joi from 'joi';
// Added TerminationType and other enums needed for validation
import {
  DesignType,
  FreelancerStatus,
  MarketingType,
  ProgrammingType,
  Role,
  SkillType,
  TerminationType,
  VideoType,
  WritingType,
} from '../generated/prisma';
import { AvailabilityStatus } from '../types/enum';
import { password } from './custom.validation';

const register = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    middleName: Joi.string().optional(),
    role: Joi.string().required().valid(Role.FREELANCER),
    bio: Joi.string().optional(),
    skills: Joi.array().items(Joi.number()),
    categories: Joi.array().items(Joi.number()),
    experience: Joi.string().optional(),
    education: Joi.string().optional(),
    availability: Joi.object().keys({
      status: Joi.string().valid(...Object.values(AvailabilityStatus)),
      availableHoursPerWeek: Joi.number().integer().min(1).max(168),
      notes: Joi.string().allow('', null),
    }),
    headline: Joi.string().optional(),
    workHistory: Joi.array()
      .items(
        Joi.object({
          companyName: Joi.string().required(),
          position: Joi.string().required(),
          startDate: Joi.date().required(),
          endDate: Joi.date().allow(null),
          description: Joi.string().optional(),
        }),
      )
      .optional(),
    certifications: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required(),
          issuingOrganization: Joi.string().required(),
          issueDate: Joi.date().required(),
          expirationDate: Joi.date().allow(null),
          credentialId: Joi.string().optional(),
        }),
      )
      .optional(),
    portfolio: Joi.array()
      .items(
        Joi.object({
          title: Joi.string().required(),
          description: Joi.string().optional(),
          imageURL: Joi.string().optional(),
          projectURL: Joi.string().optional(),
        }),
      )
      .optional(),
    profilePhoto: Joi.string().uri().allow('', null),
    bannerPhoto: Joi.string().uri().allow('', null),
  }),
};

const registerProfile = {
  body: Joi.object().keys({
    headline: Joi.string().required(),
    bio: Joi.string().required(),
    about: Joi.string().allow('', null),
    // Changed items to Joi.string()
    skills: Joi.array().items(Joi.number()),
    categories: Joi.array().items(Joi.number()),
    availability: Joi.object().keys({
      status: Joi.string().valid(...Object.values(AvailabilityStatus)),
      availableHoursPerWeek: Joi.number().integer().min(1).max(168),
      notes: Joi.string().allow('', null),
    }),
    // Added profilePhoto validation
    profilePhoto: Joi.string().uri().allow('', null),
    bannerPhoto: Joi.string().uri().allow('', null),
  }),
};

const updateStatus = {
  params: Joi.object().keys({
    id: Joi.number().integer().required(),
  }),
  body: Joi.object().keys({
    status: Joi.string()
      .valid(...Object.values(FreelancerStatus))
      .required(),
    // Add conditional validation for terminationDetails
    terminationDetails: Joi.when('status', {
      is: FreelancerStatus.TERMINATED,
      then: Joi.object({
        terminatedById: Joi.number().integer().required(),
        terminationReason: Joi.string().allow('', null),
        terminationType: Joi.string()
          .valid(...Object.values(TerminationType))
          .required(),
      }).required(),
      otherwise: Joi.forbidden(), // Disallow terminationDetails if status is not TERMINATED
    }),
  }),
};

const updateProfile = {
  body: Joi.object().keys({
    headline: Joi.string(),
    bio: Joi.string(),
    about: Joi.string().allow('', null),
    // Changed items to Joi.string()
    skills: Joi.array().items(Joi.string()),
    categories: Joi.array().items(Joi.string()),
    availability: Joi.object({
      status: Joi.string().valid(...Object.values(AvailabilityStatus)),
      availableHoursPerWeek: Joi.number().integer().min(1).max(168),
      unavailableUntil: Joi.date().iso().allow(null), // Allow null for clearing
      notes: Joi.string().allow('', null),
    }),
    // Added profilePhoto validation
    profilePhoto: Joi.string().uri().allow('', null),
    bannerPhoto: Joi.string().uri().allow('', null),
    // Note: WorkHistory, Certifications, Portfolio updates handled via separate endpoints
  }),
};

const getFreelancer = {
  params: Joi.object().keys({
    id: Joi.number().integer().required(),
  }),
};

// --- Skill/Category Validations ---

const addSkill = {
  body: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().allow('', null),
    type: Joi.string()
      .valid(...Object.values(SkillType))
      .required(),
    videoType: Joi.string().valid(...Object.values(VideoType)),
    programmingType: Joi.string().valid(...Object.values(ProgrammingType)),
    designType: Joi.string().valid(...Object.values(DesignType)),
    writingType: Joi.string().valid(...Object.values(WritingType)),
    marketingType: Joi.string().valid(...Object.values(MarketingType)),
    // Add more type-specific validations if needed
  }),
};

const addCategory = {
  body: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().allow('', null),
  }),
};

// --- Work History Validations ---

const addWorkHistory = {
  params: Joi.object().keys({
    freelancerId: Joi.number().integer().required(),
  }),
  body: Joi.object({
    companyName: Joi.string().required(),
    position: Joi.string().required(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().allow(null),
    description: Joi.string().allow('', null),
  }),
};

const getWorkHistory = {
  params: Joi.object().keys({
    freelancerId: Joi.number().integer().required(),
  }),
};

const updateWorkHistory = {
  params: Joi.object().keys({
    workHistoryId: Joi.number().integer().required(),
  }),
  body: Joi.object({
    companyName: Joi.string(),
    position: Joi.string(),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().allow(null),
    description: Joi.string().allow('', null),
  }).min(1), // Require at least one field to update
};

const deleteWorkHistory = {
  params: Joi.object().keys({
    workHistoryId: Joi.number().integer().required(),
  }),
};

// --- Portfolio Item Validations ---

const addPortfolioItem = {
  params: Joi.object().keys({
    freelancerId: Joi.number().integer().required(),
  }),
  body: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().allow('', null),
    imageURL: Joi.string().uri().allow('', null),
    projectURL: Joi.string().uri().allow('', null),
  }),
};

const getPortfolioItems = {
  params: Joi.object().keys({
    freelancerId: Joi.number().integer().required(),
  }),
};

const updatePortfolioItem = {
  params: Joi.object().keys({
    portfolioItemId: Joi.number().integer().required(),
  }),
  body: Joi.object({
    title: Joi.string(),
    description: Joi.string().allow('', null),
    imageURL: Joi.string().uri().allow('', null),
    projectURL: Joi.string().uri().allow('', null),
  }).min(1), // Require at least one field to update
};

const deletePortfolioItem = {
  params: Joi.object().keys({
    portfolioItemId: Joi.number().integer().required(),
  }),
};

const searchFreelancers = {
  query: Joi.object().keys({
    skills: Joi.alternatives()
      .try(
        Joi.string()
          .valid(...Object.values(SkillType))
          .allow('', null),
        Joi.array()
          .items(Joi.string().valid(...Object.values(SkillType)))
          .allow(null),
      )
      .allow(null),
    categories: Joi.alternatives()
      .try(
        Joi.number().integer().allow(null),
        Joi.array().items(Joi.number().integer()).allow(null),
      )
      .allow(null),
    status: Joi.string()
      .valid(...Object.values(FreelancerStatus))
      .allow('', null),
    minRate: Joi.number().integer().min(0).allow(null),
    maxRate: Joi.number().integer().min(0).allow(null),
    availability: Joi.string().allow('', null),
    minHoursPerWeek: Joi.number().integer().min(1).allow(null),
    maxHoursPerWeek: Joi.number().integer().max(168).allow(null),
    keyword: Joi.string().allow('', null),
    name: Joi.string().allow('', null),
    sortBy: Joi.string().allow('', null),
    sortOrder: Joi.string().valid('asc', 'desc').allow('', null),
    limit: Joi.number().integer().min(1).allow(null),
    offset: Joi.number().integer().min(0).allow(null),
  }),
};

const getFeaturedFreelancers = {
  query: Joi.object().keys({
    page: Joi.number().integer().min(1).optional(),
    size: Joi.number().integer().min(1).max(100).optional(),
  }),
};

const toggleFeaturedStatus = {
  params: Joi.object().keys({
    freelancerId: Joi.number().integer().required(),
  }),
  body: Joi.object().keys({
    featured: Joi.boolean().required(),
  }),
};

const addTeamMembers = {
  params: Joi.object().keys({
    id: Joi.number().integer().required(),
  }),
  body: Joi.object().keys({
    freelancerIds: Joi.array().items(Joi.number().integer()).min(1).required(),
  }),
};

const deleteFreelancer = {
  params: Joi.object().keys({
    freelancerId: Joi.number().integer().required(),
  }),
};

export default {
  register,
  registerProfile,
  updateStatus,
  updateProfile,
  getFreelancer,
  searchFreelancers,
  // Added exports
  addSkill,
  addCategory,
  addWorkHistory,
  getWorkHistory,
  updateWorkHistory,
  deleteWorkHistory,
  addPortfolioItem,
  getPortfolioItems,
  updatePortfolioItem,
  deletePortfolioItem,
  getFeaturedFreelancers,
  toggleFeaturedStatus,
  addTeamMembers,
  deleteFreelancer,
};
