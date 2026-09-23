import Joi from 'joi'

export const validateAddContact = Joi.object({
  email: Joi.string().email().required(),
})

export const validateUpdateContact = Joi.object({
  nickname: Joi.string().min(1).max(100).optional(),
  isFavorite: Joi.boolean().optional(),
}).min(1)

export const validateSearchUsers = Joi.object({
  query: Joi.string().min(2).max(100).required(),
})

export const validateSendMessage = Joi.object({
  content: Joi.string().min(1).max(5000).required().trim(),
})

export const validateMarkAsRead = Joi.object({
  // Body can be empty
})
