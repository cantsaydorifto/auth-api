import express, { type Request } from "express";
import jwt from "jsonwebtoken";
import prisma from "../prismaClient";
import z from "zod";
const router = express.Router();
import bcrypt from "bcrypt";

interface User {
  username: string;
  password: string;
  email?: string;
}

function getUserLoginInfoSchema() {
  return z.object({
    username: z
      .string({ required_error: "Username cant be empty" })
      .min(6, "Username should be atleast 6 characters long"),
    password: z
      .string({ required_error: "Password cant be empty" })
      .min(8, "Password must be atleast 8 characters long"),
  });
}

function getUserSingupInfoSchema() {
  return z.object({
    username: z
      .string({ required_error: "Username cant be empty" })
      .min(6, "Username should be atleast 6 characters long"),

    email: z
      .string({ required_error: "Username cant be empty" })
      .email("Not a valid email"),

    password: z
      .string({ required_error: "Password cant be empty" })
      .min(8, "Password must be atleast 8 characters long"),
  });
}

router.post("/login", async (req: Request<{}, {}, User>, res) => {
  console.log(req.body);
  const { username, password } = req.body;
  try {
    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET)
      throw { status: 500, message: "JWT SECRET NOT FOUND" };
    const userInfo = getUserLoginInfoSchema().safeParse(req.body);

    if (!userInfo.success)
      throw { status: 400, message: userInfo.error.issues[0].message };

    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });

    if (!user) throw { status: 401, message: "User Does Not Exist" };

    const compare = await bcrypt.compare(password, user.password);
    if (!compare) throw { status: 401, message: "Incorrect Passoword" };

    const accessToken = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "5min" }
    );

    const refreshToken = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "4d" }
    );
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
      },
    });

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ token: accessToken });
  } catch (err: any) {
    res
      .status(err.status || 400)
      .json({ message: err.message || err || "ERROR" });
  }
});

router.post("/signup", async (req: Request<{}, {}, User>, res) => {
  const { username, password, email } = req.body;
  try {
    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET)
      throw { status: 500, message: "JWT SECRET NOT FOUND" };
    const userInfo = getUserSingupInfoSchema().safeParse(req.body);

    if (!userInfo.success)
      throw { status: 400, message: userInfo.error.issues[0].message };

    const userUsername = await prisma.user.findUnique({
      where: {
        username: userInfo.data.username,
      },
    });
    const userEmail = await prisma.user.findUnique({
      where: {
        email: userInfo.data.email,
      },
    });

    if (userUsername) throw { status: 401, message: "username already in use" };
    if (userEmail) throw { status: 401, message: "email already in use" };

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(password, salt);

    const refreshToken = jwt.sign(
      { username: userInfo.data.username },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "4d" }
    );

    const user = await prisma.user.create({
      data: {
        email: userInfo.data.email,
        password: hash,
        username: userInfo.data.username,
        RefreshToken: {
          create: {
            token: refreshToken,
          },
        },
      },
    });

    const accessToken = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "5min" }
    );

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ token: accessToken });
  } catch (err: any) {
    res
      .status(err.status || 400)
      .json({ message: err.message || err || "ERROR" });
  }
});

export default router;
