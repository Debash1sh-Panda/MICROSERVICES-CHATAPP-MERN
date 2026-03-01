import { Router } from "express";
import { loginUser, verifyOtp } from "../controllers/auth.controller.js";
const router = Router();

router.post("/login", loginUser);
router.post("/verify-otp", verifyOtp);

export default router;
