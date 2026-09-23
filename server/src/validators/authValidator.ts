import Joi from 'joi'

export const validateRegister = (data: any) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    displayName: Joi.string().min(2).max(100).required(),
  })

  return schema.validate(data)
}

export const validateLogin = (data: any) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  })

  return schema.validate(data)
}
