import type { AuthenticationRequest } from "../middleware/isAuth.middleware.js";
import { User } from "../model/user.model.js";
import TryCatch from "../utils/tryCatchHandler.utils.js";

export const myProfile = TryCatch(async (req: AuthenticationRequest, res) => {
  const user = req.user;
  if (!user) {
    return res.status(400).json({
      success: false,
      message: "user not found",
    });
  }
  res
    .status(200)
    .json({ success: true, message: "profile fetched", data: user });
});

export const allUsers = TryCatch(async (req, res) => {
  const user = await User.find({});

  if (!user || user.length === 0) {
    return res.status(400).json({
      success: false,
      message: "user not found",
    });
  }

  res
    .status(200)
    .json({ success: true, message: "all user data fetched", data: user });
});

export const userById = TryCatch(async (req, res) => {
  if (!req.params.userId) {
    return res.status(400).json({
      success: false,
      message: "userId is required",
    });
  }
  const user = await User.findById(req.params.userId);

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "user not found",
    });
  }

  res
    .status(200)
    .json({ success: true, message: "user data fetched", data: user });
});

export const updateUser = TryCatch(async (req, res) => {
  if (!req.body.name || req.body.name == undefined) {
    return res.status(400).json({
      success: false,
      message: "name is required",
    });
  }

  let user = await User.findById(req.params.userId);
  if (!user) {
    return res.status(400).json({
      success: false,
      message: "user not found",
    });
  }

  user.name = req.body.name;
  user.save();

  res
    .status(200)
    .json({ success: true, message: "user data fetched", data: user });
});
