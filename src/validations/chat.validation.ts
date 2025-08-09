import Joi from 'joi';

const createChatRoom = {
  body: Joi.object().keys({
    name: Joi.string().required().min(3).max(100),
    description: Joi.string().min(10),
    participantIds: Joi.array().items(Joi.number().positive()).min(2).required(),
    projectId: Joi.number().positive(),
    metadata: Joi.object(),
    settings: Joi.object(),
  }),
};

const getChatRoom = {
  params: Joi.object().keys({
    id: Joi.number().required().positive(),
  }),
};

const updateChatRoom = {
  params: Joi.object().keys({
    id: Joi.number().required().positive(),
  }),
  body: Joi.object().keys({
    name: Joi.string().min(3).max(100),
    description: Joi.string().min(10),
    settings: Joi.object(),
    metadata: Joi.object(),
  }),
};

const deleteChatRoom = {
  params: Joi.object().keys({
    id: Joi.number().required().positive(),
  }),
};

const leaveChatRoom = {
  params: Joi.object().keys({
    id: Joi.number().required().positive(),
  }),
};

const archiveChatRoom = {
  params: Joi.object().keys({
    id: Joi.number().required().positive(),
  }),
};

const getArchivedChatRooms = {
  query: Joi.object().keys({
    page: Joi.number().min(1),
    limit: Joi.number().min(1).max(100),
    sortBy: Joi.string(),
    sortOrder: Joi.string().valid('asc', 'desc'),
  }),
};

const unarchiveChatRoom = {
  params: Joi.object().keys({
    id: Joi.number().required().positive(),
  }),
};

const getUserChatRooms = {
  query: Joi.object().keys({
    page: Joi.number().min(1),
    limit: Joi.number().min(1).max(100),
    sortBy: Joi.string(),
    sortOrder: Joi.string().valid('asc', 'desc'),
  }),
};

const searchChatRooms = {
  query: Joi.object().keys({
    query: Joi.string().required().min(1),
    limit: Joi.number().min(1).max(100),
    page: Joi.number().min(1),
  }),
};

const sendMessage = {
  params: Joi.object().keys({
    roomId: Joi.number().required().positive(),
  }),
  body: Joi.object().keys({
    content: Joi.string().when('attachmentUrl', {
      is: Joi.exist(),
      then: Joi.optional().allow(''),
      otherwise: Joi.string().required().min(1),
    }),
    attachmentUrl: Joi.string().uri(),
  }),
};

const editMessage = {
  params: Joi.object().keys({
    messageId: Joi.number().required().positive(),
  }),
  body: Joi.object().keys({
    content: Joi.string().required().min(1),
  }),
};

const deleteMessage = {
  params: Joi.object().keys({
    messageId: Joi.number().required().positive(),
  }),
};

const addMessageReaction = {
  params: Joi.object().keys({
    messageId: Joi.number().required().positive(),
  }),
  body: Joi.object().keys({
    emoji: Joi.string().required(),
  }),
};

const removeMessageReaction = {
  params: Joi.object().keys({
    messageId: Joi.number().required().positive(),
  }),
  body: Joi.object().keys({
    emoji: Joi.string().required(),
  }),
};

const replyToMessage = {
  params: Joi.object().keys({
    messageId: Joi.number().required().positive(),
  }),
  body: Joi.object().keys({
    content: Joi.string().required().min(1),
  }),
};

const forwardMessage = {
  params: Joi.object().keys({
    messageId: Joi.number().required().positive(),
  }),
  body: Joi.object().keys({
    roomIds: Joi.array().items(Joi.number().positive()).min(1).required(),
  }),
};

const getMessageReplies = {
  params: Joi.object().keys({
    messageId: Joi.number().required().positive(),
  }),
};

const getRoomMessages = {
  params: Joi.object().keys({
    roomId: Joi.number().required().positive(),
  }),
  query: Joi.object().keys({
    limit: Joi.number().min(1).max(100).default(50),
    page: Joi.number().min(1).default(1),
    before: Joi.date(),
    after: Joi.date(),
  }),
};

