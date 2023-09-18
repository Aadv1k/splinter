export enum ErrorCode {
  InternalError = "Internal_Error",
  BadRequest = "Bad_Request",
  NotFound = "Not_Found",
  Unauthorized = "Unauthorized",
  MethodNotAllowed = "Method_Not_Allowed"
}

export interface User {
    id?: string;
    email: string;
    password: string;
}

export interface UserVote {
  user_id: string;
  article_id: string;
  vote: 'left' | 'right';
}

export interface ServerResponse {
    status: "error" | "success";
    error?: {
        code: ErrorCode;
        message: string;
        description: string;
    };
    data?: any;
    message?: string;
}

export interface News {
    title: string;
    description: string;
    countryCode: string;
    timestamp: string;
    coverUrl?: string;
    url: string;
}

export interface NewsBias {
    left_bias: number;
    right_bias: number;
}

export interface NewsArticle {
    id: string;
}
