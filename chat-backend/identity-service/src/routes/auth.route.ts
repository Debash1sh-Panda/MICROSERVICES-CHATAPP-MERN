import { Router } from "express";
import { loginUser, myProfile, verifyOtp } from "../controllers/auth.controller.js";
import { isAuth } from "../middleware/isAuth.middleware.js";
const router = Router();

router.post("/login", loginUser);
router.post("/verify-otp", verifyOtp);
router.get("/me", isAuth, myProfile);

export default router;
