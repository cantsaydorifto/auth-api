import { type NextFunction, type Request, type Response } from "express";
import jwt from "jsonwebtoken";

export const verifyJwt = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  console.log("verfiytoken");
  try {
    if (!authHeader) throw { status: 401, message: "Unauthorized" };
    const token = authHeader.split(" ")[1];
    if (!process.env.JWT_SECRET) throw { message: "JWT SECRET NOT FOUND" };
    jwt.verify(token, process.env.JWT_SECRET, (err) => {
      if (err) throw { status: 403, message: "Invalid Token" };
      next();
    });
  } catch (err: any) {
    res.status(err.status || 400).json({ message: err.message });
  }
};

export default verifyJwt;
