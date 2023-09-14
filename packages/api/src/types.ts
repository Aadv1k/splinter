export enum ErrorCode {
  InternalError = "Internal_Error",
  BadRequest = "Bad_Request",
  NotFound = "Not_Found",
  Unauthorized = "Unauthorized"
}


export interface User {
    id?: string;
    email: string;
    password: string;
}

interface UserVote {
  user_id: string;
  article_id: string;
  vote: 'left' | 'right';
}

export interface ErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
    description: string;
    details?: any;
  };
  http_status: number;
}

export interface SuccessResponse<T = any> {
  data: T;
  meta: any;
  http_status: number;
}
