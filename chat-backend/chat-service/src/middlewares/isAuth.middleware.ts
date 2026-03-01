import jwt, { type JwtPayload } from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import TryCatch from "../utils/tryCatchHandler.utils.js";
const JWT_SECRET = process.env.JWT_SECRET!;

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
}

export interface AuthenticationRequest extends Request {
  user?: IUser | null;
}

export const isAuth = TryCatch(
  async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        message: "please login - no auth header",
      });
      return;
    }

    const token = authHeader?.split(" ")[1]!;

    const decode = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (!decode || !decode.user) {
      res.status(401).json({
        message: "Invalid token",
      });
      return;
    }

    req.user = decode.user;

    next();
  },
);
