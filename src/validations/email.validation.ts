import Joi from 'joi';

const sendVerification = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    token: Joi.string().required(),
  }),
};

const sendResetPassword = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    token: Joi.string().required(),
  }),
};

const sendWelcome = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    name: Joi.string().required(),
  }),
};

const sendProjectAssignment = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    projectName: Joi.string().required(),
    role: Joi.string().required(),
  }),
};

const sendMeetingInvitation = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    meetingDetails: Joi.object({
      title: Joi.string().required(),
      date: Joi.date().required(),
      link: Joi.string().required().uri(),
    }).required(),
  }),
};

const sendScheduleConfirmation = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    scheduleDetails: Joi.object({
      firstName: Joi.string().required(),
      scheduledDate: Joi.date().required(),
      meetingType: Joi.string().required(),
      meetingLink: Joi.string().uri().optional(),
    }).required(),
  }),
};

export default {
  sendVerification,
  sendResetPassword,
  sendWelcome,
  sendProjectAssignment,
  sendMeetingInvitation,
  sendScheduleConfirmation,
};