import express from "express";
import postRoutes from "./routes/post";
import logoutRoutes from "./routes/logout";
import userRoutes from "./routes/user";
import refreshTokenRoute from "./routes/refreshToken";
import cookieParser from "cookie-parser";

import dotenv from "dotenv";
import { verifyJwt } from "./middleware/verifyJwt";
dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/user", userRoutes);
app.use("/api/refresh", refreshTokenRoute);
app.use(verifyJwt);
app.use("/api/logout", logoutRoutes);
app.use("/api/post", postRoutes);

app.listen(3000, () => {
  console.log("Listening on port " + process.env.PORT);
});
