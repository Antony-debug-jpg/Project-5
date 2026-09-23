import Joi from 'joi'

export const validateUpdateProfile = (data: any) => {
  const schema = Joi.object({
    displayName: Joi.string().min(2).max(100).optional(),
    aboutText: Joi.string().max(500).optional(),
    profilePicture: Joi.string().uri().optional(),
  })

  return schema.validate(data)
}

export const validateUpdatePassword = (data: any) => {
  const schema = Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).required(),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required(),
  })

  return schema.validate(data)
}
