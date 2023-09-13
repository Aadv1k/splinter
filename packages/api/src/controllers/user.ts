import { Request, Response } from "express";
import { ErrorCode, ErrorResponse, SuccessResponse, User } from "../types";
import UserModel from "../models/UserModel";

function isUserSchemaValid(user: User): { valid: boolean, error?: any }{
  const userSchema = Joi.object<User>({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  });

  const { error } = userSchema.validate(user);
  return { valid: !error, error };
}


export async function registerUser(req: Request, res: Response) {
  const data = req.body as User;
  const { valid, error as schemaError } = isUserSchemaValid(data);

  if (!valid) {
      const errorResponse: ErrorResponse = {
        error: {
          code: ErrorCode.BadRequest,
          message: 'Bad Request',
          description: 'Unable to register user due to bad request',
          details: { ...schemaError },
        },
        http_status: 400,
      };
      res.status(400).json(errorResponse);
      return;
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
          res.status(400).json(errorResponse);
          return; 
      }

      await UserModel.createUser(...data);
   }  catch (error: any) {
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
