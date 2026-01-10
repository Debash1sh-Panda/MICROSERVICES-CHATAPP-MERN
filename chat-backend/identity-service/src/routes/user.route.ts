import { Router } from "express";
const router = Router();

router.get("/", (req, res) => {
  res.send("User Route Working");
});

export default router;
