import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET!;

export function generateAccessToken(user: any) {
  return jwt.sign({ user }, JWT_SECRET, { expiresIn: "7d" });
}
