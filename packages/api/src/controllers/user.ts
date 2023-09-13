import { Request, Response } from "express";
import { ErrorCode, ErrorResponse, SuccessResponse, User } from "../types";
import UserModel from "../models/UserModel";
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';

const userSchema = Joi.object<User>({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

function validateUserSchema(user: User) {
  return userSchema.validate(user);
}

export async function registerUser(req: Request, res: Response) {
  const data = req.body;

  const { error: schemaError } = validateUserSchema(data);

  if (schemaError) {
    const errorResponse: ErrorResponse = {
      error: {
        code: ErrorCode.BadRequest,
        message: 'Bad Request',
        description: 'Unable to register user due to bad request',
        details: { ...schemaError },
      },
      http_status: 400,
    };
    return res.status(400).json(errorResponse);
  }

  try {
    const foundUser = await UserModel.getUserByEmail(data.email);

    if (foundUser) {
      const errorResponse: ErrorResponse = {
        error: {
          code: ErrorCode.BadRequest,
          message: 'Bad Request',
          description: 'User exists, try logging in instead',
          details: data,
        },
        http_status: 400,
      };
      return res.status(400).json(errorResponse);
    }

    const userApiKey = uuidv4().replace(/-/g, '');
    const user = {
      key: userApiKey,
      ...data,
    } as User;

    await UserModel.createUser(user);
    const successResponse: SuccessResponse = {
      data: {
        key: userApiKey,
      },
      meta: null,
      http_status: 201,
    };
    res.status(201).json(successResponse);
  } catch (error: any) {
    console.error('ERROR: /v1/users/register:', error);
    const errorResponse: ErrorResponse = {
      error: {
        code: ErrorCode.InternalError,
        message: 'Internal Server Error',
        description: 'An unexpected error occurred while processing the request.',
        details: error.message,
      },
      http_status: 500,
    };
    res.status(500).json(errorResponse);
  }
}

export async function loginUser(req: Request, res: Response) {
  const { email, password } = req.body;

  try {
    const user = await UserModel.getUserByEmail(email);

    if (!user) {
      const errorResponse: ErrorResponse = {
        error: {
          code: ErrorCode.NotFound,
          message: 'Not Found',
          description: 'User not found',
          details: null,
        },
        http_status: 404,
      };
      return res.status(404).json(errorResponse);
    }

    if (user.password !== password) {
      const errorResponse: ErrorResponse = {
        error: {
          code: ErrorCode.BadRequest,
          message: 'Bad Request',
          description: 'Invalid password',
          details: null,
        },
        http_status: 400,
      };
      return res.status(400).json(errorResponse);
    }

    const successResponse: SuccessResponse = {
      data: {
        key: user.key,
      },
      meta: null,
      http_status: 200,
    };
    res.status(200).json(successResponse);
  } catch (error: any) {
    console.error('ERROR: /v1/users/login:', error);
    const errorResponse: ErrorResponse = {
      error: {
        code: ErrorCode.InternalError,
        message: 'Internal Server Error',
        description: 'An unexpected error occurred while processing the request.',
        details: error.message,
      },
      http_status: 500,
    };
    res.status(500).json(errorResponse);
  }
}
