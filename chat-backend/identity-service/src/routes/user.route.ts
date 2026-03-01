import { Router } from "express";
import {
  allUsers,
  myProfile,
  updateUser,
  userById,
} from "../controllers/user.controller.js";
import { isAuth } from "../middleware/isAuth.middleware.js";
const router = Router();

// "/api/v1/user"

router.get("/me", isAuth, myProfile);
router.get("/all", isAuth, allUsers);
router.get("/:userId", isAuth, userById);
router.put("/update/:userId", isAuth, updateUser);

export default router;
