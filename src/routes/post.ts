import express, { type Request, type Response } from "express";
const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  console.log(req.url);
  res.json({ message: "Apples are great!!" });
});

export default router;