const searchMessages = {
  query: Joi.object().keys({
    query: Joi.string().required().min(1),
    roomId: Joi.number().positive(),
    limit: Joi.number().min(1).max(100),
    page: Joi.number().min(1),
  }),
};

const updateMessageStatus = {
  params: Joi.object().keys({
    messageId: Joi.number().required().positive(),
  }),
  body: Joi.object().keys({
    delivered: Joi.boolean(),
    read: Joi.boolean(),
    deliveredAt: Joi.date(),
    readAt: Joi.date(),
  }),
};

const getMessageStatus = {
  params: Joi.object().keys({
    messageId: Joi.number().required().positive(),
  }),
};

const addParticipants = {
  params: Joi.object().keys({
    roomId: Joi.number().required().positive(),
  }),
  body: Joi.object().keys({
    participantIds: Joi.array().items(Joi.number().positive()).min(1).required(),
  }),
};

const removeParticipant = {
  params: Joi.object().keys({
    roomId: Joi.number().required().positive(),
    participantId: Joi.number().required().positive(),
  }),
};

const addModerator = {
  params: Joi.object().keys({
    id: Joi.number().required().positive(),
  }),
  body: Joi.object().keys({
    userId: Joi.number().required().positive(),
  }),
};

const removeModerator = {
  params: Joi.object().keys({
    id: Joi.number().required().positive(),
    userId: Joi.number().required().positive(),
  }),
};

const muteRoom = {
  params: Joi.object().keys({
    id: Joi.number().required().positive(),
  }),
};

const unmuteRoom = {
  params: Joi.object().keys({
    id: Joi.number().required().positive(),
  }),
};

const updateRoomSettings = {
  params: Joi.object().keys({
    id: Joi.number().required().positive(),
  }),
  body: Joi.object().keys({
    settings: Joi.object().required(),
  }),
};

const uploadAttachment = {
  params: Joi.object().keys({
    roomId: Joi.number().required().positive(),
  }),
};

const getRoomAttachments = {
  params: Joi.object().keys({
    roomId: Joi.number().required().positive(),
  }),
  query: Joi.object().keys({
    limit: Joi.number().min(1).max(100),
    page: Joi.number().min(1),
  }),
};

const deleteAttachment = {
  params: Joi.object().keys({
    roomId: Joi.number().required().positive(),
    messageId: Joi.number().required().positive(),
  }),
};

const reportMessage = {
  params: Joi.object().keys({
    messageId: Joi.number().required().positive(),
  }),
  body: Joi.object().keys({
    reason: Joi.string().required(),
    details: Joi.string(),
  }),
};

const getChatAnalytics = {
  query: Joi.object().keys({
    period: Joi.string().valid('day', 'week', 'month'),
  }),
};

const markMessagesAsRead = {
  params: Joi.object().keys({
    roomId: Joi.number().required().positive(),
  }),
};

const getNotifications = {
  query: Joi.object().keys({
    limit: Joi.number().min(1).max(100),
    page: Joi.number().min(1),
    unreadOnly: Joi.boolean(),
  }),
};

const markNotificationAsRead = {
  params: Joi.object().keys({
    id: Joi.number().required().positive(),
  }),
};

const deleteNotification = {
  params: Joi.object().keys({
    id: Joi.number().required().positive(),
  }),
};

export default {
  createChatRoom,
  getChatRoom,
  updateChatRoom,
  deleteChatRoom,
  leaveChatRoom,
  archiveChatRoom,
  unarchiveChatRoom,
  getArchivedChatRooms,
  getUserChatRooms,
  searchChatRooms,
  sendMessage,
  editMessage,
  deleteMessage,
  addMessageReaction,
  removeMessageReaction,
  replyToMessage,
  forwardMessage,
  getMessageReplies,
  getRoomMessages,
  searchMessages,
  updateMessageStatus,
  getMessageStatus,
  addParticipants,
  removeParticipant,
  addModerator,
  removeModerator,
  muteRoom,
  unmuteRoom,
  updateRoomSettings,
  uploadAttachment,
  getRoomAttachments,
  deleteAttachment,
  reportMessage,
  getChatAnalytics,
  markMessagesAsRead,
  getNotifications,
  markNotificationAsRead,
  deleteNotification,
};
