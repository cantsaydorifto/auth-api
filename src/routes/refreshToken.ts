import express, { type Request, type Response } from "express";
import prisma from "../prismaClient";
import jwt from "jsonwebtoken";
const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  const cookie = req.cookies;
  try {
    if (!cookie.jwt) throw { status: 401, message: "Unauthorized" };
    const refreshToken = cookie.jwt as string;
    const userRefreshToken = await prisma.refreshToken.findUnique({
      where: {
        token: refreshToken,
      },
      include: {
        User: {
          select: {
            username: true,
            email: true,
            id: true,
          },
        },
      },
    });
    if (!userRefreshToken) throw { status: 403, message: "Forbidden" };

    if (!process.env.JWT_REFRESH_SECRET)
      throw { status: 400, message: "JWT SECRET NOT FOUND" };

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err) => {
      if (err) throw { status: 403, message: err.message };
      if (!process.env.JWT_SECRET)
        throw { status: 400, message: "JWT SECRET NOT FOUND" };
      const accessToken = jwt.sign(
        { ...userRefreshToken.User },
        process.env.JWT_SECRET,
        { expiresIn: "5min" }
      );
      res.status(200).json({ token: accessToken });
    });
  } catch (err: any) {
    res
      .status(err.status || 400)
      .json({ message: err.message || err || "ERROR" });
  }
});

export default router;
