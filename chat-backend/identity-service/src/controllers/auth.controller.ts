import crypto from "crypto";
import { publishEvent } from "../config/rabbitmq.config.js";
import TryCatch from "../utils/tryCatchHandler.utils.js";

export const loginUser = TryCatch(async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes("@")) {
    return res.status(400).json({ message: "Invalid email address" });
  }

  const otpLimitKey = `otp:ratelimit:${email}:${req.ip}`;
  const isRateLimited = await req.redisClient.get(otpLimitKey);

  if (isRateLimited) {
    return res.status(429).json({
      message: "Too many requests. Please wait before requesting a new OTP",
    });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

  await req.redisClient.setex(`otp:${email}`, 300, hashedOtp);
  await req.redisClient.setex(otpLimitKey, 60, "true");

  await publishEvent("email:otp:send", {
    to: email,
    subject: "Your OTP Code",
    body: `Your One-Time Password is ${otp}. It is valid for 5 minutes.`,
  });

  const [name, domain] = email.split("@");
  const maskedEmail = `${name.slice(0, 3)}***@${domain}`;

  res.status(200).json({
    message: `OTP sent to your email ${maskedEmail}`,
  });
});

export const verifyOtp = TryCatch(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  const attemptsKey = `otp:attempts:${email}`;
  const attempts = await req.redisClient.get(attemptsKey);

  if (attempts && Number(attempts) >= 5) {
    return res.status(429).json({
      message: "Too many wrong attempts. Please request a new OTP",
    });
  }

  const storedHashedOtp = await req.redisClient.get(`otp:${email}`);

  if (!storedHashedOtp) {
    return res.status(400).json({ message: "OTP expired or invalid" });
  }

  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

  if (hashedOtp !== storedHashedOtp) {
    await req.redisClient
      .multi()
      .incr(attemptsKey)
      .expire(attemptsKey, 300)
      .exec();

    return res.status(400).json({ message: "Invalid OTP" });
  }

  await req.redisClient.del(`otp:${email}`);
  await req.redisClient.del(attemptsKey);

  res.status(200).json({ message: "OTP verified successfully" });
});
