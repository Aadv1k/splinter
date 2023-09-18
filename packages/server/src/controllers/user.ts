import { Request, Response } from "express";
import Joi from 'joi';
import jwt from 'jsonwebtoken';
import UserModel from "../models/UserModel";
import { JWT_SECRET } from "../config";
import { ServerResponse, ErrorCode } from "../types";

import { v4 as uuidv4 } from "uuid";

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

export async function registerUser(req: Request, res: Response) {
  const data = req.body;

  const { error: schemaError } = userSchema.validate(data);
  if (schemaError) {
    return sendErrorResponse(res, 400, ErrorCode.BadRequest, 'Bad Request', 'Invalid user data. Please check your email and password and try again.');
  }

  try {
    const foundUser = await UserModel.getUserBy("email", data.email);

    if (foundUser) {
      return sendErrorResponse(res, 400, ErrorCode.BadRequest, 'Bad Request', 'User exists, try logging in instead', { email: data.email });
    }

    const user = {
      id: uuidv4(),
      ...data,
    };

    await UserModel.createUser(user);
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

    return sendSuccessResponse(res, 201, { token });
  } catch (error) {
    return sendInternalServerErrorResponse(res, error);
  }
}

export async function loginUser(req: Request, res: Response) {
  const { email, password } = req.body;

  try {
    const user = await UserModel.getUserBy("email", email);

    if (!user) {
      return sendErrorResponse(res, 404, ErrorCode.NotFound, 'Not Found', 'User not found');
    }

    if (user.password !== password) {
      return sendErrorResponse(res, 400, ErrorCode.BadRequest, 'Bad Request', 'Invalid password');
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

    return sendSuccessResponse(res, 200, { token });
  } catch (error) {
    return sendInternalServerErrorResponse(res, error);
  }
}

function sendSuccessResponse(res: Response, httpStatus: number, data: any) {
  const successResponse: ServerResponse = {
    status: "success",
    data,
  };
  res.status(httpStatus).json(successResponse);
}

function sendErrorResponse(res: Response, httpStatus: number, errorCode: ErrorCode, message: string, description: string, details?: any) {
  const errorResponse: ServerResponse = {
    status: "error",
    error: {
      code: errorCode,
      message,
      description
    },
  };
  res.status(httpStatus).json(errorResponse);
}

function sendInternalServerErrorResponse(res: Response, error: any) {
  console.error('Internal Server Error:', error);
  return sendErrorResponse(res, 500, ErrorCode.InternalError, 'Internal Server Error', 'An unexpected error occurred while processing the request.', error.message);
}
