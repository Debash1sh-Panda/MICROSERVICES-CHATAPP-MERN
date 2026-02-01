import transporter from "../config/nodemailer.config.js";
import TryCatchConsumer from "./TryCatchConsumer.utils.js";

const handleSendOtpEmail = TryCatchConsumer(async (message: any) => {
  const { to, subject, body } = message;
  await transporter.sendMail({
    from: "Chart Microservice App",
    to,
    subject,
    text: body,
  });
});

export default handleSendOtpEmail;
