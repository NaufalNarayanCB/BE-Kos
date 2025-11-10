import { NextFunction, Request, Response } from "express";
import Joi from "joi";

const authSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().min(5).alphanum().required()
});

const addDataSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  password: Joi.string().min(5).alphanum().required(),
  phone: Joi.string().min(10).max(12).required(),
  role: Joi.string().valid('SOCIETY', 'OWNER').uppercase().required()
}).unknown(true)

const editDataSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().optional(),
  password: Joi.string().min(5).alphanum().optional(),
  role: Joi.string().valid('SOCIETY', 'OWNER').uppercase().optional(),
  user: Joi.optional()
}).unknown(true)

export const verifAuth = (req: Request, res: Response, next: NextFunction) => {
  const { error } = authSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      status: false,
      message: error.details.map(it => it.message).join(", ")
    });
  }
  next();
};

export const verifCreateUser = (req: Request, res: Response, next: NextFunction) => {
  const { error } = addDataSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      status: false,
      message: error.details.map(it => it.message).join(", ")
    });
  }
  next();
};

export const verifEditUser = (req: Request, res: Response, next: NextFunction) => {
  const { error } = editDataSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      status: false,
      message: error.details.map(it => it.message).join(", ")
    });
  }
  next();
};