import express, { type Request, type Response } from "express";
import prisma from "../prismaClient";
const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
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
    if (!userRefreshToken) {
      res.clearCookie("jwt", { httpOnly: true, secure: true });
      return res.sendStatus(204);
    }
    await prisma.refreshToken.delete({
      where: {
        token: refreshToken,
      },
    });
    res.clearCookie("jwt", { httpOnly: true, secure: true });
    res.sendStatus(204);
  } catch (err: any) {
    res
      .status(err.status || 400)
      .json({ message: err.message || err || "ERROR" });
  }
});

export default router;
